/**
 * Part 21 — AI Repository
 * Manages SQLite persistence for AI conversations, messages, speaking sessions,
 * daily speaking topics, usage limits, and personalized study suggestions.
 */

import { dbManager } from '../database/DatabaseManager';
import {
  AIMode,
  AIRole,
  AIMessageType,
  ExplanationLevel,
  CorrectionLevel,
  SpeakingMode,
  AIConversation,
  AIMessage,
  AISpeakingSession,
  SpeakingFeedback,
  DailySpeakingTopic,
  AIStudySuggestion,
  AICodeSnapshot,
  AILearningPreferences,
} from '../models/AIAssistant';
import { getCurrentTimestamp, getTodayDateString } from '../utils/dateUtils';
import { generateId } from '../utils/idGenerator';

export class AIRepository {
  /**
   * Creates a new conversation.
   */
  async createConversation(params: {
    mode: AIMode;
    title: string;
    course_id?: string | null;
    module_id?: string | null;
    topic_id?: string | null;
    explanation_level?: ExplanationLevel;
  }): Promise<AIConversation> {
    const db = await dbManager.getDatabase();
    const id = generateId('conv');
    const now = getCurrentTimestamp();
    const explanationLevel = params.explanation_level || 'BEGINNER';

    await db.runAsync(
      `INSERT INTO ai_conversations (
        id, mode, title, course_id, module_id, topic_id,
        explanation_level, is_archived, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?);`,
      [
        id,
        params.mode,
        params.title,
        params.course_id || null,
        params.module_id || null,
        params.topic_id || null,
        explanationLevel,
        now,
        now,
      ]
    );

    return {
      id,
      mode: params.mode,
      title: params.title,
      course_id: params.course_id || null,
      module_id: params.module_id || null,
      topic_id: params.topic_id || null,
      explanation_level: explanationLevel,
      is_archived: 0,
      created_at: now,
      updated_at: now,
    };
  }

