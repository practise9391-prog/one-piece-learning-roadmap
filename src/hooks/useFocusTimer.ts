import { useState, useEffect, useCallback } from 'react';
import { ActiveFocusState, StudySession } from '../models/Focus';
import { focusTimerService } from '../services/FocusTimerService';

export function formatTimeDisplay(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.max(0, totalSeconds) % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function formatMinutesOrHours(totalSeconds: number): string {
  const totalMins = Math.round(totalSeconds / 60);
  if (totalMins < 60) {
    return `${totalMins} min`;
  }
  const hours = Math.floor(totalMins / 60);
  const remainingMins = totalMins % 60;
  if (remainingMins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMins}m`;
}

export function useFocusTimer() {
  const [focusState, setFocusState] = useState<ActiveFocusState>(() =>
    focusTimerService.getState()
  );

  useEffect(() => {
    // Sync with database on mount (e.g. recover running session)
    focusTimerService.syncWithDatabase();

    const unsubscribe = focusTimerService.subscribe((state) => {
      setFocusState(state);
    });

    return unsubscribe;
  }, []);

  const startSession = useCallback(
    async (params: {
      courseId: string;
      moduleId?: string | null;
      topicId?: string | null;
      plannedDurationSeconds: number;
    }): Promise<StudySession> => {
      return focusTimerService.startSession(params);
    },
    []
  );

  const pauseSession = useCallback(async (): Promise<StudySession | null> => {
    return focusTimerService.pauseSession();
  }, []);

  const resumeSession = useCallback(async (): Promise<StudySession | null> => {
    return focusTimerService.resumeSession();
  }, []);

  const endAndSaveSession = useCallback(
    async (actualDurationSeconds?: number): Promise<StudySession | null> => {
      return focusTimerService.endAndSaveSession(actualDurationSeconds);
    },
    []
  );

  const discardSession = useCallback(async (): Promise<void> => {
    return focusTimerService.discardSession();
  }, []);

  const refresh = useCallback(async () => {
    return focusTimerService.syncWithDatabase();
  }, []);

  return {
    ...focusState,
    formattedTime: formatTimeDisplay(focusState.remainingSeconds),
    formattedElapsed: formatTimeDisplay(focusState.elapsedSeconds),
    startSession,
    pauseSession,
    resumeSession,
    endAndSaveSession,
    discardSession,
    refresh,
  };
}
