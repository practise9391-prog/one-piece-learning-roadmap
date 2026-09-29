import { SQLiteDatabase } from 'expo-sqlite';

/**
 * Migration v17: Part 19 XP, Points, Badges, Achievements & Gamification System
 */
export const v17_part19_gamification = {
  version: 17,
  name: 'v17_part19_gamification',
  up: async (db: SQLiteDatabase): Promise<void> => {
    const now = new Date().toISOString();

    // 1. Gamification Profile (User totals & level state)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS gamification_profile (
        id TEXT PRIMARY KEY NOT NULL,
        total_xp INTEGER NOT NULL DEFAULT 0,
        current_level INTEGER NOT NULL DEFAULT 1,
        current_level_xp INTEGER NOT NULL DEFAULT 0,
        next_level_xp INTEGER NOT NULL DEFAULT 100,
        level_progress_percentage REAL NOT NULL DEFAULT 0.0,
        level_title TEXT NOT NULL DEFAULT 'Cabin Boy Explorer',
        points_balance INTEGER NOT NULL DEFAULT 0,
        total_points_earned INTEGER NOT NULL DEFAULT 0,
        total_points_spent INTEGER NOT NULL DEFAULT 0,
        badges_unlocked_count INTEGER NOT NULL DEFAULT 0,
        achievements_unlocked_count INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );
    `);

    // Insert default user profile row
    await db.runAsync(
      `INSERT OR IGNORE INTO gamification_profile (
        id, total_xp, current_level, current_level_xp, next_level_xp,
        level_progress_percentage, level_title, points_balance,
        total_points_earned, total_points_spent, badges_unlocked_count,
        achievements_unlocked_count, updated_at
      ) VALUES ('default_user', 0, 1, 0, 100, 0.0, 'Cabin Boy Explorer', 0, 0, 0, 0, 0, ?);`,
      [now]
    );

    // 2. XP Transactions (Traceable ledger)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS xp_transactions (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        event_type TEXT NOT NULL,
        source_id TEXT NOT NULL,
        course_id TEXT,
        module_id TEXT,
        topic_id TEXT,
        xp_amount INTEGER NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_xp_tx_event ON xp_transactions(event_type, source_id);
      CREATE INDEX IF NOT EXISTS idx_xp_tx_created ON xp_transactions(created_at DESC);
    `);

    // 3. Points Transactions (Currency ledger)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS points_transactions (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        transaction_type TEXT NOT NULL,
        event_type TEXT NOT NULL,
        source_id TEXT NOT NULL,
        points_amount INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        description TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_pts_tx_event ON points_transactions(event_type, source_id);
      CREATE INDEX IF NOT EXISTS idx_pts_tx_created ON points_transactions(created_at DESC);
    `);

    // 4. Reward Events (Strict Idempotency & Anti-Farming Engine)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS reward_events (
        id TEXT PRIMARY KEY NOT NULL,
        event_type TEXT NOT NULL,
        source_id TEXT NOT NULL,
        xp INTEGER NOT NULL DEFAULT 0,
        points INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        processed INTEGER NOT NULL DEFAULT 1
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_reward_events_unique ON reward_events(event_type, source_id);
      CREATE INDEX IF NOT EXISTS idx_reward_events_type ON reward_events(event_type);
    `);

    // 5. Badges Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        category TEXT NOT NULL,
        requirement_type TEXT NOT NULL,
        requirement_value INTEGER NOT NULL,
        is_hidden INTEGER NOT NULL DEFAULT 0,
        display_order INTEGER NOT NULL DEFAULT 0,
        is_unlocked INTEGER NOT NULL DEFAULT 0,
        unlocked_at TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_badges_cat ON badges(category);
      CREATE INDEX IF NOT EXISTS idx_badges_unlocked ON badges(is_unlocked);
      CREATE INDEX IF NOT EXISTS idx_badges_order ON badges(display_order ASC);
    `);

    // Seed 18 Initial Badges (Section 14 & 15)
    const initialBadges: [string, string, string, string, string, string, number, number, number][] = [
      ['badge_first_step', 'First Step', 'Complete your first topic', '🧭', 'LEARNING', 'TOPICS_COMPLETED', 1, 0, 1],
      ['badge_getting_started', 'Getting Started', 'Complete 10 topics', '🗺️', 'LEARNING', 'TOPICS_COMPLETED', 10, 0, 2],
      ['badge_knowledge_builder', 'Knowledge Builder', 'Complete 50 topics', '📚', 'LEARNING', 'TOPICS_COMPLETED', 50, 0, 3],
      ['badge_dedicated_learner', 'Dedicated Learner', 'Complete 100 topics', '🎓', 'LEARNING', 'TOPICS_COMPLETED', 100, 0, 4],
      ['badge_module_master', 'Module Master', 'Complete 10 modules', '⚔️', 'LEARNING', 'MODULES_COMPLETED', 10, 0, 5],
      ['badge_course_finisher', 'Course Finisher', 'Complete your first course', '🏆', 'COURSE', 'COURSES_COMPLETED', 1, 0, 6],
      ['badge_explorer', 'Explorer', 'Start 5 different courses', '⛵', 'COURSE', 'COURSES_STARTED', 5, 0, 7],
      ['badge_consistent_learner', 'Consistent Learner', 'Maintain a 7-day streak', '🔥', 'STREAK', 'STREAK_DAYS', 7, 0, 8],
      ['badge_one_month_journey', 'One Month Journey', 'Maintain a 30-day streak', '⭐', 'STREAK', 'STREAK_DAYS', 30, 0, 9],
      ['badge_century_streak', 'Century Sailor', 'Maintain a 100-day streak', '🌟', 'STREAK', 'STREAK_DAYS', 100, 0, 10],
      ['badge_practice_warrior', 'Practice Warrior', 'Complete 100 practice questions', '🎯', 'PRACTICE', 'PRACTICE_ATTEMPTS', 100, 0, 11],
      ['badge_accuracy_master', 'Accuracy Master', 'Reach 80% accuracy (min 50 questions)', '💎', 'PRACTICE', 'ACCURACY_RATE', 80, 0, 12],
      ['badge_speaker', 'Speaker', 'Complete 10 speaking sessions', '🎙️', 'SPEAKING', 'SPEAKING_SESSIONS', 10, 0, 13],
      ['badge_conversation_builder', 'Conversation Builder', 'Complete 25 speaking sessions', '🗣️', 'SPEAKING', 'SPEAKING_SESSIONS', 25, 0, 14],
      ['badge_goal_crusher', 'Goal Crusher', 'Complete 10 study goals', '🚩', 'GOALS', 'GOALS_COMPLETED', 10, 0, 15],
      ['badge_deep_diver', 'Deep Diver', 'Complete 10 hours of focused study', '⏳', 'MILESTONE', 'STUDY_HOURS', 10, 0, 16],
      ['badge_night_owl', 'Night Owl', 'Complete a study session after 10 PM', '🦉', 'SPECIAL', 'NIGHT_STUDY', 1, 1, 17],
      ['badge_early_bird', 'Early Bird', 'Complete a study session before 7 AM', '🌅', 'SPECIAL', 'EARLY_STUDY', 1, 1, 18],
    ];

    for (const [id, name, desc, icon, cat, reqType, reqVal, isHidden, dispOrder] of initialBadges) {
      await db.runAsync(
        `INSERT OR IGNORE INTO badges (
          id, name, description, icon, category,
          requirement_type, requirement_value, is_hidden,
          display_order, is_unlocked, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?);`,
        [id, name, desc, icon, cat, reqType, reqVal, isHidden, dispOrder, now]
      );
    }

    // 6. Enhance Achievements table with reward columns (Section 17, 18, 19)
    try {
      await db.execAsync(`ALTER TABLE achievements ADD COLUMN xp_reward INTEGER NOT NULL DEFAULT 50;`);
    } catch {
      // Column may already exist
    }
    try {
      await db.execAsync(`ALTER TABLE achievements ADD COLUMN points_reward INTEGER NOT NULL DEFAULT 20;`);
    } catch {
      // Column may already exist
    }
    try {
      await db.execAsync(`ALTER TABLE achievements ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0;`);
    } catch {
      // Column may already exist
    }

    // Seed/Update Comprehensive Initial Achievements (Section 18 & 19)
    const achievements: [string, string, string, string, string, string, number, number, number, number][] = [
      // Topic milestones
      ['ach_top_1', 'First Discovery', 'Complete your first topic', '🧭', 'LEARNING', 'TOPICS_COMPLETED', 1, 20, 10, 0],
      ['ach_top_10', 'Tenacious Explorer', 'Complete 10 topics', '🗺️', 'LEARNING', 'TOPICS_COMPLETED', 10, 50, 20, 0],
      ['ach_top_25', 'Quarter Century', 'Complete 25 topics', '📜', 'LEARNING', 'TOPICS_COMPLETED', 25, 100, 40, 0],
      ['ach_top_50', 'Knowledge Architect', 'Complete 50 topics', '📚', 'LEARNING', 'TOPICS_COMPLETED', 50, 200, 80, 0],
      ['ach_top_100', 'Centurion Scholar', 'Complete 100 topics', '🎓', 'LEARNING', 'TOPICS_COMPLETED', 100, 400, 150, 0],
      ['ach_top_250', 'Grand Line Sage', 'Complete 250 topics', '🏛️', 'LEARNING', 'TOPICS_COMPLETED', 250, 1000, 400, 0],
      ['ach_top_500', 'Master of the Seas', 'Complete 500 topics', '👑', 'LEARNING', 'TOPICS_COMPLETED', 500, 2000, 800, 0],

      // Module milestones
      ['ach_mod_1', 'First Island', 'Complete your first module', '🏝️', 'LEARNING', 'MODULES_COMPLETED', 1, 50, 20, 0],
      ['ach_mod_10', 'Archipelago Master', 'Complete 10 modules', '⚔️', 'LEARNING', 'MODULES_COMPLETED', 10, 200, 80, 0],
      ['ach_mod_25', 'Navigator Veteran', 'Complete 25 modules', '🛡️', 'LEARNING', 'MODULES_COMPLETED', 25, 500, 200, 0],
      ['ach_mod_50', 'Grand Line Ruler', 'Complete 50 modules', '🏰', 'LEARNING', 'MODULES_COMPLETED', 50, 1000, 500, 0],

      // Course milestones
      ['ach_course_1', 'Course Pioneer', 'Complete your first full course', '🏆', 'COURSE', 'COURSES_COMPLETED', 1, 250, 100, 0],
      ['ach_course_3', 'Triple Threat', 'Complete 3 complete courses', '🎖️', 'COURSE', 'COURSES_COMPLETED', 3, 600, 250, 0],
      ['ach_course_5', 'Fleet Commander', 'Complete 5 complete courses', '⚓', 'COURSE', 'COURSES_COMPLETED', 5, 1200, 500, 0],
      ['ach_course_10', 'King of Knowledge', 'Complete 10 complete courses', '👑', 'COURSE', 'COURSES_COMPLETED', 10, 2500, 1000, 0],

      // Study Session milestones
      ['ach_sess_1', 'First Voyage', 'Complete your first study session', '⏱️', 'TIME', 'STUDY_SESSIONS', 1, 30, 15, 0],
      ['ach_sess_10', 'Disciplined Sailor', 'Complete 10 study sessions', '⏰', 'TIME', 'STUDY_SESSIONS', 10, 100, 50, 0],
      ['ach_sess_50', 'Endurance Navigator', 'Complete 50 study sessions', '⌛', 'TIME', 'STUDY_SESSIONS', 50, 400, 150, 0],
      ['ach_sess_100', 'Iron Will', 'Complete 100 study sessions', '🛡️', 'TIME', 'STUDY_SESSIONS', 100, 800, 300, 0],

      // Study Time (Hours) milestones
      ['ach_time_10h', 'Ten Hour Journey', 'Study for 10 cumulative hours (600 mins)', '🕰️', 'TIME', 'STUDY_MINUTES', 600, 200, 80, 0],
      ['ach_time_25h', 'Deep Voyage', 'Study for 25 cumulative hours (1,500 mins)', '🌊', 'TIME', 'STUDY_MINUTES', 1500, 400, 150, 0],
      ['ach_time_50h', 'Half Century Vigil', 'Study for 50 cumulative hours (3,000 mins)', '⚓', 'TIME', 'STUDY_MINUTES', 3000, 800, 300, 0],
      ['ach_time_100h', 'Century of Dedication', 'Study for 100 cumulative hours (6,000 mins)', '💎', 'TIME', 'STUDY_MINUTES', 6000, 1500, 600, 0],
      ['ach_time_250h', 'Legendary Scholar', 'Study for 250 cumulative hours (15,000 mins)', '🌟', 'TIME', 'STUDY_MINUTES', 15000, 3000, 1200, 0],
      ['ach_time_500h', 'Eternal Explorer', 'Study for 500 cumulative hours (30,000 mins)', '🌌', 'TIME', 'STUDY_MINUTES', 30000, 6000, 2500, 0],

      // Streak milestones
      ['ach_streak_7', 'Week of Resolve', 'Maintain a 7-day study streak', '🔥', 'STREAK', 'STREAK_DAYS', 7, 150, 60, 0],
      ['ach_streak_14', 'Fortnight of Flame', 'Maintain a 14-day study streak', '⚡', 'STREAK', 'STREAK_DAYS', 14, 300, 120, 0],
      ['ach_streak_30', 'Monthly Triumph', 'Maintain a 30-day study streak', '🌟', 'STREAK', 'STREAK_DAYS', 30, 600, 250, 0],
      ['ach_streak_60', 'Unbroken Spirit', 'Maintain a 60-day study streak', '💫', 'STREAK', 'STREAK_DAYS', 60, 1200, 500, 0],
      ['ach_streak_100', 'Hundred Days of Glory', 'Maintain a 100-day study streak', '👑', 'STREAK', 'STREAK_DAYS', 100, 2000, 800, 0],

      // Goals milestones
      ['ach_goals_10', 'Goal Crusher', 'Complete 10 study goals', '🎯', 'GOAL', 'GOALS_COMPLETED', 10, 150, 60, 0],
      ['ach_goals_25', 'Target Master', 'Complete 25 study goals', '🏹', 'GOAL', 'GOALS_COMPLETED', 25, 350, 150, 0],

      // Practice & Speaking milestones
      ['ach_practice_100', 'Arena Gladiator', 'Complete 100 practice questions', '⚔️', 'PRACTICE', 'PRACTICE_ATTEMPTS', 100, 200, 80, 0],
      ['ach_speaking_25', 'Silver Tongue', 'Complete 25 speaking sessions', '🗣️', 'SPEAKING', 'SPEAKING_SESSIONS', 25, 250, 100, 0],

      // Hidden Achievements (Section 19)
      ['ach_night_owl', 'Night Owl', 'Complete a study session after 10 PM', '🦉', 'SPECIAL', 'NIGHT_STUDY', 1, 100, 50, 1],
      ['ach_early_bird', 'Early Bird', 'Complete a study session before 7 AM', '🌅', 'SPECIAL', 'EARLY_STUDY', 1, 100, 50, 1],
      ['ach_perfectionist', 'Flawless Voyage', 'Score 100% on a practice set of 10+ questions', '✨', 'SPECIAL', 'PERFECT_SET', 1, 150, 75, 1],
    ];

    for (const [id, title, desc, icon, cat, reqType, reqVal, xp, pts, isHidden] of achievements) {
      await db.runAsync(
        `INSERT INTO achievements (
          id, title, description, icon, category,
          requirement_type, requirement_value, xp_reward, points_reward,
          is_hidden, is_unlocked, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          description = excluded.description,
          icon = excluded.icon,
          category = excluded.category,
          requirement_type = excluded.requirement_type,
          requirement_value = excluded.requirement_value,
          xp_reward = excluded.xp_reward,
          points_reward = excluded.points_reward,
          is_hidden = excluded.is_hidden;`,
        [id, title, desc, icon, cat, reqType, reqVal, xp, pts, isHidden, now]
      );
    }

    // 7. Seed Gamification Settings in app_settings (Section 47)
    const settings = [
      ['gamification_show_xp_animations', 'true'],
      ['gamification_show_reward_popups', 'true'],
      ['gamification_play_reward_sounds', 'true'],
      ['gamification_show_achievement_notifications', 'true'],
      ['gamification_show_streak_celebrations', 'true'],
      ['gamification_enable_motivational_messages', 'true'],
    ];

    for (const [key, value] of settings) {
      await db.runAsync(
        `INSERT OR IGNORE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?);`,
        [key, value, now]
      );
    }
  },
};
