import { gamificationRepository, GamificationRepository } from '../repositories/GamificationRepository';
import {
  RewardResult,
  UserGamificationProfile,
  Badge,
  BadgeCategory,
  GamificationAchievement,
  XpTransaction,
  PointsTransaction,
  GamificationSettings,
  RewardEventType,
} from '../models/Gamification';
import { GamificationConfig } from '../constants/gamification';

type RewardListener = (result: RewardResult) => void;

export class GamificationService {
  private static instance: GamificationService | null = null;
  private repository: GamificationRepository = gamificationRepository;
  private listeners: Set<RewardListener> = new Set();

  public static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  // =========================================================================
  // LISTENER SUBSCRIPTION (For Toast & Celebration Modals)
  // =========================================================================

  subscribe(listener: RewardListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(result: RewardResult) {
    if (!result.awarded) return;
    this.listeners.forEach((listener) => {
      try {
        listener(result);
      } catch (err) {
        console.warn('Error in reward listener:', err);
      }
    });
  }

  // =========================================================================
  // DOMAIN EVENT HOOKS (Section 5, 23-31)
  // =========================================================================

  /**
   * Topic completion reward (+10 XP, +5 Points).
   * Unchecking and checking again will NOT award duplicate XP.
   */
  async onTopicCompleted(
    topicId: string,
    courseId?: string,
    moduleId?: string,
    isDifficult = false,
    topicTitle?: string
  ): Promise<RewardResult> {
    const xp = isDifficult ? GamificationConfig.difficultTopicXp : GamificationConfig.topicXp;
    const points = isDifficult ? GamificationConfig.difficultTopicPoints : GamificationConfig.topicPoints;

    const result = await this.repository.awardReward({
      event_type: 'TOPIC_COMPLETED',
      source_id: topicId,
      course_id: courseId,
      module_id: moduleId,
      topic_id: topicId,
      custom_xp: xp,
      custom_points: points,
      description: topicTitle ? `Completed: ${topicTitle}` : undefined,
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Module completion reward (+50 XP, +20 Points).
   */
  async onModuleCompleted(
    moduleId: string,
    courseId?: string,
    moduleTitle?: string
  ): Promise<RewardResult> {
    const result = await this.repository.awardReward({
      event_type: 'MODULE_COMPLETED',
      source_id: moduleId,
      course_id: courseId,
      module_id: moduleId,
      custom_xp: GamificationConfig.moduleXp,
      custom_points: GamificationConfig.modulePoints,
      description: moduleTitle ? `Conquered Module: ${moduleTitle}` : undefined,
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Course completion reward (+250 XP, +100 Points, + Course Finisher badge).
   */
  async onCourseCompleted(courseId: string, courseName?: string): Promise<RewardResult> {
    const result = await this.repository.awardReward({
      event_type: 'COURSE_COMPLETED',
      source_id: courseId,
      course_id: courseId,
      custom_xp: GamificationConfig.courseXp,
      custom_points: GamificationConfig.coursePoints,
      description: courseName ? `Mastered Course: ${courseName}` : undefined,
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Focus study session completed (+20 XP, +10 Points).
   */
  async onStudySessionCompleted(session: {
    id: string;
    courseId?: string | null;
    moduleId?: string | null;
    durationMinutes: number;
  }): Promise<RewardResult> {
    // Only qualifying study sessions (min 15 mins) earn session XP
    if (session.durationMinutes < 15) {
      return {
        awarded: false,
        reason: 'INVALID_EVENT',
        event_type: 'STUDY_SESSION_COMPLETED',
        source_id: session.id,
        xpAwarded: 0,
        pointsAwarded: 0,
        levelUpOccurred: false,
        unlockedBadges: [],
        unlockedAchievements: [],
        description: 'Session under qualifying duration threshold (15m)',
      };
    }

    const result = await this.repository.awardReward({
      event_type: 'STUDY_SESSION_COMPLETED',
      source_id: session.id,
      course_id: session.courseId,
      module_id: session.moduleId,
      custom_xp: GamificationConfig.studySessionXp,
      custom_points: GamificationConfig.studySessionPoints,
      description: `Completed ${session.durationMinutes}m focus study session`,
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Daily Goal completion reward (+25 XP, +10 Points).
   */
  async onDailyGoalCompleted(goalId: string, title?: string): Promise<RewardResult> {
    const result = await this.repository.awardReward({
      event_type: 'DAILY_GOAL_COMPLETED',
      source_id: goalId,
      custom_xp: GamificationConfig.dailyGoalXp,
      custom_points: GamificationConfig.dailyGoalPoints,
      description: title ? `Daily Victory: ${title}` : undefined,
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Weekly Goal completion reward (+75 XP, +30 Points).
   */
  async onWeeklyGoalCompleted(goalId: string, title?: string): Promise<RewardResult> {
    const result = await this.repository.awardReward({
      event_type: 'WEEKLY_GOAL_COMPLETED',
      source_id: goalId,
      custom_xp: GamificationConfig.weeklyGoalXp,
      custom_points: GamificationConfig.weeklyGoalPoints,
      description: title ? `Weekly Victory: ${title}` : undefined,
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Monthly Goal completion reward (+200 XP, +100 Points).
   */
  async onMonthlyGoalCompleted(goalId: string, title?: string): Promise<RewardResult> {
    const result = await this.repository.awardReward({
      event_type: 'MONTHLY_GOAL_COMPLETED',
      source_id: goalId,
      custom_xp: GamificationConfig.monthlyGoalXp,
      custom_points: GamificationConfig.monthlyGoalPoints,
      description: title ? `Monthly Milestone: ${title}` : undefined,
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Correct practice answer (+2 XP, +1 Point).
   */
  async onPracticeCorrect(questionId: string, courseId?: string): Promise<RewardResult> {
    // Unique source ID with timestamp prevents farming identical questions infinitely
    const sourceId = `${questionId}_${new Date().toISOString().split('T')[0]}`;

    const result = await this.repository.awardReward({
      event_type: 'PRACTICE_CORRECT',
      source_id: sourceId,
      course_id: courseId,
      custom_xp: GamificationConfig.practiceCorrectXp,
      custom_points: GamificationConfig.practiceCorrectPoints,
      description: 'Correct practice question',
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Practice set completion (+20 XP, +10 Points).
   */
  async onPracticeSetCompleted(setId: string, questionsCount: number): Promise<RewardResult> {
    const result = await this.repository.awardReward({
      event_type: 'PRACTICE_SET_COMPLETED',
      source_id: setId,
      custom_xp: GamificationConfig.practiceSetXp,
      custom_points: GamificationConfig.practiceSetPoints,
      description: `Completed practice challenge (${questionsCount} questions)`,
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Speaking session (+15 XP, +5 Points).
   */
  async onSpeakingSessionCompleted(sessionId: string, topicId?: string): Promise<RewardResult> {
    const result = await this.repository.awardReward({
      event_type: 'SPEAKING_SESSION_COMPLETED',
      source_id: sessionId,
      topic_id: topicId,
      custom_xp: GamificationConfig.speakingSessionXp,
      custom_points: GamificationConfig.speakingSessionPoints,
      description: 'Completed English speaking scenario',
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Speaking topic completion (+20 XP, +10 Points).
   */
  async onSpeakingTopicCompleted(topicId: string, title?: string): Promise<RewardResult> {
    const result = await this.repository.awardReward({
      event_type: 'SPEAKING_TOPIC_COMPLETED',
      source_id: topicId,
      topic_id: topicId,
      custom_xp: GamificationConfig.speakingTopicXp,
      custom_points: GamificationConfig.speakingTopicPoints,
      description: title ? `Mastered conversation: ${title}` : undefined,
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Evaluates streak milestones (3, 7, 14, 30, 60, 100, 365 days).
   * Only awards milestone once per user.
   */
  async onStreakEvaluated(streakDays: number): Promise<RewardResult[]> {
    const results: RewardResult[] = [];
    const milestones = Object.keys(GamificationConfig.streakMilestones)
      .map(Number)
      .sort((a, b) => a - b);

    for (const milestone of milestones) {
      if (streakDays >= milestone) {
        const rewardInfo = GamificationConfig.streakMilestones[milestone];
        const res = await this.repository.awardReward({
          event_type: 'STREAK_MILESTONE',
          source_id: `streak_${milestone}`,
          custom_xp: rewardInfo.xp,
          custom_points: rewardInfo.points,
          description: `🔥 ${milestone}-Day Streak Milestone!`,
        });

        if (res.awarded) {
          this.notifyListeners(res);
          results.push(res);
        }
      }
    }

    return results;
  }

  /**
   * Spaced revision reward (+3 XP, +1 Point).
   */
  async onRevisionSession(topicId: string, title?: string): Promise<RewardResult> {
    const todayStr = new Date().toISOString().split('T')[0];
    const sourceId = `rev_${topicId}_${todayStr}`;

    const result = await this.repository.awardReward({
      event_type: 'REVISION_SESSION',
      source_id: sourceId,
      topic_id: topicId,
      custom_xp: GamificationConfig.revisionSessionXp,
      custom_points: GamificationConfig.revisionSessionPoints,
      description: title ? `Spaced Revision: ${title}` : 'Completed spaced revision',
    });

    this.notifyListeners(result);
    return result;
  }

  /**
   * Directly awards XP and Points for tasks, challenges, or AI sessions with duplicate prevention.
   */
  async awardDirectReward(
    eventType: RewardEventType,
    sourceId: string,
    xpAmount: number,
    pointsAmount: number,
    description: string
  ): Promise<RewardResult> {
    const result = await this.repository.awardReward({
      event_type: eventType,
      source_id: sourceId,
      custom_xp: xpAmount,
      custom_points: pointsAmount,
      description,
    });

    this.notifyListeners(result);
    return result;
  }

  // =========================================================================
  // QUERY DELEGATION
  // =========================================================================

  async getProfile(): Promise<UserGamificationProfile> {
    return this.repository.getGamificationProfile();
  }

  async getBadges(category?: BadgeCategory | 'ALL'): Promise<Badge[]> {
    return this.repository.getAllBadges(category);
  }

  async getAchievements(filter?: 'all' | 'unlocked' | 'locked'): Promise<GamificationAchievement[]> {
    return this.repository.getAllAchievements(filter);
  }

  async getXpHistory(limit?: number): Promise<XpTransaction[]> {
    return this.repository.getXpTransactions(limit);
  }

  async getPointsHistory(limit?: number): Promise<PointsTransaction[]> {
    return this.repository.getPointsTransactions(limit);
  }

  async spendPoints(amount: number, description: string, source_id: string) {
    return this.repository.spendPoints(amount, description, source_id);
  }

  async getSettings(): Promise<GamificationSettings> {
    return this.repository.getGamificationSettings();
  }

  async updateSettings(settings: Partial<GamificationSettings>): Promise<void> {
    return this.repository.updateGamificationSettings(settings);
  }

  async resetData(): Promise<void> {
    return this.repository.resetGamificationData();
  }
}

export const gamificationService = GamificationService.getInstance();
