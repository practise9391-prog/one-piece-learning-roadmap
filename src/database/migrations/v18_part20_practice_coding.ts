import { SQLiteDatabase } from 'expo-sqlite';

export const v18_part20_practice_coding = {
  version: 18,
  name: 'v18_part20_practice_coding',
  up: async (db: SQLiteDatabase): Promise<void> => {
    const now = new Date().toISOString();

    // 1. Create practice_tasks table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS practice_tasks (
        id TEXT PRIMARY KEY NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT,
        topic_id TEXT,
        category_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        instructions TEXT,
        task_type TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        language TEXT NOT NULL DEFAULT 'python',
        starter_code TEXT NOT NULL,
        solution TEXT NOT NULL,
        explanation TEXT NOT NULL,
        hints TEXT,
        expected_output TEXT,
        options TEXT,
        correct_answer TEXT,
        approaches TEXT,
        time_limit INTEGER NOT NULL DEFAULT 2,
        memory_limit INTEGER NOT NULL DEFAULT 128,
        points INTEGER NOT NULL DEFAULT 10,
        xp INTEGER NOT NULL DEFAULT 20,
        order_index INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        is_bookmarked INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'NOT_STARTED',
        user_draft TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_pt_course ON practice_tasks(course_id);
      CREATE INDEX IF NOT EXISTS idx_pt_topic ON practice_tasks(topic_id);
      CREATE INDEX IF NOT EXISTS idx_pt_category ON practice_tasks(category_id);
      CREATE INDEX IF NOT EXISTS idx_pt_type ON practice_tasks(task_type);
      CREATE INDEX IF NOT EXISTS idx_pt_difficulty ON practice_tasks(difficulty);
      CREATE INDEX IF NOT EXISTS idx_pt_status ON practice_tasks(status);
      CREATE INDEX IF NOT EXISTS idx_pt_bookmarked ON practice_tasks(is_bookmarked);
    `);

    // 2. Create task_test_cases table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS task_test_cases (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT NOT NULL,
        input TEXT NOT NULL,
        expected_output TEXT NOT NULL,
        is_hidden INTEGER NOT NULL DEFAULT 0,
        order_index INTEGER NOT NULL DEFAULT 0,
        weight INTEGER NOT NULL DEFAULT 1,
        timeout_ms INTEGER NOT NULL DEFAULT 2000,
        created_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES practice_tasks(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_ttc_task ON task_test_cases(task_id);
      CREATE INDEX IF NOT EXISTS idx_ttc_hidden ON task_test_cases(is_hidden);
    `);

    // 3. Create task_submissions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS task_submissions (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        language TEXT NOT NULL,
        source_code TEXT NOT NULL,
        status TEXT NOT NULL,
        passed_tests INTEGER NOT NULL DEFAULT 0,
        total_tests INTEGER NOT NULL DEFAULT 0,
        score INTEGER NOT NULL DEFAULT 0,
        execution_time_ms INTEGER NOT NULL DEFAULT 0,
        memory_used_kb INTEGER NOT NULL DEFAULT 0,
        failed_test_index INTEGER,
        revealed_failed_test INTEGER NOT NULL DEFAULT 0,
        error_message TEXT,
        submitted_at TEXT NOT NULL,
        FOREIGN KEY (task_id) REFERENCES practice_tasks(id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_ts_task ON task_submissions(task_id);
      CREATE INDEX IF NOT EXISTS idx_ts_status ON task_submissions(status);
      CREATE INDEX IF NOT EXISTS idx_ts_submitted ON task_submissions(submitted_at);
    `);

    // 4. Create task_revealed_tests table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS task_revealed_tests (
        id TEXT PRIMARY KEY NOT NULL,
        task_id TEXT NOT NULL,
        test_case_id TEXT NOT NULL,
        revealed_at TEXT NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_trt_unique ON task_revealed_tests(task_id, test_case_id);
    `);

    // 5. Seed Core Practice Tasks & Test Cases
    await seedPracticeCurriculum(db, now);
  },
};

