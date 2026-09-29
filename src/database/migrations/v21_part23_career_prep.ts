import { SQLiteDatabase } from 'expo-sqlite';

/**
 * Migration v21: Part 23 Career Preparation, Interview Roadmap & Job Readiness System
 */
export const v21_part23_career_prep = {
  version: 21,
  name: 'v21_part23_career_prep',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Career Roadmaps Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS career_roadmaps (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        target_roles TEXT NOT NULL,
        description TEXT NOT NULL,
        stages_count INTEGER NOT NULL DEFAULT 0,
        estimated_months INTEGER NOT NULL DEFAULT 3,
        created_at TEXT NOT NULL
      );
    `);

    // 2. Career Stages Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS career_stages (
        id TEXT PRIMARY KEY NOT NULL,
        roadmap_id TEXT NOT NULL,
        title TEXT NOT NULL,
        stage_order INTEGER NOT NULL DEFAULT 0,
        skills_covered TEXT NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        FOREIGN KEY (roadmap_id) REFERENCES career_roadmaps (id) ON DELETE CASCADE
      );
    `);

    // 3. Career Projects Table (Linked to Part 24 Project Builder)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS career_projects (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        role TEXT NOT NULL,
        tech_stack TEXT NOT NULL,
        github_url TEXT,
        live_demo_url TEXT,
        description TEXT NOT NULL,
        key_achievements TEXT,
        interview_topics TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    // 4. Career Readiness Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS career_readiness (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        technical_score REAL NOT NULL DEFAULT 0.0,
        dsa_score REAL NOT NULL DEFAULT 0.0,
        system_design_score REAL NOT NULL DEFAULT 0.0,
        soft_skills_score REAL NOT NULL DEFAULT 0.0,
        overall_score REAL NOT NULL DEFAULT 0.0,
        updated_at TEXT NOT NULL,
        UNIQUE(user_id)
      );
    `);

    // 5. Resume Profiles Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS resume_profiles (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        full_name TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        summary TEXT NOT NULL DEFAULT '',
        education TEXT NOT NULL DEFAULT '[]',
        experience TEXT NOT NULL DEFAULT '[]',
        skills TEXT NOT NULL DEFAULT '[]',
        projects TEXT NOT NULL DEFAULT '[]',
        certifications TEXT NOT NULL DEFAULT '[]',
        updated_at TEXT NOT NULL,
        UNIQUE(user_id)
      );
    `);

    // 6. Mock Interviews Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS mock_interviews (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        interview_type TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        score REAL NOT NULL DEFAULT 0.0,
        feedback TEXT,
        questions_and_answers TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL
      );
    `);
  },
};
