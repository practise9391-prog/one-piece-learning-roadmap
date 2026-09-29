import { SQLiteDatabase } from 'expo-sqlite';

/**
 * Migration v22: Part 24 Real-World Project Builder, Portfolio & Project-Based Learning System
 */
export const v22_part24_project_builder = {
  version: 22,
  name: 'v22_part24_project_builder',
  up: async (db: SQLiteDatabase): Promise<void> => {
    const now = new Date().toISOString();

    // 1. Project Templates (Idea Library)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS project_templates (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'BEGINNER',
        estimated_hours INTEGER NOT NULL DEFAULT 10,
        required_skills TEXT NOT NULL DEFAULT '[]',
        recommended_courses TEXT NOT NULL DEFAULT '[]',
        recommended_topics TEXT NOT NULL DEFAULT '[]',
        prerequisites TEXT NOT NULL DEFAULT '[]',
        learning_outcomes TEXT NOT NULL DEFAULT '[]',
        suggested_features TEXT NOT NULL DEFAULT '[]',
        created_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_project_templates_cat ON project_templates (category, difficulty);
    `);

    // 2. User Projects
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS user_projects (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user',
        template_id TEXT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL DEFAULT 'BEGINNER',
        status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
        progress REAL NOT NULL DEFAULT 0.0,
        estimated_hours INTEGER NOT NULL DEFAULT 15,
        actual_hours REAL NOT NULL DEFAULT 0.0,
        start_date TEXT,
        target_date TEXT,
        completed_date TEXT,
        technologies TEXT NOT NULL DEFAULT '[]',
        github_url TEXT,
        live_url TEXT,
        problem_statement TEXT,
        goal TEXT,
        is_pinned_in_portfolio INTEGER NOT NULL DEFAULT 0,
        is_hidden_in_portfolio INTEGER NOT NULL DEFAULT 0,
        portfolio_order INTEGER NOT NULL DEFAULT 0,
        portfolio_description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (template_id) REFERENCES project_templates (id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_user_projects_user ON user_projects (user_id, status);
    `);

    // 3. Project Milestones (Roadmap)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS project_milestones (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        order_index INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'AVAILABLE',
        progress REAL NOT NULL DEFAULT 0.0,
        start_date TEXT,
        target_date TEXT,
        completed_date TEXT,
        FOREIGN KEY (project_id) REFERENCES user_projects (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_project_milestones_proj ON project_milestones (project_id, order_index);
    `);

    // 4. Project Tasks
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS project_tasks (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL,
        milestone_id TEXT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        task_type TEXT NOT NULL DEFAULT 'FEATURE',
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        status TEXT NOT NULL DEFAULT 'TODO',
        estimated_minutes INTEGER NOT NULL DEFAULT 60,
        actual_minutes INTEGER NOT NULL DEFAULT 0,
        due_date TEXT,
        completed_at TEXT,
        practice_task_id TEXT,
        order_index INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES user_projects (id) ON DELETE CASCADE,
        FOREIGN KEY (milestone_id) REFERENCES project_milestones (id) ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS idx_project_tasks_proj ON project_tasks (project_id, status);
    `);

    // 5. Project Learning Links ("Learn This First" connections)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS project_learning_links (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL,
        course_id TEXT NOT NULL,
        module_id TEXT,
        topic_id TEXT,
        relationship_type TEXT NOT NULL DEFAULT 'APPLIES',
        FOREIGN KEY (project_id) REFERENCES user_projects (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_project_learning_links ON project_learning_links (project_id, course_id);
    `);

    // 6. Project Features
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS project_features (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'MEDIUM',
        status TEXT NOT NULL DEFAULT 'PLANNED',
        milestone_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES user_projects (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_project_features_proj ON project_features (project_id);
    `);

    // 7. Project Bugs (Lightweight Tracker)
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS project_bugs (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'MEDIUM',
        status TEXT NOT NULL DEFAULT 'OPEN',
        reproduction_steps TEXT,
        expected_result TEXT,
        actual_result TEXT,
        resolution TEXT,
        created_at TEXT NOT NULL,
        resolved_at TEXT,
        FOREIGN KEY (project_id) REFERENCES user_projects (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_project_bugs_proj ON project_bugs (project_id, status);
    `);

    // 8. Project Test Cases
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS project_test_cases (
        id TEXT PRIMARY KEY NOT NULL,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        input TEXT,
        expected_output TEXT,
        actual_output TEXT,
        status TEXT NOT NULL DEFAULT 'NOT_RUN',
        test_type TEXT NOT NULL DEFAULT 'MANUAL',
        created_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES user_projects (id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_project_test_cases_proj ON project_test_cases (project_id);
    `);

    // 9. Project Documentation
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS project_documentation (
        project_id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        problem TEXT NOT NULL DEFAULT '',
        goal TEXT NOT NULL DEFAULT '',
        features TEXT NOT NULL DEFAULT '',
        technologies TEXT NOT NULL DEFAULT '',
        architecture TEXT NOT NULL DEFAULT '',
        database_decisions TEXT NOT NULL DEFAULT '',
        apis TEXT NOT NULL DEFAULT '',
        important_decisions TEXT NOT NULL DEFAULT '',
        challenges TEXT NOT NULL DEFAULT '',
        solutions TEXT NOT NULL DEFAULT '',
        testing TEXT NOT NULL DEFAULT '',
        deployment TEXT NOT NULL DEFAULT '',
        future_improvements TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL,
        FOREIGN KEY (project_id) REFERENCES user_projects (id) ON DELETE CASCADE
      );
    `);

    // 10. Portfolio Profile
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS portfolio_profiles (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL DEFAULT 'default_user' UNIQUE,
        name TEXT NOT NULL DEFAULT 'Pavan',
        headline TEXT NOT NULL DEFAULT 'Aspiring Software & Systems Engineer',
        bio TEXT NOT NULL DEFAULT '',
        skills TEXT NOT NULL DEFAULT '[]',
        location_text TEXT NOT NULL DEFAULT '',
        github_url TEXT NOT NULL DEFAULT '',
        linkedin_url TEXT NOT NULL DEFAULT '',
        portfolio_url TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL
      );
    `);

    // 11. Pre-seed Default Portfolio Profile
    await db.execAsync(`
      INSERT OR IGNORE INTO portfolio_profiles (
        id, user_id, name, headline, bio, skills, location_text, github_url, linkedin_url, portfolio_url, updated_at
      ) VALUES (
        'port_default_user', 'default_user', 'Pavan', 'Software & Full Stack Developer',
        'Passionate about scalable systems, clean architectures, and algorithmic problem solving.',
        '["Python", "DSA", "Django", "SQL", "JavaScript", "Linux", "Git"]',
        'Hyderabad, India', '', '', '', '${now}'
      );
    `);

    // 12. Pre-seed Rich Project Template Library across Categories
    const templates = [
      // Python
      {
        id: 'tmpl_py_cli',
        title: 'Developer CLI Automation Toolkit',
        description: 'Command line utility with argument parsing, file transforms, git hooks, and system metric logging.',
        category: 'PYTHON',
        difficulty: 'BEGINNER',
        estimated_hours: 12,
        required_skills: ['Python Basics', 'Argparse / Click', 'File I/O', 'OS Module'],
        recommended_courses: ['python', 'linux', 'git'],
        recommended_topics: ['Functions', 'File Handling', 'CLI Tools'],
        prerequisites: ['Python syntax', 'Command line basics'],
        learning_outcomes: ['Build installable CLI tools', 'Handle robust terminal IO', 'Process files asynchronously'],
        suggested_features: ['Custom commands', 'JSON/CSV export', 'Config file parsing', 'Colorized output'],
      },
      {
        id: 'tmpl_py_api',
        title: 'RESTful Bookmarking & Metadata Scraper API',
        description: 'Microservice that parses web pages, extracts OpenGraph metadata, generates favicons, and stores in SQLite.',
        category: 'PYTHON',
        difficulty: 'INTERMEDIATE',
        estimated_hours: 18,
        required_skills: ['Python', 'HTTP Requests', 'BeautifulSoup / Regex', 'SQLite'],
        recommended_courses: ['python', 'sql'],
        recommended_topics: ['Web Requests', 'Database Queries', 'Exception Handling'],
        prerequisites: ['Basic Python OOP', 'HTTP methods'],
        learning_outcomes: ['HTML scraping resilience', 'Relational data modeling', 'API error handling'],
        suggested_features: ['Tagging system', 'URL validation', 'Background thumbnail caching', 'Search endpoint'],
      },
      // DSA
      {
        id: 'tmpl_dsa_visualizer',
        title: 'Interactive Sorting & Graph Algorithm Simulator',
        description: 'Step-by-step algorithm visualizer tracking pointer comparisons, swaps, recursion stacks, and graph traversals.',
        category: 'DSA',
        difficulty: 'INTERMEDIATE',
        estimated_hours: 20,
        required_skills: ['Algorithms', 'Data Structures', 'State Management', 'Array Manipulation'],
        recommended_courses: ['dsa', 'javascript'],
        recommended_topics: ['Sorting Algorithms', 'Graph BFS/DFS', 'Recursion'],
        prerequisites: ['Basic Big-O complexity', 'Tree and Graph definitions'],
        learning_outcomes: ['Understand algorithm state step-throughs', 'Calculate real-time comparisons', 'Visualize space complexity'],
        suggested_features: ['Speed slider', 'Custom array input', 'Step-by-step execution mode', 'Time/Space complexity card'],
      },
      // Web
      {
        id: 'tmpl_web_learning',
        title: 'Developer Task & Study Planner Web App',
        description: 'Responsive single-page task manager with drag-and-drop kanban boards, category tags, and local storage cache.',
        category: 'WEB',
        difficulty: 'BEGINNER',
        estimated_hours: 15,
        required_skills: ['HTML5', 'CSS3 Flexbox/Grid', 'JavaScript ES6+', 'DOM API'],
        recommended_courses: ['html', 'css', 'javascript'],
        recommended_topics: ['DOM Manipulation', 'Event Listeners', 'Local Storage'],
        prerequisites: ['Semantic HTML', 'CSS styling fundamentals'],
        learning_outcomes: ['State synchronization with LocalStorage', 'Responsive UI for mobile/desktop', 'Accessible form controls'],
        suggested_features: ['Kanban columns', 'Priority filter', 'Dark/Light theme toggle', 'Export to JSON'],
      },
      // Django
      {
        id: 'tmpl_django_auth_portal',
        title: 'Enterprise RBAC Authentication & Membership Portal',
        description: 'Full-stack Django web portal with user registration, custom permissions, role-based dashboards, and password resets.',
        category: 'DJANGO',
        difficulty: 'ADVANCED',
        estimated_hours: 25,
        required_skills: ['Django', 'Python', 'ORM', 'Relational DB', 'CSRF & Security'],
        recommended_courses: ['django', 'python', 'sql'],
        recommended_topics: ['Django Models', 'Forms & Views', 'Authentication', 'Middleware'],
        prerequisites: ['Python OOP', 'Basic SQL relational schema'],
        learning_outcomes: ['Role-based access control (RBAC)', 'Django authentication signals', 'Secure session cookies'],
        suggested_features: ['Admin management portal', 'Audit log middleware', 'Email verification simulation', 'Profile avatar upload'],
      },
      // SQL
      {
        id: 'tmpl_sql_hospital',
        title: 'Healthcare & Patient Management Database System',
        description: 'Comprehensive relational database schema with patient records, doctor scheduling, billing, and transactional integrity.',
        category: 'SQL',
        difficulty: 'INTERMEDIATE',
        estimated_hours: 16,
        required_skills: ['SQL Schema Design', 'Foreign Keys', 'Indexes', 'Triggers', 'Stored Views'],
        recommended_courses: ['sql'],
        recommended_topics: ['JOINs', 'Subqueries', 'Transactions & ACID', 'Indexing'],
        prerequisites: ['Relational algebra basics', 'Table creation syntax'],
        learning_outcomes: ['3NF Normalization', 'Preventing double-booking with constraints', 'Query optimization with EXPLAIN'],
        suggested_features: ['Doctor availability view', 'Billing invoice aggregation query', 'Appointment booking transaction', 'Monthly revenue reports'],
      },
      // JavaScript
      {
        id: 'tmpl_js_dashboard',
        title: 'Personal Financial Analytics & Expense Tracker',
        description: 'Interactive dashboard calculating daily burns, category spending graphs, recurring subscriptions, and budget goals.',
        category: 'JAVASCRIPT',
        difficulty: 'INTERMEDIATE',
        estimated_hours: 18,
        required_skills: ['JavaScript ES6+', 'Array Methods (map/reduce/filter)', 'SVG/Canvas Charts', 'Async/Await'],
        recommended_courses: ['javascript'],
        recommended_topics: ['Promises & Async', 'Array Functional Methods', 'Modular Architecture'],
        prerequisites: ['Basic JavaScript variables and control flow'],
        learning_outcomes: ['Aggregation calculations using functional programming', 'Dynamic rendering without external dependencies', 'Clean modular code structure'],
        suggested_features: ['Monthly budget alerts', 'CSV statement import', 'Interactive bar chart', 'Category donut breakdown'],
      },
      // Frappe
      {
        id: 'tmpl_frappe_inventory',
        title: 'Custom Inventory & Asset Tracking ERP Module',
        description: 'Enterprise Frappe app with custom DocTypes, serial number tracking, barcode scanning integration, and automated alerts.',
        category: 'FRAPPE',
        difficulty: 'EXPERT',
        estimated_hours: 30,
        required_skills: ['Frappe Framework', 'Python Server Scripts', 'Client Controller JS', 'DocTypes', 'MariaDB / PostgreSQL'],
        recommended_courses: ['frappe', 'python'],
        recommended_topics: ['DocType Design', 'Server Scripts', 'Workflow States', 'Custom Reports'],
        prerequisites: ['Python basics', 'Understanding of ERP workflows'],
        learning_outcomes: ['Develop production Frappe apps', 'Manage stock ledgers and valuation', 'Write Frappe custom APIs'],
        suggested_features: ['Stock replenishment alerts', 'Asset transfer workflow', 'PDF delivery note generation', 'Custom dashboard metrics'],
      },
      // ML
      {
        id: 'tmpl_ml_classifier',
        title: 'Student Performance & Placement Readiness Predictor',
        description: 'Machine learning classification pipeline predicting placement readiness based on practice consistency and topic mastery.',
        category: 'ML',
        difficulty: 'ADVANCED',
        estimated_hours: 24,
        required_skills: ['Python', 'NumPy', 'Pandas', 'Scikit-Learn', 'Feature Engineering'],
        recommended_courses: ['ml_developer', 'python'],
        recommended_topics: ['Data Preprocessing', 'Classification Models', 'Model Evaluation (Precision/Recall)'],
        prerequisites: ['Basic statistics', 'Python list/dict manipulation'],
        learning_outcomes: ['Clean and normalize tabular data', 'Train decision tree and logistic regression models', 'Evaluate confusion matrices'],
        suggested_features: ['Feature importance visualization', 'Model persistence with joblib', 'Inference CLI script', 'Dataset balance analysis'],
      },
    ];

    for (const t of templates) {
      await db.runAsync(
        `INSERT OR IGNORE INTO project_templates (
          id, title, description, category, difficulty, estimated_hours,
          required_skills, recommended_courses, recommended_topics,
          prerequisites, learning_outcomes, suggested_features, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          t.id,
          t.title,
          t.description,
          t.category,
          t.difficulty,
          t.estimated_hours,
          JSON.stringify(t.required_skills),
          JSON.stringify(t.recommended_courses),
          JSON.stringify(t.recommended_topics),
          JSON.stringify(t.prerequisites),
          JSON.stringify(t.learning_outcomes),
          JSON.stringify(t.suggested_features),
          now,
        ]
      );
    }
  },
};
