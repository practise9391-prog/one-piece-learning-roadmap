import { SQLiteDatabase } from 'expo-sqlite';

export const v9_settings_and_preferences = {
  version: 9,
  name: 'v9_settings_and_preferences',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Create user_profile table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_profile (
        id TEXT PRIMARY KEY NOT NULL,
        display_name TEXT NOT NULL,
        avatar_type TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 2. Create app_settings key-value store
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    const now = new Date().toISOString();

    // 3. Seed default user profile if none exists
    await db.runAsync(
      `INSERT OR IGNORE INTO user_profile (id, display_name, avatar_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?);`,
      ['default_user', 'Pavan', 'compass', now, now]
    );

    // 4. Seed default app settings
    const defaultSettings: [string, string][] = [
      // Learning
      ['default_course_id', 'python'],
      ['auto_open_current_module', 'true'],
      ['auto_scroll_to_current_node', 'true'],
      ['show_completed_topics', 'true'],
      ['confirm_before_reset_progress', 'true'],
      
      // Practice
      ['default_difficulty', 'all'],
      ['show_completed_questions', 'true'],
      ['auto_continue_next_question', 'true'],
      ['show_hints', 'true'],
      ['show_solutions', 'true'],

      // News
      ['refresh_news_automatically', 'true'],
      ['use_wifi_only', 'false'],
      ['cache_news_articles', 'true'],

      // Motivation
      ['daily_motivation_enabled', 'true'],
      ['show_motivation_on_dashboard', 'true'],
      ['favorite_messages_only', 'false'],
      ['repeat_messages', 'false'],

      // Appearance
      ['theme_id', 'ocean'],
      ['animations_enabled', 'true'],
      ['reduced_motion', 'false'],

      // Sound & Notifications (Preparation)
      ['sound_effects_enabled', 'false'],
      ['daily_learning_reminder', 'false'],
      ['streak_reminder', 'false'],
      ['news_updates_reminder', 'false'],
    ];

    for (const [k, v] of defaultSettings) {
      await db.runAsync(
        'INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?);',
        [k, v, now]
      );
    }

    // 5. Ensure goal_settings has modules_per_day if not present
    try {
      await db.runAsync(
        'INSERT OR IGNORE INTO goal_settings (key, value) VALUES (?, ?);',
        ['modules_per_day', '1']
      );
    } catch {
      // safe to ignore
    }
  },
};
