import { DatabaseManager } from '../database/DatabaseManager';
import {
  UserProfile,
  LearningPreferences,
  DailyGoalPreferences,
  PracticePreferences,
  NewsPreferencesSettings,
  MotivationPreferences,
  AppearancePreferences,
  LegacyNotificationPreferences,
  SoundPreferences,
} from '../models/Settings';

export class SettingsRepository {
  private db = DatabaseManager.getInstance();

  // Helper for reading a key from app_settings
  private async getSetting(key: string, defaultValue: string): Promise<string> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_settings WHERE key = ?;',
      [key]
    );
    return row ? row.value : defaultValue;
  }

  // Helper for saving a key to app_settings
  private async setSetting(key: string, value: string): Promise<void> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();
    await database.runAsync(
      `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
      [key, value, now]
    );
  }

  // --- USER PROFILE ---
  async getUserProfile(): Promise<UserProfile> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<UserProfile>(
      'SELECT * FROM user_profile LIMIT 1;'
    );
    if (row) {
      return row;
    }

    const now = new Date().toISOString();
    const defaultProfile: UserProfile = {
      id: 'default_user',
      display_name: 'Pavan',
      avatar_type: 'compass',
      created_at: now,
      updated_at: now,
    };

    await database.runAsync(
      `INSERT OR IGNORE INTO user_profile (id, display_name, avatar_type, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?);`,
      [defaultProfile.id, defaultProfile.display_name, defaultProfile.avatar_type, now, now]
    );

    return defaultProfile;
  }

  async updateUserProfile(displayName: string, avatarType: string): Promise<UserProfile> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();
    const trimmed = displayName.trim() || 'Pavan';

    await database.runAsync(
      `UPDATE user_profile SET display_name = ?, avatar_type = ?, updated_at = ?
       WHERE id = (SELECT id FROM user_profile LIMIT 1);`,
      [trimmed, avatarType, now]
    );

    return this.getUserProfile();
  }

  // --- LEARNING PREFERENCES ---
  async getLearningPreferences(): Promise<LearningPreferences> {
    const defaultCourse = await this.getSetting('default_course_id', 'python');
    const autoOpen = await this.getSetting('auto_open_current_module', 'true');
    const autoScroll = await this.getSetting('auto_scroll_to_current_node', 'true');
    const showCompleted = await this.getSetting('show_completed_topics', 'true');
    const confirmReset = await this.getSetting('confirm_before_reset_progress', 'true');

    return {
      default_course_id: defaultCourse,
      auto_open_current_module: autoOpen === 'true',
      auto_scroll_to_current_node: autoScroll === 'true',
      show_completed_topics: showCompleted === 'true',
      confirm_before_reset_progress: confirmReset === 'true',
    };
  }

  async updateLearningPreferences(prefs: Partial<LearningPreferences>): Promise<void> {
    if (prefs.default_course_id !== undefined) {
      await this.setSetting('default_course_id', prefs.default_course_id);
    }
    if (prefs.auto_open_current_module !== undefined) {
      await this.setSetting('auto_open_current_module', prefs.auto_open_current_module ? 'true' : 'false');
    }
    if (prefs.auto_scroll_to_current_node !== undefined) {
      await this.setSetting('auto_scroll_to_current_node', prefs.auto_scroll_to_current_node ? 'true' : 'false');
    }
    if (prefs.show_completed_topics !== undefined) {
      await this.setSetting('show_completed_topics', prefs.show_completed_topics ? 'true' : 'false');
    }
    if (prefs.confirm_before_reset_progress !== undefined) {
      await this.setSetting('confirm_before_reset_progress', prefs.confirm_before_reset_progress ? 'true' : 'false');
    }
  }

  // --- DAILY GOALS ---
  async getDailyGoalPreferences(): Promise<DailyGoalPreferences> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM goal_settings;'
    );
    const map = new Map<string, string>();
    for (const r of rows) {
      map.set(r.key, r.value);
    }

    return {
      topics_per_day: parseInt(map.get('topics_per_day') || '2', 10),
      practice_per_day: parseInt(map.get('practice_per_day') || '5', 10),
      modules_per_day: parseInt(map.get('modules_per_day') || '1', 10),
      weekly_days_target: parseInt(map.get('weekly_days_target') || '5', 10),
    };
  }

  async updateDailyGoalPreferences(prefs: Partial<DailyGoalPreferences>): Promise<void> {
    const database = await this.db.getDatabase();
    if (prefs.topics_per_day !== undefined) {
      const val = Math.max(0, Math.min(50, Math.floor(prefs.topics_per_day)));
      await database.runAsync(
        `INSERT INTO goal_settings (key, value) VALUES ('topics_per_day', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
        [val.toString()]
      );
    }
    if (prefs.practice_per_day !== undefined) {
      const val = Math.max(0, Math.min(100, Math.floor(prefs.practice_per_day)));
      await database.runAsync(
        `INSERT INTO goal_settings (key, value) VALUES ('practice_per_day', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
        [val.toString()]
      );
    }
    if (prefs.modules_per_day !== undefined) {
      const val = Math.max(0, Math.min(20, Math.floor(prefs.modules_per_day)));
      await database.runAsync(
        `INSERT INTO goal_settings (key, value) VALUES ('modules_per_day', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
        [val.toString()]
      );
    }
    if (prefs.weekly_days_target !== undefined) {
      const val = Math.max(1, Math.min(7, Math.floor(prefs.weekly_days_target)));
      await database.runAsync(
        `INSERT INTO goal_settings (key, value) VALUES ('weekly_days_target', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
        [val.toString()]
      );
    }
  }

  // --- PRACTICE PREFERENCES ---
  async getPracticePreferences(): Promise<PracticePreferences> {
    const difficulty = (await this.getSetting('default_difficulty', 'all')) as any;
    const showCompleted = await this.getSetting('show_completed_questions', 'true');
    const autoContinue = await this.getSetting('auto_continue_next_question', 'true');
    const showHints = await this.getSetting('show_hints', 'true');
    const showSolutions = await this.getSetting('show_solutions', 'true');

    return {
      default_difficulty: ['all', 'easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'all',
      show_completed_questions: showCompleted === 'true',
      auto_continue_next_question: autoContinue === 'true',
      show_hints: showHints === 'true',
      show_solutions: showSolutions === 'true',
    };
  }

  async updatePracticePreferences(prefs: Partial<PracticePreferences>): Promise<void> {
    if (prefs.default_difficulty !== undefined) {
      await this.setSetting('default_difficulty', prefs.default_difficulty);
    }
    if (prefs.show_completed_questions !== undefined) {
      await this.setSetting('show_completed_questions', prefs.show_completed_questions ? 'true' : 'false');
    }
    if (prefs.auto_continue_next_question !== undefined) {
      await this.setSetting('auto_continue_next_question', prefs.auto_continue_next_question ? 'true' : 'false');
    }
    if (prefs.show_hints !== undefined) {
      await this.setSetting('show_hints', prefs.show_hints ? 'true' : 'false');
    }
    if (prefs.show_solutions !== undefined) {
      await this.setSetting('show_solutions', prefs.show_solutions ? 'true' : 'false');
    }
  }

  // --- NEWS PREFERENCES ---
  async getNewsPreferences(): Promise<NewsPreferencesSettings> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<{ category: string; is_enabled: number }>(
      'SELECT category, is_enabled FROM news_preferences;'
    );

    const categories: Record<string, boolean> = {
      TECH: true,
      AI: true,
      DEVELOPER: true,
      STOCKS: true,
      EDUCATION: true,
      TRENDS: true,
    };

    for (const r of rows) {
      categories[r.category] = r.is_enabled === 1;
    }

    const refreshAuto = await this.getSetting('refresh_news_automatically', 'true');
    const useWifi = await this.getSetting('use_wifi_only', 'false');
    const cacheArticles = await this.getSetting('cache_news_articles', 'true');

    return {
      categories: categories as any,
      refresh_automatically: refreshAuto === 'true',
      use_wifi_only: useWifi === 'true',
      cache_articles: cacheArticles === 'true',
    };
  }

  async updateNewsPreferences(prefs: Partial<NewsPreferencesSettings>): Promise<void> {
    const database = await this.db.getDatabase();
    if (prefs.categories) {
      for (const [cat, enabled] of Object.entries(prefs.categories)) {
        await database.runAsync(
          `INSERT INTO news_preferences (category, is_enabled) VALUES (?, ?)
           ON CONFLICT(category) DO UPDATE SET is_enabled = excluded.is_enabled;`,
          [cat, enabled ? 1 : 0]
        );
      }
    }

    if (prefs.refresh_automatically !== undefined) {
      await this.setSetting('refresh_news_automatically', prefs.refresh_automatically ? 'true' : 'false');
    }
    if (prefs.use_wifi_only !== undefined) {
      await this.setSetting('use_wifi_only', prefs.use_wifi_only ? 'true' : 'false');
    }
    if (prefs.cache_articles !== undefined) {
      await this.setSetting('cache_news_articles', prefs.cache_articles ? 'true' : 'false');
    }
  }

  // --- NEWS CACHE MANAGEMENT ---
  async getNewsCacheStats(): Promise<{ storedArticles: number; estimatedBytes: number }> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{ count: number; totalLength: number }>(`
      SELECT COUNT(*) as count,
             COALESCE(SUM(LENGTH(title) + LENGTH(COALESCE(content, '')) + LENGTH(COALESCE(description, ''))), 0) as totalLength
      FROM news_articles;
    `);
    const count = row?.count || 0;
    // Add estimated overhead per article row
    const bytes = (row?.totalLength || 0) + count * 256;
    return {
      storedArticles: count,
      estimatedBytes: bytes,
    };
  }

  async clearNewsCache(preserveBookmarks: boolean = true): Promise<number> {
    const database = await this.db.getDatabase();
    let query = 'DELETE FROM news_articles;';
    if (preserveBookmarks) {
      query = 'DELETE FROM news_articles WHERE is_bookmarked = 0;';
    }
    const result = await database.runAsync(query);
    return result.changes;
  }

  // --- MOTIVATION PREFERENCES ---
  async getMotivationPreferences(): Promise<MotivationPreferences> {
    const dailyMotivation = await this.getSetting('daily_motivation_enabled', 'true');
    const showDashboard = await this.getSetting('show_motivation_on_dashboard', 'true');
    const favoritesOnly = await this.getSetting('favorite_messages_only', 'false');
    const repeatMessages = await this.getSetting('repeat_messages', 'false');

    return {
      daily_motivation_enabled: dailyMotivation === 'true',
      show_motivation_on_dashboard: showDashboard === 'true',
      favorite_messages_only: favoritesOnly === 'true',
      repeat_messages: repeatMessages === 'true',
    };
  }

  async updateMotivationPreferences(prefs: Partial<MotivationPreferences>): Promise<void> {
    if (prefs.daily_motivation_enabled !== undefined) {
      await this.setSetting('daily_motivation_enabled', prefs.daily_motivation_enabled ? 'true' : 'false');
    }
    if (prefs.show_motivation_on_dashboard !== undefined) {
      await this.setSetting('show_motivation_on_dashboard', prefs.show_motivation_on_dashboard ? 'true' : 'false');
    }
    if (prefs.favorite_messages_only !== undefined) {
      await this.setSetting('favorite_messages_only', prefs.favorite_messages_only ? 'true' : 'false');
    }
    if (prefs.repeat_messages !== undefined) {
      await this.setSetting('repeat_messages', prefs.repeat_messages ? 'true' : 'false');
    }
  }

  // --- APPEARANCE PREFERENCES ---
  async getAppearancePreferences(): Promise<AppearancePreferences> {
    const themeId = (await this.getSetting('theme_id', 'ocean')) as any;
    const animations = await this.getSetting('animations_enabled', 'true');
    const reducedMotion = await this.getSetting('reduced_motion', 'false');

    return {
      theme_id: ['ocean', 'dark', 'light', 'system'].includes(themeId) ? themeId : 'ocean',
      animations_enabled: animations === 'true',
      reduced_motion: reducedMotion === 'true',
    };
  }

  async updateAppearancePreferences(prefs: Partial<AppearancePreferences>): Promise<void> {
    if (prefs.theme_id !== undefined) {
      await this.setSetting('theme_id', prefs.theme_id);
    }
    if (prefs.animations_enabled !== undefined) {
      await this.setSetting('animations_enabled', prefs.animations_enabled ? 'true' : 'false');
    }
    if (prefs.reduced_motion !== undefined) {
      await this.setSetting('reduced_motion', prefs.reduced_motion ? 'true' : 'false');
    }
  }

  // --- NOTIFICATION PREFERENCES (PREPARATION) ---
  async getNotificationPreferences(): Promise<LegacyNotificationPreferences> {
    const dailyReminder = await this.getSetting('daily_learning_reminder', 'false');
    const streakReminder = await this.getSetting('streak_reminder', 'false');
    const newsReminder = await this.getSetting('news_updates_reminder', 'false');

    return {
      daily_learning_reminder: dailyReminder === 'true',
      streak_reminder: streakReminder === 'true',
      news_updates_reminder: newsReminder === 'true',
    };
  }

  async updateNotificationPreferences(prefs: Partial<LegacyNotificationPreferences>): Promise<void> {
    if (prefs.daily_learning_reminder !== undefined) {
      await this.setSetting('daily_learning_reminder', prefs.daily_learning_reminder ? 'true' : 'false');
    }
    if (prefs.streak_reminder !== undefined) {
      await this.setSetting('streak_reminder', prefs.streak_reminder ? 'true' : 'false');
    }
    if (prefs.news_updates_reminder !== undefined) {
      await this.setSetting('news_updates_reminder', prefs.news_updates_reminder ? 'true' : 'false');
    }
  }

  // --- SOUND PREFERENCES (PREPARATION) ---
  async getSoundPreferences(): Promise<SoundPreferences> {
    const soundEnabled = await this.getSetting('sound_effects_enabled', 'false');
    return {
      sound_effects_enabled: soundEnabled === 'true',
    };
  }

  async updateSoundPreferences(prefs: Partial<SoundPreferences>): Promise<void> {
    if (prefs.sound_effects_enabled !== undefined) {
      await this.setSetting('sound_effects_enabled', prefs.sound_effects_enabled ? 'true' : 'false');
    }
  }
}

export const settingsRepository = new SettingsRepository();
