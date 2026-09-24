import * as SQLite from 'expo-sqlite';
import { SQLiteDatabase } from 'expo-sqlite';
import { runMigrations } from './migrations';

export class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private db: SQLiteDatabase | null = null;
  private readonly dbName: string = 'onepiece_roadmap.db';
  private initialized: boolean = false;
  private initPromise: Promise<SQLiteDatabase> | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initializes the SQLite database and executes any pending migrations.
   * Safe to call multiple times concurrently.
   */
  public async getDatabase(): Promise<SQLiteDatabase> {
    if (this.db && this.initialized) {
      return this.db;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        console.log(`[DatabaseManager] Opening SQLite database "${this.dbName}"...`);
        const database = await SQLite.openDatabaseAsync(this.dbName);
        await runMigrations(database);
        this.db = database;
        this.initialized = true;
        console.log('[DatabaseManager] Database initialized and migrations executed.');
        return database;
      } catch (error) {
        console.error('[DatabaseManager] Failed to initialize database:', error);
        this.initPromise = null;
        throw error;
      }
    })();

    return this.initPromise;
  }

  public isInitialized(): boolean {
    return this.initialized;
  }

  public getDbName(): string {
    return this.dbName;
  }

  /**
   * Closes the active database connection.
   */
  public async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      this.initialized = false;
      this.initPromise = null;
    }
  }
}

export const dbManager = DatabaseManager.getInstance();

