import { SQLiteDatabase } from 'expo-sqlite';

export const v19_part21_ai_assistant = {
  version: 19,
  name: 'v19_part21_ai_assistant',
  up: async (db: SQLiteDatabase): Promise<void> => {
    const now = new Date().toISOString();

    // 1. Create ai_conversations table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id TEXT PRIMARY KEY NOT NULL,
        mode TEXT NOT NULL DEFAULT 'TUTOR',
        title TEXT NOT NULL,
        course_id TEXT,
        module_id TEXT,
        topic_id TEXT,
        explanation_level TEXT NOT NULL DEFAULT 'BEGINNER',
        is_archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_aic_mode ON ai_conversations(mode);
      CREATE INDEX IF NOT EXISTS idx_aic_course ON ai_conversations(course_id);
      CREATE INDEX IF NOT EXISTS idx_aic_topic ON ai_conversations(topic_id);
      CREATE INDEX IF NOT EXISTS idx_aic_updated ON ai_conversations(updated_at DESC);
    `);

    // 2. Create ai_messages table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ai_messages (
        id TEXT PRIMARY KEY NOT NULL,
        conversation_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        message_type TEXT NOT NULL DEFAULT 'TEXT',
        metadata TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_aim_conv ON ai_messages(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_aim_created ON ai_messages(created_at ASC);
    `);

    // 3. Create ai_speaking_sessions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ai_speaking_sessions (
        id TEXT PRIMARY KEY NOT NULL,
        conversation_id TEXT NOT NULL,
        mode TEXT NOT NULL DEFAULT 'DAILY_CONVERSATION',
        topic_id TEXT,
        scenario_id TEXT,
        difficulty TEXT NOT NULL DEFAULT 'BEGINNER',
        correction_level TEXT NOT NULL DEFAULT 'GENTLE',
        started_at TEXT NOT NULL,
        ended_at TEXT,
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        message_count INTEGER NOT NULL DEFAULT 0,
        corrections_count INTEGER NOT NULL DEFAULT 0,
        is_completed INTEGER NOT NULL DEFAULT 0,
        feedback_json TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_aiss_conv ON ai_speaking_sessions(conversation_id);
      CREATE INDEX IF NOT EXISTS idx_aiss_completed ON ai_speaking_sessions(is_completed);
    `);

    // 4. Create ai_daily_speaking_topics table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ai_daily_speaking_topics (
        id TEXT PRIMARY KEY NOT NULL,
        day_of_week INTEGER NOT NULL, -- 0=Sun, 1=Mon, ..., 6=Sat
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'BEGINNER',
        vocabulary TEXT NOT NULL,
        useful_sentences TEXT NOT NULL,
        opening_question TEXT NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_aidst_dow ON ai_daily_speaking_topics(day_of_week);
    `);

    // 5. Create ai_usage_ledger table (Rate limiting & quota guard)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS ai_usage_ledger (
        date_str TEXT PRIMARY KEY NOT NULL,
        message_count INTEGER NOT NULL DEFAULT 0,
        speaking_sessions_count INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
      );
    `);

    // 6. Seed Daily Speaking Topics for every day of the week
    const dailyTopics = [
      [
        'topic_dow_0',
        0, // Sunday
        'A Memorable Journey or Experience',
        'Share a special trip, memory, or unexpected adventure from your past.',
        'INTERMEDIATE',
        JSON.stringify(['journey', 'destination', 'scenery', 'unexpected', 'memorable', 'experience']),
        JSON.stringify([
          'I would like to tell you about a trip I took to...',
          'One of the most memorable parts of the journey was...',
          'Looking back, that experience taught me...'
        ]),
        'Hello! Where is one place you visited that left a strong impression on you, and what made it so special?'
      ],
      [
        'topic_dow_1',
        1, // Monday
        'My Daily Routine & Habits',
        'Talk about how your morning begins, your study habits, and how you manage your day.',
        'BEGINNER',
        JSON.stringify(['routine', 'schedule', 'morning', 'productive', 'commute', 'habits']),
        JSON.stringify([
          'I usually start my day at...',
          'During the afternoon, my focus is on...',
          'To unwind in the evening, I enjoy...'
        ]),
        'Good day! Could you walk me through your typical daily routine from morning until evening?'
      ],
      [
        'topic_dow_2',
        2, // Tuesday
        'Describing My Hometown or City',
        'Describe where you live, the culture, famous landmarks, and what you enjoy most about it.',
        'BEGINNER',
        JSON.stringify(['hometown', 'landmark', 'atmosphere', 'heritage', 'bustling', 'peaceful']),
        JSON.stringify([
          'My hometown is known for its...',
          'The best thing about living here is...',
          'If someone visited for the first time, I would recommend...'
        ]),
        'Hi there! Tell me a bit about your hometown. What is it like, and what do you like best about it?'
      ],
      [
        'topic_dow_3',
        3, // Wednesday
        'Explaining a Project I Worked On',
        'Explain a programming project, problem you solved, and the tools you used.',
        'TECHNICAL',
        JSON.stringify(['architecture', 'implemented', 'framework', 'database', 'optimization', 'challenge']),
        JSON.stringify([
          'In this project, the core problem we aimed to solve was...',
          'I was responsible for developing the...',
          'A key obstacle we overcame was...'
        ]),
        'Welcome! Could you give me an overview of an interesting software or study project you have worked on?'
      ],
      [
        'topic_dow_4',
        4, // Thursday
        'Handling a Technical Bug at Work',
        'Practice workplace communication: explaining a bug, steps to reproduce, and proposed solution.',
        'WORKPLACE',
        JSON.stringify(['reproduce', 'investigate', 'root cause', 'workaround', 'deploy', 'patch']),
        JSON.stringify([
          'We encountered an issue where...',
          'After analyzing the logs, the root cause turned out to be...',
          'My proposed fix is to...'
        ]),
        'Good afternoon! Imagine a critical bug was just reported in production. How would you explain it to your team?'
      ],
      [
        'topic_dow_5',
        5, // Friday
        'Talking About My Passions & Future Career',
        'Discuss why you enjoy programming and what role you aspire to achieve.',
        'INTERMEDIATE',
        JSON.stringify(['aspiration', 'growth', 'specialization', 'impact', 'continuous learning']),
        JSON.stringify([
          'What excites me most about technology is...',
          'Over the next two years, I plan to specialize in...',
          'I believe that consistent practice will help me...'
        ]),
        'Happy Friday! What inspired you to pursue software development, and what kind of roles excite you most?'
      ],
      [
        'topic_dow_6',
        6, // Saturday
        'Job Interview: Tell Me About Yourself',
        'Practice the classic interview icebreaker with professional structure and conciseness.',
        'INTERVIEW',
        JSON.stringify(['background', 'expertise', 'achievements', 'collaborative', 'strengths']),
        JSON.stringify([
          'To briefly summarize my background, I have been focusing on...',
          'My core strengths lie in problem solving and...',
          'I am eager to apply these skills to...'
        ]),
        'Welcome to your interview session. Could you please introduce yourself and highlight your key skills?'
      ],
    ];

    for (const [id, dow, title, desc, diff, vocab, useful, opening] of dailyTopics) {
      await db.runAsync(
        `INSERT OR IGNORE INTO ai_daily_speaking_topics (
          id, day_of_week, title, description, difficulty, vocabulary, useful_sentences, opening_question
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [id, dow, title, desc, diff, vocab, useful, opening]
      );
    }
  },
};
