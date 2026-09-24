import { dbManager } from '../database/DatabaseManager';
import { Module, ModuleRow, moduleFromRow } from '../models/Module';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class ModuleRepository {
  async getByCourseId(courseId: string): Promise<Module[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<ModuleRow>(
      `SELECT 
        m.id, m.course_id, m.title, m.description, m.order_index, m.icon,
        m.is_completed, m.completed_at, m.created_at, m.last_opened_topic_id,
        COUNT(t.id) as topic_count,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_topic_count
       FROM modules m
       LEFT JOIN topics t ON t.module_id = m.id
       WHERE m.course_id = ?
       GROUP BY m.id
       ORDER BY m.order_index ASC;`,
      [courseId]
    );
    return rows.map(moduleFromRow);
  }

  async getAll(): Promise<Module[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<ModuleRow>(
      `SELECT 
        m.id, m.course_id, m.title, m.description, m.order_index, m.icon,
        m.is_completed, m.completed_at, m.created_at, m.last_opened_topic_id,
        COUNT(t.id) as topic_count,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_topic_count
       FROM modules m
       LEFT JOIN topics t ON t.module_id = m.id
       GROUP BY m.id
       ORDER BY m.order_index ASC;`
    );
    return rows.map(moduleFromRow);
  }

  async getById(id: string): Promise<Module | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<ModuleRow>(
      `SELECT 
        m.id, m.course_id, m.title, m.description, m.order_index, m.icon,
        m.is_completed, m.completed_at, m.created_at, m.last_opened_topic_id,
        COUNT(t.id) as topic_count,
        SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_topic_count
       FROM modules m
       LEFT JOIN topics t ON t.module_id = m.id
       WHERE m.id = ?
       GROUP BY m.id;`,
      [id]
    );
    return row ? moduleFromRow(row) : null;
  }

  async create(module: {
    id: string;
    course_id: string;
    title: string;
    description?: string;
    order?: number;
    icon?: string;
  }): Promise<Module> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    const orderIndex = module.order ?? 0;

    await db.runAsync(
      `INSERT INTO modules (
        id, course_id, title, description, order_index, icon,
        is_completed, completed_at, created_at, last_opened_topic_id
      ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?, NULL);`,
      [
        module.id,
        module.course_id,
        module.title,
        module.description || '',
        orderIndex,
        module.icon || 'book-outline',
        now,
      ]
    );

    const created = await this.getById(module.id);
    if (!created) {
      throw new Error(`Failed to create module with id ${module.id}`);
    }
    return created;
  }

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

  async setLastOpenedTopic(moduleId: string, topicId: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      'UPDATE modules SET last_opened_topic_id = ? WHERE id = ?;',
      [topicId, moduleId]
    );
  }

  async delete(id: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync('DELETE FROM modules WHERE id = ?;', [id]);
  }

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
