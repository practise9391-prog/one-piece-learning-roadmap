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

  /**
   * Searches and filters topics across all courses and modules with debounced live support.
   */
  async searchTopics(filter: {
    query?: string;
    courseId?: string;
    moduleId?: string;
    status?: string;
  }): Promise<{
    topicId: string;
    topicTitle: string;
    topicDescription: string;
    moduleId: string;
    moduleTitle: string;
    courseId: string;
    courseName: string;
    courseTheme: string;
    isCompleted: boolean;
    status: 'completed' | 'in_progress' | 'available' | 'locked';
  }[]> {
    const db = await dbManager.getDatabase();
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.query && filter.query.trim().length > 0) {
      const trimmed = filter.query.trim();
      const keywords = trimmed.split(/\s+/).filter(Boolean);
      if (keywords.length > 1) {
        const subConds = keywords.map(() => '(t.title LIKE ? OR t.description LIKE ? OR m.title LIKE ? OR c.name LIKE ?)');
        conditions.push(`(${subConds.join(' AND ')})`);
        for (const kw of keywords) {
          const kwParam = `%${kw}%`;
          params.push(kwParam, kwParam, kwParam, kwParam);
        }
      } else {
        const q = `%${trimmed}%`;
        conditions.push('(t.title LIKE ? OR t.description LIKE ? OR m.title LIKE ? OR c.name LIKE ?)');
        params.push(q, q, q, q);
      }
    }

    if (filter.courseId && filter.courseId !== 'ALL') {
      conditions.push('c.id = ?');
      params.push(filter.courseId);
    }

    if (filter.moduleId) {
      conditions.push('m.id = ?');
      params.push(filter.moduleId);
    }

    if (filter.status === 'COMPLETED') {
      conditions.push('t.is_completed = 1');
    } else if (filter.status === 'REMAINING') {
      conditions.push('t.is_completed = 0');
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        t.id as topicId,
        t.title as topicTitle,
        t.description as topicDescription,
        t.is_completed as isCompleted,
        m.id as moduleId,
        m.title as moduleTitle,
        m.order_index as moduleOrder,
        c.id as courseId,
        c.name as courseName,
        c.theme as courseTheme
      FROM topics t
      JOIN modules m ON t.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      ${whereClause}
      ORDER BY c.order_index ASC, m.order_index ASC, t.order_index ASC
      LIMIT 120;
    `;

    const rows = await db.getAllAsync<any>(sql, params);

    return rows.map((r) => {
      const completed = r.isCompleted === 1;
      return {
        topicId: r.topicId,
        topicTitle: r.topicTitle,
        topicDescription: r.topicDescription || '',
        moduleId: r.moduleId,
        moduleTitle: r.moduleTitle,
        courseId: r.courseId,
        courseName: r.courseName,
        courseTheme: r.courseTheme || 'default',
        isCompleted: completed,
        status: completed ? 'completed' : 'available',
      };
    });
  }
}

export const topicRepository = new TopicRepository();
