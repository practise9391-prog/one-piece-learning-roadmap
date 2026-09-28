import { dbManager } from '../database/DatabaseManager';
import {
  StudyPlan,
  StudyPlanItem,
  StudyGoal,
  StudyPreferences,
  WeeklyPlanDay,
  MonthlyWeekSummary,
  StudySessionHistoryItem,
  PlanType,
  PlanStatus,
  PlanItemStatus,
  GoalType,
  GoalPeriod,
  GoalStatus,
  TimerMode,
} from '../models/StudyPlan';
import { generateId } from '../utils/idGenerator';
import { getCurrentTimestamp } from '../utils/dateUtils';
import { activityRepository } from './ActivityRepository';
import { topicRepository } from './TopicRepository';
import { progressService } from '../services/ProgressService';

export function formatDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString(): string {
  return formatDateString(new Date());
}

export function getWeekBounds(d: Date = new Date()): { weekStart: string; weekEnd: string } {
  const current = new Date(d);
  const dayOfWeek = current.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMonday = (dayOfWeek + 6) % 7;
  const monday = new Date(current);
  monday.setDate(current.getDate() - distanceToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weekStart: formatDateString(monday),
    weekEnd: formatDateString(sunday),
  };
}

export class StudyPlanRepository {
  // =========================================================================
  // 1. DAILY PLANS
  // =========================================================================

  async getDailyPlan(dateStr: string = getTodayDateString()): Promise<StudyPlan | null> {
    const db = await dbManager.getDatabase();
    const planRow = await db.getFirstAsync<any>(
      `SELECT * FROM study_plans WHERE plan_type = 'DAILY' AND date = ?;`,
      [dateStr]
    );

    if (!planRow) {
      return null;
    }

    const items = await this.getPlanItems(planRow.id);

    return {
      id: planRow.id,
      planType: planRow.plan_type as PlanType,
      date: planRow.date,
      weekStart: planRow.week_start,
      weekEnd: planRow.week_end,
      month: planRow.month,
      year: planRow.year,
      plannedMinutes: planRow.planned_minutes,
      completedMinutes: planRow.completed_minutes,
      plannedTopics: planRow.planned_topics,
      completedTopics: planRow.completed_topics,
      isRestDay: planRow.is_rest_day === 1,
      status: planRow.status as PlanStatus,
      notes: planRow.notes,
      items,
      createdAt: planRow.created_at,
      updatedAt: planRow.updated_at,
    };
  }

