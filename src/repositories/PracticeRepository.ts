import { dbManager } from '../database/DatabaseManager';
import {
  PracticeCategory,
  PracticeCategoryRow,
  practiceCategoryFromRow,
  PracticeQuestion,
  PracticeQuestionRow,
  practiceQuestionFromRow,
} from '../models/Practice';
import { activityRepository } from './ActivityRepository';
import { getCurrentTimestamp } from '../utils/dateUtils';
import { generateId } from '../utils/idGenerator';

export interface PracticeFilterParams {
  categoryId?: string;
  difficulty?: string;
  topic?: string;
  isBookmarked?: boolean;
  searchQuery?: string;
}

export interface PracticeStatistics {
  totalSolved: number;
  totalQuestions: number;
  accuracy: number;
  totalAttempts: number;
  practiceStreak: number;
}

export class PracticeRepository {
  /**
   * Retrieves all practice categories with solved/total metrics.
   */
  async getCategories(): Promise<PracticeCategory[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<PracticeCategoryRow>(`
      SELECT 
        c.*,
        COUNT(q.id) as total_questions,
        SUM(CASE WHEN q.is_completed = 1 THEN 1 ELSE 0 END) as completed_questions
      FROM practice_categories c
      LEFT JOIN practice_questions q ON q.category_id = c.id
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.order_index ASC;
    `);

    return rows.map(practiceCategoryFromRow);
  }

  /**
   * Retrieves a single category by ID.
   */
  async getCategoryById(id: string): Promise<PracticeCategory | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<PracticeCategoryRow>(`
      SELECT 
        c.*,
        COUNT(q.id) as total_questions,
        SUM(CASE WHEN q.is_completed = 1 THEN 1 ELSE 0 END) as completed_questions
      FROM practice_categories c
      LEFT JOIN practice_questions q ON q.category_id = c.id
      WHERE c.id = ?
      GROUP BY c.id;
    `, [id]);

