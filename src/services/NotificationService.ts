import { Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  NotificationPreferences,
  NotificationType,
  NotificationChannelId,
  NotificationPayload,
  NotificationHistory,
  ScheduledNotificationItem,
  NotificationDecisionResult,
} from '../models/Notification';
import { notificationRepository } from '../repositories/NotificationRepository';
import { NotificationDecisionEngine } from './NotificationDecisionEngine';
import { RootScreen } from '../navigation/types';

// Configure top-level Expo notification presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type DeepLinkHandler = (screen: RootScreen, params?: Record<string, any>) => void;

export class NotificationService {
  private static instance: NotificationService | null = null;
  private initialized: boolean = false;
  private deepLinkHandler: DeepLinkHandler | null = null;
  private responseSubscription: any = null;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initializes notification channels, response listeners, and restores schedules.
   */
  async init(deepLinkHandler?: DeepLinkHandler): Promise<void> {
    if (deepLinkHandler) {
      this.deepLinkHandler = deepLinkHandler;
    }

    if (this.initialized) return;

    try {
      await this.createNotificationChannels();
      this.setupNotificationResponseListener();
      await this.restoreSchedules();
      this.initialized = true;
    } catch (err) {
      console.warn('[NotificationService] Channel init warning:', err);
    }
  }

  /**
   * Sets or updates the deep link handler callback.
   */
  setDeepLinkHandler(handler: DeepLinkHandler): void {
    this.deepLinkHandler = handler;
  }

