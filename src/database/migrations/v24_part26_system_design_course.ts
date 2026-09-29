import { SQLiteDatabase } from 'expo-sqlite';
import { systemDesignRoadmap } from '../seeds/roadmapData/systemDesignRoadmap';

/**
 * Migration v24: System Design Major Course, Level 0 to Level 60 Roadmap Modules & Topics
 */
export const v24_part26_system_design_course = {
  version: 24,
  name: 'v24_part26_system_design_course',
  up: async (db: SQLiteDatabase): Promise<void> => {
    const now = new Date().toISOString();

    // 1. Insert System Design course
    await db.runAsync(
      `INSERT OR IGNORE INTO courses (
        id, name, description, icon, theme, order_index,
        total_modules, completed_modules, progress_percentage,
        is_completed, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0.0, 0, ?, ?);`,
      [
        'system_design',
        'System Design',
        'Master large-scale system architecture: L0 to L60, client-server, distributed systems, caching, scaling, and interview case studies.',
        'git-network-outline',
        'system_design',
        17,
        systemDesignRoadmap.modules.length,
        now,
        now,
      ]
    );

    // 2. Insert all 61 modules (Level 0 through Level 60)
    for (let i = 0; i < systemDesignRoadmap.modules.length; i++) {
      const mod = systemDesignRoadmap.modules[i];
      const moduleId = `system_design_m${i}`;

      await db.runAsync(
        `INSERT OR IGNORE INTO modules (
          id, course_id, title, description, order_index, icon,
          is_completed, completed_at, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?);`,
        [
          moduleId,
          'system_design',
          mod.title,
          mod.description || '',
          i, // 0..60 order_index
          mod.icon || 'cube-outline',
          now,
        ]
      );

      // 3. Insert topics for this module
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
          [topicId, moduleId, topicTitle, topicDesc, topicOrder, now]
        );

        topicOrder++;
      }
    }

    // 4. Update course total_modules & progress
    await db.execAsync(`
      UPDATE courses
      SET total_modules = (
        SELECT COUNT(*)
        FROM modules
        WHERE modules.course_id = 'system_design'
      ),
      completed_modules = (
        SELECT COUNT(*)
        FROM modules
        WHERE modules.course_id = 'system_design' AND modules.is_completed = 1
      ),
      progress_percentage = 0.0,
      is_completed = 0
      WHERE id = 'system_design';
    `);
  },
};
