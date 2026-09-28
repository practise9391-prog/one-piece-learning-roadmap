import { AppState, AppStateStatus, Vibration } from 'react-native';
import { StudySession, ActiveFocusState } from '../models/Focus';
import { studySessionRepository } from '../repositories/StudySessionRepository';
import { activityRepository } from '../repositories/ActivityRepository';
import { motivationRepository } from '../repositories/MotivationRepository';
import { notificationService } from './NotificationService';

type FocusStateListener = (state: ActiveFocusState) => void;

export class FocusTimerService {
  private static instance: FocusTimerService;
  private activeSession: StudySession | null = null;
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<FocusStateListener> = new Set();
  private appStateSubscription: any = null;

  private constructor() {
    this.initAppStateListener();
  }

  static getInstance(): FocusTimerService {
    if (!FocusTimerService.instance) {
      FocusTimerService.instance = new FocusTimerService();
    }
    return FocusTimerService.instance;
  }

  /**
   * Initializes AppState listener to recalculate elapsed time when app returns to foreground.
   */
  private initAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        this.syncWithDatabase();
      }
    });
  }

  /**
   * Synchronizes in-memory state with SQLite on startup or foreground resume.
   */
  async syncWithDatabase(): Promise<ActiveFocusState> {
    try {
      const active = await studySessionRepository.getActiveStudySession();
      if (!active) {
        this.stopTicker();
        this.activeSession = null;
        this.notifyListeners();
        return this.getState();
      }

      this.activeSession = active;
      const { remaining } = this.calculateTimes(active);

      if (remaining <= 0 && active.status === 'RUNNING') {
        // Time expired while app was backgrounded or inactive! Auto-complete it now.
        await this.completeSession();
      } else if (active.status === 'RUNNING') {
        this.startTicker();
      } else {
        this.stopTicker();
      }

      this.notifyListeners();
      return this.getState();
    } catch (err) {
      console.warn('[FocusTimerService] syncWithDatabase error:', err);
      return this.getState();
    }
  }

  /**
   * Starts a new study session.
   */
  async startSession(params: {
    courseId: string;
    moduleId?: string | null;
    topicId?: string | null;
    plannedDurationSeconds: number;
  }): Promise<StudySession> {
    const session = await studySessionRepository.startStudySession(params);
    this.activeSession = session;
    this.startTicker();
    this.notifyListeners();
    return session;
  }

  /**
   * Pauses the active study session.
   */
  async pauseSession(): Promise<StudySession | null> {
    if (!this.activeSession) return null;
    const paused = await studySessionRepository.pauseStudySession(this.activeSession.id);
    this.activeSession = paused;
    this.stopTicker();
    this.notifyListeners();
    return paused;
  }

  /**
   * Resumes a paused study session.
   */
  async resumeSession(): Promise<StudySession | null> {
    if (!this.activeSession) return null;
    const resumed = await studySessionRepository.resumeStudySession(this.activeSession.id);
    this.activeSession = resumed;
    this.startTicker();
    this.notifyListeners();
    return resumed;
  }

  /**
   * Ends and saves the session early or on demand with actual elapsed duration.
   */
  async endAndSaveSession(actualDurationSeconds?: number): Promise<StudySession | null> {
    if (!this.activeSession) return null;
    const session = this.activeSession;
    this.stopTicker();

    const { elapsed } = this.calculateTimes(session);
    const duration = actualDurationSeconds !== undefined ? actualDurationSeconds : elapsed;

    const completed = await studySessionRepository.completeStudySession(session.id, duration);
    this.activeSession = null;

    // Trigger integrations
    await this.handlePostCompletion(completed);

    this.notifyListeners();
    return completed;
  }

  /**
   * Called when timer naturally completes (reaches 0).
   */
  async completeSession(): Promise<StudySession | null> {
    if (!this.activeSession) return null;
    const session = this.activeSession;
    this.stopTicker();

    const completed = await studySessionRepository.completeStudySession(
      session.id,
      session.planned_duration_seconds
    );
    this.activeSession = null;

    // Trigger integrations
    await this.handlePostCompletion(completed);

    this.notifyListeners();
    return completed;
  }

  /**
   * Discards/cancels the active study session. Does not count in study stats.
   */
  async discardSession(): Promise<void> {
    if (!this.activeSession) return;
    const sessionId = this.activeSession.id;
    this.stopTicker();
    this.activeSession = null;

    await studySessionRepository.cancelStudySession(sessionId);
    this.notifyListeners();
  }

  /**
   * Post-completion actions:
   * 1. Record LearningActivity (if duration >= min qualifying seconds)
   * 2. Sync daily goals (marks STUDY_SESSION goal complete)
   * 3. Sync achievements
   * 4. Trigger vibration & sound
   * 5. Send local notification
   */
  private async handlePostCompletion(session: StudySession): Promise<void> {
    try {
      const settings = await studySessionRepository.getFocusSettings();

      // 1. Record activity if qualifying
      if (session.duration_seconds >= settings.min_qualifying_seconds) {
        await activityRepository.recordActivity({
          courseId: session.course_id,
          moduleId: session.module_id || null,
          topicId: session.topic_id || null,
          activityType: 'STUDY_SESSION_COMPLETED',
        });
      }

      // 2. Sync today's goals
      await motivationRepository.syncTodayGoals();

      // 3. Sync achievements
      await motivationRepository.syncAchievements();

      // 4. Vibration
      if (settings.vibration_enabled) {
        try {
          Vibration.vibrate([0, 300, 150, 300]);
        } catch {
          // Ignore vibration error on unsupported platforms
        }
      }

      // 5. Local completion notification
      const studyMins = Math.max(1, Math.round(session.duration_seconds / 60));
      const courseName = session.course_name || 'Study Course';
      await notificationService.sendFocusCompletionNotification(courseName, studyMins);
    } catch (err) {
      console.warn('[FocusTimerService] handlePostCompletion error:', err);
    }
  }

  private startTicker(): void {
    this.stopTicker();
    this.timerInterval = setInterval(async () => {
      if (!this.activeSession || this.activeSession.status !== 'RUNNING') {
        this.stopTicker();
        return;
      }

      const { remaining } = this.calculateTimes(this.activeSession);
      if (remaining <= 0) {
        await this.completeSession();
      } else {
        this.notifyListeners();
      }
    }, 1000);
  }

  private stopTicker(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * Computes elapsed and remaining times from timestamps rather than pure counters.
   */
  calculateTimes(session: StudySession): { elapsed: number; remaining: number; progress: number } {
    const startMs = new Date(session.started_at).getTime();
    const plannedSec = session.planned_duration_seconds;

    let elapsed = 0;
    if (session.status === 'PAUSED' && session.paused_at) {
      const pauseMs = new Date(session.paused_at).getTime();
      elapsed = Math.max(0, Math.floor((pauseMs - startMs) / 1000) - session.total_paused_seconds);
    } else {
      const nowMs = Date.now();
      elapsed = Math.max(0, Math.floor((nowMs - startMs) / 1000) - session.total_paused_seconds);
    }

    const remaining = Math.max(0, plannedSec - elapsed);
    const progress = plannedSec > 0 ? Math.min(1, elapsed / plannedSec) : 0;

    return { elapsed, remaining, progress };
  }

  /**
   * Returns current active state snapshot.
   */
  getState(): ActiveFocusState {
    if (!this.activeSession) {
      return {
        session: null,
        remainingSeconds: 0,
        elapsedSeconds: 0,
        progress: 0,
        isRunning: false,
        isPaused: false,
      };
    }

    const { elapsed, remaining, progress } = this.calculateTimes(this.activeSession);
    return {
      session: this.activeSession,
      remainingSeconds: remaining,
      elapsedSeconds: elapsed,
      progress,
      isRunning: this.activeSession.status === 'RUNNING',
      isPaused: this.activeSession.status === 'PAUSED',
    };
  }

  /**
   * Subscribes to focus timer state changes.
   */
  subscribe(listener: FocusStateListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.warn('[FocusTimerService] Listener error:', err);
      }
    });
  }

  /**
   * Cancels active timer during full data wipe.
   */
  cancelActiveSession(): void {
    this.stopTicker();
    this.activeSession = null;
    this.notifyListeners();
  }
}

export const focusTimerService = FocusTimerService.getInstance();
