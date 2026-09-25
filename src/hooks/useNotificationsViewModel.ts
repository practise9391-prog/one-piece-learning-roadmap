import { useState, useEffect, useCallback } from 'react';
import { NotificationPreferences } from '../models/Notification';
import { notificationRepository } from '../repositories/NotificationRepository';
import { notificationService } from '../services/NotificationService';

export function useNotificationsViewModel() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [loading, setLoading] = useState<boolean>(true);
  const [testSending, setTestSending] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prefs, perm] = await Promise.all([
        notificationRepository.getPreferences(),
        notificationService.getPermissionStatus(),
      ]);
      setPreferences(prefs);
      setPermissionStatus(perm);
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
    const status = await notificationService.getPermissionStatus();
    setPermissionStatus(status);
    return granted;
  };

  const toggleMasterNotifications = async (enabled: boolean): Promise<void> => {
    if (enabled && permissionStatus !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        // Keep master toggle off if permission was not granted
        return;
      }
    }

    const updated = await notificationRepository.updatePreferences({
      notifications_enabled: enabled,
    });
    setPreferences(updated);

    if (enabled) {
      await notificationService.rescheduleAllNotifications();
    } else {
      await notificationService.cancelAllNotifications();
    }
  };

  const updateLearningReminder = async (enabled: boolean, time?: string): Promise<void> => {
    const updatePayload: Partial<NotificationPreferences> = {
      learning_reminder_enabled: enabled,
    };
    if (time) updatePayload.learning_reminder_time = time;

    const updated = await notificationRepository.updatePreferences(updatePayload);
    setPreferences(updated);

    if (updated.notifications_enabled && enabled) {
      await notificationService.scheduleLearningReminder(updated.learning_reminder_time);
    } else {
      await notificationService.cancelNotification('DAILY_LEARNING');
    }
  };

  const updateGoalReminder = async (enabled: boolean, time?: string): Promise<void> => {
    const updatePayload: Partial<NotificationPreferences> = {
      goal_reminder_enabled: enabled,
    };
    if (time) updatePayload.goal_reminder_time = time;

    const updated = await notificationRepository.updatePreferences(updatePayload);
    setPreferences(updated);

    if (updated.notifications_enabled && enabled) {
      await notificationService.scheduleGoalReminder(updated.goal_reminder_time);
    } else {
      await notificationService.cancelNotification('DAILY_GOAL');
    }
  };

  const updateStreakReminder = async (enabled: boolean, time?: string): Promise<void> => {
    const updatePayload: Partial<NotificationPreferences> = {
      streak_reminder_enabled: enabled,
    };
    if (time) updatePayload.streak_reminder_time = time;

    const updated = await notificationRepository.updatePreferences(updatePayload);
    setPreferences(updated);

    if (updated.notifications_enabled && enabled) {
      await notificationService.scheduleStreakReminder(updated.streak_reminder_time);
    } else {
      await notificationService.cancelNotification('STREAK');
    }
  };

  const updatePracticeReminder = async (enabled: boolean, time?: string): Promise<void> => {
    const updatePayload: Partial<NotificationPreferences> = {
      practice_reminder_enabled: enabled,
    };
    if (time) updatePayload.practice_reminder_time = time;

    const updated = await notificationRepository.updatePreferences(updatePayload);
    setPreferences(updated);

    if (updated.notifications_enabled && enabled) {
      await notificationService.schedulePracticeReminder(updated.practice_reminder_time);
    } else {
      await notificationService.cancelNotification('PRACTICE');
    }
  };

  const updateMotivationReminder = async (enabled: boolean, time?: string): Promise<void> => {
    const updatePayload: Partial<NotificationPreferences> = {
      motivation_notification_enabled: enabled,
    };
    if (time) updatePayload.motivation_notification_time = time;

    const updated = await notificationRepository.updatePreferences(updatePayload);
    setPreferences(updated);

    if (updated.notifications_enabled && enabled) {
      await notificationService.scheduleMotivationReminder(updated.motivation_notification_time);
    } else {
      await notificationService.cancelNotification('MOTIVATION');
    }
  };

  const sendTestNotification = async (): Promise<boolean> => {
    try {
      setTestSending(true);
      const success = await notificationService.sendTestNotification();
      const status = await notificationService.getPermissionStatus();
      setPermissionStatus(status);
      return success;
    } finally {
      setTestSending(false);
    }
  };

  const openSystemSettings = async (): Promise<void> => {
    await notificationService.openSystemSettings();
  };

  return {
    preferences,
    permissionStatus,
    isPermissionGranted: permissionStatus === 'granted',
    loading,
    testSending,
    refreshPreferences: loadData,
    requestPermission,
    toggleMasterNotifications,
    updateLearningReminder,
    updateGoalReminder,
    updateStreakReminder,
    updatePracticeReminder,
    updateMotivationReminder,
    sendTestNotification,
    openSystemSettings,
  };
}
