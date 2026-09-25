import { SQLiteDatabase } from 'expo-sqlite';

export const v5_learning_activity = {
  version: 5,
  name: 'v5_learning_activity',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Create learning_activity table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS learning_activity (
        id TEXT PRIMARY KEY NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT,
        topic_id TEXT,
        activity_type TEXT NOT NULL,
        activity_date TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_activity_date ON learning_activity(activity_date);
      CREATE INDEX IF NOT EXISTS idx_activity_course ON learning_activity(course_id);
      CREATE INDEX IF NOT EXISTS idx_activity_type ON learning_activity(activity_type);
    `);

    // 2. Backfill existing completion records into activity log
    await db.execAsync(`
      INSERT OR IGNORE INTO learning_activity (id, course_id, module_id, topic_id, activity_type, activity_date, created_at)
      SELECT 
        'backfill_mod_' || id,
        course_id,
        id,
        NULL,
        'MODULE_COMPLETED',
        SUBSTR(COALESCE(completed_at, created_at), 1, 10),
        COALESCE(completed_at, created_at)
      FROM modules
      WHERE is_completed = 1;

      INSERT OR IGNORE INTO learning_activity (id, course_id, module_id, topic_id, activity_type, activity_date, created_at)
      SELECT 
        'backfill_top_' || t.id,
        m.course_id,
        t.module_id,
        t.id,
        'TOPIC_COMPLETED',
        SUBSTR(COALESCE(t.completed_at, t.created_at), 1, 10),
        COALESCE(t.completed_at, t.created_at)
      FROM topics t
      JOIN modules m ON m.id = t.module_id
      WHERE t.is_completed = 1;

      INSERT OR IGNORE INTO learning_activity (id, course_id, module_id, topic_id, activity_type, activity_date, created_at)
      SELECT 
        'backfill_note_' || id,
        course_id,
        module_id,
        NULL,
        'NOTE_CREATED',
        SUBSTR(created_at, 1, 10),
        created_at
      FROM notes;
    `);
  },
};