    return row ? practiceCategoryFromRow(row) : null;
  }

  /**
   * Retrieves questions with flexible filters (category, difficulty, topic, bookmarks, search).
   */
  async getQuestions(filters: PracticeFilterParams = {}): Promise<PracticeQuestion[]> {
    const db = await dbManager.getDatabase();

    const conditions: string[] = [];
    const params: any[] = [];

    if (filters.categoryId) {
      conditions.push('category_id = ?');
      params.push(filters.categoryId);
    }

    if (filters.difficulty && filters.difficulty !== 'ALL') {
      conditions.push('difficulty = ?');
      params.push(filters.difficulty);
    }

    if (filters.topic && filters.topic !== 'ALL') {
      conditions.push('topic = ?');
      params.push(filters.topic);
    }

    if (filters.isBookmarked) {
      conditions.push('is_bookmarked = 1');
    }

    if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
      const q = `%${filters.searchQuery.trim()}%`;
      conditions.push('(title LIKE ? OR description LIKE ? OR topic LIKE ? OR category_id LIKE ?)');
      params.push(q, q, q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM practice_questions ${whereClause} ORDER BY order_index ASC;`;

    const rows = await db.getAllAsync<PracticeQuestionRow>(sql, params);
    return rows.map(practiceQuestionFromRow);
  }

  /**
   * Retrieves a single question by ID.
   */
  async getQuestionById(id: string): Promise<PracticeQuestion | null> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<PracticeQuestionRow>(
      'SELECT * FROM practice_questions WHERE id = ?;',
      [id]
    );
    return row ? practiceQuestionFromRow(row) : null;
  }

  /**
   * Retrieves distinct topics within a category.
   */
  async getTopicsForCategory(categoryId: string): Promise<string[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<{ topic: string }>(
      'SELECT DISTINCT topic FROM practice_questions WHERE category_id = ? ORDER BY topic ASC;',
      [categoryId]
    );
    return rows.map((r) => r.topic);
  }

  /**
   * Toggles bookmark state for a question.
   */
  async toggleBookmark(questionId: string): Promise<boolean> {
    const db = await dbManager.getDatabase();
    const question = await this.getQuestionById(questionId);
    if (!question) return false;

    const nextState = !question.is_bookmarked;
    await db.runAsync(
      'UPDATE practice_questions SET is_bookmarked = ? WHERE id = ?;',
      [nextState ? 1 : 0, questionId]
    );
    return nextState;
  }

  /**
   * Saves user code/draft for a question.
   */
  async saveDraft(questionId: string, draft: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      'UPDATE practice_questions SET user_draft = ? WHERE id = ?;',
      [draft, questionId]
    );
  }

  /**
   * Submits an answer, records the attempt, and updates completion state.
   */
  async submitAnswer(
    questionId: string,
    userAnswer: string,
    isCorrect: boolean
  ): Promise<{ isCompleted: boolean; isCorrect: boolean }> {
    const db = await dbManager.getDatabase();
    const question = await this.getQuestionById(questionId);
    if (!question) throw new Error(`Question ${questionId} not found`);

    const now = getCurrentTimestamp();
    const attemptId = generateId('att');

    // 1. Insert attempt
    await db.runAsync(
      `INSERT INTO practice_attempts (
        id, question_id, category_id, user_answer, is_correct, attempted_at
      ) VALUES (?, ?, ?, ?, ?, ?);`,
      [attemptId, questionId, question.category_id, userAnswer, isCorrect ? 1 : 0, now]
    );

    // 2. Mark complete if correct
    if (isCorrect) {
      await db.runAsync(
        'UPDATE practice_questions SET is_completed = 1, completed_at = COALESCE(completed_at, ?) WHERE id = ?;',
        [now, questionId]
      );

      // Record activity to power user streak
      activityRepository.recordActivity({
        courseId: question.category_id,
        topicId: question.id,
        activityType: 'TOPIC_COMPLETED',
      }).catch(() => {});
    }

    return { isCompleted: isCorrect || question.is_completed, isCorrect };
  }

  /**
   * Mark question complete directly (e.g. for Coding questions after review).
   */
  async markQuestionComplete(questionId: string): Promise<void> {
    const db = await dbManager.getDatabase();
    const question = await this.getQuestionById(questionId);
    if (!question) return;

    const now = getCurrentTimestamp();
    await db.runAsync(
      'UPDATE practice_questions SET is_completed = 1, completed_at = COALESCE(completed_at, ?) WHERE id = ?;',
      [now, questionId]
    );

    // Record attempt as correct
    const attemptId = generateId('att');
    await db.runAsync(
      `INSERT INTO practice_attempts (
        id, question_id, category_id, user_answer, is_correct, attempted_at
      ) VALUES (?, ?, ?, ?, 1, ?);`,
      [attemptId, questionId, question.category_id, 'COMPLETED', now]
    );

    // Record activity for streak
    activityRepository.recordActivity({
      courseId: question.category_id,
      topicId: question.id,
      activityType: 'TOPIC_COMPLETED',
    }).catch(() => {});
  }

  /**
   * Calculates overall practice statistics (solved, accuracy, streak).
   */
  async getPracticeStatistics(): Promise<PracticeStatistics> {
    const db = await dbManager.getDatabase();

    const questionsStats = await db.getFirstAsync<{
      total: number;
      solved: number;
    }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as solved
      FROM practice_questions;
    `);

    const attemptsStats = await db.getFirstAsync<{
      total: number;
      correct: number;
    }>(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
      FROM practice_attempts;
    `);

    const streakMetrics = await activityRepository.getStreakMetrics();

    const totalSolved = questionsStats?.solved || 0;
    const totalQuestions = questionsStats?.total || 0;
    const totalAttempts = attemptsStats?.total || 0;
    const correctAttempts = attemptsStats?.correct || 0;
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100;

    return {
      totalSolved,
      totalQuestions,
      accuracy,
      totalAttempts,
      practiceStreak: streakMetrics.currentStreak,
    };
  }

  /**
   * Finds the user's next unfinished or recently attempted question for Continue Practice.
   */
  async getContinuePracticeQuestion(): Promise<{
    question: PracticeQuestion;
    category: PracticeCategory;
    currentIndex: number;
    totalInCategory: number;
  } | null> {
    const db = await dbManager.getDatabase();

    // 1. Try to find the most recently attempted question that is incomplete
    const recentRow = await db.getFirstAsync<PracticeQuestionRow>(`
      SELECT q.* 
      FROM practice_questions q
      JOIN practice_attempts a ON a.question_id = q.id
      WHERE q.is_completed = 0
      ORDER BY a.attempted_at DESC
      LIMIT 1;
    `);

    const targetRow = recentRow || await db.getFirstAsync<PracticeQuestionRow>(`
      SELECT * FROM practice_questions 
      WHERE is_completed = 0 
      ORDER BY category_id ASC, order_index ASC 
      LIMIT 1;
    `);

    if (!targetRow) return null;

    const question = practiceQuestionFromRow(targetRow);
    const category = await this.getCategoryById(question.category_id);
    if (!category) return null;

    // Find index in category
    const catQuestions = await this.getQuestions({ categoryId: question.category_id });
    const idx = catQuestions.findIndex((q) => q.id === question.id);

    return {
      question,
      category,
      currentIndex: idx >= 0 ? idx + 1 : 1,
      totalInCategory: catQuestions.length,
    };
  }

  /**
   * Retrieves recent practice items (completed or attempted).
   */
  async getRecentPractice(limit = 6): Promise<{
    question: PracticeQuestion;
    categoryName: string;
    categoryIcon: string;
    lastActionAt: string;
    isCompleted: boolean;
  }[]> {
    const db = await dbManager.getDatabase();

    const rows = await db.getAllAsync<{
      id: string;
      category_id: string;
      title: string;
      description: string;
      difficulty: string;
      question_type: string;
      content: string;
      solution: string;
      hint: string;
      example_input: string | null;
      example_output: string | null;
      options: string | null;
      correct_answer: string | null;
      topic: string;
      source: string;
      external_url: string | null;
      order_index: number;
      is_completed: number;
      completed_at: string | null;
      is_bookmarked: number;
      user_draft: string | null;
      created_at: string;
      category_name: string;
      category_icon: string;
      last_action_at: string;
    }>(`
      SELECT 
        q.*,
        c.name as category_name,
        c.icon as category_icon,
        COALESCE(q.completed_at, MAX(a.attempted_at), q.created_at) as last_action_at
      FROM practice_questions q
      JOIN practice_categories c ON c.id = q.category_id
      LEFT JOIN practice_attempts a ON a.question_id = q.id
      WHERE q.is_completed = 1 OR a.id IS NOT NULL
      GROUP BY q.id
      ORDER BY last_action_at DESC
      LIMIT ?;
    `, [limit]);

    return rows.map((r) => ({
      question: practiceQuestionFromRow(r),
      categoryName: r.category_name,
      categoryIcon: r.category_icon || 'code-slash',
      lastActionAt: r.last_action_at,
      isCompleted: r.is_completed === 1,
    }));
  }
}

export const practiceRepository = new PracticeRepository();
