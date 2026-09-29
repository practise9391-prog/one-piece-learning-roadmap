import { DatabaseManager } from '../database/DatabaseManager';
import {
  NotificationPreferences,
  NotificationType,
  NotificationHistory,
  NotificationHistoryStatus,
  ScheduledNotificationItem,
  ScheduledNotificationRecord,
} from '../models/Notification';
import { StudyPlan } from '../models/StudyPlan';
import { studyPlanRepository, getTodayDateString, getWeekBounds } from './StudyPlanRepository';
import { activityRepository } from './ActivityRepository';
import { generateId } from '../utils/idGenerator';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class NotificationRepository {
  private db = DatabaseManager.getInstance();

  /**
   * Retrieves user notification preferences, creating defaults if not present.
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<any>(
      'SELECT * FROM notification_preferences WHERE id = ?;',
      ['default']
    );

    if (row) {
      return {
        id: row.id,
        notifications_enabled: row.notifications_enabled === 1,
        learning_reminder_enabled: row.learning_reminder_enabled === 1,
        learning_reminder_time: row.learning_reminder_time || '19:00',
        goal_reminder_enabled: row.goal_reminder_enabled === 1,
        goal_reminder_time: row.goal_reminder_time || '20:30',
        streak_reminder_enabled: row.streak_reminder_enabled === 1,
        streak_reminder_time: row.streak_reminder_time || '21:00',
        practice_reminder_enabled: row.practice_reminder_enabled === 1,
        practice_reminder_time: row.practice_reminder_time || '18:30',
        motivation_notification_enabled: row.motivation_notification_enabled === 1,
        motivation_notification_time: row.motivation_notification_time || '08:00',

        // Part 17 fields with sensible fallbacks
        sound_enabled: row.sound_enabled !== undefined ? row.sound_enabled === 1 : true,
        vibration_enabled: row.vibration_enabled !== undefined ? row.vibration_enabled === 1 : true,
        study_start_reminder_enabled: row.study_start_reminder_enabled !== undefined ? row.study_start_reminder_enabled === 1 : true,
        advance_reminder_minutes: row.advance_reminder_minutes ?? 15,
        morning_plan_reminder_enabled: row.morning_plan_reminder_enabled !== undefined ? row.morning_plan_reminder_enabled === 1 : true,
        morning_plan_reminder_time: row.morning_plan_reminder_time || '08:00',
        evening_unfinished_reminder_enabled: row.evening_unfinished_reminder_enabled !== undefined ? row.evening_unfinished_reminder_enabled === 1 : true,
        evening_unfinished_reminder_time: row.evening_unfinished_reminder_time || '21:00',
        weekly_reminder_enabled: row.weekly_reminder_enabled !== undefined ? row.weekly_reminder_enabled === 1 : true,
        weekly_reminder_day: row.weekly_reminder_day || 'Sunday',
        weekly_reminder_time: row.weekly_reminder_time || '18:00',
        monthly_reminder_enabled: row.monthly_reminder_enabled !== undefined ? row.monthly_reminder_enabled === 1 : true,
        monthly_reminder_time: row.monthly_reminder_time || '19:00',
        alarm_enabled: row.alarm_enabled !== undefined ? row.alarm_enabled === 1 : false,
        alarm_time: row.alarm_time || '19:00',
        alarm_sound: row.alarm_sound || 'default',
        snooze_interval_minutes: row.snooze_interval_minutes ?? 10,
        multiple_study_times_enabled: row.multiple_study_times_enabled !== undefined ? row.multiple_study_times_enabled === 1 : false,
        morning_study_time: row.morning_study_time || '07:00',
        morning_study_enabled: row.morning_study_enabled !== undefined ? row.morning_study_enabled === 1 : true,
        afternoon_study_time: row.afternoon_study_time || '13:00',
        afternoon_study_enabled: row.afternoon_study_enabled !== undefined ? row.afternoon_study_enabled === 1 : false,
        evening_study_time: row.evening_study_time || '19:00',
        evening_study_enabled: row.evening_study_enabled !== undefined ? row.evening_study_enabled === 1 : true,
        persistent_notification_enabled: row.persistent_notification_enabled !== undefined ? row.persistent_notification_enabled === 1 : false,

        updated_at: row.updated_at || new Date().toISOString(),
      };
    }

    const now = new Date().toISOString();
    const defaultPrefs: NotificationPreferences = {
      id: 'default',
      notifications_enabled: true,
      learning_reminder_enabled: true,
      learning_reminder_time: '19:00',
      goal_reminder_enabled: true,
      goal_reminder_time: '20:30',
      streak_reminder_enabled: true,
      streak_reminder_time: '21:00',
      practice_reminder_enabled: true,
      practice_reminder_time: '18:30',
      motivation_notification_enabled: true,
      motivation_notification_time: '08:00',

      sound_enabled: true,
      vibration_enabled: true,
      study_start_reminder_enabled: true,
      advance_reminder_minutes: 15,
      morning_plan_reminder_enabled: true,
      morning_plan_reminder_time: '08:00',
      evening_unfinished_reminder_enabled: true,
      evening_unfinished_reminder_time: '21:00',
      weekly_reminder_enabled: true,
      weekly_reminder_day: 'Sunday',
      weekly_reminder_time: '18:00',
      monthly_reminder_enabled: true,
      monthly_reminder_time: '19:00',
      alarm_enabled: false,
      alarm_time: '19:00',
      alarm_sound: 'default',
      snooze_interval_minutes: 10,
      multiple_study_times_enabled: false,
      morning_study_time: '07:00',
      morning_study_enabled: true,
      afternoon_study_time: '13:00',
      afternoon_study_enabled: false,
      evening_study_time: '19:00',
      evening_study_enabled: true,
      persistent_notification_enabled: false,

      updated_at: now,
    };

    await database.runAsync(
      `INSERT OR IGNORE INTO notification_preferences (
        id, notifications_enabled, learning_reminder_enabled, learning_reminder_time,
        goal_reminder_enabled, goal_reminder_time, streak_reminder_enabled, streak_reminder_time,
        practice_reminder_enabled, practice_reminder_time, motivation_notification_enabled, motivation_notification_time,
        sound_enabled, vibration_enabled, study_start_reminder_enabled, advance_reminder_minutes,
        morning_plan_reminder_enabled, morning_plan_reminder_time, evening_unfinished_reminder_enabled,
        evening_unfinished_reminder_time, weekly_reminder_enabled, weekly_reminder_day, weekly_reminder_time,
        monthly_reminder_enabled, monthly_reminder_time, alarm_enabled, alarm_time, alarm_sound,
        snooze_interval_minutes, multiple_study_times_enabled, morning_study_time, morning_study_enabled,
        afternoon_study_time, afternoon_study_enabled, evening_study_time, evening_study_enabled,
        persistent_notification_enabled, updated_at
      ) VALUES (
        'default', 1, 1, '19:00', 1, '20:30', 1, '21:00', 1, '18:30', 1, '08:00',
        1, 1, 1, 15, 1, '08:00', 1, '21:00', 1, 'Sunday', '18:00',
        1, '19:00', 0, '19:00', 'default', 10, 0, '07:00', 1, '13:00', 0, '19:00', 1, 0, ?
      );`,
      [now]
    );

    return defaultPrefs;
  }

  /**
   * Updates notification preferences with validation.
   */
  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const database = await this.db.getDatabase();
    const current = await this.getPreferences();
    const now = new Date().toISOString();

    const updated: NotificationPreferences = {
      ...current,
      ...prefs,
      updated_at: now,
    };

    await database.runAsync(
      `UPDATE notification_preferences SET
        notifications_enabled = ?,
        learning_reminder_enabled = ?,
        learning_reminder_time = ?,
        goal_reminder_enabled = ?,
        goal_reminder_time = ?,
        streak_reminder_enabled = ?,
        streak_reminder_time = ?,
        practice_reminder_enabled = ?,
        practice_reminder_time = ?,
        motivation_notification_enabled = ?,
        motivation_notification_time = ?,
        sound_enabled = ?,
        vibration_enabled = ?,
        study_start_reminder_enabled = ?,
        advance_reminder_minutes = ?,
        morning_plan_reminder_enabled = ?,
        morning_plan_reminder_time = ?,
        evening_unfinished_reminder_enabled = ?,
        evening_unfinished_reminder_time = ?,
        weekly_reminder_enabled = ?,
        weekly_reminder_day = ?,
        weekly_reminder_time = ?,
        monthly_reminder_enabled = ?,
        monthly_reminder_time = ?,
        alarm_enabled = ?,
        alarm_time = ?,
        alarm_sound = ?,
        snooze_interval_minutes = ?,
        multiple_study_times_enabled = ?,
        morning_study_time = ?,
        morning_study_enabled = ?,
        afternoon_study_time = ?,
        afternoon_study_enabled = ?,
        evening_study_time = ?,
        evening_study_enabled = ?,
        persistent_notification_enabled = ?,
        updated_at = ?
      WHERE id = 'default';`,
      [
        updated.notifications_enabled ? 1 : 0,
        updated.learning_reminder_enabled ? 1 : 0,
        updated.learning_reminder_time,
        updated.goal_reminder_enabled ? 1 : 0,
        updated.goal_reminder_time,
        updated.streak_reminder_enabled ? 1 : 0,
        updated.streak_reminder_time,
        updated.practice_reminder_enabled ? 1 : 0,
        updated.practice_reminder_time,
        updated.motivation_notification_enabled ? 1 : 0,
        updated.motivation_notification_time,
        updated.sound_enabled ? 1 : 0,
        updated.vibration_enabled ? 1 : 0,
        updated.study_start_reminder_enabled ? 1 : 0,
        updated.advance_reminder_minutes,
        updated.morning_plan_reminder_enabled ? 1 : 0,
        updated.morning_plan_reminder_time,
        updated.evening_unfinished_reminder_enabled ? 1 : 0,
        updated.evening_unfinished_reminder_time,
        updated.weekly_reminder_enabled ? 1 : 0,
        updated.weekly_reminder_day,
        updated.weekly_reminder_time,
        updated.monthly_reminder_enabled ? 1 : 0,
        updated.monthly_reminder_time,
        updated.alarm_enabled ? 1 : 0,
        updated.alarm_time,
        updated.alarm_sound,
        updated.snooze_interval_minutes,
        updated.multiple_study_times_enabled ? 1 : 0,
        updated.morning_study_time,
        updated.morning_study_enabled ? 1 : 0,
        updated.afternoon_study_time,
        updated.afternoon_study_enabled ? 1 : 0,
        updated.evening_study_time,
        updated.evening_study_enabled ? 1 : 0,
        updated.persistent_notification_enabled ? 1 : 0,
        now,
      ]
    );

    return updated;
  }

  // =========================================================================
  // NOTIFICATION HISTORY & ANTI-SPAM (Section 22 & 23)
  // =========================================================================

  async recordHistory(event: {
    notification_type: NotificationType;
    title: string;
    message: string;
    course_id?: string | null;
    module_id?: string | null;
    topic_id?: string | null;
    scheduled_at?: string | null;
    status?: NotificationHistoryStatus;
  }): Promise<string> {
    const database = await this.db.getDatabase();
    const id = generateId('nh');
    const now = getCurrentTimestamp();

    await database.runAsync(
      `INSERT INTO notification_history (
        id, notification_type, title, message, course_id, module_id, topic_id,
        scheduled_at, shown_at, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        event.notification_type,
        event.title,
        event.message,
        event.course_id || null,
        event.module_id || null,
        event.topic_id || null,
        event.scheduled_at || now,
        event.status === 'SHOWN' ? now : null,
        event.status || 'SCHEDULED',
        now,
      ]
    );

    return id;
  }

  async updateHistoryStatus(
    id: string,
    status: NotificationHistoryStatus,
    timestampField?: 'shown_at' | 'opened_at' | 'dismissed_at'
  ): Promise<void> {
    const database = await this.db.getDatabase();
    const now = getCurrentTimestamp();

    if (timestampField) {
      await database.runAsync(
        `UPDATE notification_history SET status = ?, ${timestampField} = ? WHERE id = ?;`,
        [status, now, id]
      );
    } else {
      await database.runAsync(
        'UPDATE notification_history SET status = ? WHERE id = ?;',
        [status, id]
      );
    }
  }

  async getNotificationHistory(limit: number = 20): Promise<NotificationHistory[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM notification_history ORDER BY created_at DESC LIMIT ?;`,
      [limit]
    );

    return rows.map((r) => ({
      id: r.id,
      notification_type: r.notification_type as NotificationType,
      title: r.title,
      message: r.message,
      course_id: r.course_id,
      module_id: r.module_id,
      topic_id: r.topic_id,
      scheduled_at: r.scheduled_at,
      shown_at: r.shown_at,
      opened_at: r.opened_at,
      dismissed_at: r.dismissed_at,
      status: r.status as NotificationHistoryStatus,
      created_at: r.created_at,
    }));
  }

  async getRecentHistoryByType(type: NotificationType, hoursAgo: number = 24): Promise<NotificationHistory[]> {
    const database = await this.db.getDatabase();
    const since = new Date(Date.now() - hoursAgo * 3600 * 1000).toISOString();

    const rows = await database.getAllAsync<any>(
      `SELECT * FROM notification_history 
       WHERE notification_type = ? AND created_at >= ?
       ORDER BY created_at DESC;`,
      [type, since]
    );

    return rows.map((r) => ({
      id: r.id,
      notification_type: r.notification_type as NotificationType,
      title: r.title,
      message: r.message,
      course_id: r.course_id,
      module_id: r.module_id,
      topic_id: r.topic_id,
      scheduled_at: r.scheduled_at,
      shown_at: r.shown_at,
      opened_at: r.opened_at,
      dismissed_at: r.dismissed_at,
      status: r.status as NotificationHistoryStatus,
      created_at: r.created_at,
    }));
  }

  // =========================================================================
  // SCHEDULED NOTIFICATIONS (v2) (Section 24 & 25)
  // =========================================================================

  async saveScheduledNotification(item: ScheduledNotificationItem): Promise<void> {
    const database = await this.db.getDatabase();
    const now = getCurrentTimestamp();

    await database.runAsync(
      `INSERT INTO scheduled_notifications_v2 (
        id, notification_type, course_id, module_id, topic_id, scheduled_time,
        repeat_type, enabled, notification_id, payload_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        notification_type = excluded.notification_type,
        course_id = excluded.course_id,
        module_id = excluded.module_id,
        topic_id = excluded.topic_id,
        scheduled_time = excluded.scheduled_time,
        repeat_type = excluded.repeat_type,
        enabled = excluded.enabled,
        notification_id = excluded.notification_id,
        payload_json = excluded.payload_json,
        updated_at = excluded.updated_at;`,
      [
        item.id,
        item.notification_type,
        item.course_id || null,
        item.module_id || null,
        item.topic_id || null,
        item.scheduled_time,
        item.repeat_type,
        item.enabled ? 1 : 0,
        item.notification_id,
        item.payload_json || null,
        item.created_at || now,
        now,
      ]
    );
  }

  async getScheduledNotifications(): Promise<ScheduledNotificationItem[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM scheduled_notifications_v2 ORDER BY scheduled_time ASC;`
    );

    return rows.map((r) => ({
      id: r.id,
      notification_type: r.notification_type as NotificationType,
      course_id: r.course_id,
      module_id: r.module_id,
      topic_id: r.topic_id,
      scheduled_time: r.scheduled_time,
      repeat_type: r.repeat_type,
      enabled: r.enabled === 1,
      notification_id: r.notification_id,
      payload_json: r.payload_json,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  }

  async removeScheduledNotificationById(id: string): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync('DELETE FROM scheduled_notifications_v2 WHERE id = ?;', [id]);
  }

  async clearAllScheduledNotifications(): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync('DELETE FROM scheduled_notifications_v2;');
    await database.runAsync('DELETE FROM scheduled_notifications;');
  }

  // =========================================================================
  // REAL STUDY PLAN & PROGRESS QUERY HELPERS (Section 33 & 46)
  // =========================================================================

  async getTodayStudyPlan(): Promise<StudyPlan | null> {
    return studyPlanRepository.getDailyPlan(getTodayDateString());
  }

  async getTodayStudySessionsTotal(): Promise<number> {
    const database = await this.db.getDatabase();
    const today = getTodayDateString();
    const row = await database.getFirstAsync<{ total_minutes: number }>(
      `SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes 
       FROM study_sessions 
       WHERE date = ?;`,
      [today]
    );
    return row?.total_minutes || 0;
  }

  async getWeeklyProgressData(): Promise<{ completedMinutes: number; plannedMinutes: number; remainingTopics: number }> {
    const { weekStart, weekEnd } = getWeekBounds();
    const weeklyPlan = await studyPlanRepository.getWeeklyPlan(weekStart);
    if (weeklyPlan) {
      const remaining = Math.max(0, weeklyPlan.plannedTopics - weeklyPlan.completedTopics);
      return {
        completedMinutes: weeklyPlan.completedMinutes,
        plannedMinutes: weeklyPlan.plannedMinutes || 600, // 10h default
        remainingTopics: remaining,
      };
    }

    // Fallback: Query sessions directly for this week
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{ total_minutes: number }>(
      `SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes 
       FROM study_sessions 
       WHERE date >= ? AND date <= ?;`,
      [weekStart, weekEnd]
    );

    return {
      completedMinutes: row?.total_minutes || 0,
      plannedMinutes: 600,
      remainingTopics: 3,
    };
  }

  async getMonthlyProgressData(): Promise<{ completedMinutes: number; plannedMinutes: number; percentage: number }> {
    const now = new Date();
    const monthlySummary = await studyPlanRepository.getMonthlySummary(now.getFullYear(), now.getMonth() + 1);
    if (monthlySummary) {
      return {
        completedMinutes: monthlySummary.completedMinutes,
        plannedMinutes: monthlySummary.plannedMinutes || 2400,
        percentage: monthlySummary.progressPercentage,
      };
    }

    const database = await this.db.getDatabase();
    const monthPattern = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-%`;
    const row = await database.getFirstAsync<{ total_minutes: number }>(
      `SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes 
       FROM study_sessions 
       WHERE date LIKE ?;`,
      [monthPattern]
    );

    const completed = row?.total_minutes || 0;
    const planned = 2400; // 40h default
    return {
      completedMinutes: completed,
      plannedMinutes: planned,
      percentage: Math.min(100, Math.round((completed / planned) * 100)),
    };
  }

  async getStreakDays(): Promise<number> {
    const metrics = await activityRepository.getStreakMetrics();
    return metrics.currentStreak;
  }

  async getActiveGoals(): Promise<any[]> {
    return studyPlanRepository.getGoals();
  }

  // =========================================================================
  // BACKWARD COMPATIBILITY HELPERS (Part 12)
  // =========================================================================

  async trackScheduledNotification(record: ScheduledNotificationRecord): Promise<void> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    await database.runAsync(
      `INSERT INTO scheduled_notifications (
        notification_type, expo_notification_id, scheduled_time, title, body, payload_json, scheduled_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(notification_type) DO UPDATE SET
        expo_notification_id = excluded.expo_notification_id,
        scheduled_time = excluded.scheduled_time,
        title = excluded.title,
        body = excluded.body,
        payload_json = excluded.payload_json,
        scheduled_at = excluded.scheduled_at;`,
      [
        record.notification_type,
        record.expo_notification_id,
        record.scheduled_time,
        record.title,
        record.body,
        record.payload_json || null,
        now,
      ]
    );
  }

  async getScheduledNotification(type: NotificationType): Promise<ScheduledNotificationRecord | null> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<ScheduledNotificationRecord>(
      'SELECT * FROM scheduled_notifications WHERE notification_type = ?;',
      [type]
    );
    return row || null;
  }

  async removeScheduledNotification(type: NotificationType): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(
      'DELETE FROM scheduled_notifications WHERE notification_type = ?;',
      [type]
    );
  }

  async resetPreferences(): Promise<void> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();
    await database.runAsync(
      `UPDATE notification_preferences SET
        notifications_enabled = 1,
        learning_reminder_enabled = 1,
        learning_reminder_time = '19:00',
        goal_reminder_enabled = 1,
        goal_reminder_time = '20:30',
        streak_reminder_enabled = 1,
        streak_reminder_time = '21:00',
        practice_reminder_enabled = 1,
        practice_reminder_time = '18:30',
        motivation_notification_enabled = 1,
        motivation_notification_time = '08:00',
        sound_enabled = 1,
        vibration_enabled = 1,
        study_start_reminder_enabled = 1,
        advance_reminder_minutes = 15,
        morning_plan_reminder_enabled = 1,
        morning_plan_reminder_time = '08:00',
        evening_unfinished_reminder_enabled = 1,
        evening_unfinished_reminder_time = '21:00',
        weekly_reminder_enabled = 1,
        weekly_reminder_day = 'Sunday',
        weekly_reminder_time = '18:00',
        monthly_reminder_enabled = 1,
        monthly_reminder_time = '19:00',
        alarm_enabled = 0,
        alarm_time = '19:00',
        alarm_sound = 'default',
        snooze_interval_minutes = 10,
        multiple_study_times_enabled = 0,
        morning_study_time = '07:00',
        morning_study_enabled = 1,
        afternoon_study_time = '13:00',
        afternoon_study_enabled = 0,
        evening_study_time = '19:00',
        evening_study_enabled = 1,
        persistent_notification_enabled = 0,
        updated_at = ?
      WHERE id = 'default';`,
      [now]
    );
    await this.clearAllScheduledNotifications();
  }
}

export const notificationRepository = new NotificationRepository();
