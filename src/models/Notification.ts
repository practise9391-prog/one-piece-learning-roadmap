import { RootScreen } from '../navigation/types';

export type NotificationType =
  | 'DAILY_STUDY_REMINDER'
  | 'STUDY_START_REMINDER'
  | 'MORNING_PLAN_REMINDER'
  | 'EVENING_UNFINISHED_REMINDER'
  | 'GOAL_REMINDER'
  | 'GOAL_COMPLETED'
  | 'WEEKLY_SUMMARY'
  | 'MONTHLY_SUMMARY'
  | 'STREAK_REMINDER'
  | 'STUDY_ALARM'
  | 'SNOOZE_REMINDER'
  | 'FOCUS_COMPLETION'
  | 'DAILY_LEARNING'
  | 'DAILY_GOAL'
  | 'STREAK'
  | 'PRACTICE'
  | 'MOTIVATION'
  | 'TEST';

export type NotificationChannelId =
  | 'study_reminders'
  | 'study_alarm'
  | 'goal_reminders'
  | 'weekly_monthly_summary'
  | 'daily_motivation'
  | 'learning_reminders'
  | 'practice_reminders'
  | 'motivation';

export type NotificationHistoryStatus =
  | 'SCHEDULED'
  | 'SHOWN'
  | 'OPENED'
  | 'DISMISSED'
  | 'SNOOZED'
  | 'CANCELLED';

export type NotificationRepeatType =
  | 'ONCE'
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'CUSTOM';

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

  // Part 17 Study Reminders & Alarm Extensions
  sound_enabled: boolean;
  vibration_enabled: boolean;
  study_start_reminder_enabled: boolean;
  advance_reminder_minutes: number; // 0, 5, 10, 15, 30, 60
  morning_plan_reminder_enabled: boolean;
  morning_plan_reminder_time: string; // e.g. "08:00"
  evening_unfinished_reminder_enabled: boolean;
  evening_unfinished_reminder_time: string; // e.g. "21:00"
  weekly_reminder_enabled: boolean;
  weekly_reminder_day: string; // e.g. "Sunday"
  weekly_reminder_time: string; // e.g. "18:00"
  monthly_reminder_enabled: boolean;
  monthly_reminder_time: string; // e.g. "19:00"
  alarm_enabled: boolean;
  alarm_time: string; // e.g. "19:00"
  alarm_sound: string; // "default" | "alarm"
  snooze_interval_minutes: number; // 10, 20, 30
  multiple_study_times_enabled: boolean;
  morning_study_time: string; // e.g. "07:00"
  morning_study_enabled: boolean;
  afternoon_study_time: string; // e.g. "13:00"
  afternoon_study_enabled: boolean;
  evening_study_time: string; // e.g. "19:00"
  evening_study_enabled: boolean;
  persistent_notification_enabled: boolean;

  updated_at: string;
}

export type StudyNotificationPreferences = NotificationPreferences;

export interface NotificationPayload {
  type: NotificationType;
  course_id?: string;
  module_id?: string;
  topic_id?: string;
  target_screen: RootScreen;
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

export interface ScheduledNotificationItem {
  id: string;
  notification_type: NotificationType;
  course_id?: string | null;
  module_id?: string | null;
  topic_id?: string | null;
  scheduled_time: string;
  repeat_type: NotificationRepeatType;
  enabled: boolean;
  notification_id: string;
  payload_json?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationHistory {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  course_id?: string | null;
  module_id?: string | null;
  topic_id?: string | null;
  scheduled_at?: string | null;
  shown_at?: string | null;
  opened_at?: string | null;
  dismissed_at?: string | null;
  status: NotificationHistoryStatus;
  created_at: string;
}

export interface NotificationDecisionResult {
  type: NotificationType;
  title: string;
  message: string;
  courseId?: string;
  moduleId?: string;
  topicId?: string;
  targetScreen: RootScreen;
  channelId: NotificationChannelId;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  isAlarm?: boolean;
}
