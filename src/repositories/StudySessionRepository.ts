import { DatabaseManager } from '../database/DatabaseManager';
import {
  StudySession,
  FocusSettings,
  FocusCourseStats,
  FocusOverallStats,
  DayStudyTime,
} from '../models/Focus';
import { getLocalDateString } from './ActivityRepository';
import { generateId } from '../utils/idGenerator';

export class StudySessionRepository {
  private db = DatabaseManager.getInstance();

  /**
   * Starts a new study session in SQLite.
   * Throws an error if an active (RUNNING or PAUSED) session already exists.
   */
  async startStudySession(params: {
    courseId: string;
    moduleId?: string | null;
    topicId?: string | null;
    plannedDurationSeconds: number;
  }): Promise<StudySession> {
    const database = await this.db.getDatabase();

    // Guard: Only one active session may exist
    const active = await this.getActiveStudySession();
    if (active) {
      throw new Error(`A focus session is already in progress for ${active.course_name || 'course'}.`);
    }

    const id = generateId('focus');
    const now = new Date().toISOString();

    await database.runAsync(
      `INSERT INTO study_sessions (
        id, course_id, module_id, topic_id, started_at, ended_at,
        duration_seconds, planned_duration_seconds, status,
        paused_at, total_paused_seconds, created_at
      ) VALUES (?, ?, ?, ?, ?, NULL, 0, ?, 'RUNNING', NULL, 0, ?);`,
      [
        id,
        params.courseId,
        params.moduleId || null,
        params.topicId || null,
        now,
        params.plannedDurationSeconds,
        now,
      ]
    );

    const session = await this.getSessionById(id);
    if (!session) {
      throw new Error('Failed to retrieve newly created study session.');
    }
    return session;
  }

  /**
   * Retrieves a study session by ID with joined course/module/topic titles.
   */
  async getSessionById(id: string): Promise<StudySession | null> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<any>(
      `SELECT s.*, 
              c.name AS course_name, 
              m.title AS module_title, 
              t.title AS topic_title
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN modules m ON s.module_id = m.id
       LEFT JOIN topics t ON s.topic_id = t.id
       WHERE s.id = ?;`,
      [id]
    );

