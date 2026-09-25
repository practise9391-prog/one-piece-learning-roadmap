import { DatabaseManager } from '../database/DatabaseManager';
import {
  DatabaseStatistics,
  BackupPayload,
  BackupValidationResult,
  UserProfile,
} from '../models/Settings';

export class DataManagementRepository {
  private db = DatabaseManager.getInstance();

  /**
   * Retrieves live item counts and storage estimation directly from SQLite tables.
   */
  async getDatabaseStatistics(): Promise<DatabaseStatistics> {
    const database = await this.db.getDatabase();

    const [
      coursesRow,
      modulesRow,
      topicsRow,
      notesRow,
      practiceRow,
      newsRow,
      activityRow,
      newsBytesRow,
    ] = await Promise.all([
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM courses;'),
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM modules;'),
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM topics;'),
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM notes;'),
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM practice_questions;'),
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM news_articles;'),
      database.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM learning_activity;'),
      database.getFirstAsync<{ totalBytes: number }>(`
        SELECT COALESCE(SUM(LENGTH(title) + LENGTH(COALESCE(content, '')) + LENGTH(COALESCE(description, ''))), 0) as totalBytes
        FROM news_articles;
      `),
    ]);

    const newsCount = newsRow?.count || 0;
    const newsBytes = (newsBytesRow?.totalBytes || 0) + newsCount * 256;

    // Approximate database size based on entity counts and typical SQLite row footprints
    const approxDbBytes =
      (coursesRow?.count || 0) * 1024 +
      (modulesRow?.count || 0) * 512 +
      (topicsRow?.count || 0) * 384 +
      (notesRow?.count || 0) * 1024 +
      (practiceRow?.count || 0) * 1536 +
      newsBytes +
      (activityRow?.count || 0) * 256;

    const mbSize = (approxDbBytes / (1024 * 1024)).toFixed(1);

    return {
      courses_count: coursesRow?.count || 0,
      modules_count: modulesRow?.count || 0,
      topics_count: topicsRow?.count || 0,
      notes_count: notesRow?.count || 0,
      practice_questions_count: practiceRow?.count || 0,
      news_articles_count: newsCount,
      learning_activities_count: activityRow?.count || 0,
      news_cache_bytes: newsBytes,
      database_size_desc: `${mbSize} MB (Local SQLite Database)`,
    };
  }

  /**
   * Generates a complete JSON backup payload containing all local user data.
   */
  async exportUserData(): Promise<BackupPayload> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    const [
      profileRow,
      appSettingsRows,
      goalSettingsRows,
      notesRows,
      completedTopicsRows,
      completedModulesRows,
      completedCoursesRows,
      activityRows,
      attemptsRows,
      practiceBookmarksRows,
      newsBookmarksRows,
      motivationFavoritesRows,
      achievementsRows,
    ] = await Promise.all([
      database.getFirstAsync<UserProfile>('SELECT * FROM user_profile LIMIT 1;'),
      database.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM app_settings;'),
      database.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM goal_settings;'),
      database.getAllAsync('SELECT * FROM notes;'),
      database.getAllAsync<{ id: string; is_completed: number; completed_at: string | null }>(
        'SELECT id, is_completed, completed_at FROM topics WHERE is_completed = 1;'
      ),
      database.getAllAsync<{ id: string; is_completed: number; completed_at: string | null; completed_topics_count: number; status: string }>(
        'SELECT id, is_completed, completed_at, completed_topics_count, status FROM modules WHERE is_completed = 1 OR completed_topics_count > 0;'
      ),
      database.getAllAsync<{ id: string; completed_modules: number; progress_percentage: number; is_completed: number; started_at: string | null; completed_at: string | null }>(
        'SELECT id, completed_modules, progress_percentage, is_completed, started_at, completed_at FROM courses WHERE completed_modules > 0 OR is_completed = 1;'
      ),
      database.getAllAsync('SELECT * FROM learning_activity ORDER BY timestamp ASC;'),
      database.getAllAsync('SELECT * FROM practice_attempts ORDER BY attempted_at ASC;'),
      database.getAllAsync<{ id: string }>('SELECT id FROM practice_questions WHERE is_bookmarked = 1;'),
      database.getAllAsync('SELECT * FROM news_articles WHERE is_bookmarked = 1;'),
      database.getAllAsync<{ id: string }>('SELECT id FROM motivation_entries WHERE is_favorite = 1;'),
      database.getAllAsync('SELECT * FROM achievements WHERE is_unlocked = 1;'),
    ]);

