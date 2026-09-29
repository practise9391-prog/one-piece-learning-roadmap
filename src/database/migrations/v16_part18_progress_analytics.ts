import { SQLiteDatabase } from 'expo-sqlite';

export const v16_part18_progress_analytics = {
  version: 16,
  name: 'v16_part18_progress_analytics',
  up: async (db: SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS progress_snapshots (
        id TEXT PRIMARY KEY NOT NULL,
        snapshot_date TEXT NOT NULL,
        course_id TEXT,
        total_topics INTEGER NOT NULL DEFAULT 0,
        completed_topics INTEGER NOT NULL DEFAULT 0,
        completion_percentage REAL NOT NULL DEFAULT 0.0,
        study_minutes INTEGER NOT NULL DEFAULT 0,
        practice_attempts INTEGER NOT NULL DEFAULT 0,
        practice_correct INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_progress_snapshots_date ON progress_snapshots(snapshot_date);
      CREATE INDEX IF NOT EXISTS idx_progress_snapshots_course ON progress_snapshots(course_id);
    `);
  },
};
