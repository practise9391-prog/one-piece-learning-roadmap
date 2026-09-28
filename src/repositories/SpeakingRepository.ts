import { DatabaseManager } from '../database/DatabaseManager';
import {
  SpeakingTopic,
  SpeakingScenario,
  SpeakingSession,
  SpeakingLevel,
  SpeakingCategory,
  SpeakingMode,
} from '../models/Speaking';

export class SpeakingRepository {
  private db = DatabaseManager.getInstance();

  /**
   * Retrieves all speaking topics ordered by level and order_index.
   */
  async getAllTopics(): Promise<SpeakingTopic[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM speaking_topics ORDER BY level ASC, order_index ASC;`
    );

    return rows.map((r) => this.mapTopicFromRow(r));
  }

  /**
   * Retrieves topics for a specific level (1-8).
   */
  async getTopicsByLevel(level: SpeakingLevel): Promise<SpeakingTopic[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM speaking_topics WHERE level = ? ORDER BY order_index ASC;`,
      [level]
    );

    return rows.map((r) => this.mapTopicFromRow(r));
  }

  /**
   * Retrieves topics for a specific category.
   */
  async getTopicsByCategory(category: SpeakingCategory): Promise<SpeakingTopic[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM speaking_topics WHERE category = ? ORDER BY level ASC, order_index ASC;`,
      [category]
    );

    return rows.map((r) => this.mapTopicFromRow(r));
  }

  /**
   * Retrieves a single speaking topic by ID.
   */
  async getTopicById(id: string): Promise<SpeakingTopic | null> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<any>(
      `SELECT * FROM speaking_topics WHERE id = ?;`,
      [id]
    );

    return row ? this.mapTopicFromRow(row) : null;
  }

  /**
   * Marks a speaking topic as completed.
   */
  async markTopicCompleted(id: string): Promise<boolean> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    await database.runAsync(
      `UPDATE speaking_topics SET is_completed = 1, completed_at = ? WHERE id = ?;`,
      [now, id]
    );

    return true;
  }

  /**
   * Retrieves all real-life conversation scenarios.
   */
  async getAllScenarios(): Promise<SpeakingScenario[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM speaking_scenarios ORDER BY order_index ASC;`
    );

    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      role_user: r.role_user,
      role_partner: r.role_partner,
      situation: r.situation,
      useful_vocabulary: this.safeParseJson(r.useful_vocabulary, []),
      sample_dialogue: this.safeParseJson(r.sample_dialogue, []),
      practice_prompt: r.practice_prompt,
      order_index: r.order_index,
    }));
  }

  /**
   * Retrieves a single speaking scenario by ID.
   */
  async getScenarioById(id: string): Promise<SpeakingScenario | null> {
    const database = await this.db.getDatabase();
    const r = await database.getFirstAsync<any>(
      `SELECT * FROM speaking_scenarios WHERE id = ?;`,
      [id]
    );

    if (!r) return null;

    return {
      id: r.id,
      title: r.title,
      category: r.category,
      role_user: r.role_user,
      role_partner: r.role_partner,
      situation: r.situation,
      useful_vocabulary: this.safeParseJson(r.useful_vocabulary, []),
      sample_dialogue: this.safeParseJson(r.sample_dialogue, []),
      practice_prompt: r.practice_prompt,
      order_index: r.order_index,
    };
  }

  /**
   * Records a speaking practice or simulated conversation session.
   */
  async saveSpeakingSession(session: {
    id: string;
    topic_id?: string;
    scenario_id?: string;
    mode: SpeakingMode;
    duration_seconds: number;
    transcript: any[];
    feedback_notes?: string;
  }): Promise<void> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    await database.runAsync(
      `INSERT INTO speaking_sessions (
        id, topic_id, scenario_id, mode, duration_seconds, transcript, feedback_notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        session.id,
        session.topic_id || null,
        session.scenario_id || null,
        session.mode,
        session.duration_seconds,
        JSON.stringify(session.transcript),
        session.feedback_notes || null,
        now,
      ]
    );
  }

  /**
   * Retrieves speaking progress summary.
   */
  async getSpeakingProgressStats(): Promise<{
    totalTopics: number;
    completedTopics: number;
    totalScenarios: number;
    totalPracticeSeconds: number;
  }> {
    const database = await this.db.getDatabase();

    const [topicsRow, completedRow, scenariosRow, durationRow] = await Promise.all([
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM speaking_topics;'),
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM speaking_topics WHERE is_completed = 1;'),
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM speaking_scenarios;'),
      database.getFirstAsync<{ total: number }>('SELECT COALESCE(SUM(duration_seconds), 0) as total FROM speaking_sessions;'),
    ]);

    return {
      totalTopics: topicsRow?.count || 0,
      completedTopics: completedRow?.count || 0,
      totalScenarios: scenariosRow?.count || 0,
      totalPracticeSeconds: durationRow?.total || 0,
    };
  }

  private mapTopicFromRow(r: any): SpeakingTopic {
    return {
      id: r.id,
      title: r.title,
      description: r.description || '',
      level: r.level as SpeakingLevel,
      category: r.category as SpeakingCategory,
      difficulty: r.difficulty || 'beginner',
      scenario_type: r.scenario_type || undefined,
      lesson_content: r.lesson_content ? this.safeParseJson(r.lesson_content, undefined) : undefined,
      order_index: r.order_index,
      is_completed: r.is_completed === 1,
      completed_at: r.completed_at,
    };
  }

  private safeParseJson(str: any, fallback: any): any {
    if (!str || typeof str !== 'string') return fallback;
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  }
}

export const speakingRepository = new SpeakingRepository();
