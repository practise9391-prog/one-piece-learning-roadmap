import { DatabaseManager } from '../database/DatabaseManager';
import {
  MotivationEntry,
  MotivationCategory,
  DailyGoal,
  DailyChallenge,
  Achievement,
  DailySummary,
  DayGoalHistory,
  WeeklyLearningSummary,
  GoalType,
} from '../models/Motivation';
import { activityRepository, getLocalDateString } from './ActivityRepository';
import { generateId } from '../utils/idGenerator';

export class MotivationRepository {
  private db = DatabaseManager.getInstance();

  /**
   * Fetches or deterministically rotates today's daily motivation quote.
   */
  async getTodayMotivation(dateStr: string = getLocalDateString()): Promise<MotivationEntry> {
    const database = await this.db.getDatabase();

    // 1. Check if a quote is already recorded for today in motivation_history
    const historyRow = await database.getFirstAsync<{ motivation_id: string }>(
      'SELECT motivation_id FROM motivation_history WHERE date = ?;',
      [dateStr]
    );

    if (historyRow) {
      const entry = await database.getFirstAsync<any>(
        'SELECT * FROM motivation_entries WHERE id = ?;',
        [historyRow.motivation_id]
      );
      if (entry) {
        return {
          id: entry.id,
          message: entry.message,
          author: entry.author,
          category: entry.category,
          is_favorite: entry.is_favorite === 1,
          is_active: entry.is_active === 1,
          created_at: entry.created_at,
        };
      }
    }

    // 2. Select a quote by deterministic date rotation
    const allQuotes = await database.getAllAsync<any>(
      'SELECT * FROM motivation_entries WHERE is_active = 1 ORDER BY id ASC;'
    );

    if (allQuotes.length === 0) {
      return {
        id: 'fallback_1',
        message: 'Every completed topic is another step forward across the Grand Line.',
        author: 'Grand Line Captain',
        category: 'GENERAL',
        is_favorite: false,
        is_active: true,
        created_at: new Date().toISOString(),
      };
    }

    // Use date hash for stable rotation across app restarts
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
    }
    const selected = allQuotes[hash % allQuotes.length];

    // Save into history
    const histId = generateId('mhist');
    const now = new Date().toISOString();
    await database.runAsync(
      `INSERT OR REPLACE INTO motivation_history (id, motivation_id, date, shown_at)
       VALUES (?, ?, ?, ?);`,
      [histId, selected.id, dateStr, now]
    );

