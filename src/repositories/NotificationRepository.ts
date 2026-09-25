import { DatabaseManager } from '../database/DatabaseManager';
import {
  NotificationPreferences,
  NotificationType,
  ScheduledNotificationRecord,
} from '../models/Notification';

export class NotificationRepository {
  private db = DatabaseManager.getInstance();

  /**
   * Retrieves user notification preferences, creating defaults if not present.
   */
  async getPreferences(): Promise<NotificationPreferences> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{
      id: string;
      notifications_enabled: number;
      learning_reminder_enabled: number;
      learning_reminder_time: string;
      goal_reminder_enabled: number;
      goal_reminder_time: string;
      streak_reminder_enabled: number;
      streak_reminder_time: string;
      practice_reminder_enabled: number;
      practice_reminder_time: string;
      motivation_notification_enabled: number;
      motivation_notification_time: string;
      updated_at: string;
    }>('SELECT * FROM notification_preferences WHERE id = ?;', ['default']);

    if (row) {
      return {
        id: row.id,
        notifications_enabled: row.notifications_enabled === 1,
        learning_reminder_enabled: row.learning_reminder_enabled === 1,
        learning_reminder_time: row.learning_reminder_time,
        goal_reminder_enabled: row.goal_reminder_enabled === 1,
        goal_reminder_time: row.goal_reminder_time,
        streak_reminder_enabled: row.streak_reminder_enabled === 1,
        streak_reminder_time: row.streak_reminder_time,
        practice_reminder_enabled: row.practice_reminder_enabled === 1,
        practice_reminder_time: row.practice_reminder_time,
        motivation_notification_enabled: row.motivation_notification_enabled === 1,
        motivation_notification_time: row.motivation_notification_time,
        updated_at: row.updated_at,
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
      updated_at: now,
    };

    await database.runAsync(
      `INSERT OR IGNORE INTO notification_preferences (
        id, notifications_enabled, learning_reminder_enabled, learning_reminder_time,
        goal_reminder_enabled, goal_reminder_time, streak_reminder_enabled, streak_reminder_time,
        practice_reminder_enabled, practice_reminder_time, motivation_notification_enabled, motivation_notification_time, updated_at
      ) VALUES ('default', 1, 1, '19:00', 1, '20:30', 1, '21:00', 1, '18:30', 1, '08:00', ?);`,
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
        now,
      ]
    );

    return updated;
  }

  /**
   * Tracks scheduled notification IDs for cancellation and duplicate prevention.
   */
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

  async getAllScheduledNotifications(): Promise<ScheduledNotificationRecord[]> {
    const database = await this.db.getDatabase();
    return database.getAllAsync<ScheduledNotificationRecord>(
      'SELECT * FROM scheduled_notifications ORDER BY notification_type ASC;'
    );
  }

  async removeScheduledNotification(type: NotificationType): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(
      'DELETE FROM scheduled_notifications WHERE notification_type = ?;',
      [type]
    );
  }

  async clearAllScheduledNotifications(): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync('DELETE FROM scheduled_notifications;');
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
        updated_at = ?
      WHERE id = 'default';`,
      [now]
    );
    await this.clearAllScheduledNotifications();
  }
}

export const notificationRepository = new NotificationRepository();
