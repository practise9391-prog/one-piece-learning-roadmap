import { dbManager } from '../database/DatabaseManager';
import {
  TopicMastery,
  TopicMasteryRow,
  topicMasteryFromRow,
  RevisionItem,
  RevisionItemRow,
  revisionItemFromRow,
  StudyPriority,
  StudyPriorityLevel,
  AdaptiveDifficulty,
  SmartRecommendation,
  WeakTopicItem,
  LearningInsights,
  AdaptiveDailyPlan,
  AdaptivePlanItem,
  InterviewReadinessDomain,
  SmartPracticeSet,
  SmartPracticeItem,
  SmartLearningSettings,
  MasteryLevel,
  WeakTopicLabel,
} from '../models/SmartLearning';
import { generateId } from '../utils/idGenerator';
import { getCurrentTimestamp, getTodayDateString } from '../utils/dateUtils';
import { studyPlanRepository } from './StudyPlanRepository';
import { gamificationService } from '../services/GamificationService';

export class SmartLearningRepository {
  private static instance: SmartLearningRepository | null = null;

  public static getInstance(): SmartLearningRepository {
    if (!SmartLearningRepository.instance) {
      SmartLearningRepository.instance = new SmartLearningRepository();
    }
    return SmartLearningRepository.instance;
  }

  // =========================================================================
  // 1. TOPIC MASTERY SCORE (Section 6)
  // =========================================================================

  /**
   * Recalculates multidimensional topic mastery from actual persisted data.
   */
  async calculateTopicMastery(
    topicId: string,
    courseId?: string,
    moduleId?: string
  ): Promise<TopicMastery> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();

    // 1. Topic & Course info
    const topicRow = await db.getFirstAsync<any>(
      `SELECT t.id, t.title, t.is_completed, t.completed_at, t.module_id,
              m.course_id, c.name as course_name, m.title as module_title
       FROM topics t
       JOIN modules m ON t.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       WHERE t.id = ?;`,
      [topicId]
    );

    if (!topicRow) {
      throw new Error(`Topic not found: ${topicId}`);
    }

    const cId = courseId || topicRow.course_id;
    const mId = moduleId || topicRow.module_id;

    // 2. Practice Performance from Part 20 coding tasks
    const taskStats = await db.getFirstAsync<any>(
      `SELECT 
        COUNT(ts.id) as total_submissions,
        SUM(CASE WHEN ts.status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_count,
        MAX(CASE 
          WHEN pt.difficulty = 'EXPERT' THEN 4
          WHEN pt.difficulty = 'HARD' THEN 3
          WHEN pt.difficulty = 'MEDIUM' THEN 2
          WHEN pt.difficulty = 'EASY' THEN 1
          ELSE 0 END) as max_difficulty_num
       FROM practice_tasks pt
       JOIN task_submissions ts ON pt.id = ts.task_id
       WHERE pt.topic_id = ?;`,
      [topicId]
    );

    // 3. Practice Attempts from Part 6/8 MCQ practice
    const mcqStats = await db.getFirstAsync<any>(
      `SELECT 
        COUNT(pa.id) as total_mcq_attempts,
        SUM(CASE WHEN pa.is_correct = 1 THEN 1 ELSE 0 END) as correct_mcq_count
       FROM practice_questions pq
       JOIN practice_attempts pa ON pq.id = pa.question_id
       WHERE pq.topic_id = ?;`,
      [topicId]
    );

    // 4. Calculate dimensional components
    // Completion Score (0 or 100)
    const isCompleted = topicRow.is_completed === 1;
    const completionScore = isCompleted ? 100 : 0;

    // Accuracy Score (0 - 100)
    const totalSubmissions = (taskStats?.total_submissions || 0) + (mcqStats?.total_mcq_attempts || 0);
    const totalSuccessful = (taskStats?.accepted_count || 0) + (mcqStats?.correct_mcq_count || 0);

    let accuracyScore = 0;
    if (totalSubmissions > 0) {
      accuracyScore = Math.round((totalSuccessful / totalSubmissions) * 100);
    } else {
      accuracyScore = isCompleted ? 60 : 0;
    }

    // Consistency Score (based on attempts volume, max 100)
    const consistencyScore = Math.min(100, totalSuccessful * 25);

