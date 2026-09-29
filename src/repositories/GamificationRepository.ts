import { DatabaseManager } from '../database/DatabaseManager';
import {
  RewardEventType,
  XpTransaction,
  PointsTransaction,
  Badge,
  BadgeCategory,
  GamificationAchievement,
  AchievementCategory,
  UserGamificationProfile,
  RewardResult,
  GamificationSettings,
  RewardEventRecord,
} from '../models/Gamification';
import { GamificationConfig, calculateLevelFromXp, getTitleForLevel } from '../constants/gamification';
import { generateId } from '../utils/idGenerator';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class GamificationRepository {
  private db = DatabaseManager.getInstance();
  private static instance: GamificationRepository | null = null;

  public static getInstance(): GamificationRepository {
    if (!GamificationRepository.instance) {
      GamificationRepository.instance = new GamificationRepository();
    }
    return GamificationRepository.instance;
  }

  // =========================================================================
  // 1. REWARD DISPATCHER WITH IDEMPOTENCY (Section 5, 6, 7, 12, 13)
  // =========================================================================

  /**
   * Awards XP and Points safely with strict duplicate protection (idempotency).
   * Unchecking and checking an item will NOT award duplicate XP.
   */
  async awardReward(params: {
    event_type: RewardEventType;
    source_id: string;
    course_id?: string | null;
    module_id?: string | null;
    topic_id?: string | null;
    custom_xp?: number;
    custom_points?: number;
    description?: string;
  }): Promise<RewardResult> {
    const database = await this.db.getDatabase();
    const now = getCurrentTimestamp();

    // 1. Check idempotency in reward_events table
    const existing = await database.getFirstAsync<RewardEventRecord>(
      'SELECT id FROM reward_events WHERE event_type = ? AND source_id = ?;',
      [params.event_type, params.source_id]
    );

    if (existing) {
      return {
        awarded: false,
        reason: 'ALREADY_AWARDED',
        event_type: params.event_type,
        source_id: params.source_id,
        xpAwarded: 0,
        pointsAwarded: 0,
        levelUpOccurred: false,
        unlockedBadges: [],
        unlockedAchievements: [],
        description: 'Reward already claimed.',
      };
    }

    // 2. Resolve default XP and Points from centralized GamificationConfig
    let xpAmount = params.custom_xp ?? 0;
    let pointsAmount = params.custom_points ?? 0;

    if (params.custom_xp === undefined || params.custom_points === undefined) {
      const defaults = this.getDefaultRewards(params.event_type);
      if (params.custom_xp === undefined) xpAmount = defaults.xp;
      if (params.custom_points === undefined) pointsAmount = defaults.points;
    }

    const description = params.description || this.getDefaultDescription(params.event_type, params.source_id);

    let levelUpOccurred = false;
    let oldLevel = 1;
    let newLevel = 1;
    const unlockedBadges: Badge[] = [];
    const unlockedAchievements: GamificationAchievement[] = [];

    await database.withTransactionAsync(async () => {
      // Record reward event for strict idempotency
      const eventId = generateId('re_');
      await database.runAsync(
        `INSERT INTO reward_events (id, event_type, source_id, xp, points, created_at, processed)
         VALUES (?, ?, ?, ?, ?, ?, 1);`,
        [eventId, params.event_type, params.source_id, xpAmount, pointsAmount, now]
      );

      // Fetch current profile
      let profile = await database.getFirstAsync<any>(
        'SELECT * FROM gamification_profile WHERE id = ?;',
        ['default_user']
      );

      if (!profile) {
        await database.runAsync(
          `INSERT OR IGNORE INTO gamification_profile (
            id, total_xp, current_level, current_level_xp, next_level_xp,
            level_progress_percentage, level_title, points_balance,
            total_points_earned, total_points_spent, badges_unlocked_count,
            achievements_unlocked_count, updated_at
          ) VALUES ('default_user', 0, 1, 0, 100, 0.0, 'Cabin Boy Explorer', 0, 0, 0, 0, 0, ?);`,
          [now]
        );
        profile = {
          total_xp: 0,
          current_level: 1,
          points_balance: 0,
          total_points_earned: 0,
        };
      }

      oldLevel = profile.current_level || 1;
      const newTotalXp = (profile.total_xp || 0) + xpAmount;
      const newPointsBalance = (profile.points_balance || 0) + pointsAmount;
      const newTotalPointsEarned = (profile.total_points_earned || 0) + pointsAmount;

      // Calculate new level from XP formula (Section 9 & 10)
      const levelMeta = calculateLevelFromXp(newTotalXp);
      newLevel = levelMeta.level;
      levelUpOccurred = newLevel > oldLevel;

      // Record XP transaction (Section 6)
      if (xpAmount > 0) {
        const xpTxId = generateId('xptx_');
        await database.runAsync(
          `INSERT INTO xp_transactions (
            id, user_id, event_type, source_id, course_id, module_id, topic_id,
            xp_amount, description, created_at
          ) VALUES (?, 'default_user', ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            xpTxId,
            params.event_type,
            params.source_id,
            params.course_id || null,
            params.module_id || null,
            params.topic_id || null,
            xpAmount,
            description,
            now,
          ]
        );
      }

      // Record Points transaction (Section 13)
      if (pointsAmount > 0) {
        const ptsTxId = generateId('ptstx_');
        await database.runAsync(
          `INSERT INTO points_transactions (
            id, user_id, transaction_type, event_type, source_id,
            points_amount, balance_after, description, created_at
          ) VALUES (?, 'default_user', 'EARNED', ?, ?, ?, ?, ?, ?);`,
          [
            ptsTxId,
            params.event_type,
            params.source_id,
            pointsAmount,
            newPointsBalance,
            description,
            now,
          ]
        );
      }

      // Update profile
      await database.runAsync(
        `UPDATE gamification_profile SET
          total_xp = ?,
          current_level = ?,
          current_level_xp = ?,
          next_level_xp = ?,
          level_progress_percentage = ?,
          level_title = ?,
          points_balance = ?,
          total_points_earned = ?,
          updated_at = ?
        WHERE id = 'default_user';`,
        [
          newTotalXp,
          levelMeta.level,
          levelMeta.currentLevelXp,
          levelMeta.nextLevelXp,
          levelMeta.progressPercentage,
          levelMeta.title,
          newPointsBalance,
          newTotalPointsEarned,
          now,
        ]
      );
    });

    // Check for badge and achievement unlocks triggered by this activity
    try {
      const newlyUnlockedBadges = await this.checkAndUnlockBadges();
      unlockedBadges.push(...newlyUnlockedBadges);

      const newlyUnlockedAchievements = await this.checkAndUnlockAchievements();
      unlockedAchievements.push(...newlyUnlockedAchievements);
    } catch (e) {
      console.warn('Error checking badges/achievements after reward:', e);
    }

    return {
      awarded: true,
      reason: 'SUCCESS',
      event_type: params.event_type,
      source_id: params.source_id,
      xpAwarded: xpAmount,
      pointsAwarded: pointsAmount,
      levelUpOccurred,
      oldLevel,
      newLevel,
      unlockedBadges,
      unlockedAchievements,
      description,
    };
  }

  // =========================================================================
  // 2. PROFILE & TOTALS (Section 2, 10, 46)
  // =========================================================================

  /**
   * Retrieves complete user gamification profile.
   * Cross-checks with database aggregations for rock-solid consistency.
   */
  async getGamificationProfile(): Promise<UserGamificationProfile> {
    const database = await this.db.getDatabase();

    const profileRow = await database.getFirstAsync<any>(
      'SELECT * FROM gamification_profile WHERE id = ?;',
      ['default_user']
    );

    // Cross-verify totals from ledger (Data Integrity - Section 46)
    const [xpLedger, ptsLedger, badgesCount, achCount, streakData] = await Promise.all([
      database.getFirstAsync<{ total: number }>('SELECT COALESCE(SUM(xp_amount), 0) as total FROM xp_transactions;'),
      database.getFirstAsync<{ earned: number; spent: number }>(`
        SELECT 
          COALESCE(SUM(CASE WHEN transaction_type = 'EARNED' THEN points_amount ELSE 0 END), 0) as earned,
          COALESCE(SUM(CASE WHEN transaction_type = 'SPENT' THEN points_amount ELSE 0 END), 0) as spent
        FROM points_transactions;
      `),
      database.getFirstAsync<{ unlocked: number; total: number }>(`
        SELECT 
          SUM(CASE WHEN is_unlocked = 1 THEN 1 ELSE 0 END) as unlocked,
          COUNT(*) as total
        FROM badges;
      `),
      database.getFirstAsync<{ unlocked: number; total: number }>(`
        SELECT 
          SUM(CASE WHEN is_unlocked = 1 THEN 1 ELSE 0 END) as unlocked,
          COUNT(*) as total
        FROM achievements;
      `),
      this.calculateStreak(),
    ]);

    const ledgerXp = xpLedger?.total ?? 0;
    const ledgerPointsEarned = ptsLedger?.earned ?? 0;
    const ledgerPointsSpent = ptsLedger?.spent ?? 0;
    const ledgerPointsBalance = ledgerPointsEarned - ledgerPointsSpent;

    // Use ledger-derived values if profile row is missing or out of sync
    const totalXp = Math.max(profileRow?.total_xp || 0, ledgerXp);
    const levelMeta = calculateLevelFromXp(totalXp);

    const bUnlocked = badgesCount?.unlocked || 0;
    const bTotal = badgesCount?.total || 0;
    const aUnlocked = achCount?.unlocked || 0;
    const aTotal = achCount?.total || 0;

    return {
      total_xp: totalXp,
      current_level: levelMeta.level,
      current_level_xp: levelMeta.currentLevelXp,
      next_level_xp: levelMeta.nextLevelXp,
      level_progress_percentage: levelMeta.progressPercentage,
      level_title: levelMeta.title,
      points_balance: Math.max(0, ledgerPointsBalance),
      total_points_earned: ledgerPointsEarned,
      total_points_spent: ledgerPointsSpent,
      badges_unlocked_count: bUnlocked,
      badges_total_count: bTotal,
      achievements_unlocked_count: aUnlocked,
      achievements_total_count: aTotal,
      current_streak: streakData.currentStreak,
      longest_streak: streakData.longestStreak,
      updated_at: profileRow?.updated_at || getCurrentTimestamp(),
    };
  }

  // =========================================================================
  // 3. BADGE REQUIREMENT EVALUATION ENGINE (Section 14, 15, 16)
  // =========================================================================

  /**
   * Evaluates real learning data against locked badges and unlocks any fulfilled badges.
   */
  async checkAndUnlockBadges(): Promise<Badge[]> {
    const database = await this.db.getDatabase();
    const lockedBadges = await database.getAllAsync<any>(
      'SELECT * FROM badges WHERE is_unlocked = 0;'
    );

    if (lockedBadges.length === 0) return [];

    const stats = await this.collectUserLearningStats();
    const newlyUnlocked: Badge[] = [];
    const now = getCurrentTimestamp();

    for (const b of lockedBadges) {
      let isFulfilled = false;

      switch (b.requirement_type) {
        case 'TOPICS_COMPLETED':
          isFulfilled = stats.topicsCompleted >= b.requirement_value;
          break;
        case 'MODULES_COMPLETED':
          isFulfilled = stats.modulesCompleted >= b.requirement_value;
          break;
        case 'COURSES_COMPLETED':
          isFulfilled = stats.coursesCompleted >= b.requirement_value;
          break;
        case 'COURSES_STARTED':
          isFulfilled = stats.coursesStarted >= b.requirement_value;
          break;
        case 'STREAK_DAYS':
          isFulfilled = stats.streakDays >= b.requirement_value;
          break;
        case 'PRACTICE_ATTEMPTS':
          isFulfilled = stats.practiceAttempts >= b.requirement_value;
          break;
        case 'ACCURACY_RATE':
          isFulfilled = stats.practiceAttempts >= 50 && stats.accuracyRate >= b.requirement_value;
          break;
        case 'SPEAKING_SESSIONS':
          isFulfilled = stats.speakingSessions >= b.requirement_value;
          break;
        case 'GOALS_COMPLETED':
          isFulfilled = stats.goalsCompleted >= b.requirement_value;
          break;
        case 'STUDY_HOURS':
          isFulfilled = stats.studyMinutes >= b.requirement_value * 60;
          break;
        case 'NIGHT_STUDY':
          isFulfilled = stats.hasNightSession;
          break;
        case 'EARLY_STUDY':
          isFulfilled = stats.hasEarlySession;
          break;
      }

      if (isFulfilled) {
        await database.runAsync(
          'UPDATE badges SET is_unlocked = 1, unlocked_at = ? WHERE id = ?;',
          [now, b.id]
        );

        // Record reward event for the badge
        const badgeRewardXp = 50;
        const badgeRewardPts = 25;
        const eventId = generateId('re_');
        await database.runAsync(
          `INSERT OR IGNORE INTO reward_events (id, event_type, source_id, xp, points, created_at, processed)
           VALUES (?, 'BADGE_UNLOCKED', ?, ?, ?, ?, 1);`,
          [eventId, b.id, badgeRewardXp, badgeRewardPts, now]
        );

        newlyUnlocked.push({
          id: b.id,
          name: b.name,
          description: b.description,
          icon: b.icon,
          category: b.category,
          requirement_type: b.requirement_type,
          requirement_value: b.requirement_value,
          is_hidden: b.is_hidden === 1,
          display_order: b.display_order,
          is_unlocked: true,
          unlocked_at: now,
        });
      }
    }

    if (newlyUnlocked.length > 0) {
      await database.runAsync(
        `UPDATE gamification_profile SET
          badges_unlocked_count = badges_unlocked_count + ?,
          updated_at = ?
        WHERE id = 'default_user';`,
        [newlyUnlocked.length, now]
      );
    }

    return newlyUnlocked;
  }

  // =========================================================================
  // 4. ACHIEVEMENT EVALUATION ENGINE (Section 17, 18, 19, 20)
  // =========================================================================

  /**
   * Evaluates real learning data against locked achievements and unlocks fulfilled ones.
   */
  async checkAndUnlockAchievements(): Promise<GamificationAchievement[]> {
    const database = await this.db.getDatabase();
    const lockedAch = await database.getAllAsync<any>(
      'SELECT * FROM achievements WHERE is_unlocked = 0;'
    );

    if (lockedAch.length === 0) return [];

    const stats = await this.collectUserLearningStats();
    const newlyUnlocked: GamificationAchievement[] = [];
    const now = getCurrentTimestamp();

    for (const a of lockedAch) {
      let isFulfilled = false;

      switch (a.requirement_type) {
        case 'TOPICS_COMPLETED':
          isFulfilled = stats.topicsCompleted >= a.requirement_value;
          break;
        case 'MODULES_COMPLETED':
          isFulfilled = stats.modulesCompleted >= a.requirement_value;
          break;
        case 'COURSES_COMPLETED':
          isFulfilled = stats.coursesCompleted >= a.requirement_value;
          break;
        case 'STUDY_SESSIONS':
          isFulfilled = stats.studySessionsCount >= a.requirement_value;
          break;
        case 'STUDY_MINUTES':
          isFulfilled = stats.studyMinutes >= a.requirement_value;
          break;
        case 'STREAK_DAYS':
          isFulfilled = stats.streakDays >= a.requirement_value;
          break;
        case 'GOALS_COMPLETED':
          isFulfilled = stats.goalsCompleted >= a.requirement_value;
          break;
        case 'PRACTICE_ATTEMPTS':
          isFulfilled = stats.practiceAttempts >= a.requirement_value;
          break;
        case 'SPEAKING_SESSIONS':
          isFulfilled = stats.speakingSessions >= a.requirement_value;
          break;
        case 'NIGHT_STUDY':
          isFulfilled = stats.hasNightSession;
          break;
        case 'EARLY_STUDY':
          isFulfilled = stats.hasEarlySession;
          break;
        case 'PERFECT_SET':
          isFulfilled = stats.hasPerfectSet;
          break;
      }

      if (isFulfilled) {
        await database.runAsync(
          'UPDATE achievements SET is_unlocked = 1, unlocked_at = ? WHERE id = ?;',
          [now, a.id]
        );

        // Award achievement reward XP & Points
        const xp = a.xp_reward || 50;
        const pts = a.points_reward || 20;

        await this.awardReward({
          event_type: 'ACHIEVEMENT_UNLOCKED',
          source_id: a.id,
          custom_xp: xp,
          custom_points: pts,
          description: `Unlocked achievement: ${a.title}`,
        });

        newlyUnlocked.push({
          id: a.id,
          title: a.title,
          description: a.description,
          icon: a.icon,
          category: a.category,
          requirement_type: a.requirement_type,
          requirement_value: a.requirement_value,
          xp_reward: xp,
          points_reward: pts,
          is_hidden: a.is_hidden === 1,
          is_unlocked: true,
          unlocked_at: now,
        });
      }
    }

    if (newlyUnlocked.length > 0) {
      await database.runAsync(
        `UPDATE gamification_profile SET
          achievements_unlocked_count = achievements_unlocked_count + ?,
          updated_at = ?
        WHERE id = 'default_user';`,
        [newlyUnlocked.length, now]
      );
    }

    return newlyUnlocked;
  }

  // =========================================================================
  // 5. BADGES & ACHIEVEMENTS RETRIEVAL (Section 21, 22)
  // =========================================================================

  /**
   * Retrieves all badges with category, locked/unlocked state, and progress percentage.
   */
  async getAllBadges(category?: BadgeCategory | 'ALL'): Promise<Badge[]> {
    const database = await this.db.getDatabase();
    const stats = await this.collectUserLearningStats();

    const query = category && category !== 'ALL'
      ? 'SELECT * FROM badges WHERE category = ? ORDER BY display_order ASC;'
      : 'SELECT * FROM badges ORDER BY display_order ASC;';
    const params = category && category !== 'ALL' ? [category] : [];

    const rows = await database.getAllAsync<any>(query, params);

    return rows.map((b) => {
      const isUnlocked = b.is_unlocked === 1;
      const currentProgress = this.getCurrentProgressForRequirement(b.requirement_type, stats);
      const reqVal = b.requirement_value || 1;
      const progressPercentage = isUnlocked
        ? 100
        : Math.min(100, Math.round((currentProgress / reqVal) * 100));

      return {
        id: b.id,
        name: b.name,
        description: b.is_hidden === 1 && !isUnlocked ? 'Mystery Badge. Keep exploring to reveal!' : b.description,
        icon: b.icon,
        category: b.category,
        requirement_type: b.requirement_type,
        requirement_value: reqVal,
        is_hidden: b.is_hidden === 1,
        display_order: b.display_order,
        is_unlocked: isUnlocked,
        unlocked_at: b.unlocked_at,
        current_progress: currentProgress,
        progress_percentage: progressPercentage,
      };
    });
  }

  /**
   * Retrieves all achievements with unlock states, progress values, and percentage.
   */
  async getAllAchievements(filter: 'all' | 'unlocked' | 'locked' = 'all'): Promise<GamificationAchievement[]> {
    const database = await this.db.getDatabase();
    const stats = await this.collectUserLearningStats();

    let query = 'SELECT * FROM achievements';
    if (filter === 'unlocked') query += ' WHERE is_unlocked = 1';
    if (filter === 'locked') query += ' WHERE is_unlocked = 0';
    query += ' ORDER BY is_unlocked DESC, requirement_value ASC;';

    const rows = await database.getAllAsync<any>(query);

    return rows.map((a) => {
      const isUnlocked = a.is_unlocked === 1;
      const currentProgress = this.getCurrentProgressForRequirement(a.requirement_type, stats);
      const reqVal = a.requirement_value || 1;
      const progressPercentage = isUnlocked
        ? 100
        : Math.min(100, Math.round((currentProgress / reqVal) * 100));

      return {
        id: a.id,
        title: a.is_hidden === 1 && !isUnlocked ? 'Mystery Achievement' : a.title,
        description: a.is_hidden === 1 && !isUnlocked ? 'Keep learning to discover it.' : a.description,
        icon: a.icon,
        category: a.category,
        requirement_type: a.requirement_type,
        requirement_value: reqVal,
        xp_reward: a.xp_reward || 50,
        points_reward: a.points_reward || 20,
        is_hidden: a.is_hidden === 1,
        is_unlocked: isUnlocked,
        unlocked_at: a.unlocked_at,
        current_progress: currentProgress,
        progress_percentage: progressPercentage,
      };
    });
  }

  // =========================================================================
  // 6. TRANSACTION HISTORY & SPENDING (Section 6, 12, 13)
  // =========================================================================

  async getXpTransactions(limit = 50): Promise<XpTransaction[]> {
    const database = await this.db.getDatabase();
    return database.getAllAsync<XpTransaction>(
      'SELECT * FROM xp_transactions ORDER BY created_at DESC LIMIT ?;',
      [limit]
    );
  }

  async getPointsTransactions(limit = 50): Promise<PointsTransaction[]> {
    const database = await this.db.getDatabase();
    return database.getAllAsync<PointsTransaction>(
      'SELECT * FROM points_transactions ORDER BY created_at DESC LIMIT ?;',
      [limit]
    );
  }

  /**
   * Spends user points with balance verification and transaction recording.
   */
  async spendPoints(amount: number, description: string, source_id: string): Promise<{ success: boolean; newBalance: number; message: string }> {
    if (amount <= 0) return { success: false, newBalance: 0, message: 'Invalid point amount.' };

    const database = await this.db.getDatabase();
    const profile = await this.getGamificationProfile();

    if (profile.points_balance < amount) {
      return {
        success: false,
        newBalance: profile.points_balance,
        message: 'Insufficient points balance.',
      };
    }

    const now = getCurrentTimestamp();
    const newBalance = profile.points_balance - amount;
    const txId = generateId('ptstx_');

    await database.withTransactionAsync(async () => {
      await database.runAsync(
        `INSERT INTO points_transactions (
          id, user_id, transaction_type, event_type, source_id,
          points_amount, balance_after, description, created_at
        ) VALUES (?, 'default_user', 'SPENT', 'STORE_PURCHASE', ?, ?, ?, ?, ?);`,
        [txId, source_id, amount, newBalance, description, now]
      );

      await database.runAsync(
        `UPDATE gamification_profile SET
          points_balance = ?,
          total_points_spent = total_points_spent + ?,
          updated_at = ?
        WHERE id = 'default_user';`,
        [newBalance, amount, now]
      );
    });

    return {
      success: true,
      newBalance,
      message: 'Points spent successfully.',
    };
  }

  // =========================================================================
  // 7. SETTINGS & RESET (Section 44, 47)
  // =========================================================================

  async getGamificationSettings(): Promise<GamificationSettings> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<{ key: string; value: string }>(
      "SELECT key, value FROM app_settings WHERE key LIKE 'gamification_%';"
    );
    const map = new Map(rows.map((r) => [r.key, r.value]));

    return {
      show_xp_animations: map.get('gamification_show_xp_animations') !== 'false',
      show_reward_popups: map.get('gamification_show_reward_popups') !== 'false',
      play_reward_sounds: map.get('gamification_play_reward_sounds') !== 'false',
      show_achievement_notifications: map.get('gamification_show_achievement_notifications') !== 'false',
      show_streak_celebrations: map.get('gamification_show_streak_celebrations') !== 'false',
      enable_motivational_messages: map.get('gamification_enable_motivational_messages') !== 'false',
    };
  }

  async updateGamificationSettings(settings: Partial<GamificationSettings>): Promise<void> {
    const database = await this.db.getDatabase();
    const now = getCurrentTimestamp();

    for (const [k, v] of Object.entries(settings)) {
      const dbKey = `gamification_${k}`;
      await database.runAsync(
        `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
        [dbKey, String(v), now]
      );
    }
  }

  /**
   * Resets gamification progress cleanly on user command (Section 44).
   */
  async resetGamificationData(): Promise<void> {
    const database = await this.db.getDatabase();
    const now = getCurrentTimestamp();

    await database.withTransactionAsync(async () => {
      await database.runAsync('DELETE FROM xp_transactions;');
      await database.runAsync('DELETE FROM points_transactions;');
      await database.runAsync('DELETE FROM reward_events;');
      await database.runAsync('UPDATE badges SET is_unlocked = 0, unlocked_at = NULL;');
      await database.runAsync('UPDATE achievements SET is_unlocked = 0, unlocked_at = NULL;');
      await database.runAsync(
        `UPDATE gamification_profile SET
          total_xp = 0,
          current_level = 1,
          current_level_xp = 0,
          next_level_xp = 100,
          level_progress_percentage = 0.0,
          level_title = 'Cabin Boy Explorer',
          points_balance = 0,
          total_points_earned = 0,
          total_points_spent = 0,
          badges_unlocked_count = 0,
          achievements_unlocked_count = 0,
          updated_at = ?
        WHERE id = 'default_user';`,
        [now]
      );
    });
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  private async collectUserLearningStats() {
    const database = await this.db.getDatabase();

    const [
      topicsRow,
      modulesRow,
      coursesRow,
      startedCoursesRow,
      sessionsRow,
      timeRow,
      practiceRow,
      speakingRow,
      goalsRow,
      nightRow,
      earlyRow,
      streakData,
    ] = await Promise.all([
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM topics WHERE is_completed = 1;'),
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM modules WHERE is_completed = 1;'),
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM courses WHERE is_completed = 1;'),
      database.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM courses WHERE started_at IS NOT NULL OR completed_modules > 0;"),
      database.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM study_sessions WHERE status = 'COMPLETED';"),
      database.getFirstAsync<{ totalMins: number }>("SELECT COALESCE(SUM(duration_minutes), 0) as totalMins FROM study_sessions WHERE status = 'COMPLETED';"),
      database.getFirstAsync<{ attempts: number; correct: number }>(`
        SELECT 
          COUNT(*) as attempts,
          COALESCE(SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END), 0) as correct
        FROM practice_attempts;
      `),
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM speaking_sessions;'),
      database.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM study_goals WHERE status = 'COMPLETED';"),
      database.getFirstAsync<{ count: number }>(`
        SELECT COUNT(*) as count FROM study_sessions
        WHERE status = 'COMPLETED' AND (strftime('%H', started_at) >= '22' OR strftime('%H', started_at) < '04');
      `),
      database.getFirstAsync<{ count: number }>(`
        SELECT COUNT(*) as count FROM study_sessions
        WHERE status = 'COMPLETED' AND strftime('%H', started_at) >= '04' AND strftime('%H', started_at) < '07';
      `),
      this.calculateStreak(),
    ]);

    const practiceAttempts = practiceRow?.attempts || 0;
    const practiceCorrect = practiceRow?.correct || 0;
    const accuracyRate = practiceAttempts > 0 ? Math.round((practiceCorrect / practiceAttempts) * 100) : 0;

    return {
      topicsCompleted: topicsRow?.count || 0,
      modulesCompleted: modulesRow?.count || 0,
      coursesCompleted: coursesRow?.count || 0,
      coursesStarted: startedCoursesRow?.count || 0,
      studySessionsCount: sessionsRow?.count || 0,
      studyMinutes: timeRow?.totalMins || 0,
      practiceAttempts,
      practiceCorrect,
      accuracyRate,
      speakingSessions: speakingRow?.count || 0,
      goalsCompleted: goalsRow?.count || 0,
      streakDays: streakData.currentStreak,
      hasNightSession: (nightRow?.count || 0) > 0,
      hasEarlySession: (earlyRow?.count || 0) > 0,
      hasPerfectSet: practiceAttempts >= 10 && accuracyRate === 100,
    };
  }

  private getCurrentProgressForRequirement(reqType: string, stats: any): number {
    switch (reqType) {
      case 'TOPICS_COMPLETED':
        return stats.topicsCompleted;
      case 'MODULES_COMPLETED':
        return stats.modulesCompleted;
      case 'COURSES_COMPLETED':
        return stats.coursesCompleted;
      case 'COURSES_STARTED':
        return stats.coursesStarted;
      case 'STREAK_DAYS':
        return stats.streakDays;
      case 'PRACTICE_ATTEMPTS':
        return stats.practiceAttempts;
      case 'ACCURACY_RATE':
        return stats.accuracyRate;
      case 'SPEAKING_SESSIONS':
        return stats.speakingSessions;
      case 'GOALS_COMPLETED':
        return stats.goalsCompleted;
      case 'STUDY_HOURS':
        return Math.floor(stats.studyMinutes / 60);
      case 'STUDY_MINUTES':
        return stats.studyMinutes;
      case 'STUDY_SESSIONS':
        return stats.studySessionsCount;
      case 'NIGHT_STUDY':
        return stats.hasNightSession ? 1 : 0;
      case 'EARLY_STUDY':
        return stats.hasEarlySession ? 1 : 0;
      case 'PERFECT_SET':
        return stats.hasPerfectSet ? 1 : 0;
      default:
        return 0;
    }
  }

  private async calculateStreak(): Promise<{ currentStreak: number; longestStreak: number }> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<{ d: string }>(`
      SELECT DISTINCT date_str as d FROM learning_activity
      WHERE date_str IS NOT NULL
      ORDER BY date_str DESC;
    `);

    if (rows.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const uniqueDays = rows.map((r) => r.d);
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Current streak requires activity today or yesterday
    const firstDay = uniqueDays[0];
    const isCurrentActive = firstDay === todayStr || firstDay === yesterdayStr;

    let prevDate: Date | null = null;
    for (let i = 0; i < uniqueDays.length; i++) {
      const curDate = new Date(uniqueDays[i]);
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const diffMs = prevDate.getTime() - curDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      prevDate = curDate;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    if (isCurrentActive) {
      let runDate = new Date(firstDay);
      currentStreak = 1;
      for (let i = 1; i < uniqueDays.length; i++) {
        const nextDate = new Date(uniqueDays[i]);
        const diff = Math.round((runDate.getTime() - nextDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          currentStreak++;
          runDate = nextDate;
        } else {
          break;
        }
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
    };
  }

  private getDefaultRewards(eventType: RewardEventType): { xp: number; points: number } {
    switch (eventType) {
      case 'TOPIC_COMPLETED':
        return { xp: GamificationConfig.topicXp, points: GamificationConfig.topicPoints };
      case 'MODULE_COMPLETED':
        return { xp: GamificationConfig.moduleXp, points: GamificationConfig.modulePoints };
      case 'COURSE_COMPLETED':
        return { xp: GamificationConfig.courseXp, points: GamificationConfig.coursePoints };
      case 'STUDY_SESSION_COMPLETED':
        return { xp: GamificationConfig.studySessionXp, points: GamificationConfig.studySessionPoints };
      case 'DAILY_GOAL_COMPLETED':
        return { xp: GamificationConfig.dailyGoalXp, points: GamificationConfig.dailyGoalPoints };
      case 'WEEKLY_GOAL_COMPLETED':
        return { xp: GamificationConfig.weeklyGoalXp, points: GamificationConfig.weeklyGoalPoints };
      case 'MONTHLY_GOAL_COMPLETED':
        return { xp: GamificationConfig.monthlyGoalXp, points: GamificationConfig.monthlyGoalPoints };
      case 'PRACTICE_CORRECT':
        return { xp: GamificationConfig.practiceCorrectXp, points: GamificationConfig.practiceCorrectPoints };
      case 'PRACTICE_SET_COMPLETED':
        return { xp: GamificationConfig.practiceSetXp, points: GamificationConfig.practiceSetPoints };
      case 'SPEAKING_SESSION_COMPLETED':
        return { xp: GamificationConfig.speakingSessionXp, points: GamificationConfig.speakingSessionPoints };
      case 'SPEAKING_TOPIC_COMPLETED':
        return { xp: GamificationConfig.speakingTopicXp, points: GamificationConfig.speakingTopicPoints };
      case 'REVISION_SESSION':
        return { xp: GamificationConfig.revisionSessionXp, points: GamificationConfig.revisionSessionPoints };
      default:
        return { xp: 10, points: 5 };
    }
  }

  private getDefaultDescription(eventType: RewardEventType, sourceId: string): string {
    switch (eventType) {
      case 'TOPIC_COMPLETED':
        return `Completed topic: ${sourceId}`;
      case 'MODULE_COMPLETED':
        return `Conquered module: ${sourceId}`;
      case 'COURSE_COMPLETED':
        return `Mastered course: ${sourceId}`;
      case 'STUDY_SESSION_COMPLETED':
        return 'Finished focused study session';
      case 'DAILY_GOAL_COMPLETED':
        return 'Achieved daily study goal';
      case 'WEEKLY_GOAL_COMPLETED':
        return 'Achieved weekly target';
      case 'MONTHLY_GOAL_COMPLETED':
        return 'Completed monthly milestone';
      case 'PRACTICE_CORRECT':
        return 'Correct practice question';
      case 'PRACTICE_SET_COMPLETED':
        return 'Completed practice challenge set';
      case 'SPEAKING_SESSION_COMPLETED':
        return 'Finished English speaking practice';
      case 'SPEAKING_TOPIC_COMPLETED':
        return 'Mastered speaking conversation topic';
      case 'STREAK_MILESTONE':
        return `Reached ${sourceId} streak milestone`;
      case 'REVISION_SESSION':
        return 'Completed spaced revision';
      default:
        return `Gamification reward for ${eventType}`;
    }
  }
}

export const gamificationRepository = GamificationRepository.getInstance();
