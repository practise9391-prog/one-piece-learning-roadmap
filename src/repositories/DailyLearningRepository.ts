import { DatabaseManager } from '../database/DatabaseManager';
import {
  DailyLearningPlan,
  DailyLearningTask,
  DailyLearningSettings,
  DailySummaryData,
  CalendarDayStatus,
  RevisionSchedule,
  TaskPriority,
  TaskDifficulty,
  TaskCategory,
  TaskLessonType,
} from '../models/DailyLearning';
import { DailyLessonGenerator } from '../services/DailyLessonGenerator';
import { generateId } from '../utils/idGenerator';
import { getLocalDateString, activityRepository } from './ActivityRepository';

export class DailyLearningRepository {
  private db = DatabaseManager.getInstance();

  /**
   * Retrieves the daily learning plan for a specific date (YYYY-MM-DD).
   */
  async getPlanForDate(dateStr: string): Promise<DailyLearningPlan | null> {
    const database = await this.db.getDatabase();

    const planRow = await database.getFirstAsync<any>(
      'SELECT * FROM daily_learning_plans WHERE date = ?;',
      [dateStr]
    );

    if (!planRow) {
      return null;
    }

    const taskRows = await database.getAllAsync<any>(
      'SELECT * FROM daily_learning_tasks WHERE daily_plan_id = ? ORDER BY order_index ASC;',
      [planRow.id]
    );

    const tasks: DailyLearningTask[] = taskRows.map((t) => ({
      id: t.id,
      dailyPlanId: t.daily_plan_id,
      courseId: t.course_id,
      courseName: t.course_name,
      category: t.category as TaskCategory,
      moduleId: t.module_id || undefined,
      topicId: t.topic_id || undefined,
      title: t.title,
      lessonType: t.lesson_type as TaskLessonType,
      priority: t.priority as TaskPriority,
      difficulty: t.difficulty as TaskDifficulty,
      estimatedMinutes: t.estimated_minutes,
      status: t.status,
      startedAt: t.started_at || undefined,
      completedAt: t.completed_at || undefined,
      score: t.score !== null ? t.score : undefined,
      totalQuestions: t.total_questions !== null ? t.total_questions : undefined,
      accuracy: t.accuracy !== null ? t.accuracy : undefined,
      xpEarned: t.xp_earned || 0,
      orderIndex: t.order_index,
      lessonData: t.lesson_data ? JSON.parse(t.lesson_data) : undefined,
    }));

    return {
      id: planRow.id,
      date: planRow.date,
      plannedMinutes: planRow.planned_minutes,
      completedMinutes: planRow.completed_minutes,
      status: planRow.status,
      completionPercentage: planRow.completion_percentage,
      notes: planRow.notes || undefined,
      createdAt: planRow.created_at,
      updatedAt: planRow.updated_at,
      tasks,
    };
  }

  /**
   * Retrieves today's plan, generating it if it doesn't exist yet.
   */
  async getOrCreateTodayPlan(dateStr: string = getLocalDateString()): Promise<DailyLearningPlan> {
    const existing = await this.getPlanForDate(dateStr);
    if (existing) {
      return existing;
    }
    return await this.generatePlanForDate(dateStr);
  }

