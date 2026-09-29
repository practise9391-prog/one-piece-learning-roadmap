import { SQLiteDatabase } from 'expo-sqlite';
import { v1_initial_schema } from './v1_initial_schema';
import { v2_add_topics_and_seed_roadmaps } from './v2_add_topics_and_seed_roadmaps';
import { v3_module_learning_enhancements } from './v3_module_learning_enhancements';
import { v4_course_journey_and_completion } from './v4_course_journey_and_completion';
import { v5_learning_activity } from './v5_learning_activity';
import { v6_practice_hub } from './v6_practice_hub';
import { v7_news_system } from './v7_news_system';
import { v8_motivation_and_goals } from './v8_motivation_and_goals';
import { v9_settings_and_preferences } from './v9_settings_and_preferences';
import { v10_local_notifications } from './v10_local_notifications';
import { v11_focus_study_sessions } from './v11_focus_study_sessions';
import { v12_part14_roadmaps_and_speaking } from './v12_part14_roadmaps_and_speaking';
import { v13_part15_daily_learning } from './v13_part15_daily_learning';
import { v14_part16_study_planning } from './v14_part16_study_planning';
import { v15_part17_study_notifications } from './v15_part17_study_notifications';
import { v16_part18_progress_analytics } from './v16_part18_progress_analytics';
import { v17_part19_gamification } from './v17_part19_gamification';
import { v18_part20_practice_coding } from './v18_part20_practice_coding';
import { v19_part21_ai_assistant } from './v19_part21_ai_assistant';
import { v20_part22_smart_learning } from './v20_part22_smart_learning';
import { v21_part23_career_prep } from './v21_part23_career_prep';
import { v22_part24_project_builder } from './v22_part24_project_builder';
import { v23_part25_job_tracker } from './v23_part25_job_tracker';
import { v24_part26_system_design_course } from './v24_part26_system_design_course';
import { v25_part27_react_and_algorithms_courses } from './v25_part27_react_and_algorithms_courses';
import { v26_part29_code_workspace_and_debugger } from './v26_part29_code_workspace_and_debugger';
import { v27_part30_ai_personal_learning_system } from './v27_part30_ai_personal_learning_system';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

export const MIGRATIONS: Migration[] = [
  v1_initial_schema,
  v2_add_topics_and_seed_roadmaps,
  v3_module_learning_enhancements,
  v4_course_journey_and_completion,
  v5_learning_activity,
  v6_practice_hub,
  v7_news_system,
  v8_motivation_and_goals,
  v9_settings_and_preferences,
  v10_local_notifications,
  v11_focus_study_sessions,
  v12_part14_roadmaps_and_speaking,
  v13_part15_daily_learning,
  v14_part16_study_planning,
  v15_part17_study_notifications,
  v16_part18_progress_analytics,
  v17_part19_gamification,
  v18_part20_practice_coding,
  v19_part21_ai_assistant,
  v20_part22_smart_learning,
  v21_part23_career_prep,
  v22_part24_project_builder,
  v23_part25_job_tracker,
  v24_part26_system_design_course,
  v25_part27_react_and_algorithms_courses,
  v26_part29_code_workspace_and_debugger,
  v27_part30_ai_personal_learning_system,
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Ensure schema_migrations table exists
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  // Query currently applied migrations
  const appliedRows = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC;'
  );
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  // Run pending migrations in sequence
  for (const migration of MIGRATIONS) {
    if (!appliedVersions.has(migration.version)) {
      console.log(`Running migration v${migration.version}: ${migration.name}...`);
      await migration.up(db);
      await db.runAsync(
        'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);',
        [migration.version, migration.name, new Date().toISOString()]
      );
      console.log(`Migration v${migration.version} applied successfully.`);
    }
  }
}