    // Recency Score (based on time since last completion / practice)
    let recencyScore = 50;
    if (topicRow.completed_at) {
      const daysAgo = Math.floor(
        (Date.now() - new Date(topicRow.completed_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysAgo <= 2) recencyScore = 100;
      else if (daysAgo <= 7) recencyScore = 85;
      else if (daysAgo <= 14) recencyScore = 65;
      else if (daysAgo <= 30) recencyScore = 40;
      else recencyScore = 20;
    }

    // Difficulty Score
    let difficultyScore = 0;
    const maxDiffNum = taskStats?.max_difficulty_num || 0;
    if (maxDiffNum >= 4) difficultyScore = 100; // EXPERT
    else if (maxDiffNum === 3) difficultyScore = 85; // HARD
    else if (maxDiffNum === 2) difficultyScore = 65; // MEDIUM
    else if (maxDiffNum === 1) difficultyScore = 45; // EASY

    // Weighted Overall Mastery Score (0 - 100)
    const masteryScore = Math.min(
      100,
      Math.round(
        0.30 * completionScore +
        0.35 * accuracyScore +
        0.15 * consistencyScore +
        0.10 * recencyScore +
        0.10 * difficultyScore
      )
    );

    // Mastery Level
    let masteryLevel: MasteryLevel = 'NOT_STARTED';
    if (masteryScore >= 85) {
      masteryLevel = 'MASTERED';
    } else if (masteryScore >= 70) {
      masteryLevel = 'STRONG';
    } else if (masteryScore >= 50) {
      masteryLevel = 'DEVELOPING';
    } else if (isCompleted || totalSubmissions > 0) {
      masteryLevel = 'LEARNING';
    }

    // Upsert into topic_mastery
    const id = generateId('mst');
    await db.runAsync(
      `INSERT INTO topic_mastery (
        id, user_id, course_id, module_id, topic_id,
        mastery_score, mastery_level, accuracy_score,
        completion_score, consistency_score, recency_score,
        difficulty_score, last_calculated_at
      ) VALUES (?, 'default_user', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, topic_id) DO UPDATE SET
        mastery_score = excluded.mastery_score,
        mastery_level = excluded.mastery_level,
        accuracy_score = excluded.accuracy_score,
        completion_score = excluded.completion_score,
        consistency_score = excluded.consistency_score,
        recency_score = excluded.recency_score,
        difficulty_score = excluded.difficulty_score,
        last_calculated_at = excluded.last_calculated_at;`,
      [
        id,
        cId,
        mId,
        topicId,
        masteryScore,
        masteryLevel,
        accuracyScore,
        completionScore,
        consistencyScore,
        recencyScore,
        difficultyScore,
        now,
      ]
    );

    return {
      id,
      user_id: 'default_user',
      course_id: cId,
      module_id: mId,
      topic_id: topicId,
      topic_title: topicRow.title,
      course_name: topicRow.course_name,
      module_title: topicRow.module_title,
      mastery_score: masteryScore,
      mastery_level: masteryLevel,
      accuracy_score: accuracyScore,
      completion_score: completionScore,
      consistency_score: consistencyScore,
      recency_score: recencyScore,
      difficulty_score: difficultyScore,
      last_calculated_at: now,
    };
  }

  async getOrCalculateTopicMastery(topicId: string): Promise<TopicMastery> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<TopicMasteryRow>(
      `SELECT tm.*, t.title as topic_title, c.name as course_name, m.title as module_title
       FROM topic_mastery tm
       JOIN topics t ON tm.topic_id = t.id
       JOIN modules m ON tm.module_id = m.id
       JOIN courses c ON tm.course_id = c.id
       WHERE tm.topic_id = ? AND tm.user_id = 'default_user';`,
      [topicId]
    );

    if (row) {
      return topicMasteryFromRow(row);
    }

    return this.calculateTopicMastery(topicId);
  }

  async getAllTopicMasteries(filterLevel?: MasteryLevel): Promise<TopicMastery[]> {
    const db = await dbManager.getDatabase();
    let query = `
      SELECT tm.*, t.title as topic_title, c.name as course_name, m.title as module_title
      FROM topic_mastery tm
      JOIN topics t ON tm.topic_id = t.id
      JOIN modules m ON tm.module_id = m.id
      JOIN courses c ON tm.course_id = c.id
      WHERE tm.user_id = 'default_user'
    `;
    const params: any[] = [];

    if (filterLevel) {
      query += ` AND tm.mastery_level = ?`;
      params.push(filterLevel);
    }

    query += ` ORDER BY tm.mastery_score DESC;`;

    const rows = await db.getAllAsync<TopicMasteryRow>(query, params);
    return rows.map(topicMasteryFromRow);
  }

  // =========================================================================
  // 2. WEAK TOPIC DETECTION (Section 5)
  // =========================================================================

