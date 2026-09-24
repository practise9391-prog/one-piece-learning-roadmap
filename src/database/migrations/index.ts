import { SQLiteDatabase } from 'expo-sqlite';
import { v1_initial_schema } from './v1_initial_schema';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}

export const MIGRATIONS: Migration[] = [
  v1_initial_schema,
  // Future migrations:
  // v2_add_certificates.ts
  // v3_add_streak_and_points.ts
];

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  // Always enable foreign key enforcement in SQLite
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create schema_migrations tracking table if it doesn't exist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  // Get list of already executed versions
  const appliedRows = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM schema_migrations ORDER BY version ASC;'
  );
  const appliedVersions = new Set(appliedRows.map((r) => r.version));

  // Execute all unapplied migrations in ascending order
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

