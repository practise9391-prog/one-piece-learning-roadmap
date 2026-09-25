import { dbManager } from '../database/DatabaseManager';
import { ActivityType, LearningActivity, LearningActivityRow, activityFromRow } from '../models/Activity';
import { getCurrentTimestamp } from '../utils/dateUtils';
import { generateId } from '../utils/idGenerator';

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface StreakMetrics {
  currentStreak: number;
  longestStreak: number;
  totalLearningDays: number;
  activeWeekDays: boolean[]; // Mon - Sun for current week
}

export interface DayActivityCount {
  date: string;
  count: number;
}

export class ActivityRepository {
  /**
   * Records a user learning activity in SQLite.
   */
  async recordActivity(params: {
    courseId: string;
    moduleId?: string | null;
    topicId?: string | null;
    activityType: ActivityType;
    activityDate?: string;
  }): Promise<void> {
    try {
      const db = await dbManager.getDatabase();
      const now = getCurrentTimestamp();
      const dateStr = params.activityDate || getLocalDateString();
      const id = generateId('act');

      await db.runAsync(
        `INSERT INTO learning_activity (
          id, course_id, module_id, topic_id, activity_type, activity_date, created_at
        ) VALUES (?, ?, ?, ?, ?, ?);`,
        [
          id,
          params.courseId,
          params.moduleId || null,
          params.topicId || null,
          params.activityType,
          dateStr,
          now,
        ]
      );
    } catch (err) {
      console.warn('Failed to record learning activity:', err);
    }
  }

  /**
   * Calculates current streak, longest historical streak, total active days, and weekly checklist.
   */
  async getStreakMetrics(): Promise<StreakMetrics> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<{ activity_date: string }>(
      'SELECT DISTINCT activity_date FROM learning_activity ORDER BY activity_date ASC;'
    );

    const activeDates = rows.map((r) => r.activity_date);
    const activeDatesSet = new Set(activeDates);
    const totalLearningDays = activeDates.length;

    if (totalLearningDays === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalLearningDays: 0,
        activeWeekDays: [false, false, false, false, false, false, false],
      };
    }

    // 1. Longest streak calculation
    let longestStreak = 0;
    let runningStreak = 0;
    let prevDate: Date | null = null;

    for (const dStr of activeDates) {
      const parts = dStr.split('-').map(Number);
      const curr = new Date(parts[0], parts[1] - 1, parts[2]);

      if (!prevDate) {
        runningStreak = 1;
      } else {
        const diffMs = curr.getTime() - prevDate.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          runningStreak++;
        } else if (diffDays > 1) {
          runningStreak = 1;
        }
      }
      prevDate = curr;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    }

    // 2. Current streak calculation
    const today = new Date();
    const todayStr = getLocalDateString(today);

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    let currentStreak = 0;
    let cursorDate: Date | null = null;

    if (activeDatesSet.has(todayStr)) {
      cursorDate = new Date(today);
    } else if (activeDatesSet.has(yesterdayStr)) {
      cursorDate = new Date(yesterday);
    }

    if (cursorDate) {
      while (true) {
        const dStr = getLocalDateString(cursorDate);
        if (activeDatesSet.has(dStr)) {
          currentStreak++;
          cursorDate.setDate(cursorDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 3. Current week active days (Monday through Sunday)
    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);

    const activeWeekDays: boolean[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      activeWeekDays.push(activeDatesSet.has(getLocalDateString(d)));
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      totalLearningDays,
      activeWeekDays,
    };
  }

  /**
   * Retrieves activity counts grouped by date for a given month.
   */
  async getActivityCountsForMonth(year: number, month: number): Promise<{ [date: string]: number }> {
    const db = await dbManager.getDatabase();
    const monthPattern = `${year}-${String(month).padStart(2, '0')}-%`;

    const rows = await db.getAllAsync<{ activity_date: string; count: number }>(
      `SELECT activity_date, COUNT(*) as count 
       FROM learning_activity 
       WHERE activity_date LIKE ? 
       GROUP BY activity_date;`,
      [monthPattern]
    );

    const map: { [date: string]: number } = {};
    for (const r of rows) {
      map[r.activity_date] = r.count;
    }
    return map;
  }
}

export const activityRepository = new ActivityRepository();
