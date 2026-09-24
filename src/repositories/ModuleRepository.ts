import { dbManager } from '../database/DatabaseManager';
import { Module, ModuleRow, moduleFromRow } from '../models/Module';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class ModuleRepository {
  /**
   * Retrieves all modules for a course ordered by order_index.
   */
  async getByCourseId(courseId: string): Promise<Module[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<ModuleRow>(
      'SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC;',
      [courseId]
    );
    return rows.map(moduleFromRow);
  }

  /**
   * Retrieves all modules in the entire database.
   */
  async getAll(): Promise<Module[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<ModuleRow>(
      'SELECT * FROM modules ORDER BY order_index ASC;'
    );
    return rows.map(moduleFromRow);
  }

  /**
   * Retrieves a single module by ID.
   */
  async getById(id: string): Promise<Module | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<ModuleRow>(
      'SELECT * FROM modules WHERE id = ?;',
      [id]
    );
    return row ? moduleFromRow(row) : null;
  }

  /**
   * Inserts a new module into SQLite.
   */
  async create(module: {
    id: string;
    course_id: string;
    title: string;
    description?: string;
    order?: number;
  }): Promise<Module> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    const orderIndex = module.order ?? 0;

    await db.runAsync(
      `INSERT INTO modules (
        id, course_id, title, description, order_index,
        is_completed, completed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, NULL, ?);`,
      [
        module.id,
        module.course_id,
        module.title,
        module.description || '',
        orderIndex,
        now,
      ]
    );

    const created = await this.getById(module.id);
    if (!created) {
      throw new Error(`Failed to create module with id ${module.id}`);
    }
    return created;
  }

  /**
   * Sets module completion status in SQLite.
   */
  async setCompletionStatus(
    id: string,
    isCompleted: boolean,
    completedAt: string | null
  ): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE modules
       SET is_completed = ?, completed_at = ?
       WHERE id = ?;`,
      [isCompleted ? 1 : 0, completedAt, id]
    );
  }

  /**
   * Deletes a module by ID.
   */
  async delete(id: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync('DELETE FROM modules WHERE id = ?;', [id]);
  }

  /**
   * Computes counts of total and completed modules for a given course.
   */
  async countByCourse(courseId: string): Promise<{ total: number; completed: number }> {
    const db = await dbManager.getDatabase();
    const result = await db.getFirstAsync<{ total: number; completed: number }>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
       FROM modules 
       WHERE course_id = ?;`,
      [courseId]
    );

    return {
      total: result?.total || 0,
      completed: result?.completed || 0,
    };
  }
}

export const moduleRepository = new ModuleRepository();

