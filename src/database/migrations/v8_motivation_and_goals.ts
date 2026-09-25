import { SQLiteDatabase } from 'expo-sqlite';

export const v8_motivation_and_goals = {
  version: 8,
  name: 'v8_motivation_and_goals',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Create motivation_entries table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS motivation_entries (
        id TEXT PRIMARY KEY NOT NULL,
        message TEXT NOT NULL,
        author TEXT NOT NULL DEFAULT 'Grand Line Captain',
        category TEXT NOT NULL,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_me_category ON motivation_entries(category);
      CREATE INDEX IF NOT EXISTS idx_me_favorite ON motivation_entries(is_favorite);
    `);

    // 2. Create motivation_history table (stores daily quote rotation)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS motivation_history (
        id TEXT PRIMARY KEY NOT NULL,
        motivation_id TEXT NOT NULL,
        date TEXT NOT NULL UNIQUE,
        shown_at TEXT NOT NULL,
        FOREIGN KEY (motivation_id) REFERENCES motivation_entries(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_mh_date ON motivation_history(date);
    `);

    // 3. Create daily_goals table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_goals (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL,
        goal_type TEXT NOT NULL,
        title TEXT NOT NULL,
        target INTEGER NOT NULL DEFAULT 1,
        current INTEGER NOT NULL DEFAULT 0,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        course_id TEXT,
        module_id TEXT,
        topic_id TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_dg_date ON daily_goals(date);
      CREATE INDEX IF NOT EXISTS idx_dg_completed ON daily_goals(is_completed);
    `);

    // 4. Create daily_challenges table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_challenges (
        id TEXT PRIMARY KEY NOT NULL,
        date TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        challenge_type TEXT NOT NULL DEFAULT 'PRACTICE',
        target_id TEXT,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_dc_date ON daily_challenges(date);
    `);

    // 5. Create achievements table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        category TEXT NOT NULL,
        requirement_type TEXT NOT NULL,
        requirement_value INTEGER NOT NULL,
        is_unlocked INTEGER NOT NULL DEFAULT 0,
        unlocked_at TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_ach_unlocked ON achievements(is_unlocked);
      CREATE INDEX IF NOT EXISTS idx_ach_category ON achievements(category);
    `);

    // 6. Create study_sessions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS study_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        course_id TEXT,
        module_id TEXT,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_ss_started ON study_sessions(started_at);
    `);

    // 7. Create goal_settings table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS goal_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL
      );
    `);

    // Seed default goal settings
    const defaultSettings = [
      ['topics_per_day', '2'],
      ['practice_per_day', '5'],
      ['weekly_days_target', '5'],
    ];
    for (const [k, v] of defaultSettings) {
      await db.runAsync(
        'INSERT OR IGNORE INTO goal_settings (key, value) VALUES (?, ?);',
        [k, v]
      );
    }

    // Seed motivation entries
    const now = new Date().toISOString();
    const quotes = [
  [
    "quote_gen_1",
    "Every island conquered began with the courage to raise the anchor and set sail.",
    "Grand Line Captain",
    "GENERAL"
  ],
  [
    "quote_gen_2",
    "Small daily progress across the seas compounds into legendary navigation mastery.",
    "Navigator Log",
    "GENERAL"
  ],
  [
    "quote_gen_3",
    "The calm sea never made a skilled mariner. Embrace every difficult challenge.",
    "Ancient Maritime Proverb",
    "GENERAL"
  ],
  [
    "quote_code_1",
    "Writing code is building your own ship. Inspect every timber, test every knot.",
    "Chief Shipwright",
    "CODING"
  ],
  [
    "quote_code_2",
    "First make it work, then make it right, then make it swift across the waves.",
    "Master Engineer",
    "CODING"
  ],
  [
    "quote_code_3",
    "Debugging is simply tracking the wind patterns until the compass points true north.",
    "Log Pose Keeper",
    "CODING"
  ],
  [
    "quote_disc_1",
    "Motivation is the spark that sets sail; discipline is the rudder that guides you home.",
    "Fleet Commander",
    "DISCIPLINE"
  ],
  [
    "quote_disc_2",
    "A pirate does not wait for ideal weather. They learn to navigate the storm with focus.",
    "Grand Line Helmsman",
    "DISCIPLINE"
  ],
  [
    "quote_disc_3",
    "Mastery is doing the small, vital fundamentals even when the horizon feels distant.",
    "Grand Line Tactician",
    "DISCIPLINE"
  ],
  [
    "quote_cons_1",
    "Twenty focused minutes of learning today protects the flame of your learning streak.",
    "Log Pose Sentinel",
    "CONSISTENCY"
  ],
  [
    "quote_cons_2",
    "It is not the tempest of one frantic night, but the steady daily breeze that crosses oceans.",
    "Voyage Historian",
    "CONSISTENCY"
  ],
  [
    "quote_cons_3",
    "Keep the streak alive. Momentum is the most powerful wind in your sails.",
    "Bounty Master",
    "CONSISTENCY"
  ],
  [
    "quote_prob_1",
    "When an algorithm feels impassable, break it down island by island until the path opens.",
    "Grand Line Strategist",
    "PROBLEM_SOLVING"
  ],
  [
    "quote_prob_2",
    "Errors and failed test cases are coordinates pointing you away from the reefs.",
    "Observant Look-out",
    "PROBLEM_SOLVING"
  ],
  [
    "quote_prac_1",
    "A warrior sharpens their blade before battle. A developer sharpens their mind in the practice arena.",
    "Swordsman Mentor",
    "PRACTICE"
  ],
  [
    "quote_prac_2",
    "Every coding problem you solve is a puzzle piece unlocked on the road to the summit.",
    "Code Duelist",
    "PRACTICE"
  ],
  [
    "quote_car_1",
    "Build with conviction. The engineers who deeply understand the core will always chart the future.",
    "Chief Architect",
    "CAREER"
  ],
  [
    "quote_car_2",
    "Clear thinking, calm preparation, and thorough notes turn intimidating exams into known waters.",
    "Grand Scholar",
    "EXAMS"
  ],
  [
    "quote_comp_1",
    "When you reach the summit of one island, look across the ocean to the next adventure.",
    "Grand Explorer",
    "COURSE_COMPLETION"
  ]
];
    for (const [id, msg, author, cat] of quotes) {
      await db.runAsync(
        `INSERT OR IGNORE INTO motivation_entries (
          id, message, author, category, is_favorite, is_active, created_at
        ) VALUES (?, ?, ?, ?, 0, 1, ?);`,
        [id, msg, author, cat, now]
      );
    }

    // Seed achievements definitions
    const achievements = [
  [
    "ach_first_step",
    "First Step",
    "Complete your very first curriculum topic.",
    "\ud83d\udc63",
    "TOPICS",
    "TOPICS_COMPLETED",
    1
  ],
  [
    "ach_topics_10",
    "Knowledge Seeker",
    "Complete 10 curriculum topics across your journey.",
    "\ud83d\udcdc",
    "TOPICS",
    "TOPICS_COMPLETED",
    10
  ],
  [
    "ach_topics_50",
    "Master Navigator",
    "Complete 50 curriculum topics across the roadmaps.",
    "\ud83d\uddfa\ufe0f",
    "TOPICS",
    "TOPICS_COMPLETED",
    50
  ],
  [
    "ach_streak_3",
    "On A Roll",
    "Maintain an active learning streak for 3 consecutive days.",
    "\ud83d\udd25",
    "STREAK",
    "STREAK_DAYS",
    3
  ],
  [
    "ach_streak_7",
    "Unstoppable Rhythm",
    "Maintain an active learning streak for 7 consecutive days.",
    "\u26a1",
    "STREAK",
    "STREAK_DAYS",
    7
  ],
  [
    "ach_streak_14",
    "Grand Line Voyageur",
    "Maintain an active learning streak for 14 consecutive days.",
    "\ud83e\udded",
    "STREAK",
    "STREAK_DAYS",
    14
  ],
  [
    "ach_module_1",
    "Island Conqueror",
    "Complete your first entire curriculum module.",
    "\ud83c\udfdd\ufe0f",
    "MODULES",
    "MODULES_COMPLETED",
    1
  ],
  [
    "ach_module_10",
    "Archipelago Explorer",
    "Complete 10 learning modules across all courses.",
    "\u26f5",
    "MODULES",
    "MODULES_COMPLETED",
    10
  ],
  [
    "ach_course_1",
    "Summit Champion",
    "Complete 100% of your first complete course roadmap.",
    "\ud83d\udc51",
    "COURSES",
    "COURSES_COMPLETED",
    1
  ],
  [
    "ach_practice_5",
    "Arena Initiate",
    "Solve 5 practice challenges in the problem hub.",
    "\u2694\ufe0f",
    "PRACTICE",
    "PRACTICE_SOLVED",
    5
  ],
  [
    "ach_practice_25",
    "Practice Warrior",
    "Solve 25 practice challenges in the problem hub.",
    "\ud83d\udee1\ufe0f",
    "PRACTICE",
    "PRACTICE_SOLVED",
    25
  ],
  [
    "ach_notes_3",
    "Ship Scribe",
    "Save 3 detailed personal learning notes.",
    "\u270d\ufe0f",
    "NOTES",
    "NOTES_WRITTEN",
    3
  ],
  [
    "ach_week_warrior",
    "Week Warrior",
    "Learn consistently for 5 active days in a single week.",
    "\ud83c\udfc6",
    "STREAK",
    "WEEKLY_DAYS",
    5
  ]
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
