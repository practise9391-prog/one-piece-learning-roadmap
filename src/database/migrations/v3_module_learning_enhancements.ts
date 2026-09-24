import { SQLiteDatabase } from 'expo-sqlite';

export const v3_module_learning_enhancements = {
  version: 3,
  name: 'v3_module_learning_enhancements',
  up: async (db: SQLiteDatabase): Promise<void> => {
    try {
      await db.execAsync('ALTER TABLE modules ADD COLUMN last_opened_topic_id TEXT;');
    } catch {
      // safe to ignore
    }

    try {
      await db.execAsync('ALTER TABLE topics ADD COLUMN content TEXT;');
    } catch {
      // safe to ignore
    }

    try {
      await db.execAsync(
        'CREATE INDEX IF NOT EXISTS idx_notes_course_module ON notes(course_id, module_id);'
      );
    } catch {
      // safe to ignore
    }

    try {
      await db.execAsync('ALTER TABLE user_progress ADD COLUMN last_opened_topic_id TEXT;');
    } catch {
      // safe to ignore
    }
  },
};