  /**
   * Retrieves a single conversation by ID.
   */
  async getConversationById(id: string): Promise<AIConversation | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM ai_conversations WHERE id = ?;',
      [id]
    );
    if (!row) return null;

    return {
      id: row.id,
      mode: row.mode,
      title: row.title,
      course_id: row.course_id,
      module_id: row.module_id,
      topic_id: row.topic_id,
      explanation_level: row.explanation_level,
      is_archived: row.is_archived,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Lists conversations with optional mode filtering and pagination.
   */
  async getConversations(filter?: {
    mode?: AIMode | 'ALL';
    limit?: number;
    offset?: number;
  }): Promise<AIConversation[]> {
    const db = await dbManager.getDatabase();
    const limit = filter?.limit || 30;
    const offset = filter?.offset || 0;

    let query = 'SELECT * FROM ai_conversations WHERE is_archived = 0';
    const params: any[] = [];

    if (filter?.mode && filter.mode !== 'ALL') {
      query += ' AND mode = ?';
      params.push(filter.mode);
    }

    query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?;';
    params.push(limit, offset);

    const rows = await db.getAllAsync<any>(query, params);
    return rows.map((r) => ({
      id: r.id,
      mode: r.mode,
      title: r.title,
      course_id: r.course_id,
      module_id: r.module_id,
      topic_id: r.topic_id,
      explanation_level: r.explanation_level,
      is_archived: r.is_archived,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  }

  /**
   * Deletes a conversation and its messages.
   */
  async deleteConversation(id: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync('DELETE FROM ai_messages WHERE conversation_id = ?;', [id]);
    await db.runAsync('DELETE FROM ai_speaking_sessions WHERE conversation_id = ?;', [id]);
    await db.runAsync('DELETE FROM ai_conversations WHERE id = ?;', [id]);
  }

  /**
   * Clears all AI conversation history (Privacy control).
   */
  async clearAllConversations(): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync('DELETE FROM ai_messages;');
    await db.runAsync('DELETE FROM ai_speaking_sessions;');
    await db.runAsync('DELETE FROM ai_conversations;');
  }

  /**
   * Adds a message to an active conversation and updates updated_at.
   */
  async addMessage(params: {
    conversation_id: string;
    role: AIRole;
    content: string;
    message_type?: AIMessageType;
    metadata?: any;
  }): Promise<AIMessage> {
    const db = await dbManager.getDatabase();
    const id = generateId('aim');
    const now = getCurrentTimestamp();
    const msgType = params.message_type || 'TEXT';
    const metadataStr = params.metadata ? JSON.stringify(params.metadata) : null;

    await db.runAsync(
      `INSERT INTO ai_messages (
        id, conversation_id, role, content, message_type, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [id, params.conversation_id, params.role, params.content, msgType, metadataStr, now]
    );

    // Update conversation timestamp
    await db.runAsync(
      'UPDATE ai_conversations SET updated_at = ? WHERE id = ?;',
      [now, params.conversation_id]
    );

    return {
      id,
      conversation_id: params.conversation_id,
      role: params.role,
      content: params.content,
      message_type: msgType,
      metadata: params.metadata || null,
      created_at: now,
    };
  }

  /**
   * Retrieves messages for a conversation.
   */
  async getMessages(conversationId: string, limit: number = 60): Promise<AIMessage[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM (
        SELECT * FROM ai_messages
        WHERE conversation_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      ) ORDER BY created_at ASC;`,
      [conversationId, limit]
    );

    return rows.map((r) => {
      let parsedMetadata = null;
      if (r.metadata) {
        try {
          parsedMetadata = JSON.parse(r.metadata);
        } catch {}
      }
      return {
        id: r.id,
        conversation_id: r.conversation_id,
        role: r.role,
        content: r.content,
        message_type: r.message_type,
        metadata: parsedMetadata,
        created_at: r.created_at,
      };
    });
  }

  // =========================================================================
  // SPEAKING SESSIONS
  // =========================================================================

  /**
   * Starts a new speaking session linked to a conversation.
   */
  async startSpeakingSession(params: {
    conversation_id: string;
    mode: SpeakingMode;
    topic_id?: string | null;
    scenario_id?: string | null;
    difficulty?: string;
    correction_level?: CorrectionLevel;
  }): Promise<AISpeakingSession> {
    const db = await dbManager.getDatabase();
    const id = generateId('aiss');
    const now = getCurrentTimestamp();

    await db.runAsync(
      `INSERT INTO ai_speaking_sessions (
        id, conversation_id, mode, topic_id, scenario_id,
        difficulty, correction_level, started_at, duration_seconds,
        message_count, corrections_count, is_completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0);`,
      [
        id,
        params.conversation_id,
        params.mode,
        params.topic_id || null,
        params.scenario_id || null,
        params.difficulty || 'BEGINNER',
        params.correction_level || 'GENTLE',
        now,
      ]
    );

    return {
      id,
      conversation_id: params.conversation_id,
      mode: params.mode,
      topic_id: params.topic_id || null,
      scenario_id: params.scenario_id || null,
      difficulty: params.difficulty || 'BEGINNER',
      correction_level: params.correction_level || 'GENTLE',
      started_at: now,
      duration_seconds: 0,
      message_count: 0,
      corrections_count: 0,
      is_completed: 0,
    };
  }

  /**
   * Finalizes speaking session with duration, metrics, and structured feedback.
   */
  async completeSpeakingSession(params: {
    session_id: string;
    duration_seconds: number;
    message_count: number;
    corrections_count: number;
    feedback?: SpeakingFeedback;
  }): Promise<void> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    const feedbackJson = params.feedback ? JSON.stringify(params.feedback) : null;

    await db.runAsync(
      `UPDATE ai_speaking_sessions SET
        is_completed = 1,
        ended_at = ?,
        duration_seconds = ?,
        message_count = ?,
        corrections_count = ?,
        feedback_json = ?
       WHERE id = ?;`,
      [
        now,
        params.duration_seconds,
        params.message_count,
        params.corrections_count,
        feedbackJson,
        params.session_id,
      ]
    );
  }

  /**
   * Retrieves speaking session by ID.
   */
  async getSpeakingSession(sessionId: string): Promise<AISpeakingSession | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM ai_speaking_sessions WHERE id = ?;',
      [sessionId]
    );
    if (!row) return null;

    let parsedFeedback = null;
    if (row.feedback_json) {
      try {
        parsedFeedback = JSON.parse(row.feedback_json);
      } catch {}
    }

    return {
      id: row.id,
      conversation_id: row.conversation_id,
      mode: row.mode,
      topic_id: row.topic_id,
      scenario_id: row.scenario_id,
      difficulty: row.difficulty,
      correction_level: row.correction_level,
      started_at: row.started_at,
      ended_at: row.ended_at,
      duration_seconds: row.duration_seconds,
      message_count: row.message_count,
      corrections_count: row.corrections_count,
      is_completed: row.is_completed,
      feedback: parsedFeedback,
    };
  }

  /**
   * Retrieves today's speaking topic from seeded daily topics.
   */
  async getDailySpeakingTopic(): Promise<DailySpeakingTopic> {
    const db = await dbManager.getDatabase();
    const dayOfWeek = new Date().getDay(); // 0 = Sun, 1 = Mon, ...

    const row = await db.getFirstAsync<any>(
      'SELECT * FROM ai_daily_speaking_topics WHERE day_of_week = ?;',
      [dayOfWeek]
    );

    if (row) {
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        difficulty: row.difficulty,
        vocabulary: JSON.parse(row.vocabulary || '[]'),
        useful_sentences: JSON.parse(row.useful_sentences || '[]'),
        opening_question: row.opening_question,
        date_str: getTodayDateString(),
      };
    }

    // Fallback default
    return {
      id: 'topic_default',
      title: 'My Daily Routine & Habits',
      description: 'Discuss how your morning begins, study habits, and productivity.',
      difficulty: 'BEGINNER',
      vocabulary: ['routine', 'schedule', 'morning', 'productive'],
      useful_sentences: ['I usually start my day with...', 'In the evening, I enjoy...'],
      opening_question: 'Could you walk me through what your typical day looks like?',
      date_str: getTodayDateString(),
    };
  }

  // =========================================================================
  // USAGE LEDGER & RATE LIMITING
  // =========================================================================

  /**
   * Tracks daily message count to prevent accidental excessive usage.
   */
  async incrementDailyUsage(isSpeaking = false): Promise<{ messageCount: number; speakingCount: number }> {
    const db = await dbManager.getDatabase();
    const today = getTodayDateString();
    const now = getCurrentTimestamp();

    await db.runAsync(
      `INSERT INTO ai_usage_ledger (date_str, message_count, speaking_sessions_count, updated_at)
       VALUES (?, 1, ?, ?)
       ON CONFLICT(date_str) DO UPDATE SET
         message_count = message_count + 1,
         speaking_sessions_count = speaking_sessions_count + excluded.speaking_sessions_count,
         updated_at = excluded.updated_at;`,
      [today, isSpeaking ? 1 : 0, now]
    );

    const row = await db.getFirstAsync<{ message_count: number; speaking_sessions_count: number }>(
      'SELECT message_count, speaking_sessions_count FROM ai_usage_ledger WHERE date_str = ?;',
      [today]
    );

    return {
      messageCount: row?.message_count || 1,
      speakingCount: row?.speaking_sessions_count || 0,
    };
  }

  /**
   * Retrieves today's usage statistics.
   */
  async getTodayUsage(): Promise<{ messageCount: number; speakingCount: number }> {
    const db = await dbManager.getDatabase();
    const today = getTodayDateString();

    const row = await db.getFirstAsync<{ message_count: number; speaking_sessions_count: number }>(
      'SELECT message_count, speaking_sessions_count FROM ai_usage_ledger WHERE date_str = ?;',
      [today]
    );

    return {
      messageCount: row?.message_count || 0,
      speakingCount: row?.speaking_sessions_count || 0,
    };
  }

  // =========================================================================
  // PERSONALIZED STUDY SUGGESTIONS (FROM REAL PERSISTED DATA)
  // =========================================================================

  /**
   * Generates actionable, data-backed study recommendations without fake statistics.
   */
  async getPersonalizedStudySuggestions(): Promise<AIStudySuggestion[]> {
    const db = await dbManager.getDatabase();
    const suggestions: AIStudySuggestion[] = [];

    try {
      // 1. Check current active course and pending topics
      const activeCourse = await db.getFirstAsync<{ id: string; name: string; completed_topics: number; total_topics: number }>(
        `SELECT id, name, completed_topics, total_topics
         FROM courses
         WHERE is_completed = 0
         ORDER BY completed_topics DESC, order_index ASC
         LIMIT 1;`
      );

      // 2. Query next pending topic in sequential order
      if (activeCourse) {
        const nextTopic = await db.getFirstAsync<{ id: string; title: string; module_title: string }>(
          `SELECT t.id, t.title, m.title as module_title
           FROM topics t
           JOIN modules m ON t.module_id = m.id
           WHERE m.course_id = ? AND t.is_completed = 0
           ORDER BY m.order_index ASC, t.order_index ASC
           LIMIT 1;`,
          [activeCourse.id]
        );

        if (nextTopic) {
          suggestions.push({
            id: `sugg_next_${nextTopic.id}`,
            headline: `Continue ${activeCourse.name}: ${nextTopic.title}`,
            reason: `This is the next topic in your "${nextTopic.module_title}" module. You have completed ${activeCourse.completed_topics} of ${activeCourse.total_topics} topics in this course.`,
            suggested_focus: nextTopic.title,
            course_id: activeCourse.id,
            topic_id: nextTopic.id,
            action_label: 'Study Next Topic',
            action_type: 'STUDY_TOPIC',
          });
        }
      }

      // 3. Query practice task with lowest pass rate or unattempted challenge
      const practiceTask = await db.getFirstAsync<{ id: string; title: string; difficulty: string; category_id: string }>(
        `SELECT id, title, difficulty, category_id
         FROM practice_tasks
         WHERE is_completed = 0
         ORDER BY status DESC, order_index ASC
         LIMIT 1;`
      );

      if (practiceTask) {
        suggestions.push({
          id: `sugg_task_${practiceTask.id}`,
          headline: `Practice Challenge: ${practiceTask.title}`,
          reason: `Solidify your understanding by solving a ${practiceTask.difficulty} ${practiceTask.category_id.toUpperCase()} problem.`,
          suggested_focus: practiceTask.title,
          action_label: 'Open Challenge',
          action_type: 'PRACTICE_TASK',
        });
      }

      // 4. English Speaking Recommendation
      const speakingCompleted = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM ai_speaking_sessions WHERE is_completed = 1;'
      );

      suggestions.push({
        id: 'sugg_speaking_daily',
        headline: "Practice English: Fear-Free Speaking",
        reason: speakingCompleted && speakingCompleted.count > 0
          ? `You have completed ${speakingCompleted.count} speaking sessions. 5-10 minutes of daily practice builds fluency and confidence.`
          : 'Start your first conversational session today to practice speaking without fear.',
        suggested_focus: 'Daily Conversation',
        action_label: 'Start Speaking',
        action_type: 'REVISION',
      });
    } catch (err) {
      console.warn('Error generating personalized study suggestions:', err);
    }

    return suggestions;
  }

  // =========================================================================
  // PART 7 — CODE SNAPSHOTS & LEARNING PREFERENCES
  // =========================================================================

  async saveCodeSnapshot(snapshot: Omit<AICodeSnapshot, 'id' | 'created_at'>): Promise<AICodeSnapshot> {
    const db = await dbManager.getDatabase();
    const id = generateId('snap');
    const now = getCurrentTimestamp();

    await db.runAsync(
      `INSERT INTO ai_code_snapshots (
        id, conversation_id, title, code, language, active_line, execution_state_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        snapshot.conversation_id,
        snapshot.title,
        snapshot.code,
        snapshot.language,
        snapshot.active_line || 1,
        snapshot.execution_state_json || null,
        now,
      ]
    );

    return {
      id,
      ...snapshot,
      created_at: now,
    };
  }

  async getCodeSnapshots(conversationId: string): Promise<AICodeSnapshot[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM ai_code_snapshots WHERE conversation_id = ? ORDER BY created_at DESC;',
      [conversationId]
    );

    return rows.map((r) => ({
      id: r.id,
      conversation_id: r.conversation_id,
      title: r.title,
      code: r.code,
      language: r.language,
      active_line: r.active_line,
      execution_state_json: r.execution_state_json,
      created_at: r.created_at,
    }));
  }

  async getLearningPreferences(): Promise<AILearningPreferences> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<any>(
      'SELECT * FROM ai_learning_preferences WHERE id = ?;',
      ['default']
    );

    if (!row) {
      return {
        id: 'default',
        provider: 'AUTOMATIC',
        model: 'AUTOMATIC',
        mode: 'BALANCED',
        explanation_style: 'SIMPLE',
        teaching_style: 'GUIDE_ME',
        save_conversations: true,
        save_voice_transcripts: true,
        save_code_snapshots: true,
        send_code_to_ai: true,
        updated_at: getCurrentTimestamp(),
      };
    }

    return {
      id: row.id,
      provider: row.provider,
      model: row.model,
      mode: row.mode,
      explanation_style: row.explanation_style,
      teaching_style: row.teaching_style,
      save_conversations: Boolean(row.save_conversations),
      save_voice_transcripts: Boolean(row.save_voice_transcripts),
      save_code_snapshots: Boolean(row.save_code_snapshots),
      send_code_to_ai: Boolean(row.send_code_to_ai),
      updated_at: row.updated_at,
    };
  }

  async updateLearningPreferences(updates: Partial<AILearningPreferences>): Promise<void> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    const current = await this.getLearningPreferences();
    const merged = { ...current, ...updates, updated_at: now };

    await db.runAsync(
      `INSERT OR REPLACE INTO ai_learning_preferences (
        id, provider, model, mode, explanation_style, teaching_style,
        save_conversations, save_voice_transcripts, save_code_snapshots, send_code_to_ai, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        'default',
        merged.provider,
        merged.model,
        merged.mode,
        merged.explanation_style,
        merged.teaching_style,
        merged.save_conversations ? 1 : 0,
        merged.save_voice_transcripts ? 1 : 0,
        merged.save_code_snapshots ? 1 : 0,
        merged.send_code_to_ai ? 1 : 0,
        now,
      ]
    );
  }
}

export const aiRepository = new AIRepository();