  /**
   * Generates a balanced daily learning plan based on active courses, progress, and settings.
   */
  async generatePlanForDate(
    dateStr: string,
    forceRegenerate: boolean = false
  ): Promise<DailyLearningPlan> {
    const database = await this.db.getDatabase();

    if (forceRegenerate) {
      const existing = await database.getFirstAsync<{ id: string }>(
        'SELECT id FROM daily_learning_plans WHERE date = ?;',
        [dateStr]
      );
      if (existing) {
        await database.runAsync('DELETE FROM daily_learning_tasks WHERE daily_plan_id = ?;', [existing.id]);
        await database.runAsync('DELETE FROM daily_learning_plans WHERE id = ?;', [existing.id]);
      }
    }

    const settings = await this.getDailySettings();
    const now = new Date().toISOString();
    const planId = generateId('dlp');

    const tasksToInsert: Omit<DailyLearningTask, 'id' | 'dailyPlanId'>[] = [];
    let accumulatedMinutes = 0;
    let orderIndex = 1;

    // 1. Check for due / overdue Spaced Revision topics (HIGH PRIORITY)
    const dueRevisions = await database.getAllAsync<any>(
      `SELECT * FROM revision_schedules 
       WHERE next_revision_date <= ? AND status != 'REVISED' 
       ORDER BY next_revision_date ASC LIMIT 2;`,
      [dateStr]
    );

    for (const rev of dueRevisions) {
      const lessonData = DailyLessonGenerator.generateLesson(
        'REVISION',
        rev.course_id,
        rev.topic_title,
        rev.revision_level > 2 ? 'ADVANCED' : 'INTERMEDIATE'
      );

      tasksToInsert.push({
        courseId: rev.course_id,
        courseName: this.getCourseDisplayName(rev.course_id),
        category: 'REVISION',
        moduleId: rev.module_id,
        topicId: rev.topic_id,
        title: `Revision: ${rev.topic_title}`,
        lessonType: 'REVISION',
        priority: 'HIGH',
        difficulty: rev.revision_level > 2 ? 'ADVANCED' : 'INTERMEDIATE',
        estimatedMinutes: 20,
        status: 'PENDING',
        orderIndex: orderIndex++,
        lessonData,
      });
      accumulatedMinutes += 20;
    }

    // 2. Main Technical Course Task
    const techCourses = settings.activeCourses.filter((c) =>
      !['aptitude', 'reasoning', 'verbal_english', 'english_speaking'].includes(c)
    );
    const chosenTech = techCourses.length > 0 ? techCourses[0] : 'python';
    const nextTechTopic = await this.findNextUncompletedTopic(chosenTech);

    if (nextTechTopic) {
      const lessonData = DailyLessonGenerator.generateLesson(
        'MAIN_COURSE',
        chosenTech,
        nextTechTopic.title,
        'INTERMEDIATE'
      );
      tasksToInsert.push({
        courseId: chosenTech,
        courseName: this.getCourseDisplayName(chosenTech),
        category: 'MAIN_COURSE',
        moduleId: nextTechTopic.moduleId,
        topicId: nextTechTopic.id,
        title: `${this.getCourseDisplayName(chosenTech)} — ${nextTechTopic.title}`,
        lessonType: 'LESSON',
        priority: 'MEDIUM',
        difficulty: 'INTERMEDIATE',
        estimatedMinutes: 35,
        status: 'PENDING',
        orderIndex: orderIndex++,
        lessonData,
      });
      accumulatedMinutes += 35;
    }

    // 3. Aptitude Task
    if (settings.activeCourses.includes('aptitude') || settings.activeCourses.length <= 2) {
      const nextAptTopic = await this.findNextUncompletedTopic('aptitude');
      const aptTitle = nextAptTopic ? nextAptTopic.title : 'Percentages & Applications';
      const lessonData = DailyLessonGenerator.generateLesson('APTITUDE', 'aptitude', aptTitle, 'INTERMEDIATE');

      tasksToInsert.push({
        courseId: 'aptitude',
        courseName: 'Aptitude',
        category: 'APTITUDE',
        moduleId: nextAptTopic?.moduleId,
        topicId: nextAptTopic?.id,
        title: `Aptitude — ${aptTitle}`,
        lessonType: 'PRACTICE',
        priority: 'MEDIUM',
        difficulty: 'INTERMEDIATE',
        estimatedMinutes: 25,
        status: 'PENDING',
        orderIndex: orderIndex++,
        lessonData,
      });
      accumulatedMinutes += 25;
    }

    // 4. Reasoning Task
    if (settings.activeCourses.includes('reasoning') || settings.activeCourses.length <= 2) {
      const nextReasTopic = await this.findNextUncompletedTopic('reasoning');
      const reasTitle = nextReasTopic ? nextReasTopic.title : 'Coding-Decoding & Logic Patterns';
      const lessonData = DailyLessonGenerator.generateLesson('REASONING', 'reasoning', reasTitle, 'INTERMEDIATE');

      tasksToInsert.push({
        courseId: 'reasoning',
        courseName: 'Reasoning',
        category: 'REASONING',
        moduleId: nextReasTopic?.moduleId,
        topicId: nextReasTopic?.id,
        title: `Reasoning — ${reasTitle}`,
        lessonType: 'PRACTICE',
        priority: 'MEDIUM',
        difficulty: 'INTERMEDIATE',
        estimatedMinutes: 20,
        status: 'PENDING',
        orderIndex: orderIndex++,
        lessonData,
      });
      accumulatedMinutes += 20;
    }

    // 5. Verbal English Task
    if (settings.activeCourses.includes('verbal_english') || settings.activeCourses.length <= 2) {
      const nextEngTopic = await this.findNextUncompletedTopic('verbal_english');
      const engTitle = nextEngTopic ? nextEngTopic.title : 'Tenses Mastery & Agreement';
      const lessonData = DailyLessonGenerator.generateLesson('VERBAL_ENGLISH', 'verbal_english', engTitle, 'BEGINNER');

      tasksToInsert.push({
        courseId: 'verbal_english',
        courseName: 'Verbal English',
        category: 'VERBAL_ENGLISH',
        moduleId: nextEngTopic?.moduleId,
        topicId: nextEngTopic?.id,
        title: `Verbal English — ${engTitle}`,
        lessonType: 'LESSON',
        priority: 'LOW',
        difficulty: 'BEGINNER',
        estimatedMinutes: 15,
        status: 'PENDING',
        orderIndex: orderIndex++,
        lessonData,
      });
      accumulatedMinutes += 15;
    }

    // 6. English Speaking Drill
    if (settings.activeCourses.includes('english_speaking') || settings.activeCourses.length <= 2) {
      const nextSpeakTopic = await this.findNextUncompletedTopic('english_speaking');
      const speakTitle = nextSpeakTopic ? nextSpeakTopic.title : 'Self Introduction Elevator Pitch';
      const lessonData = DailyLessonGenerator.generateLesson('SPEAKING', 'english_speaking', speakTitle, 'BEGINNER');

      tasksToInsert.push({
        courseId: 'english_speaking',
        courseName: 'English Speaking',
        category: 'SPEAKING',
        moduleId: nextSpeakTopic?.moduleId,
        topicId: nextSpeakTopic?.id,
        title: `Speaking — ${speakTitle}`,
        lessonType: 'SPEAKING_DRILL',
        priority: 'LOW',
        difficulty: 'BEGINNER',
        estimatedMinutes: settings.speakingMinutes || 15,
        status: 'PENDING',
        orderIndex: orderIndex++,
        lessonData,
      });
      accumulatedMinutes += settings.speakingMinutes || 15;
    }

    // 7. Coding Challenge (Optional Practice)
    if (settings.codingTasks > 0) {
      const codingLesson = DailyLessonGenerator.generateLesson('CODING', chosenTech, 'Two Sum Problem Solving', 'INTERMEDIATE');
      tasksToInsert.push({
        courseId: chosenTech,
        courseName: this.getCourseDisplayName(chosenTech),
        category: 'CODING',
        title: 'Coding Challenge — Array Problem Solving',
        lessonType: 'CODING_CHALLENGE',
        priority: 'LOW',
        difficulty: 'INTERMEDIATE',
        estimatedMinutes: 20,
        status: 'PENDING',
        orderIndex: orderIndex++,
        lessonData: codingLesson,
      });
      accumulatedMinutes += 20;
    }

    // Save plan record
    const plannedMinutes = Math.max(settings.targetMinutes, accumulatedMinutes);
    await database.runAsync(
      `INSERT INTO daily_learning_plans (
        id, date, planned_minutes, completed_minutes, status,
        completion_percentage, notes, created_at, updated_at
      ) VALUES (?, ?, ?, 0, 'PLANNED', 0.0, NULL, ?, ?);`,
      [planId, dateStr, plannedMinutes, now, now]
    );

    // Save tasks
    const tasks: DailyLearningTask[] = [];
    for (const t of tasksToInsert) {
      const taskId = generateId('dlt');
      const lessonJson = t.lessonData ? JSON.stringify(t.lessonData) : null;

      await database.runAsync(
        `INSERT INTO daily_learning_tasks (
          id, daily_plan_id, course_id, course_name, category,
          module_id, topic_id, title, lesson_type, priority,
          difficulty, estimated_minutes, status, started_at, completed_at,
          score, total_questions, accuracy, xp_earned, order_index, lesson_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', NULL, NULL, NULL, NULL, NULL, 0, ?, ?);`,
        [
          taskId,
          planId,
          t.courseId,
          t.courseName,
          t.category,
          t.moduleId || null,
          t.topicId || null,
          t.title,
          t.lessonType,
          t.priority,
          t.difficulty,
          t.estimatedMinutes,
          t.orderIndex,
          lessonJson,
        ]
      );

      tasks.push({
        id: taskId,
        dailyPlanId: planId,
        ...t,
      });
    }

    return {
      id: planId,
      date: dateStr,
      plannedMinutes,
      completedMinutes: 0,
      status: 'PLANNED',
      completionPercentage: 0.0,
      tasks,
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Helper to find the next uncompleted topic for a given course.
   */
  private async findNextUncompletedTopic(
    courseId: string
  ): Promise<{ id: string; title: string; moduleId: string } | null> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{ id: string; title: string; module_id: string }>(
      `SELECT t.id, t.title, t.module_id 
       FROM topics t 
       JOIN modules m ON t.module_id = m.id 
       WHERE m.course_id = ? AND t.is_completed = 0 
       ORDER BY m.order_index ASC, t.order_index ASC LIMIT 1;`,
      [courseId]
    );

    if (row) {
      return { id: row.id, title: row.title, moduleId: row.module_id };
    }
    return null;
  }

  /**
   * Marks a daily task as completed, logs lesson results, updates plan progress,
   * updates the local course topic completion, and schedules Spaced Revision.
   */
  async completeTask(
    taskId: string,
    result: {
      score?: number;
      totalQuestions?: number;
      accuracy?: number;
      timeSpentSeconds: number;
      xpEarned: number;
    }
  ): Promise<{ planCompleted: boolean; updatedPlan: DailyLearningPlan }> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    // 1. Fetch task
    const task = await database.getFirstAsync<any>(
      'SELECT * FROM daily_learning_tasks WHERE id = ?;',
      [taskId]
    );
    if (!task) {
      throw new Error(`Task ${taskId} not found.`);
    }

    // 2. Update task
    await database.runAsync(
      `UPDATE daily_learning_tasks 
       SET status = 'COMPLETED',
           completed_at = ?,
           score = ?,
           total_questions = ?,
           accuracy = ?,
           xp_earned = ?
       WHERE id = ?;`,
      [
        now,
        result.score !== undefined ? result.score : null,
        result.totalQuestions !== undefined ? result.totalQuestions : null,
        result.accuracy !== undefined ? result.accuracy : 100.0,
        result.xpEarned || 25,
        taskId,
      ]
    );

    // 3. Log into daily_lesson_results
    const resId = generateId('dlr');
    await database.runAsync(
      `INSERT INTO daily_lesson_results (
        id, task_id, topic_id, course_id, score,
        total_questions, accuracy, time_spent_seconds, xp_earned, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        resId,
        taskId,
        task.topic_id || null,
        task.course_id,
        result.score || 0,
        result.totalQuestions || 0,
        result.accuracy || 100.0,
        result.timeSpentSeconds,
        result.xpEarned || 25,
        now,
      ]
    );

    // 4. Update topic completion in database if topic_id exists
    if (task.topic_id) {
      await database.runAsync(
        'UPDATE topics SET is_completed = 1, completed_at = ? WHERE id = ?;',
        [now, task.topic_id]
      );
      await database.runAsync(
        `INSERT OR REPLACE INTO user_progress (id, course_id, module_id, topic_id, completed_at)
         VALUES (?, ?, ?, ?, ?);`,
        [generateId('prog'), task.course_id, task.module_id || '', task.topic_id, now]
      );

      // Check module auto-completion
      if (task.module_id) {
        const remainingInModule = await database.getFirstAsync<{ count: number }>(
          'SELECT COUNT(*) as count FROM topics WHERE module_id = ? AND is_completed = 0;',
          [task.module_id]
        );
        if (remainingInModule && remainingInModule.count === 0) {
          await database.runAsync(
            'UPDATE modules SET is_completed = 1, completed_at = ? WHERE id = ?;',
            [now, task.module_id]
          );
        }
      }

      // Recalculate course progress
      await database.execAsync(`
        UPDATE courses SET completed_modules = (
          SELECT COUNT(*) FROM modules WHERE modules.course_id = courses.id AND modules.is_completed = 1
        ) WHERE id = '${task.course_id}';

        UPDATE courses SET progress_percentage = CASE
          WHEN total_modules > 0 THEN ROUND((CAST(completed_modules AS REAL) / total_modules) * 100, 1)
          ELSE 0.0
        END WHERE id = '${task.course_id}';
      `);

      // 5. Spaced Revision scheduling & Difficulty Adaptation
      await this.scheduleRevision(
        task.course_id,
        task.module_id,
        task.topic_id,
        task.title,
        result.accuracy !== undefined ? result.accuracy : 100.0,
        result.score
      );
    }

    // 6. Update Daily Plan completion stats
    const minutesAdded = Math.max(1, Math.round(result.timeSpentSeconds / 60));
    await database.runAsync(
      `UPDATE daily_learning_plans 
       SET completed_minutes = completed_minutes + ?,
           updated_at = ?
       WHERE id = ?;`,
      [minutesAdded, now, task.daily_plan_id]
    );

    // Recalculate plan completion percentage & status
    const allTasks = await database.getAllAsync<{ status: string }>(
      'SELECT status FROM daily_learning_tasks WHERE daily_plan_id = ?;',
      [task.daily_plan_id]
    );
    const completedTasksCount = allTasks.filter((t) => t.status === 'COMPLETED').length;
    const completionPct = Math.round((completedTasksCount / allTasks.length) * 100);
    const newStatus = completionPct === 100 ? 'COMPLETED' : 'IN_PROGRESS';

    await database.runAsync(
      `UPDATE daily_learning_plans 
       SET completion_percentage = ?,
           status = ?
       WHERE id = ?;`,
      [completionPct, newStatus, task.daily_plan_id]
    );

    // 7. Record learning activity
    await activityRepository.recordActivity({
      activityType: 'DAILY_TASK_COMPLETED',
      courseId: task.course_id,
      moduleId: task.module_id,
      topicId: task.topic_id,
    });

    // 8. Streak Verification: Increment streak if daily qualification met
    await this.verifyAndIncrementStreak();

    // Return updated plan
    const updatedPlan = await this.getPlanForDate(task.daily_plan_id);
    return {
      planCompleted: newStatus === 'COMPLETED',
      updatedPlan: updatedPlan!,
    };
  }

  /**
   * Spaced Revision algorithm implementation with Difficulty Adaptation.
   * - Accuracy < 60%: reset to Level 1, interval = 1 day (urgent revision tomorrow).
   * - Accuracy 60-85%: maintain current interval step.
   * - Accuracy > 85%: advance interval (1 -> 3 -> 7 -> 14 -> 30 days).
   */
  async scheduleRevision(
    courseId: string,
    moduleId: string | undefined,
    topicId: string,
    topicTitle: string,
    accuracy: number,
    score?: number
  ): Promise<void> {
    const database = await this.db.getDatabase();
    const now = new Date();
    const todayStr = getLocalDateString();

    const existing = await database.getFirstAsync<any>(
      'SELECT * FROM revision_schedules WHERE topic_id = ?;',
      [topicId]
    );

    let nextLevel = 1;
    let intervalDays = 1;

    if (existing) {
      if (accuracy < 60) {
        // Poor performance: reset to Level 1, repeat tomorrow
        nextLevel = 1;
        intervalDays = 1;
      } else if (accuracy >= 85) {
        // High mastery: advance interval
        nextLevel = Math.min(5, existing.revision_level + 1);
        const intervals = [1, 3, 7, 14, 30];
        intervalDays = intervals[nextLevel - 1] || 30;
      } else {
        // Moderate performance (60-84%): keep current step
        nextLevel = existing.revision_level;
        const intervals = [1, 3, 7, 14, 30];
        intervalDays = intervals[nextLevel - 1] || 7;
      }
    } else {
      // First revision scheduled
      intervalDays = accuracy < 60 ? 1 : 3;
      nextLevel = accuracy < 60 ? 1 : 2;
    }

    const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
    const nextDateStr = nextDate.toISOString().split('T')[0];

    await database.runAsync(
      `INSERT INTO revision_schedules (
        id, course_id, module_id, topic_id, topic_title,
        last_studied_at, next_revision_date, revision_level,
        last_score, last_accuracy, interval_days, status, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
      ON CONFLICT(topic_id) DO UPDATE SET
        last_studied_at = excluded.last_studied_at,
        next_revision_date = excluded.next_revision_date,
        revision_level = excluded.revision_level,
        last_score = excluded.last_score,
        last_accuracy = excluded.last_accuracy,
        interval_days = excluded.interval_days,
        status = 'PENDING',
        updated_at = excluded.updated_at;`,
      [
        existing ? existing.id : generateId('rev'),
        courseId,
        moduleId || null,
        topicId,
        topicTitle,
        now.toISOString(),
        nextDateStr,
        nextLevel,
        score !== undefined ? score : null,
        accuracy,
        intervalDays,
        now.toISOString(),
      ]
    );
  }

  /**
   * Retrieves overdue and due revision schedules.
   */
  async getDueRevisions(dateStr: string = getLocalDateString()): Promise<RevisionSchedule[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT * FROM revision_schedules 
       WHERE next_revision_date <= ? AND status != 'REVISED'
       ORDER BY next_revision_date ASC;`,
      [dateStr]
    );

    return rows.map((r) => ({
      id: r.id,
      courseId: r.course_id,
      moduleId: r.module_id || undefined,
      topicId: r.topic_id,
      topicTitle: r.topic_title,
      lastStudiedAt: r.last_studied_at,
      nextRevisionDate: r.next_revision_date,
      revisionLevel: r.revision_level,
      lastScore: r.last_score,
      lastAccuracy: r.last_accuracy,
      intervalDays: r.interval_days,
      status: r.status,
      updatedAt: r.updated_at,
    }));
  }

  /**
   * Finds uncompleted tasks from yesterday or previous days for Missed Day handling.
   */
  async getIncompleteTasksFromYesterday(todayStr: string = getLocalDateString()): Promise<DailyLearningTask[]> {
    const database = await this.db.getDatabase();

    const yesterdayRow = await database.getFirstAsync<{ id: string }>(
      'SELECT id FROM daily_learning_plans WHERE date < ? ORDER BY date DESC LIMIT 1;',
      [todayStr]
    );

    if (!yesterdayRow) return [];

    const taskRows = await database.getAllAsync<any>(
      "SELECT * FROM daily_learning_tasks WHERE daily_plan_id = ? AND status = 'PENDING';",
      [yesterdayRow.id]
    );

    return taskRows.map((t) => ({
      id: t.id,
      dailyPlanId: t.daily_plan_id,
      courseId: t.course_id,
      courseName: t.course_name,
      category: t.category as TaskCategory,
      moduleId: t.module_id || undefined,
      topicId: t.topic_id || undefined,
      title: t.title,
      lessonType: t.lesson_type as TaskLessonType,
      priority: 'HIGH' as TaskPriority,
      difficulty: t.difficulty as TaskDifficulty,
      estimatedMinutes: t.estimated_minutes,
      status: t.status,
      orderIndex: t.order_index,
      lessonData: t.lesson_data ? JSON.parse(t.lesson_data) : undefined,
    }));
  }

  /**
   * Adds missed tasks into today's plan with HIGH priority.
   */
  async addMissedTasksToToday(taskIds: string[], todayStr: string = getLocalDateString()): Promise<void> {
    const database = await this.db.getDatabase();
    const todayPlan = await this.getOrCreateTodayPlan(todayStr);

    for (const id of taskIds) {
      const task = await database.getFirstAsync<any>(
        'SELECT * FROM daily_learning_tasks WHERE id = ?;',
        [id]
      );
      if (!task) continue;

      const newTaskId = generateId('dlt');
      await database.runAsync(
        `INSERT INTO daily_learning_tasks (
          id, daily_plan_id, course_id, course_name, category,
          module_id, topic_id, title, lesson_type, priority,
          difficulty, estimated_minutes, status, score, accuracy,
          order_index, lesson_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'HIGH', ?, ?, 'PENDING', NULL, NULL, ?, ?);`,
        [
          newTaskId,
          todayPlan.id,
          task.course_id,
          task.course_name,
          task.category,
          task.module_id,
          task.topic_id,
          task.title,
          task.lesson_type,
          task.difficulty,
          task.estimated_minutes,
          todayPlan.tasks.length + 1,
          task.lesson_data,
        ]
      );

      // Mark original task as SKIPPED to avoid perpetual backlog
      await database.runAsync("UPDATE daily_learning_tasks SET status = 'SKIPPED' WHERE id = ?;", [id]);
    }
  }

  /**
   * Dismisses missed tasks without penalty.
   */
  async dismissMissedTasks(taskIds: string[]): Promise<void> {
    const database = await this.db.getDatabase();
    for (const id of taskIds) {
      await database.runAsync("UPDATE daily_learning_tasks SET status = 'SKIPPED' WHERE id = ?;", [id]);
    }
  }

  /**
   * Verifies if today qualifies to maintain or increment learning streak.
   */
  private async verifyAndIncrementStreak(): Promise<void> {
    const database = await this.db.getDatabase();
    const todayStr = getLocalDateString();

    const profile = await database.getFirstAsync<{ current_streak: number; last_active_date: string }>(
      'SELECT current_streak, last_active_date FROM user_profiles LIMIT 1;'
    );
    if (!profile) return;

    if (profile.last_active_date === todayStr) {
      // Already counted today
      return;
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const isConsecutive = profile.last_active_date === yesterday;
    const newStreak = isConsecutive ? profile.current_streak + 1 : 1;

    await database.runAsync(
      `UPDATE user_profiles 
       SET current_streak = ?,
           longest_streak = MAX(longest_streak, ?),
           last_active_date = ?;`,
      [newStreak, newStreak, todayStr]
    );
  }

  /**
   * Retrieves month calendar history for the calendar view.
   */
  async getCalendarHistory(year: number, month: number): Promise<CalendarDayStatus[]> {
    const database = await this.db.getDatabase();
    const monthStr = month < 10 ? `0${month}` : `${month}`;
    const pattern = `${year}-${monthStr}-%`;

    const plans = await database.getAllAsync<any>(
      'SELECT * FROM daily_learning_plans WHERE date LIKE ?;',
      [pattern]
    );

    const planMap = new Map<string, any>();
    for (const p of plans) {
      planMap.set(p.date, p);
    }

    const daysInMonth = new Date(year, month, 0).getDate();
    const result: CalendarDayStatus[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const fullDate = `${year}-${monthStr}-${dayStr}`;
      const plan = planMap.get(fullDate);

      result.push({
        date: fullDate,
        dayNumber: day,
        hasPlan: !!plan,
        status: plan?.status,
        completedMinutes: plan?.completed_minutes || 0,
        plannedMinutes: plan?.planned_minutes || 0,
        taskCount: 0,
        completedTaskCount: 0,
      });
    }

    return result;
  }

  /**
   * Retrieves user's Daily Learning preferences from app_settings.
   */
  async getDailySettings(): Promise<DailyLearningSettings> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<{ key: string; value: string }>(
      'SELECT key, value FROM app_settings WHERE key LIKE "daily_%" OR key LIKE "preferred_%" OR key = "active_learning_courses";'
    );

    const map = new Map(rows.map((r) => [r.key, r.value]));

    return {
      targetMinutes: parseInt(map.get('daily_study_target_minutes') || '120', 10),
      aptitudeQuestions: parseInt(map.get('daily_aptitude_questions_target') || '10', 10),
      reasoningQuestions: parseInt(map.get('daily_reasoning_questions_target') || '10', 10),
      englishQuestions: parseInt(map.get('daily_english_questions_target') || '10', 10),
      speakingMinutes: parseInt(map.get('daily_speaking_minutes_target') || '15', 10),
      codingTasks: parseInt(map.get('daily_coding_tasks_target') || '1', 10),
      preferredTime: (map.get('preferred_study_time') as any) || 'Evening',
      customTimeWindow: map.get('preferred_study_time_custom') || '19:00 - 21:00',
      activeCourses: map.has('active_learning_courses')
        ? JSON.parse(map.get('active_learning_courses')!)
        : ['python', 'aptitude', 'reasoning', 'verbal_english', 'english_speaking'],
    };
  }

  /**
   * Updates user's Daily Learning preferences.
   */
  async updateDailySettings(settings: Partial<DailyLearningSettings>): Promise<void> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    const updates: [string, string][] = [];
    if (settings.targetMinutes !== undefined) updates.push(['daily_study_target_minutes', String(settings.targetMinutes)]);
    if (settings.aptitudeQuestions !== undefined) updates.push(['daily_aptitude_questions_target', String(settings.aptitudeQuestions)]);
    if (settings.reasoningQuestions !== undefined) updates.push(['daily_reasoning_questions_target', String(settings.reasoningQuestions)]);
    if (settings.englishQuestions !== undefined) updates.push(['daily_english_questions_target', String(settings.englishQuestions)]);
    if (settings.speakingMinutes !== undefined) updates.push(['daily_speaking_minutes_target', String(settings.speakingMinutes)]);
    if (settings.codingTasks !== undefined) updates.push(['daily_coding_tasks_target', String(settings.codingTasks)]);
    if (settings.preferredTime !== undefined) updates.push(['preferred_study_time', settings.preferredTime]);
    if (settings.customTimeWindow !== undefined) updates.push(['preferred_study_time_custom', settings.customTimeWindow]);
    if (settings.activeCourses !== undefined) updates.push(['active_learning_courses', JSON.stringify(settings.activeCourses)]);

    for (const [k, v] of updates) {
      await database.runAsync(
        'INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES (?, ?, ?);',
        [k, v, now]
      );
    }
  }

