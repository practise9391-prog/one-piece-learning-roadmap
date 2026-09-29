import { dbManager } from '../database/DatabaseManager';
import { getCurrentTimestamp } from '../utils/dateUtils';
import { generateId } from '../utils/idGenerator';

export interface TopicLearningState {
  id: string;
  topicId: string;
  courseId: string;
  moduleId: string;
  lastSection: string;
  lessonStep: number;
  explanationMode: 'simple' | 'technical';
  lessonRead: boolean;
  visualizationSeen: boolean;
  practiceAttempted: boolean;
  practiceScore: number;
  quizAttempted: boolean;
  quizScore: number;
  quizBestScore: number;
  quizTotalQuestions: number;
  interviewAttempted: boolean;
  interviewAnswered: number;
  finalTestAttempted: boolean;
  finalTestScore: number;
  revisionState: Record<string, boolean> | null;
  memoryCardIndex: number;
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TopicLearningStateRow {
  id: string;
  topic_id: string;
  course_id: string;
  module_id: string;
  last_section: string;
  lesson_step: number;
  explanation_mode: string;
  lesson_read: number;
  visualization_seen: number;
  practice_attempted: number;
  practice_score: number;
  quiz_attempted: number;
  quiz_score: number;
  quiz_best_score: number;
  quiz_total_questions: number;
  interview_attempted: number;
  interview_answered: number;
  final_test_attempted: number;
  final_test_score: number;
  revision_state: string | null;
  memory_card_index: number;
  is_completed: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

function stateFromRow(row: TopicLearningStateRow): TopicLearningState {
  let revisionState: Record<string, boolean> | null = null;
  if (row.revision_state) {
    try {
      revisionState = JSON.parse(row.revision_state);
    } catch {
      revisionState = null;
    }
  }

  return {
    id: row.id,
    topicId: row.topic_id,
    courseId: row.course_id,
    moduleId: row.module_id,
    lastSection: row.last_section || 'introduction',
    lessonStep: row.lesson_step || 0,
    explanationMode: row.explanation_mode === 'technical' ? 'technical' : 'simple',
    lessonRead: row.lesson_read === 1,
    visualizationSeen: row.visualization_seen === 1,
    practiceAttempted: row.practice_attempted === 1,
    practiceScore: row.practice_score || 0,
    quizAttempted: row.quiz_attempted === 1,
    quizScore: row.quiz_score || 0,
    quizBestScore: row.quiz_best_score || 0,
    quizTotalQuestions: row.quiz_total_questions || 0,
    interviewAttempted: row.interview_attempted === 1,
    interviewAnswered: row.interview_answered || 0,
    finalTestAttempted: row.final_test_attempted === 1,
    finalTestScore: row.final_test_score || 0,
    revisionState,
    memoryCardIndex: row.memory_card_index || 0,
    isCompleted: row.is_completed === 1,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class TopicLearningRepository {
  /**
   * Get or create the learning state for a topic.
   */
  async getOrCreate(
    topicId: string,
    courseId: string,
    moduleId: string
  ): Promise<TopicLearningState> {
    const db = await dbManager.getDatabase();
    const existing = await db.getFirstAsync<TopicLearningStateRow>(
      'SELECT * FROM topic_learning_state WHERE topic_id = ?;',
      [topicId]
    );

    if (existing) {
      return stateFromRow(existing);
    }

    // Create a new state record
    const now = getCurrentTimestamp();
    const id = generateId();
    await db.runAsync(
      `INSERT INTO topic_learning_state (
        id, topic_id, course_id, module_id,
        last_section, lesson_step, explanation_mode,
        lesson_read, visualization_seen,
        practice_attempted, practice_score,
        quiz_attempted, quiz_score, quiz_best_score, quiz_total_questions,
        interview_attempted, interview_answered,
        final_test_attempted, final_test_score,
        revision_state, memory_card_index,
        is_completed, completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, 'introduction', 0, 'simple', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NULL, 0, 0, NULL, ?, ?);`,
      [id, topicId, courseId, moduleId, now, now]
    );

    const created = await db.getFirstAsync<TopicLearningStateRow>(
      'SELECT * FROM topic_learning_state WHERE id = ?;',
      [id]
    );

    if (!created) throw new Error('Failed to create topic_learning_state');
    return stateFromRow(created);
  }

  /**
   * Update the last visited section.
   */
  async updateLastSection(topicId: string, section: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET last_section = ?, updated_at = ?
         WHERE topic_id = ?;`,
      [section, getCurrentTimestamp(), topicId]
    );
  }

  /**
   * Update the lesson step position.
   */
  async updateLessonStep(topicId: string, step: number): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET lesson_step = ?, updated_at = ?
         WHERE topic_id = ?;`,
      [step, getCurrentTimestamp(), topicId]
    );
  }

  /**
   * Update the explanation mode preference.
   */
  async updateExplanationMode(topicId: string, mode: 'simple' | 'technical'): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET explanation_mode = ?, updated_at = ?
         WHERE topic_id = ?;`,
      [mode, getCurrentTimestamp(), topicId]
    );
  }

  /**
   * Mark lesson as read.
   */
  async markLessonRead(topicId: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET lesson_read = 1, updated_at = ?
         WHERE topic_id = ?;`,
      [getCurrentTimestamp(), topicId]
    );
  }

  /**
   * Mark visualization as seen.
   */
  async markVisualizationSeen(topicId: string): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET visualization_seen = 1, updated_at = ?
         WHERE topic_id = ?;`,
      [getCurrentTimestamp(), topicId]
    );
  }

  /**
   * Record a quiz attempt/score.
   */
  async recordQuizAttempt(
    topicId: string,
    score: number,
    total: number
  ): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET quiz_attempted = 1,
             quiz_score = ?,
             quiz_total_questions = ?,
             quiz_best_score = MAX(quiz_best_score, ?),
             updated_at = ?
         WHERE topic_id = ?;`,
      [score, total, score, getCurrentTimestamp(), topicId]
    );
  }

  /**
   * Record a practice attempt.
   */
  async recordPracticeAttempt(topicId: string, score: number): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET practice_attempted = 1, practice_score = ?, updated_at = ?
         WHERE topic_id = ?;`,
      [score, getCurrentTimestamp(), topicId]
    );
  }

  /**
   * Record interview question answered.
   */
  async recordInterviewAnswered(topicId: string, answeredCount: number): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET interview_attempted = 1, interview_answered = ?, updated_at = ?
         WHERE topic_id = ?;`,
      [answeredCount, getCurrentTimestamp(), topicId]
    );
  }

  /**
   * Record final test result.
   */
  async recordFinalTest(topicId: string, score: number): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET final_test_attempted = 1, final_test_score = ?, updated_at = ?
         WHERE topic_id = ?;`,
      [score, getCurrentTimestamp(), topicId]
    );
  }

  /**
   * Update memory card position.
   */
  async updateMemoryCardIndex(topicId: string, index: number): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET memory_card_index = ?, updated_at = ?
         WHERE topic_id = ?;`,
      [index, getCurrentTimestamp(), topicId]
    );
  }

  /**
   * Update revision state (known/review map per card).
   */
  async updateRevisionState(
    topicId: string,
    revisionState: Record<string, boolean>
  ): Promise<void> {
    const db = await dbManager.getDatabase();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET revision_state = ?, updated_at = ?
         WHERE topic_id = ?;`,
      [JSON.stringify(revisionState), getCurrentTimestamp(), topicId]
    );
  }

  /**
   * Mark topic learning as complete.
   */
  async markComplete(topicId: string): Promise<void> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    await db.runAsync(
      `UPDATE topic_learning_state
         SET is_completed = 1, completed_at = ?, updated_at = ?
         WHERE topic_id = ?;`,
      [now, now, topicId]
    );
  }

  /**
   * Calculate completion percentage from state.
   */
  calculateProgress(state: TopicLearningState, hasVisualization: boolean, hasQuiz: boolean): number {
    const weights: { key: boolean; weight: number }[] = [
      { key: state.lessonRead, weight: 40 },
      { key: hasVisualization ? state.visualizationSeen : true, weight: hasVisualization ? 15 : 0 },
      { key: state.practiceAttempted, weight: 20 },
      { key: hasQuiz ? state.quizAttempted : true, weight: hasQuiz ? 15 : 0 },
      { key: state.finalTestAttempted, weight: 10 },
    ];

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    if (totalWeight === 0) return state.lessonRead ? 100 : 0;

    const earned = weights.reduce((sum, w) => sum + (w.key ? w.weight : 0), 0);
    return Math.round((earned / totalWeight) * 100);
  }
}

export const topicLearningRepository = new TopicLearningRepository();