    return {
      id: selected.id,
      message: selected.message,
      author: selected.author,
      category: selected.category,
      is_favorite: selected.is_favorite === 1,
      is_active: selected.is_active === 1,
      created_at: selected.created_at,
    };
  }

  /**
   * Fetches all motivation quotes for browsing, optionally by category or favorites.
   */
  async getAllMotivations(
    category?: MotivationCategory | 'ALL',
    favoritesOnly: boolean = false
  ): Promise<MotivationEntry[]> {
    const database = await this.db.getDatabase();
    const conditions: string[] = ['is_active = 1'];
    const params: any[] = [];

    if (category && category !== 'ALL') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (favoritesOnly) {
      conditions.push('is_favorite = 1');
    }

    const where = conditions.join(' AND ');
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM motivation_entries WHERE ${where} ORDER BY created_at DESC;`,
      params
    );

    return rows.map((r) => ({
      id: r.id,
      message: r.message,
      author: r.author,
      category: r.category,
      is_favorite: r.is_favorite === 1,
      is_active: r.is_active === 1,
      created_at: r.created_at,
    }));
  }

  /**
   * Toggles a motivation quote's favorite status.
   */
  async toggleFavorite(id: string): Promise<boolean> {
    const database = await this.db.getDatabase();
    const current = await database.getFirstAsync<{ is_favorite: number }>(
      'SELECT is_favorite FROM motivation_entries WHERE id = ?;',
      [id]
    );
    if (!current) return false;

    const nextVal = current.is_favorite === 1 ? 0 : 1;
    await database.runAsync(
      'UPDATE motivation_entries SET is_favorite = ? WHERE id = ?;',
      [nextVal, id]
    );
    return nextVal === 1;
  }

  /**
   * Retrieves today's goals, generating them once if they do not exist yet.
   */
  async getTodayGoals(dateStr: string = getLocalDateString()): Promise<DailyGoal[]> {
    const database = await this.db.getDatabase();

    // Check existing
    const existing = await database.getAllAsync<any>(
      'SELECT * FROM daily_goals WHERE date = ? ORDER BY id ASC;',
      [dateStr]
    );

    if (existing.length > 0) {
      return existing.map((r) => ({
        id: r.id,
        date: r.date,
        goal_type: r.goal_type as GoalType,
        title: r.title,
        target: r.target,
        current: r.current,
        is_completed: r.is_completed === 1,
        completed_at: r.completed_at,
        course_id: r.course_id,
        module_id: r.module_id,
        topic_id: r.topic_id,
        created_at: r.created_at,
      }));
    }

    // Get goal preferences
    const settingsRows = await database.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM goal_settings;'
    );
    const settingsMap = new Map(settingsRows.map((r) => [r.key, r.value]));

    const topicsTarget = parseInt(settingsMap.get('topics_per_day') || '2', 10);
    const practiceTarget = parseInt(settingsMap.get('practice_per_day') || '5', 10);

    // Generate standard 4 daily goals for today
    const now = new Date().toISOString();
    const goalsToInsert: [string, string, string, string, number][] = [
      [generateId('goal'), dateStr, 'COMPLETE_TOPIC', `Complete ${topicsTarget} curriculum ${topicsTarget === 1 ? 'topic' : 'topics'}`, topicsTarget],
      [generateId('goal'), dateStr, 'PRACTICE_QUESTIONS', `Solve ${practiceTarget} practice challenges`, practiceTarget],
      [generateId('goal'), dateStr, 'COMPLETE_MODULE', 'Study & progress on 1 module', 1],
      [generateId('goal'), dateStr, 'WRITE_NOTE', 'Record 1 learning note or reflection', 1],
    ];

    for (const [id, d, type, title, target] of goalsToInsert) {
      await database.runAsync(
        `INSERT INTO daily_goals (
          id, date, goal_type, title, target, current, is_completed, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, 0, 0, NULL, ?);`,
        [id, d, type, title, target, now]
      );
    }

    // Immediately sync with any activity already performed today
    return this.syncTodayGoals(dateStr);
  }

  /**
   * Automatically calculates current goal progress from actual SQLite activity.
   */
  async syncTodayGoals(dateStr: string = getLocalDateString()): Promise<DailyGoal[]> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    // 1. Topics completed today
    const topicRow = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM topics
       WHERE is_completed = 1 AND completed_at LIKE ?;`,
      [`${dateStr}%`]
    );
    const topicsToday = topicRow?.count || 0;

    // 2. Practice questions solved today
    const practiceRow = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM practice_attempts
       WHERE is_correct = 1 AND attempted_at LIKE ?;`,
      [`${dateStr}%`]
    );
    const practiceToday = practiceRow?.count || 0;

    // 3. Modules completed today (or modules touched today via activity)
    const moduleRow = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(DISTINCT module_id) as count FROM learning_activity
       WHERE (activity_type = 'MODULE_COMPLETED' OR activity_type = 'TOPIC_COMPLETED')
         AND activity_date = ?;`,
      [dateStr]
    );
    const modulesToday = moduleRow?.count || 0;

    // 4. Notes created or updated today
    const noteRow = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM notes
       WHERE updated_at LIKE ?;`,
      [`${dateStr}%`]
    );
    const notesToday = noteRow?.count || 0;

    // Load goals and update each
    const existing = await database.getAllAsync<any>(
      'SELECT * FROM daily_goals WHERE date = ? ORDER BY id ASC;',
      [dateStr]
    );

    const updatedGoals: DailyGoal[] = [];

    for (const r of existing) {
      let currentVal = 0;
      switch (r.goal_type) {
        case 'COMPLETE_TOPIC':
          currentVal = topicsToday;
          break;
        case 'PRACTICE_QUESTIONS':
          currentVal = practiceToday;
          break;
        case 'COMPLETE_MODULE':
          currentVal = modulesToday;
          break;
        case 'WRITE_NOTE':
          currentVal = notesToday;
          break;
        default:
          currentVal = r.current || 0;
      }

      const isCompleted = currentVal >= r.target ? 1 : 0;
      const completedAt = isCompleted === 1 ? (r.completed_at || now) : null;

      await database.runAsync(
        `UPDATE daily_goals
         SET current = ?, is_completed = ?, completed_at = ?
         WHERE id = ?;`,
        [currentVal, isCompleted, completedAt, r.id]
      );

      updatedGoals.push({
        id: r.id,
        date: r.date,
        goal_type: r.goal_type as GoalType,
        title: r.title,
        target: r.target,
        current: currentVal,
        is_completed: isCompleted === 1,
        completed_at: completedAt,
        course_id: r.course_id,
        module_id: r.module_id,
        topic_id: r.topic_id,
        created_at: r.created_at,
      });
    }

    // Also trigger achievement check
    await this.syncAchievements();

    return updatedGoals;
  }

  /**
   * Fetches or generates today's daily challenge.
   */
  async getTodayChallenge(dateStr: string = getLocalDateString()): Promise<DailyChallenge> {
    const database = await this.db.getDatabase();

    const existing = await database.getFirstAsync<any>(
      'SELECT * FROM daily_challenges WHERE date = ?;',
      [dateStr]
    );

    if (existing) {
      return {
        id: existing.id,
        date: existing.date,
        title: existing.title,
        description: existing.description,
        challenge_type: existing.challenge_type,
        target_id: existing.target_id,
        is_completed: existing.is_completed === 1,
        completed_at: existing.completed_at,
        created_at: existing.created_at,
      };
    }

    // Select an unsolved practice question for the challenge if available
    const question = await database.getFirstAsync<any>(
      'SELECT id, title, topic FROM practice_questions WHERE is_completed = 0 ORDER BY order_index ASC LIMIT 1;'
    );

    const challengeId = generateId('ch');
    const now = new Date().toISOString();
    const title = question ? `Solve Challenge: ${question.title}` : 'Conquer a Curriculum Topic';
    const desc = question
      ? `Sharpen your skills in ${question.topic}. Solve this challenge to claim today's challenge trophy.`
      : 'Dive into your current module and complete one topic to keep your adventure advancing.';
    const type = question ? 'PRACTICE' : 'TOPIC';
    const targetId = question ? question.id : null;

    await database.runAsync(
      `INSERT INTO daily_challenges (
        id, date, title, description, challenge_type, target_id, is_completed, completed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?);`,
      [challengeId, dateStr, title, desc, type, targetId, now]
    );

    return {
      id: challengeId,
      date: dateStr,
      title,
      description: desc,
      challenge_type: type as any,
      target_id: targetId,
      is_completed: false,
      completed_at: null,
      created_at: now,
    };
  }

  /**
   * Marks a challenge complete.
   */
  async completeChallenge(challengeId: string): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(
      'UPDATE daily_challenges SET is_completed = 1, completed_at = ? WHERE id = ?;',
      [new Date().toISOString(), challengeId]
    );
  }

  /**
   * Calculates actual actions and metrics performed today.
   */
  async getDailySummary(dateStr: string = getLocalDateString()): Promise<DailySummary> {
    const database = await this.db.getDatabase();

    const topicRow = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM topics WHERE is_completed = 1 AND completed_at LIKE ?;',
      [`${dateStr}%`]
    );
    const moduleRow = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(DISTINCT module_id) as count FROM learning_activity
       WHERE (activity_type = 'MODULE_COMPLETED' OR activity_type = 'TOPIC_COMPLETED')
         AND activity_date = ?;`,
      [dateStr]
    );
    const practiceRow = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM practice_attempts WHERE is_correct = 1 AND attempted_at LIKE ?;',
      [`${dateStr}%`]
    );
    const noteRow = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM notes WHERE updated_at LIKE ?;',
      [`${dateStr}%`]
    );
    const activityRow = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM learning_activity WHERE activity_date = ?;',
      [dateStr]
    );

    const topicsCompleted = topicRow?.count || 0;
    const modulesCompleted = moduleRow?.count || 0;
    const practiceSolved = practiceRow?.count || 0;
    const notesCreated = noteRow?.count || 0;
    const totalActions = (activityRow?.count || 0) + practiceSolved;

    return {
      topicsCompleted,
      modulesCompleted,
      practiceSolved,
      notesCreated,
      totalActions,
    };
  }

  /**
   * Weekly learning summary for the current Mon-Sun calendar week.
   */
  async getWeeklySummary(weeklyTarget: number = 5): Promise<WeeklyLearningSummary> {
    const database = await this.db.getDatabase();
    const streakMetrics = await activityRepository.getStreakMetrics();

    // Determine current Monday
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon...
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const days: { dayLabel: string; date: string; hasActivity: boolean; activityCount: number }[] = [];
    let activeDaysCount = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = getLocalDateString(d);
      const isPastOrToday = d <= today;

      const actRow = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM learning_activity WHERE activity_date = ?;',
        [dateStr]
      );
      const count = actRow?.count || 0;
      const hasAct = count > 0;
      if (hasAct && isPastOrToday) {
        activeDaysCount++;
      }

      days.push({
        dayLabel: dayLabels[i],
        date: dateStr,
        hasActivity: hasAct,
        activityCount: count,
      });
    }

    // Totals for the week
    const mondayStr = getLocalDateString(monday);
    const sundayDate = new Date(monday);
    sundayDate.setDate(monday.getDate() + 6);
    const sundayStr = getLocalDateString(sundayDate);

    const goalsRow = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM daily_goals WHERE is_completed = 1 AND date >= ? AND date <= ?;',
      [mondayStr, sundayStr]
    );

    const topicsRow = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM topics
       WHERE is_completed = 1 AND completed_at >= ? AND completed_at <= ?;`,
      [mondayStr, `${sundayStr}T23:59:59Z`]
    );

    const practiceRow = await database.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM practice_attempts
       WHERE is_correct = 1 AND attempted_at >= ? AND attempted_at <= ?;`,
      [mondayStr, `${sundayStr}T23:59:59Z`]
    );

    return {
      days,
      activeDaysCount,
      weeklyTargetDays: weeklyTarget,
      totalGoalsCompleted: goalsRow?.count || 0,
      totalTopicsCompleted: topicsRow?.count || 0,
      totalModulesCompleted: 0,
      totalPracticeSolved: practiceRow?.count || 0,
    };
  }

  /**
   * Queries previous days' goal history and percentages.
   */
  async getGoalHistory(limitDays: number = 7): Promise<DayGoalHistory[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT
         date,
         COUNT(*) as totalGoals,
         SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completedGoals
       FROM daily_goals
       GROUP BY date
       ORDER BY date DESC
       LIMIT ?;`,
      [limitDays]
    );

    return rows.map((r) => {
      const total = r.totalGoals || 1;
      const completed = r.completedGoals || 0;
      const pct = Math.round((completed / total) * 100);
      return {
        date: r.date,
        formattedDate: r.date,
        totalGoals: total,
        completedGoals: completed,
        percentage: pct,
      };
    });
  }

  /**
   * Retrieves all achievements with unlock states.
   */
  async getAchievements(): Promise<Achievement[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      'SELECT * FROM achievements ORDER BY is_unlocked DESC, requirement_value ASC;'
    );

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      icon: r.icon,
      category: r.category,
      requirement_type: r.requirement_type,
      requirement_value: r.requirement_value,
      is_unlocked: r.is_unlocked === 1,
      unlocked_at: r.unlocked_at,
      created_at: r.created_at,
    }));
  }

  /**
   * Evaluates user database data against achievement criteria and unlocks qualifying ones.
   */
  async syncAchievements(): Promise<number> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    const streakMetrics = await activityRepository.getStreakMetrics();

    const topicStats = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM topics WHERE is_completed = 1;'
    );
    const moduleStats = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM modules WHERE is_completed = 1;'
    );
    const courseStats = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM courses WHERE is_completed = 1;'
    );
    const practiceStats = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM practice_questions WHERE is_completed = 1;'
    );
    const noteStats = await database.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM notes;'
    );

    const values: Record<string, number> = {
      STREAK_DAYS: streakMetrics.currentStreak,
      TOPICS_COMPLETED: topicStats?.count || 0,
      MODULES_COMPLETED: moduleStats?.count || 0,
      COURSES_COMPLETED: courseStats?.count || 0,
      PRACTICE_SOLVED: practiceStats?.count || 0,
      NOTES_WRITTEN: noteStats?.count || 0,
      WEEKLY_DAYS: streakMetrics.activeWeekDays.filter(Boolean).length,
    };

    const locked = await database.getAllAsync<any>(
      'SELECT * FROM achievements WHERE is_unlocked = 0;'
    );

    let newlyUnlocked = 0;

    for (const ach of locked) {
      const userValue = values[ach.requirement_type] || 0;
      if (userValue >= ach.requirement_value) {
        await database.runAsync(
          'UPDATE achievements SET is_unlocked = 1, unlocked_at = ? WHERE id = ?;',
          [now, ach.id]
        );
        newlyUnlocked++;
      }
    }

    return newlyUnlocked;
  }
}

export const motivationRepository = new MotivationRepository();