  async getPlanItems(studyPlanId: string): Promise<StudyPlanItem[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT 
        spi.*,
        c.name as course_name,
        m.title as module_title,
        t.title as topic_title
       FROM study_plan_items spi
       LEFT JOIN courses c ON spi.course_id = c.id
       LEFT JOIN modules m ON spi.module_id = m.id
       LEFT JOIN topics t ON spi.topic_id = t.id
       WHERE spi.study_plan_id = ?
       ORDER BY spi.order_index ASC;`,
      [studyPlanId]
    );

    return rows.map((r) => ({
      id: r.id,
      studyPlanId: r.study_plan_id,
      courseId: r.course_id,
      courseName: r.course_name || r.course_id,
      moduleId: r.module_id,
      moduleTitle: r.module_title || '',
      topicId: r.topic_id,
      topicTitle: r.topic_title || r.topic_id,
      plannedMinutes: r.planned_minutes,
      actualMinutes: r.actual_minutes,
      orderIndex: r.order_index,
      status: r.status as PlanItemStatus,
      startedAt: r.started_at,
      completedAt: r.completed_at,
      rescheduledToDate: r.rescheduled_to_date,
      createdAt: r.created_at,
    }));
  }

  async createOrUpdateDailyPlan(params: {
    dateStr?: string;
    plannedMinutes?: number;
    isRestDay?: boolean;
    topics?: {
      courseId: string;
      moduleId?: string;
      topicId: string;
      plannedMinutes?: number;
    }[];
    notes?: string;
  }): Promise<StudyPlan> {
    const db = await dbManager.getDatabase();
    const dateStr = params.dateStr || getTodayDateString();
    const dateObj = new Date(dateStr);
    const { weekStart, weekEnd } = getWeekBounds(dateObj);
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    const now = getCurrentTimestamp();

    const planId = `plan_daily_${dateStr}`;
    const isRest = params.isRestDay ? 1 : 0;
    const initialStatus = isRest ? 'REST_DAY' : 'NOT_STARTED';

    // Check if plan exists
    const existing = await this.getDailyPlan(dateStr);

    if (existing) {
      await db.runAsync(
        `UPDATE study_plans
         SET is_rest_day = ?,
             notes = COALESCE(?, notes),
             status = CASE WHEN ? = 1 THEN 'REST_DAY' ELSE status END,
             updated_at = ?
         WHERE id = ?;`,
        [isRest, params.notes || null, isRest, now, planId]
      );
    } else {
      await db.runAsync(
        `INSERT INTO study_plans (
          id, plan_type, date, week_start, week_end, month, year,
          planned_minutes, completed_minutes, planned_topics, completed_topics,
          is_rest_day, status, notes, created_at, updated_at
        ) VALUES (?, 'DAILY', ?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, ?, ?, ?);`,
        [planId, dateStr, weekStart, weekEnd, month, year, isRest, initialStatus, params.notes || null, now, now]
      );
    }

    // Insert topics if provided
    if (params.topics && params.topics.length > 0) {
      // Clear existing pending items if replacing
      await db.runAsync(
        `DELETE FROM study_plan_items WHERE study_plan_id = ? AND status = 'PENDING';`,
        [planId]
      );

      let order = 0;
      for (const t of params.topics) {
        order++;
        const itemId = generateId('spi');
        const plannedMin = t.plannedMinutes || 25;
        await db.runAsync(
          `INSERT INTO study_plan_items (
            id, study_plan_id, course_id, module_id, topic_id,
            planned_minutes, actual_minutes, order_index, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 'PENDING', ?);`,
          [itemId, planId, t.courseId, t.moduleId || null, t.topicId, plannedMin, order, now]
        );
      }
    }

    // Recalculate totals
    await this.recalculatePlanTotals(planId);

    const updated = await this.getDailyPlan(dateStr);
    return updated!;
  }

  async recalculatePlanTotals(planId: string): Promise<void> {
    const db = await dbManager.getDatabase();
    const stats = await db.getFirstAsync<any>(
      `SELECT 
        COUNT(*) as total_items,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_items,
        SUM(planned_minutes) as total_planned_min,
        SUM(actual_minutes) as total_actual_min
       FROM study_plan_items
       WHERE study_plan_id = ?;`,
      [planId]
    );

    const plan = await db.getFirstAsync<any>(
      `SELECT is_rest_day, status FROM study_plans WHERE id = ?;`,
      [planId]
    );

    if (!plan) return;

    const plannedTopics = stats?.total_items || 0;
    const completedTopics = stats?.completed_items || 0;
    const plannedMin = stats?.total_planned_min || 0;
    const completedMin = stats?.total_actual_min || 0;

    let newStatus = plan.status;
    if (plan.is_rest_day === 1) {
      newStatus = 'REST_DAY';
    } else if (plannedTopics > 0 && completedTopics >= plannedTopics) {
      newStatus = 'COMPLETED';
    } else if (completedTopics > 0 || completedMin > 0) {
      newStatus = 'IN_PROGRESS';
    }

    await db.runAsync(
      `UPDATE study_plans
       SET planned_minutes = ?,
           completed_minutes = ?,
           planned_topics = ?,
           completed_topics = ?,
           status = ?,
           updated_at = ?
       WHERE id = ?;`,
      [plannedMin, completedMin, plannedTopics, completedTopics, newStatus, getCurrentTimestamp(), planId]
    );
  }

  async setRestDay(dateStr: string, isRestDay: boolean): Promise<StudyPlan> {
    const plan = await this.createOrUpdateDailyPlan({ dateStr, isRestDay });
    return plan;
  }

  async markPlanItemCompleted(itemId: string, actualMinutes: number = 25): Promise<void> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();

    const item = await db.getFirstAsync<any>(
      `SELECT * FROM study_plan_items WHERE id = ?;`,
      [itemId]
    );

    if (!item) return;

    await db.runAsync(
      `UPDATE study_plan_items
       SET status = 'COMPLETED',
           actual_minutes = ?,
           completed_at = ?
       WHERE id = ?;`,
      [Math.max(item.actual_minutes, actualMinutes), now, itemId]
    );

    // Also mark topic completed in progress repository & learning activity
    if (item.topic_id && item.course_id) {
      let modId = item.module_id;
      const topic = await topicRepository.getById(item.topic_id);
      if (!modId && topic) {
        modId = topic.module_id;
      }
      if (modId && topic && !topic.is_completed) {
        await progressService.toggleTopicCompletion(item.course_id, modId, item.topic_id);
      }
      await activityRepository.recordActivity({
        courseId: item.course_id,
        moduleId: item.module_id,
        topicId: item.topic_id,
        activityType: 'TOPIC_COMPLETED',
      });
    }

    await this.recalculatePlanTotals(item.study_plan_id);
    await this.evaluateGoals();
  }

  async rescheduleItem(
    itemId: string,
    target: 'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'CUSTOM_DATE' | 'CANCEL',
    customDate?: string
  ): Promise<void> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();
    const today = new Date();

    let targetDateStr = '';
    if (target === 'TODAY') {
      targetDateStr = formatDateString(today);
    } else if (target === 'TOMORROW') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      targetDateStr = formatDateString(tomorrow);
    } else if (target === 'THIS_WEEK') {
      const { weekEnd } = getWeekBounds(today);
      targetDateStr = weekEnd;
    } else if (target === 'CUSTOM_DATE' && customDate) {
      targetDateStr = customDate;
    }

    if (target === 'CANCEL') {
      await db.runAsync(
        `UPDATE study_plan_items SET status = 'SKIPPED' WHERE id = ?;`,
        [itemId]
      );
      const itm = await db.getFirstAsync<any>(`SELECT study_plan_id FROM study_plan_items WHERE id = ?;`, [itemId]);
      if (itm) await this.recalculatePlanTotals(itm.study_plan_id);
      return;
    }

    // Mark current item as RESCHEDULED
    await db.runAsync(
      `UPDATE study_plan_items 
       SET status = 'RESCHEDULED', rescheduled_to_date = ? 
       WHERE id = ?;`,
      [targetDateStr, itemId]
    );

    const oldItem = await db.getFirstAsync<any>(
      `SELECT * FROM study_plan_items WHERE id = ?;`,
      [itemId]
    );

    if (!oldItem) return;
    await this.recalculatePlanTotals(oldItem.study_plan_id);

    // Create target daily plan if missing
    await this.createOrUpdateDailyPlan({ dateStr: targetDateStr });
    const targetPlanId = `plan_daily_${targetDateStr}`;

    // Add new item into target day plan
    const newItemId = generateId('spi');
    await db.runAsync(
      `INSERT INTO study_plan_items (
        id, study_plan_id, course_id, module_id, topic_id,
        planned_minutes, actual_minutes, order_index, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, 99, 'PENDING', ?);`,
      [newItemId, targetPlanId, oldItem.course_id, oldItem.module_id, oldItem.topic_id, oldItem.planned_minutes, now]
    );

    await this.recalculatePlanTotals(targetPlanId);
  }

  async getUnfinishedTopicsFromPreviousDays(limit: number = 10): Promise<StudyPlanItem[]> {
    const db = await dbManager.getDatabase();
    const todayStr = getTodayDateString();

    const rows = await db.getAllAsync<any>(
      `SELECT 
        spi.*,
        c.name as course_name,
        m.title as module_title,
        t.title as topic_title
       FROM study_plan_items spi
       JOIN study_plans sp ON spi.study_plan_id = sp.id
       LEFT JOIN courses c ON spi.course_id = c.id
       LEFT JOIN modules m ON spi.module_id = m.id
       LEFT JOIN topics t ON spi.topic_id = t.id
       WHERE sp.date < ?
         AND spi.status = 'PENDING'
         AND t.is_completed = 0
       ORDER BY sp.date DESC, spi.order_index ASC
       LIMIT ?;`,
      [todayStr, limit]
    );

    return rows.map((r) => ({
      id: r.id,
      studyPlanId: r.study_plan_id,
      courseId: r.course_id,
      courseName: r.course_name || r.course_id,
      moduleId: r.module_id,
      moduleTitle: r.module_title || '',
      topicId: r.topic_id,
      topicTitle: r.topic_title || r.topic_id,
      plannedMinutes: r.planned_minutes,
      actualMinutes: r.actual_minutes,
      orderIndex: r.order_index,
      status: r.status as PlanItemStatus,
      startedAt: r.started_at,
      completedAt: r.completed_at,
      rescheduledToDate: r.rescheduled_to_date,
      createdAt: r.created_at,
    }));
  }

  async continueUnfinishedTopics(
    targetDateStr: string = getTodayDateString(),
    itemIds?: string[]
  ): Promise<StudyPlan> {
    const db = await dbManager.getDatabase();
    const unfinished = await this.getUnfinishedTopicsFromPreviousDays(20);
    const selected = itemIds
      ? unfinished.filter((u) => itemIds.includes(u.id))
      : unfinished;

    const topicsToAdd = selected.map((u) => ({
      courseId: u.courseId,
      moduleId: u.moduleId,
      topicId: u.topicId,
      plannedMinutes: u.plannedMinutes,
    }));

    // Mark previous as rescheduled
    for (const u of selected) {
      await db.runAsync(
        `UPDATE study_plan_items SET status = 'RESCHEDULED', rescheduled_to_date = ? WHERE id = ?;`,
        [targetDateStr, u.id]
      );
    }

    return await this.createOrUpdateDailyPlan({
      dateStr: targetDateStr,
      topics: topicsToAdd,
    });
  }

  // =========================================================================
  // 2. AUTOMATIC DAILY PLAN GENERATOR
  // =========================================================================

  async generateAutomaticDailyPlan(
    dateStr: string = getTodayDateString(),
    availableMinutes: number = 120,
    coursePriorities?: string[]
  ): Promise<StudyPlan> {
    const db = await dbManager.getDatabase();
    const prefs = await this.getStudyPreferences();
    const priorities = coursePriorities && coursePriorities.length > 0
      ? coursePriorities
      : prefs.preferredCourses;

    // Collect candidate uncompleted topics by course respecting sequential module and topic order
    const candidateTopicsByCourse: Record<string, any[]> = {};

    for (const courseId of priorities) {
      // Find incomplete modules and their earliest incomplete topics
      const rows = await db.getAllAsync<any>(
        `SELECT 
          t.id as topic_id,
          t.title as topic_title,
          COALESCE(t.estimated_minutes, 25) as estimated_minutes,
          m.id as module_id,
          m.title as module_title,
          m.order_index as mod_order,
          t.order_index as top_order,
          c.id as course_id,
          c.name as course_name
         FROM topics t
         JOIN modules m ON t.module_id = m.id
         JOIN courses c ON m.course_id = c.id
         WHERE c.id = ? 
           AND t.is_completed = 0
         ORDER BY m.order_index ASC, t.order_index ASC
         LIMIT 6;`,
        [courseId]
      );

      if (rows && rows.length > 0) {
        candidateTopicsByCourse[courseId] = rows;
      }
    }

    // Round-robin selection across prioritized courses to guarantee balanced learning
    const selectedTopics: any[] = [];
    let currentPlannedMinutes = 0;
    let round = 0;
    const maxRounds = 10;
    let hasAvailable = true;

    while (currentPlannedMinutes < availableMinutes && hasAvailable && round < maxRounds) {
      hasAvailable = false;
      for (const courseId of priorities) {
        const coursePool = candidateTopicsByCourse[courseId] || [];
        if (coursePool.length > round) {
          const candidate = coursePool[round];
          const estMin = candidate.estimated_minutes || 25;

          // Check if we can fit or if this is the first item
          if (currentPlannedMinutes + estMin <= availableMinutes + 15 || selectedTopics.length === 0) {
            selectedTopics.push(candidate);
            currentPlannedMinutes += estMin;
            hasAvailable = true;
          }
          if (currentPlannedMinutes >= availableMinutes) {
            break;
          }
        }
      }
      round++;
    }

    // If still empty, grab any uncompleted topics across any active course
    if (selectedTopics.length === 0) {
      const fallbackRows = await db.getAllAsync<any>(
        `SELECT 
          t.id as topic_id,
          t.title as topic_title,
          COALESCE(t.estimated_minutes, 25) as estimated_minutes,
          m.id as module_id,
          m.title as module_title,
          c.id as course_id,
          c.name as course_name
         FROM topics t
         JOIN modules m ON t.module_id = m.id
         JOIN courses c ON m.course_id = c.id
         WHERE t.is_completed = 0
         ORDER BY c.order_index ASC, m.order_index ASC, t.order_index ASC
         LIMIT 4;`
      );
      selectedTopics.push(...fallbackRows);
    }

    const payload = selectedTopics.map((s) => ({
      courseId: s.course_id,
      moduleId: s.module_id,
      topicId: s.topic_id,
      plannedMinutes: s.estimated_minutes || 25,
    }));

    return await this.createOrUpdateDailyPlan({
      dateStr,
      plannedMinutes: currentPlannedMinutes,
      topics: payload,
    });
  }

  // =========================================================================
  // 3. WEEKLY STUDY PLANS & TARGETS
  // =========================================================================

  async getWeeklyPlan(weekStartStr?: string): Promise<StudyPlan | null> {
    const db = await dbManager.getDatabase();
    const bounds = getWeekBounds(weekStartStr ? new Date(weekStartStr) : new Date());
    const row = await db.getFirstAsync<any>(
      `SELECT * FROM study_plans WHERE plan_type = 'WEEKLY' AND week_start = ?;`,
      [bounds.weekStart]
    );

    if (!row) return null;

    return {
      id: row.id,
      planType: 'WEEKLY',
      weekStart: row.week_start,
      weekEnd: row.week_end,
      plannedMinutes: row.planned_minutes,
      completedMinutes: row.completed_minutes,
      plannedTopics: row.planned_topics,
      completedTopics: row.completed_topics,
      isRestDay: false,
      status: row.status as PlanStatus,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getWeeklyDayBreakdown(weekStartStr?: string): Promise<WeeklyPlanDay[]> {
    const db = await dbManager.getDatabase();
    const bounds = getWeekBounds(weekStartStr ? new Date(weekStartStr) : new Date());
    const startDate = new Date(bounds.weekStart);

    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const result: WeeklyPlanDay[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = formatDateString(d);

      const dayPlan = await db.getFirstAsync<any>(
        `SELECT * FROM study_plans WHERE plan_type = 'DAILY' AND date = ?;`,
        [dateStr]
      );

      const plannedMinutes = dayPlan?.planned_minutes || 0;
      const completedMinutes = dayPlan?.completed_minutes || 0;
      const plannedTopics = dayPlan?.planned_topics || 0;
      const completedTopics = dayPlan?.completed_topics || 0;
      const isRestDay = dayPlan?.is_rest_day === 1;

      let pct = 0;
      if (plannedMinutes > 0) {
        pct = Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100));
      } else if (completedMinutes > 0) {
        pct = 100;
      }

      result.push({
        dayName: dayNames[i],
        dateStr,
        plannedMinutes,
        completedMinutes,
        plannedTopics,
        completedTopics,
        isRestDay,
        progressPercentage: pct,
      });
    }

    return result;
  }

  async createOrUpdateWeeklyGoal(params: {
    weekStartStr?: string;
    targetHours: number;
    targetTopics?: number;
    courseIds?: string[];
  }): Promise<StudyGoal> {
    const db = await dbManager.getDatabase();
    const bounds = getWeekBounds(params.weekStartStr ? new Date(params.weekStartStr) : new Date());
    const now = getCurrentTimestamp();
    const goalId = `goal_wk_${bounds.weekStart}`;

    const title = `Weekly Study Target (${params.targetHours}h)`;
    const description = `Complete ${params.targetHours} hours of focused studying this week.`;
    const targetMinutes = params.targetHours * 60;

    // Check existing actual progress for this week
    const dayStats = await this.getWeeklyDayBreakdown(bounds.weekStart);
    const actualMinutes = dayStats.reduce((sum, d) => sum + d.completedMinutes, 0);

    const status: GoalStatus = actualMinutes >= targetMinutes ? 'COMPLETED' : 'IN_PROGRESS';

    await db.runAsync(
      `INSERT OR REPLACE INTO study_goals (
        id, goal_type, period, title, description, target_value, current_value,
        unit, start_date, end_date, status, created_at, completed_at
      ) VALUES (?, 'TIME_GOAL', 'WEEKLY', ?, ?, ?, ?, 'minutes', ?, ?, ?, ?, ?);`,
      [
        goalId,
        title,
        description,
        targetMinutes,
        actualMinutes,
        bounds.weekStart,
        bounds.weekEnd,
        status,
        now,
        status === 'COMPLETED' ? now : null,
      ]
    );

    // Also update/create weekly study plan row
    const planId = `plan_wk_${bounds.weekStart}`;
    await db.runAsync(
      `INSERT OR REPLACE INTO study_plans (
        id, plan_type, week_start, week_end, planned_minutes, completed_minutes,
        planned_topics, completed_topics, is_rest_day, status, created_at, updated_at
      ) VALUES (?, 'WEEKLY', ?, ?, ?, ?, ?, 0, 0, ?, ?, ?);`,
      [
        planId,
        bounds.weekStart,
        bounds.weekEnd,
        targetMinutes,
        actualMinutes,
        params.targetTopics || 15,
        status,
        now,
        now,
      ]
    );

    return (await this.getGoalById(goalId))!;
  }

  // =========================================================================
  // 4. MONTHLY STUDY PLANS & ROADMAP
  // =========================================================================

  async getMonthlyPlan(year?: number, month?: number): Promise<StudyPlan | null> {
    const db = await dbManager.getDatabase();
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;

    const row = await db.getFirstAsync<any>(
      `SELECT * FROM study_plans WHERE plan_type = 'MONTHLY' AND year = ? AND month = ?;`,
      [y, m]
    );

    if (!row) return null;

    return {
      id: row.id,
      planType: 'MONTHLY',
      month: row.month,
      year: row.year,
      plannedMinutes: row.planned_minutes,
      completedMinutes: row.completed_minutes,
      plannedTopics: row.planned_topics,
      completedTopics: row.completed_topics,
      isRestDay: false,
      status: row.status as PlanStatus,
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async getMonthlyWeekProgress(year?: number, month?: number): Promise<MonthlyWeekSummary[]> {
    const db = await dbManager.getDatabase();
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;
    const daysInMonth = new Date(y, m, 0).getDate();

    // 4 standard 7-day blocks + remaining days in week 4 or 5
    const weekRanges = [
      { num: 1, startDay: 1, endDay: 7, label: 'WEEK 1' },
      { num: 2, startDay: 8, endDay: 14, label: 'WEEK 2' },
      { num: 3, startDay: 15, endDay: 21, label: 'WEEK 3' },
      { num: 4, startDay: 22, endDay: Math.min(28, daysInMonth), label: 'WEEK 4' },
    ];

    if (daysInMonth > 28) {
      weekRanges.push({
        num: 5,
        startDay: 29,
        endDay: daysInMonth,
        label: 'WEEK 5',
      });
    }

    const summaries: MonthlyWeekSummary[] = [];

    for (const w of weekRanges) {
      const startStr = `${y}-${String(m).padStart(2, '0')}-${String(w.startDay).padStart(2, '0')}`;
      const endStr = `${y}-${String(m).padStart(2, '0')}-${String(w.endDay).padStart(2, '0')}`;

      const stat = await db.getFirstAsync<any>(
        `SELECT 
          SUM(planned_minutes) as planned_min,
          SUM(completed_minutes) as completed_min
         FROM study_plans
         WHERE plan_type = 'DAILY' AND date >= ? AND date <= ?;`,
        [startStr, endStr]
      );

      const planned = stat?.planned_min || (w.num <= 4 ? 600 : 300);
      const completed = stat?.completed_min || 0;
      const pct = planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;

      summaries.push({
        weekNumber: w.num,
        weekLabel: w.label,
        startDate: startStr,
        endDate: endStr,
        plannedMinutes: planned,
        completedMinutes: completed,
        progressPercentage: pct,
      });
    }

    return summaries;
  }

  async getMonthlySummary(year?: number, month?: number): Promise<{
    year: number;
    month: number;
    monthName: string;
    plannedMinutes: number;
    completedMinutes: number;
    plannedTopics: number;
    completedTopics: number;
    completedModules: number;
    coursesWorkedOnCount: number;
    progressPercentage: number;
  }> {
    const db = await dbManager.getDatabase();
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;
    const startStr = `${y}-${String(m).padStart(2, '0')}-01`;
    const daysInMonth = new Date(y, m, 0).getDate();
    const endStr = `${y}-${String(m).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const planStats = await db.getFirstAsync<any>(
      `SELECT 
        SUM(planned_minutes) as planned_min,
        SUM(completed_minutes) as completed_min,
        SUM(planned_topics) as planned_top,
        SUM(completed_topics) as completed_top
       FROM study_plans
       WHERE plan_type = 'DAILY' AND date >= ? AND date <= ?;`,
      [startStr, endStr]
    );

    const sessionStats = await db.getFirstAsync<any>(
      `SELECT 
        COUNT(DISTINCT course_id) as courses_count,
        COUNT(DISTINCT module_id) as modules_count
       FROM study_sessions
       WHERE started_at >= ? AND started_at <= ?;`,
      [startStr, endStr + 'T23:59:59Z']
    );

    const plannedMinutes = planStats?.planned_min || 2400; // default 40 hours
    const completedMinutes = planStats?.completed_min || 0;
    const plannedTopics = planStats?.planned_top || 80;
    const completedTopics = planStats?.completed_top || 0;
    const completedModules = sessionStats?.modules_count || 0;
    const coursesWorkedOnCount = sessionStats?.courses_count || 0;

    const progressPercentage = plannedMinutes > 0
      ? Math.min(100, Math.round((completedMinutes / plannedMinutes) * 100))
      : 0;

    return {
      year: y,
      month: m,
      monthName: monthNames[m - 1],
      plannedMinutes,
      completedMinutes,
      plannedTopics,
      completedTopics,
      completedModules,
      coursesWorkedOnCount,
      progressPercentage,
    };
  }

  // =========================================================================
  // 5. GOAL SYSTEM
  // =========================================================================

  async getGoals(period?: GoalPeriod, status?: GoalStatus): Promise<StudyGoal[]> {
    const db = await dbManager.getDatabase();
    const conditions: string[] = [];
    const params: any[] = [];

    if (period) {
      conditions.push('period = ?');
      params.push(period);
    }
    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM study_goals ${whereClause} ORDER BY created_at DESC;`,
      params
    );

    return rows.map((r) => ({
      id: r.id,
      goalType: r.goal_type as GoalType,
      period: r.period as GoalPeriod,
      title: r.title,
      description: r.description,
      targetValue: r.target_value,
      currentValue: r.current_value,
      unit: r.unit,
      courseId: r.course_id,
      moduleId: r.module_id,
      startDate: r.start_date,
      endDate: r.end_date,
      status: r.status as GoalStatus,
      createdAt: r.created_at,
      completedAt: r.completed_at,
    }));
  }

  async getGoalById(id: string): Promise<StudyGoal | null> {
    const db = await dbManager.getDatabase();
    const r = await db.getFirstAsync<any>(`SELECT * FROM study_goals WHERE id = ?;`, [id]);
    if (!r) return null;
    return {
      id: r.id,
      goalType: r.goal_type as GoalType,
      period: r.period as GoalPeriod,
      title: r.title,
      description: r.description,
      targetValue: r.target_value,
      currentValue: r.current_value,
      unit: r.unit,
      courseId: r.course_id,
      moduleId: r.module_id,
      startDate: r.start_date,
      endDate: r.end_date,
      status: r.status as GoalStatus,
      createdAt: r.created_at,
      completedAt: r.completed_at,
    };
  }

  async createGoal(goal: {
    goalType: GoalType;
    period: GoalPeriod;
    title: string;
    description?: string;
    targetValue: number;
    unit?: string;
    courseId?: string;
    moduleId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<StudyGoal> {
    const db = await dbManager.getDatabase();
    const id = generateId('goal');
    const now = getCurrentTimestamp();
    const today = new Date();
    const start = goal.startDate || getTodayDateString();
    let end = goal.endDate;

    if (!end) {
      if (goal.period === 'DAILY') {
        end = start;
      } else if (goal.period === 'WEEKLY') {
        end = getWeekBounds(today).weekEnd;
      } else {
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        end = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${lastDay}`;
      }
    }

