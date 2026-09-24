import { SQLiteDatabase } from 'expo-sqlite';
import { v1_initial_schema } from './v1_initial_schema';
import { v2_add_topics_and_seed_roadmaps } from './v2_add_topics_and_seed_roadmaps';
import { v3_module_learning_enhancements } from './v3_module_learning_enhancements';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

export const MIGRATIONS: Migration[] = [
  v1_initial_schema,
  v2_add_topics_and_seed_roadmaps,
  v3_module_learning_enhancements,
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON;');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedRows = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC;'
  );
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  for (const migration of MIGRATIONS) {
    if (!appliedVersions.has(migration.version)) {
      console.log(`[Database Migration] Applying migration v${migration.version}: ${migration.name}`);
      await migration.up(db);
      await db.runAsync(
        'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);',
        [migration.version, migration.name, new Date().toISOString()]
      );
      console.log(`[Database Migration] Successfully applied v${migration.version}: ${migration.name}`);
    }
  }
}
