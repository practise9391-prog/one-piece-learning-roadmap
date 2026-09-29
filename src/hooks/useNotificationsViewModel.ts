import { useState, useEffect, useCallback } from 'react';
import {
  NotificationPreferences,
  NotificationHistory,
} from '../models/Notification';
import { notificationRepository } from '../repositories/NotificationRepository';
import { notificationService } from '../services/NotificationService';

export function useNotificationsViewModel() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [testSending, setTestSending] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prefs, perm, notifHistory] = await Promise.all([
        notificationRepository.getPreferences(),
        notificationService.checkPermissionStatus(),
        notificationRepository.getNotificationHistory(10),
      ]);
      setPreferences(prefs);
      setPermissionStatus(perm);
      setHistory(notifHistory);
    } catch (err) {
      console.error('Failed to load notification settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await notificationService.requestPermission();
    const status = await notificationService.checkPermissionStatus();
    setPermissionStatus(status);
    return granted;
  };

  const toggleMasterNotifications = async (enabled: boolean): Promise<void> => {
    if (enabled && permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
    }

    const updated = await notificationRepository.updatePreferences({
      notifications_enabled: enabled,
    });
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const updateSound = async (enabled: boolean): Promise<void> => {
    const updated = await notificationRepository.updatePreferences({ sound_enabled: enabled });
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const updateVibration = async (enabled: boolean): Promise<void> => {
    const updated = await notificationRepository.updatePreferences({ vibration_enabled: enabled });
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const updateLearningReminder = async (enabled: boolean, time?: string): Promise<void> => {
    const updatePayload: Partial<NotificationPreferences> = {
      learning_reminder_enabled: enabled,
    };
    if (time) updatePayload.learning_reminder_time = time;

    const updated = await notificationRepository.updatePreferences(updatePayload);
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const updateMultipleStudyTimes = async (params: {
    enabled?: boolean;
    morningEnabled?: boolean;
    morningTime?: string;
    afternoonEnabled?: boolean;
    afternoonTime?: string;
    eveningEnabled?: boolean;
    eveningTime?: string;
  }): Promise<void> => {
    const payload: Partial<NotificationPreferences> = {};
    if (params.enabled !== undefined) payload.multiple_study_times_enabled = params.enabled;
    if (params.morningEnabled !== undefined) payload.morning_study_enabled = params.morningEnabled;
    if (params.morningTime !== undefined) payload.morning_study_time = params.morningTime;
    if (params.afternoonEnabled !== undefined) payload.afternoon_study_enabled = params.afternoonEnabled;
    if (params.afternoonTime !== undefined) payload.afternoon_study_time = params.afternoonTime;
    if (params.eveningEnabled !== undefined) payload.evening_study_enabled = params.eveningEnabled;
    if (params.eveningTime !== undefined) payload.evening_study_time = params.eveningTime;

    const updated = await notificationRepository.updatePreferences(payload);
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const updateAdvanceReminderMinutes = async (minutes: number): Promise<void> => {
    const updated = await notificationRepository.updatePreferences({ advance_reminder_minutes: minutes });
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const updateStudyAlarm = async (params: {
    enabled?: boolean;
    time?: string;
    sound?: string;
    snoozeMinutes?: number;
  }): Promise<void> => {
    const payload: Partial<NotificationPreferences> = {};
    if (params.enabled !== undefined) payload.alarm_enabled = params.enabled;
    if (params.time !== undefined) payload.alarm_time = params.time;
    if (params.sound !== undefined) payload.alarm_sound = params.sound;
    if (params.snoozeMinutes !== undefined) payload.snooze_interval_minutes = params.snoozeMinutes;

    const updated = await notificationRepository.updatePreferences(payload);
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const updateMorningPlanReminder = async (enabled: boolean, time?: string): Promise<void> => {
    const payload: Partial<NotificationPreferences> = {
      morning_plan_reminder_enabled: enabled,
    };
    if (time) payload.morning_plan_reminder_time = time;
    const updated = await notificationRepository.updatePreferences(payload);
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const updateEveningUnfinishedReminder = async (enabled: boolean, time?: string): Promise<void> => {
    const payload: Partial<NotificationPreferences> = {
      evening_unfinished_reminder_enabled: enabled,
    };
    if (time) payload.evening_unfinished_reminder_time = time;
    const updated = await notificationRepository.updatePreferences(payload);
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const updateWeeklyReminder = async (enabled: boolean, day?: string, time?: string): Promise<void> => {
    const payload: Partial<NotificationPreferences> = {
      weekly_reminder_enabled: enabled,
    };
    if (day) payload.weekly_reminder_day = day;
    if (time) payload.weekly_reminder_time = time;
    const updated = await notificationRepository.updatePreferences(payload);
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const updateMonthlyReminder = async (enabled: boolean, time?: string): Promise<void> => {
    const payload: Partial<NotificationPreferences> = {
      monthly_reminder_enabled: enabled,
    };
    if (time) payload.monthly_reminder_time = time;
    const updated = await notificationRepository.updatePreferences(payload);
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const updateStreakReminder = async (enabled: boolean, time?: string): Promise<void> => {
    const payload: Partial<NotificationPreferences> = {
      streak_reminder_enabled: enabled,
    };
    if (time) payload.streak_reminder_time = time;

    const updated = await notificationRepository.updatePreferences(payload);
    setPreferences(updated);
    await notificationService.rescheduleAllFromPreferences();
  };

  const sendTestNotification = async (isAlarm: boolean = false): Promise<void> => {
    try {
      setTestSending(true);
      await notificationService.sendTestNotification(isAlarm);
      const notifHistory = await notificationRepository.getNotificationHistory(10);
      setHistory(notifHistory);
    } finally {
      setTestSending(false);
    }
  };

  const snooze = async (minutes?: number): Promise<void> => {
    await notificationService.snooze(minutes);
    const notifHistory = await notificationRepository.getNotificationHistory(10);
    setHistory(notifHistory);
  };

  const openSystemSettings = async (): Promise<void> => {
    await notificationService.openSystemSettings();
  };

  return {
    preferences,
    permissionStatus,
    isPermissionGranted: permissionStatus === 'granted',
    history,
    loading,
    testSending,
    refreshPreferences: loadData,
    requestPermission,
    toggleMasterNotifications,
    updateSound,
    updateVibration,
    updateLearningReminder,
    updateMultipleStudyTimes,
    updateAdvanceReminderMinutes,
    updateStudyAlarm,
    updateMorningPlanReminder,
    updateEveningUnfinishedReminder,
    updateWeeklyReminder,
    updateMonthlyReminder,
    updateStreakReminder,
    sendTestNotification,
    snooze,
    openSystemSettings,
  };
}
