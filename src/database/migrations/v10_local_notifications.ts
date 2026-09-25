import { SQLiteDatabase } from 'expo-sqlite';

export const v10_local_notifications = {
  version: 10,
  name: 'v10_local_notifications',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Create notification_preferences table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notification_preferences (
        id TEXT PRIMARY KEY NOT NULL,
        notifications_enabled INTEGER NOT NULL DEFAULT 1,
        learning_reminder_enabled INTEGER NOT NULL DEFAULT 1,
        learning_reminder_time TEXT NOT NULL DEFAULT '19:00',
        goal_reminder_enabled INTEGER NOT NULL DEFAULT 1,
        goal_reminder_time TEXT NOT NULL DEFAULT '20:30',
        streak_reminder_enabled INTEGER NOT NULL DEFAULT 1,
        streak_reminder_time TEXT NOT NULL DEFAULT '21:00',
        practice_reminder_enabled INTEGER NOT NULL DEFAULT 1,
        practice_reminder_time TEXT NOT NULL DEFAULT '18:30',
        motivation_notification_enabled INTEGER NOT NULL DEFAULT 1,
        motivation_notification_time TEXT NOT NULL DEFAULT '08:00',
        updated_at TEXT NOT NULL
      );
    `);

    // 2. Seed default notification preferences
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR IGNORE INTO notification_preferences (
        id,
        notifications_enabled,
        learning_reminder_enabled,
        learning_reminder_time,
        goal_reminder_enabled,
        goal_reminder_time,
        streak_reminder_enabled,
        streak_reminder_time,
        practice_reminder_enabled,
        practice_reminder_time,
        motivation_notification_enabled,
        motivation_notification_time,
        updated_at
      ) VALUES ('default', 1, 1, '19:00', 1, '20:30', 1, '21:00', 1, '18:30', 1, '08:00', ?);`,
      [now]
    );

    // 3. Track scheduled notification identifiers for idempotency and reboot recovery
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS scheduled_notifications (
        notification_type TEXT PRIMARY KEY NOT NULL,
        expo_notification_id TEXT NOT NULL,
        scheduled_time TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        payload_json TEXT,
        scheduled_at TEXT NOT NULL
      );
    `);
  },
};
