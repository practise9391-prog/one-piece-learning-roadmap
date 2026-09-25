import { SQLiteDatabase } from 'expo-sqlite';

export const v7_news_system = {
  version: 7,
  name: 'v7_news_system',
  up: async (db: SQLiteDatabase): Promise<void> => {
    // 1. Create news_articles table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT,
        image_url TEXT,
        source_name TEXT NOT NULL,
        source_url TEXT,
        article_url TEXT NOT NULL,
        category TEXT NOT NULL,
        author TEXT,
        published_at TEXT NOT NULL,
        fetched_at TEXT NOT NULL,
        is_read INTEGER NOT NULL DEFAULT 0,
        is_bookmarked INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_na_category ON news_articles(category);
      CREATE INDEX IF NOT EXISTS idx_na_published ON news_articles(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_na_bookmarked ON news_articles(is_bookmarked);
      CREATE INDEX IF NOT EXISTS idx_na_read ON news_articles(is_read);
    `);

    // 2. Create news_preferences table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS news_preferences (
        category TEXT PRIMARY KEY NOT NULL,
        is_enabled INTEGER NOT NULL DEFAULT 1
      );
    `);

    // Seed default categories in preferences
    const defaultCategories = ['TECH', 'AI', 'DEVELOPER', 'STOCKS', 'EDUCATION', 'TRENDS'];
    for (const cat of defaultCategories) {
      await db.runAsync(
        'INSERT OR IGNORE INTO news_preferences (category, is_enabled) VALUES (?, 1);',
        [cat]
      );
    }

    // 3. Seed initial curated offline cache
    const now = new Date().toISOString();
    const articles = [
  [
    "seed_ai_1",
    "OpenAI Releases GPT-5 Frontier Architecture Preview",
    "New reasoning-centric models demonstrate zero-shot mathematical proof solving and advanced multimodal autonomous coding benchmarks.",
    "The latest architecture breakthrough combines tree-of-thought exploration with dynamic test-time computation scaling, enabling complex reasoning tasks to be verified before generating final tokens.",
    "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60",
    "AI Frontier Dispatch",
    "https://openai.com/news",
    "https://openai.com/index",
    "AI",
    "Elena Vance",
    "2026-09-24T18:30:00Z"
  ],
  [
    "seed_ai_2",
    "Open-Source LLMs Achieve Full Local Execution on Consumer Hardware",
    "Quantization breakthroughs with 2-bit matrix decomposition allow 70B parameter models to run at 40 tokens per second on consumer laptops.",
    "Researchers have published novel FP2 kernel mappings that preserve over 98% of FP16 accuracy while slashing memory footprints drastically, giving developers complete offline privacy.",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60",
    "Hugging Face Community",
    "https://huggingface.co/blog",
    "https://huggingface.co/blog/community",
    "AI",
    "Marcus Reed",
    "2026-09-24T14:15:00Z"
  ],
  [
    "seed_ai_3",
    "DeepMind Unveils Next-Generation Biological Molecule Predictor",
    "AlphaFold 3 extends structural modeling to protein-ligand interactions, accelerating personalized drug discovery and structural biology research.",
    "By modeling interactions across nucleic acids, small molecules, and chemical modifications simultaneously, researchers can now simulate cellular interactions with atom-level fidelity.",
    "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=60",
    "DeepMind Science",
    "https://deepmind.google/discover",
    "https://deepmind.google/discover/blog",
    "AI",
    "Sarah Chen, Ph.D.",
    "2026-09-23T11:00:00Z"
  ],
  [
    "seed_dev_1",
    "TypeScript 6.0 Ships with Instant Type Checking & Isolated Declarations",
    "The TypeScript engineering team announces parallel compilation engines and zero-overhead isolated declaration emission for modern bundlers.",
    "TypeScript 6 introduces major performance optimizations including native multi-threaded type checking and streamlined declaration generation that dramatically accelerates monorepo builds.",
    "https://images.unsplash.com/photo-1516116211227-bbc13c744140?w=800&auto=format&fit=crop&q=60",
    "TypeScript Blog",
    "https://devblogs.microsoft.com/typescript",
    "https://devblogs.microsoft.com/typescript",
    "DEVELOPER",
    "Anders Hejlsberg Team",
    "2026-09-24T16:00:00Z"
  ],
  [
    "seed_dev_2",
    "Python 3.14 Performance Milestone: Native JIT & Free-Threaded Concurrency",
    "Python core developers celebrate major benchmarks with the removal of the Global Interpreter Lock (GIL) and enhanced copy-on-write memory management.",
    "PEP 703 experimental free-threaded builds demonstrate linear CPU scaling across 32 cores for scientific computing and web workloads without lock contention.",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60",
    "Python Software Foundation",
    "https://blog.python.org",
    "https://blog.python.org",
    "DEVELOPER",
    "Guido & Python Council",
    "2026-09-24T10:45:00Z"
  ],
  [
    "seed_dev_3",
    "Django 5.2 & Frappe 16 Release: Async ORM and Realtime Reactive UI",
    "The python backend ecosystem steps forward with full asynchronous database transactions, websocket event hooks, and automated schema migrations.",
    "Both Django and Frappe deliver breakthrough developer ergonomic improvements including automated GraphQL/REST generation, hot-reloading doctypes, and reactive state stores.",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
    "Backend Chronicle",
    "https://www.djangoproject.com/weblog",
    "https://www.djangoproject.com/weblog",
    "DEVELOPER",
    "Carlton Gibson & Frappe Team",
    "2026-09-23T15:20:00Z"
  ],
  [
    "seed_tech_1",
    "Linux Kernel 6.12 Arrives with Real-Time PREEMPT_RT Fully Merged",
    "After two decades of collaborative engineering, deterministic real-time scheduling is officially part of the mainline Linux kernel tree.",
    "Industrial automation, robotics, high-frequency telecommunications, and audio production can now utilize standard upstream Linux kernels without custom out-of-tree patches.",
    "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=60",
    "Kernel.org News",
    "https://kernel.org",
    "https://kernelnewbies.org",
    "TECH",
    "Linus Torvalds",
    "2026-09-24T20:10:00Z"
  ],
  [
    "seed_tech_2",
    "Next-Generation Quantum Processor Demonstrates Error-Corrected Logical Qubits",
    "Physicists achieve breakthrough surface code fidelity exceeding the fault-tolerant threshold, preserving quantum states for over one hour.",
    "The achievement marks the critical transition from noisy intermediate-scale quantum devices into verifiable fault-tolerant quantum computing architectures.",
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=60",
    "MIT Technology Review",
    "https://www.technologyreview.com",
    "https://www.technologyreview.com",
    "TECH",
    "Dr. David K. Miller",
    "2026-09-23T09:30:00Z"
  ],
  [
    "seed_tech_3",
    "PostgreSQL 17 Supercharges Query Execution with Vectorized SIMD",
    "Postgres contributors announce native vectorized scanning, improved partitioned index joins, and enhanced JSON streaming capabilities.",
    "Data intensive analytical queries and high-concurrency OLTP workloads show up to 300% throughput gains on modern ARM64 and x86 AVX-512 hardware platforms.",
    "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60",
    "PostgreSQL Global Group",
    "https://www.postgresql.org/about/news",
    "https://www.postgresql.org/about/news",
    "TECH",
    "PG Core Team",
    "2026-09-22T14:00:00Z"
  ],
  [
    "seed_stocks_1",
    "Tech Index Surges as Semiconductor Capital Expenditure Reaches Record High",
    "Global technology equities rally amid massive investments in sub-2nm fabrication facilities and dedicated AI compute infrastructure worldwide.",
    "Market indices report sustained institutional inflows as cloud hyperscalers reaffirm multi-billion dollar datacenter commitments through the upcoming fiscal years.",
    "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=60",
    "Global Tech Finance",
    "https://www.bloomberg.com/technology",
    "https://www.bloomberg.com/technology",
    "STOCKS",
    "Financial Desk",
    "2026-09-24T12:00:00Z"
  ],
  [
    "seed_stocks_2",
    "Open-Source Infrastructure Startups Attract Record Series A Valuations",
    "Venture capital allocation shifts toward sustainable open-source developer tooling, local-first database engines, and secure supply chain auditing tools.",
    "Investors highlight developer adoption, GitHub star velocity, and enterprise support contracts as key metrics driving durable revenue growth in the developer space.",
    "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=60",
    "TechCrunch Venture",
    "https://techcrunch.com/category/startups",
    "https://techcrunch.com/category/startups",
    "STOCKS",
    "Alex Wilhelm",
    "2026-09-23T17:45:00Z"
  ],
  [
    "seed_edu_1",
    "The 2026 Developer Roadmap: Why Systems Thinking & Core Fundamentals Prevail",
    "Industry survey of 50,000 engineering leaders reveals high demand for strong foundations in Data Structures, OS Internals, and Database Architecture.",
    "While high-level syntax continues to evolve, engineers who understand memory layout, network protocols, and distributed consensus consistently lead top technology projects.",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60",
    "IEEE Spectrum Education",
    "https://spectrum.ieee.org",
    "https://spectrum.ieee.org",
    "EDUCATION",
    "Prof. Arthur Pendelton",
    "2026-09-24T08:00:00Z"
  ],
  [
    "seed_edu_2",
    "Mastering Deliberate Practice: How Consistent Streaks Rewire the Mind",
    "Cognitive neuroscience findings emphasize 25-minute daily deliberate problem-solving over sporadic marathon cramming sessions for long-term retention.",
    "Consistent daily problem solving produces durable synaptic consolidation, transforming difficult algorithm patterns into intuitive mental frameworks.",
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=60",
    "Learning Science Review",
    "https://mindandlearning.org",
    "https://mindandlearning.org",
    "EDUCATION",
    "Dr. Maya Lin",
    "2026-09-23T07:30:00Z"
  ],
  [
    "seed_trends_1",
    "Local-First Software Architecture: The Next Decade of Mobile & Web Apps",
    "CRDTs and embedded SQLite databases empower applications to work flawlessly offline with zero network latency and background conflict-free sync.",
    "Developers and end-users increasingly reject sluggish cloud-only apps in favor of responsive, resilient local-first architectures where user data stays on their device.",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=60",
    "Architectural Trends",
    "https://localfirstweb.dev",
    "https://localfirstweb.dev",
    "TRENDS",
    "Martin Kleppmann Group",
    "2026-09-24T19:00:00Z"
  ],
  [
    "seed_trends_2",
    "Green Computing & Efficiency: The Push for Low-Wattage Codebases",
    "Data centers worldwide adopt efficiency ratings that reward optimized algorithmic complexity, efficient caching, and minimal carbon footprint compute.",
    "Major cloud providers introduce compute credits for energy-efficient architectures, incentivizing developers to optimize algorithms and eliminate idle compute.",
    "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=60",
    "Sustainable Tech Network",
    "https://greensoftware.foundation",
    "https://greensoftware.foundation",
    "TRENDS",
    "Aria Thorne",
    "2026-09-22T16:15:00Z"
  ]
];

    for (const a of articles) {
      const [id, title, desc, content, img, srcName, srcUrl, artUrl, cat, author, pubAt] = a;
      await db.runAsync(
        `INSERT OR IGNORE INTO news_articles (
          id, title, description, content, image_url,
          source_name, source_url, article_url, category,
          author, published_at, fetched_at, is_read, is_bookmarked
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0);`,
        [id, title, desc, content, img, srcName, srcUrl, artUrl, cat, author, pubAt, now]
      );
    }
  },
};