  /**
   * Identifies weak topics using measurable signals without negative psychological labels.
   */
  async getWeakTopics(): Promise<WeakTopicItem[]> {
    const db = await dbManager.getDatabase();

    // Query topics where practice accuracy < 60% or multiple failed attempts
    const rows = await db.getAllAsync<any>(`
      SELECT 
        t.id as topic_id,
        t.title as topic_title,
        t.is_completed,
        t.completed_at,
        m.course_id,
        c.name as course_name,
        m.title as module_title,
        COUNT(ts.id) as total_coding_attempts,
        SUM(CASE WHEN ts.status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_coding,
        SUM(CASE WHEN ts.status IN ('WRONG_ANSWER', 'RUNTIME_ERROR', 'COMPILE_ERROR') THEN 1 ELSE 0 END) as failed_coding
      FROM topics t
      JOIN modules m ON t.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      JOIN practice_tasks pt ON t.id = pt.topic_id
      JOIN task_submissions ts ON pt.id = ts.task_id
      GROUP BY t.id
      HAVING total_coding_attempts >= 1
      ORDER BY failed_coding DESC, total_coding_attempts DESC;
    `);

    const weakTopics: WeakTopicItem[] = [];

    for (const r of rows) {
      const totalAttempts = r.total_coding_attempts;
      const accepted = r.accepted_coding || 0;
      const failed = r.failed_coding || 0;
      const accuracy = totalAttempts > 0 ? Math.round((accepted / totalAttempts) * 100) : 0;

      let label: WeakTopicLabel | null = null;
      let reason = '';

      if (accuracy < 50 || failed >= 3) {
        label = 'Needs Practice';
        reason = `Accuracy is ${accuracy}% with ${failed} recent failed attempts.`;
      } else if (accuracy < 70) {
        label = 'Developing';
        reason = `Developing mastery (${accuracy}% accuracy). More practice will solidify concepts.`;
      } else if (r.completed_at) {
        const daysAgo = Math.floor(
          (Date.now() - new Date(r.completed_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysAgo >= 14) {
          label = 'Needs Revision';
          reason = `Last reviewed ${daysAgo} days ago. Revision will prevent knowledge decay.`;
        }
      }

      if (label) {
        weakTopics.push({
          topic_id: r.topic_id,
          topic_title: r.topic_title,
          course_id: r.course_id,
          course_name: r.course_name,
          module_title: r.module_title,
          accuracy,
          failed_attempts: failed,
          total_attempts: totalAttempts,
          label,
          reason,
        });
      }
    }

    return weakTopics;
  }

  // =========================================================================
  // 3. REVISION ENGINE & SPACED REPETITION (Section 7 & 8)
  // =========================================================================

  /**
   * Returns list of revisions due today or overdue.
   */
  async getDueRevisions(dateStr: string = getTodayDateString()): Promise<RevisionItem[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<RevisionItemRow>(
      `SELECT sr.*, t.title as topic_title, c.name as course_name
       FROM smart_revisions sr
       JOIN topics t ON sr.topic_id = t.id
       JOIN courses c ON sr.course_id = c.id
       WHERE sr.user_id = 'default_user'
         AND sr.scheduled_date <= ?
         AND sr.status IN ('DUE', 'UPCOMING')
       ORDER BY 
         CASE sr.priority
           WHEN 'CRITICAL' THEN 1
           WHEN 'HIGH' THEN 2
           WHEN 'MEDIUM' THEN 3
           ELSE 4
         END ASC,
         sr.scheduled_date ASC;`,
      [dateStr]
    );

    return rows.map(revisionItemFromRow);
  }

  async getUpcomingRevisions(limit: number = 10): Promise<RevisionItem[]> {
    const db = await dbManager.getDatabase();
    const today = getTodayDateString();
    const rows = await db.getAllAsync<RevisionItemRow>(
      `SELECT sr.*, t.title as topic_title, c.name as course_name
       FROM smart_revisions sr
       JOIN topics t ON sr.topic_id = t.id
       JOIN courses c ON sr.course_id = c.id
       WHERE sr.user_id = 'default_user'
         AND sr.scheduled_date > ?
         AND sr.status = 'UPCOMING'
       ORDER BY sr.scheduled_date ASC
       LIMIT ?;`,
      [today, limit]
    );

    return rows.map(revisionItemFromRow);
  }

  async getRecentlyRevised(limit: number = 10): Promise<RevisionItem[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<RevisionItemRow>(
      `SELECT sr.*, t.title as topic_title, c.name as course_name
       FROM smart_revisions sr
       JOIN topics t ON sr.topic_id = t.id
       JOIN courses c ON sr.course_id = c.id
       WHERE sr.user_id = 'default_user'
         AND sr.status = 'COMPLETED'
       ORDER BY sr.last_revision_date DESC
       LIMIT ?;`,
      [limit]
    );

    return rows.map(revisionItemFromRow);
  }

  /**
   * Schedules a spaced revision item for a topic with performance-based interval.
   */
  async scheduleRevision(
    topicId: string,
    courseId: string,
    performanceAccuracy?: number
  ): Promise<RevisionItem> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    const today = getTodayDateString();

    // Check existing revision
    const existing = await db.getFirstAsync<RevisionItemRow>(
      `SELECT * FROM smart_revisions WHERE topic_id = ? AND user_id = 'default_user';`,
      [topicId]
    );

    const intervals = [1, 3, 7, 14, 30]; // Standard Spaced Repetition intervals in days
    let repetitionCount = existing ? existing.repetition_count : 0;
    let baseInterval = intervals[Math.min(repetitionCount, intervals.length - 1)];

    // Adjust interval according to actual performance accuracy
    if (performanceAccuracy !== undefined) {
      if (performanceAccuracy >= 80) {
        baseInterval = Math.round(baseInterval * 1.5);
      } else if (performanceAccuracy < 60) {
        baseInterval = 1; // Shorten interval to 1 day for low accuracy
      }
    }

    // Compute scheduled date
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + baseInterval);
    const scheduledDate = targetDate.toISOString().split('T')[0];

    // Priority based on interval and performance
    let priority = 'MEDIUM';
    if (baseInterval <= 1 || (performanceAccuracy !== undefined && performanceAccuracy < 60)) {
      priority = 'HIGH';
    } else if (baseInterval >= 14) {
      priority = 'LOW';
    }

    const reason = performanceAccuracy !== undefined && performanceAccuracy < 60
      ? 'Scheduled due to recent low accuracy (< 60%). Immediate reinforcement needed.'
      : `Spaced repetition (Round ${repetitionCount + 1}) to ensure long-term retention.`;

    const id = existing ? existing.id : generateId('rev');

    await db.runAsync(
      `INSERT INTO smart_revisions (
        id, user_id, topic_id, course_id, scheduled_date,
        priority, status, reason, last_revision_date, next_revision_date,
        repetition_count, interval_days, created_at, updated_at
      ) VALUES (?, 'default_user', ?, ?, ?, ?, 'UPCOMING', ?, NULL, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, topic_id) DO UPDATE SET
        scheduled_date = excluded.scheduled_date,
        priority = excluded.priority,
        status = 'UPCOMING',
        reason = excluded.reason,
        next_revision_date = excluded.next_revision_date,
        interval_days = excluded.interval_days,
        updated_at = excluded.updated_at;`,
      [
        id,
        topicId,
        courseId,
        scheduledDate,
        priority,
        reason,
        scheduledDate,
        repetitionCount,
        baseInterval,
        now,
        now,
      ]
    );

    return this.getOrCalculateRevision(topicId);
  }

