import { SQLiteDatabase } from 'expo-sqlite';
import {
  aptitudeRoadmap,
  reasoningRoadmap,
  verbalEnglishRoadmap,
  englishSpeakingRoadmap,
} from '../seeds/roadmapData';
import { INITIAL_COURSES } from '../seeds/initialCourses';

export const v12_part14_roadmaps_and_speaking = {
  version: 12,
  name: 'v12_part14_roadmaps_and_speaking',
  up: async (db: SQLiteDatabase): Promise<void> => {
    const now = new Date().toISOString();

    // 1. Create speaking tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS speaking_topics (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        level INTEGER NOT NULL DEFAULT 1,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'beginner',
        scenario_type TEXT,
        lesson_content TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS speaking_scenarios (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        role_user TEXT NOT NULL,
        role_partner TEXT NOT NULL,
        situation TEXT NOT NULL,
        useful_vocabulary TEXT NOT NULL,
        sample_dialogue TEXT NOT NULL,
        practice_prompt TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS speaking_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        topic_id TEXT,
        scenario_id TEXT,
        mode TEXT NOT NULL DEFAULT 'FREE_CONVERSATION',
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        transcript TEXT NOT NULL,
        feedback_notes TEXT,
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_speaking_topics_level_cat ON speaking_topics(level, category);
      CREATE INDEX IF NOT EXISTS idx_speaking_sessions_topic ON speaking_sessions(topic_id);
      CREATE INDEX IF NOT EXISTS idx_topics_title ON topics(title);
      CREATE INDEX IF NOT EXISTS idx_modules_title ON modules(title);
    `);

    // 2. Safely migrate legacy course references to preserve all existing user progress, notes, and activity
    try {
      const aptOld = await db.getFirstAsync<{ id: string }>('SELECT id FROM courses WHERE id = ?;', ['aptitude_reasoning']);
      if (aptOld) {
        await db.runAsync(`
          UPDATE courses
          SET id = 'aptitude',
              name = 'Aptitude',
              description = 'Quantitative aptitude from fundamentals to advanced company-level tests.',
              icon = 'calculator-variant',
              theme = 'aptitude',
              order_index = 9
          WHERE id = 'aptitude_reasoning';
        `);
        await db.runAsync("UPDATE modules SET course_id = 'aptitude' WHERE course_id = 'aptitude_reasoning';");
        await db.runAsync("UPDATE notes SET course_id = 'aptitude' WHERE course_id = 'aptitude_reasoning';");
        await db.runAsync("UPDATE user_progress SET course_id = 'aptitude' WHERE course_id = 'aptitude_reasoning';");
        await db.runAsync("UPDATE learning_activity SET course_id = 'aptitude' WHERE course_id = 'aptitude_reasoning';");
        await db.runAsync("UPDATE study_sessions SET course_id = 'aptitude' WHERE course_id = 'aptitude_reasoning';");
      }
    } catch {
      // Safe to ignore if already migrated or table structure difference
    }

    try {
      const engOld = await db.getFirstAsync<{ id: string }>('SELECT id FROM courses WHERE id = ?;', ['english']);
      if (engOld) {
        await db.runAsync(`
          UPDATE courses
          SET id = 'verbal_english',
              name = 'Verbal English',
              description = 'Grammar mastery, vocabulary, sentence correction, reading comprehension, and placement verbal tests.',
              icon = 'book-open-page-variant',
              theme = 'verbal_english',
              order_index = 11
          WHERE id = 'english';
        `);
        await db.runAsync("UPDATE modules SET course_id = 'verbal_english' WHERE course_id = 'english';");
        await db.runAsync("UPDATE notes SET course_id = 'verbal_english' WHERE course_id = 'english';");
        await db.runAsync("UPDATE user_progress SET course_id = 'verbal_english' WHERE course_id = 'english';");
        await db.runAsync("UPDATE learning_activity SET course_id = 'verbal_english' WHERE course_id = 'english';");
        await db.runAsync("UPDATE study_sessions SET course_id = 'verbal_english' WHERE course_id = 'english';");
      }
    } catch {
      // Safe to ignore
    }

    // 3. Ensure all 16 initial courses exist in the courses table
    for (const c of INITIAL_COURSES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO courses (
          id, name, description, icon, theme, order_index,
          total_modules, completed_modules, progress_percentage,
          is_completed, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0.0, 0, ?, ?);`,
        [c.id, c.name, c.description, c.icon, c.theme, c.order_index, now, now]
      );
    }

    // 4. Seed roadmap modules and topics for Aptitude, Reasoning, Verbal English, and English Speaking
    const roadmapsToSeed = [
      aptitudeRoadmap,
      reasoningRoadmap,
      verbalEnglishRoadmap,
      englishSpeakingRoadmap,
    ];

    for (const roadmap of roadmapsToSeed) {
      let modIndex = 1;
      for (const mod of roadmap.modules) {
        const moduleId = `${roadmap.courseId}_m${modIndex}`;

        await db.runAsync(
          `INSERT OR IGNORE INTO modules (
            id, course_id, title, description, order_index, icon,
            is_completed, completed_at, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?);`,
          [
            moduleId,
            roadmap.courseId,
            mod.title,
            mod.description || '',
            modIndex,
            mod.icon || 'book-outline',
            now,
          ]
        );

        let topIndex = 1;
        for (const t of mod.topics) {
          const topTitle = typeof t === 'string' ? t : t.title;
          const topDesc = typeof t === 'string' ? '' : t.description || '';
          const topicId = `${moduleId}_t${topIndex}`;

          await db.runAsync(
            `INSERT OR IGNORE INTO topics (
              id, module_id, title, description, order_index,
              is_completed, completed_at, created_at
            ) VALUES (?, ?, ?, ?, ?, 0, NULL, ?);`,
            [
              topicId,
              moduleId,
              topTitle,
              topDesc,
              topIndex,
              now,
            ]
          );

          topIndex++;
        }

        modIndex++;
      }
    }

    // 5. Seed real-life speaking scenarios into speaking_scenarios
    const scenarios = [
      {
        id: 'sc_teacher_student',
        title: 'Teacher ↔ Student: Academic Progress Review',
        category: 'CAMPUS',
        role_user: 'Student',
        role_partner: 'Teacher (Prof. Davies)',
        situation: 'Discussing exam feedback, difficult chapters, and creating an improvement plan.',
        useful_vocabulary: JSON.stringify(['feedback', 'improvement', 'clarification', 'strategy', 'foundation', 'consistent']),
        sample_dialogue: JSON.stringify([
          { speaker: 'Prof. Davies', text: 'Good morning, Alex. Thanks for stopping by. I wanted to talk about your mid-term score in algorithms.' },
          { speaker: 'Student', text: 'Good morning, Professor. Yes, I struggled a lot with dynamic programming problems and ran out of time.' },
          { speaker: 'Prof. Davies', text: 'I noticed your recursive intuition is solid, but you missed memoization. How do you plan to practice this week?' },
          { speaker: 'Student', text: 'I plan to solve three memoization problems every evening and attend the tutorial session on Thursday.' },
        ]),
        practice_prompt: 'Explain to your teacher that you understand your weak points and outline two specific study habits you will follow.',
        order_index: 1,
      },
      {
        id: 'sc_two_friends',
        title: 'Two Friends: Catching Up on Weekend Plans',
        category: 'DAILY',
        role_user: 'Friend 1',
        role_partner: 'Friend 2 (Sam)',
        situation: 'Two close friends discussing their busy week, hobbies, and making plans to meet up.',
        useful_vocabulary: JSON.stringify(['hectic', 'unwind', 'recommendation', 'catch up', 'flexible', 'chill']),
        sample_dialogue: JSON.stringify([
          { speaker: 'Sam', text: "Hey! It feels like forever since we last hung out. How has your week been?" },
          { speaker: 'Friend 1', text: "Super hectic! Between classes and project submissions, I barely had time to breathe. How about you?" },
          { speaker: 'Sam', text: "Same here. Are you free this Saturday evening? A new open-air cafe opened downtown." },
          { speaker: 'Friend 1', text: "Saturday sounds perfect. Let's meet around 5 PM so we have plenty of daylight." },
        ]),
        practice_prompt: 'Suggest an activity for the weekend, mention your availability, and ask your friend for their preference.',
        order_index: 2,
      },
      {
        id: 'sc_dev_team_lead',
        title: 'Developer ↔ Team Lead: Stand-up & Blocker Resolution',
        category: 'WORKPLACE',
        role_user: 'Frontend Developer',
        role_partner: 'Tech Lead (Sarah)',
        situation: 'Giving your daily standup update, reporting an API latency blocker, and proposing a caching solution.',
        useful_vocabulary: JSON.stringify(['blocker', 'endpoint', 'latency', 'caching', 'workaround', 'deployment', 'sprint']),
        sample_dialogue: JSON.stringify([
          { speaker: 'Tech Lead', text: "Morning, team. Alex, how is the dashboard integration coming along?" },
          { speaker: 'Developer', text: "Yesterday I completed the statistics chart components. Today I am connecting the live study session metrics." },
          { speaker: 'Tech Lead', text: "Any blockers holding up the sprint goals?" },
          { speaker: 'Developer', text: "Yes, the aggregated stats query takes over 800ms. I propose caching the 7-day chart data in local SQLite so the UI responds instantly." },
          { speaker: 'Tech Lead', text: "Great initiative. Open a PR with that schema change and I'll review it before lunch." },
        ]),
        practice_prompt: 'Give your 30-second standup: state what you finished yesterday, what you are tackling today, and articulate one blocker clearly.',
        order_index: 3,
      },
      {
        id: 'sc_candidate_interviewer',
        title: 'Candidate ↔ Interviewer: System Design & Trade-offs',
        category: 'WORKPLACE',
        role_user: 'Software Engineer Candidate',
        role_partner: 'Lead Architect (Mark)',
        situation: 'Discussing database indexing trade-offs during a technical interview for a full-stack engineering role.',
        useful_vocabulary: JSON.stringify(['trade-off', 'read-heavy', 'write-overhead', 'indexing', 'scalability', 'bottleneck']),
        sample_dialogue: JSON.stringify([
          { speaker: 'Interviewer', text: "We have an education app where users query topics frequently. Why choose SQLite with indexes over cloud polling?" },
          { speaker: 'Candidate', text: "An offline-first SQLite database provides sub-5ms lookups with zero network dependency, which is crucial for mobile users." },
          { speaker: 'Interviewer', text: "What about the storage and write overhead of multiple indexes?" },
          { speaker: 'Candidate', text: "Because our app is heavily read-dominant, the tiny write penalty during migrations is heavily outweighed by instant search performance." },
        ]),
        practice_prompt: 'Describe a technical decision you made in a recent project, explain the trade-offs, and state why your chosen approach was optimal.',
        order_index: 4,
      },
      {
        id: 'sc_customer_shopkeeper',
        title: 'Customer ↔ Shopkeeper: Product Inquiries & Warranty',
        category: 'SERVICE',
        role_user: 'Customer',
        role_partner: 'Store Manager',
        situation: 'Inquiring about specifications, checking manufacturer warranty, and asking about refund policies.',
        useful_vocabulary: JSON.stringify(['specifications', 'warranty', 'coverage', 'receipt', 'replacement', 'invoice']),
        sample_dialogue: JSON.stringify([
          { speaker: 'Store Manager', text: "Hello! Welcome to Apex Electronics. Are you looking for anything specific today?" },
          { speaker: 'Customer', text: "Hi, yes. I am looking for noise-canceling headphones for studying and remote meetings." },
          { speaker: 'Store Manager', text: "These have 30-hour battery life, active noise cancellation, and a two-year manufacturer replacement warranty." },
          { speaker: 'Customer', text: "Does the warranty cover accidental drops, and do I need to register the product online?" },
        ]),
        practice_prompt: 'Ask the shopkeeper about product compatibility, confirm warranty conditions, and politely ask if a student discount is available.',
        order_index: 5,
      },
    ];

    for (const sc of scenarios) {
      await db.runAsync(
        `INSERT OR IGNORE INTO speaking_scenarios (
          id, title, category, role_user, role_partner,
          situation, useful_vocabulary, sample_dialogue, practice_prompt, order_index
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          sc.id,
          sc.title,
          sc.category,
          sc.role_user,
          sc.role_partner,
          sc.situation,
          sc.useful_vocabulary,
          sc.sample_dialogue,
          sc.practice_prompt,
          sc.order_index,
        ]
      );
    }

    // 6. Recalculate total_modules and completed_modules for all courses
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
        WHEN total_modules > 0 THEN ROUND((CAST(completed_modules AS REAL) / total_modules) * 100, 1)
        ELSE 0.0
      END;
    `);
  },
};
