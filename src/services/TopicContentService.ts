import { TopicContent } from '../models/TopicContent';

export class TopicContentService {
  getContent(
    courseId: string,
    moduleTitle: string,
    topicTitle: string,
    rawContent?: string | null
  ): TopicContent {
    if (rawContent && rawContent.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(rawContent) as TopicContent;
        if (parsed.explanation) {
          return parsed;
        }
      } catch {
        // Fall back
      }
    }

    const key = `${courseId.toLowerCase()}_${topicTitle.toLowerCase().trim()}`;
    const normalizedCourse = courseId.toLowerCase();

        if (normalizedCourse === 'system_design') {
      return this.generateSystemDesignContent(moduleTitle, topicTitle);
    }
    if (normalizedCourse === 'react') {
      return this.generateReactContent(moduleTitle, topicTitle);
    }
    if (normalizedCourse === 'algorithms') {
      return this.generateAlgorithmsContent(moduleTitle, topicTitle);
    }
    const curated = this.getCuratedContent(key, normalizedCourse, topicTitle);
    if (curated) {
      return curated;
    }

    return this.generateDefaultContent(normalizedCourse, moduleTitle, topicTitle);
  }

  private getCuratedContent(
    key: string,
    courseId: string,
    topicTitle: string
  ): TopicContent | null {
    const registry: Record<string, TopicContent> = {
      'python_what is python?': {
        title: 'What is Python?',
        explanation:
          'Python is a high-level, interpreted, general-purpose programming language created by Guido van Rossum in 1991. It emphasizes code readability with its distinctive use of significant indentation. Python is dynamically typed and garbage-collected.',
        codeSnippet: {
          language: 'python',
          code: `# Welcome to Python!\ndef greet_pirate(captain):\n    phrase = f"Ahoy, Captain {captain}! Welcome to Python."\n    return phrase\n\nprint(greet_pirate("Luffy"))`,
          output: 'Ahoy, Captain Luffy! Welcome to Python.',
        },
        examples: [
          'Web Development (Django, FastAPI)',
          'Data Science & AI (Pandas, PyTorch)',
          'Automation & Scripting',
        ],
        tips: [
          'Python prioritizes readability: "Readability counts" - The Zen of Python.',
          'Always use 4 spaces for indentation, never mix tabs and spaces.',
        ],
        importantPoints: [
          'Interpreted language: executed line by line.',
          'Cross-platform: runs on Linux, macOS, and Windows.',
          'Batteries Included: vast standard library for almost any task.',
        ],
      },
      'python_defining functions': {
        title: 'Defining Functions',
        explanation:
          "A function is a reusable block of code that only runs when called. Functions help organize programs into modular, manageable chunks and follow the DRY (Don't Repeat Yourself) principle.",
        codeSnippet: {
          language: 'python',
          code: `# Defining a function with def keyword\ndef calculate_bounty(base_bounty, multiplier=2):\n    final_bounty = base_bounty * multiplier\n    return final_bounty\n\ncurrent_bounty = calculate_bounty(1500000000, 2)\nprint(f"New Straw Hat Bounty: ฿{current_bounty:,}")`,
          output: 'New Straw Hat Bounty: ฿3,000,000,000',
        },
        examples: [
          'def my_function(): pass',
          'def add(a, b): return a + b',
        ],
        tips: [
          'Always give functions descriptive snake_case names indicating their action.',
          'Write a docstring directly below the def line.',
        ],
        importantPoints: [
          'Use the def keyword followed by function name and parameters.',
          'Functions without an explicit return statement return None.',
          'Variables created inside a function have local scope.',
        ],
      },
    };

    return registry[key] || null;
  }

  private generateDefaultContent(
    courseId: string,
    moduleTitle: string,
    topicTitle: string
  ): TopicContent {
    // 1. APTITUDE CONTENT
    if (courseId === 'aptitude' || courseId === 'aptitude_reasoning') {
      return this.generateAptitudeContent(moduleTitle, topicTitle);
    }

    // 2. REASONING CONTENT
    if (courseId === 'reasoning') {
      return this.generateReasoningContent(moduleTitle, topicTitle);
    }

    // 3. VERBAL ENGLISH CONTENT
    if (courseId === 'verbal_english' || courseId === 'english') {
      return this.generateVerbalEnglishContent(moduleTitle, topicTitle);
    }

    // 4. ENGLISH SPEAKING CONTENT
    if (courseId === 'english_speaking' || courseId === 'speaking') {
      return this.generateEnglishSpeakingContent(moduleTitle, topicTitle);
    }

    // 5. STANDARD PROGRAMMING/ENGINEERING COURSES
    const lang = this.getLanguageForCourse(courseId);
    return {
      title: topicTitle,
      explanation: `Mastering "${topicTitle}" is an essential milestone in the ${moduleTitle} module. This concept forms a key foundation for building robust, scalable software in ${courseId.toUpperCase()}.`,
      codeSnippet: {
        language: lang,
        code: this.generateCodeTemplate(courseId, topicTitle),
        output: `// Verified execution of ${topicTitle} successfully completed.`,
      },
      examples: [
        `Standard implementation in modern ${courseId}`,
        `Real-world enterprise production pattern`,
      ],
      tips: [
        `Practice writing code by hand to build muscle memory for ${topicTitle}.`,
        `Always test edge cases and error boundaries when applying this pattern.`,
      ],
      importantPoints: [
        `Core concept required for mastering ${moduleTitle}.`,
        `Directly aligns with software engineering best practices.`,
      ],
    };
  }

  private generateAptitudeContent(moduleTitle: string, topicTitle: string): TopicContent {
    return {
      title: topicTitle,
      explanation: `In quantitative aptitude, "${topicTitle}" is a high-yield concept under ${moduleTitle}. Understanding the underlying algebraic relationships and applying fast mental arithmetic eliminates lengthy steps during placement and competitive assessments.`,
      formulaCard: {
        title: `${topicTitle} — Key Formula & Shortcut`,
        formula: this.getAptitudeFormula(topicTitle),
        explanation: 'Apply substitution and reduction to solve this class of problems within 45 to 60 seconds.',
      },
      examples: [
        `Standard competitive exam scenario: calculate unknown variable given boundary conditions.`,
        `Shortcut technique: eliminate impossible options using unit digits and divisibility checks.`,
      ],
      commonMistakes: [
        {
          mistake: 'Using long division or manual multiplication when ratio reduction works.',
          correction: 'Factorize numbers or cancel common terms before calculating final values.',
          explanation: 'Reduces arithmetic errors and saves up to 40 seconds per problem.',
        },
        {
          mistake: 'Forgetting to convert units (e.g. km/h to m/s, or months to years in SI).',
          correction: 'Always align all dimensions to SI base units before inserting into formulas.',
        },
      ],
      practiceProblem: {
        question: `Sample Assessment Drill: In an exam testing ${topicTitle}, two numbers have a ratio of 3:4. If each number is increased by 10, the new ratio becomes 4:5. What is the smaller number?`,
        hint: 'Let the numbers be 3x and 4x. Set up the equation: (3x + 10) / (4x + 10) = 4/5.',
        solution: 'Cross-multiply: 5(3x + 10) = 4(4x + 10) => 15x + 50 = 16x + 40 => x = 10. The smaller number is 3x = 30.',
      },
      tips: [
        'Always look for common factors before performing multiplication.',
        'Use approximations to eliminate at least two answer choices immediately.',
      ],
      importantPoints: [
        `Frequently tested in corporate technical placement tests (TCS, Infosys, Accenture).`,
        `Accuracy matters more than speed initially; speed naturally follows conceptual clarity.`,
      ],
    };
  }

  private generateReasoningContent(moduleTitle: string, topicTitle: string): TopicContent {
    return {
      title: topicTitle,
      explanation: `Logical reasoning for "${topicTitle}" tests your ability to identify hidden structural patterns, eliminate contradictions, and make valid deductions from given premises under ${moduleTitle}.`,
      tips: [
        'Draw clear diagrammatic representations: family trees, linear grids, or Venn diagrams.',
        'Never assume information that is not explicitly stated in the problem statement.',
      ],
      importantPoints: [
        'Categorize the given information into Definite Clues vs Conditional Clues.',
        'Start your solution from definite anchors (e.g., "A sits at the extreme left").',
      ],
      commonMistakes: [
        {
          mistake: 'Assuming gender in blood relations based solely on names (e.g., Alex, Jordan).',
          correction: 'Only determine gender if explicitly defined by pronouns or relation titles.',
          explanation: 'A common trick question in TCS and corporate aptitude tests.',
        },
      ],
      practiceProblem: {
        question: `Logical Challenge on ${topicTitle}: If A is the sister of B, B is the daughter of C, and D is the father of C, how is A related to D?`,
        hint: 'Map the family tree across generation levels: D (top) -> C (middle) -> B & A (bottom).',
        solution: 'Since A and B are sisters and daughters of C, and D is the father of C, A is the Granddaughter of D.',
      },
      examples: [
        'Pattern 1: Direct sequential deduction with single variable.',
        'Pattern 2: Multi-attribute matrix elimination grid.',
      ],
    };
  }

  private generateVerbalEnglishContent(moduleTitle: string, topicTitle: string): TopicContent {
    return {
      title: topicTitle,
      explanation: `Mastering "${topicTitle}" in ${moduleTitle} builds your precision in corporate and placement English. Eliminating grammatical ambiguities ensures your written and spoken communication conveys authority and clarity.`,
      vocabulary: [
        { word: 'Precision', meaning: 'Exactness and accuracy of expression', example: 'His email stated the project milestones with precision.' },
        { word: 'Cohesion', meaning: 'Logical flow and consistency', example: 'Transitions between paragraphs gave the essay strong cohesion.' },
        { word: 'Nuance', meaning: 'A subtle distinction in meaning', example: 'A master communicator understands the nuance between frugal and cheap.' },
      ],
      commonMistakes: [
        {
          mistake: 'Using redundant phrasing like "revert back" or "repeat again".',
          correction: 'Simply say "revert" or "repeat".',
          explanation: 'The prefix "re-" already implies back/again.',
        },
        {
          mistake: 'Subject-verb mismatch with collective nouns: "The committee have decided."',
          correction: 'Use singular in formal corporate English: "The committee has decided."',
        },
      ],
      betterWays: [
        'Instead of: "I am writing this email to tell you that..." → "I am writing to inform you that..."',
        'Instead of: "Please do the needful." → "Please review the attached document and let me know your thoughts."',
        'Instead of: "Can you help me ASAP?" → "Could you please assist with this by 3 PM today?"',
      ],
      practiceProblem: {
        question: `Sentence Correction Drill: Spot the error in: "Each of the software engineers have completed their security compliance module."`,
        hint: '"Each" is an indefinite pronoun that takes a singular verb and singular pronoun.',
        solution: 'Correction: "Each of the software engineers HAS completed HIS OR HER (or their in modern neutral) security compliance module."',
      },
      tips: [
        'Read sentences aloud to spot awkward rhythm, misplaced modifiers, and tense shifts.',
        'Always identify the true subject of the sentence by ignoring intervening clauses.',
      ],
      importantPoints: [
        `Directly aligns with placement verbal ability tests and corporate email standards.`,
        `Focus on active voice and concise vocabulary to communicate effectively.`,
      ],
    };
  }

  private generateEnglishSpeakingContent(moduleTitle: string, topicTitle: string): TopicContent {
    return {
      title: topicTitle,
      explanation: `The goal of "${topicTitle}" under ${moduleTitle} is to build spoken English confidence in real situations without fear of making mistakes. Fluency is achieved through active expression, clear rhythm, and natural pauses.`,
      vocabulary: [
        { word: 'Collaborate', meaning: 'Work together towards a common goal', example: 'I collaborate closely with our design team.' },
        { word: 'Implement', meaning: 'Put a decision or plan into effect', example: 'We implemented the new login flow yesterday.' },
        { word: 'Perspective', meaning: 'A particular attitude or way of regarding something', example: 'From my perspective, this solution is more scalable.' },
      ],
      dialogue: [
        { speaker: 'Colleague', text: 'Hi! Could you give me a quick update on your current module?' },
        { speaker: 'You', text: 'Sure! I have completed the core data structures and I am now testing user flows.' },
        { speaker: 'Colleague', text: 'That sounds great! Are you facing any technical roadblocks?' },
        { speaker: 'You', text: 'Everything is running smoothly, but I may need your feedback on the API contract later today.' },
      ],
      commonMistakes: [
        {
          mistake: '"I am working in this company from two years."',
          correction: '"I have been working at this company for two years."',
          explanation: 'Use the present perfect continuous with "for" to express duration continuing into the present.',
        },
        {
          mistake: '"He did not wrote the test."',
          correction: '"He did not write the test."',
          explanation: 'After "did/did not", always use the base form of the verb.',
        },
      ],
      betterWays: [
        'Instead of: "I am having doubt." → "I have a question regarding..."',
        'Instead of: "Today I will discuss about..." → "Today I will discuss..." (No "about" needed with discuss)',
        'Instead of: "Can you explain once more?" → "Could you please elaborate on that point?"',
      ],
      speakingPrompt: `Speak aloud for 60 seconds on "${topicTitle}". Focus on speaking smoothly without apologizing for pauses or minor grammar errors. Keep moving forward!`,
      tips: [
        'Speak slowly and pause between sentences instead of using filler words like "um", "uh", or "like".',
        'Think in English phrases rather than translating whole sentences word-by-word from your native tongue.',
      ],
      importantPoints: [
        'Speak Without Fear: Native speakers and recruiters care about clarity and confidence, not absolute perfection.',
        'Daily practice of even 2 minutes builds muscle memory and vocal confidence.',
      ],
    };
  }

  
  private generateSystemDesignContent(moduleTitle: string, topicTitle: string): TopicContent {
    const tLower = topicTitle.toLowerCase();
    const mLower = moduleTitle.toLowerCase();

    let analogyTitle = 'Restaurant Operations & Kitchen Flow';
    let analogyScenario = 'Customer (Client) places order with Waiter (API Gateway / Load Balancer), who sends it to Kitchen Chefs (App Servers). The Chefs pull pre-chopped ingredients from Countertop (Redis Cache) and store bulk reserves in Basement Walk-in Freezer (Primary Database).';
    let mapping = [
      { realWorld: 'Customer Ordering', systemDesign: 'Client Request (Web / iOS / Android)', explanation: 'Initiates request over HTTP/TLS to start work.' },
      { realWorld: 'Waiter / Head Host', systemDesign: 'Load Balancer / API Gateway', explanation: 'Directs customer to available tables and balances kitchen load.' },
      { realWorld: 'Countertop Ingredients', systemDesign: 'In-Memory Cache (Redis)', explanation: 'Sub-millisecond retrieval of hot, frequently accessed data.' },
      { realWorld: 'Basement Storage', systemDesign: 'Persistent Relational DB', explanation: 'Durable, ACID-compliant storage for source-of-truth records.' },
    ];

    let nodes: any[] = [
      { id: 'client', label: 'User Client', role: 'Sends request over HTTPS / DNS lookup', type: 'client' },
      { id: 'cdn', label: 'Edge CDN', role: 'Caches static assets & terminates TLS close to user', type: 'cdn', techExamples: ['Cloudflare', 'CloudFront'] },
      { id: 'lb', label: 'Load Balancer', role: 'Distributes traffic across backend cluster (Round Robin / Least Conn)', type: 'lb', techExamples: ['Nginx', 'HAProxy', 'AWS ALB'] },
      { id: 'app', label: 'Application Cluster', role: 'Stateless business logic processing instances', type: 'service', techExamples: ['Node.js', 'Go', 'Python/Django'] },
      { id: 'cache', label: 'In-Memory Cache', role: 'Sub-millisecond hot data retrieval', type: 'cache', techExamples: ['Redis', 'Memcached'], hitMissInfo: 'Cache Hit Rate Target: >95%' },
      { id: 'db', label: 'Primary DB + Replicas', role: 'ACID persistent records with read replica scaling', type: 'database', techExamples: ['PostgreSQL', 'MySQL', 'CockroachDB'] },
    ];

    let tradeOffs = {
      title: topicTitle + ' Architectural Trade-Offs',
      optionA: 'Simpler / Monolithic Approach',
      optionB: 'Distributed / Scaled Approach',
      comparison: [
        { criterion: 'Operational Complexity', optionA: 'Low (single codebase, simple deploys)', optionB: 'High (network latency, observability, distributed state)' },
        { criterion: 'Scalability Limit', optionA: 'Hardware ceiling (Vertical Scaling)', optionB: 'Near-infinite (Horizontal Scale-Out across nodes)' },
        { criterion: 'Fault Isolation', optionA: 'Bug or crash brings down entire system', optionB: 'Isolated failures; gracefully degrades non-critical tiers' },
      ],
      recommendation: 'Begin with standard monolith and relational DB. Introduce caching, load balancing, and queues as concurrency and SLA bottlenecks emerge.',
    };

    let interviewQuestions = [
      {
        question: 'How would you design and scale ' + topicTitle + ' under 100,000 requests/second?',
        answer: 'Employ multi-tier scaling: edge CDN caching, redundant L4/L7 load balancers, stateless autoscaling application containers, write-back or read-through Redis cluster, and sharded database replicas with connection pooling.',
        tips: 'Always clarify functional vs non-functional requirements (RPS, latency targets, read/write ratio) before diagramming.',
      },
      {
        question: 'What are the primary single points of failure in this architecture?',
        answer: 'Single points of failure include an un-replicated database master, an active-passive load balancer without automated DNS failover, or an in-memory cache without sentinel/cluster replication.',
        tips: 'Highlight multi-AZ redundancy and automated health check failovers.',
      },
    ];

    if (tLower.includes('cache') || tLower.includes('redis') || tLower.includes('memcached')) {
      analogyTitle = 'Restaurant Kitchen Spice Rack';
      analogyScenario = 'A chef places the top 5 spices directly on the cooking counter. They only walk to the deep walk-in pantry if a recipe calls for an unusual spice.';
      mapping = [
        { realWorld: 'Counter Spice Rack', systemDesign: 'Redis In-Memory Cache', explanation: 'Sub-millisecond retrieval of hot data directly from RAM.' },
        { realWorld: 'Walk-in Pantry', systemDesign: 'Persistent PostgreSQL Database', explanation: 'High-capacity disk storage that is slower to access.' },
        { realWorld: 'Spice Not on Counter', systemDesign: 'Cache Miss', explanation: 'Fall back to querying primary database and repopulate cache.' },
      ];
      tradeOffs = {
        title: 'Cache-Aside vs Write-Through Caching',
        optionA: 'Cache-Aside (Lazy Loading)',
        optionB: 'Write-Through',
        comparison: [
          { criterion: 'Data Freshness', optionA: 'Potential stale data until TTL expires', optionB: 'Always synchronized with DB' },
          { criterion: 'Write Latency', optionA: 'Fast (single write to database)', optionB: 'Higher (dual write to Cache & DB)' },
          { criterion: 'Cache Churn', optionA: 'Only requested data cached', optionB: 'All written data cached, even if unread' },
        ],
        recommendation: 'Use Cache-Aside for read-heavy workloads where slight staleness is tolerable. Use Write-Through for financial ledgers or inventory counts.',
      };
    } else if (tLower.includes('queue') || tLower.includes('kafka') || tLower.includes('async') || tLower.includes('event')) {
      analogyTitle = 'Restaurant Kitchen Order Carousel';
      analogyScenario = 'Waiters clip order tickets onto a revolving carousel. Cooks pull tickets off one by one at their own pace. Waiters do not wait in the kitchen until food is cooked.';
      mapping = [
        { realWorld: 'Waiter placing ticket', systemDesign: 'Message Producer', explanation: 'Publishes event to queue without waiting for consumer execution.' },
        { realWorld: 'Order Carousel', systemDesign: 'Message Broker (Kafka / RabbitMQ)', explanation: 'Buffers tasks durably even if workers crash or slow down.' },
        { realWorld: 'Line Cooks cooking', systemDesign: 'Consumer Worker Fleet', explanation: 'Pulls and processes jobs asynchronously in background.' },
      ];
      nodes = [
        { id: 'client', label: 'Client Device', role: 'Submits order / file upload request', type: 'client' },
        { id: 'api', label: 'API Gateway', role: 'Validates request and publishes event', type: 'gateway', techExamples: ['Kong', 'AWS API Gateway'] },
        { id: 'queue', label: 'Event Log / Queue', role: 'Partitioned message stream with replayability', type: 'queue', techExamples: ['Apache Kafka', 'RabbitMQ'] },
        { id: 'worker', label: 'Worker Fleet', role: 'Consumes jobs asynchronously with exponential backoff', type: 'service', techExamples: ['Go Workers', 'Celery'] },
        { id: 'db', label: 'Data Lake / Storage', role: 'Final processed results and audit ledger', type: 'storage', techExamples: ['AWS S3', 'PostgreSQL'] },
      ];
    }

    return {
      title: topicTitle,
      explanation: topicTitle + ' is a foundational concept in ' + moduleTitle + '. In modern high-throughput architectures, it ensures scalability, high availability, and resilient fault isolation while preventing performance bottlenecks under concurrent traffic.',
      analogy: {
        title: analogyTitle,
        scenario: analogyScenario,
        mapping: mapping,
      },
      architectureFlow: {
        title: topicTitle + ' Architecture Flow',
        description: 'Visualizing data traversal, component responsibilities, and request lifecycle for ' + topicTitle + '.',
        nodes: nodes,
        flowSteps: [
          'Client dispatches request to edge CDN / DNS',
          'Load balancer evaluates health checks and dispatches to app instance',
          'App server queries in-memory cache tier for sub-millisecond hot response',
          'On cache miss, app server reads from read-replica / primary database',
          'Response is serialized, cache populated, and payload returned to user',
        ],
      },
      tradeOffs: tradeOffs,
      interviewQuestions: interviewQuestions,
      examples: [
        'Netflix: Uses microservices, edge routing with Zuul, and distributed caching to stream to 230M+ subscribers.',
        'Uber: Employs consistent hashing and geospatial index sharding (H3) for millisecond driver dispatch.',
        'Amazon: Utilizes asynchronous event messaging and saga orchestrators for resilient multi-stage checkout.',
      ],
      tips: [
        'Always ask clarifying questions before jumping into architecture diagrams in an interview.',
        'State functional vs non-functional requirements (e.g. latency < 50ms, 99.99% availability).',
        'State trade-offs explicitly: there is no single perfect architecture, only optimal trade-offs.',
      ],
      importantPoints: [
        topicTitle + ' eliminates single points of failure and decouples architectural boundaries.',
        'Decoupled components allow independent horizontal scaling and localized deployment rollbacks.',
        'Design for failure: implement circuit breakers, timeouts, and rate limits around every network call.',
      ],
    };
  }

