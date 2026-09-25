import { Platform, Linking } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  NotificationPreferences,
  NotificationType,
  NotificationChannelId,
  NotificationPayload,
} from '../models/Notification';
import { notificationRepository } from '../repositories/NotificationRepository';
import { dashboardService } from './DashboardService';
import { motivationRepository } from '../repositories/MotivationRepository';
import { activityRepository } from '../repositories/ActivityRepository';
import { courseRepository } from '../repositories/CourseRepository';

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

export class NotificationService {
  private static instance: NotificationService | null = null;
  private initialized: boolean = false;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Initializes notification channels and presentation handler.
   */
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await this.createNotificationChannels();
      this.initialized = true;
    } catch (err) {
      console.warn('[NotificationService] Channel init warning:', err);
    }
  }

  /**
   * Creates Android notification channels with appropriate priorities and vibrations.
   */
  async createNotificationChannels(): Promise<void> {
    if (Platform.OS !== 'android') return;

    // 1. Learning Reminders Channel
    await Notifications.setNotificationChannelAsync('learning_reminders', {
      name: 'Daily Learning Reminders',
      description: 'Reminders to continue your course roadmap and modules',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E53935',
      enableLights: true,
      enableVibrate: true,
    });

    // 2. Daily Goal Reminders Channel
    await Notifications.setNotificationChannelAsync('goal_reminders', {
      name: 'Daily Goal Reminders',
      description: 'Alerts when your daily learning goals are still waiting',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
      vibrationPattern: [0, 200, 150, 200],
      lightColor: '#FFB300',
      enableLights: true,
      enableVibrate: true,
    });

    // 3. Practice Reminders Channel
    await Notifications.setNotificationChannelAsync('practice_reminders', {
      name: 'Practice Hub Reminders',
      description: 'Reminders to solve technical coding and aptitude challenges',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 150, 150, 150],
      lightColor: '#00B4D8',
      enableLights: true,
      enableVibrate: true,
    });

    // 4. Daily Motivation Channel
    await Notifications.setNotificationChannelAsync('motivation', {
      name: 'Daily Motivation Wisdom',
      description: 'Morning inspirational quotes to fuel your Grand Line adventure',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 100, 100, 100],
      lightColor: '#F59E0B',
      enableLights: true,
      enableVibrate: true,
    });
  }

  /**
   * Checks current permission status without prompting.
   */
  async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status;
    } catch {
      return 'undetermined';
    }
  }

  /**
   * Prompts the user for notification permissions on Android 13+ / iOS.
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus === 'granted') {
        return true;
      }
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (err) {
      console.warn('[NotificationService] Request permission error:', err);
      return false;
    }
  }

  /**
   * Opens Android device application settings so user can manually enable notifications.
   */
  async openSystemSettings(): Promise<void> {
    try {
      await Linking.openSettings();
    } catch (err) {
      console.warn('[NotificationService] Could not open system settings:', err);
    }
  }

  /**
   * Helper: Parses "HH:mm" time string into hour and minute components.
   */
  parseTime(timeStr: string): { hour: number; minute: number } {
    try {
      const parts = timeStr.split(':');
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1], 10);
      if (!isNaN(hour) && !isNaN(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        return { hour, minute };
      }
    } catch {}
    return { hour: 19, minute: 0 };
  }

  /**
   * Cancels a previously scheduled notification type safely.
   */
  async cancelNotification(type: NotificationType): Promise<void> {
    try {
      const record = await notificationRepository.getScheduledNotification(type);
      if (record && record.expo_notification_id) {
        await Notifications.cancelScheduledNotificationAsync(record.expo_notification_id);
      }
      await notificationRepository.removeScheduledNotification(type);
    } catch (err) {
      console.warn(`[NotificationService] Error cancelling ${type}:`, err);
    }
  }

  /**
   * Cancels all scheduled application notifications.
   */
  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await notificationRepository.clearAllScheduledNotifications();
    } catch (err) {
      console.warn('[NotificationService] Error cancelling all notifications:', err);
    }
  }

  /**
   * A. Schedule Daily Learning Reminder
   */
  async scheduleLearningReminder(timeStr: string): Promise<string | null> {
    await this.cancelNotification('DAILY_LEARNING');

    const perm = await this.getPermissionStatus();
    if (perm !== 'granted') return null;

    const { hour, minute } = this.parseTime(timeStr);

    // Smart content lookup
    let title = '⚓ Your learning journey awaits';
    let body = 'Continue your voyage across the programming islands today.';
    let courseId: string | undefined;
    let moduleId: string | undefined;
    let targetScreen: NotificationPayload['target_screen'] = 'Dashboard';

    try {
      const currentItem = await dashboardService.getCurrentLearningItem();
      if (currentItem) {
        courseId = currentItem.course.id;
        moduleId = currentItem.currentModule.id;
        targetScreen = 'ModuleDetails';
        title = `⚓ Continue your ${currentItem.course.name} journey`;
        body = `Module ${currentItem.currentModule.order}: ${currentItem.currentModule.title} is ready for you. (${Math.round(currentItem.progressPercentage)}% completed)`;
      } else {
        const allCourses = await courseRepository.getAll();
        if (allCourses.length > 0) {
          targetScreen = 'Courses';
          title = '🧭 Chart your next course';
          body = `14 technical roadmaps are waiting in your offline vault. Select an island to begin.`;
        }
      }
    } catch (err) {
      console.warn('[NotificationService] Smart learning content error:', err);
    }

    const payload: NotificationPayload = {
      type: 'DAILY_LEARNING',
      course_id: courseId,
      module_id: moduleId,
      target_screen: targetScreen,
      title,
      body,
      scheduled_time: timeStr,
    };

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: payload as any,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'learning_reminders',
        },
      });

      await notificationRepository.trackScheduledNotification({
        notification_type: 'DAILY_LEARNING',
        expo_notification_id: notificationId,
        scheduled_time: timeStr,
        title,
        body,
        payload_json: JSON.stringify(payload),
        scheduled_at: new Date().toISOString(),
      });

      return notificationId;
    } catch (err) {
      console.error('[NotificationService] Schedule learning reminder failed:', err);
      return null;
    }
  }

  /**
   * B. Schedule Daily Goal Reminder
   */
  async scheduleGoalReminder(timeStr: string): Promise<string | null> {
    await this.cancelNotification('DAILY_GOAL');

    const perm = await this.getPermissionStatus();
    if (perm !== 'granted') return null;

    const { hour, minute } = this.parseTime(timeStr);

    let title = '🗺️ Your daily goals are waiting';
    let body = 'You still have learning goals to conquer today.';

    try {
      const todayGoals = await motivationRepository.getTodayGoals();
      const incomplete = todayGoals.filter((g) => !g.is_completed);

      // If all goals are already complete, skip scheduling to respect the user's focus
      if (todayGoals.length > 0 && incomplete.length === 0) {
        return null;
      }

      const count = incomplete.length > 0 ? incomplete.length : 2;
      title = '🗺️ Your daily goals are waiting';
      body = `You still have ${count} learning ${count === 1 ? 'goal' : 'goals'} to complete today before midnight.`;
    } catch (err) {
      console.warn('[NotificationService] Smart goal check error:', err);
    }

    const payload: NotificationPayload = {
      type: 'DAILY_GOAL',
      target_screen: 'DailyLearning',
      title,
      body,
      scheduled_time: timeStr,
    };

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: payload as any,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'goal_reminders',
        },
      });

      await notificationRepository.trackScheduledNotification({
        notification_type: 'DAILY_GOAL',
        expo_notification_id: notificationId,
        scheduled_time: timeStr,
        title,
        body,
        payload_json: JSON.stringify(payload),
        scheduled_at: new Date().toISOString(),
      });

      return notificationId;
    } catch (err) {
      console.error('[NotificationService] Schedule goal reminder failed:', err);
      return null;
    }
  }

  /**
   * C. Schedule Streak Reminder
   */
  async scheduleStreakReminder(timeStr: string): Promise<string | null> {
    await this.cancelNotification('STREAK');

    const perm = await this.getPermissionStatus();
    if (perm !== 'granted') return null;

    const { hour, minute } = this.parseTime(timeStr);

    let title = '🔥 Protect your learning streak';
    let body = 'Complete one study activity today to keep your streak burning.';

    try {
      const streakMetrics = await activityRepository.getStreakMetrics();
      const todayActivities = await activityRepository.getTodayActivities();

      // If user has already performed meaningful learning activity today, do not nag them
      if (todayActivities.length > 0) {
        return null;
      }

      if (streakMetrics.currentStreak > 0) {
        title = '🔥 Protect your learning streak';
        body = `You have a ${streakMetrics.currentStreak}-day learning streak! Complete one activity today to keep it active.`;
      } else {
        title = '🔥 Ignite your learning streak';
        body = 'Complete a topic or practice question today to start a new streak.';
      }
    } catch (err) {
      console.warn('[NotificationService] Smart streak check error:', err);
    }

    const payload: NotificationPayload = {
      type: 'STREAK',
      target_screen: 'Courses',
      title,
      body,
      scheduled_time: timeStr,
    };

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: payload as any,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'learning_reminders',
        },
      });

      await notificationRepository.trackScheduledNotification({
        notification_type: 'STREAK',
        expo_notification_id: notificationId,
        scheduled_time: timeStr,
        title,
        body,
        payload_json: JSON.stringify(payload),
        scheduled_at: new Date().toISOString(),
      });

      return notificationId;
    } catch (err) {
      console.error('[NotificationService] Schedule streak reminder failed:', err);
      return null;
    }
  }

  /**
   * D. Schedule Practice Reminder
   */
  async schedulePracticeReminder(timeStr: string): Promise<string | null> {
    await this.cancelNotification('PRACTICE');

    const perm = await this.getPermissionStatus();
    if (perm !== 'granted') return null;

    const { hour, minute } = this.parseTime(timeStr);

    let title = '⚔️ Time for practice';
    let body = 'Sharpen your coding and problem-solving skills today.';

    try {
      const todayGoals = await motivationRepository.getTodayGoals();
      const practiceGoal = todayGoals.find((g) => g.goal_type === 'PRACTICE_QUESTIONS');

      // If practice goal is already completed, skip reminder
      if (practiceGoal && practiceGoal.is_completed) {
        return null;
      }

      if (practiceGoal) {
        const remaining = Math.max(0, practiceGoal.target - practiceGoal.current);
        title = '⚔️ Time for practice';
        body = `${remaining} practice ${remaining === 1 ? 'challenge remains' : 'challenges remain'} for today's goal.`;
      }
    } catch (err) {
      console.warn('[NotificationService] Smart practice check error:', err);
    }

    const payload: NotificationPayload = {
      type: 'PRACTICE',
      target_screen: 'PracticeLinks',
      title,
      body,
      scheduled_time: timeStr,
    };

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: payload as any,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'practice_reminders',
        },
      });

      await notificationRepository.trackScheduledNotification({
        notification_type: 'PRACTICE',
        expo_notification_id: notificationId,
        scheduled_time: timeStr,
        title,
        body,
        payload_json: JSON.stringify(payload),
        scheduled_at: new Date().toISOString(),
      });

      return notificationId;
    } catch (err) {
      console.error('[NotificationService] Schedule practice reminder failed:', err);
      return null;
    }
  }

  /**
   * E. Schedule Daily Motivation Reminder
   */
  async scheduleMotivationReminder(timeStr: string): Promise<string | null> {
    await this.cancelNotification('MOTIVATION');

    const perm = await this.getPermissionStatus();
    if (perm !== 'granted') return null;

    const { hour, minute } = this.parseTime(timeStr);

    let title = '🌊 Keep moving forward';
    let body = '"Small progress every day creates a strong journey across the Grand Line."';

    try {
      const todayMotivation = await motivationRepository.getTodayMotivation();
      if (todayMotivation) {
        title = '🌊 Daily Wisdom';
        body = `"${todayMotivation.message}"`;
      }
    } catch (err) {
      console.warn('[NotificationService] Smart motivation quote error:', err);
    }

    const payload: NotificationPayload = {
      type: 'MOTIVATION',
      target_screen: 'Motivation',
      title,
      body,
      scheduled_time: timeStr,
    };

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: payload as any,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: 'motivation',
        },
      });

      await notificationRepository.trackScheduledNotification({
        notification_type: 'MOTIVATION',
        expo_notification_id: notificationId,
        scheduled_time: timeStr,
        title,
        body,
        payload_json: JSON.stringify(payload),
        scheduled_at: new Date().toISOString(),
      });

      return notificationId;
    } catch (err) {
      console.error('[NotificationService] Schedule motivation reminder failed:', err);
      return null;
    }
  }

  /**
   * Sends an immediate real Android test notification.
   */
  async sendTestNotification(): Promise<boolean> {
    const perm = await this.getPermissionStatus();
    if (perm !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    await this.createNotificationChannels();

    const payload: NotificationPayload = {
      type: 'TEST',
      target_screen: 'Dashboard',
      title: '⚓ Test notification',
      body: 'Your learning reminder system is working properly.',
    };

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚓ Test notification',
          body: 'Your learning reminder system is working properly on the Grand Line!',
          data: payload as any,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          channelId: 'learning_reminders',
        },
      });
      return true;
    } catch (err) {
      console.error('[NotificationService] Test notification failed:', err);
      return false;
    }
  }

  /**
   * Reschedules all enabled reminders according to persisted notification preferences.
   * Safe to call on app startup and reboot.
   */
  async rescheduleAllNotifications(): Promise<void> {
    await this.init();

    const prefs = await notificationRepository.getPreferences();

    // If master notifications switch is disabled, ensure all alarms are cleared
    if (!prefs.notifications_enabled) {
      await this.cancelAllNotifications();
      return;
    }

    const perm = await this.getPermissionStatus();
    if (perm !== 'granted') {
      return;
    }

    // Reschedule each enabled reminder
    if (prefs.learning_reminder_enabled) {
      await this.scheduleLearningReminder(prefs.learning_reminder_time);
    } else {
      await this.cancelNotification('DAILY_LEARNING');
    }

    if (prefs.goal_reminder_enabled) {
      await this.scheduleGoalReminder(prefs.goal_reminder_time);
    } else {
      await this.cancelNotification('DAILY_GOAL');
    }

    if (prefs.streak_reminder_enabled) {
      await this.scheduleStreakReminder(prefs.streak_reminder_time);
    } else {
      await this.cancelNotification('STREAK');
    }

    if (prefs.practice_reminder_enabled) {
      await this.schedulePracticeReminder(prefs.practice_reminder_time);
    } else {
      await this.cancelNotification('PRACTICE');
    }

    if (prefs.motivation_notification_enabled) {
      await this.scheduleMotivationReminder(prefs.motivation_notification_time);
    } else {
      await this.cancelNotification('MOTIVATION');
    }
  }

  /**
   * Subscribes to notification responses (taps) and deep-links to the target screen.
   */
  setupNotificationResponseListener(navigate: (screen: any, params?: any) => void): () => void {
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      try {
        const data = response.notification.request.content.data as unknown as NotificationPayload;
        if (!data || !data.target_screen) {
          navigate('Dashboard');
          return;
        }

        switch (data.target_screen) {
          case 'ModuleDetails':
            if (data.course_id && data.module_id) {
              const course = await courseRepository.getById(data.course_id);
              if (course) {
                navigate('ModuleDetails', {
                  courseId: data.course_id,
                  moduleId: data.module_id,
                });
                return;
              }
            }
            navigate('Dashboard');
            break;

          case 'DailyLearning':
            navigate('DailyLearning');
            break;

          case 'PracticeLinks':
            navigate('PracticeLinks');
            break;

          case 'Motivation':
            navigate('Motivation');
            break;

          case 'Courses':
            navigate('Courses');
            break;

          case 'Dashboard':
          default:
            navigate('Dashboard');
            break;
        }
      } catch (err) {
        console.warn('[NotificationService] Deep link handling error:', err);
        navigate('Dashboard');
      }
    });

    return () => {
      subscription.remove();
    };
  }
}

export const notificationService = NotificationService.getInstance();
