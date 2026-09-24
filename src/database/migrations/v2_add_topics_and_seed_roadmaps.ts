import { SQLiteDatabase } from 'expo-sqlite';
import { ALL_COURSE_ROADMAPS, SeedTopic } from '../seeds/roadmapData';

export const v2_add_topics_and_seed_roadmaps = {
  version: 2,
  name: 'v2_add_topics_and_seed_roadmaps',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Add icon column to modules if it does not already exist
    try {
      await db.execAsync('ALTER TABLE modules ADD COLUMN icon TEXT;');
    } catch {
      // Column might already exist, safe to ignore
    }

    // 2. Create topics table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS topics (
        id TEXT PRIMARY KEY NOT NULL,
        module_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (module_id) REFERENCES modules (id) ON DELETE CASCADE
      );
    `);

    // 3. Create index for performance
    await db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_topics_module_id ON topics(module_id);
    `);

    // 4. Seed modules and topics for all 14 courses using deterministic IDs and INSERT OR IGNORE
    const now = new Date().toISOString();

    for (const courseSeed of ALL_COURSE_ROADMAPS) {
      let moduleOrder = 1;
      for (const mod of courseSeed.modules) {
        const moduleId = `${courseSeed.courseId}_m${moduleOrder}`;

        // Insert module if not already existing (never overwrites existing user progress)
        await db.runAsync(
          `INSERT OR IGNORE INTO modules (
            id, course_id, title, description, order_index, icon,
            is_completed, completed_at, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?);`,
          [
            moduleId,
            courseSeed.courseId,
            mod.title,
            mod.description || '',
            moduleOrder,
            mod.icon || 'book-outline',
            now,
          ]
        );

        // Insert topics for this module
        let topicOrder = 1;
        for (const topicItem of mod.topics) {
          const topicTitle = typeof topicItem === 'string' ? topicItem : topicItem.title;
          const topicDesc = typeof topicItem === 'string' ? '' : (topicItem.description || '');
          const topicId = `${moduleId}_t${topicOrder}`;

          await db.runAsync(
            `INSERT OR IGNORE INTO topics (
              id, module_id, title, description, order_index,
              is_completed, completed_at, created_at
            ) VALUES (?, ?, ?, ?, ?, 0, NULL, ?);`,
            [
              topicId,
              moduleId,
              topicTitle,
              topicDesc,
              topicOrder,
              now,
            ]
          );

          topicOrder++;
        }

        moduleOrder++;
      }
    }

    // 5. Update total_modules for all courses dynamically from seeded modules count
    await db.execAsync(`
      UPDATE courses
      SET total_modules = (
        SELECT COUNT(*) 
        FROM modules 
        WHERE modules.course_id = courses.id
      );

      UPDATE courses
      SET completed_modules = (
        SELECT COUNT(*) 
        FROM modules 
        WHERE modules.course_id = courses.id AND modules.is_completed = 1
      );

      UPDATE courses
      SET progress_percentage = CASE 
        WHEN total_modules > 0 THEN ROUND((CAST(completed_modules AS REAL) / total_modules) * 100.0, 1)
        ELSE 0.0 
      END,
      is_completed = CASE
        WHEN total_modules > 0 AND completed_modules = total_modules THEN 1
        ELSE 0
      END;
    `);
  },
};
