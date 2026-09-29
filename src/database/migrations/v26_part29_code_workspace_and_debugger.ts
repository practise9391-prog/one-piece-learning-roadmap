import { SQLiteDatabase } from 'expo-sqlite';

export const v26_part29_code_workspace_and_debugger = {
  version: 26,
  name: 'v26_part29_code_workspace_and_debugger',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Saved Code Snippets
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS saved_code_snippets (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        course_id TEXT,
        topic_id TEXT,
        task_id TEXT,
        language TEXT NOT NULL DEFAULT 'python',
        code TEXT NOT NULL,
        learning_mode TEXT NOT NULL DEFAULT 'NORMAL',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_scs_user ON saved_code_snippets(user_id);
      CREATE INDEX IF NOT EXISTS idx_scs_lang ON saved_code_snippets(language);
      CREATE INDEX IF NOT EXISTS idx_scs_topic ON saved_code_snippets(topic_id);
    `);

    // 2. Persistent Debug Sessions
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS debug_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        task_id TEXT,
        topic_id TEXT,
        course_id TEXT,
        language TEXT NOT NULL DEFAULT 'python',
        code TEXT NOT NULL,
        current_step INTEGER NOT NULL DEFAULT 0,
        total_steps INTEGER NOT NULL DEFAULT 0,
        trace_summary TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_ds_user ON debug_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_ds_task ON debug_sessions(task_id);
    `);

    // 3. Seed initial code snippets for instant classroom exploration
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT OR IGNORE INTO saved_code_snippets (id, title, user_id, course_id, topic_id, language, code, learning_mode, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        'snippet_py_arithmetic',
        'Python Variables & Arithmetic',
        'default_user',
        'python',
        'variables',
        'python',
        `a = 10\nb = 20\nc = a + b\nprint(c)`,
        'LEARNING',
        now,
        now,
      ]
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO saved_code_snippets (id, title, user_id, course_id, topic_id, language, code, learning_mode, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        'snippet_py_factorial',
        'Factorial Recursion',
        'default_user',
        'algorithms',
        'recursion',
        'python',
        `def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nresult = factorial(3)\nprint(result)`,
        'DEBUG',
        now,
        now,
      ]
    );

    await db.runAsync(
      `INSERT OR IGNORE INTO saved_code_snippets (id, title, user_id, course_id, topic_id, language, code, learning_mode, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        'snippet_algo_binary_search',
        'Binary Search Algorithm',
        'default_user',
        'algorithms',
        'binary-search',
        'python',
        `arr = [1, 3, 5, 7, 9, 11]\ntarget = 7\nlow = 0\nhigh = len(arr) - 1\nfound = -1\n\nwhile low <= high:\n    mid = (low + high) // 2\n    if arr[mid] == target:\n        found = mid\n        break\n    elif arr[mid] < target:\n        low = mid + 1\n    else:\n        high = mid - 1\n\nprint(found)`,
        'DEBUG',
        now,
        now,
      ]
    );
  },
};
