import { SQLiteDatabase } from 'expo-sqlite';

export const v14_part16_study_planning = {
  version: 14,
  name: 'v14_part16_study_planning',
  up: async (db: SQLiteDatabase): Promise<void> => {
    const now = new Date().toISOString();

    // 1. Ensure estimated_minutes exists on topics table
    try {
      const topicCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(topics);');
      const topicColSet = new Set(topicCols.map((c) => c.name));
      if (!topicColSet.has('estimated_minutes')) {
        await db.execAsync('ALTER TABLE topics ADD COLUMN estimated_minutes INTEGER NOT NULL DEFAULT 25;');
      }
    } catch {
      // Ignore if column already exists
    }

    // 2. Ensure session_type exists on study_sessions table
    try {
      const sessionCols = await db.getAllAsync<{ name: string }>('PRAGMA table_info(study_sessions);');
      const sessionColSet = new Set(sessionCols.map((c) => c.name));
      if (!sessionColSet.has('session_type')) {
        await db.execAsync("ALTER TABLE study_sessions ADD COLUMN session_type TEXT NOT NULL DEFAULT 'COUNT_DOWN';");
      }
      if (!sessionColSet.has('notes')) {
        await db.execAsync('ALTER TABLE study_sessions ADD COLUMN notes TEXT;');
      }
    } catch {
      // Ignore if columns already exist
    }

    // 3. Create study_plans table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS study_plans (
        id TEXT PRIMARY KEY NOT NULL,
        plan_type TEXT NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY'
        date TEXT, -- 'YYYY-MM-DD' for daily
        week_start TEXT, -- 'YYYY-MM-DD' for weekly
        week_end TEXT, -- 'YYYY-MM-DD' for weekly
        month INTEGER, -- 1-12
        year INTEGER,
        planned_minutes INTEGER NOT NULL DEFAULT 0,
        completed_minutes INTEGER NOT NULL DEFAULT 0,
        planned_topics INTEGER NOT NULL DEFAULT 0,
        completed_topics INTEGER NOT NULL DEFAULT 0,
        is_rest_day INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'NOT_STARTED', -- 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED', 'PAUSED', 'REST_DAY'
        notes TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sp_date ON study_plans(date);
      CREATE INDEX IF NOT EXISTS idx_sp_week ON study_plans(week_start);
      CREATE INDEX IF NOT EXISTS idx_sp_month ON study_plans(year, month);
      CREATE INDEX IF NOT EXISTS idx_sp_type ON study_plans(plan_type);
      CREATE INDEX IF NOT EXISTS idx_sp_status ON study_plans(status);

      CREATE TABLE IF NOT EXISTS study_plan_items (
        id TEXT PRIMARY KEY NOT NULL,
        study_plan_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT,
        topic_id TEXT NOT NULL,
        planned_minutes INTEGER NOT NULL DEFAULT 25,
        actual_minutes INTEGER NOT NULL DEFAULT 0,
        order_index INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'RESCHEDULED'
        started_at TEXT,
        completed_at TEXT,
        rescheduled_to_date TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (study_plan_id) REFERENCES study_plans(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_spi_plan ON study_plan_items(study_plan_id);
      CREATE INDEX IF NOT EXISTS idx_spi_topic ON study_plan_items(topic_id);
      CREATE INDEX IF NOT EXISTS idx_spi_status ON study_plan_items(status);

      CREATE TABLE IF NOT EXISTS study_goals (
        id TEXT PRIMARY KEY NOT NULL,
        goal_type TEXT NOT NULL, -- 'TIME_GOAL', 'TOPIC_GOAL', 'MODULE_GOAL', 'COURSE_GOAL', 'SESSION_GOAL', 'STREAK_GOAL'
        period TEXT NOT NULL, -- 'DAILY', 'WEEKLY', 'MONTHLY'
        title TEXT NOT NULL,
        description TEXT,
        target_value REAL NOT NULL DEFAULT 1,
        current_value REAL NOT NULL DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'minutes',
        course_id TEXT,
        module_id TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'NOT_STARTED', -- 'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'CANCELLED', 'PAUSED'
        created_at TEXT NOT NULL,
        completed_at TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_sg_period ON study_goals(period);
      CREATE INDEX IF NOT EXISTS idx_sg_status ON study_goals(status);
      CREATE INDEX IF NOT EXISTS idx_sg_dates ON study_goals(start_date, end_date);
    `);

    // 4. Seed default study preferences into app_settings
    const defaultStudySettings: [string, string][] = [
      ['study_pref_daily_minutes', '120'],
      ['study_pref_weekly_minutes', '600'],
      ['study_pref_monthly_minutes', '2400'],
      ['study_pref_preferred_courses', '["python","aptitude","reasoning","verbal_english","english_speaking"]'],
      ['study_pref_preferred_session_minutes', '25'],
      ['study_pref_automatic_plan_enabled', 'true'],
      ['study_pref_carry_forward_enabled', 'true'],
      ['study_pref_rest_days', '["Sunday"]'],
    ];

    for (const [key, val] of defaultStudySettings) {
      await db.runAsync(
        `INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?);`,
        [key, val, now]
      );
    }
  },
};
