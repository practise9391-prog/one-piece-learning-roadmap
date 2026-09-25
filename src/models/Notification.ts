export type NotificationType =
  | 'DAILY_LEARNING'
  | 'DAILY_GOAL'
  | 'STREAK'
  | 'PRACTICE'
  | 'MOTIVATION'
  | 'TEST';

export type NotificationChannelId =
  | 'learning_reminders'
  | 'goal_reminders'
  | 'practice_reminders'
  | 'motivation';

export interface NotificationPreferences {
  id: string;
  notifications_enabled: boolean;
  learning_reminder_enabled: boolean;
  learning_reminder_time: string; // e.g. "19:00"
  goal_reminder_enabled: boolean;
  goal_reminder_time: string; // e.g. "20:30"
  streak_reminder_enabled: boolean;
  streak_reminder_time: string; // e.g. "21:00"
  practice_reminder_enabled: boolean;
  practice_reminder_time: string; // e.g. "18:30"
  motivation_notification_enabled: boolean;
  motivation_notification_time: string; // e.g. "08:00"
  updated_at: string;
}

export interface NotificationPayload {
  type: NotificationType;
  course_id?: string;
  module_id?: string;
  target_screen: 'ModuleDetails' | 'DailyLearning' | 'PracticeLinks' | 'Motivation' | 'Dashboard' | 'Courses';
  title: string;
  body: string;
  scheduled_time?: string;
}

export interface ScheduledNotificationRecord {
  notification_type: NotificationType;
  expo_notification_id: string;
  scheduled_time: string;
  title: string;
  body: string;
  payload_json?: string;
  scheduled_at: string;
}
