import { dbManager } from '../database/DatabaseManager';
import { Course, CourseRow, courseFromRow } from '../models/Course';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class CourseRepository {
  async getAll(): Promise<Course[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<CourseRow>(
      'SELECT * FROM courses ORDER BY order_index ASC;'
    );
    return rows.map(courseFromRow);
  }

  async getById(id: string): Promise<Course | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<CourseRow>(
      'SELECT * FROM courses WHERE id = ?;',
      [id]
    );
    return row ? courseFromRow(row) : null;
  }

  async create(course: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    theme?: string;
    order?: number;
  }): Promise<Course> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    const orderIndex = course.order ?? 0;

    await db.runAsync(
      `INSERT INTO courses (
        id, name, description, icon, theme, order_index,
        total_modules, completed_modules, progress_percentage,
        is_completed, started_at, completed_at, introduction_completed,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0.0, 0, NULL, NULL, 0, ?, ?);`,
      [
        course.id,
        course.name,
        course.description || '',
        course.icon || 'book',
        course.theme || 'default',
        orderIndex,
        now,
        now,
      ]
    );

    const created = await this.getById(course.id);
    if (!created) {
      throw new Error(`Failed to create course with id ${course.id}`);
    }
    return created;
  }

  async startJourney(id: string): Promise<Course> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();

    await db.runAsync(
      `UPDATE courses
       SET started_at = COALESCE(started_at, ?),
           introduction_completed = 1,
           updated_at = ?
       WHERE id = ?;`,
      [now, now, id]
    );

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Course ${id} not found after startJourney`);
    }
    return updated;
  }

  async markCompleted(id: string): Promise<Course> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();

    await db.runAsync(
      `UPDATE courses
       SET is_completed = 1,
           completed_at = COALESCE(completed_at, ?),
           progress_percentage = 100.0,
           updated_at = ?
       WHERE id = ?;`,
      [now, now, id]
    );

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Course ${id} not found after markCompleted`);
    }
    return updated;
  }

  async updateProgressStats(
    id: string,
    totalModules: number,
    completedModules: number,
    progressPercentage: number,
    isCompleted: boolean,
    completedAt: string | null = null
  ): Promise<void> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();

    await db.runAsync(
      `UPDATE courses 
       SET total_modules = ?,
           completed_modules = ?,
           progress_percentage = ?,
           is_completed = ?,
           completed_at = CASE 
             WHEN ? = 1 THEN COALESCE(completed_at, ?)
             ELSE NULL
           END,
           updated_at = ?
       WHERE id = ?;`,
      [
        totalModules,
        completedModules,
        progressPercentage,
        isCompleted ? 1 : 0,
        isCompleted ? 1 : 0,
        completedAt || now,
        now,
        id,
      ]
    );
  }

  async getCompletionStats(courseId: string): Promise<{
    course: Course;
    totalTopics: number;
    completedTopics: number;
    totalNotes: number;
  }> {
    const db = await dbManager.getDatabase();
    const course = await this.getById(courseId);
    if (!course) {
      throw new Error(`Course ${courseId} not found`);
    }

    const topicsResult = await db.getFirstAsync<{ total: number; completed: number }>(
      `SELECT 
        COUNT(t.id) as total,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed
       FROM topics t
       JOIN modules m ON m.id = t.module_id
       WHERE m.course_id = ?;`,
      [courseId]
    );

    const notesResult = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM notes WHERE course_id = ?;',
      [courseId]
    );

    return {
      course,
      totalTopics: topicsResult?.total || 0,
      completedTopics: topicsResult?.completed || 0,
      totalNotes: notesResult?.count || 0,
    };
  }

  async delete(id: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync('DELETE FROM courses WHERE id = ?;', [id]);
  }
}

export const courseRepository = new CourseRepository();