  /**
   * Sets up deep link handling when a notification is tapped by the user.
   */
  public setupNotificationResponseListener(handler?: DeepLinkHandler): () => void {
    if (handler) {
      this.deepLinkHandler = handler;
    }

    if (this.responseSubscription) {
      this.responseSubscription.remove();
    }

    this.responseSubscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        try {
          const data = (response.notification.request.content.data as unknown) as NotificationPayload;
          const actionId = response.actionIdentifier;

          // Record opened in history
          if (data && data.type) {
            const recent = await notificationRepository.getRecentHistoryByType(data.type, 24);
            if (recent.length > 0) {
              await notificationRepository.updateHistoryStatus(
                recent[0].id,
                actionId === Notifications.DEFAULT_ACTION_IDENTIFIER ? 'OPENED' : 'DISMISSED',
                'opened_at'
              );
            }
          }

          if (!data || !this.deepLinkHandler) return;

          // Action Handling (Section 9 & 43)
          if (actionId === 'START_STUDY' || actionId === Notifications.DEFAULT_ACTION_IDENTIFIER) {
            if (data.topic_id && data.course_id) {
              this.deepLinkHandler('ModuleDetails', {
                courseId: data.course_id,
                moduleId: data.module_id,
                topicId: data.topic_id,
              });
            } else if (data.course_id) {
              this.deepLinkHandler('CourseRoadmap', {
                courseId: data.course_id,
              });
            } else {
              this.deepLinkHandler((data.target_screen as RootScreen) || 'StudyPlan', {});
            }
          } else if (actionId === 'VIEW_PLAN') {
            this.deepLinkHandler('StudyPlan', {});
          } else if (actionId === 'LATER' || actionId === 'SNOOZE') {
            await this.snooze();
          }
        } catch (err) {
          console.warn('[NotificationService] Notification tap error:', err);
        }
      }
    );

    return () => {
      if (this.responseSubscription) {
        this.responseSubscription.remove();
        this.responseSubscription = null;
      }
    };
  }

  /**
   * Creates Android notification channels with appropriate priorities and vibrations (Section 42).
   */
  async createNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    // 1. Study Reminders Channel (High Importance)
    await Notifications.setNotificationChannelAsync('study_reminders', {
      name: 'Daily Study Reminders',
      description: 'Reminders for your planned learning missions and topics',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4F46E5',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: false,
    });

    // 2. Study Alarm Channel (Max Importance, loud, bypass DND where permitted)
    await Notifications.setNotificationChannelAsync('study_alarm', {
      name: 'Study Alarm',
      description: 'Urgent alarm alert for scheduled study sessions',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'default',
      vibrationPattern: [0, 500, 200, 500, 200, 500],
      lightColor: '#DC2626',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      bypassDnd: true,
    });

    // 3. Goal Reminders Channel
    await Notifications.setNotificationChannelAsync('goal_reminders', {
      name: 'Goal & Progress Reminders',
      description: 'Alerts for daily and milestone learning achievements',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 200, 200, 200],
      lightColor: '#10B981',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    // 4. Weekly & Monthly Summary Channel
    await Notifications.setNotificationChannelAsync('weekly_monthly_summary', {
      name: 'Weekly & Monthly Summaries',
      description: 'Periodic progress recaps of your learning voyage',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 150, 150, 150],
      lightColor: '#F59E0B',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });

    // 5. Daily Motivation Channel
    await Notifications.setNotificationChannelAsync('daily_motivation', {
      name: 'Daily Motivation',
      description: 'Morning inspiration and daily plan briefings',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 200, 100, 200],
      lightColor: '#6366F1',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    });
  }

  // =========================================================================
  // PERMISSION HANDLING (Section 2 & 32)
  // =========================================================================

  async checkPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status === 'granted') return 'granted';
      if (status === 'denied') return 'denied';
      return 'undetermined';
    } catch {
      return 'undetermined';
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = status;
      }

      const granted = finalStatus === 'granted';
      if (granted) {
        await this.rescheduleAllFromPreferences();
      }
      return granted;
    } catch (err) {
      console.warn('[NotificationService] Permission request error:', err);
      return false;
    }
  }

  async openSystemSettings(): Promise<void> {
    try {
      await Linking.openSettings();
    } catch (err) {
      console.warn('[NotificationService] Could not open system settings:', err);
    }
  }

  // =========================================================================
  // SCHEDULING LOGIC WITH DETERMINISTIC IDENTIFIERS (Section 25 & 26)
  // =========================================================================

  /**
   * Schedules a daily study reminder evaluated by the Decision Engine.
   */
  async scheduleDailyStudyReminder(
    deterministicId: string,
    timeStr: string,
    advanceMinutes: number = 0
  ): Promise<string | null> {
    try {
      const prefs = await notificationRepository.getPreferences();
      if (!prefs.notifications_enabled) return null;

      // 1. Gather real study context
      const studyPlan = await notificationRepository.getTodayStudyPlan();
      const completedMinutesToday = await notificationRepository.getTodayStudySessionsTotal();
      const streakDays = await notificationRepository.getStreakDays();

      // 2. Evaluate decision result
      const decision = NotificationDecisionEngine.evaluateStudyReminder({
        studyPlan,
        completedMinutesToday,
        activeStreakDays: streakDays,
        preferences: prefs,
        isAlarm: false,
      });

      // 3. Compute target time
      const [hour, minute] = timeStr.split(':').map((s) => parseInt(s, 10));
      let targetHour = hour;
      let targetMinute = minute - advanceMinutes;
      if (targetMinute < 0) {
        targetMinute += 60;
        targetHour = (targetHour - 1 + 24) % 24;
      }

      // 4. Cancel any previous schedule with this deterministic ID
      await this.cancelScheduledItem(deterministicId);

      // 5. Schedule via Expo Notifications
      const notifId = await Notifications.scheduleNotificationAsync({
        identifier: deterministicId,
        content: {
          title: decision.title,
          body: decision.message,
          data: {
            type: decision.type,
            course_id: decision.courseId || '',
            module_id: decision.moduleId || '',
            topic_id: decision.topicId || '',
            target_screen: decision.targetScreen,
            title: decision.title,
            body: decision.message,
          },
          sound: decision.soundEnabled,
          vibrate: decision.vibrationEnabled ? [0, 250, 250, 250] : undefined,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: targetHour,
          minute: targetMinute,
          channelId: decision.channelId,
        },
      });

      // 6. Persist scheduled item for reboot/restart restoration
      const scheduledItem: ScheduledNotificationItem = {
        id: deterministicId,
        notification_type: decision.type,
        course_id: decision.courseId,
        module_id: decision.moduleId,
        topic_id: decision.topicId,
        scheduled_time: `${String(targetHour).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')}`,
        repeat_type: 'DAILY',
        enabled: true,
        notification_id: notifId,
        payload_json: JSON.stringify(decision),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await notificationRepository.saveScheduledNotification(scheduledItem);

      // 7. Record scheduled in history
      await notificationRepository.recordHistory({
        notification_type: decision.type,
        title: decision.title,
        message: decision.message,
        course_id: decision.courseId,
        module_id: decision.moduleId,
        topic_id: decision.topicId,
        scheduled_at: scheduledItem.scheduled_time,
        status: 'SCHEDULED',
      });

      return notifId;
    } catch (err) {
      console.warn('[NotificationService] scheduleDailyStudyReminder error:', err);
      return null;
    }
  }

  /**
   * Schedules a study alarm (Section 11).
   */
  async scheduleStudyAlarm(timeStr: string): Promise<string | null> {
    try {
      const prefs = await notificationRepository.getPreferences();
      if (!prefs.notifications_enabled || !prefs.alarm_enabled) return null;

      const deterministicId = 'study_alarm';
      await this.cancelScheduledItem(deterministicId);

      const studyPlan = await notificationRepository.getTodayStudyPlan();
      const completedMinutesToday = await notificationRepository.getTodayStudySessionsTotal();
      const streakDays = await notificationRepository.getStreakDays();

      const decision = NotificationDecisionEngine.evaluateStudyReminder({
        studyPlan,
        completedMinutesToday,
        activeStreakDays: streakDays,
        preferences: prefs,
        isAlarm: true,
      });

      const [hour, minute] = timeStr.split(':').map((s) => parseInt(s, 10));

      const notifId = await Notifications.scheduleNotificationAsync({
        identifier: deterministicId,
        content: {
          title: decision.title,
          body: decision.message,
          data: {
            type: decision.type,
            course_id: decision.courseId || '',
            module_id: decision.moduleId || '',
            topic_id: decision.topicId || '',
            target_screen: decision.targetScreen,
            title: decision.title,
            body: decision.message,
          },
          sound: prefs.sound_enabled,
          vibrate: prefs.vibration_enabled ? [0, 500, 200, 500, 200, 500] : undefined,
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'study_alarm',
        },
      });

      const scheduledItem: ScheduledNotificationItem = {
        id: deterministicId,
        notification_type: decision.type,
        course_id: decision.courseId,
        module_id: decision.moduleId,
        topic_id: decision.topicId,
        scheduled_time: timeStr,
        repeat_type: 'DAILY',
        enabled: true,
        notification_id: notifId,
        payload_json: JSON.stringify(decision),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await notificationRepository.saveScheduledNotification(scheduledItem);

      await notificationRepository.recordHistory({
        notification_type: decision.type,
        title: decision.title,
        message: decision.message,
        course_id: decision.courseId,
        module_id: decision.moduleId,
        topic_id: decision.topicId,
        scheduled_at: timeStr,
        status: 'SCHEDULED',
      });

      return notifId;
    } catch (err) {
      console.warn('[NotificationService] scheduleStudyAlarm error:', err);
      return null;
    }
  }

  /**
   * Schedules a morning plan briefing reminder (Section 16).
   */
  async scheduleMorningPlanReminder(deterministicId: string, timeStr: string): Promise<string | null> {
    try {
      const prefs = await notificationRepository.getPreferences();
      if (!prefs.notifications_enabled || !prefs.morning_plan_reminder_enabled) return null;

      await this.cancelScheduledItem(deterministicId);

      const studyPlan = await notificationRepository.getTodayStudyPlan();
      const decision = NotificationDecisionEngine.evaluateMorningPlan({
        studyPlan,
        completedMinutesToday: 0,
        activeStreakDays: 0,
        preferences: prefs,
      });

      if (!decision) return null;

      const [hour, minute] = timeStr.split(':').map((s) => parseInt(s, 10));

      const notifId = await Notifications.scheduleNotificationAsync({
        identifier: deterministicId,
        content: {
          title: decision.title,
          body: decision.message,
          data: {
            type: decision.type,
            target_screen: decision.targetScreen,
            title: decision.title,
            body: decision.message,
          },
          sound: prefs.sound_enabled,
          vibrate: prefs.vibration_enabled ? [0, 200, 100, 200] : undefined,
          priority: Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'study_reminders',
        },
      });

      const scheduledItem: ScheduledNotificationItem = {
        id: deterministicId,
        notification_type: decision.type,
        scheduled_time: timeStr,
        repeat_type: 'DAILY',
        enabled: true,
        notification_id: notifId,
        payload_json: JSON.stringify(decision),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await notificationRepository.saveScheduledNotification(scheduledItem);

      return notifId;
    } catch (err) {
      console.warn('[NotificationService] scheduleMorningPlanReminder error:', err);
      return null;
    }
  }

  /**
   * Schedules an evening reminder for unfinished topics (Section 17).
   */
  async scheduleEveningUnfinishedReminder(deterministicId: string, timeStr: string): Promise<string | null> {
    try {
      const prefs = await notificationRepository.getPreferences();
      if (!prefs.notifications_enabled || !prefs.evening_unfinished_reminder_enabled) return null;

      await this.cancelScheduledItem(deterministicId);

      const studyPlan = await notificationRepository.getTodayStudyPlan();
      const completedMinutesToday = await notificationRepository.getTodayStudySessionsTotal();

      const decision = NotificationDecisionEngine.evaluateEveningUnfinished({
        studyPlan,
        completedMinutesToday,
        activeStreakDays: 0,
        preferences: prefs,
      });

      if (!decision) return null;

      const [hour, minute] = timeStr.split(':').map((s) => parseInt(s, 10));

      const notifId = await Notifications.scheduleNotificationAsync({
        identifier: deterministicId,
        content: {
          title: decision.title,
          body: decision.message,
          data: {
            type: decision.type,
            target_screen: decision.targetScreen,
            title: decision.title,
            body: decision.message,
          },
          sound: prefs.sound_enabled,
          vibrate: prefs.vibration_enabled ? [0, 250, 250, 250] : undefined,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'study_reminders',
        },
      });

      const scheduledItem: ScheduledNotificationItem = {
        id: deterministicId,
        notification_type: decision.type,
        scheduled_time: timeStr,
        repeat_type: 'DAILY',
        enabled: true,
        notification_id: notifId,
        payload_json: JSON.stringify(decision),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await notificationRepository.saveScheduledNotification(scheduledItem);

      return notifId;
    } catch (err) {
      console.warn('[NotificationService] scheduleEveningUnfinishedReminder error:', err);
      return null;
    }
  }

  /**
   * Schedules a weekly summary reminder (Section 19).
   */
  async scheduleWeeklySummaryReminder(day: string, timeStr: string): Promise<string | null> {
    try {
      const prefs = await notificationRepository.getPreferences();
      if (!prefs.notifications_enabled || !prefs.weekly_reminder_enabled) return null;

      const deterministicId = 'weekly_summary';
      await this.cancelScheduledItem(deterministicId);

      const weeklyData = await notificationRepository.getWeeklyProgressData();
      const decision = NotificationDecisionEngine.evaluateWeeklySummary({
        studyPlan: null,
        completedMinutesToday: 0,
        activeStreakDays: 0,
        weeklyData,
        preferences: prefs,
      });

      const [hour, minute] = timeStr.split(':').map((s) => parseInt(s, 10));
      const dayMap: Record<string, number> = {
        Sunday: 1,
        Monday: 2,
        Tuesday: 3,
        Wednesday: 4,
        Thursday: 5,
        Friday: 6,
        Saturday: 7,
      };
      const weekday = dayMap[day] || 1;

      const notifId = await Notifications.scheduleNotificationAsync({
        identifier: deterministicId,
        content: {
          title: decision.title,
          body: decision.message,
          data: {
            type: decision.type,
            target_screen: decision.targetScreen,
            title: decision.title,
            body: decision.message,
          },
          sound: prefs.sound_enabled,
          vibrate: prefs.vibration_enabled ? [0, 150, 150, 150] : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday,
          hour,
          minute,
          channelId: 'weekly_monthly_summary',
        },
      });

      const scheduledItem: ScheduledNotificationItem = {
        id: deterministicId,
        notification_type: decision.type,
        scheduled_time: `${day} ${timeStr}`,
        repeat_type: 'WEEKLY',
        enabled: true,
        notification_id: notifId,
        payload_json: JSON.stringify(decision),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await notificationRepository.saveScheduledNotification(scheduledItem);

      return notifId;
    } catch (err) {
      console.warn('[NotificationService] scheduleWeeklySummaryReminder error:', err);
      return null;
    }
  }

  /**
   * Schedules a monthly progress summary reminder (Section 20).
   */
  async scheduleMonthlySummaryReminder(timeStr: string): Promise<string | null> {
    try {
      const prefs = await notificationRepository.getPreferences();
      if (!prefs.notifications_enabled || !prefs.monthly_reminder_enabled) return null;

      const deterministicId = 'monthly_summary';
      await this.cancelScheduledItem(deterministicId);

      const monthlyData = await notificationRepository.getMonthlyProgressData();
      const decision = NotificationDecisionEngine.evaluateMonthlySummary({
        studyPlan: null,
        completedMinutesToday: 0,
        activeStreakDays: 0,
        monthlyData,
        preferences: prefs,
      });

      const [hour, minute] = timeStr.split(':').map((s) => parseInt(s, 10));

      const notifId = await Notifications.scheduleNotificationAsync({
        identifier: deterministicId,
        content: {
          title: decision.title,
          body: decision.message,
          data: {
            type: decision.type,
            target_screen: decision.targetScreen,
            title: decision.title,
            body: decision.message,
          },
          sound: prefs.sound_enabled,
          vibrate: prefs.vibration_enabled ? [0, 150, 150, 150] : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.MONTHLY,
          day: 28, // Near month end
          hour,
          minute,
          channelId: 'weekly_monthly_summary',
        },
      });

      const scheduledItem: ScheduledNotificationItem = {
        id: deterministicId,
        notification_type: decision.type,
        scheduled_time: `Day 28 ${timeStr}`,
        repeat_type: 'MONTHLY',
        enabled: true,
        notification_id: notifId,
        payload_json: JSON.stringify(decision),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await notificationRepository.saveScheduledNotification(scheduledItem);

      return notifId;
    } catch (err) {
      console.warn('[NotificationService] scheduleMonthlySummaryReminder error:', err);
      return null;
    }
  }

  /**
   * Schedules a streak reminder (Section 21).
   */
  async scheduleStreakReminder(deterministicId: string, timeStr: string): Promise<string | null> {
    try {
      const prefs = await notificationRepository.getPreferences();
      if (!prefs.notifications_enabled || !prefs.streak_reminder_enabled) return null;

      await this.cancelScheduledItem(deterministicId);

      const streakDays = await notificationRepository.getStreakDays();
      const completedMinutesToday = await notificationRepository.getTodayStudySessionsTotal();

      const decision = NotificationDecisionEngine.evaluateStreakProtection({
        studyPlan: null,
        completedMinutesToday,
        activeStreakDays: streakDays,
        preferences: prefs,
      });

      if (!decision) return null;

      const [hour, minute] = timeStr.split(':').map((s) => parseInt(s, 10));

      const notifId = await Notifications.scheduleNotificationAsync({
        identifier: deterministicId,
        content: {
          title: decision.title,
          body: decision.message,
          data: {
            type: decision.type,
            target_screen: decision.targetScreen,
            title: decision.title,
            body: decision.message,
          },
          sound: prefs.sound_enabled,
          vibrate: prefs.vibration_enabled ? [0, 250, 250, 250] : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'study_reminders',
        },
      });

      const scheduledItem: ScheduledNotificationItem = {
        id: deterministicId,
        notification_type: decision.type,
        scheduled_time: timeStr,
        repeat_type: 'DAILY',
        enabled: true,
        notification_id: notifId,
        payload_json: JSON.stringify(decision),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await notificationRepository.saveScheduledNotification(scheduledItem);

      return notifId;
    } catch (err) {
      console.warn('[NotificationService] scheduleStreakReminder error:', err);
      return null;
    }
  }

  /**
   * Cancels a scheduled notification by deterministic ID.
   */
  async cancelScheduledItem(deterministicId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(deterministicId);
      await notificationRepository.removeScheduledNotificationById(deterministicId);
    } catch (err) {
      // Ignore if not previously scheduled
    }
  }

  /**
   * Snooze feature (Section 13).
   * Cancels current active reminder, schedules exactly one new local reminder after snoozeMinutes.
   */
  async snooze(snoozeMinutes?: number): Promise<void> {
    try {
      const prefs = await notificationRepository.getPreferences();
      const minutes = snoozeMinutes || prefs.snooze_interval_minutes || 10;
      const snoozeId = 'snooze_reminder';

      // 1. Cancel previous snooze if any
      await Notifications.cancelScheduledNotificationAsync(snoozeId);

      const studyPlan = await notificationRepository.getTodayStudyPlan();
      const completedMinutesToday = await notificationRepository.getTodayStudySessionsTotal();
      const decision = NotificationDecisionEngine.evaluateStudyReminder({
        studyPlan,
        completedMinutesToday,
        activeStreakDays: 0,
        preferences: prefs,
      });

      const targetTitle = `⏰ Snooze Complete (${minutes}m)`;
      const targetMessage = `Ready to dive back in? Next: ${decision.title} — ${decision.message}`;

      await Notifications.scheduleNotificationAsync({
        identifier: snoozeId,
        content: {
          title: targetTitle,
          body: targetMessage,
          data: {
            type: 'SNOOZE_REMINDER',
            target_screen: decision.targetScreen,
            title: targetTitle,
            body: targetMessage,
            course_id: decision.courseId,
            module_id: decision.moduleId,
            topic_id: decision.topicId,
          },
          sound: prefs.sound_enabled,
          vibrate: prefs.vibration_enabled ? [0, 300, 150, 300] : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: minutes * 60,
          repeats: false,
          channelId: 'study_reminders',
        },
      });

      await notificationRepository.recordHistory({
        notification_type: 'SNOOZE_REMINDER',
        title: targetTitle,
        message: targetMessage,
        course_id: decision.courseId,
        module_id: decision.moduleId,
        topic_id: decision.topicId,
        status: 'SNOOZED',
      });
    } catch (err) {
      console.warn('[NotificationService] snooze error:', err);
    }
  }

  /**
   * Reschedules all notifications according to user preferences (Section 26).
   */
  async rescheduleAllFromPreferences(): Promise<void> {
    try {
      const prefs = await notificationRepository.getPreferences();

      // Clear all existing Expo schedules
      await Notifications.cancelAllScheduledNotificationsAsync();
      await notificationRepository.clearAllScheduledNotifications();

      if (!prefs.notifications_enabled) {
        return; // All notifications disabled
      }

      // 1. Daily Study Reminders
      if (prefs.learning_reminder_enabled) {
        if (prefs.multiple_study_times_enabled) {
          if (prefs.morning_study_enabled) {
            await this.scheduleDailyStudyReminder('daily_study_morning', prefs.morning_study_time, prefs.advance_reminder_minutes);
          }
          if (prefs.afternoon_study_enabled) {
            await this.scheduleDailyStudyReminder('daily_study_afternoon', prefs.afternoon_study_time, prefs.advance_reminder_minutes);
          }
          if (prefs.evening_study_enabled) {
            await this.scheduleDailyStudyReminder('daily_study_evening', prefs.evening_study_time, prefs.advance_reminder_minutes);
          }
        } else {
          await this.scheduleDailyStudyReminder('daily_study_primary', prefs.learning_reminder_time, prefs.advance_reminder_minutes);
        }
      }

      // 2. Study Alarm
      if (prefs.alarm_enabled) {
        await this.scheduleStudyAlarm(prefs.alarm_time);
      }

      // 3. Morning Plan Briefing
      if (prefs.morning_plan_reminder_enabled) {
        await this.scheduleMorningPlanReminder('morning_plan', prefs.morning_plan_reminder_time);
      }

      // 4. Evening Unfinished Topics
      if (prefs.evening_unfinished_reminder_enabled) {
        await this.scheduleEveningUnfinishedReminder('evening_unfinished', prefs.evening_unfinished_reminder_time);
      }

      // 5. Weekly Summary
      if (prefs.weekly_reminder_enabled) {
        await this.scheduleWeeklySummaryReminder(prefs.weekly_reminder_day, prefs.weekly_reminder_time);
      }

      // 6. Monthly Summary
      if (prefs.monthly_reminder_enabled) {
        await this.scheduleMonthlySummaryReminder(prefs.monthly_reminder_time);
      }

      // 7. Streak Reminder
      if (prefs.streak_reminder_enabled) {
        await this.scheduleStreakReminder('streak_reminder', prefs.streak_reminder_time);
      }
    } catch (err) {
      console.warn('[NotificationService] rescheduleAllFromPreferences error:', err);
    }
  }

  /**
   * Restores schedules from the persistent database on app start or reboot (Section 27 & 28).
   */
  async restoreSchedules(): Promise<void> {
    try {
      const prefs = await notificationRepository.getPreferences();
      if (!prefs.notifications_enabled) return;

      const items = await notificationRepository.getScheduledNotifications();
      if (items.length === 0) {
        // If empty, rebuild from preferences
        await this.rescheduleAllFromPreferences();
        return;
      }

      // Re-apply schedules
      await this.rescheduleAllFromPreferences();
    } catch (err) {
      console.warn('[NotificationService] restoreSchedules error:', err);
    }
  }

  /**
   * Sends an immediate test notification or alarm (Section 37 & 38).
   */
  async sendTestNotification(isAlarm: boolean = false): Promise<void> {
    try {
      const prefs = await notificationRepository.getPreferences();
      const studyPlan = await notificationRepository.getTodayStudyPlan();
      const completedMinutesToday = await notificationRepository.getTodayStudySessionsTotal();

      const decision = NotificationDecisionEngine.evaluateStudyReminder({
        studyPlan,
        completedMinutesToday,
        activeStreakDays: 3,
        preferences: prefs,
        isAlarm,
      });

      const title = isAlarm ? `🚨 [TEST] ${decision.title}` : `🔔 [TEST] ${decision.title}`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: decision.message,
          data: {
            type: isAlarm ? 'STUDY_ALARM' : 'TEST',
            target_screen: decision.targetScreen,
            title,
            body: decision.message,
            course_id: decision.courseId,
            module_id: decision.moduleId,
            topic_id: decision.topicId,
          },
          sound: prefs.sound_enabled,
          vibrate: isAlarm
            ? [0, 500, 200, 500]
            : (prefs.vibration_enabled ? [0, 250, 250, 250] : undefined),
          priority: isAlarm
            ? Notifications.AndroidNotificationPriority.MAX
            : Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // fires immediately
      });

      await notificationRepository.recordHistory({
        notification_type: isAlarm ? 'STUDY_ALARM' : 'TEST',
        title,
        message: decision.message,
        course_id: decision.courseId,
        module_id: decision.moduleId,
        topic_id: decision.topicId,
        status: 'SHOWN',
      });
    } catch (err) {
      console.warn('[NotificationService] sendTestNotification error:', err);
    }
  }

  /**
   * Goal completion notification (Section 18).
   * Note: No XP, badges, or game points are awarded here (reserved for Part 19).
   */
  async scheduleCompletedGoalNotification(courseName?: string): Promise<void> {
    try {
      const prefs = await notificationRepository.getPreferences();
      if (!prefs.notifications_enabled) return;

      const title = '🎉 Daily Goal Complete!';
      const message = courseName
        ? `Sensational effort! You completed your planned study for ${courseName} today.`
        : 'Sensational effort! You completed all your planned study for today. Great work!';

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          data: {
            type: 'GOAL_COMPLETED',
            target_screen: 'StudyPlan',
            title,
            body: message,
          },
          sound: prefs.sound_enabled,
          vibrate: prefs.vibration_enabled ? [0, 250, 250, 250] : undefined,
        },
        trigger: null,
      });

      await notificationRepository.recordHistory({
        notification_type: 'GOAL_COMPLETED',
        title,
        message,
        status: 'SHOWN',
      });
    } catch (err) {
      console.warn('[NotificationService] scheduleCompletedGoalNotification error:', err);
    }
  }

  // =========================================================================
  // BACKWARD COMPATIBILITY HELPERS (Parts 12 & 13)
  // =========================================================================

  async scheduleLearningReminder(timeStr: string): Promise<string | null> {
    return this.scheduleDailyStudyReminder('daily_study_primary', timeStr);
  }

  async scheduleGoalReminder(timeStr: string): Promise<string | null> {
    return this.scheduleEveningUnfinishedReminder('evening_unfinished', timeStr);
  }

  async scheduleStreakReminderLegacy(timeStr: string): Promise<string | null> {
    return this.scheduleStreakReminder('streak_reminder', timeStr);
  }

  async schedulePracticeReminder(timeStr: string): Promise<string | null> {
    return this.scheduleDailyStudyReminder('daily_study_practice', timeStr);
  }

  async scheduleMotivationNotification(timeStr: string): Promise<string | null> {
    return this.scheduleMorningPlanReminder('morning_plan', timeStr);
  }

  async cancelNotification(type: NotificationType): Promise<void> {
    await this.cancelScheduledItem(type.toLowerCase());
  }

  async rescheduleAllNotifications(): Promise<void> {
    await this.rescheduleAllFromPreferences();
  }

  /**
   * Helper for Part 13 Focus Mode timer completion notification.
   */
  async sendFocusCompletionNotification(courseName: string, minutes: number): Promise<void> {
    try {
      const prefs = await notificationRepository.getPreferences();
      if (!prefs.notifications_enabled) return;

      const title = 'Focus Session Complete! 🎯';
      const body = `Great work! You focused on ${courseName} for ${minutes} minutes. Keep up the momentum!`;

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: {
            type: 'DAILY_STUDY_REMINDER',
            target_screen: 'FocusHistory',
            course_id: '',
          },
          sound: prefs.sound_enabled,
          vibrate: prefs.vibration_enabled ? [0, 250, 250, 250] : undefined,
        },
        trigger: null,
      });

      await notificationRepository.recordHistory({
        notification_type: 'DAILY_STUDY_REMINDER',
        title,
        message: body,
        status: 'SHOWN',
      });
    } catch (err) {
      console.warn('[NotificationService] sendFocusCompletionNotification error:', err);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await notificationRepository.clearAllScheduledNotifications();
  }
  async scheduleStudyReminder(params: { id: string; title: string; body: string; triggerTime: Date }): Promise<void> {
    try {
      const prefs = await notificationRepository.getPreferences();
      if (!prefs.notifications_enabled) return;
      await Notifications.scheduleNotificationAsync({
        identifier: params.id,
        content: {
          title: params.title,
          body: params.body,
          sound: prefs.sound_enabled,
        },
        trigger: {
          date: params.triggerTime,
        } as any,
      });
    } catch (err) {
      console.warn('[NotificationService] scheduleStudyReminder error:', err);
    }
  }
}

export const notificationService = NotificationService.getInstance();
