import { dbManager } from '../database/DatabaseManager';
import { UserProgress, UserProgressRow, progressFromRow, ProgressStatus } from '../models/UserProgress';
import { getCurrentTimestamp } from '../utils/dateUtils';
import { generateId } from '../utils/idGenerator';

export class ProgressRepository {
  /**
   * Retrieves progress entry for a specific course and module.
   */
  async getByCourseAndModule(
    courseId: string,
    moduleId: string
  ): Promise<UserProgress | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<UserProgressRow>(
      'SELECT * FROM user_progress WHERE course_id = ? AND module_id = ?;',
      [courseId, moduleId]
    );
    return row ? progressFromRow(row) : null;
  }

  /**
   * Retrieves all progress entries for a course.
   */
  async getByCourseId(courseId: string): Promise<UserProgress[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<UserProgressRow>(
      'SELECT * FROM user_progress WHERE course_id = ?;',
      [courseId]
    );
    return rows.map(progressFromRow);
  }

  /**
   * Upserts a progress record in SQLite.
   */
  async upsert(
    courseId: string,
    moduleId: string,
    status: ProgressStatus,
    completedAt: string | null = null
  ): Promise<UserProgress> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    const existing = await this.getByCourseAndModule(courseId, moduleId);

    if (existing) {
      await db.runAsync(
        `UPDATE user_progress
         SET status = ?, completed_at = ?, updated_at = ?
         WHERE id = ?;`,
        [status, completedAt, now, existing.id]
      );
      return {
        ...existing,
        status,
        completed_at: completedAt,
        updated_at: now,
      };
    } else {
      const id = generateId('prog');
      await db.runAsync(
        `INSERT INTO user_progress (
          id, course_id, module_id, status, completed_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [id, courseId, moduleId, status, completedAt, now, now]
      );
      return {
        id,
        course_id: courseId,
        module_id: moduleId,
        status,
        completed_at: completedAt,
        created_at: now,
        updated_at: now,
      };
    }
  }

  /**
   * Deletes progress entries for a course.
   */
  async deleteByCourse(courseId: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync('DELETE FROM user_progress WHERE course_id = ?;', [courseId]);
  }
}

export const progressRepository = new ProgressRepository();

