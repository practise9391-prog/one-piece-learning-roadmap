import { dbManager } from '../database/DatabaseManager';
import { Course, CourseRow, courseFromRow } from '../models/Course';
import { activityRepository, StreakMetrics, getLocalDateString } from '../repositories/ActivityRepository';

export interface OverallStatistics {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  totalModules: number;
  completedModules: number;
  remainingModules: number;
  totalTopics: number;
  completedTopics: number;
  remainingTopics: number;
  overallProgressPercentage: number;
  topicProgressPercentage: number;
  isAllCompleted: boolean;
  hasStartedAny: boolean;
}

export interface CourseProgressStat {
  course: Course;
  completedModules: number;
  totalModules: number;
  completedTopics: number;
  totalTopics: number;
  progressPercentage: number;
  status: 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED';
}

export interface AchievementItem {
  id: string;
  type: 'COURSE' | 'MODULE' | 'TOPIC';
  title: string;
  courseName: string;
  courseIcon: string;
  completedAt: string;
}

export interface CalendarDayInfo {
  dayNumber: number;
  dateString: string;
  activityCount: number;
  intensityLevel: 0 | 1 | 2 | 3;
  isToday: boolean;
}

export interface MonthHeatmap {
  monthName: string;
  year: number;
  days: CalendarDayInfo[];
  firstDayOffset: number; // 0 = Mon, 6 = Sun
}

export interface ProgressDataPoint {
  date: string;
  label: string;
  cumulativeModules: number;
  percentage: number;
}