    const unit = goal.unit || (goal.goalType === 'TIME_GOAL' ? 'minutes' : 'topics');

    await db.runAsync(
      `INSERT INTO study_goals (
        id, goal_type, period, title, description, target_value, current_value,
        unit, course_id, module_id, start_date, end_date, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, 'NOT_STARTED', ?);`,
      [
        id,
        goal.goalType,
        goal.period,
        goal.title,
        goal.description || null,
        goal.targetValue,
        unit,
        goal.courseId || null,
        goal.moduleId || null,
        start,
        end,
        now,
      ]
    );

    return (await this.getGoalById(id))!;
  }

  async evaluateGoals(): Promise<void> {
    const db = await dbManager.getDatabase();
    const todayStr = getTodayDateString();
    const now = getCurrentTimestamp();

    const activeGoals = await db.getAllAsync<any>(
      `SELECT * FROM study_goals WHERE status IN ('NOT_STARTED', 'IN_PROGRESS');`
    );

    for (const g of activeGoals) {
      let currentVal = g.current_value;

      if (g.goal_type === 'TIME_GOAL') {
        const row = await db.getFirstAsync<any>(
          `SELECT SUM(duration_minutes) as total_min 
           FROM study_sessions 
           WHERE date(started_at) >= ? AND date(started_at) <= ?;`,
          [g.start_date, g.end_date]
        );
        currentVal = row?.total_min || 0;
      } else if (g.goal_type === 'TOPIC_GOAL') {
        const row = await db.getFirstAsync<any>(
          `SELECT COUNT(*) as completed_count 
           FROM user_progress 
           WHERE is_completed = 1 AND date(completed_at) >= ? AND date(completed_at) <= ?;`,
          [g.start_date, g.end_date]
        );
        currentVal = row?.completed_count || 0;
      } else if (g.goal_type === 'STREAK_GOAL') {
        currentVal = await this.calculateCurrentStreak();
      }

      let newStatus = g.status;
      let completedAt = g.completed_at;

      if (currentVal >= g.target_value) {
        newStatus = 'COMPLETED';
        completedAt = now;
      } else if (g.end_date < todayStr) {
        newStatus = 'MISSED';
      } else if (currentVal > 0) {
        newStatus = 'IN_PROGRESS';
      }

      await db.runAsync(
        `UPDATE study_goals
         SET current_value = ?,
             status = ?,
             completed_at = ?
         WHERE id = ?;`,
        [currentVal, newStatus, completedAt, g.id]
      );
    }
  }

  // =========================================================================
  // 6. STUDY SESSIONS & TIMER
  // =========================================================================

  async recordStudySession(params: {
    courseId: string;
    moduleId?: string | null;
    topicId?: string | null;
    durationMinutes: number;
    sessionType?: TimerMode;
    status?: string;
    startedAt?: string;
    endedAt?: string;
    notes?: string;
  }): Promise<string> {
    const db = await dbManager.getDatabase();
    const id = generateId('sess');
    const now = getCurrentTimestamp();
    const started = params.startedAt || now;
    const ended = params.endedAt || now;
    const durationSeconds = params.durationMinutes * 60;
    const sessionType = params.sessionType || 'COUNT_DOWN';
    const status = params.status || 'COMPLETED';

    await db.runAsync(
      `INSERT INTO study_sessions (
        id, course_id, module_id, topic_id, started_at, ended_at,
        duration_seconds, planned_duration_seconds, status, created_at, session_type, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        params.courseId,
        params.moduleId || null,
        params.topicId || null,
        started,
        ended,
        durationSeconds,
        durationSeconds,
        status,
        now,
        sessionType,
        params.notes || null,
      ]
    );

    // Update study_plan_items for today if matching topic found
    const todayStr = getTodayDateString();
    if (params.topicId) {
      const plan = await this.getDailyPlan(todayStr);
      if (plan) {
        const item = plan.items?.find((i) => i.topicId === params.topicId);
        if (item) {
          await db.runAsync(
            `UPDATE study_plan_items 
             SET actual_minutes = actual_minutes + ? 
             WHERE id = ?;`,
            [params.durationMinutes, item.id]
          );
          await this.recalculatePlanTotals(plan.id);
        }
      }
    }

    // Add activity log
    await activityRepository.recordActivity({
      courseId: params.courseId,
      moduleId: params.moduleId,
      topicId: params.topicId,
      activityType: 'STUDY_SESSION_COMPLETED',
    });

    await this.evaluateGoals();
    return id;
  }

  async getStudyHistory(limit: number = 30): Promise<StudySessionHistoryItem[]> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT 
        ss.id,
        ss.course_id,
        c.name as course_name,
        ss.module_id,
        m.title as module_title,
        ss.topic_id,
        t.title as topic_title,
        ROUND(ss.duration_seconds / 60.0) as duration_minutes,
        ss.started_at,
        ss.session_type,
        ss.status,
        ss.notes
       FROM study_sessions ss
       LEFT JOIN courses c ON ss.course_id = c.id
       LEFT JOIN modules m ON ss.module_id = m.id
       LEFT JOIN topics t ON ss.topic_id = t.id
       WHERE ss.status = 'COMPLETED'
       ORDER BY ss.started_at DESC
       LIMIT ?;`,
      [limit]
    );

    return rows.map((r) => ({
      id: r.id,
      courseId: r.course_id,
      courseName: r.course_name || r.course_id || 'Study Session',
      moduleId: r.module_id,
      moduleTitle: r.module_title || '',
      topicId: r.topic_id,
      topicTitle: r.topic_title || 'Topic Study',
      durationMinutes: Math.max(1, Math.round(r.duration_minutes || 0)),
      date: r.started_at ? r.started_at.split('T')[0] : getTodayDateString(),
      sessionType: (r.session_type as TimerMode) || 'COUNT_DOWN',
      status: 'completed',
      notes: r.notes,
    }));
  }

  // =========================================================================
  // 7. STUDY PREFERENCES
  // =========================================================================

  async getStudyPreferences(): Promise<StudyPreferences> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<any>(
      `SELECT key, value FROM app_settings WHERE key LIKE 'study_pref_%';`
    );
    const map: Record<string, string> = {};
    rows.forEach((r) => {
      map[r.key] = r.value;
    });

    let preferredCourses = ['python', 'aptitude', 'reasoning', 'verbal_english', 'english_speaking'];
    let restDays = ['Sunday'];

    try {
      if (map['study_pref_preferred_courses']) {
        preferredCourses = JSON.parse(map['study_pref_preferred_courses']);
      }
      if (map['study_pref_rest_days']) {
        restDays = JSON.parse(map['study_pref_rest_days']);
      }
    } catch {
      // safe fallback
    }

    return {
      dailyMinutes: parseInt(map['study_pref_daily_minutes'] || '120', 10),
      weeklyMinutes: parseInt(map['study_pref_weekly_minutes'] || '600', 10),
      monthlyMinutes: parseInt(map['study_pref_monthly_minutes'] || '2400', 10),
      preferredCourses,
      preferredSessionMinutes: parseInt(map['study_pref_preferred_session_minutes'] || '25', 10),
      automaticPlanEnabled: map['study_pref_automatic_plan_enabled'] !== 'false',
      carryForwardEnabled: map['study_pref_carry_forward_enabled'] !== 'false',
      restDays,
    };
  }

  async updateStudyPreferences(prefs: Partial<StudyPreferences>): Promise<void> {
    const db = await dbManager.getDatabase();
    const now = getCurrentTimestamp();

    if (prefs.dailyMinutes !== undefined) {
      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('study_pref_daily_minutes', ?, ?);`,
        [String(prefs.dailyMinutes), now]
      );
    }
    if (prefs.weeklyMinutes !== undefined) {
      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('study_pref_weekly_minutes', ?, ?);`,
        [String(prefs.weeklyMinutes), now]
      );
    }
    if (prefs.monthlyMinutes !== undefined) {
      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('study_pref_monthly_minutes', ?, ?);`,
        [String(prefs.monthlyMinutes), now]
      );
    }
    if (prefs.preferredCourses !== undefined) {
      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('study_pref_preferred_courses', ?, ?);`,
        [JSON.stringify(prefs.preferredCourses), now]
      );
    }
    if (prefs.preferredSessionMinutes !== undefined) {
      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('study_pref_preferred_session_minutes', ?, ?);`,
        [String(prefs.preferredSessionMinutes), now]
      );
    }
    if (prefs.automaticPlanEnabled !== undefined) {
      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('study_pref_automatic_plan_enabled', ?, ?);`,
        [prefs.automaticPlanEnabled ? 'true' : 'false', now]
      );
    }
    if (prefs.carryForwardEnabled !== undefined) {
      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('study_pref_carry_forward_enabled', ?, ?);`,
        [prefs.carryForwardEnabled ? 'true' : 'false', now]
      );
    }
    if (prefs.restDays !== undefined) {
      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value, updated_at) VALUES ('study_pref_rest_days', ?, ?);`,
        [JSON.stringify(prefs.restDays), now]
      );
    }
  }

  // =========================================================================
  // 8. INTERACTIVE CALENDAR HISTORY
  // =========================================================================

  async getCalendarHistory(
    year?: number,
    month?: number
  ): Promise<{
    dateStr: string;
    dayNumber: number;
    plannedMinutes: number;
    completedMinutes: number;
    plannedTopics: number;
    completedTopics: number;
    isRestDay: boolean;
    status: PlanStatus;
  }[]> {
    const db = await dbManager.getDatabase();
    const now = new Date();
    const y = year || now.getFullYear();
    const m = month || now.getMonth() + 1;
    const daysInMonth = new Date(y, m, 0).getDate();

    const startStr = `${y}-${String(m).padStart(2, '0')}-01`;
    const endStr = `${y}-${String(m).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;

    const plans = await db.getAllAsync<any>(
      `SELECT * FROM study_plans 
       WHERE plan_type = 'DAILY' AND date >= ? AND date <= ?;`,
      [startStr, endStr]
    );

    const planMap = new Map<string, any>();
    plans.forEach((p) => planMap.set(p.date, p));

    const result = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const p = planMap.get(dateStr);

      result.push({
        dateStr,
        dayNumber: day,
        plannedMinutes: p?.planned_minutes || 0,
        completedMinutes: p?.completed_minutes || 0,
        plannedTopics: p?.planned_topics || 0,
        completedTopics: p?.completed_topics || 0,
        isRestDay: p?.is_rest_day === 1,
        status: (p?.status as PlanStatus) || 'NOT_STARTED',
      });
    }

    return result;
  }

  // =========================================================================
  // 9. STREAK BASED ON STUDY SESSIONS HISTORY
  // =========================================================================

  async calculateCurrentStreak(): Promise<number> {
    const db = await dbManager.getDatabase();
    const rows = await db.getAllAsync<{ day: string }>(
      `SELECT DISTINCT date(started_at) as day 
       FROM study_sessions 
       WHERE status = 'COMPLETED'
       ORDER BY day DESC;`
    );

    if (rows.length === 0) return 0;

    const todayStr = getTodayDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = formatDateString(yesterdayDate);

    const dates = rows.map((r) => r.day);
    // Streak only valid if learned today or yesterday
    if (!dates.includes(todayStr) && !dates.includes(yesterdayStr)) {
      return 0;
    }

    let streak = 0;
    let expected = new Date(dates[0]);

    for (let i = 0; i < dates.length; i++) {
      const actualStr = dates[i];
      const expectedStr = formatDateString(expected);

      if (actualStr === expectedStr) {
        streak++;
        expected.setDate(expected.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}

export const studyPlanRepository = new StudyPlanRepository();