private getAptitudeFormula(topic: string): string {
    const t = topic.toLowerCase();
    if (t.includes('percentage')) return 'Percentage Change = [(Final - Initial) / Initial] × 100\nSuccessive Change = A + B + (A × B)/100';
    if (t.includes('profit') || t.includes('discount')) return 'Profit% = (Profit / CP) × 100\nSP = CP × (100 + P%)/100\nDiscount% = (Discount / MP) × 100';
    if (t.includes('simple interest')) return 'SI = (P × R × T) / 100\nAmount = P + SI = P[1 + (RT/100)]';
    if (t.includes('compound interest')) return 'CI Amount = P(1 + R/100)^n\nCI - SI (2 Years) = P(R/100)²';
    if (t.includes('work') || t.includes('pipe')) return 'Work Done = Efficiency × Time\nIf A takes x days and B takes y days: Combined = (x × y) / (x + y)';
    if (t.includes('speed') || t.includes('train') || t.includes('boat')) return 'Speed = Distance / Time\nkm/h to m/s: Multiply by 5/18\nRelative Speed (Opposite) = S1 + S2\nRelative Speed (Same) = |S1 - S2|';
    if (t.includes('average')) return 'Average = Sum of Observations / Total Observations\nWeighted Avg = (n1A1 + n2A2) / (n1 + n2)';
    if (t.includes('hcf') || t.includes('lcm') || t.includes('number')) return 'Product of Two Numbers = HCF × LCM\nHCF of Fractions = HCF(Numerators) / LCM(Denominators)';
    if (t.includes('permutation') || t.includes('combination') || t.includes('probability')) return 'nPr = n! / (n - r)!\nnCr = n! / [r! × (n - r)!]\nProbability = Favorable Outcomes / Total Sample Space';
    return 'Formula: Result = Base_Quantity × Rate_Factor\nUnit Balance: Ensure all units are synchronized.';
  }

  private getLanguageForCourse(courseId: string): string {
    switch (courseId) {
      case 'python':
      case 'django':
        return 'python';
      case 'javascript':
        return 'javascript';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'sql':
        return 'sql';
      case 'git':
      case 'linux':
        return 'bash';
      case 'dsa':
        return 'python';
      default:
        return 'javascript';
    }
  }

  private generateCodeTemplate(courseId: string, topicTitle: string): string {
    const cleanTopic = topicTitle.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    switch (courseId) {
      case 'python':
      case 'django':
        return `# Learning: ${topicTitle}\ndef test_${cleanTopic}():\n    data = ["Grand Line", "New World", "One Piece"]\n    result = [item.upper() for item in data]\n    return result\n\nprint(test_${cleanTopic}())`;
      case 'sql':
        return `-- Learning: ${topicTitle}\nSELECT id, title, created_at\nFROM roadmap_modules\nWHERE topic_name = '${topicTitle}'\nORDER BY id ASC;`;
      case 'git':
      case 'linux':
        return `# Learning: ${topicTitle}\necho "Executing ${topicTitle} command..."\nls -la | grep "learning"`;
      default:
        return `// Learning: ${topicTitle}\nfunction demonstrate_${cleanTopic}() {\n  console.log("Exploring ${topicTitle}");\n  return { status: "Mastered", topic: "${topicTitle}" };\n}\n\ndemonstrate_${cleanTopic}();`;
    }
  }

  private generateReactContent(moduleTitle: string, topicTitle: string): TopicContent {
    const cleanTitle = topicTitle.replace(/^[0-9]+\.\s*/, '').trim();
    
    return {
      title: topicTitle,
      explanation: `${cleanTitle} is a core foundation of modern React application development in ${moduleTitle}. In React's component-driven paradigm, it enables building modular, performant, declarative, and scalable user interfaces.`,
      elif5Story: `Imagine building a LEGO pirate ship. Instead of carving the whole ship out of a single giant block of wood, you build tiny modular bricks (cannons, sails, steering wheel). ${cleanTitle} is like the magic instruction manual that tells each brick how to look and update whenever the weather changes, without rebuilding the whole ship!`,
      analogy: {
        title: `${cleanTitle} in Real Life`,
        scenario: `Think of a restaurant kitchen display system. When a waiter inputs an order, the screen updates only the specific table row instead of wiping the entire whiteboard and rewriting everything from scratch.`,
        mapping: [
          { realWorld: 'Customer Order', systemDesign: 'Props / Event', explanation: 'Incoming data or interaction that triggers an update.' },
          { realWorld: 'Kitchen Screen', systemDesign: 'Virtual DOM & React Fiber', explanation: 'Efficient in-memory representation that calculates minimum changes.' },
          { realWorld: 'Chef Preparing Dish', systemDesign: 'Component Rendering & DOM Paint', explanation: 'The actual browser DOM mutation and pixel rendering.' }
        ]
      },
      codeSnippet: {
        language: 'javascript',
        code: `import React, { useState, useEffect } from 'react';\n\n// Practical demonstration of ${cleanTitle}\nexport function ${cleanTitle.replace(/[^a-zA-Z0-9]/g, '')}Example() {\n  const [active, setActive] = useState(true);\n  \n  return (\n    <div className="p-4 border rounded shadow-sm">\n      <h2 className="text-lg font-bold">${cleanTitle} Demo</h2>\n      <p>Status: {active ? 'Active' : 'Paused'}</p>\n      <button \n        onClick={() => setActive(!active)}\n        className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"\n      >\n        Toggle State\n      </button>\n    </div>\n  );\n}`,
        output: `${cleanTitle} Demo\nStatus: Active\n[Toggle State Button]`
      },
      internalMechanics: `Under the hood, React processes ${cleanTitle} through the Fiber reconciler. During the render phase, React constructs a workInProgress Fiber tree, compares it against the current Fiber tree (reconciliation diffing), and flags dirty nodes. In the commit phase, React applies only the calculated DOM mutations synchronously, followed by passive effect flushing in microtasks.`,
      commonMistakes: [
        {
          mistake: `Directly mutating state variables instead of using setter functions or immutable copies.`,
          correction: `Always return a new object or array: setCount(prev => prev + 1) or setItems([...items, newItem]).`,
          explanation: `React uses shallow reference equality (Object.is) to detect changes. Mutating existing memory references causes React to skip re-rendering.`
        },
        {
          mistake: `Missing dependencies in hook dependency arrays or ignoring cleanup functions.`,
          correction: `Include all variables used inside useEffect/useCallback/useMemo, and return a cleanup function () => abortController.abort() for subscriptions.`,
          explanation: `Stale closures will capture obsolete variables from earlier render cycles, leading to subtle race conditions.`
        }
      ],
      practiceTasksList: [
        `Task 1: Build a minimal standalone sandbox implementing ${cleanTitle}.`,
        `Task 2: Handle edge cases (empty states, loading spinners, network timeouts).`,
        `Task 3: Refactor the component to extract reusable sub-components.`,
        `Task 4: Add prop validation or TypeScript type safety interfaces.`,
        `Task 5: Write a unit test using React Testing Library verifying user click and render.`
      ],
      miniProject: {
        title: `${cleanTitle} Mini Application`,
        description: `Build a production-ready interactive widget demonstrating ${cleanTitle} with responsive styles, error boundary protection, and local persistence.`,
        keySteps: [
          'Initialize component hierarchy with clean TypeScript interfaces',
          'Implement state transitions and event listeners',
          'Optimize render cycles with memoization where appropriate',
          'Add accessible ARIA attributes and keyboard navigation'
        ]
      },
      interviewQuestions: [
        {
          question: `How does ${cleanTitle} relate to React's one-way data flow and Virtual DOM?`,
          answer: `${cleanTitle} adheres to unidirectional data flow by ensuring data descends from parent to child through props, while state modifications flow upward via callbacks or global dispatchers. The Virtual DOM computes diffs efficiently without touching the real DOM repeatedly.`,
          tips: 'Mention the difference between reconciliation (render phase) and commit phase.'
        },
        {
          question: `What are common performance pitfalls associated with ${cleanTitle}?`,
          answer: `Frequent unnecessary re-renders of child subtrees, creating inline object/function literals on every render, and running un-memoized heavy computations. Solved with React.memo, useMemo, and useCallback.`,
          tips: 'Highlight that premature optimization should be avoided unless profiling shows actual frame drops.'
        }
      ],
      examples: [
        'E-commerce Product Filtering & Cart Drawer',
        'Real-time Chat Notification Badge & Message Feed',
        'Interactive Multi-step Wizard Form with Zod Validation'
      ],
      tips: [
        'Keep state as local as possible; only lift state up when multiple siblings need synchronized data.',
        'Use TypeScript interfaces for props to catch contract mismatches at build time.',
        'Profile your React components using React DevTools Profiler to identify wasted renders.'
      ],
      importantPoints: [
        `${cleanTitle} is declarative: you describe what the UI should look like, and React handles DOM updates.`,
        'Never mutate state directly; treat state as immutable snapshots over time.',
        'Effects are escape hatches for synchronizing with external systems, not for computing state.'
      ]
    };
  }

  private generateAlgorithmsContent(moduleTitle: string, topicTitle: string): TopicContent {
    return {
      title: topicTitle,
      explanation: `${topicTitle} is a foundational algorithmic technique in ${moduleTitle}. In computer science and competitive programming, it guarantees provable correctness, optimizes asymptotic time complexity, and avoids brute-force computational bottlenecks.`,
      elif5Story: `Imagine looking for your favorite toy in a toy box with 100 toys lined up in order from smallest to biggest. Instead of checking every single toy one by one from left to right, you look right in the middle! If that toy is already bigger than what you want, you throw away the whole right half without even looking at them! That is the super-power of smart algorithms like ${topicTitle}.`,
      analogy: {
        title: `${topicTitle} Real-World Analogy`,
        scenario: `Looking up a word in a physical dictionary with 1,000 pages. Nobody reads page 1, then page 2, then page 3. You open near the middle, check the letter, and immediately discard half the dictionary!`,
        mapping: [
          { realWorld: 'Opening dictionary at middle', systemDesign: 'Calculating mid = left + (right - left) // 2', explanation: 'Splits remaining search domain into two equal halves.' },
          { realWorld: 'Discarding irrelevant pages', systemDesign: 'Search space pruning / State reduction', explanation: 'Eliminates candidate space exponentially: N -> N/2 -> N/4 -> 1.' },
          { realWorld: 'Finding the exact word', systemDesign: 'Target match / Base case termination', explanation: 'Returns index or optimal answer in O(log N) iterations.' }
        ]
      },
      codeSnippet: {
        language: 'python',
        code: `# Implementation of ${topicTitle}\ndef solve_${topicTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\n# Example test\nnums = [10, 20, 30, 40, 50, 60, 70, 80, 90]\nprint("Found at index:", solve_${topicTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}(nums, 80))`,
        output: 'Found at index: 7'
      },
      algorithmLabData: {
        title: `${topicTitle} Visual Simulation`,
        description: `Step through the execution of ${topicTitle} on a sample array [10, 20, 30, 40, 50, 60, 70, 80, 90] searching for target 80.`,
        array: [10, 20, 30, 40, 50, 60, 70, 80, 90],
        target: 80,
        codeLines: [
          'left, right = 0, len(arr) - 1',
          'while left <= right:',
          '    mid = left + (right - left) // 2',
          '    if arr[mid] == target: return mid',
          '    elif arr[mid] < target: left = mid + 1',
          '    else: right = mid - 1',
          'return -1'
        ],
        steps: [
          {
            lineIndex: 0,
            variables: { left: 0, right: 8, mid: 'undefined', 'arr[mid]': 'undefined', target: 80 },
            highlightedIndices: [0, 8],
            action: 'Initialize left pointer at index 0 and right pointer at index 8.'
          },
          {
            lineIndex: 2,
            variables: { left: 0, right: 8, mid: 4, 'arr[mid]': 50, target: 80 },
            highlightedIndices: [4],
            action: 'Calculate mid = 0 + (8 - 0) // 2 = 4. arr[4] is 50.'
          },
          {
            lineIndex: 4,
            variables: { left: 5, right: 8, mid: 4, 'arr[mid]': 50, target: 80 },
            highlightedIndices: [5, 8],
            action: '50 < 80: Target is in right half. Discard indices 0..4. Set left = 5.'
          },
          {
            lineIndex: 2,
            variables: { left: 5, right: 8, mid: 6, 'arr[mid]': 70, target: 80 },
            highlightedIndices: [6],
            action: 'Recalculate mid = 5 + (8 - 5) // 2 = 6. arr[6] is 70.'
          },
          {
            lineIndex: 4,
            variables: { left: 7, right: 8, mid: 6, 'arr[mid]': 70, target: 80 },
            highlightedIndices: [7, 8],
            action: '70 < 80: Target is in right half. Discard indices 5..6. Set left = 7.'
          },
          {
            lineIndex: 2,
            variables: { left: 7, right: 8, mid: 7, 'arr[mid]': 80, target: 80 },
            highlightedIndices: [7],
            action: 'Recalculate mid = 7 + (8 - 7) // 2 = 7. arr[7] is 80.'
          },
          {
            lineIndex: 3,
            variables: { left: 7, right: 8, mid: 7, 'arr[mid]': 80, target: 80, matched: true },
            highlightedIndices: [7],
            action: 'SUCCESS: arr[7] == 80! Target found at index 7.'
          }
        ]
      },
      approachProgression: [
        {
          name: 'Brute Force Linear Scan',
          type: 'BRUTE_FORCE',
          complexity: 'Time: O(N) | Space: O(1)',
          code: 'def linear_scan(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target:\n            return i\n    return -1',
          bottleneck: 'Inspects every single element sequentially. For 1 billion elements, requires 1 billion comparisons.',
          explanation: 'Checks elements one by one without leveraging sorted order or invariants.'
        },
        {
          name: 'Jump / Block Search',
          type: 'BETTER',
          complexity: 'Time: O(√N) | Space: O(1)',
          code: 'def jump_search(arr, target):\n    step = int(len(arr) ** 0.5)\n    prev = 0\n    while arr[min(step, len(arr)) - 1] < target:\n        prev = step\n        step += int(len(arr) ** 0.5)\n        if prev >= len(arr): return -1\n    while arr[prev] < target:\n        prev += 1\n        if prev == min(step, len(arr)): return -1\n    return prev if arr[prev] == target else -1',
          bottleneck: 'Jumps in fixed steps of √N, which is significantly better than O(N) but still does not achieve logarithmic speed.',
          explanation: 'Divides the array into blocks of size √N and performs linear search within the matching block.'
        },
        {
          name: 'Logarithmic Binary Search / Optimal',
          type: 'OPTIMAL',
          complexity: 'Time: O(log N) | Space: O(1)',
          code: 'def optimal_search(arr, target):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: left = mid + 1\n        else: right = mid - 1\n    return -1',
          explanation: 'Halves the search space on every iteration. For 1 billion elements, requires only ~30 comparisons!'
        }
      ],
      complexityAnalysis: {
        timeBest: 'O(1)',
        timeAvg: 'O(log N)',
        timeWorst: 'O(log N)',
        space: 'O(1)',
        explanation: 'Best case occurs when target is at the initial midpoint. Average and worst cases halve the search space at each step, yielding T(N) = T(N/2) + O(1) = O(log N) by Master Theorem.'
      },
      commonMistakes: [
        {
          mistake: 'Using (left + right) // 2 which causes integer overflow in languages with fixed-width integers (C++, Java).',
          correction: 'Use left + (right - left) // 2 to safely compute the midpoint within integer limits.',
          explanation: 'If left + right exceeds 2^31 - 1, it wraps around to a negative number.'
        },
        {
          mistake: 'Off-by-one condition errors (e.g. while left < right instead of while left <= right).',
          correction: 'Ensure termination condition matches your search interval [left, right] closed vs [left, right) half-open.',
          explanation: 'Exiting when left == right skips checking single-element subarrays.'
        }
      ],
      practiceTasksList: [
        `Task 1: Implement basic ${topicTitle} and verify on sorted list.`,
        `Task 2: Handle edge cases: empty array, target smaller than min, target larger than max.`,
        `Task 3: Adapt the algorithm to find lower_bound (first index >= target).`,
        `Task 4: Adapt the algorithm to find upper_bound (first index > target).`,
        `Task 5: Solve a competitive programming problem on Binary Search on Answer.`
      ],
      interviewQuestions: [
        {
          question: `How do you prove the correctness of ${topicTitle}?`,
          answer: `Using loop invariants: state the invariant that if target exists in the array, it must lie within the range [left, right]. In the base case, the invariant holds. In the inductive step, discarding mid preserves the invariant. At termination when left > right, the range is empty, proving the target does not exist.`,
          tips: 'Always mention loop invariants (Initialization, Maintenance, Termination).'
        },
        {
          question: `When can you apply ${topicTitle} to non-sorted sequences?`,
          answer: `When the function or predicate is monotonic! As long as a condition f(x) produces a contiguous sequence of Falses followed by Trues (or vice-versa), binary search can identify the boundary (Binary Search on Answer).`,
          tips: 'Mention real problems like Painter Partition, Koko Eating Bananas, or Aggressive Cows.'
        }
      ],
      examples: [
        'Finding lower bound and upper bound in database B-Trees',
        'Parametric optimization: finding minimum bandwidth or shipping capacity',
        'Finding peak elements and square root approximation'
      ],
      tips: [
        'Draw the array and pointer bounds explicitly on paper during a dry run.',
        'Check base cases: array of size 0, 1, and 2 before submitting.',
        'Watch for infinite loops caused by left = mid instead of left = mid + 1.'
      ],
      importantPoints: [
        `${topicTitle} achieves exponential reduction of the search space.`,
        'Logarithmic time O(log N) scales gracefully to trillions of elements.',
        'Binary search applies beyond arrays to any monotonic decision predicate.'
      ]
    };
  }

}

export const topicContentService = new TopicContentService();