async function seedPracticeCurriculum(db: SQLiteDatabase, now: string): Promise<void> {
  // Check if already seeded
  const check = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM practice_tasks;');
  if (check && check.count > 0) return;

  const tasks = [
    // TASK 1: Coding (Python - Reverse String)
    {
      id: 'task_py_reverse_string',
      course_id: 'python',
      module_id: 'py_mod_1',
      topic_id: 'topic_py_strings',
      category_id: 'coding',
      title: 'Reverse a String',
      description: 'Write a function or program that takes a string as input and returns the reversed string.',
      instructions: 'Read the input string from standard input and print the reversed string to standard output.',
      task_type: 'CODING',
      difficulty: 'EASY',
      language: 'python',
      starter_code: `def reverse_string(s: str) -> str:\n    # Write your solution here\n    pass\n\nif __name__ == '__main__':\n    import sys\n    input_str = sys.stdin.read().strip()\n    print(reverse_string(input_str))`,
      solution: `def reverse_string(s: str) -> str:\n    return s[::-1]\n\nif __name__ == '__main__':\n    import sys\n    input_str = sys.stdin.read().strip()\n    print(reverse_string(input_str))`,
      explanation: 'In Python, string slicing with a step of -1 (`s[::-1]`) reverses the sequence in linear O(N) time with clean syntax.',
      hints: JSON.stringify([
        'Think about how you can traverse the string from the last index to the first.',
        'Python supports slicing with step values: [start:stop:step].',
        'Alternatively, you can convert the string into a list, reverse it in-place with two pointers, and join it back.',
      ]),
      approaches: JSON.stringify([
        {
          name: 'Approach 1: Two Pointers',
          type: 'BETTER',
          complexity_time: 'O(N)',
          complexity_space: 'O(N)',
          explanation: 'Convert string to mutable list of characters, swap left and right pointers moving inward until they meet.',
          code: 'chars = list(s)\nl, r = 0, len(chars) - 1\nwhile l < r:\n    chars[l], chars[r] = chars[r], chars[l]\n    l += 1\n    r -= 1\nreturn "".join(chars)',
          when_to_use: 'Standard algorithm interview pattern that easily extends to in-place array manipulation.',
        },
        {
          name: 'Approach 2: Pythonic Slicing',
          type: 'OPTIMAL',
          complexity_time: 'O(N)',
          complexity_space: 'O(N)',
          explanation: 'Uses CPython internal slice iterator with negative step to construct reversed copy directly.',
          code: 'return s[::-1]',
          when_to_use: 'Best practice in standard Python production applications.',
        },
      ]),
      time_limit: 2,
      memory_limit: 128,
      points: 10,
      xp: 20,
      order_index: 1,
      testCases: [
        { input: 'hello', expected_output: 'olleh', is_hidden: 0 },
        { input: 'python', expected_output: 'nohtyp', is_hidden: 0 },
        { input: 'racecar', expected_output: 'racecar', is_hidden: 1 },
        { input: 'Grand Line', expected_output: 'eniL dnarG', is_hidden: 1 },
        { input: 'a', expected_output: 'a', is_hidden: 1 },
      ],
    },

    // TASK 2: Coding (DSA - Two Sum)
    {
      id: 'task_dsa_two_sum',
      course_id: 'dsa',
      module_id: 'dsa_mod_arrays',
      topic_id: 'topic_dsa_arrays',
      category_id: 'coding',
      title: 'Two Sum Problem',
      description: 'Given two integers space-separated, calculate their sum and print the result.',
      instructions: 'Read two space-separated integers A and B from input, and print their sum A + B.',
      task_type: 'CODING',
      difficulty: 'EASY',
      language: 'python',
      starter_code: `def solve():\n    import sys\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    a, b = int(tokens[0]), int(tokens[1])\n    # Calculate sum and print\n    pass\n\nif __name__ == '__main__':\n    solve()`,
      solution: `def solve():\n    import sys\n    tokens = sys.stdin.read().split()\n    if not tokens:\n        return\n    a, b = int(tokens[0]), int(tokens[1])\n    print(a + b)\n\nif __name__ == '__main__':\n    solve()`,
      explanation: 'Basic arithmetic addition of two 64-bit integers with O(1) time and space complexity.',
      hints: JSON.stringify([
        'Read the input tokens and cast them to integers.',
        'Use the + operator to compute sum.',
        'Print the resulting integer.',
      ]),
      approaches: JSON.stringify([
        {
          name: 'Direct Addition',
          type: 'OPTIMAL',
          complexity_time: 'O(1)',
          complexity_space: 'O(1)',
          explanation: 'Direct CPU arithmetic ALU instruction.',
          code: 'print(a + b)',
          when_to_use: 'Standard numerical addition.',
        },
      ]),
      time_limit: 2,
      memory_limit: 128,
      points: 10,
      xp: 20,
      order_index: 2,
      testCases: [
        { input: '3 5', expected_output: '8', is_hidden: 0 },
        { input: '10 25', expected_output: '35', is_hidden: 0 },
        { input: '0 0', expected_output: '0', is_hidden: 1 },
        { input: '-10 20', expected_output: '10', is_hidden: 1 },
        { input: '999999 1', expected_output: '1000000', is_hidden: 1 },
      ],
    },

    // TASK 3: SQL Challenge (Find High Salary Employees)
    {
      id: 'task_sql_high_salary',
      course_id: 'sql',
      module_id: 'sql_mod_select',
      topic_id: 'topic_sql_filtering',
      category_id: 'sql',
      title: 'Find Top Earners in Engineering',
      description: 'Write an SQL query to retrieve the name and salary of all employees from the "employees" table with a salary greater than or equal to 85,000, ordered by salary descending.',
      instructions: 'Select columns "name" and "salary" from employees table where salary >= 85000 ORDER BY salary DESC.',
      task_type: 'SQL',
      difficulty: 'MEDIUM',
      language: 'sql',
      starter_code: `-- Write your SQL query below\nSELECT name, salary\nFROM employees\n-- Add your WHERE and ORDER BY clauses here;`,
      solution: `SELECT name, salary FROM employees WHERE salary >= 85000 ORDER BY salary DESC;`,
      explanation: 'The WHERE clause filters rows before projection, and ORDER BY DESC sorts highest to lowest.',
      hints: JSON.stringify([
        'Use the WHERE clause with >= comparison operator.',
        'Filter for salary >= 85000.',
        'Order results with ORDER BY salary DESC.',
      ]),
      approaches: JSON.stringify([
        {
          name: 'Filtered Index Scan',
          type: 'OPTIMAL',
          complexity_time: 'O(N log N)',
          complexity_space: 'O(N)',
          explanation: 'Scans table rows with predicate filter and performs sorting on salary.',
          code: 'SELECT name, salary FROM employees WHERE salary >= 85000 ORDER BY salary DESC;',
          when_to_use: 'Standard SQL retrieval with predicate filtering.',
        },
      ]),
      time_limit: 2,
      memory_limit: 128,
      points: 15,
      xp: 25,
      order_index: 3,
      testCases: [
        {
          input: 'SELECT name, salary FROM employees WHERE salary >= 85000 ORDER BY salary DESC;',
          expected_output: '[\n  {\n    "name": "Luffy Monkey",\n    "salary": 95000\n  },\n  {\n    "name": "Robin Nico",\n    "salary": 91000\n  },\n  {\n    "name": "Zoro Roronoa",\n    "salary": 88000\n  },\n  {\n    "name": "Sanji Cook",\n    "salary": 85000\n  }\n]',
          is_hidden: 0,
        },
      ],
    },

    // TASK 4: Debugging (Python - Fix Off-By-One Index Bug)
    {
      id: 'task_debug_py_loop',
      course_id: 'python',
      module_id: 'py_mod_loops',
      topic_id: 'topic_py_loops',
      category_id: 'debugging',
      title: 'Fix the Loop Boundary Bug',
      description: 'The given code is supposed to calculate the string length of each word in standard input, but throws an AttributeError. Find the bug and fix it.',
      instructions: 'Fix the typo/attribute error in the loop body so it correctly prints the length of the string.',
      task_type: 'DEBUGGING',
      difficulty: 'EASY',
      language: 'python',
      starter_code: `def get_length(word: str) -> int:\n    # BUG HERE: word.lenght has a typo!\n    return word.lenght\n\nif __name__ == '__main__':\n    import sys\n    s = sys.stdin.read().strip()\n    print(get_length(s))`,
      solution: `def get_length(word: str) -> int:\n    return len(word)\n\nif __name__ == '__main__':\n    import sys\n    s = sys.stdin.read().strip()\n    print(get_length(s))`,
      explanation: 'In Python, strings do not have a `.lenght` attribute. String length is measured using the built-in function `len(s)`.',
      hints: JSON.stringify([
        'Look at how string length is computed in Python.',
        'Python uses the built-in function len() rather than a property.',
      ]),
      approaches: JSON.stringify([
        {
          name: 'Built-in len()',
          type: 'OPTIMAL',
          complexity_time: 'O(1)',
          complexity_space: 'O(1)',
          explanation: 'CPython PyVarObject ob_size lookup runs in constant O(1) time.',
          code: 'return len(word)',
        },
      ]),
      time_limit: 2,
      memory_limit: 128,
      points: 10,
      xp: 20,
      order_index: 4,
      testCases: [
        { input: 'StrawHat', expected_output: '8', is_hidden: 0 },
        { input: 'Luffy', expected_output: '5', is_hidden: 0 },
        { input: '', expected_output: '0', is_hidden: 1 },
        { input: 'ThousandSunny', expected_output: '13', is_hidden: 1 },
      ],
    },

    // TASK 5: Output Prediction (Python - List Mutability)
    {
      id: 'task_out_py_mutation',
      course_id: 'python',
      module_id: 'py_mod_lists',
      topic_id: 'topic_py_lists',
      category_id: 'output_prediction',
      title: 'Python List Shallow Reference Mutation',
      description: 'What will be the output of the following Python code snippet?',
      instructions: 'Select the exact output printed to the console.',
      task_type: 'OUTPUT_PREDICTION',
      difficulty: 'MEDIUM',
      language: 'python',
      starter_code: `a = [1, 2, 3]\nb = a\nb.append(4)\nprint(len(a))`,
      solution: '4',
      explanation: 'In Python, variable assignment `b = a` creates an alias/reference to the exact same list object in memory, not a shallow or deep copy. When `b.append(4)` executes, `a` also sees the mutation.',
      hints: JSON.stringify([
        'Does `b = a` create a copy or point to the same object?',
        'Lists in Python are mutable references.',
      ]),
      options: JSON.stringify(['3', '4', 'TypeError', 'AttributeError']),
      correct_answer: '4',
      time_limit: 1,
      memory_limit: 64,
      points: 10,
      xp: 15,
      order_index: 5,
    },

    // TASK 6: MCQ (DSA - Queue FIFO Concept)
    {
      id: 'task_mcq_dsa_fifo',
      course_id: 'dsa',
      module_id: 'dsa_mod_stacks_queues',
      topic_id: 'topic_dsa_queues',
      category_id: 'mcq',
      title: 'Queue Ordering Principle',
      description: 'Which data structure follows the First-In, First-Out (FIFO) principle of element processing?',
      instructions: 'Choose the correct option.',
      task_type: 'MCQ',
      difficulty: 'EASY',
      language: 'text',
      starter_code: '',
      solution: 'Queue',
      explanation: 'A Queue adheres strictly to First-In, First-Out (FIFO), where elements are inserted at the rear (enqueue) and removed from the front (dequeue). In contrast, Stacks are LIFO.',
      hints: JSON.stringify([
        'Think of waiting in a line at a ticket counter.',
        'The first person in line is served first.',
      ]),
      options: JSON.stringify(['Stack', 'Queue', 'Binary Tree', 'Max Heap']),
      correct_answer: 'Queue',
      time_limit: 1,
      memory_limit: 64,
      points: 10,
      xp: 15,
      order_index: 6,
    },

    // TASK 7: Aptitude (Percentages)
    {
      id: 'task_apt_percentage_increase',
      course_id: 'aptitude',
      module_id: 'apt_mod_percentages',
      topic_id: 'topic_apt_percentage_calculations',
      category_id: 'aptitude',
      title: 'Percentage Increase Calculation',
      description: 'A product price increases from $200 to $250. What is the percentage increase in price?',
      instructions: 'Select the correct percentage increase.',
      task_type: 'MCQ',
      difficulty: 'EASY',
      language: 'text',
      starter_code: '',
      solution: '25%',
      explanation: 'Percentage Increase = (Increase / Original Value) * 100 = ((250 - 200) / 200) * 100 = (50 / 200) * 100 = 25%.',
      hints: JSON.stringify([
        'Find the absolute increase first: 250 - 200.',
        'Divide the increase by the original base price ($200), not the final price.',
      ]),
      options: JSON.stringify(['20%', '25%', '30%', '50%']),
      correct_answer: '25%',
      time_limit: 1,
      memory_limit: 64,
      points: 10,
      xp: 15,
      order_index: 7,
    },

    // TASK 8: Reasoning (Blood Relations)
    {
      id: 'task_reas_blood_relations',
      course_id: 'reasoning',
      module_id: 'reas_mod_blood_relations',
      topic_id: 'topic_reas_single_person',
      category_id: 'reasoning',
      title: 'Single-Person Blood Relation Puzzle',
      description: 'Pointing to a photograph of a boy, Suresh said, "He is the son of the only son of my mother." How is Suresh related to that boy?',
      instructions: 'Deduce the relation step by step.',
      task_type: 'MCQ',
      difficulty: 'MEDIUM',
      language: 'text',
      starter_code: '',
      solution: 'Father',
      explanation: 'Break it down: "My mother\'s only son" is Suresh himself. Therefore, the boy is the "son of Suresh". Thus, Suresh is the Father of the boy.',
      hints: JSON.stringify([
        'Who is the only son of Suresh\'s mother?',
        'Since Suresh is male, the only son of his mother is Suresh himself.',
      ]),
      options: JSON.stringify(['Brother', 'Uncle', 'Father', 'Grandfather']),
      correct_answer: 'Father',
      time_limit: 1,
      memory_limit: 64,
      points: 10,
      xp: 15,
      order_index: 8,
    },

    // TASK 9: Verbal English (Grammar / Subject-Verb Agreement)
    {
      id: 'task_verbal_subject_verb',
      course_id: 'verbal_english',
      module_id: 'verbal_mod_subject_verb_agreement',
      topic_id: 'topic_verbal_basic_rules',
      category_id: 'english',
      title: 'Subject-Verb Agreement with Collective Nouns',
      description: 'Choose the correct verb form to complete the sentence: "Neither of the two candidates ___ suitable for the engineering position."',
      instructions: 'Select the grammatically correct option.',
      task_type: 'MCQ',
      difficulty: 'MEDIUM',
      language: 'text',
      starter_code: '',
      solution: 'is',
      explanation: 'Indefinite pronouns like "neither", "either", and "each" are singular when used as pronouns, and take singular verbs ("is" rather than "are").',
      hints: JSON.stringify([
        'Pronouns like "neither" refer to one entity at a time.',
        'Singular pronouns take singular verbs.',
      ]),
      options: JSON.stringify(['is', 'are', 'were', 'have been']),
      correct_answer: 'is',
      time_limit: 1,
      memory_limit: 64,
      points: 10,
      xp: 15,
      order_index: 9,
    },

    // TASK 10: English Speaking (Job Interview Practice)
    {
      id: 'task_speaking_self_intro',
      course_id: 'english_speaking',
      module_id: 'speaking_mod_real_life',
      topic_id: 'topic_speaking_job_interview',
      category_id: 'speaking',
      title: 'Self Introduction in a Tech Interview',
      description: 'Prepare and structure your 60-second professional self-introduction for a software developer interview.',
      instructions: 'Follow the Present-Past-Future framework: 1. Who you are & current role, 2. Relevant past experience & key achievement, 3. Why this role excites you.',
      task_type: 'PRACTICAL',
      difficulty: 'EASY',
      language: 'text',
      starter_code: `Structure your response:\n1. Greeting & Current Focus:\n2. Past Project Highlight:\n3. Future Aspirations:`,
      solution: `Hello, thank you for having me today. My name is Pavan, and I am an aspiring software engineer specializing in Python and full-stack architecture. Recently, I built an offline-first learning system with SQLite caching and clean navigation. I am particularly excited about this role because your team tackles scalable distributed systems, which aligns perfectly with my passion for high-performance software.`,
      explanation: 'The Present-Past-Future framework delivers a confident, structured elevator pitch within 60 seconds without rambling.',
      hints: JSON.stringify([
        'Keep it under 90 seconds (around 150 words).',
        'Highlight one concrete technical achievement rather than listing generic qualities.',
      ]),
      time_limit: 3,
      memory_limit: 64,
      points: 15,
      xp: 25,
      order_index: 10,
    },
  ];

  for (const t of tasks) {
    await db.runAsync(
      `INSERT INTO practice_tasks (
        id, course_id, module_id, topic_id, category_id, title,
        description, instructions, task_type, difficulty, language,
        starter_code, solution, explanation, hints, options,
        correct_answer, approaches, time_limit, memory_limit,
        points, xp, order_index, is_active, is_completed,
        is_bookmarked, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, 0, 'NOT_STARTED', ?, ?);`,
      [
        t.id,
        t.course_id,
        t.module_id || null,
        t.topic_id || null,
        t.category_id,
        t.title,
        t.description,
        t.instructions || null,
        t.task_type,
        t.difficulty,
        t.language,
        t.starter_code,
        t.solution,
        t.explanation,
        t.hints || null,
        t.options || null,
        t.correct_answer || null,
        t.approaches || null,
        t.time_limit,
        t.memory_limit,
        t.points,
        t.xp,
        t.order_index,
        now,
        now,
      ]
    );

    // Insert test cases if any
    if (t.testCases && t.testCases.length > 0) {
      let tcIdx = 1;
      for (const tc of t.testCases) {
        const tcId = `tc_${t.id}_${tcIdx}`;
        await db.runAsync(
          `INSERT INTO task_test_cases (
            id, task_id, input, expected_output, is_hidden,
            order_index, weight, timeout_ms, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?);`,
          [tcId, t.id, tc.input, tc.expected_output, tc.is_hidden, tcIdx, t.time_limit * 1000, now]
        );
        tcIdx++;
      }
    }
  }
}