export class StatisticsService {
  /**
   * Calculates overall comprehensive statistics from SQLite.
   */
  async getOverallStatistics(): Promise<OverallStatistics> {
    const db = await dbManager.getDatabase();

    const courseStats = await db.getFirstAsync<{
      total: number;
      completed: number;
      started: number;
    }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN is_completed = 0 AND (started_at IS NOT NULL OR introduction_completed = 1 OR completed_modules > 0) THEN 1 ELSE 0 END) as started
      FROM courses;
    `);

    const moduleStats = await db.getFirstAsync<{
      total: number;
      completed: number;
    }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
      FROM modules;
    `);

    const topicStats = await db.getFirstAsync<{
      total: number;
      completed: number;
    }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
      FROM topics;
    `);

    const totalCourses = courseStats?.total || 0;
    const completedCourses = courseStats?.completed || 0;
    const inProgressCourses = courseStats?.started || 0;
    const notStartedCourses = Math.max(0, totalCourses - completedCourses - inProgressCourses);

    const totalModules = moduleStats?.total || 0;
    const completedModules = moduleStats?.completed || 0;
    const remainingModules = Math.max(0, totalModules - completedModules);

    const totalTopics = topicStats?.total || 0;
    const completedTopics = topicStats?.completed || 0;
    const remainingTopics = Math.max(0, totalTopics - completedTopics);

    const overallProgressPercentage = totalModules > 0
      ? Math.round((completedModules / totalModules) * 100)
      : 0;

    const topicProgressPercentage = totalTopics > 0
      ? Math.round((completedTopics / totalTopics) * 100)
      : 0;

    const isAllCompleted = totalCourses > 0 && completedCourses === totalCourses;
    const hasStartedAny = inProgressCourses > 0 || completedCourses > 0 || completedModules > 0;

    return {
      totalCourses,
      completedCourses,
      inProgressCourses,
      notStartedCourses,
      totalModules,
      completedModules,
      remainingModules,
      totalTopics,
      completedTopics,
      remainingTopics,
      overallProgressPercentage,
      topicProgressPercentage,
      isAllCompleted,
      hasStartedAny,
    };
  }

  /**
   * Retrieves individual statistics for every course with module & topic counts.
   */
  async getCourseStatistics(): Promise<CourseProgressStat[]> {
    const db = await dbManager.getDatabase();

    const rows = await db.getAllAsync<{
      id: string;
      name: string;
      description: string;
      icon: string;
      theme: string;
      order_index: number;
      total_modules: number;
      completed_modules: number;
      progress_percentage: number;
      is_completed: number;
      started_at: string | null;
      completed_at: string | null;
      introduction_completed: number;
      welcome_title: string | null;
      welcome_description: string | null;
      created_at: string;
      updated_at: string;
      total_topics: number;
      completed_topics: number;
    }>(`
      SELECT 
        c.*,
        COUNT(t.id) as total_topics,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_topics
      FROM courses c
      LEFT JOIN modules m ON m.course_id = c.id
      LEFT JOIN topics t ON t.module_id = m.id
      GROUP BY c.id
      ORDER BY c.order_index ASC;
    `);

    return rows.map((r) => {
      const course = courseFromRow(r as CourseRow);
      let status: 'NOT STARTED' | 'IN PROGRESS' | 'COMPLETED' = 'NOT STARTED';
      if (course.is_completed) {
        status = 'COMPLETED';
      } else if (course.started_at || course.introduction_completed || course.completed_modules > 0) {
        status = 'IN PROGRESS';
      }

      return {
        course,
        completedModules: course.completed_modules,
        totalModules: course.total_modules,
        completedTopics: r.completed_topics || 0,
        totalTopics: r.total_topics || 0,
        progressPercentage: course.progress_percentage,
        status,
      };
    });
  }

  /**
   * Retrieves learning streak and weekly checklist.
   */
  async getStreakMetrics(): Promise<StreakMetrics> {
    return await activityRepository.getStreakMetrics();
  }

  /**
   * Builds the current month activity heatmap with intensity levels.
   */
  async getCalendarHeatmap(): Promise<MonthHeatmap> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-indexed

    const monthNames = [
      'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
      'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
    ];
    const monthName = monthNames[now.getMonth()];

    const countsMap = await activityRepository.getActivityCountsForMonth(year, month);
    const todayStr = getLocalDateString(now);

    // Number of days in month
    const daysInMonth = new Date(year, month, 0).getDate();

    // First day of month (0 = Mon, 6 = Sun)
    const firstDay = new Date(year, month - 1, 1);
    const firstDayOffset = (firstDay.getDay() + 6) % 7;

    const days: CalendarDayInfo[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const count = countsMap[dateStr] || 0;

      let intensityLevel: 0 | 1 | 2 | 3 = 0;
      if (count >= 6) {
        intensityLevel = 3;
      } else if (count >= 3) {
        intensityLevel = 2;
      } else if (count >= 1) {
        intensityLevel = 1;
      }

      days.push({
        dayNumber: day,
        dateString: dateStr,
        activityCount: count,
        intensityLevel,
        isToday: dateStr === todayStr,
      });
    }

    return {
      monthName,
      year,
      days,
      firstDayOffset,
    };
  }

  /**
   * Retrieves recently completed items (Courses, Modules, Topics) sorted newest first.
   */
  async getRecentAchievements(limit = 10): Promise<AchievementItem[]> {
    const db = await dbManager.getDatabase();

    const rows = await db.getAllAsync<{
      id: string;
      item_type: string;
      title: string;
      course_name: string;
      course_icon: string;
      completed_at: string;
    }>(`
      SELECT 
        c.id as id,
        'COURSE' as item_type,
        c.name as title,
        c.name as course_name,
        c.icon as course_icon,
        c.completed_at as completed_at
      FROM courses c
      WHERE c.is_completed = 1 AND c.completed_at IS NOT NULL

      UNION ALL

      SELECT 
        m.id as id,
        'MODULE' as item_type,
        m.title as title,
        c.name as course_name,
        c.icon as course_icon,
        m.completed_at as completed_at
      FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.is_completed = 1 AND m.completed_at IS NOT NULL

      UNION ALL

      SELECT 
        t.id as id,
        'TOPIC' as item_type,
        t.title as title,
        c.name as course_name,
        c.icon as course_icon,
        t.completed_at as completed_at
      FROM topics t
      JOIN modules m ON t.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE t.is_completed = 1 AND t.completed_at IS NOT NULL

      ORDER BY completed_at DESC
      LIMIT ?;
    `, [limit]);

    return rows.map((r) => ({
      id: r.id,
      type: r.item_type as 'COURSE' | 'MODULE' | 'TOPIC',
      title: r.title,
      courseName: r.course_name,
      courseIcon: r.course_icon || 'boat-outline',
      completedAt: r.completed_at,
    }));
  }

  /**
   * Retrieves historical progress data points for chart.
   */
  async getProgressHistory(): Promise<{
    hasEnoughData: boolean;
    dataPoints: ProgressDataPoint[];
  }> {
    const db = await dbManager.getDatabase();

    const rows = await db.getAllAsync<{
      date_str: string;
      completed_count: number;
    }>(`
      SELECT 
        SUBSTR(completed_at, 1, 10) as date_str,
        COUNT(*) as completed_count
      FROM modules
      WHERE is_completed = 1 AND completed_at IS NOT NULL
      GROUP BY SUBSTR(completed_at, 1, 10)
      ORDER BY date_str ASC;
    `);

    const totalModulesRow = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM modules;'
    );
    const totalModules = totalModulesRow?.count || 1;

    if (rows.length < 2) {
      return {
        hasEnoughData: false,
        dataPoints: [],
      };
    }

    let runningModules = 0;
    const dataPoints: ProgressDataPoint[] = [];

    for (const r of rows) {
      runningModules += r.completed_count;
      const pct = Math.min(100, Math.round((runningModules / totalModules) * 100));
      const parts = r.date_str.split('-');
      const label = parts.length === 3 ? `${parts[1]}/${parts[2]}` : r.date_str;

      dataPoints.push({
        date: r.date_str,
        label,
        cumulativeModules: runningModules,
        percentage: pct,
      });
    }

    return {
      hasEnoughData: true,
      dataPoints,
    };
  }
}

export const statisticsService = new StatisticsService();
