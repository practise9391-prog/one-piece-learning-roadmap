import { dbManager } from '../database/DatabaseManager';
import { Course, CourseRow, courseFromRow } from '../models/Course';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class CourseRepository {
  /**
   * Retrieves all courses ordered by order_index.
   */
  async getAll(): Promise<Course[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<CourseRow>(
      'SELECT * FROM courses ORDER BY order_index ASC;'
    );
    return rows.map(courseFromRow);
  }

  /**
   * Retrieves a single course by ID.
   */
  async getById(id: string): Promise<Course | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<CourseRow>(
      'SELECT * FROM courses WHERE id = ?;',
      [id]
    );
    return row ? courseFromRow(row) : null;
  }

  /**
   * Inserts a new course.
   */
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
        is_completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0.0, 0, ?, ?);`,
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

  /**
   * Updates course fields.
   */
  async update(id: string, updates: Partial<{
    name: string;
    description: string;
    icon: string;
    theme: string;
    order: number;
  }>): Promise<void> {
    const db = await dbManager.getDatabase();
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Course with id ${id} not found`);
    }

    const name = updates.name ?? existing.name;
    const description = updates.description ?? existing.description;
    const icon = updates.icon ?? existing.icon;
    const theme = updates.theme ?? existing.theme;
    const orderIndex = updates.order ?? existing.order;
    const now = getCurrentTimestamp();

    await db.runAsync(
      `UPDATE courses 
       SET name = ?, description = ?, icon = ?, theme = ?, order_index = ?, updated_at = ?
       WHERE id = ?;`,
      [name, description, icon, theme, orderIndex, now, id]
    );
  }

  /**
   * Updates computed progress stats for a course.
   */
  async updateProgressStats(
    id: string,
    totalModules: number,
    completedModules: number,
    progressPercentage: number,
    isCompleted: boolean
  ): Promise<void> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();

    await db.runAsync(
      `UPDATE courses 
       SET total_modules = ?,
           completed_modules = ?,
           progress_percentage = ?,
           is_completed = ?,
           updated_at = ?
       WHERE id = ?;`,
      [
        totalModules,
        completedModules,
        progressPercentage,
        isCompleted ? 1 : 0,
        now,
        id,
      ]
    );
  }

  /**
   * Deletes a course by ID (cascades to modules, notes, progress via SQLite FKs).
   */
  async delete(id: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync('DELETE FROM courses WHERE id = ?;', [id]);
  }

  /**
   * Counts total courses stored.
   */
  async count(): Promise<number> {
    const db = await dbManager.getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM courses;'
    );
    return result?.count || 0;
  }
}

export const courseRepository = new CourseRepository();