    const appSettingsMap: Record<string, string> = {};
    for (const r of appSettingsRows) {
      appSettingsMap[r.key] = r.value;
    }

    const goalSettingsMap: Record<string, string> = {};
    for (const r of goalSettingsRows) {
      goalSettingsMap[r.key] = r.value;
    }

    const payload: BackupPayload = {
      metadata: {
        backup_version: 1,
        created_at: now,
        app_version: '1.0.0',
        app_name: 'One Piece Learning Roadmap',
      },
      data: {
        user_profile: profileRow || undefined,
        app_settings: appSettingsMap,
        goal_settings: goalSettingsMap,
        notes: notesRows,
        topics_progress: completedTopicsRows,
        modules_progress: completedModulesRows,
        courses_progress: completedCoursesRows,
        learning_activity: activityRows,
        practice_attempts: attemptsRows,
        practice_bookmarks: practiceBookmarksRows.map((p) => p.id),
        news_bookmarks: newsBookmarksRows,
        motivation_favorites: motivationFavoritesRows.map((m) => m.id),
        achievements: achievementsRows,
      },
    };

    return payload;
  }

  /**
   * Validates a backup JSON string without making changes to the database.
   */
  validateBackup(jsonString: string): BackupValidationResult {
    try {
      if (!jsonString || typeof jsonString !== 'string') {
        return { valid: false, error: 'Backup content is empty or invalid.' };
      }

      const parsed = JSON.parse(jsonString);

      if (!parsed || typeof parsed !== 'object') {
        return { valid: false, error: 'Backup data must be a valid JSON object.' };
      }

      if (!parsed.metadata || typeof parsed.metadata !== 'object') {
        return { valid: false, error: 'Missing backup metadata section.' };
      }

      if (typeof parsed.metadata.backup_version !== 'number' || parsed.metadata.backup_version < 1) {
        return { valid: false, error: 'Incompatible or unsupported backup version.' };
      }

      if (!parsed.data || typeof parsed.data !== 'object') {
        return { valid: false, error: 'Missing backup data payload.' };
      }

      const notesCount = Array.isArray(parsed.data.notes) ? parsed.data.notes.length : 0;
      const completedTopics = Array.isArray(parsed.data.topics_progress) ? parsed.data.topics_progress.length : 0;
      const completedModules = Array.isArray(parsed.data.modules_progress) ? parsed.data.modules_progress.length : 0;

      return {
        valid: true,
        backup: parsed as BackupPayload,
        stats: {
          notes_count: notesCount,
          completed_topics: completedTopics,
          completed_modules: completedModules,
          created_at: parsed.metadata.created_at || 'Unknown',
        },
      };
    } catch (err: any) {
      return {
        valid: false,
        error: `JSON parse error: ${err?.message || 'Malformed backup file.'}`,
      };
    }
  }

  /**
   * Imports a backup into the SQLite database.
   * Mode:
   * - 'merge': Merges backup data with existing data.
   * - 'replace': Clears existing progress/notes and replaces with backup data.
   */
  async importBackup(backup: BackupPayload, mode: 'merge' | 'replace' = 'merge'): Promise<{ success: boolean; message: string }> {
    const database = await this.db.getDatabase();
    const data = backup.data;
    const now = new Date().toISOString();

    try {
      // Execute within transaction
      await database.withTransactionAsync(async () => {
        if (mode === 'replace') {
          // Clear existing progress and notes
          await database.runAsync('DELETE FROM notes;');
          await database.runAsync('DELETE FROM learning_activity;');
          await database.runAsync('DELETE FROM practice_attempts;');
          await database.runAsync('DELETE FROM daily_goals;');
          await database.runAsync('DELETE FROM study_sessions;');
          await database.runAsync('UPDATE topics SET is_completed = 0, completed_at = NULL;');
          await database.runAsync("UPDATE modules SET is_completed = 0, completed_at = NULL, completed_topics_count = 0, status = 'not_started';");
          await database.runAsync('UPDATE courses SET completed_modules = 0, progress_percentage = 0.0, is_completed = 0, started_at = NULL, completed_at = NULL, introduction_completed = 0;');
          await database.runAsync('UPDATE practice_questions SET times_attempted = 0, times_correct = 0, is_bookmarked = 0;');
          await database.runAsync('UPDATE achievements SET is_unlocked = 0, unlocked_at = NULL, progress_value = 0;');
          await database.runAsync('UPDATE motivation_entries SET is_favorite = 0;');
        }

        // 1. User Profile
        if (data.user_profile) {
          await database.runAsync(
            `INSERT INTO user_profile (id, display_name, avatar_type, created_at, updated_at)
             VALUES ('default_user', ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name, avatar_type = excluded.avatar_type, updated_at = excluded.updated_at;`,
            [
              data.user_profile.display_name || 'Pavan',
              data.user_profile.avatar_type || 'compass',
              data.user_profile.created_at || now,
              now,
            ]
          );
        }

        // 2. App Settings
        if (data.app_settings) {
          for (const [key, value] of Object.entries(data.app_settings)) {
            await database.runAsync(
              `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, ?)
               ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at;`,
              [key, value, now]
            );
          }
        }

        // 3. Goal Settings
        if (data.goal_settings) {
          for (const [key, value] of Object.entries(data.goal_settings)) {
            await database.runAsync(
              `INSERT INTO goal_settings (key, value) VALUES (?, ?)
               ON CONFLICT(key) DO UPDATE SET value = excluded.value;`,
              [key, value]
            );
          }
        }

        // 4. Notes
        if (Array.isArray(data.notes)) {
          for (const note of data.notes) {
            if (!note.id || !note.course_id || !note.note_text) continue;
            await database.runAsync(
              `INSERT INTO notes (id, course_id, module_id, note_text, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)
               ON CONFLICT(id) DO UPDATE SET note_text = excluded.note_text, updated_at = excluded.updated_at;`,
              [
                note.id,
                note.course_id,
                note.module_id || null,
                note.note_text,
                note.created_at || now,
                note.updated_at || now,
              ]
            );
          }
        }

        // 5. Topics Progress
        if (Array.isArray(data.topics_progress)) {
          for (const tp of data.topics_progress) {
            if (tp.id && tp.is_completed) {
              await database.runAsync(
                'UPDATE topics SET is_completed = 1, completed_at = ? WHERE id = ?;',
                [tp.completed_at || now, tp.id]
              );
            }
          }
        }

        // 6. Modules Progress
        if (Array.isArray(data.modules_progress)) {
          for (const mp of data.modules_progress) {
            if (mp.id) {
              await database.runAsync(
                `UPDATE modules SET
                  is_completed = ?,
                  completed_at = ?,
                  completed_topics_count = ?,
                  status = ?
                 WHERE id = ?;`,
                [
                  mp.is_completed || 0,
                  mp.completed_at || null,
                  mp.completed_topics_count || 0,
                  mp.status || 'not_started',
                  mp.id,
                ]
              );
            }
          }
        }

        // 7. Courses Progress
        if (Array.isArray(data.courses_progress)) {
          for (const cp of data.courses_progress) {
            if (cp.id) {
              await database.runAsync(
                `UPDATE courses SET
                  completed_modules = ?,
                  progress_percentage = ?,
                  is_completed = ?,
                  started_at = ?,
                  completed_at = ?,
                  introduction_completed = 1
                 WHERE id = ?;`,
                [
                  cp.completed_modules || 0,
                  cp.progress_percentage || 0,
                  cp.is_completed || 0,
                  cp.started_at || null,
                  cp.completed_at || null,
                  cp.id,
                ]
              );
            }
          }
        }

        // 8. Learning Activity
        if (Array.isArray(data.learning_activity)) {
          for (const act of data.learning_activity) {
            if (act.id && act.activity_type) {
              await database.runAsync(
                `INSERT OR IGNORE INTO learning_activity (id, activity_type, course_id, module_id, topic_id, details, timestamp, date_str)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
                [
                  act.id,
                  act.activity_type,
                  act.course_id || null,
                  act.module_id || null,
                  act.topic_id || null,
                  act.details || null,
                  act.timestamp || now,
                  act.date_str || now.split('T')[0],
                ]
              );
            }
          }
        }

        // 9. Practice Attempts
        if (Array.isArray(data.practice_attempts)) {
          for (const att of data.practice_attempts) {
            if (att.id && att.question_id) {
              await database.runAsync(
                `INSERT OR IGNORE INTO practice_attempts (id, question_id, is_correct, selected_index, time_spent_seconds, attempted_at)
                 VALUES (?, ?, ?, ?, ?, ?);`,
                [
                  att.id,
                  att.question_id,
                  att.is_correct ? 1 : 0,
                  att.selected_index ?? null,
                  att.time_spent_seconds || 0,
                  att.attempted_at || now,
                ]
              );
            }
          }
        }

        // 10. Practice Bookmarks
        if (Array.isArray(data.practice_bookmarks)) {
          for (const qid of data.practice_bookmarks) {
            await database.runAsync(
              'UPDATE practice_questions SET is_bookmarked = 1 WHERE id = ?;',
              [qid]
            );
          }
        }

        // 11. News Bookmarks
        if (Array.isArray(data.news_bookmarks)) {
          for (const nb of data.news_bookmarks) {
            if (nb.id && nb.title) {
              await database.runAsync(
                `INSERT INTO news_articles (
                  id, title, description, content, image_url,
                  source_name, source_url, article_url, category,
                  author, published_at, fetched_at, is_read, is_bookmarked
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                ON CONFLICT(id) DO UPDATE SET is_bookmarked = 1;`,
                [
                  nb.id,
                  nb.title,
                  nb.description || null,
                  nb.content || null,
                  nb.image_url || null,
                  nb.source_name || 'Tech Web',
                  nb.source_url || null,
                  nb.article_url || '',
                  nb.category || 'TECH',
                  nb.author || null,
                  nb.published_at || now,
                  now,
                  nb.is_read || 0,
                ]
              );
            }
          }
        }

        // 12. Motivation Favorites
        if (Array.isArray(data.motivation_favorites)) {
          for (const qid of data.motivation_favorites) {
            await database.runAsync(
              'UPDATE motivation_entries SET is_favorite = 1 WHERE id = ?;',
              [qid]
            );
          }
        }

        // 13. Achievements
        if (Array.isArray(data.achievements)) {
          for (const ach of data.achievements) {
            if (ach.id && ach.is_unlocked) {
              await database.runAsync(
                'UPDATE achievements SET is_unlocked = 1, unlocked_at = ? WHERE id = ?;',
                [ach.unlocked_at || now, ach.id]
              );
            }
          }
        }
      });

      return {
        success: true,
        message: mode === 'replace' ? 'Data successfully restored from backup.' : 'Backup data merged successfully.',
      };
    } catch (err: any) {
      console.error('Import backup failed:', err);
      return {
        success: false,
        message: `Import failed: ${err?.message || 'Database transaction rolled back.'}`,
      };
    }
  }

  /**
   * Resets learning progress while preserving course structures, notes, preferences, and bookmarks.
   */
  async resetProgress(): Promise<{ success: boolean; message: string }> {
    const database = await this.db.getDatabase();

    try {
      await database.withTransactionAsync(async () => {
        // Reset topic completions
        await database.runAsync('UPDATE topics SET is_completed = 0, completed_at = NULL;');

        // Reset module completions
        await database.runAsync(
          "UPDATE modules SET is_completed = 0, completed_at = NULL, completed_topics_count = 0, status = 'not_started';"
        );

        // Reset course completions
        await database.runAsync(
          'UPDATE courses SET completed_modules = 0, progress_percentage = 0.0, is_completed = 0, started_at = NULL, completed_at = NULL, introduction_completed = 0;'
        );

        // Delete user progress table entries
        await database.runAsync('DELETE FROM user_progress;');

        // Clear learning activity streak logs
        await database.runAsync('DELETE FROM learning_activity;');

        // Clear practice attempts (preserves practice questions and bookmarks!)
        await database.runAsync('DELETE FROM practice_attempts;');
        await database.runAsync('UPDATE practice_questions SET times_attempted = 0, times_correct = 0;');

        // Reset daily goals
        await database.runAsync('DELETE FROM daily_goals;');

        // Reset study sessions
        await database.runAsync('DELETE FROM study_sessions;');

        // Reset unlocked achievements
        await database.runAsync(
          'UPDATE achievements SET is_unlocked = 0, unlocked_at = NULL, progress_value = 0;'
        );
      });

      return {
        success: true,
        message: 'Learning progress, streaks, and practice attempts have been reset. Your notes and bookmarks remain safe.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Reset failed: ${err?.message || 'Transaction error.'}`,
      };
    }
  }

  /**
   * Permanently wipes user learning data and returns the app to a clean first-launch state.
   */
  async deleteAllData(): Promise<{ success: boolean; message: string }> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();

    try {
      await database.withTransactionAsync(async () => {
        // Wipe notes
        await database.runAsync('DELETE FROM notes;');

        // Wipe progress & activities
        await database.runAsync('UPDATE topics SET is_completed = 0, completed_at = NULL;');
        await database.runAsync("UPDATE modules SET is_completed = 0, completed_at = NULL, completed_topics_count = 0, status = 'not_started';");
        await database.runAsync('UPDATE courses SET completed_modules = 0, progress_percentage = 0.0, is_completed = 0, started_at = NULL, completed_at = NULL, introduction_completed = 0;');
        await database.runAsync('DELETE FROM user_progress;');
        await database.runAsync('DELETE FROM learning_activity;');
        await database.runAsync('DELETE FROM practice_attempts;');
        await database.runAsync('UPDATE practice_questions SET times_attempted = 0, times_correct = 0, is_bookmarked = 0;');
        await database.runAsync('DELETE FROM news_articles;');
        await database.runAsync('DELETE FROM daily_goals;');
        await database.runAsync('DELETE FROM study_sessions;');
        await database.runAsync('DELETE FROM motivation_history;');
        await database.runAsync('UPDATE motivation_entries SET is_favorite = 0;');
        await database.runAsync('UPDATE achievements SET is_unlocked = 0, unlocked_at = NULL, progress_value = 0;');

        // Reset user profile to default
        await database.runAsync(
          `UPDATE user_profile SET display_name = 'Pavan', avatar_type = 'compass', updated_at = ?
           WHERE id = 'default_user';`,
          [now]
        );

        // Reset app_settings to default values
        await database.runAsync(`UPDATE app_settings SET value = 'python', updated_at = ? WHERE key = 'default_course_id';`, [now]);
        await database.runAsync(`UPDATE app_settings SET value = 'true', updated_at = ? WHERE key = 'auto_open_current_module';`, [now]);
        await database.runAsync(`UPDATE app_settings SET value = 'true', updated_at = ? WHERE key = 'auto_scroll_to_current_node';`, [now]);
        await database.runAsync(`UPDATE app_settings SET value = 'true', updated_at = ? WHERE key = 'show_completed_topics';`, [now]);
        await database.runAsync(`UPDATE app_settings SET value = 'true', updated_at = ? WHERE key = 'confirm_before_reset_progress';`, [now]);
        await database.runAsync(`UPDATE app_settings SET value = 'all', updated_at = ? WHERE key = 'default_difficulty';`, [now]);
        await database.runAsync(`UPDATE app_settings SET value = 'ocean', updated_at = ? WHERE key = 'theme_id';`, [now]);
        await database.runAsync(`UPDATE app_settings SET value = 'false', updated_at = ? WHERE key = 'reduced_motion';`, [now]);

        // Reset goal settings
        await database.runAsync(`UPDATE goal_settings SET value = '2' WHERE key = 'topics_per_day';`);
        await database.runAsync(`UPDATE goal_settings SET value = '5' WHERE key = 'practice_per_day';`);
        await database.runAsync(`UPDATE goal_settings SET value = '1' WHERE key = 'modules_per_day';`);
        await database.runAsync(`UPDATE goal_settings SET value = '5' WHERE key = 'weekly_days_target';`);

        // Reset notification preferences and scheduled notifications
        await database.runAsync(
          `UPDATE notification_preferences SET
            notifications_enabled = 1,
            learning_reminder_enabled = 1,
            learning_reminder_time = '19:00',
            goal_reminder_enabled = 1,
            goal_reminder_time = '20:30',
            streak_reminder_enabled = 1,
            streak_reminder_time = '21:00',
            practice_reminder_enabled = 1,
            practice_reminder_time = '18:30',
            motivation_notification_enabled = 1,
            motivation_notification_time = '08:00',
            updated_at = ?
          WHERE id = 'default';`,
          [now]
        );
        await database.runAsync('DELETE FROM scheduled_notifications;');
      });

      // Cancel all active Expo scheduled notifications
      import('../services/NotificationService').then(({ notificationService }) => {
        notificationService.cancelAllNotifications().catch(() => {});
      });

      return {
        success: true,
        message: 'All local data, notes, and progress have been deleted. The application is reset to its initial clean state.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Deletion failed: ${err?.message || 'Transaction error.'}`,
      };
    }
  }
}

export const dataManagementRepository = new DataManagementRepository();
