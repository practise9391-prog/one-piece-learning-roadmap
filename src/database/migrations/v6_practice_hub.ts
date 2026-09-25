import { SQLiteDatabase } from 'expo-sqlite';

export const v6_practice_hub = {
  version: 6,
  name: 'v6_practice_hub',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Create practice_categories table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS practice_categories (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        theme TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL
      );
    `);

    // 2. Create practice_questions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS practice_questions (
        id TEXT PRIMARY KEY NOT NULL,
        category_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        question_type TEXT NOT NULL,
        content TEXT NOT NULL,
        solution TEXT NOT NULL,
        hint TEXT,
        example_input TEXT,
        example_output TEXT,
        options TEXT,
        correct_answer TEXT,
        topic TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'Curated',
        external_url TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        is_completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        is_bookmarked INTEGER NOT NULL DEFAULT 0,
        user_draft TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (category_id) REFERENCES practice_categories (id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_pq_category ON practice_questions(category_id);
      CREATE INDEX IF NOT EXISTS idx_pq_difficulty ON practice_questions(difficulty);
      CREATE INDEX IF NOT EXISTS idx_pq_topic ON practice_questions(topic);
      CREATE INDEX IF NOT EXISTS idx_pq_bookmarked ON practice_questions(is_bookmarked);
    `);

    // 3. Create practice_attempts table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS practice_attempts (
        id TEXT PRIMARY KEY NOT NULL,
        question_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        user_answer TEXT,
        is_correct INTEGER NOT NULL DEFAULT 0,
        attempted_at TEXT NOT NULL,
        FOREIGN KEY (question_id) REFERENCES practice_questions (id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_pa_question ON practice_attempts(question_id);
      CREATE INDEX IF NOT EXISTS idx_pa_category ON practice_attempts(category_id);
    `);

    // 4. Seed initial practice categories
    const now = new Date().toISOString();
    const categories = [
      ['dsa', 'DSA', 'Master data structures and problem solving', '🧩', 'dsa', 1],
      ['python', 'Python', 'Core language mastery and scripts', '🐍', 'python', 2],
      ['sql', 'SQL', 'Database querying, aggregation and joins', '🗄️', 'sql', 3],
      ['javascript', 'JavaScript', 'Modern JS, closures, async and DOM', '⚡', 'javascript', 4],
      ['git', 'Git', 'Version control commands, branching and rebase', '🌿', 'git', 5],
      ['linux', 'Linux', 'Terminal shell navigation and permissions', '🐧', 'linux', 6],
      ['frappe', 'Frappe', 'DocTypes, ORM and Frappe framework', '⚙️', 'frappe', 7],
      ['django', 'Django', 'MVT architecture, models and ORM', '🌐', 'django', 8],
      ['aptitude', 'Aptitude & Reasoning', 'Logical patterns and quantitative speed', '🧠', 'aptitude', 9],
      ['english', 'English', 'Technical comprehension and vocabulary', '📖', 'english', 10],
    ];

    for (const [id, name, desc, icon, theme, order] of categories) {
      await db.runAsync(
        `INSERT OR IGNORE INTO practice_categories (
          id, name, description, icon, theme, order_index, is_active, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?);`,
        [id, name, desc, icon, theme, order, now]
      );
    }

    // 5. Seed initial curated practice questions across all 10 categories
    const questions: [string, string, string, string, string, string, string, string, string | null, string | null, string | null, string | null, string | null, string, string, number][] = [
  [
    "py_q1",
    "python",
    "Variables and Data Types",
    "Which built-in Python function is used to check the memory type of an object?",
    "EASY",
    "MCQ",
    "# Identify the type function in Python",
    "The type() function returns the class type of an argument passed to it.",
    "It has 4 letters and starts with t.",
    "x = 10; type(x)",
    "<class int>",
    "[\"typeof()\", \"type()\", \"isinstance()\", \"id()\"]",
    "type()",
    "Variables",
    "Curated",
    1
  ],
  [
    "py_q2",
    "python",
    "Sum of Array Elements",
    "Write a function `sum_numbers(arr)` that returns the sum of all elements in the given list of integers.",
    "EASY",
    "CODING",
    "def sum_numbers(arr):\n    # Write your solution here\n    pass",
    "def sum_numbers(arr):\n    return sum(arr)",
    "You can use a for-loop accumulator or Python built-in sum() function.",
    "[1, 2, 3, 4]",
    "10",
    null,
    null,
    "Lists",
    "Curated",
    2
  ],
  [
    "py_q3",
    "python",
    "Fix Colon Syntax Error",
    "The following function definition causes a SyntaxError. What is missing?",
    "EASY",
    "DEBUGGING",
    "def greet(name)\n    print(\"Hello, \" + name)",
    "In Python, def statement lines must conclude with a colon (:) before indented block.",
    "Look at the end of the first line.",
    null,
    null,
    null,
    "Colon missing after def greet(name)",
    "Functions",
    "Curated",
    3
  ],
  [
    "py_q4",
    "python",
    "What is a Python Dictionary?",
    "Explain the internal data structure and key properties of Python dictionaries.",
    "EASY",
    "CONCEPT",
    "# Concept Review: Python Dictionaries",
    "A Python dictionary is a hash map data structure that stores key-value pairs with O(1) average lookup, insertion, and deletion time complexity.",
    "Think about hash tables and key-value mapping.",
    "{\"name\": \"Luffy\", \"bounty\": 3000000000}",
    "Key-Value Hashmap",
    null,
    null,
    "Dictionaries",
    "Curated",
    4
  ],
  [
    "py_q5",
    "python",
    "List Comprehension Output",
    "What will this list comprehension print?",
    "MEDIUM",
    "OUTPUT_PREDICTION",
    "nums = [x * 2 for x in range(4) if x % 2 == 0]\nprint(nums)",
    "range(4) produces 0, 1, 2, 3. The condition x % 2 == 0 filters 0 and 2. Multiplying by 2 yields [0, 4].",
    "Evaluate the condition first, then multiply.",
    null,
    "[0, 4]",
    "[\"[0, 2, 4, 6]\", \"[0, 4]\", \"[2, 6]\", \"[0, 2]\"]",
    "[0, 4]",
    "Comprehensions",
    "Curated",
    5
  ],
  [
    "dsa_q1",
    "dsa",
    "Find Maximum Element",
    "Given an array of integers, find and return the maximum value in the array.",
    "EASY",
    "CODING",
    "function findMax(arr) {\n  let max = arr[0];\n  for (let i = 1; i < arr.length; i++) {\n    if (arr[i] > max) max = arr[i];\n  }\n  return max;\n}",
    "function findMax(arr) {\n  return Math.max(...arr);\n}",
    "Initialize your max variable with the first element, then scan the rest.",
    "[4, 7, 2, 9, 1]",
    "9",
    null,
    null,
    "Arrays",
    "LeetCode",
    1
  ],
  [
    "dsa_q2",
    "dsa",
    "Binary Search Complexity",
    "What is the worst-case time complexity of binary search on a sorted array of N elements?",
    "EASY",
    "MCQ",
    "// Array size N sorted in ascending order",
    "Binary search divides the search space in half at each iteration, resulting in O(log N) time complexity.",
    "Think about halving the search space repeatedly.",
    "Array of size 1024 -> ~10 checks",
    "O(log N)",
    "[\"O(1)\", \"O(N)\", \"O(log N)\", \"O(N log N)\"]",
    "O(log N)",
    "Searching",
    "Curated",
    2
  ],
  [
    "dsa_q3",
    "dsa",
    "Two Sum Target Check",
    "Given an array of integers and a target value, determine if any two numbers sum up to the target.",
    "MEDIUM",
    "CODING",
    "function hasTwoSum(arr, target) {\n  const seen = new Set();\n  for (const n of arr) {\n    if (seen.has(target - n)) return true;\n    seen.add(n);\n  }\n  return false;\n}",
    "Use a Hash Set to check for complementary values in O(N) time.",
    "For each element x, check if (target - x) is in a hash set.",
    "arr = [2, 7, 11, 15], target = 9",
    "true",
    null,
    null,
    "Arrays",
    "TakeUForward",
    3
  ],
  [
    "dsa_q4",
    "dsa",
    "Stack LIFO Principle",
    "Explain why Stack follows the Last-In First-Out (LIFO) pattern and its primary use cases.",
    "EASY",
    "CONCEPT",
    "// Concept Review: Stack Data Structure",
    "A Stack is an abstract data type where insertions and removals occur at the same end (top). Primary use cases: recursion call stacks, undo/redo mechanisms, and parentheses matching.",
    "Think of a stack of cafeteria plates.",
    "push(1), push(2), pop() -> 2",
    "LIFO Stack",
    null,
    null,
    "Stacks",
    "Curated",
    4
  ],
  [
    "sql_q1",
    "sql",
    "Select All Active Users",
    "Write a query to retrieve the username and email of all users whose status is \"active\".",
    "EASY",
    "SQL",
    "SELECT username, email FROM users WHERE status = \"active\";",
    "SELECT username, email\nFROM users\nWHERE status = 'active';",
    "Use SELECT ... FROM ... WHERE ...",
    "users table with columns (id, username, email, status)",
    "username, email of active users",
    null,
    null,
    "SELECT",
    "Curated",
    1
  ],
  [
    "sql_q2",
    "sql",
    "High Salary Filter",
    "Find all employees whose salary is strictly greater than 50000 ordered by salary descending.",
    "MEDIUM",
    "SQL",
    "SELECT * FROM employees WHERE salary > 50000 ORDER BY salary DESC;",
    "SELECT * FROM employees WHERE salary > 50000 ORDER BY salary DESC;",
    "Use WHERE salary > 50000 and ORDER BY salary DESC.",
    "employees table",
    "Filtered employee rows",
    null,
    null,
    "WHERE",
    "HackerRank",
    2
  ],
  [
    "sql_q3",
    "sql",
    "INNER JOIN vs LEFT JOIN",
    "What is the fundamental difference between an INNER JOIN and a LEFT JOIN in relational databases?",
    "EASY",
    "CONCEPT",
    "-- Concept Review: SQL Joins",
    "INNER JOIN returns only matching rows that satisfy the join condition in both tables. LEFT JOIN returns all rows from the left table, plus matched rows from the right table (or NULL if no match exists).",
    "Consider what happens when a row in the left table has no matching row in the right table.",
    "Table A LEFT JOIN Table B",
    "All rows from Table A preserved",
    null,
    null,
    "JOINs",
    "Curated",
    3
  ],
  [
    "js_q1",
    "javascript",
    "Scope of let vs var",
    "Which statement accurately describes the difference between `var` and `let` in modern JavaScript?",
    "EASY",
    "MCQ",
    "// Variable Declaration Scopes",
    "var is function-scoped (or globally scoped) and hoisted with undefined, while let is block-scoped and exists in a temporal dead zone until declared.",
    "Think about block curly braces { } scope.",
    null,
    null,
    "[\"var is block-scoped, let is function-scoped\", \"let is block-scoped, var is function-scoped\", \"Both are block-scoped\", \"Neither is hoisted\"]",
    "let is block-scoped, var is function-scoped",
    "Scope",
    "Curated",
    1
  ],
  [
    "js_q2",
    "javascript",
    "Reverse a String",
    "Write a function `reverseString(str)` that returns the reversed string.",
    "EASY",
    "CODING",
    "function reverseString(str) {\n  // Write your solution here\n  return str.split(\"\").reverse().join(\"\");\n}",
    "function reverseString(str) {\n  return str.split(\"\").reverse().join(\"\");\n}",
    "Use split, reverse, and join, or a loop backwards.",
    "\"pirate\"",
    "\"etarip\"",
    null,
    null,
    "Strings",
    "Curated",
    2
  ],
  [
    "git_q1",
    "git",
    "Create and Switch Branch",
    "Which Git command creates a new branch named \"feature-login\" and immediately switches to it?",
    "EASY",
    "MCQ",
    "$ git ... feature-login",
    "git checkout -b feature-login (or git switch -c feature-login) creates and checks out the branch in a single command.",
    "Look for the -b or -c creation flag.",
    null,
    null,
    "[\"git branch feature-login\", \"git checkout -b feature-login\", \"git commit -b feature-login\", \"git merge feature-login\"]",
    "git checkout -b feature-login",
    "Branching",
    "Curated",
    1
  ],
  [
    "git_q2",
    "git",
    "Discard Working Directory Changes",
    "Which command discards changes in a working directory file before it is staged?",
    "EASY",
    "MCQ",
    "$ git restore <file>",
    "git restore <file> (or git checkout -- <file> in older versions) discards uncommitted and unstaged working tree changes.",
    "Modern git uses the restore verb.",
    null,
    null,
    "[\"git restore <file>\", \"git remove <file>\", \"git delete <file>\", \"git uncommit <file>\"]",
    "git restore <file>",
    "Basics",
    "Curated",
    2
  ],
  [
    "linux_q1",
    "linux",
    "File Permissions 755",
    "What permissions does `chmod 755 script.sh` assign to User, Group, and Others?",
    "MEDIUM",
    "OUTPUT_PREDICTION",
    "$ chmod 755 script.sh",
    "7 = 4(r)+2(w)+1(x) = rwx for Owner. 5 = 4(r)+1(x) = r-x for Group. 5 = 4(r)+1(x) = r-x for Others.",
    "7 is rwx, 5 is rx.",
    null,
    "rwxr-xr-x",
    "[\"User: rwx, Group: r-x, Others: r-x\", \"User: rwx, Group: rw-, Others: r--\", \"User: r-x, Group: r-x, Others: r-x\", \"User: rwx, Group: rwx, Others: rwx\"]",
    "User: rwx, Group: r-x, Others: r-x",
    "Permissions",
    "Curated",
    1
  ],
  [
    "linux_q2",
    "linux",
    "Find Process by Name",
    "Which command combination searches for all running processes matching the name \"node\"?",
    "EASY",
    "MCQ",
    "$ ps aux | grep node",
    "ps aux outputs all active system processes, and piping to grep node filters the lines containing \"node\". pgrep node is also a valid alternative.",
    "Piping ps to grep is the classic Unix idiom.",
    null,
    null,
    "[\"ps aux | grep node\", \"ls -la | node\", \"cat /proc/node\", \"kill -9 node\"]",
    "ps aux | grep node",
    "Processes",
    "Curated",
    2
  ],
  [
    "frappe_q1",
    "frappe",
    "Frappe DocType Concept",
    "What is a DocType in the Frappe Framework?",
    "EASY",
    "CONCEPT",
    "// Frappe Framework DocType",
    "In Frappe, a DocType represents both the database table schema and the UI form controller. Every entity (e.g. User, Task) is defined as a DocType with metadata, fields, and permissions.",
    "It is the core building block of ERPNext and Frappe apps.",
    "DocType = Schema + Model + UI View",
    "Core Model Entity",
    null,
    null,
    "Architecture",
    "Curated",
    1
  ],
  [
    "frappe_q2",
    "frappe",
    "Frappe ORM Get Doc",
    "Which Python method in Frappe retrieves an existing document instance by DocType and name?",
    "EASY",
    "MCQ",
    "frappe.get_doc(doctype, name)",
    "frappe.get_doc(\"DocType\", name) loads the document controller with all child tables and methods into memory.",
    "Look for get_doc in the frappe namespace.",
    null,
    null,
    "[\"frappe.get_doc(doctype, name)\", \"frappe.find_document(doctype, name)\", \"frappe.db.fetch_one(doctype, name)\", \"frappe.load_record(doctype, name)\"]",
    "frappe.get_doc(doctype, name)",
    "ORM",
    "Curated",
    2
  ],
  [
    "django_q1",
    "django",
    "Django MVT Architecture",
    "What does MVT stand for in the context of the Django Web Framework?",
    "EASY",
    "MCQ",
    "// Django Architecture Pattern",
    "Django follows the Model-View-Template pattern: Model defines data structure/database, View handles business logic/routing, and Template renders HTML output.",
    "Model, View, and what handles HTML?",
    null,
    null,
    "[\"Model-View-Template\", \"Model-Variable-Transformation\", \"Module-View-Testing\", \"Main-Virtual-Thread\"]",
    "Model-View-Template",
    "Architecture",
    "Curated",
    1
  ],
  [
    "django_q2",
    "django",
    "Create Database Migrations",
    "Which Django management command inspects model changes and generates new migration files?",
    "EASY",
    "MCQ",
    "$ python manage.py makemigrations",
    "makemigrations creates new migrations based on the changes detected to your models, while migrate applies them to the database.",
    "Look for the command that creates migrations before applying.",
    null,
    null,
    "[\"python manage.py makemigrations\", \"python manage.py migrate\", \"python manage.py createmigrations\", \"python manage.py sync_db\"]",
    "python manage.py makemigrations",
    "ORM",
    "Curated",
    2
  ],
  [
    "apt_q1",
    "aptitude",
    "Number Series Sequence",
    "Find the next number in the series: 2, 6, 12, 20, 30, ?",
    "EASY",
    "MCQ",
    "2, 6, 12, 20, 30, ?",
    "The differences between consecutive numbers are: +4, +6, +8, +10. The next difference is +12, so 30 + 12 = 42.",
    "Check the difference between consecutive terms (+4, +6, +8, +10...).",
    "2 (+4) -> 6 (+6) -> 12 (+8) -> 20 (+10) -> 30 (+12) -> ?",
    "42",
    "[\"38\", \"40\", \"42\", \"44\"]",
    "42",
    "Number Series",
    "Curated",
    1
  ],
  [
    "eng_q1",
    "english",
    "Subject-Verb Agreement",
    "Choose the grammatically correct sentence:",
    "EASY",
    "MCQ",
    "Identify the correct sentence with proper subject-verb agreement.",
    "When subjects are connected by \"as well as\", the verb agrees with the first subject (\"The captain\"). Therefore, \"The captain, as well as his crew, is ready\" is correct.",
    "Focus on the main singular subject.",
    null,
    null,
    "[\"The captain, as well as his crew, are ready.\", \"The captain, as well as his crew, is ready.\", \"The captain, as well as his crew, were ready.\", \"The captain and his crew is ready.\"]",
    "The captain, as well as his crew, is ready.",
    "Grammar",
    "Curated",
    1
  ]
];

    for (const q of questions) {
      const [
        id, catId, title, desc, diff, qType, content, sol, hint, exIn, exOut, opts, ans, topic, src, order
      ] = q;

      await db.runAsync(
        `INSERT OR IGNORE INTO practice_questions (
          id, category_id, title, description, difficulty, question_type,
          content, solution, hint, example_input, example_output, options,
          correct_answer, topic, source, order_index, is_completed, is_bookmarked,
          user_draft, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, NULL, ?);`,
        [
          id, catId, title, desc, diff, qType,
          content, sol, hint, exIn, exOut, opts,
          ans, topic, src, order, now
        ]
      );
    }
  },
};
