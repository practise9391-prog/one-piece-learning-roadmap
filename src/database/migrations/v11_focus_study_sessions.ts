import { SQLiteDatabase } from 'expo-sqlite';

export const v11_focus_study_sessions = {
  version: 11,
  name: 'v11_focus_study_sessions',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Ensure study_sessions table exists
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        course_id TEXT,
        module_id TEXT,
        topic_id TEXT,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        planned_duration_seconds INTEGER NOT NULL DEFAULT 1500,
        status TEXT NOT NULL DEFAULT 'COMPLETED',
        paused_at TEXT,
        total_paused_seconds INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `);

    // Check existing columns in case table was created by v8
    const columns = await db.getAllAsync<{ name: string }>(
      'PRAGMA table_info(study_sessions);'
    );
    const colSet = new Set(columns.map((c) => c.name));

    if (!colSet.has('topic_id')) {
      await db.execAsync('ALTER TABLE study_sessions ADD COLUMN topic_id TEXT;');
    }
    if (!colSet.has('planned_duration_seconds')) {
      await db.execAsync('ALTER TABLE study_sessions ADD COLUMN planned_duration_seconds INTEGER NOT NULL DEFAULT 1500;');
    }
    if (!colSet.has('status')) {
      await db.execAsync("ALTER TABLE study_sessions ADD COLUMN status TEXT NOT NULL DEFAULT 'COMPLETED';");
    }
    if (!colSet.has('paused_at')) {
      await db.execAsync('ALTER TABLE study_sessions ADD COLUMN paused_at TEXT;');
    }
    if (!colSet.has('total_paused_seconds')) {
      await db.execAsync('ALTER TABLE study_sessions ADD COLUMN total_paused_seconds INTEGER NOT NULL DEFAULT 0;');
    }

    // Indices
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_ss_status ON study_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_ss_course ON study_sessions(course_id);
      CREATE INDEX IF NOT EXISTS idx_ss_started ON study_sessions(started_at);
    `);

    const now = new Date().toISOString();

    // 2. Seed default focus settings into app_settings
    const focusSettings: [string, string][] = [
      ['focus_default_duration', '25'],
      ['focus_auto_start_next', 'false'],
      ['focus_sound_enabled', 'false'],
      ['focus_vibration_enabled', 'true'],
      ['focus_show_dashboard_card', 'true'],
      ['focus_min_qualifying_seconds', '300'],
    ];

    for (const [k, v] of focusSettings) {
      await db.runAsync(
        'INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?);',
        [k, v, now]
      );
    }

    // 3. Seed Focus achievements
    const achievements: [string, string, string, string, string, string, number][] = [
      [
        'ach_first_focus',
        'First Focus',
        'Complete your very first focused study session.',
        '🎯',
        'FOCUS',
        'FOCUS_SESSIONS_COMPLETED',
        1,
      ],
      [
        'ach_focus_runner',
        'Focus Runner',
        'Complete 5 focused study sessions.',
        '⚡',
        'FOCUS',
        'FOCUS_SESSIONS_COMPLETED',
        5,
      ],
      [
        'ach_deep_worker',
        'Deep Worker',
        'Complete a 60-minute deep focus study session.',
        '🌊',
        'FOCUS',
        'FOCUS_DEEP_WORK',
        3600,
      ],
      [
        'ach_hour_power',
        'Hour of Power',
        'Accumulate 60 total minutes of focused study time.',
        '⏱️',
        'FOCUS',
        'FOCUS_TOTAL_MINUTES',
        60,
      ],
      [
        'ach_ten_hour',
        'Ten Hour Journey',
        'Accumulate 10 total hours of focused study time across your roadmap.',
        '🧭',
        'FOCUS',
        'FOCUS_TOTAL_HOURS',
        10,
      ],
      [
        'ach_focus_master',
        'Focus Master',
        'Accumulate 25 total hours of focused study time across the Grand Line.',
        '👑',
        'FOCUS',
        'FOCUS_TOTAL_HOURS',
        25,
      ],
    ];

    for (const [id, title, desc, icon, cat, reqType, reqVal] of achievements) {
      await db.runAsync(
        `INSERT OR IGNORE INTO achievements (
          id, title, description, icon, category, requirement_type, requirement_value, is_unlocked, unlocked_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?);`,
        [id, title, desc, icon, cat, reqType, reqVal, now]
      );
    }
  },
};
