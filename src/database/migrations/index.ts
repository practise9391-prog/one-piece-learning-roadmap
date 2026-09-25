import { SQLiteDatabase } from 'expo-sqlite';
import { v1_initial_schema } from './v1_initial_schema';
import { v2_add_topics_and_seed_roadmaps } from './v2_add_topics_and_seed_roadmaps';
import { v3_module_learning_enhancements } from './v3_module_learning_enhancements';
import { v4_course_journey_and_completion } from './v4_course_journey_and_completion';
import { v5_learning_activity } from './v5_learning_activity';
import { v6_practice_hub } from './v6_practice_hub';
import { v7_news_system } from './v7_news_system';
import { v8_motivation_and_goals } from './v8_motivation_and_goals';

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