    if (!row) return null;
    return this.mapSessionRow(row);
  }

  /**
   * Retrieves the currently active study session, if any.
   */
  async getActiveStudySession(): Promise<StudySession | null> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<any>(
      `SELECT s.*, 
              c.name AS course_name, 
              m.title AS module_title, 
              t.title AS topic_title
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN modules m ON s.module_id = m.id
       LEFT JOIN topics t ON s.topic_id = t.id
       WHERE s.status IN ('RUNNING', 'PAUSED')
       ORDER BY s.started_at DESC
       LIMIT 1;`
    );

    if (!row) return null;
    return this.mapSessionRow(row);
  }

  /**
   * Pauses an active session and stores the timestamp.
   */
  async pauseStudySession(id: string): Promise<StudySession> {
    const database = await this.db.getDatabase();
    const session = await this.getSessionById(id);
    if (!session) throw new Error(`Study session not found: ${id}`);
    if (session.status !== 'RUNNING') return session;

    const now = new Date();
    const nowIso = now.toISOString();

    // Calculate elapsed time up to this pause
    const startMs = new Date(session.started_at).getTime();
    const elapsedSeconds = Math.max(
      0,
      Math.floor((now.getTime() - startMs) / 1000) - session.total_paused_seconds
    );

    await database.runAsync(
      `UPDATE study_sessions
       SET status = 'PAUSED',
           paused_at = ?,
           duration_seconds = ?
       WHERE id = ?;`,
      [nowIso, elapsedSeconds, id]
    );

    return (await this.getSessionById(id))!;
  }

  /**
   * Resumes a paused study session, adding the pause duration to total_paused_seconds.
   */
  async resumeStudySession(id: string): Promise<StudySession> {
    const database = await this.db.getDatabase();
    const session = await this.getSessionById(id);
    if (!session) throw new Error(`Study session not found: ${id}`);
    if (session.status !== 'PAUSED') return session;

    const now = new Date();
    let additionalPause = 0;
    if (session.paused_at) {
      const pausedAtMs = new Date(session.paused_at).getTime();
      additionalPause = Math.max(0, Math.floor((now.getTime() - pausedAtMs) / 1000));
    }

    const newTotalPaused = session.total_paused_seconds + additionalPause;

    await database.runAsync(
      `UPDATE study_sessions
       SET status = 'RUNNING',
           paused_at = NULL,
           total_paused_seconds = ?
       WHERE id = ?;`,
      [newTotalPaused, id]
    );

    return (await this.getSessionById(id))!;
  }

  /**
   * Marks a study session as COMPLETED with the final actual study duration.
   */
  async completeStudySession(id: string, actualDurationSeconds?: number): Promise<StudySession> {
    const database = await this.db.getDatabase();
    const session = await this.getSessionById(id);
    if (!session) throw new Error(`Study session not found: ${id}`);

    const now = new Date();
    const nowIso = now.toISOString();

    let finalDuration = actualDurationSeconds;
    if (finalDuration === undefined) {
      if (session.status === 'PAUSED') {
        finalDuration = session.duration_seconds;
      } else {
        const startMs = new Date(session.started_at).getTime();
        finalDuration = Math.max(
          0,
          Math.floor((now.getTime() - startMs) / 1000) - session.total_paused_seconds
        );
      }
    }

    // Clamp final duration so it never exceeds planned duration unreasonably
    finalDuration = Math.min(finalDuration, session.planned_duration_seconds);

    await database.runAsync(
      `UPDATE study_sessions
       SET status = 'COMPLETED',
           ended_at = ?,
           duration_seconds = ?,
           paused_at = NULL
       WHERE id = ?;`,
      [nowIso, finalDuration, id]
    );

    return (await this.getSessionById(id))!;
  }

  /**
   * Cancels/discards a study session. Does not contribute to study statistics.
   */
  async cancelStudySession(id: string): Promise<void> {
    const database = await this.db.getDatabase();
    const nowIso = new Date().toISOString();

    await database.runAsync(
      `UPDATE study_sessions
       SET status = 'CANCELLED',
           ended_at = ?,
           paused_at = NULL
       WHERE id = ?;`,
      [nowIso, id]
    );
  }

  /**
   * Retrieves today's total completed study time in seconds.
   */
  async getTodayStudyTime(dateStr: string = getLocalDateString()): Promise<number> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(duration_seconds), 0) AS total
       FROM study_sessions
       WHERE status = 'COMPLETED' AND started_at LIKE ?;`,
      [`${dateStr}%`]
    );
    return row?.total || 0;
  }

  /**
   * Retrieves this week's total completed study time in seconds (Mon - Sun).
   */
  async getWeekStudyTime(): Promise<number> {
    const database = await this.db.getDatabase();
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon...
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);
    const mondayStr = getLocalDateString(monday);

    const row = await database.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(duration_seconds), 0) AS total
       FROM study_sessions
       WHERE status = 'COMPLETED' AND started_at >= ?;`,
      [`${mondayStr}T00:00:00.000Z`]
    );
    return row?.total || 0;
  }

  /**
   * Retrieves this month's total completed study time in seconds.
   */
  async getMonthStudyTime(): Promise<number> {
    const database = await this.db.getDatabase();
    const today = new Date();
    const monthPattern = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-%`;

    const row = await database.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(duration_seconds), 0) AS total
       FROM study_sessions
       WHERE status = 'COMPLETED' AND started_at LIKE ?;`,
      [monthPattern]
    );
    return row?.total || 0;
  }

  /**
   * Retrieves all-time total completed study time in seconds.
   */
  async getTotalStudyTime(): Promise<number> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(duration_seconds), 0) AS total
       FROM study_sessions
       WHERE status = 'COMPLETED';`
    );
    return row?.total || 0;
  }

  /**
   * Retrieves today's completed study sessions.
   */
  async getTodayStudySessions(dateStr: string = getLocalDateString()): Promise<StudySession[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT s.*, 
              c.name AS course_name, 
              m.title AS module_title, 
              t.title AS topic_title
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN modules m ON s.module_id = m.id
       LEFT JOIN topics t ON s.topic_id = t.id
       WHERE s.started_at LIKE ?
       ORDER BY s.started_at DESC;`,
      [`${dateStr}%`]
    );

    return rows.map(this.mapSessionRow);
  }

  /**
   * Aggregates completed study time grouped by course.
   */
  async getStudySessionsByCourse(): Promise<FocusCourseStats[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<any>(
      `SELECT s.course_id, 
              COALESCE(c.name, 'General Study') AS course_name, 
              SUM(s.duration_seconds) AS total_seconds,
              COUNT(*) AS session_count
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.id
       WHERE s.status = 'COMPLETED'
       GROUP BY s.course_id
       ORDER BY total_seconds DESC;`
    );

    return rows.map((r) => ({
      course_id: r.course_id,
      course_name: r.course_name,
      total_seconds: r.total_seconds || 0,
      session_count: r.session_count || 0,
    }));
  }

  /**
   * Retrieves total completed study seconds for a specific module.
   */
  async getStudySessionsByModule(moduleId: string): Promise<number> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(duration_seconds), 0) AS total
       FROM study_sessions
       WHERE status = 'COMPLETED' AND module_id = ?;`,
      [moduleId]
    );
    return row?.total || 0;
  }

  /**
   * Retrieves total completed study seconds for a specific topic.
   */
  async getStudySessionsByTopic(topicId: string): Promise<number> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{ total: number }>(
      `SELECT COALESCE(SUM(duration_seconds), 0) AS total
       FROM study_sessions
       WHERE status = 'COMPLETED' AND topic_id = ?;`,
      [topicId]
    );
    return row?.total || 0;
  }

  /**
   * Calculates the average duration (in seconds) of completed study sessions.
   */
  async getAverageSessionDuration(): Promise<number> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{ avg_val: number }>(
      `SELECT COALESCE(AVG(duration_seconds), 0) AS avg_val
       FROM study_sessions
       WHERE status = 'COMPLETED';`
    );
    return Math.round(row?.avg_val || 0);
  }

  /**
   * Retrieves the longest completed session duration (in seconds).
   */
  async getLongestSession(): Promise<number> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{ max_val: number }>(
      `SELECT COALESCE(MAX(duration_seconds), 0) AS max_val
       FROM study_sessions
       WHERE status = 'COMPLETED';`
    );
    return row?.max_val || 0;
  }

  /**
   * Retrieves study history filtered by time range ('today' | 'week' | 'month' | 'all').
   */
  async getStudyTimeHistory(filter: 'today' | 'week' | 'month' | 'all' = 'all'): Promise<StudySession[]> {
    const database = await this.db.getDatabase();
    let whereClause = '';
    const params: string[] = [];

    const today = new Date();
    if (filter === 'today') {
      whereClause = 'WHERE s.started_at LIKE ?';
      params.push(`${getLocalDateString(today)}%`);
    } else if (filter === 'week') {
      const dayOfWeek = today.getDay();
      const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diffToMon);
      whereClause = 'WHERE s.started_at >= ?';
      params.push(`${getLocalDateString(monday)}T00:00:00.000Z`);
    } else if (filter === 'month') {
      whereClause = 'WHERE s.started_at LIKE ?';
      params.push(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-%`);
    }

    const rows = await database.getAllAsync<any>(
      `SELECT s.*, 
              c.name AS course_name, 
              m.title AS module_title, 
              t.title AS topic_title
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN modules m ON s.module_id = m.id
       LEFT JOIN topics t ON s.topic_id = t.id
       ${whereClause}
       ORDER BY s.started_at DESC;`,
      params
    );

    return rows.map(this.mapSessionRow);
  }

  /**
   * Retrieves daily completed study seconds for each of the last 7 days.
   */
  async getStudyTimeByDayLast7Days(): Promise<DayStudyTime[]> {
    const database = await this.db.getDatabase();
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result: DayStudyTime[] = [];

    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = getLocalDateString(d);
      const dayLabel = dayLabels[d.getDay()];

      const row = await database.getFirstAsync<{ total: number }>(
        `SELECT COALESCE(SUM(duration_seconds), 0) AS total
         FROM study_sessions
         WHERE status = 'COMPLETED' AND started_at LIKE ?;`,
        [`${dateStr}%`]
      );

      result.push({
        date: dateStr,
        day_label: dayLabel,
        seconds: row?.total || 0,
      });
    }

    return result;
  }

  /**
   * Retrieves full aggregated focus statistics.
   */
  async getFocusOverallStats(): Promise<FocusOverallStats> {
    const database = await this.db.getDatabase();
    const todayStr = getLocalDateString();

    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);
    const mondayIso = `${getLocalDateString(monday)}T00:00:00.000Z`;
    const monthPattern = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-%`;

    const [
      todayRow,
      weekRow,
      monthRow,
      totalRow,
      avgRow,
      maxRow,
      todayCountRow,
      weekCountRow,
      monthCountRow,
      totalCountRow,
    ] = await Promise.all([
      database.getFirstAsync<{ total: number }>(
        `SELECT COALESCE(SUM(duration_seconds), 0) AS total FROM study_sessions WHERE status = 'COMPLETED' AND started_at LIKE ?;`,
        [`${todayStr}%`]
      ),
      database.getFirstAsync<{ total: number }>(
        `SELECT COALESCE(SUM(duration_seconds), 0) AS total FROM study_sessions WHERE status = 'COMPLETED' AND started_at >= ?;`,
        [mondayIso]
      ),
      database.getFirstAsync<{ total: number }>(
        `SELECT COALESCE(SUM(duration_seconds), 0) AS total FROM study_sessions WHERE status = 'COMPLETED' AND started_at LIKE ?;`,
        [monthPattern]
      ),
      database.getFirstAsync<{ total: number }>(
        `SELECT COALESCE(SUM(duration_seconds), 0) AS total FROM study_sessions WHERE status = 'COMPLETED';`
      ),
      database.getFirstAsync<{ avg_val: number }>(
        `SELECT COALESCE(AVG(duration_seconds), 0) AS avg_val FROM study_sessions WHERE status = 'COMPLETED';`
      ),
      database.getFirstAsync<{ max_val: number }>(
        `SELECT COALESCE(MAX(duration_seconds), 0) AS max_val FROM study_sessions WHERE status = 'COMPLETED';`
      ),
      database.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) AS count FROM study_sessions WHERE status = 'COMPLETED' AND started_at LIKE ?;`,
        [`${todayStr}%`]
      ),
      database.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) AS count FROM study_sessions WHERE status = 'COMPLETED' AND started_at >= ?;`,
        [mondayIso]
      ),
      database.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) AS count FROM study_sessions WHERE status = 'COMPLETED' AND started_at LIKE ?;`,
        [monthPattern]
      ),
      database.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) AS count FROM study_sessions WHERE status = 'COMPLETED';`
      ),
    ]);

    return {
      today_seconds: todayRow?.total || 0,
      week_seconds: weekRow?.total || 0,
      month_seconds: monthRow?.total || 0,
      total_seconds: totalRow?.total || 0,
      today_sessions_count: todayCountRow?.count || 0,
      week_sessions_count: weekCountRow?.count || 0,
      month_sessions_count: monthCountRow?.count || 0,
      total_sessions_count: totalCountRow?.count || 0,
      average_duration_seconds: Math.round(avgRow?.avg_val || 0),
      longest_duration_seconds: maxRow?.max_val || 0,
    };
  }

  /**
   * Retrieves focus settings from app_settings table.
   */
  async getFocusSettings(): Promise<FocusSettings> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<{ key: string; value: string }>(
      "SELECT key, value FROM app_settings WHERE key LIKE 'focus_%';"
    );
    const map = new Map(rows.map((r) => [r.key, r.value]));

    return {
      default_duration: parseInt(map.get('focus_default_duration') || '25', 10),
      auto_start_next: map.get('focus_auto_start_next') === 'true',
      sound_enabled: map.get('focus_sound_enabled') === 'true',
      vibration_enabled: map.get('focus_vibration_enabled') !== 'false', // default true
      show_dashboard_card: map.get('focus_show_dashboard_card') !== 'false', // default true
      min_qualifying_seconds: parseInt(map.get('focus_min_qualifying_seconds') || '300', 10),
    };
  }

  /**
   * Updates focus settings in app_settings table.
   */
  async updateFocusSettings(settings: Partial<FocusSettings>): Promise<void> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    const updates: [string, string][] = [];
    if (settings.default_duration !== undefined) {
      updates.push(['focus_default_duration', String(settings.default_duration)]);
    }
    if (settings.auto_start_next !== undefined) {
      updates.push(['focus_auto_start_next', settings.auto_start_next ? 'true' : 'false']);
    }
    if (settings.sound_enabled !== undefined) {
      updates.push(['focus_sound_enabled', settings.sound_enabled ? 'true' : 'false']);
    }
    if (settings.vibration_enabled !== undefined) {
      updates.push(['focus_vibration_enabled', settings.vibration_enabled ? 'true' : 'false']);
    }
    if (settings.show_dashboard_card !== undefined) {
      updates.push(['focus_show_dashboard_card', settings.show_dashboard_card ? 'true' : 'false']);
    }
    if (settings.min_qualifying_seconds !== undefined) {
      updates.push(['focus_min_qualifying_seconds', String(settings.min_qualifying_seconds)]);
    }

    for (const [k, v] of updates) {
      await database.runAsync(
        `INSERT INTO app_settings (key, value, updated_at)
         VALUES (?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
        [k, v, now]
      );
    }
  }

  private mapSessionRow(r: any): StudySession {
    return {
      id: r.id,
      course_id: r.course_id,
      module_id: r.module_id || null,
      topic_id: r.topic_id || null,
      started_at: r.started_at,
      ended_at: r.ended_at || null,
      duration_seconds: r.duration_seconds || 0,
      planned_duration_seconds: r.planned_duration_seconds || 1500,
      status: r.status,
      paused_at: r.paused_at || null,
      total_paused_seconds: r.total_paused_seconds || 0,
      created_at: r.created_at,
      course_name: r.course_name,
      module_title: r.module_title,
      topic_title: r.topic_title,
    };
  }
}

export const studySessionRepository = new StudySessionRepository();