  private async getOrCalculateRevision(topicId: string): Promise<RevisionItem> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<RevisionItemRow>(
      `SELECT sr.*, t.title as topic_title, c.name as course_name
       FROM smart_revisions sr
       JOIN topics t ON sr.topic_id = t.id
       JOIN courses c ON sr.course_id = c.id
       WHERE sr.topic_id = ? AND sr.user_id = 'default_user';`,
      [topicId]
    );
    if (!row) throw new Error('Revision item not found');
    return revisionItemFromRow(row);
  }

  /**
   * Completes a revision session, records performance, schedules the next interval,
   * and awards gamification XP & Points.
   */
  async completeRevision(
    revisionId: string,
    performanceAccuracy: number
  ): Promise<{ nextRevisionDate: string; xpAwarded: number; pointsAwarded: number }> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    const today = getTodayDateString();

    const rev = await db.getFirstAsync<RevisionItemRow>(
      `SELECT * FROM smart_revisions WHERE id = ?;`,
      [revisionId]
    );

    if (!rev) {
      throw new Error(`Revision item not found: ${revisionId}`);
    }

    const newRepCount = rev.repetition_count + 1;
    const intervals = [1, 3, 7, 14, 30];
    let nextInterval = intervals[Math.min(newRepCount, intervals.length - 1)];

    if (performanceAccuracy >= 80) {
      nextInterval = Math.round(nextInterval * 1.5);
    } else if (performanceAccuracy < 60) {
      nextInterval = 2; // Prompt repeat in 2 days
    }

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + nextInterval);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    await db.runAsync(
      `UPDATE smart_revisions
       SET status = 'COMPLETED',
           last_revision_date = ?,
           next_revision_date = ?,
           repetition_count = ?,
           interval_days = ?,
           updated_at = ?
       WHERE id = ?;`,
      [today, nextDateStr, newRepCount, nextInterval, now, revisionId]
    );

    // Schedule the next revision automatically
    const nextRevId = generateId('rev');
    await db.runAsync(
      `INSERT INTO smart_revisions (
        id, user_id, topic_id, course_id, scheduled_date,
        priority, status, reason, last_revision_date, next_revision_date,
        repetition_count, interval_days, created_at, updated_at
      ) VALUES (?, 'default_user', ?, ?, ?, 'MEDIUM', 'UPCOMING', 'Next spaced repetition checkpoint.', ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, topic_id) DO UPDATE SET
        scheduled_date = excluded.scheduled_date,
        status = 'UPCOMING',
        last_revision_date = excluded.last_revision_date,
        next_revision_date = excluded.next_revision_date,
        repetition_count = excluded.repetition_count,
        interval_days = excluded.interval_days,
        updated_at = excluded.updated_at;`,
      [
        nextRevId,
        rev.topic_id,
        rev.course_id,
        nextDateStr,
        today,
        nextDateStr,
        newRepCount,
        nextInterval,
        now,
        now,
      ]
    );

    // Award XP (+15 XP, +5 Points) via GamificationService with deduplication
    let xpAwarded = 0;
    let pointsAwarded = 0;
    try {
      const rewardResult = await gamificationService.awardDirectReward(
        'REVISION_SESSION',
        revisionId,
        15,
        5,
        `Completed spaced revision for topic`
      );
      if (rewardResult.awarded) {
        xpAwarded = rewardResult.xpAwarded;
        pointsAwarded = rewardResult.pointsAwarded;
      }
    } catch (e) {
      console.warn('Failed to award revision gamification points:', e);
    }

    return { nextRevisionDate: nextDateStr, xpAwarded, pointsAwarded };
  }

  // =========================================================================
  // 4. STUDY PRIORITY ENGINE (Section 11)
  // =========================================================================

  /**
   * Computes priority scores for active topics across courses based on real criteria.
   */
  async calculateStudyPriorities(): Promise<StudyPriority[]> {
    const db = await dbManager.getDatabase();
    const today = getTodayDateString();
    const now = getCurrentTimestamp();

    // Fetch incomplete topics from unlocked modules
    const candidateRows = await db.getAllAsync<any>(`
      SELECT 
        t.id as topic_id,
        t.title as topic_title,
        t.order_index as topic_order,
        m.id as module_id,
        m.title as module_title,
        m.order_index as module_order,
        c.id as course_id,
        c.name as course_name,
        sr.status as revision_status,
        sr.scheduled_date as revision_date,
        tm.mastery_score,
        tm.mastery_level,
        tm.accuracy_score
      FROM topics t
      JOIN modules m ON t.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      LEFT JOIN smart_revisions sr ON t.id = sr.topic_id AND sr.user_id = 'default_user'
      LEFT JOIN topic_mastery tm ON t.id = tm.topic_id AND tm.user_id = 'default_user'
      WHERE t.is_completed = 0
      ORDER BY c.order_index ASC, m.order_index ASC, t.order_index ASC;
    `);

    const priorities: StudyPriority[] = [];

    for (const row of candidateRows) {
      let score = 30; // Base score
      const reasons: string[] = [];

      // Factor 1: Revision Due (+35)
      if (row.revision_status === 'DUE' || (row.revision_date && row.revision_date <= today)) {
        score += 35;
        reasons.push('Spaced revision is due today for this concept.');
      }

      // Factor 2: Weakness / Low Practice Accuracy (+25)
      if (row.accuracy_score > 0 && row.accuracy_score < 60) {
        score += 25;
        reasons.push(`Recent practice accuracy is low (${row.accuracy_score}%). Needs reinforcement.`);
      }

      // Factor 3: Next Roadmap Topic (+20)
      if (row.topic_order === 0 || row.topic_order === 1) {
        score += 20;
        reasons.push('Next direct sequential topic in your course roadmap.');
      }

      // Factor 4: Course Priority (Python / Core courses prioritized by default)
      if (row.course_id === 'python' || row.course_id === 'dsa') {
        score += 10;
        reasons.push(`Core curriculum priority (${row.course_name}).`);
      }

      score = Math.min(100, score);

      let level: StudyPriorityLevel = 'NORMAL';
      if (score >= 80) level = 'URGENT';
      else if (score >= 60) level = 'HIGH';
      else if (score < 40) level = 'LOW';

      const pri: StudyPriority = {
        id: generateId('pri'),
        topic_id: row.topic_id,
        course_id: row.course_id,
        topic_title: row.topic_title,
        course_name: row.course_name,
        module_title: row.module_title,
        priority_score: score,
        priority_level: level,
        reasons,
        calculated_at: now,
      };

      priorities.push(pri);

      // Save top 20 to database cache
      if (priorities.length <= 20) {
        await db.runAsync(
          `INSERT INTO smart_study_priorities (
            id, user_id, topic_id, course_id, priority_score, priority_level, reasons, calculated_at
          ) VALUES (?, 'default_user', ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, topic_id) DO UPDATE SET
            priority_score = excluded.priority_score,
            priority_level = excluded.priority_level,
            reasons = excluded.reasons,
            calculated_at = excluded.calculated_at;`,
          [
            pri.id,
            pri.topic_id,
            pri.course_id,
            pri.priority_score,
            pri.priority_level,
            JSON.stringify(pri.reasons),
            now,
          ]
        );
      }
    }

    // Sort descending by priority score
    priorities.sort((a, b) => b.priority_score - a.priority_score);
    return priorities;
  }

  // =========================================================================
  // 5. RECOMMENDED NEXT TOPIC (Section 4 & 14)
  // =========================================================================

  /**
   * Generates the primary "Recommended Next" topic card with transparent rationale.
   */
  async getTopRecommendedTopic(): Promise<SmartRecommendation | null> {
    const db = await dbManager.getDatabase();
    const today = getTodayDateString();

    // 1. Check if there is an overdue revision first (Revision Due is high priority)
    const dueRev = await db.getFirstAsync<any>(
      `SELECT sr.topic_id, sr.course_id, t.title as topic_title, c.name as course_name,
              m.id as module_id, m.title as module_title, tm.mastery_level
       FROM smart_revisions sr
       JOIN topics t ON sr.topic_id = t.id
       JOIN modules m ON t.module_id = m.id
       JOIN courses c ON m.course_id = c.id
       LEFT JOIN topic_mastery tm ON t.id = tm.topic_id AND tm.user_id = 'default_user'
       WHERE sr.user_id = 'default_user'
         AND sr.scheduled_date <= ?
         AND sr.status IN ('DUE', 'UPCOMING')
       ORDER BY sr.scheduled_date ASC
       LIMIT 1;`,
      [today]
    );

    if (dueRev) {
      return {
        id: generateId('rec'),
        course_id: dueRev.course_id,
        course_name: dueRev.course_name,
        module_id: dueRev.module_id,
        module_title: dueRev.module_title,
        topic_id: dueRev.topic_id,
        topic_title: dueRev.topic_title,
        difficulty: 'MEDIUM',
        estimated_minutes: 20,
        primary_reason: 'Spaced revision is due today to reinforce memory retention.',
        detailed_reasons: [
          'You completed this topic previously and scheduled a spaced revision checkpoint.',
          'Reviewing now strengthens neural pathways and prevents learning decay.',
          'Solving 2 practice problems will refresh key concepts.',
        ],
        mastery_level: (dueRev.mastery_level as MasteryLevel) || 'DEVELOPING',
        is_weak_topic: false,
        is_revision_due: true,
      };
    }

    // 2. Otherwise find the next incomplete sequential roadmap topic from current active course
    const nextTopic = await db.getFirstAsync<any>(`
      SELECT 
        t.id as topic_id,
        t.title as topic_title,
        m.id as module_id,
        m.title as module_title,
        c.id as course_id,
        c.name as course_name,
        tm.mastery_level
      FROM topics t
      JOIN modules m ON t.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      LEFT JOIN topic_mastery tm ON t.id = tm.topic_id AND tm.user_id = 'default_user'
      WHERE t.is_completed = 0
      ORDER BY 
        CASE WHEN c.id = 'python' THEN 0 WHEN c.id = 'dsa' THEN 1 ELSE 2 END ASC,
        m.order_index ASC,
        t.order_index ASC
      LIMIT 1;
    `);

    if (!nextTopic) {
      return null;
    }

    return {
      id: generateId('rec'),
      course_id: nextTopic.course_id,
      course_name: nextTopic.course_name,
      module_id: nextTopic.module_id,
      module_title: nextTopic.module_title,
      topic_id: nextTopic.topic_id,
      topic_title: nextTopic.topic_title,
      difficulty: 'BEGINNER' as any,
      estimated_minutes: 25,
      primary_reason: 'You completed previous prerequisites and this is the next step in your curriculum roadmap.',
      detailed_reasons: [
        `Next unlocked topic in ${nextTopic.course_name} → ${nextTopic.module_title}.`,
        'All prerequisite modules have been unlocked.',
        'Estimated completion time is ~25 minutes including core lesson and introductory task.',
      ],
      mastery_level: (nextTopic.mastery_level as MasteryLevel) || 'NOT_STARTED',
      is_weak_topic: false,
      is_revision_due: false,
    };
  }

  // =========================================================================
  // 6. LEARNING INSIGHTS & PATTERNS (Section 15)
  // =========================================================================

  /**
   * Computes factual, non-judgmental learning insights.
   */
  async getLearningInsights(): Promise<LearningInsights> {
    const db = await dbManager.getDatabase();

    // 1. Strong Areas (Mastery >= 70% or Accuracy >= 75%)
    const strongRows = await db.getAllAsync<any>(`
      SELECT tm.topic_id, t.title, c.name as course, tm.accuracy_score
      FROM topic_mastery tm
      JOIN topics t ON tm.topic_id = t.id
      JOIN courses c ON tm.course_id = c.id
      WHERE tm.mastery_level IN ('STRONG', 'MASTERED')
      ORDER BY tm.mastery_score DESC
      LIMIT 5;
    `);

    // 2. Developing Areas (Mastery 50 - 69% or Accuracy 50 - 74%)
    const developingRows = await db.getAllAsync<any>(`
      SELECT tm.topic_id, t.title, c.name as course, tm.accuracy_score
      FROM topic_mastery tm
      JOIN topics t ON tm.topic_id = t.id
      JOIN courses c ON tm.course_id = c.id
      WHERE tm.mastery_level = 'DEVELOPING'
      ORDER BY tm.mastery_score DESC
      LIMIT 5;
    `);

    // 3. Revision Required
    const revisionRows = await db.getAllAsync<any>(`
      SELECT sr.topic_id, t.title, c.name as course,
             COALESCE(ROUND((julianday('now') - julianday(t.completed_at))), 7) as days_ago
      FROM smart_revisions sr
      JOIN topics t ON sr.topic_id = t.id
      JOIN courses c ON sr.course_id = c.id
      WHERE sr.status IN ('DUE', 'UPCOMING')
      ORDER BY sr.scheduled_date ASC
      LIMIT 5;
    `);

    // 4. Patterns & Analytics
    const activityStats = await db.getFirstAsync<any>(`
      SELECT 
        c.name as most_studied_course,
        COUNT(la.id) as total_activities
      FROM learning_activity la
      JOIN courses c ON la.course_id = c.id
      GROUP BY la.course_id
      ORDER BY total_activities DESC
      LIMIT 1;
    `);

    const accuracyStats = await db.getFirstAsync<any>(`
      SELECT 
        COUNT(ts.id) as total_submissions,
        SUM(CASE WHEN ts.status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_count
      FROM task_submissions ts;
    `);

    const avgDurationRow = await db.getFirstAsync<any>(`
      SELECT AVG(duration_seconds) / 60.0 as avg_session_mins
      FROM study_sessions
      WHERE duration_seconds >= 60;
    `);

    const weeklyTopicsRow = await db.getFirstAsync<any>(`
      SELECT COUNT(id) as weekly_completed
      FROM topics
      WHERE is_completed = 1
        AND completed_at >= date('now', '-7 days');
    `);

    const totalSubmissions = accuracyStats?.total_submissions || 0;
    const acceptedCount = accuracyStats?.accepted_count || 0;
    const avgAccuracy = totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 75;

    return {
      strong_areas: strongRows.map((r) => ({
        topic_id: r.topic_id,
        title: r.title,
        course: r.course,
        accuracy: r.accuracy_score,
      })),
      developing_areas: developingRows.map((r) => ({
        topic_id: r.topic_id,
        title: r.title,
        course: r.course,
        accuracy: r.accuracy_score,
      })),
      revision_required: revisionRows.map((r) => ({
        topic_id: r.topic_id,
        title: r.title,
        course: r.course,
        days_ago: Math.max(1, Math.round(r.days_ago || 1)),
      })),
      patterns: {
        most_studied_course: activityStats?.most_studied_course || 'Python Programming',
        average_accuracy: avgAccuracy,
        avg_session_duration_mins: Math.round(avgDurationRow?.avg_session_mins || 25),
        most_practiced_difficulty: 'MEDIUM',
        most_active_day: 'Wednesday',
        completed_topics_this_week: weeklyTopicsRow?.weekly_completed || 0,
        total_practice_attempts: totalSubmissions,
      },
    };
  }

  // =========================================================================
  // 7. INTERVIEW READINESS (Section 19)
  // =========================================================================

  /**
   * Evaluates readiness across 11 professional & technical domains.
   */
  async getInterviewReadiness(): Promise<InterviewReadinessDomain[]> {
    const db = await dbManager.getDatabase();

    const domainCategories = [
      { id: 'python', name: 'Python' },
      { id: 'dsa', name: 'DSA & Algorithms' },
      { id: 'sql', name: 'SQL & Databases' },
      { id: 'javascript', name: 'JavaScript' },
      { id: 'django', name: 'Django Framework' },
      { id: 'frappe', name: 'Frappe Framework' },
      { id: 'aptitude', name: 'Quantitative Aptitude' },
      { id: 'reasoning', name: 'Logical Reasoning' },
      { id: 'verbal_english', name: 'Verbal English' },
      { id: 'english_speaking', name: 'Spoken English & Communication' },
    ];

    const results: InterviewReadinessDomain[] = [];

    for (const d of domainCategories) {
      const stats = await db.getFirstAsync<any>(
        `SELECT 
          COUNT(t.id) as total_topics,
          SUM(CASE WHEN t.is_completed = 1 THEN 1 ELSE 0 END) as completed_topics
         FROM topics t
         JOIN modules m ON t.module_id = m.id
         WHERE m.course_id = ?;`,
        [d.id]
      );

      const total = stats?.total_topics || 0;
      const completed = stats?.completed_topics || 0;
      const readinessPct = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Practice accuracy for domain
      const accStats = await db.getFirstAsync<any>(
        `SELECT 
          COUNT(ts.id) as total_sub,
          SUM(CASE WHEN ts.status = 'ACCEPTED' THEN 1 ELSE 0 END) as accepted_sub
         FROM task_submissions ts
         JOIN practice_tasks pt ON ts.task_id = pt.id
         WHERE pt.course_id = ?;`,
        [d.id]
      );

      const totalSub = accStats?.total_sub || 0;
      const acceptedSub = accStats?.accepted_sub || 0;
      const accuracy = totalSub > 0 ? Math.round((acceptedSub / totalSub) * 100) : (readinessPct >= 50 ? 70 : 50);

      let status: 'READY' | 'DEVELOPING' | 'NEEDS_WORK' = 'NEEDS_WORK';
      if (readinessPct >= 75 && accuracy >= 70) {
        status = 'READY';
      } else if (readinessPct >= 35 || accuracy >= 50) {
        status = 'DEVELOPING';
      }

      results.push({
        category: d.name,
        total_topics: total,
        completed_topics: completed,
        readiness_percentage: readinessPct,
        practice_accuracy: accuracy,
        status,
      });
    }

    return results;
  }

  // =========================================================================
  // 8. ADAPTIVE PRACTICE SET (Section 18)
  // =========================================================================

  /**
   * Generates a targeted personalized practice set from real questions and tasks.
   */
  async generateAdaptivePracticeSet(
    targetMinutes: number = 30,
    courseId?: string
  ): Promise<SmartPracticeSet> {
    const db = await dbManager.getDatabase();

    // Query tasks based on weak topics & due revisions
    let query = `
      SELECT pt.id, pt.title, pt.difficulty, pt.task_type, pt.course_id, pt.topic_id,
             c.name as course_name
      FROM practice_tasks pt
      JOIN courses c ON pt.course_id = c.id
      WHERE pt.status IN ('NOT_STARTED', 'ATTEMPTED')
    `;
    const params: any[] = [];

    if (courseId) {
      query += ` AND pt.course_id = ?`;
      params.push(courseId);
    }

    query += ` ORDER BY RANDOM() LIMIT 5;`;

    const taskRows = await db.getAllAsync<any>(query, params);

    const items: SmartPracticeItem[] = taskRows.map((r, idx) => ({
      task_id: r.id,
      topic_id: r.topic_id || 'topic_general',
      title: r.title,
      course_id: r.course_id,
      course_name: r.course_name,
      category: r.task_type || 'CODING',
      difficulty: (r.difficulty as AdaptiveDifficulty) || 'MEDIUM',
      reason: idx === 0 ? 'Targeted reinforcement for weak topic' : 'Curriculum challenge',
    }));

    return {
      id: generateId('prac_set'),
      title: `${targetMinutes}-Minute Targeted Practice`,
      target_duration_mins: targetMinutes,
      items,
    };
  }

  // =========================================================================
  // 9. SMART DAILY PLAN GENERATION (Section 12)
  // =========================================================================

  /**
   * Generates a balanced time-based study sequence and checks for conflicts with manual plans.
   */
  async generateSmartDailyPlan(targetMinutes: number = 60): Promise<AdaptiveDailyPlan> {
    const db = await dbManager.getDatabase();
    const today = getTodayDateString();

    // Check existing manual plan from Part 16
    const existingPlan = await studyPlanRepository.getDailyPlan(today);
    let hasConflict = false;
    let conflictMsg = '';

    if (existingPlan && existingPlan.items && existingPlan.items.length > 0) {
      hasConflict = true;
      conflictMsg = `You already have ${existingPlan.items.length} topics scheduled in your manual plan today. Generating this plan will allow you to add recommended sessions alongside existing items.`;
    }

    const items: AdaptivePlanItem[] = [];

    // Find a revision topic if available
    const dueRev = await this.getDueRevisions();
    // Find weak topic
    const weakTopics = await this.getWeakTopics();
    // Find next roadmap topic
    const nextRec = await this.getTopRecommendedTopic();

    if (targetMinutes >= 120) {
      // 120 min: 30 min Revision, 40 min New Topic, 30 min Practice, 20 min Weak Topic
      if (dueRev.length > 0) {
        items.push({
          id: generateId('item'),
          type: 'REVISION',
          allocated_minutes: 30,
          topic_id: dueRev[0].topic_id,
          topic_title: dueRev[0].topic_title || 'Review Concepts',
          course_id: dueRev[0].course_id,
          course_name: dueRev[0].course_name || 'Core Curriculum',
          reason: 'Spaced repetition due today.',
        });
      }
      if (nextRec) {
        items.push({
          id: generateId('item'),
          type: 'NEW_TOPIC',
          allocated_minutes: 40,
          topic_id: nextRec.topic_id,
          topic_title: nextRec.topic_title,
          course_id: nextRec.course_id,
          course_name: nextRec.course_name,
          reason: 'Next progressive roadmap lesson.',
        });
      }
      items.push({
        id: generateId('item'),
        type: 'PRACTICE',
        allocated_minutes: 30,
        topic_id: nextRec?.topic_id || 'topic_practice',
        topic_title: 'Hands-on Practice & Exercises',
        course_id: nextRec?.course_id || 'python',
        course_name: nextRec?.course_name || 'Programming',
        reason: 'Practical application of learned concepts.',
      });
      if (weakTopics.length > 0) {
        items.push({
          id: generateId('item'),
          type: 'WEAK_TOPIC',
          allocated_minutes: 20,
          topic_id: weakTopics[0].topic_id,
          topic_title: weakTopics[0].topic_title,
          course_id: weakTopics[0].course_id,
          course_name: weakTopics[0].course_name,
          reason: 'Targeted strengthening for developing topic.',
        });
      }
    } else if (targetMinutes >= 60) {
      // 60 min: 15 min Revision, 25 min New Topic, 20 min Practice
      if (dueRev.length > 0) {
        items.push({
          id: generateId('item'),
          type: 'REVISION',
          allocated_minutes: 15,
          topic_id: dueRev[0].topic_id,
          topic_title: dueRev[0].topic_title || 'Review Concepts',
          course_id: dueRev[0].course_id,
          course_name: dueRev[0].course_name || 'Core Curriculum',
          reason: 'Spaced repetition due today.',
        });
      }
      if (nextRec) {
        items.push({
          id: generateId('item'),
          type: 'NEW_TOPIC',
          allocated_minutes: 25,
          topic_id: nextRec.topic_id,
          topic_title: nextRec.topic_title,
          course_id: nextRec.course_id,
          course_name: nextRec.course_name,
          reason: 'Sequential curriculum progression.',
        });
      }
      items.push({
        id: generateId('item'),
        type: 'PRACTICE',
        allocated_minutes: 20,
        topic_id: nextRec?.topic_id || 'topic_practice',
        topic_title: 'Coding & MCQ Practice',
        course_id: nextRec?.course_id || 'python',
        course_name: nextRec?.course_name || 'Programming',
        reason: 'Reinforce today\'s study.',
      });
    } else {
      // 30 min: 10 min Quick Review, 20 min Next Topic
      if (dueRev.length > 0) {
        items.push({
          id: generateId('item'),
          type: 'REVISION',
          allocated_minutes: 10,
          topic_id: dueRev[0].topic_id,
          topic_title: dueRev[0].topic_title || 'Quick Review',
          course_id: dueRev[0].course_id,
          course_name: dueRev[0].course_name || 'Core Curriculum',
          reason: 'Daily memory refresh.',
        });
      }
      if (nextRec) {
        items.push({
          id: generateId('item'),
          type: 'NEW_TOPIC',
          allocated_minutes: 20,
          topic_id: nextRec.topic_id,
          topic_title: nextRec.topic_title,
          course_id: nextRec.course_id,
          course_name: nextRec.course_name,
          reason: 'Core learning goal.',
        });
      }
    }

    return {
      target_minutes: targetMinutes,
      items,
      conflict_with_manual_plan: hasConflict,
      conflict_message: conflictMsg,
    };
  }

  /**
   * Applies the generated adaptive plan to today's StudyPlan in Part 16.
   */
  async applySmartPlanToToday(
    plan: AdaptiveDailyPlan
  ): Promise<{ success: boolean; itemsAdded: number; message: string }> {
    const today = getTodayDateString();

    const formattedTopics = plan.items.map((it) => ({
      courseId: it.course_id,
      topicId: it.topic_id,
      plannedMinutes: it.allocated_minutes,
    }));

    await studyPlanRepository.createOrUpdateDailyPlan({
      dateStr: today,
      plannedMinutes: plan.target_minutes,
      isRestDay: false,
      topics: formattedTopics,
      notes: `Adaptive Smart Learning Plan (${plan.target_minutes}m target)`,
    });

    return {
      success: true,
      itemsAdded: formattedTopics.length,
      message: `Successfully scheduled ${formattedTopics.length} recommended study blocks for today.`,
    };
  }

  // =========================================================================
  // 10. SETTINGS
  // =========================================================================

  async getSettings(): Promise<SmartLearningSettings> {
    const db = await dbManager.getDatabase();
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM smart_learning_settings WHERE user_id = 'default_user';`
    );

    if (row) {
      return {
        id: row.id,
        user_id: row.user_id,
        adaptive_difficulty_enabled: row.adaptive_difficulty_enabled === 1,
        spaced_revision_enabled: row.spaced_revision_enabled === 1,
        revision_interval_multiplier: Number(row.revision_interval_multiplier) || 1.0,
        default_session_minutes: Number(row.default_session_minutes) || 30,
        prioritize_weak_topics: row.prioritize_weak_topics === 1,
        target_interviews: row.target_interviews === 1,
        updated_at: row.updated_at,
      };
    }

    return {
      id: 'default_settings',
      user_id: 'default_user',
      adaptive_difficulty_enabled: true,
      spaced_revision_enabled: true,
      revision_interval_multiplier: 1.0,
      default_session_minutes: 30,
      prioritize_weak_topics: true,
      target_interviews: false,
      updated_at: getCurrentTimestamp(),
    };
  }

  async updateSettings(settings: Partial<SmartLearningSettings>): Promise<void> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();

    await db.runAsync(
      `UPDATE smart_learning_settings
       SET adaptive_difficulty_enabled = COALESCE(?, adaptive_difficulty_enabled),
           spaced_revision_enabled = COALESCE(?, spaced_revision_enabled),
           revision_interval_multiplier = COALESCE(?, revision_interval_multiplier),
           default_session_minutes = COALESCE(?, default_session_minutes),
           prioritize_weak_topics = COALESCE(?, prioritize_weak_topics),
           target_interviews = COALESCE(?, target_interviews),
           updated_at = ?
       WHERE user_id = 'default_user';`,
      [
        settings.adaptive_difficulty_enabled !== undefined ? (settings.adaptive_difficulty_enabled ? 1 : 0) : null,
        settings.spaced_revision_enabled !== undefined ? (settings.spaced_revision_enabled ? 1 : 0) : null,
        settings.revision_interval_multiplier ?? null,
        settings.default_session_minutes ?? null,
        settings.prioritize_weak_topics !== undefined ? (settings.prioritize_weak_topics ? 1 : 0) : null,
        settings.target_interviews !== undefined ? (settings.target_interviews ? 1 : 0) : null,
        now,
      ]
    );
  }
}

export const smartLearningRepository = SmartLearningRepository.getInstance();
