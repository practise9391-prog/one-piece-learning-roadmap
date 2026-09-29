import { DatabaseManager } from '../database/DatabaseManager';
import {
  OverallProgressMetrics,
  CourseProgressSummary,
  CourseDetailAnalytics,
  ModuleProgressDetail,
  TopicProgressDetail,
  CompletedItem,
  RemainingItem,
  DailyProgressMetrics,
  WeeklyProgressMetrics,
  MonthlyProgressMetrics,
  StudyTimeBreakdown,
  ActivityTimelineItem,
  StreakAnalyticsData,
  GoalAnalyticsMetrics,
  DomainProgressMetrics,
  PracticeAnalyticsMetrics,
  TopicPerformance,
  CourseComparisonItem,
  ProgressTrendsData,
  DateRangeFilter,
} from '../models/Analytics';
import { getTodayDateString, getWeekBounds, formatDateString } from './StudyPlanRepository';
import { activityRepository } from './ActivityRepository';
import { generateId } from '../utils/idGenerator';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class AnalyticsRepository {
  private db = DatabaseManager.getInstance();

  // =========================================================================
  // 1. OVERALL PROGRESS (Section 4 & 5)
  // =========================================================================

  async getOverallProgress(): Promise<OverallProgressMetrics> {
    const database = await this.db.getDatabase();

    const [coursesRow, modulesRow, topicsRow] = await Promise.all([
      database.getFirstAsync<{ total: number; completed: number; started: number }>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed,
          SUM(CASE WHEN is_completed = 0 AND (completed_modules > 0 OR started_at IS NOT NULL) THEN 1 ELSE 0 END) as started
        FROM courses;
      `),
      database.getFirstAsync<{ total: number; completed: number }>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
        FROM modules;
      `),
      database.getFirstAsync<{ total: number; completed: number }>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
        FROM topics;
      `),
    ]);

    const totalCourses = coursesRow?.total || 0;
    const coursesCompleted = coursesRow?.completed || 0;
    const coursesStarted = (coursesRow?.started || 0) + coursesCompleted;

    const totalModules = modulesRow?.total || 0;
    const completedModules = modulesRow?.completed || 0;
    const remainingModules = Math.max(0, totalModules - completedModules);

    const totalTopics = topicsRow?.total || 0;
    const completedTopics = topicsRow?.completed || 0;
    const remainingTopics = Math.max(0, totalTopics - completedTopics);

    // Formula: completion_percentage = (completed_topics / total_topics) * 100, handling total == 0
    const completionPercentage = totalTopics > 0
      ? Math.min(100, Math.round(((completedTopics / totalTopics) * 100) * 10) / 10)
      : 0;

    return {
      totalCourses,
      coursesStarted,
      coursesCompleted,
      totalModules,
      completedModules,
      remainingModules,
      totalTopics,
      completedTopics,
      remainingTopics,
      completionPercentage,
    };
  }

  // =========================================================================
  // 2. COURSE PROGRESS (Section 6 & 7)
  // =========================================================================

  async getCourseProgressList(
    filter: 'all' | 'in_progress' | 'completed' | 'not_started' = 'all',
    sortBy: 'order' | 'progress' | 'recent' | 'name' | 'time' = 'order'
  ): Promise<CourseProgressSummary[]> {
    const database = await this.db.getDatabase();

    const courses = await database.getAllAsync<any>(`
      SELECT 
        c.id, c.name, c.icon, c.theme, c.order_index, c.is_completed, c.started_at, c.completed_at,
        COUNT(DISTINCT m.id) as total_modules,
        SUM(CASE WHEN m.is_completed = 1 THEN 1 ELSE 0 END) as completed_modules,
        COUNT(DISTINCT t.id) as total_topics,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_topics
      FROM courses c
      LEFT JOIN modules m ON c.id = m.course_id
      LEFT JOIN topics t ON m.id = t.module_id
      GROUP BY c.id
      ORDER BY c.order_index ASC;
    `);

    // Fetch study time per course from study_sessions
    const studyTimes = await database.getAllAsync<{ course_id: string; total_min: number; session_count: number; last_date: string; first_date: string }>(`
      SELECT 
        course_id,
        COALESCE(SUM(duration_minutes), 0) as total_min,
        COUNT(*) as session_count,
        MAX(date) as last_date,
        MIN(date) as first_date
      FROM study_sessions
      WHERE status = 'COMPLETED'
      GROUP BY course_id;
    `);
    const studyMap = new Map(studyTimes.map((s) => [s.course_id, s]));

    // Fetch current module per course
    const currentModules = await database.getAllAsync<{ course_id: string; title: string }>(`
      SELECT course_id, title FROM (
        SELECT course_id, title, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY order_index ASC) as rn
        FROM modules
        WHERE is_completed = 0
      ) WHERE rn = 1;
    `);
    const currentModuleMap = new Map(currentModules.map((m) => [m.course_id, m.title]));

    let results: CourseProgressSummary[] = courses.map((c) => {
      const totalTop = c.total_topics || 0;
      const compTop = c.completed_topics || 0;
      const totalMod = c.total_modules || 0;
      const compMod = c.completed_modules || 0;
      const studyInfo = studyMap.get(c.id);
      const studyMins = studyInfo?.total_min || 0;

      const progress = totalTop > 0
        ? Math.min(100, Math.round((compTop / totalTop) * 100))
        : 0;

      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' = 'NOT_STARTED';
      if (c.is_completed === 1 || (totalTop > 0 && compTop >= totalTop)) {
        status = 'COMPLETED';
      } else if (compTop > 0 || studyMins > 0 || c.started_at) {
        status = 'IN_PROGRESS';
      }

      return {
        courseId: c.id,
        courseName: c.name,
        icon: c.icon || 'book-outline',
        theme: c.theme || 'ocean',
        status,
        totalModules: totalMod,
        completedModules: compMod,
        totalTopics: totalTop,
        completedTopics: compTop,
        remainingTopics: Math.max(0, totalTop - compTop),
        progressPercentage: progress,
        studyMinutes: studyMins,
        currentModuleName: currentModuleMap.get(c.id) || (status === 'COMPLETED' ? 'All Modules Finished' : undefined),
        firstStartedDate: studyInfo?.first_date || c.started_at,
        lastStudiedDate: studyInfo?.last_date,
        completedDate: c.completed_at,
        sessionsCount: studyInfo?.session_count || 0,
      };
    });

    // Filter
    if (filter === 'in_progress') {
      results = results.filter((r) => r.status === 'IN_PROGRESS');
    } else if (filter === 'completed') {
      results = results.filter((r) => r.status === 'COMPLETED');
    } else if (filter === 'not_started') {
      results = results.filter((r) => r.status === 'NOT_STARTED');
    }

    // Sort
    if (sortBy === 'progress') {
      results.sort((a, b) => b.progressPercentage - a.progressPercentage);
    } else if (sortBy === 'recent') {
      results.sort((a, b) => (b.lastStudiedDate || '').localeCompare(a.lastStudiedDate || ''));
    } else if (sortBy === 'name') {
      results.sort((a, b) => a.courseName.localeCompare(b.courseName));
    } else if (sortBy === 'time') {
      results.sort((a, b) => b.studyMinutes - a.studyMinutes);
    }

    return results;
  }

  // =========================================================================
  // 3. COURSE DETAIL ANALYTICS (Section 8, 9, 10)
  // =========================================================================

  async getCourseDetailAnalytics(courseId: string): Promise<CourseDetailAnalytics | null> {
    const database = await this.db.getDatabase();

    const courseList = await this.getCourseProgressList('all', 'order');
    const course = courseList.find((c) => c.courseId === courseId);
    if (!course) return null;

    // Fetch modules
    const modules = await database.getAllAsync<any>(`
      SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC;
    `, [courseId]);

    // Fetch topics with completion
    const topics = await database.getAllAsync<any>(`
      SELECT t.*, m.course_id 
      FROM topics t
      JOIN modules m ON t.module_id = m.id
      WHERE m.course_id = ?
      ORDER BY t.module_id, t.order_index ASC;
    `, [courseId]);

    // Fetch practice question count by topic
    const practiceTopics = await database.getAllAsync<{ topic: string; count: number }>(`
      SELECT topic, COUNT(*) as count 
      FROM practice_questions 
      WHERE course_id = ? OR category_id = ?
      GROUP BY topic;
    `, [courseId, courseId]);
    const practiceMap = new Set(practiceTopics.map((p) => p.topic));

    // Group topics by module
    const topicsByModule = new Map<string, any[]>();
    for (const top of topics) {
      if (!topicsByModule.has(top.module_id)) {
        topicsByModule.set(top.module_id, []);
      }
      topicsByModule.get(top.module_id)!.push(top);
    }

    // Build modules with status calculation (Section 9)
    let previousModuleCompleted = true;
    const moduleDetails: ModuleProgressDetail[] = modules.map((m, index) => {
      const modTopics = topicsByModule.get(m.id) || [];
      const totalTop = modTopics.length;
      const compTop = modTopics.filter((t) => t.is_completed === 1).length;
      const isCompleted = m.is_completed === 1 || (totalTop > 0 && compTop >= totalTop);
      const progress = totalTop > 0 ? Math.round((compTop / totalTop) * 100) : 0;

      let status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' = 'LOCKED';
      if (isCompleted) {
        status = 'COMPLETED';
      } else if (compTop > 0) {
        status = 'IN_PROGRESS';
      } else if (index === 0 || previousModuleCompleted) {
        status = 'AVAILABLE';
      }

      previousModuleCompleted = isCompleted;

      const topicDetails: TopicProgressDetail[] = modTopics.map((t) => ({
        topicId: t.id,
        moduleId: m.id,
        courseId,
        courseName: course.courseName,
        moduleTitle: m.title,
        title: t.title,
        isCompleted: t.is_completed === 1,
        completedAt: t.completed_at,
        studyMinutes: 0,
        isLocked: status === 'LOCKED',
        orderIndex: t.order_index,
        hasPracticeQuestions: practiceMap.has(t.title),
      }));

      return {
        moduleId: m.id,
        courseId,
        title: m.title,
        description: m.description,
        orderIndex: m.order_index,
        status,
        totalTopics: totalTop,
        completedTopics: compTop,
        progressPercentage: progress,
        isCompleted,
        completedAt: m.completed_at,
        topics: topicDetails,
      };
    });

    // Recent activity in this course
    const recentActivity = await database.getAllAsync<any>(`
      SELECT id, activity_type, activity_date, created_at 
      FROM learning_activity 
      WHERE course_id = ?
      ORDER BY created_at DESC 
      LIMIT 10;
    `, [courseId]);

    const mappedActivity = recentActivity.map((a) => ({
      id: a.id,
      type: a.activity_type,
      date: a.activity_date || a.created_at,
      details: a.activity_type.replace('_', ' ').toLowerCase(),
    }));

    return {
      course,
      modules: moduleDetails,
      streakDays: 0,
      recentActivity: mappedActivity,
    };
  }

  // =========================================================================
  // 4. COMPLETED & REMAINING TOPICS (Section 11 & 12)
  // =========================================================================

  async getCompletedItems(limit: number = 50): Promise<CompletedItem[]> {
    const database = await this.db.getDatabase();

    const rows = await database.getAllAsync<any>(`
      SELECT 
        t.id, t.title, t.completed_at,
        m.id as module_id, m.title as module_title,
        c.id as course_id, c.name as course_name
      FROM topics t
      JOIN modules m ON t.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE t.is_completed = 1
      ORDER BY t.completed_at DESC, t.id DESC
      LIMIT ?;
    `, [limit]);

    return rows.map((r) => ({
      id: r.id,
      type: 'TOPIC',
      title: r.title,
      courseId: r.course_id,
      courseName: r.course_name,
      moduleId: r.module_id,
      moduleTitle: r.module_title,
      completedAt: r.completed_at || new Date().toISOString(),
    }));
  }

  async getRemainingItems(params?: {
    courseId?: string;
    filter?: 'all' | 'available' | 'locked';
    limit?: number;
  }): Promise<{ items: RemainingItem[]; recommendedNext: RemainingItem | null }> {
    const database = await this.db.getDatabase();
    const limit = params?.limit || 100;

    let query = `
      SELECT 
        t.id as topic_id, t.title as topic_title, t.order_index as topic_order,
        m.id as module_id, m.title as module_title, m.order_index as module_order, m.is_completed as module_completed,
        c.id as course_id, c.name as course_name, c.order_index as course_order
      FROM topics t
      JOIN modules m ON t.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE t.is_completed = 0
    `;

    const args: any[] = [];
    if (params?.courseId) {
      query += ' AND c.id = ?';
      args.push(params.courseId);
    }

    query += ' ORDER BY c.order_index ASC, m.order_index ASC, t.order_index ASC;';
    const rows = await database.getAllAsync<any>(query, args);

    // Compute locked/available state sequentially
    let items: RemainingItem[] = [];
    let recommendedNext: RemainingItem | null = null;

    let prevModuleCompleted = true;
    for (const r of rows) {
      const isLocked = !prevModuleCompleted && r.module_completed === 0 && r.module_order > 1;
      const item: RemainingItem = {
        topicId: r.topic_id,
        topicTitle: r.topic_title,
        moduleId: r.module_id,
        moduleTitle: r.module_title,
        courseId: r.course_id,
        courseName: r.course_name,
        orderIndex: r.topic_order,
        isLocked,
      };

      if (!isLocked && !recommendedNext) {
        recommendedNext = item;
      }

      if (params?.filter === 'available' && isLocked) continue;
      if (params?.filter === 'locked' && !isLocked) continue;

      items.push(item);
      if (items.length >= limit) break;
    }

    return { items, recommendedNext };
  }

  // =========================================================================
  // 5. DAILY, WEEKLY, MONTHLY PROGRESS (Section 13, 14, 15)
  // =========================================================================

  async getDailyProgress(dateStr: string = getTodayDateString()): Promise<DailyProgressMetrics> {
    const database = await this.db.getDatabase();

    // 1. Study plan metrics for date
    const planRow = await database.getFirstAsync<any>(`
      SELECT planned_minutes, completed_minutes, planned_topics, completed_topics
      FROM study_plans 
      WHERE plan_type = 'DAILY' AND date = ?;
    `, [dateStr]);

    // 2. Study sessions on date
    const sessionRow = await database.getFirstAsync<{ count: number; total_min: number }>(`
      SELECT COUNT(*) as count, COALESCE(SUM(duration_minutes), 0) as total_min
      FROM study_sessions
      WHERE date = ? AND status = 'COMPLETED';
    `, [dateStr]);

    // 3. Goals on date
    const goalsRow = await database.getFirstAsync<{ total: number; completed: number }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed
      FROM study_goals
      WHERE period = 'DAILY' AND (startDate = ? OR endDate = ?);
    `, [dateStr, dateStr]);

    // 4. Practice attempts on date
    const practiceRow = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM practice_attempts 
      WHERE attempted_at LIKE ?;
    `, [`${dateStr}%`]);

    // 5. Notes created on date
    const notesRow = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM notes 
      WHERE created_at LIKE ?;
    `, [`${dateStr}%`]);

    // 6. Speaking sessions on date
    const speakingRow = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM speaking_sessions 
      WHERE created_at LIKE ?;
    `, [`${dateStr}%`]);

    const plannedMin = planRow?.planned_minutes || 120;
    const completedMin = Math.max(planRow?.completed_minutes || 0, sessionRow?.total_min || 0);
    const progress = plannedMin > 0 ? Math.min(100, Math.round((completedMin / plannedMin) * 100)) : 0;

    return {
      date: dateStr,
      plannedMinutes: plannedMin,
      completedMinutes: completedMin,
      progressPercentage: progress,
      topicsPlanned: planRow?.planned_topics || 4,
      topicsCompleted: planRow?.completed_topics || 0,
      sessionsCount: sessionRow?.count || 0,
      dailyGoalsCompleted: goalsRow?.completed || 0,
      dailyGoalsTotal: goalsRow?.total || 0,
      practiceQuestionsToday: practiceRow?.count || 0,
      notesCreatedToday: notesRow?.count || 0,
      speakingSessionsToday: speakingRow?.count || 0,
    };
  }

  async getWeeklyProgress(targetDate: Date = new Date()): Promise<WeeklyProgressMetrics> {
    const database = await this.db.getDatabase();
    const { weekStart, weekEnd } = getWeekBounds(targetDate);

    // 1. Total study time and daily breakdown from study_sessions (Mon - Sun)
    const sessions = await database.getAllAsync<{ date: string; total_min: number }>(`
      SELECT date, COALESCE(SUM(duration_minutes), 0) as total_min
      FROM study_sessions
      WHERE date >= ? AND date <= ? AND status = 'COMPLETED'
      GROUP BY date;
    `, [weekStart, weekEnd]);
    const sessionMap = new Map(sessions.map((s) => [s.date, s.total_min]));

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const dailyBreakdown: Array<{ dayName: string; date: string; minutes: number }> = [];
    let totalStudyMin = 0;

    const startDate = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dStr = formatDateString(d);
      const min = sessionMap.get(dStr) || 0;
      dailyBreakdown.push({
        dayName: dayNames[i],
        date: dStr,
        minutes: min,
      });
      totalStudyMin += min;
    }

    // 2. Topics completed in this week from learning_activity
    const topicRow = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM learning_activity
      WHERE activity_type = 'TOPIC_COMPLETED' AND activity_date >= ? AND activity_date <= ?;
    `, [weekStart, weekEnd]);

    // 3. Modules completed
    const moduleRow = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM learning_activity
      WHERE activity_type = 'MODULE_COMPLETED' AND activity_date >= ? AND activity_date <= ?;
    `, [weekStart, weekEnd]);

    // 4. Courses studied
    const coursesRow = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(DISTINCT course_id) as count 
      FROM study_sessions 
      WHERE date >= ? AND date <= ?;
    `, [weekStart, weekEnd]);

    // 5. Practice and speaking
    const practiceRow = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM practice_attempts 
      WHERE attempted_at >= ? AND attempted_at <= ?;
    `, [weekStart, weekEnd + 'T23:59:59Z']);

    const speakingRow = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM speaking_sessions 
      WHERE created_at >= ? AND created_at <= ?;
    `, [weekStart, weekEnd + 'T23:59:59Z']);

    // 6. Goals
    const goalsRow = await database.getFirstAsync<{ completed: number; missed: number }>(`
      SELECT 
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'MISSED' THEN 1 ELSE 0 END) as missed
      FROM study_goals
      WHERE period = 'WEEKLY' AND startDate >= ? AND endDate <= ?;
    `, [weekStart, weekEnd]);

    const streakMetrics = await activityRepository.getStreakMetrics();

    return {
      weekStart,
      weekEnd,
      totalStudyMinutes: totalStudyMin,
      averageDailyMinutes: Math.round(totalStudyMin / 7),
      topicsCompleted: topicRow?.count || 0,
      modulesCompleted: moduleRow?.count || 0,
      coursesStudied: coursesRow?.count || 0,
      practiceQuestions: practiceRow?.count || 0,
      speakingSessions: speakingRow?.count || 0,
      goalsCompleted: goalsRow?.completed || 0,
      goalsMissed: goalsRow?.missed || 0,
      currentStreak: streakMetrics.currentStreak,
      dailyBreakdown,
    };
  }

  async getMonthlyProgress(year?: number, month?: number): Promise<MonthlyProgressMetrics> {
    const database = await this.db.getDatabase();
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;
    const monthPattern = `${targetYear}-${String(targetMonth).padStart(2, '0')}-%`;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[targetMonth - 1] || 'Current Month';

    // 1. Total study minutes
    const sessionStats = await database.getFirstAsync<{ total_min: number; courses_count: number }>(`
      SELECT 
        COALESCE(SUM(duration_minutes), 0) as total_min,
        COUNT(DISTINCT course_id) as courses_count
      FROM study_sessions 
      WHERE date LIKE ? AND status = 'COMPLETED';
    `, [monthPattern]);

    // 2. Topics completed
    const topicStats = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM learning_activity 
      WHERE activity_type = 'TOPIC_COMPLETED' AND activity_date LIKE ?;
    `, [monthPattern]);

    // 3. Modules completed
    const modStats = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM learning_activity 
      WHERE activity_type = 'MODULE_COMPLETED' AND activity_date LIKE ?;
    `, [monthPattern]);

    // 4. Most studied course
    const topCourse = await database.getFirstAsync<{ name: string }>(`
      SELECT c.name 
      FROM study_sessions s
      JOIN courses c ON s.course_id = c.id
      WHERE s.date LIKE ?
      GROUP BY s.course_id
      ORDER BY SUM(s.duration_minutes) DESC
      LIMIT 1;
    `, [monthPattern]);

    // 5. Most active day
    const topDay = await database.getFirstAsync<{ date: string; total_min: number }>(`
      SELECT date, SUM(duration_minutes) as total_min
      FROM study_sessions 
      WHERE date LIKE ?
      GROUP BY date
      ORDER BY total_min DESC
      LIMIT 1;
    `, [monthPattern]);

    // 6. Practice
    const pracStats = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM practice_attempts 
      WHERE attempted_at LIKE ?;
    `, [monthPattern]);

    // 7. Goals
    const goalStats = await database.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count 
      FROM study_goals 
      WHERE status = 'COMPLETED' AND startDate LIKE ?;
    `, [monthPattern]);

    const streakMetrics = await activityRepository.getStreakMetrics();
    const totalMin = sessionStats?.total_min || 0;

    return {
      month: targetMonth,
      year: targetYear,
      monthName,
      totalStudyMinutes: totalMin,
      averageDailyMinutes: Math.round(totalMin / 30),
      topicsCompleted: topicStats?.count || 0,
      modulesCompleted: modStats?.count || 0,
      coursesStudied: sessionStats?.courses_count || 0,
      goalsCompleted: goalStats?.count || 0,
      practiceCompleted: pracStats?.count || 0,
      mostStudiedCourse: topCourse?.name,
      mostActiveDay: topDay?.date,
      currentStreak: streakMetrics.currentStreak,
      longestStreak: streakMetrics.longestStreak,
      weeklyProgress: [],
    };
  }

  // =========================================================================
  // 6. STUDY TIME ANALYTICS (Section 16 & 17)
  // =========================================================================

  async getStudyTimeBreakdown(): Promise<StudyTimeBreakdown> {
    const database = await this.db.getDatabase();
    const today = getTodayDateString();
    const { weekStart, weekEnd } = getWeekBounds();
    const now = new Date();
    const monthPattern = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-%`;

    // 1. Overall time totals
    const [todayRow, weekRow, monthRow, allTimeRow] = await Promise.all([
      database.getFirstAsync<{ total: number }>(`
        SELECT COALESCE(SUM(duration_minutes), 0) as total FROM study_sessions WHERE date = ? AND status = 'COMPLETED';
      `, [today]),
      database.getFirstAsync<{ total: number }>(`
        SELECT COALESCE(SUM(duration_minutes), 0) as total FROM study_sessions WHERE date >= ? AND date <= ? AND status = 'COMPLETED';
      `, [weekStart, weekEnd]),
      database.getFirstAsync<{ total: number }>(`
        SELECT COALESCE(SUM(duration_minutes), 0) as total FROM study_sessions WHERE date LIKE ? AND status = 'COMPLETED';
      `, [monthPattern]),
      database.getFirstAsync<{ total: number }>(`
        SELECT COALESCE(SUM(duration_minutes), 0) as total FROM study_sessions WHERE status = 'COMPLETED';
      `),
    ]);

    const todayMin = todayRow?.total || 0;
    const weekMin = weekRow?.total || 0;
    const monthMin = monthRow?.total || 0;
    const allMin = allTimeRow?.total || 0;

    // 2. Course breakdown
    const courseRows = await database.getAllAsync<{ course_id: string; course_name: string; total_min: number }>(`
      SELECT 
        s.course_id, 
        c.name as course_name, 
        COALESCE(SUM(s.duration_minutes), 0) as total_min
      FROM study_sessions s
      JOIN courses c ON s.course_id = c.id
      WHERE s.status = 'COMPLETED'
      GROUP BY s.course_id
      ORDER BY total_min DESC;
    `);

    const byCourse = courseRows.map((r) => ({
      courseId: r.course_id,
      courseName: r.course_name,
      minutes: r.total_min,
      percentage: allMin > 0 ? Math.round((r.total_min / allMin) * 100) : 0,
    }));

    // 3. By Day Last 7 Days
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const byDayLast7Days: Array<{ date: string; dayName: string; minutes: number }> = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDateString(d);
      const row = await database.getFirstAsync<{ total: number }>(`
        SELECT COALESCE(SUM(duration_minutes), 0) as total FROM study_sessions WHERE date = ? AND status = 'COMPLETED';
      `, [dStr]);
      byDayLast7Days.push({
        date: dStr,
        dayName: dayNames[d.getDay()],
        minutes: row?.total || 0,
      });
    }

    return {
      todayMinutes: todayMin,
      thisWeekMinutes: weekMin,
      thisMonthMinutes: monthMin,
      allTimeMinutes: allMin,
      byCourse,
      byDayLast7Days,
    };
  }

  // =========================================================================
  // 7. ACTIVITY TIMELINE (Section 18 & 19)
  // =========================================================================

  async getActivityTimeline(
    filter: 'today' | 'week' | 'month' | 'all' = 'all',
    limit: number = 40
  ): Promise<ActivityTimelineItem[]> {
    const database = await this.db.getDatabase();
    const today = getTodayDateString();
    const { weekStart, weekEnd } = getWeekBounds();
    const now = new Date();
    const monthPattern = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-%`;

    let whereClause = '';
    const args: any[] = [];

    if (filter === 'today') {
      whereClause = 'WHERE la.activity_date = ?';
      args.push(today);
    } else if (filter === 'week') {
      whereClause = 'WHERE la.activity_date >= ? AND la.activity_date <= ?';
      args.push(weekStart, weekEnd);
    } else if (filter === 'month') {
      whereClause = 'WHERE la.activity_date LIKE ?';
      args.push(monthPattern);
    }

    const query = `
      SELECT 
        la.id, la.activity_type, la.activity_date, la.created_at,
        c.id as course_id, c.name as course_name,
        m.title as module_title,
        t.title as topic_title
      FROM learning_activity la
      LEFT JOIN courses c ON la.course_id = c.id
      LEFT JOIN modules m ON la.module_id = m.id
      LEFT JOIN topics t ON la.topic_id = t.id
      ${whereClause}
      ORDER BY la.created_at DESC
      LIMIT ?;
    `;
    args.push(limit);

    const rows = await database.getAllAsync<any>(query, args);

    return rows.map((r) => {
      let title = 'Learning Activity';
      let subtitle = r.course_name || 'Course';
      let icon = 'checkmark-circle-outline';
      let color = '#4F46E5';

      switch (r.activity_type) {
        case 'TOPIC_COMPLETED':
          title = `Completed ${r.topic_title || 'Topic'}`;
          subtitle = `${r.course_name || 'Course'} → ${r.module_title || ''}`;
          icon = 'checkmark-done-circle';
          color = '#10B981';
          break;
        case 'MODULE_COMPLETED':
          title = `Conquered ${r.module_title || 'Module'}`;
          subtitle = r.course_name || 'Course';
          icon = 'trophy-outline';
          color = '#F59E0B';
          break;
        case 'NOTE_CREATED':
        case 'NOTE_UPDATED':
          title = 'Logged Voyage Note';
          subtitle = r.course_name || 'Course';
          icon = 'journal-outline';
          color = '#3B82F6';
          break;
        case 'PRACTICE_COMPLETED':
          title = 'Completed Practice Challenge';
          subtitle = r.course_name || 'Practice';
          icon = 'code-slash-outline';
          color = '#8B5CF6';
          break;
        case 'SPEAKING_SESSION':
          title = 'Conducted Speaking Practice';
          subtitle = 'English Speaking';
          icon = 'mic-outline';
          color = '#EC4899';
          break;
        case 'STUDY_SESSION_COMPLETED':
          title = 'Completed Study Session';
          subtitle = r.course_name || 'Focused Study';
          icon = 'timer-outline';
          color = '#06B6D4';
          break;
        default:
          title = r.activity_type.replace(/_/g, ' ').toLowerCase();
          break;
      }

      return {
        id: r.id,
        activityType: r.activity_type,
        title,
        subtitle,
        courseId: r.course_id,
        courseName: r.course_name,
        activityDate: r.activity_date || r.created_at,
        createdAt: r.created_at,
        icon,
        color,
      };
    });
  }

  // =========================================================================
  // 8. STREAK ANALYTICS (Section 20)
  // =========================================================================

  async getStreakAnalytics(): Promise<StreakAnalyticsData> {
    const database = await this.db.getDatabase();
    const metrics = await activityRepository.getStreakMetrics();

    // Query distinct dates in the past 60 days
    const activeDates = await database.getAllAsync<{ activity_date: string }>(`
      SELECT DISTINCT activity_date 
      FROM learning_activity 
      WHERE activity_date >= datetime('now', '-60 days')
      ORDER BY activity_date DESC;
    `);
    const dateSet = new Set(activeDates.map((a) => a.activity_date));

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activeDaysLast7: Array<{ dayName: string; date: string; isActive: boolean }> = [];

    const now = new Date();
    const dayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dStr = formatDateString(d);
      activeDaysLast7.push({
        dayName: dayNames[i],
        date: dStr,
        isActive: dateSet.has(dStr),
      });
    }

    return {
      currentStreak: metrics.currentStreak,
      longestStreak: metrics.longestStreak,
      totalLearningDays: metrics.totalLearningDays,
      activeDaysLast7,
      activeDatesSet: Array.from(dateSet),
    };
  }

  // =========================================================================
  // 9. GOAL ANALYTICS (Section 21 & 22)
  // =========================================================================

  async getGoalAnalytics(): Promise<GoalAnalyticsMetrics> {
    const database = await this.db.getDatabase();

    const counts = await database.getFirstAsync<any>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'MISSED' THEN 1 ELSE 0 END) as missed,
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN period = 'DAILY' AND status = 'COMPLETED' THEN 1 ELSE 0 END) as daily_comp,
        SUM(CASE WHEN period = 'DAILY' THEN 1 ELSE 0 END) as daily_total,
        SUM(CASE WHEN period = 'WEEKLY' AND status = 'COMPLETED' THEN 1 ELSE 0 END) as weekly_comp,
        SUM(CASE WHEN period = 'WEEKLY' THEN 1 ELSE 0 END) as weekly_total,
        SUM(CASE WHEN period = 'MONTHLY' AND status = 'COMPLETED' THEN 1 ELSE 0 END) as monthly_comp,
        SUM(CASE WHEN period = 'MONTHLY' THEN 1 ELSE 0 END) as monthly_total
      FROM study_goals;
    `);

    const total = counts?.total || 0;
    const completed = counts?.completed || 0;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const historyRows = await database.getAllAsync<any>(`
      SELECT * FROM study_goals ORDER BY createdAt DESC LIMIT 15;
    `);

    const history = historyRows.map((g) => ({
      id: g.id,
      title: g.title,
      period: g.period,
      targetValue: g.targetValue,
      currentValue: g.currentValue,
      unit: g.unit,
      status: g.status,
      completionPercentage: g.targetValue > 0 ? Math.min(100, Math.round((g.currentValue / g.targetValue) * 100)) : 0,
    }));

    return {
      completed,
      inProgress: counts?.in_progress || 0,
      missed: counts?.missed || 0,
      cancelled: counts?.cancelled || 0,
      total,
      completionPercentage,
      byPeriod: {
        daily: { completed: counts?.daily_comp || 0, total: counts?.daily_total || 0 },
        weekly: { completed: counts?.weekly_comp || 0, total: counts?.weekly_total || 0 },
        monthly: { completed: counts?.monthly_comp || 0, total: counts?.monthly_total || 0 },
      },
      history,
    };
  }

  // =========================================================================
  // 10. DOMAIN & PRACTICE PROGRESS (Section 23, 24, 25, 26, 27, 28, 29, 30)
  // =========================================================================

  async getDomainProgress(
    domain: 'aptitude' | 'reasoning' | 'verbal_english' | 'english_speaking'
  ): Promise<DomainProgressMetrics> {
    const database = await this.db.getDatabase();

    const titleMap = {
      aptitude: 'Aptitude Mastery',
      reasoning: 'Reasoning & Logic',
      verbal_english: 'Verbal English',
      english_speaking: 'English Speaking Voyage',
    };

    // 1. Topics
    const topicStats = await database.getFirstAsync<{ total: number; completed: number }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed
      FROM topics t
      JOIN modules m ON t.module_id = m.id
      WHERE m.course_id = ?;
    `, [domain]);

    const totalTopics = topicStats?.total || 0;
    const completedTopics = topicStats?.completed || 0;
    const completionPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

    // 2. Practice questions & attempts for this category
    const practiceStats = await database.getFirstAsync<{ attempted: number; correct: number }>(`
      SELECT 
        COUNT(*) as attempted,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM practice_attempts
      WHERE category_id = ? OR category_id LIKE ?;
    `, [domain, `%${domain}%`]);

    const attempted = practiceStats?.attempted || 0;
    const correct = practiceStats?.correct || 0;
    const accuracyPercentage = attempted > 0 ? Math.round((correct / attempted) * 1000) / 10 : 0;

    // 3. Difficulty Breakdown
    const diffRows = await database.getAllAsync<{ difficulty: string; attempted: number; correct: number }>(`
      SELECT 
        pq.difficulty,
        COUNT(pa.id) as attempted,
        SUM(CASE WHEN pa.is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM practice_attempts pa
      JOIN practice_questions pq ON pa.question_id = pq.id
      WHERE pa.category_id = ? OR pa.category_id LIKE ?
      GROUP BY pq.difficulty;
    `, [domain, `%${domain}%`]);

    const diffMap = new Map(diffRows.map((d) => [d.difficulty.toLowerCase(), d]));
    const getDiffData = (lvl: string) => {
      const d = diffMap.get(lvl);
      const att = d?.attempted || 0;
      const cor = d?.correct || 0;
      return {
        attempted: att,
        correct: cor,
        accuracy: att > 0 ? Math.round((cor / att) * 100) : 0,
      };
    };

    // 4. Weak and strong topics (threshold: weak < 60%, strong >= 80%, min 3 attempts)
    const { weakTopics, strongTopics } = await this.getWeakAndStrongTopics(60, 3, domain);

    // 5. Speaking-specific data if applicable
    let speakingSessionsCount = 0;
    let speakingScenariosCount = 0;
    let speakingMinutes = 0;

    if (domain === 'english_speaking') {
      const spkStats = await database.getFirstAsync<{ sessions: number; scenarios: number; duration: number }>(`
        SELECT 
          COUNT(*) as sessions,
          COUNT(DISTINCT scenario_id) as scenarios,
          COALESCE(SUM(duration_seconds), 0) as duration
        FROM speaking_sessions;
      `);
      speakingSessionsCount = spkStats?.sessions || 0;
      speakingScenariosCount = spkStats?.scenarios || 0;
      speakingMinutes = Math.round((spkStats?.duration || 0) / 60);
    }

    return {
      domain,
      title: titleMap[domain],
      topicsCompleted: completedTopics,
      topicsTotal: totalTopics,
      completionPercentage,
      questionsAttempted: attempted,
      questionsCorrect: correct,
      accuracyPercentage,
      difficultyBreakdown: {
        easy: getDiffData('easy'),
        medium: getDiffData('medium'),
        hard: getDiffData('hard'),
      },
      weakTopics,
      strongTopics,
      speakingSessionsCount,
      speakingScenariosCount,
      speakingMinutes,
    };
  }

  async getPracticeAnalytics(): Promise<PracticeAnalyticsMetrics> {
    const database = await this.db.getDatabase();

    const overall = await database.getFirstAsync<{ attempted: number; correct: number }>(`
      SELECT 
        COUNT(*) as attempted,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM practice_attempts;
    `);

    const attempted = overall?.attempted || 0;
    const correct = overall?.correct || 0;
    const incorrect = Math.max(0, attempted - correct);
    const accuracyPercentage = attempted > 0 ? Math.round((correct / attempted) * 1000) / 10 : 0;

    // By Category / Course
    const courseRows = await database.getAllAsync<any>(`
      SELECT 
        pa.category_id,
        COALESCE(pc.name, pa.category_id) as course_name,
        COUNT(*) as attempted,
        SUM(CASE WHEN pa.is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM practice_attempts pa
      LEFT JOIN practice_categories pc ON pa.category_id = pc.id
      GROUP BY pa.category_id
      ORDER BY attempted DESC;
    `);

    const byCourse = courseRows.map((r) => ({
      courseId: r.category_id,
      courseName: r.course_name,
      attempted: r.attempted,
      correct: r.correct,
      accuracy: r.attempted > 0 ? Math.round((r.correct / r.attempted) * 100) : 0,
    }));

    // By Difficulty
    const diffRows = await database.getAllAsync<any>(`
      SELECT 
        pq.difficulty,
        COUNT(*) as attempted,
        SUM(CASE WHEN pa.is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM practice_attempts pa
      JOIN practice_questions pq ON pa.question_id = pq.id
      GROUP BY pq.difficulty;
    `);
    const diffMap = new Map(diffRows.map((d) => [d.difficulty.toLowerCase(), d]));
    const getDiffData = (lvl: string) => {
      const d = diffMap.get(lvl);
      const att = d?.attempted || 0;
      const cor = d?.correct || 0;
      return {
        attempted: att,
        correct: cor,
        accuracy: att > 0 ? Math.round((cor / att) * 100) : 0,
      };
    };

    // By Question Type
    const typeRows = await database.getAllAsync<any>(`
      SELECT 
        pq.question_type,
        COUNT(*) as attempted,
        SUM(CASE WHEN pa.is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM practice_attempts pa
      JOIN practice_questions pq ON pa.question_id = pq.id
      GROUP BY pq.question_type;
    `);

    const byType = typeRows.map((r) => ({
      type: r.question_type,
      attempted: r.attempted,
      correct: r.correct,
      accuracy: r.attempted > 0 ? Math.round((r.correct / r.attempted) * 100) : 0,
    }));

    const { weakTopics, strongTopics } = await this.getWeakAndStrongTopics(60, 3);

    return {
      attempted,
      correct,
      incorrect,
      accuracyPercentage,
      byCourse,
      byDifficulty: {
        easy: getDiffData('easy'),
        medium: getDiffData('medium'),
        hard: getDiffData('hard'),
      },
      byType,
      weakTopics,
      strongTopics,
    };
  }

  async getWeakAndStrongTopics(
    weakThreshold: number = 60,
    minAttempts: number = 3,
    filterCourseId?: string
  ): Promise<{ weakTopics: TopicPerformance[]; strongTopics: TopicPerformance[] }> {
    const database = await this.db.getDatabase();

    let query = `
      SELECT 
        pq.topic as topic_title,
        COALESCE(c.name, pq.category_id) as course_name,
        COUNT(pa.id) as attempts,
        SUM(CASE WHEN pa.is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM practice_attempts pa
      JOIN practice_questions pq ON pa.question_id = pq.id
      LEFT JOIN courses c ON pq.course_id = c.id
      WHERE pq.topic IS NOT NULL AND pq.topic != ''
    `;
    const args: any[] = [];
    if (filterCourseId) {
      query += ' AND (pq.course_id = ? OR pa.category_id = ?)';
      args.push(filterCourseId, filterCourseId);
    }
    query += `
      GROUP BY pq.topic
      HAVING attempts >= ?;
    `;
    args.push(minAttempts);

    const rows = await database.getAllAsync<any>(query, args);

    const weakTopics: TopicPerformance[] = [];
    const strongTopics: TopicPerformance[] = [];

    for (const r of rows) {
      const attempts = r.attempts || 0;
      const correct = r.correct || 0;
      const acc = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

      const item: TopicPerformance = {
        topicId: r.topic_title,
        topicTitle: r.topic_title,
        courseName: r.course_name,
        accuracy: acc,
        attempts,
        correct,
        recommendedAction: acc < weakThreshold ? 'Review core formulas & retry practice set' : 'Mastered',
      };

      if (acc < weakThreshold) {
        weakTopics.push(item);
      } else if (acc >= 80) {
        strongTopics.push(item);
      }
    }

    weakTopics.sort((a, b) => a.accuracy - b.accuracy);
    strongTopics.sort((a, b) => b.accuracy - a.accuracy);

    return { weakTopics, strongTopics };
  }

  // =========================================================================
  // 11. COURSE COMPARISON & TRENDS (Section 31 & 33)
  // =========================================================================

  async getCourseComparison(): Promise<CourseComparisonItem[]> {
    const database = await this.db.getDatabase();

    const rows = await database.getAllAsync<any>(`
      SELECT 
        c.id as course_id,
        c.name as course_name,
        c.icon,
        COUNT(DISTINCT t.id) as total_topics,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_topics
      FROM courses c
      LEFT JOIN modules m ON c.id = m.course_id
      LEFT JOIN topics t ON m.id = t.module_id
      GROUP BY c.id
      ORDER BY c.order_index ASC;
    `);

    const times = await database.getAllAsync<{ course_id: string; total_min: number }>(`
      SELECT course_id, COALESCE(SUM(duration_minutes), 0) as total_min
      FROM study_sessions
      WHERE status = 'COMPLETED'
      GROUP BY course_id;
    `);
    const timeMap = new Map(times.map((t) => [t.course_id, t.total_min]));

    return rows.map((r) => {
      const total = r.total_topics || 0;
      const comp = r.completed_topics || 0;
      return {
        courseId: r.course_id,
        courseName: r.course_name,
        icon: r.icon || 'book-outline',
        progressPercentage: total > 0 ? Math.min(100, Math.round((comp / total) * 100)) : 0,
        studyMinutes: timeMap.get(r.course_id) || 0,
        completedTopics: comp,
        totalTopics: total,
      };
    });
  }

  async getProgressTrends(range: '7d' | '30d' | '90d' = '7d'): Promise<ProgressTrendsData> {
    const database = await this.db.getDatabase();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;

    const completionTrend: Array<{ date: string; cumulativeCompleted: number }> = [];
    const studyTimeTrend: Array<{ date: string; minutes: number }> = [];
    const accuracyTrend: Array<{ date: string; accuracy: number; attempts: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = formatDateString(d);

      // Cumulative topics completed up to this date
      const compRow = await database.getFirstAsync<{ count: number }>(`
        SELECT COUNT(*) as count 
        FROM learning_activity 
        WHERE activity_type = 'TOPIC_COMPLETED' AND activity_date <= ?;
      `, [dStr]);
      completionTrend.push({ date: dStr, cumulativeCompleted: compRow?.count || 0 });

      // Study time on this date
      const timeRow = await database.getFirstAsync<{ total_min: number }>(`
        SELECT COALESCE(SUM(duration_minutes), 0) as total_min 
        FROM study_sessions 
        WHERE date = ? AND status = 'COMPLETED';
      `, [dStr]);
      studyTimeTrend.push({ date: dStr, minutes: timeRow?.total_min || 0 });

      // Practice accuracy on this date
      const pracRow = await database.getFirstAsync<{ attempted: number; correct: number }>(`
        SELECT 
          COUNT(*) as attempted,
          SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM practice_attempts 
        WHERE attempted_at LIKE ?;
      `, [`${dStr}%`]);
      const att = pracRow?.attempted || 0;
      const cor = pracRow?.correct || 0;
      accuracyTrend.push({
        date: dStr,
        accuracy: att > 0 ? Math.round((cor / att) * 100) : 0,
        attempts: att,
      });
    }

    return {
      completionTrend,
      studyTimeTrend,
      accuracyTrend,
    };
  }

  // =========================================================================
  // 12. PROGRESS SNAPSHOT (Section 35)
  // =========================================================================

  async createProgressSnapshot(): Promise<void> {
    const database = await this.db.getDatabase();
    const today = getTodayDateString();
    const now = getCurrentTimestamp();

    const overall = await this.getOverallProgress();
    const studyTimes = await this.getStudyTimeBreakdown();
    const practice = await this.getPracticeAnalytics();

    const id = generateId('snap');
    await database.runAsync(`
      INSERT INTO progress_snapshots (
        id, snapshot_date, total_topics, completed_topics,
        completion_percentage, study_minutes, practice_attempts, practice_correct, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      id,
      today,
      overall.totalTopics,
      overall.completedTopics,
      overall.completionPercentage,
      studyTimes.allTimeMinutes,
      practice.attempted,
      practice.correct,
      now,
    ]);
  }
}

export const analyticsRepository = new AnalyticsRepository();
