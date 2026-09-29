import * as SQLite from 'expo-sqlite';
import { ExecutionResult } from '../../models/PracticeTask';
import { ExecutionProvider } from './types';

/**
 * IsolatedSqlExecutionProvider: Secure local SQL practice runner.
 * Completely isolated from the main application database.
 * Seeds sandboxed practice tables (employees, departments, orders).
 */
export class IsolatedSqlExecutionProvider implements ExecutionProvider {
  name = 'IsolatedSqlExecutionProvider';
  private sandboxDb: SQLite.SQLiteDatabase | null = null;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  private async getSandboxDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.sandboxDb) {
      this.sandboxDb = await SQLite.openDatabaseAsync('edu_app_sql_practice_sandbox.db');
      await this.initSandboxTables(this.sandboxDb);
    }
    return this.sandboxDb;
  }

  private async initSandboxTables(db: SQLite.SQLiteDatabase): Promise<void> {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        salary INTEGER NOT NULL,
        department_id INTEGER,
        hire_date TEXT NOT NULL,
        FOREIGN KEY (department_id) REFERENCES departments(id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY,
        customer_name TEXT NOT NULL,
        amount REAL NOT NULL,
        order_date TEXT NOT NULL,
        status TEXT NOT NULL
      );
    `);

    // Seed sample data if empty
    const empCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM employees;');
    if (!empCount || empCount.count === 0) {
      await db.execAsync(`
        INSERT INTO departments (id, name, location) VALUES
          (1, 'Engineering', 'Building A'),
          (2, 'Design', 'Building B'),
          (3, 'Marketing', 'Building C'),
          (4, 'Finance', 'Building A');

        INSERT INTO employees (id, name, salary, department_id, hire_date) VALUES
          (101, 'Luffy Monkey', 95000, 1, '2023-01-15'),
          (102, 'Zoro Roronoa', 88000, 1, '2023-02-01'),
          (103, 'Nami Orange', 82000, 4, '2023-03-10'),
          (104, 'Usopp Sniper', 62000, 3, '2023-04-05'),
          (105, 'Sanji Cook', 85000, 2, '2023-05-20'),
          (106, 'Chopper Reindeer', 55000, 1, '2023-06-12'),
          (107, 'Robin Nico', 91000, 3, '2023-07-01');

        INSERT INTO orders (id, customer_name, amount, order_date, status) VALUES
          (1, 'East Blue Traders', 450.00, '2024-01-10', 'COMPLETED'),
          (2, 'Grand Line Marine', 1200.50, '2024-01-12', 'COMPLETED'),
          (3, 'Wano Craftworks', 320.00, '2024-01-15', 'PENDING'),
          (4, 'Alabasta Supplies', 780.00, '2024-01-20', 'COMPLETED'),
          (5, 'Skypiea Dial Co', 150.00, '2024-01-25', 'CANCELLED');
      `);
    }
  }

  async execute(
    language: string,
    sourceCode: string,
    input: string = '',
    timeLimitMs: number = 2000
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const cleanSql = sourceCode.trim().replace(/;+$/, '');

    if (!cleanSql) {
      return {
        status: 'RUNTIME_ERROR',
        stdout: '',
        stderr: 'Empty SQL query.',
        exitCode: 1,
        executionTime: 0,
        memoryUsed: 0,
        errorMessage: 'SQL query cannot be empty.',
      };
    }

    // Safety checks against dangerous system commands
    const lower = cleanSql.toLowerCase();
    if (
      lower.includes('sqlite_master') ||
      lower.includes('sqlite_schema') ||
      lower.includes('pragma') ||
      lower.includes('attach') ||
      lower.includes('detach')
    ) {
      return {
        status: 'RUNTIME_ERROR',
        stdout: '',
        stderr: 'Permission denied: System tables and administrative commands are restricted in practice sandbox.',
        exitCode: 1,
        executionTime: 0,
        memoryUsed: 0,
        errorMessage: 'Administrative and system SQL statements are restricted.',
      };
    }

    try {
      const db = await this.getSandboxDb();
      const rows = await db.getAllAsync<any>(cleanSql);
      const executionTime = (Date.now() - startTime) / 1000;

      // Format output as readable JSON / table string
      const stdout = JSON.stringify(rows, null, 2);

      return {
        status: 'SUCCESS',
        stdout,
        stderr: '',
        exitCode: 0,
        executionTime,
        memoryUsed: 2048,
      };
    } catch (err: any) {
      const executionTime = (Date.now() - startTime) / 1000;
      return {
        status: 'COMPILE_ERROR',
        stdout: '',
        stderr: err?.message || 'SQL syntax error',
        exitCode: 1,
        executionTime,
        memoryUsed: 0,
        errorMessage: err?.message || 'SQL syntax error',
      };
    }
  }
}
