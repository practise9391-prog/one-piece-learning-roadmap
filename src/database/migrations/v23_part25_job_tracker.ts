import { SQLiteDatabase } from 'expo-sqlite';

export const v23_part25_job_tracker = {
  version: 23,
  name: 'v23_part25_job_tracker',
  up: async (db: SQLiteDatabase): Promise<void> => {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS job_opportunities (
        id TEXT PRIMARY KEY NOT NULL,
        company_name TEXT NOT NULL,
        job_title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'SAVED',
        created_at TEXT NOT NULL
      );
    `);
  },
};
