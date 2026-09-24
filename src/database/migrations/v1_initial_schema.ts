import { SQLiteDatabase } from 'expo-sqlite';
import { INITIAL_COURSES } from '../seeds/initialCourses';

export const v1_initial_schema = {
  version: 1,
  name: 'v1_initial_schema',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Create courses table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        theme TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        total_modules INTEGER NOT NULL DEFAULT 0,
        completed_modules INTEGER NOT NULL DEFAULT 0,
        progress_percentage REAL NOT NULL DEFAULT 0.0,
        is_completed INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 2. Create modules table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS modules (
        id TEXT PRIMARY KEY NOT NULL,
        course_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
      );
    `);

    // 3. Create notes table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT,
        note_text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE
      );
    `);

    // 4. Create user_progress table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id TEXT PRIMARY KEY NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'not_started',
        completed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE,
        UNIQUE(course_id, module_id)
      );
    `);

    // 5. Create performance indexes
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
      CREATE INDEX IF NOT EXISTS idx_notes_course_id ON notes(course_id);
      CREATE INDEX IF NOT EXISTS idx_notes_module_id ON notes(module_id);
      CREATE INDEX IF NOT EXISTS idx_user_progress_course_module ON user_progress(course_id, module_id);
    `);

    // 6. Seed initial courses
    const now = new Date().toISOString();
    for (const course of INITIAL_COURSES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO courses (
          id, name, description, icon, theme, order_index,
          total_modules, completed_modules, progress_percentage,
          is_completed, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0.0, 0, ?, ?)`,
        [
          course.id,
          course.name,
          course.description,
          course.icon,
          course.theme,
          course.order_index,
          now,
          now,
        ]
      );
    }
  },
};

