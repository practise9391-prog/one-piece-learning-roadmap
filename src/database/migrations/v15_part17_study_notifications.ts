import { SQLiteDatabase } from 'expo-sqlite';

export const v15_part17_study_notifications = {
  version: 15,
  name: 'v15_part17_study_notifications',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Upgrade notification_preferences table with Part 17 study and alarm columns
    const columnsToAdd: Array<{ name: string; type: string; defaultVal: string }> = [
      { name: 'sound_enabled', type: 'INTEGER NOT NULL', defaultVal: '1' },
      { name: 'vibration_enabled', type: 'INTEGER NOT NULL', defaultVal: '1' },
      { name: 'study_start_reminder_enabled', type: 'INTEGER NOT NULL', defaultVal: '1' },
      { name: 'advance_reminder_minutes', type: 'INTEGER NOT NULL', defaultVal: '15' },
      { name: 'morning_plan_reminder_enabled', type: 'INTEGER NOT NULL', defaultVal: '1' },
      { name: 'morning_plan_reminder_time', type: 'TEXT NOT NULL', defaultVal: "'08:00'" },
      { name: 'evening_unfinished_reminder_enabled', type: 'INTEGER NOT NULL', defaultVal: '1' },
      { name: 'evening_unfinished_reminder_time', type: 'TEXT NOT NULL', defaultVal: "'21:00'" },
      { name: 'weekly_reminder_enabled', type: 'INTEGER NOT NULL', defaultVal: '1' },
      { name: 'weekly_reminder_day', type: 'TEXT NOT NULL', defaultVal: "'Sunday'" },
      { name: 'weekly_reminder_time', type: 'TEXT NOT NULL', defaultVal: "'18:00'" },
      { name: 'monthly_reminder_enabled', type: 'INTEGER NOT NULL', defaultVal: '1' },
      { name: 'monthly_reminder_time', type: 'TEXT NOT NULL', defaultVal: "'19:00'" },
      { name: 'alarm_enabled', type: 'INTEGER NOT NULL', defaultVal: '0' },
      { name: 'alarm_time', type: 'TEXT NOT NULL', defaultVal: "'19:00'" },
      { name: 'alarm_sound', type: 'TEXT NOT NULL', defaultVal: "'default'" },
      { name: 'snooze_interval_minutes', type: 'INTEGER NOT NULL', defaultVal: '10' },
      { name: 'multiple_study_times_enabled', type: 'INTEGER NOT NULL', defaultVal: '0' },
      { name: 'morning_study_time', type: 'TEXT NOT NULL', defaultVal: "'07:00'" },
      { name: 'morning_study_enabled', type: 'INTEGER NOT NULL', defaultVal: '1' },
      { name: 'afternoon_study_time', type: 'TEXT NOT NULL', defaultVal: "'13:00'" },
      { name: 'afternoon_study_enabled', type: 'INTEGER NOT NULL', defaultVal: '0' },
      { name: 'evening_study_time', type: 'TEXT NOT NULL', defaultVal: "'19:00'" },
      { name: 'evening_study_enabled', type: 'INTEGER NOT NULL', defaultVal: '1' },
      { name: 'persistent_notification_enabled', type: 'INTEGER NOT NULL', defaultVal: '0' },
    ];

    for (const col of columnsToAdd) {
      try {
        await db.execAsync(
          `ALTER TABLE notification_preferences ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.defaultVal};`
        );
      } catch (err: any) {
        // Ignore column already exists error for idempotent runs
        if (!err?.message?.includes('duplicate column name') && !err?.message?.includes('already exists')) {
          console.warn(`[v15 Migration] Error adding column ${col.name}:`, err);
        }
      }
    }

    // 2. Create notification_history table for auditing, tracking, and anti-spam (Section 22 & 23)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notification_history (
        id TEXT PRIMARY KEY NOT NULL,
        notification_type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        course_id TEXT,
        module_id TEXT,
        topic_id TEXT,
        scheduled_at TEXT,
        shown_at TEXT,
        opened_at TEXT,
        dismissed_at TEXT,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_notification_history_type ON notification_history(notification_type);
      CREATE INDEX IF NOT EXISTS idx_notification_history_status ON notification_history(status);
      CREATE INDEX IF NOT EXISTS idx_notification_history_created ON notification_history(created_at);
    `);

    // 3. Create scheduled_notifications_v2 table for deterministic scheduling and restart restoration (Section 24 & 25)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS scheduled_notifications_v2 (
        id TEXT PRIMARY KEY NOT NULL,
        notification_type TEXT NOT NULL,
        course_id TEXT,
        module_id TEXT,
        topic_id TEXT,
        scheduled_time TEXT NOT NULL,
        repeat_type TEXT NOT NULL DEFAULT 'DAILY',
        enabled INTEGER NOT NULL DEFAULT 1,
        notification_id TEXT NOT NULL,
        payload_json TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_type ON scheduled_notifications_v2(notification_type);
      CREATE INDEX IF NOT EXISTS idx_scheduled_notifications_enabled ON scheduled_notifications_v2(enabled);
    `);
  },
};
