import { SQLiteDatabase } from 'expo-sqlite';

export const v13_part15_daily_learning = {
  version: 13,
  name: 'v13_part15_daily_learning',
  up: async (db: SQLiteDatabase): Promise<void> => {
    const now = new Date().toISOString();

    // 1. Create daily learning plans table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_learning_plans (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL,
        planned_minutes INTEGER NOT NULL DEFAULT 120,
        completed_minutes INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PLANNED',
        completion_percentage REAL NOT NULL DEFAULT 0.0,
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS idx_dlp_date ON daily_learning_plans(date);

      CREATE TABLE IF NOT EXISTS daily_learning_tasks (
        id TEXT PRIMARY KEY NOT NULL,
        daily_plan_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        course_name TEXT NOT NULL,
        category TEXT NOT NULL,
        module_id TEXT,
        topic_id TEXT,
        title TEXT NOT NULL,
        lesson_type TEXT NOT NULL DEFAULT 'LESSON',
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        difficulty TEXT NOT NULL DEFAULT 'INTERMEDIATE',
        estimated_minutes INTEGER NOT NULL DEFAULT 25,
        status TEXT NOT NULL DEFAULT 'PENDING',
        started_at TEXT,
        completed_at TEXT,
        score INTEGER,
        total_questions INTEGER,
        accuracy REAL,
        xp_earned INTEGER DEFAULT 0,
        order_index INTEGER NOT NULL DEFAULT 0,
        lesson_data TEXT,
        FOREIGN KEY (daily_plan_id) REFERENCES daily_learning_plans(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_dlt_plan ON daily_learning_tasks(daily_plan_id);
      CREATE INDEX IF NOT EXISTS idx_dlt_status ON daily_learning_tasks(status);
      CREATE INDEX IF NOT EXISTS idx_dlt_cat ON daily_learning_tasks(category);

      CREATE TABLE IF NOT EXISTS revision_schedules (
        id TEXT PRIMARY KEY NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT,
        topic_id TEXT NOT NULL,
        topic_title TEXT NOT NULL,
        last_studied_at TEXT NOT NULL,
        next_revision_date TEXT NOT NULL,
        revision_level INTEGER NOT NULL DEFAULT 1,
        last_score INTEGER,
        last_accuracy REAL,
        interval_days INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'PENDING',
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_rev_next_date ON revision_schedules(next_revision_date);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_rev_topic ON revision_schedules(topic_id);

      CREATE TABLE IF NOT EXISTS daily_lesson_results (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT,
        topic_id TEXT,
        course_id TEXT,
        score INTEGER NOT NULL DEFAULT 0,
        total_questions INTEGER NOT NULL DEFAULT 0,
        accuracy REAL NOT NULL DEFAULT 0.0,
        time_spent_seconds INTEGER NOT NULL DEFAULT 0,
        xp_earned INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_dlr_topic ON daily_lesson_results(topic_id);
      CREATE INDEX IF NOT EXISTS idx_dlr_completed ON daily_lesson_results(completed_at);
    `);

    // 2. Seed initial Daily Learning preferences into app_settings
    const defaultSettings: [string, string][] = [
      ['daily_study_target_minutes', '120'],
      ['daily_aptitude_questions_target', '10'],
      ['daily_reasoning_questions_target', '10'],
      ['daily_english_questions_target', '10'],
      ['daily_speaking_minutes_target', '15'],
      ['daily_coding_tasks_target', '1'],
      ['preferred_study_time', 'Evening'],
      ['preferred_study_time_custom', '19:00 - 21:00'],
      ['active_learning_courses', JSON.stringify(['python', 'aptitude', 'reasoning', 'verbal_english', 'english_speaking'])],
    ];

    for (const [k, v] of defaultSettings) {
      await db.runAsync(
        'INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?);',
        [k, v, now]
      );
    }
  },
};
