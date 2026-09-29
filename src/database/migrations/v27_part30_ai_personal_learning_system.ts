import { SQLiteDatabase } from 'expo-sqlite';

export const v27_part30_ai_personal_learning_system = {
  version: 27,
  name: 'v27_part30_ai_personal_learning_system',
  up: async (db: SQLiteDatabase): Promise<void> => {
    const now = new Date().toISOString();

    // 1. Create ai_code_snapshots table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ai_code_snapshots (
        id TEXT PRIMARY KEY NOT NULL,
        conversation_id TEXT NOT NULL,
        title TEXT NOT NULL,
        code TEXT NOT NULL,
        language TEXT NOT NULL,
        active_line INTEGER DEFAULT 1,
        execution_state_json TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_aics_conv ON ai_code_snapshots(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_aics_created ON ai_code_snapshots(created_at DESC);
    `);

    // 2. Create ai_learning_preferences table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ai_learning_preferences (
        id TEXT PRIMARY KEY NOT NULL,
        provider TEXT NOT NULL DEFAULT 'AUTOMATIC',
        model TEXT NOT NULL DEFAULT 'AUTOMATIC',
        mode TEXT NOT NULL DEFAULT 'BALANCED',
        explanation_style TEXT NOT NULL DEFAULT 'SIMPLE',
        teaching_style TEXT NOT NULL DEFAULT 'GUIDE_ME',
        save_conversations INTEGER NOT NULL DEFAULT 1,
        save_voice_transcripts INTEGER NOT NULL DEFAULT 1,
        save_code_snapshots INTEGER NOT NULL DEFAULT 1,
        send_code_to_ai INTEGER NOT NULL DEFAULT 1,
        updated_at TEXT NOT NULL
      );
    `);

    // 3. Seed default preference record
    await db.runAsync(
      `INSERT OR IGNORE INTO ai_learning_preferences (
        id, provider, model, mode, explanation_style, teaching_style,
        save_conversations, save_voice_transcripts, save_code_snapshots, send_code_to_ai, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      ['default', 'AUTOMATIC', 'AUTOMATIC', 'BALANCED', 'SIMPLE', 'GUIDE_ME', 1, 1, 1, 1, now]
    );
  },
};
