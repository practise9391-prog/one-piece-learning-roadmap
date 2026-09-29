import { SQLiteDatabase } from 'expo-sqlite';

/**
 * Migration v20: Part 22 Advanced AI Personalization, Adaptive Learning & Smart Study Engine
 */
export const v20_part22_smart_learning = {
  version: 20,
  name: 'v20_part22_smart_learning',
  up: async (db: SQLiteDatabase): Promise<void> => {
    const now = new Date().toISOString();

    // 1. Topic Mastery Table (Stores computed multidimensional mastery scores)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS topic_mastery (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        course_id TEXT NOT NULL,
        module_id TEXT NOT NULL,
        topic_id TEXT NOT NULL,
        mastery_score REAL NOT NULL DEFAULT 0.0,
        mastery_level TEXT NOT NULL DEFAULT 'NOT_STARTED',
        accuracy_score REAL NOT NULL DEFAULT 0.0,
        completion_score REAL NOT NULL DEFAULT 0.0,
        consistency_score REAL NOT NULL DEFAULT 0.0,
        recency_score REAL NOT NULL DEFAULT 0.0,
        difficulty_score REAL NOT NULL DEFAULT 0.0,
        last_calculated_at TEXT NOT NULL,
        UNIQUE(user_id, topic_id)
      );

      CREATE INDEX IF NOT EXISTS idx_topic_mastery_topic ON topic_mastery (topic_id);
      CREATE INDEX IF NOT EXISTS idx_topic_mastery_course ON topic_mastery (course_id);
      CREATE INDEX IF NOT EXISTS idx_topic_mastery_level ON topic_mastery (mastery_level);
    `);

    // 2. Smart Revisions Table (Spaced repetition engine items)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS smart_revisions (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        topic_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT,
        scheduled_date TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        status TEXT NOT NULL DEFAULT 'UPCOMING',
        reason TEXT NOT NULL,
        last_revision_date TEXT,
        next_revision_date TEXT,
        repetition_count INTEGER NOT NULL DEFAULT 0,
        interval_days INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        UNIQUE(user_id, topic_id)
      );

      CREATE INDEX IF NOT EXISTS idx_smart_revisions_date_status ON smart_revisions (scheduled_date, status);
      CREATE INDEX IF NOT EXISTS idx_smart_revisions_topic ON smart_revisions (topic_id);
    `);

    // 3. Smart Study Priorities Table (Dynamic prioritization queue)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS smart_study_priorities (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        topic_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        priority_score REAL NOT NULL DEFAULT 0.0,
        priority_level TEXT NOT NULL DEFAULT 'NORMAL',
        reasons TEXT NOT NULL,
        calculated_at TEXT NOT NULL,
        UNIQUE(user_id, topic_id)
      );

      CREATE INDEX IF NOT EXISTS idx_smart_priorities_score ON smart_study_priorities (priority_score DESC);
    `);

    // 4. Smart Learning Settings Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS smart_learning_settings (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        adaptive_difficulty_enabled INTEGER NOT NULL DEFAULT 1,
        spaced_revision_enabled INTEGER NOT NULL DEFAULT 1,
        revision_interval_multiplier REAL NOT NULL DEFAULT 1.0,
        default_session_minutes INTEGER NOT NULL DEFAULT 30,
        prioritize_weak_topics INTEGER NOT NULL DEFAULT 1,
        target_interviews INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );
    `);

    // Seed default settings row if not present
    await db.runAsync(
      `INSERT OR IGNORE INTO smart_learning_settings (
        id, user_id, adaptive_difficulty_enabled, spaced_revision_enabled,
        revision_interval_multiplier, default_session_minutes,
        prioritize_weak_topics, target_interviews, updated_at
      ) VALUES ('default_settings', 'default_user', 1, 1, 1.0, 30, 1, 0, ?);`,
      [now]
    );
  },
};
