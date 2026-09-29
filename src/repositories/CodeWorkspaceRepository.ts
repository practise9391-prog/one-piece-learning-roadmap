import { DatabaseManager } from '../database/DatabaseManager';
import { SavedCodeSnippet, PersistentDebugSession } from '../models/Debugger';

export class CodeWorkspaceRepository {
  private static instance: CodeWorkspaceRepository;
  private dbManager = DatabaseManager.getInstance();

  public static getInstance(): CodeWorkspaceRepository {
    if (!CodeWorkspaceRepository.instance) {
      CodeWorkspaceRepository.instance = new CodeWorkspaceRepository();
    }
    return CodeWorkspaceRepository.instance;
  }

  // ==========================================
  // CODE SNIPPETS
  // ==========================================

  async saveSnippet(snippet: SavedCodeSnippet): Promise<void> {
    const db = await this.dbManager.getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO saved_code_snippets (
        id, title, user_id, course_id, topic_id, task_id, language, code, learning_mode, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        snippet.id,
        snippet.title,
        snippet.user_id,
        snippet.course_id || null,
        snippet.topic_id || null,
        snippet.task_id || null,
        snippet.language,
        snippet.code,
        snippet.learning_mode,
        snippet.created_at,
        snippet.updated_at,
      ]
    );
  }

  async getSnippets(userId: string = 'default_user', language?: string): Promise<SavedCodeSnippet[]> {
    const db = await this.dbManager.getDatabase();
    if (language) {
      return await db.getAllAsync<SavedCodeSnippet>(
        `SELECT * FROM saved_code_snippets WHERE user_id = ? AND language = ? ORDER BY updated_at DESC;`,
        [userId, language]
      );
    }
    return await db.getAllAsync<SavedCodeSnippet>(
      `SELECT * FROM saved_code_snippets WHERE user_id = ? ORDER BY updated_at DESC;`,
      [userId]
    );
  }

  async getSnippetById(id: string): Promise<SavedCodeSnippet | null> {
    const db = await this.dbManager.getDatabase();
    const row = await db.getFirstAsync<SavedCodeSnippet>(
      `SELECT * FROM saved_code_snippets WHERE id = ?;`,
      [id]
    );
    return row || null;
  }

  async updateSnippet(id: string, updates: Partial<SavedCodeSnippet>): Promise<void> {
    const db = await this.dbManager.getDatabase();
    const existing = await this.getSnippetById(id);
    if (!existing) return;

    const merged = { ...existing, ...updates, updated_at: new Date().toISOString() };
    await db.runAsync(
      `UPDATE saved_code_snippets SET title = ?, code = ?, language = ?, learning_mode = ?, updated_at = ? WHERE id = ?;`,
      [merged.title, merged.code, merged.language, merged.learning_mode, merged.updated_at, id]
    );
  }

  async deleteSnippet(id: string): Promise<void> {
    const db = await this.dbManager.getDatabase();
    await db.runAsync(`DELETE FROM saved_code_snippets WHERE id = ?;`, [id]);
  }

  // ==========================================
  // DEBUG SESSIONS
  // ==========================================

  async saveDebugSession(session: PersistentDebugSession): Promise<void> {
    const db = await this.dbManager.getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO debug_sessions (
        id, user_id, task_id, topic_id, course_id, language, code, current_step, total_steps, trace_summary, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        session.id,
        session.user_id,
        session.task_id || null,
        session.topic_id || null,
        session.course_id || null,
        session.language,
        session.code,
        session.current_step,
        session.total_steps,
        session.trace_summary || null,
        session.created_at,
        session.updated_at,
      ]
    );
  }

  async getDebugSession(id: string): Promise<PersistentDebugSession | null> {
    const db = await this.dbManager.getDatabase();
    const row = await db.getFirstAsync<PersistentDebugSession>(
      `SELECT * FROM debug_sessions WHERE id = ?;`,
      [id]
    );
    return row || null;
  }

  async getLatestDebugSession(userId: string = 'default_user'): Promise<PersistentDebugSession | null> {
    const db = await this.dbManager.getDatabase();
    const row = await db.getFirstAsync<PersistentDebugSession>(
      `SELECT * FROM debug_sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1;`,
      [userId]
    );
    return row || null;
  }
}

export const codeWorkspaceRepository = CodeWorkspaceRepository.getInstance();
