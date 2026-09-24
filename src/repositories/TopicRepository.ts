import { dbManager } from '../database/DatabaseManager';
import { Topic, TopicRow, topicFromRow } from '../models/Topic';
import { getCurrentTimestamp } from '../utils/dateUtils';

export class TopicRepository {
  /**
   * Retrieves all topics for a given module ordered by order_index.
   */
  async getByModuleId(moduleId: string): Promise<Topic[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<TopicRow>(
      'SELECT * FROM topics WHERE module_id = ? ORDER BY order_index ASC;',
      [moduleId]
    );
    return rows.map(topicFromRow);
  }

  /**
   * Retrieves a single topic by ID.
   */
  async getById(id: string): Promise<Topic | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<TopicRow>(
      'SELECT * FROM topics WHERE id = ?;',
      [id]
    );
    return row ? topicFromRow(row) : null;
  }

  /**
   * Updates topic completion status.
   */
  async setCompletionStatus(
    id: string,
    isCompleted: boolean,
    completedAt: string | null = null
  ): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topics
       SET is_completed = ?, completed_at = ?
       WHERE id = ?;`,
      [isCompleted ? 1 : 0, completedAt, id]
    );
  }

  /**
   * Counts total and completed topics for a module.
   */
  async countByModule(moduleId: string): Promise<{ total: number; completed: number }> {
    const db = await dbManager.getDatabase();
    const result = await db.getFirstAsync<{ total: number; completed: number }>(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
       FROM topics
       WHERE module_id = ?;`,
      [moduleId]
    );
    return {
      total: result?.total || 0,
      completed: result?.completed || 0,
    };
  }

  /**
   * Inserts a new topic into SQLite.
   */
  async create(topic: {
    id: string;
    module_id: string;
    title: string;
    description?: string;
    order?: number;
  }): Promise<Topic> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    const orderIndex = topic.order ?? 0;

    await db.runAsync(
      `INSERT INTO topics (
        id, module_id, title, description, order_index,
        is_completed, completed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, 0, NULL, ?);`,
      [
        topic.id,
        topic.module_id,
        topic.title,
        topic.description || '',
        orderIndex,
        now,
      ]
    );

    const created = await this.getById(topic.id);
    if (!created) {
      throw new Error(`Failed to create topic with id ${topic.id}`);
    }
    return created;
  }
}

export const topicRepository = new TopicRepository();
