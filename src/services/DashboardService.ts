import { dbManager } from '../database/DatabaseManager';
import { Course, CourseRow, courseFromRow } from '../models/Course';
import { Module, ModuleRow, moduleFromRow } from '../models/Module';

export interface OverallProgressStats {
  totalCourses: number;
  startedCourses: number;
  completedCourses: number;
  totalModules: number;
  completedModules: number;
  overallProgressPercentage: number;
  totalTopics: number;
  completedTopics: number;
  totalNotes: number;
}

export interface CurrentLearningItem {
  course: Course;
  currentModule: Module;
  completedModules: number;
  totalModules: number;
  progressPercentage: number;
}

export interface CompletedModuleItem {
  moduleId: string;
  moduleTitle: string;
  courseId: string;
  courseName: string;
  courseIcon: string;
  completedAt: string | null;
}

export interface RemainingCourseItem {
  course: Course;
  remainingModules: number;
  completedModules: number;
  totalModules: number;
}

export interface NoteItemWithContext {
  id: string;
  course_id: string;
  course_name: string;
  course_icon: string;
  module_id: string | null;
  module_title: string | null;
  note_text: string;
  created_at: string;
  updated_at: string;
}

export class DashboardService {
  /**
   * Retrieves overall learning metrics aggregated across SQLite tables.
   */
  async getOverallStats(): Promise<OverallProgressStats> {
    const db = await dbManager.getDatabase();

    const coursesStats = await db.getFirstAsync<{
      total: number;
      started: number;
      completed: number;
    }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN started_at IS NOT NULL OR introduction_completed = 1 THEN 1 ELSE 0 END) as started,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
      FROM courses;
    `);

    const modulesStats = await db.getFirstAsync<{
      total: number;
      completed: number;
    }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
      FROM modules;
    `);

    const topicsStats = await db.getFirstAsync<{
      total: number;
      completed: number;
    }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
      FROM topics;
    `);

    const notesStats = await db.getFirstAsync<{ count: number }>(`
      SELECT COUNT(*) as count FROM notes;
    `);

    const totalModules = modulesStats?.total || 0;
    const completedModules = modulesStats?.completed || 0;
    const overallProgress = totalModules > 0
      ? Math.round((completedModules / totalModules) * 100)
      : 0;

    return {
      totalCourses: coursesStats?.total || 0,
      startedCourses: coursesStats?.started || 0,
      completedCourses: coursesStats?.completed || 0,
      totalModules,
      completedModules,
      overallProgressPercentage: overallProgress,
      totalTopics: topicsStats?.total || 0,
      completedTopics: topicsStats?.completed || 0,
      totalNotes: notesStats?.count || 0,
    };
  }

  /**
   * Identifies the user's active unfinished course and current module.
   */
  async getCurrentLearningItem(): Promise<CurrentLearningItem | null> {
    const db = await dbManager.getDatabase();

    // 1. Look for started, unfinished courses ordered by updated_at DESC
    const activeCourseRow = await db.getFirstAsync<CourseRow>(`
      SELECT * FROM courses 
      WHERE is_completed = 0 
        AND (started_at IS NOT NULL OR introduction_completed = 1)
      ORDER BY updated_at DESC 
      LIMIT 1;
    `);

    if (!activeCourseRow) {
      // Check if there is any course with progress > 0
      const inProgressRow = await db.getFirstAsync<CourseRow>(`
        SELECT * FROM courses 
        WHERE is_completed = 0 AND completed_modules > 0
        ORDER BY updated_at DESC 
        LIMIT 1;
      `);
      if (!inProgressRow) {
        // Fallback to default_course_id from app_settings
        const defaultCourseSetting = await db.getFirstAsync<{ value: string }>(
          "SELECT value FROM app_settings WHERE key = 'default_course_id';"
        );
        if (defaultCourseSetting?.value) {
          const defaultRow = await db.getFirstAsync<CourseRow>(
            'SELECT * FROM courses WHERE id = ?;',
            [defaultCourseSetting.value]
          );
          if (defaultRow) {
            return this.resolveCurrentModuleForCourse(defaultRow);
          }
        }
        return null;
      }
      return this.resolveCurrentModuleForCourse(inProgressRow);
    }

    return this.resolveCurrentModuleForCourse(activeCourseRow);
  }

  private async resolveCurrentModuleForCourse(courseRow: CourseRow): Promise<CurrentLearningItem | null> {
    const db = await dbManager.getDatabase();
    const course = courseFromRow(courseRow);

    // Find the first uncompleted module in this course
    const moduleRow = await db.getFirstAsync<ModuleRow>(`
      SELECT 
        m.id, m.course_id, m.title, m.description, m.order_index, m.icon,
        m.is_completed, m.completed_at, m.created_at, m.last_opened_topic_id,
        COUNT(t.id) as topic_count,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_topic_count
      FROM modules m
      LEFT JOIN topics t ON t.module_id = m.id
      WHERE m.course_id = ? AND m.is_completed = 0
      GROUP BY m.id
      ORDER BY m.order_index ASC
      LIMIT 1;
    `, [course.id]);

    if (moduleRow) {
      return {
        course,
        currentModule: moduleFromRow(moduleRow),
        completedModules: course.completed_modules,
        totalModules: course.total_modules,
        progressPercentage: course.progress_percentage,
      };
    }

    // Fallback: get first module of course
    const firstModuleRow = await db.getFirstAsync<ModuleRow>(`
      SELECT 
        m.id, m.course_id, m.title, m.description, m.order_index, m.icon,
        m.is_completed, m.completed_at, m.created_at, m.last_opened_topic_id,
        COUNT(t.id) as topic_count,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_topic_count
      FROM modules m
      LEFT JOIN topics t ON t.module_id = m.id
      WHERE m.course_id = ?
      GROUP BY m.id
      ORDER BY m.order_index ASC
      LIMIT 1;
    `, [course.id]);

    if (!firstModuleRow) return null;

    return {
      course,
      currentModule: moduleFromRow(firstModuleRow),
      completedModules: course.completed_modules,
      totalModules: course.total_modules,
      progressPercentage: course.progress_percentage,
    };
  }

  /**
   * Retrieves all completed courses ordered by completion date.
   */
  async getCompletedCourses(): Promise<Course[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<CourseRow>(`
      SELECT * FROM courses 
      WHERE is_completed = 1 
      ORDER BY completed_at DESC, updated_at DESC;
    `);
    return rows.map(courseFromRow);
  }

  /**
   * Retrieves recently completed modules across all courses.
   */
  async getRecentlyCompletedModules(limit = 15): Promise<CompletedModuleItem[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<{
      moduleId: string;
      moduleTitle: string;
      courseId: string;
      courseName: string;
      courseIcon: string;
      completedAt: string | null;
    }>(`
      SELECT 
        m.id as moduleId,
        m.title as moduleTitle,
        m.completed_at as completedAt,
        c.id as courseId,
        c.name as courseName,
        c.icon as courseIcon
      FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.is_completed = 1
      ORDER BY m.completed_at DESC, m.created_at DESC
      LIMIT ?;
    `, [limit]);

    return rows;
  }

  /**
   * Retrieves remaining unfinished courses with remaining module counts.
   */
  async getRemainingCourses(): Promise<RemainingCourseItem[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<CourseRow>(`
      SELECT * FROM courses 
      WHERE is_completed = 0 
      ORDER BY order_index ASC;
    `);

    return rows.map((row) => {
      const course = courseFromRow(row);
      const remainingModules = Math.max(0, course.total_modules - course.completed_modules);
      return {
        course,
        remainingModules,
        completedModules: course.completed_modules,
        totalModules: course.total_modules,
      };
    });
  }

  /**
   * Searches notes with course and module metadata.
   */
  async searchNotes(query?: string): Promise<NoteItemWithContext[]> {
    const db = await dbManager.getDatabase();
    const trimmed = query?.trim() || '';

    let rows: any[];
    if (trimmed.length > 0) {
      const searchPattern = `%${trimmed}%`;
      rows = await db.getAllAsync<any>(`
        SELECT 
          n.id,
          n.course_id,
          n.module_id,
          n.note_text,
          n.created_at,
          n.updated_at,
          COALESCE(c.name, 'Grand Line Island') as course_name,
          COALESCE(c.icon, 'book') as course_icon,
          COALESCE(m.title, 'General Notes') as module_title
        FROM notes n
        LEFT JOIN courses c ON n.course_id = c.id
        LEFT JOIN modules m ON n.module_id = m.id
        WHERE n.note_text LIKE ? 
           OR c.name LIKE ? 
           OR m.title LIKE ?
        ORDER BY n.updated_at DESC;
      `, [searchPattern, searchPattern, searchPattern]);
    } else {
      rows = await db.getAllAsync<any>(`
        SELECT 
          n.id,
          n.course_id,
          n.module_id,
          n.note_text,
          n.created_at,
          n.updated_at,
          COALESCE(c.name, 'Grand Line Island') as course_name,
          COALESCE(c.icon, 'book') as course_icon,
          COALESCE(m.title, 'General Notes') as module_title
        FROM notes n
        LEFT JOIN courses c ON n.course_id = c.id
        LEFT JOIN modules m ON n.module_id = m.id
        ORDER BY n.updated_at DESC;
      `);
    }

    return rows.map((r) => ({
      id: r.id,
      course_id: r.course_id,
      course_name: r.course_name,
      course_icon: r.course_icon,
      module_id: r.module_id,
      module_title: r.module_title,
      note_text: r.note_text,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  }
}

export const dashboardService = new DashboardService();
