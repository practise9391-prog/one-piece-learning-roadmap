import { SQLiteDatabase } from 'expo-sqlite';

export const v4_course_journey_and_completion = {
  version: 4,
  name: 'v4_course_journey_and_completion',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Add course lifecycle columns if not already present
    try {
      await db.execAsync('ALTER TABLE courses ADD COLUMN started_at TEXT;');
    } catch {
      // safe to ignore
    }

    try {
      await db.execAsync('ALTER TABLE courses ADD COLUMN completed_at TEXT;');
    } catch {
      // safe to ignore
    }

    try {
      await db.execAsync('ALTER TABLE courses ADD COLUMN introduction_completed INTEGER NOT NULL DEFAULT 0;');
    } catch {
      // safe to ignore
    }

    try {
      await db.execAsync('ALTER TABLE courses ADD COLUMN welcome_title TEXT;');
    } catch {
      // safe to ignore
    }

    try {
      await db.execAsync('ALTER TABLE courses ADD COLUMN welcome_description TEXT;');
    } catch {
      // safe to ignore
    }

    // 2. Backfill existing progress safely
    await db.execAsync(`
      UPDATE courses
      SET started_at = created_at,
          introduction_completed = 1
      WHERE (completed_modules > 0 OR progress_percentage > 0) AND started_at IS NULL;

      UPDATE courses
      SET completed_at = updated_at
      WHERE is_completed = 1 AND completed_at IS NULL;
    `);
  },
};