  /**
   * Computes end of day learning summary and intelligent recommendations for tomorrow.
   */
  async getTodaySummary(dateStr: string = getLocalDateString()): Promise<DailySummaryData> {
    const database = await this.db.getDatabase();
    const plan = await this.getPlanForDate(dateStr);

    const results = await database.getAllAsync<any>(
      'SELECT * FROM daily_lesson_results WHERE completed_at LIKE ?;',
      [`${dateStr}%`]
    );

    const profile = await database.getFirstAsync<{ current_streak: number }>(
      'SELECT current_streak FROM user_profiles LIMIT 1;'
    );

    const totalQuestions = results.reduce((acc, r) => acc + (r.total_questions || 0), 0);
    const correctQuestions = results.reduce((acc, r) => acc + (r.score || 0), 0);
    const totalXp = results.reduce((acc, r) => acc + (r.xp_earned || 0), 0);
    const accuracy = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 100;

    const recommendations: string[] = [];
    if (accuracy < 70) {
      recommendations.push('Review today\'s formulas and re-attempt missed aptitude/reasoning questions.');
    } else {
      recommendations.push('Outstanding accuracy! Ready to tackle higher-difficulty questions tomorrow.');
    }
    recommendations.push('Complete 15 minutes of Spaced Revision for previously learned chapters.');
    recommendations.push('Practice one full 90-second English speaking scenario in the Dojo.');

    return {
      date: dateStr,
      completedTasks: plan?.tasks.filter((t) => t.status === 'COMPLETED').length || 0,
      totalTasks: plan?.tasks.length || 0,
      completedMinutes: plan?.completedMinutes || 0,
      totalQuestions,
      correctQuestions,
      accuracy,
      xpEarned: totalXp,
      streak: profile?.current_streak || 1,
      recommendations,
    };
  }

  private getCourseDisplayName(courseId: string): string {
    const names: Record<string, string> = {
      python: 'Python',
      dsa: 'Data Structures',
      git: 'Git & GitHub',
      sql: 'SQL & DB',
      django: 'Django',
      ml_developer: 'Machine Learning',
      linux: 'Linux',
      frappe: 'Frappe',
      aptitude: 'Aptitude',
      reasoning: 'Reasoning',
      verbal_english: 'Verbal English',
      english_speaking: 'English Speaking',
      hindi: 'Hindi',
      html: 'HTML',
      css: 'CSS',
      javascript: 'JavaScript',
    };
    return names[courseId] || courseId.toUpperCase();
  }
}

export const dailyLearningRepository = new DailyLearningRepository();
