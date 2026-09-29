import {
  TopicContent,
  WhyItMattersData,
  RealLifeExampleData,
  HowItWorksData,
  KeyTermItem,
  SyntaxStructureData,
  ExecutionSimulationData,
  DetailedExampleItem,
  BeforeVsAfterData,
  RealWorldUsageItem,
  RelatedTopicItem,
  UniversalVisualizationConfig,
  ComparisonTableData,
  TopicQuizQuestion,
  TopicInterviewQuestion,
  MemoryCardItem,
  OneMinuteRevisionData,
  CheatSheetData,
  FinalTestQuestion,
} from '../models/TopicContent';

export class InteractiveTopicEnricher {
  /**
   * Enriches any TopicContent object with complete data-driven interactive sections
   * if they are not already populated.
   */
  public enrich(
    base: TopicContent,
    courseId: string,
    moduleTitle: string,
    topicTitle: string
  ): TopicContent {
    const normCourse = courseId.toLowerCase().trim();
    const cleanTopic = topicTitle.replace(/^[0-9]+\.\s*/, '').trim();

    const simpleExpl =
      base.simpleExplanation ||
      this.generateSimpleExplanation(normCourse, moduleTitle, cleanTopic, base.explanation);

    const technicalExpl =
      base.technicalExplanation ||
      this.generateTechnicalExplanation(normCourse, moduleTitle, cleanTopic, base.explanation);

    const whyMatters =
      base.whyItMatters ||
      this.generateWhyItMatters(normCourse, moduleTitle, cleanTopic);

    const realLife =
      base.realLifeExample ||
      this.generateRealLifeExample(normCourse, cleanTopic, base.analogy);

    const howWorks =
      base.howItWorks ||
      this.generateHowItWorks(normCourse, cleanTopic);

    const keyTerms =
      base.keyTerms && base.keyTerms.length > 0
        ? base.keyTerms
        : this.generateKeyTerms(normCourse, cleanTopic);

    const syntax =
      base.syntaxStructure ||
      this.generateSyntax(normCourse, cleanTopic, base.codeSnippet?.code);

    const sim =
      base.executionSimulation ||
      this.generateExecutionSimulation(normCourse, cleanTopic, base.codeSnippet?.code);

    const examples =
      base.detailedExamples && base.detailedExamples.length > 0
        ? base.detailedExamples
        : this.generateDetailedExamples(normCourse, cleanTopic);

    const beforeAfter =
      base.beforeVsAfter ||
      this.generateBeforeVsAfter(normCourse, cleanTopic);

    const realWorld =
      base.realWorldUsage && base.realWorldUsage.length > 0
        ? base.realWorldUsage
        : this.generateRealWorldUsage(normCourse, cleanTopic);

    const related =
      base.relatedTopicsList && base.relatedTopicsList.length > 0
        ? base.relatedTopicsList
        : this.generateRelatedTopics(normCourse, cleanTopic);

    const visualization =
      base.universalVisualization ||
      this.generateVisualization(normCourse, cleanTopic, base);

    const comparison =
      base.comparisonTable ||
      this.generateComparisonTable(normCourse, cleanTopic);

    const quiz =
      base.quizQuestions && base.quizQuestions.length > 0
        ? base.quizQuestions
        : this.generateQuiz(normCourse, cleanTopic);

    const interview =
      base.interviewQuestionsList && base.interviewQuestionsList.length > 0
        ? base.interviewQuestionsList
        : this.generateInterviewQuestions(normCourse, cleanTopic);

    const memoryCards =
      base.memoryCards && base.memoryCards.length > 0
        ? base.memoryCards
        : this.generateMemoryCards(normCourse, cleanTopic);

    const oneMinute =
      base.oneMinuteRevision ||
      this.generateOneMinuteRevision(normCourse, cleanTopic);

    const cheatSheet =
      base.cheatSheet ||
      this.generateCheatSheet(normCourse, cleanTopic);

    const finalTest =
      base.finalTestQuestions && base.finalTestQuestions.length > 0
        ? base.finalTestQuestions
        : this.generateFinalTest(normCourse, cleanTopic);

    return {
      ...base,
      simpleExplanation: simpleExpl,
      technicalExplanation: technicalExpl,
      whyItMatters: whyMatters,
      realLifeExample: realLife,
      howItWorks: howWorks,
      keyTerms: keyTerms,
      syntaxStructure: syntax,
      executionSimulation: sim,
      detailedExamples: examples,
      beforeVsAfter: beforeAfter,
      realWorldUsage: realWorld,
      relatedTopicsList: related,
      universalVisualization: visualization,
      comparisonTable: comparison,
      quizQuestions: quiz,
      interviewQuestionsList: interview,
      memoryCards: memoryCards,
      oneMinuteRevision: oneMinute,
      cheatSheet: cheatSheet,
      finalTestQuestions: finalTest,
    };
  }

  private generateSimpleExplanation(
    course: string,
    module: string,
    topic: string,
    existing: string
  ): string {
    if (course === 'python') {
      return `Think of ${topic} as a helpful tool in your daily toolkit. Instead of doing everything by hand every single time, it gives you a clean, repeatable way to solve problems without getting confused. It allows you to package instructions neatly so anyone reading your code can understand what it does right away.`;
    }
    if (course === 'react') {
      return `In React, think of ${topic} like assembling LEGO pieces. Each piece knows what it looks like and how to react when someone interacts with it. When data changes, React automatically refreshes just that piece without redrawing your entire screen!`;
    }
    if (course === 'sql') {
      return `Think of ${topic} like asking a very organized librarian for exactly the books you need. Instead of walking through thousands of bookshelves one by one, you give the librarian a specific note, and they hand you back only the matching records in seconds.`;
    }
    if (course === 'algorithms' || course === 'dsa') {
      return `Imagine finding a name in a huge phonebook. Rather than flipping page by page from the very beginning, ${topic} gives you a smart, guaranteed strategy to reach the answer in the smallest number of steps possible.`;
    }
    if (course === 'system_design') {
      return `Imagine running a popular bakery. As hundreds of customers arrive at the same time, ${topic} represents the smart organization system that keeps the cashier, baking chefs, and storage pantry working smoothly without anyone getting overwhelmed.`;
    }
    return `In plain words, ${topic} is a key technique in ${module} that makes your work clearer, faster, and much easier to manage as your projects grow.`;
  }

  private generateTechnicalExplanation(
    course: string,
    module: string,
    topic: string,
    existing: string
  ): string {
    return (
      existing ||
      `From an engineering perspective, ${topic} establishes an abstraction layer within ${module}. It optimizes runtime lifecycle semantics, enforces boundary isolation, maintains state invariants, and adheres to asymptotic efficiency constraints required for production-grade ${course.toUpperCase()} systems.`
    );
  }

  private generateWhyItMatters(
    course: string,
    module: string,
    topic: string
  ): WhyItMattersData {
    return {
      whatProblemItSolves: `Without ${topic}, codebases suffer from duplicated logic, tightly-coupled state, fragile mutations, and unpredictable execution paths under high concurrency or edge inputs.`,
      whyDevelopersUseIt: `It provides standardized conventions, modular composability, predictable data flow, and easier automated unit and regression testing.`,
      whatHappensWithoutIt: `Applications become unmaintainable spaghetti code, bugs take hours to isolate, and performance degrades exponentially as data scale increases.`,
      realApplication: `Widely used in production microservices, high-traffic consumer web applications, financial transaction ledgers, and distributed systems.`,
      keyTakeaway: `Mastering ${topic} shifts you from writing quick scripts to designing resilient, maintainable, production-ready software systems.`,
    };
  }

  private generateRealLifeExample(
    course: string,
    topic: string,
    existingAnalogy?: any
  ): RealLifeExampleData {
    if (existingAnalogy) {
      return {
        title: existingAnalogy.title || `${topic} Real-World Analogy`,
        scenario: existingAnalogy.scenario,
        input: 'Client request / raw parameters',
        processing: 'Modular pipeline processing with business invariants',
        output: 'Structured, verified response payload',
        connectionToConcept: `Just like the analogy separates responsibilities, ${topic} isolates inputs, processing stages, and outputs cleanly.`,
      };
    }

    if (course === 'sql') {
      return {
        title: 'Grocery Store Inventory Query',
        scenario: 'A warehouse manager searches for all dairy items with expiration dates within 3 days to discount them.',
        input: 'Inventory database table with 50,000 SKUs',
        processing: 'Filtering index scan on Category = "Dairy" and Expiry <= CurrentDate + 3',
        output: 'List of matching items ready for markdown pricing',
        connectionToConcept: `In SQL, ${topic} translates human business questions into precise mathematical relational algebra executed by the database engine.`,
      };
    }

    return {
      title: 'Automated Coffee Machine',
      scenario: 'You push a single button labeled "Cappuccino". The machine grinds beans, heats water to 92°C, froths milk, and delivers the cup.',
      input: 'Button selection + Water + Coffee beans',
      processing: 'Standardized automated internal brewing steps',
      output: 'Fresh, consistent Cappuccino every time',
      connectionToConcept: `In software, ${topic} encapsulates complex internal steps behind a simple, reliable interface that yields predictable results.`,
    };
  }

  private generateHowItWorks(course: string, topic: string): HowItWorksData {
    return {
      title: `How ${topic} Operates Under the Hood`,
      flowType: 'linear',
      steps: [
        {
          stepNumber: 1,
          title: 'Input & Initialization',
          description: `The runtime receives caller parameters, allocates execution frame memory, and validates parameter boundaries.`,
          codeOrFormula: `allocate_frame(${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')})`,
          stateBadge: 'PRE-FLIGHT',
        },
        {
          stepNumber: 2,
          title: 'Transformation & Evaluation',
          description: `Core business logic processes the payload, evaluating conditional branches and applying state mutations.`,
          codeOrFormula: `process_state(input_state)`,
          stateBadge: 'PROCESSING',
        },
        {
          stepNumber: 3,
          title: 'Constraint & Invariant Check',
          description: `Verifies that output invariants and boundary conditions hold before committing state or returning.`,
          codeOrFormula: `assert(invariants_valid)`,
          stateBadge: 'VALIDATION',
        },
        {
          stepNumber: 4,
          title: 'Output & Frame Deallocation',
          description: `Result value is yielded to the caller and temporary stack resources are garbage collected or released.`,
          codeOrFormula: `return output_payload`,
          stateBadge: 'COMPLETED',
        },
      ],
    };
  }

  private generateKeyTerms(course: string, topic: string): KeyTermItem[] {
    const tLower = topic.toLowerCase();
    if (tLower.includes('function') || course === 'python') {
      return [
        {
          term: 'Parameter',
          definition: 'A variable named in the function declaration that receives values when called.',
          simpleExample: 'def greet(name): # "name" is the parameter',
          relatedTopic: 'Function Arguments',
        },
        {
          term: 'Argument',
          definition: 'The concrete value passed to the function when invoking it.',
          simpleExample: 'greet("Luffy") # "Luffy" is the argument',
          relatedTopic: 'Defining Functions',
        },
        {
          term: 'Return Value',
          definition: 'The result value that a function sends back to the code that called it.',
          simpleExample: 'return total_price',
          relatedTopic: 'Scope & Closures',
        },
        {
          term: 'Scope',
          definition: 'The region of code where a variable is accessible and recognized.',
          simpleExample: 'Variables inside a function have local scope.',
          relatedTopic: 'Namespaces & Global',
        },
      ];
    }

    if (course === 'react') {
      return [
        {
          term: 'Props',
          definition: 'Read-only input properties passed from parent component to child component.',
          simpleExample: '<UserCard name="Zoro" bounty={320000000} />',
          relatedTopic: 'Component Architecture',
        },
        {
          term: 'State',
          definition: 'Internal data managed by a component that triggers a re-render when mutated.',
          simpleExample: 'const [count, setCount] = useState(0);',
          relatedTopic: 'useState Hook',
        },
        {
          term: 'Virtual DOM',
          definition: 'A lightweight JavaScript representation of the real DOM used for diffing.',
          simpleExample: 'React calculates differences and updates only changed nodes.',
          relatedTopic: 'Reconciliation & Fiber',
        },
        {
          term: 'Re-render',
          definition: 'The invocation of a component function to produce new JSX when props or state change.',
          simpleExample: 'Triggered by setState or parent re-rendering.',
          relatedTopic: 'React Performance',
        },
      ];
    }

    return [
      {
        term: 'Invariant',
        definition: 'A condition that remains true across every step of execution.',
        simpleExample: 'In a sorted array, arr[i] <= arr[i+1] for all valid i.',
        relatedTopic: 'Algorithm Invariants',
      },
      {
        term: 'Complexity',
        definition: 'The mathematical upper bound on runtime (Time) or memory usage (Space).',
        simpleExample: 'O(log N) indicates doubling input size adds only 1 operation.',
        relatedTopic: 'Big-O Notation',
      },
      {
        term: 'Edge Case',
        definition: 'Extreme boundary conditions such as empty inputs, null pointers, or maximum integers.',
        simpleExample: 'Testing arr.length == 0 or target not found.',
        relatedTopic: 'Unit Testing & Robustness',
      },
      {
        term: 'Idempotency',
        definition: 'An operation that produces identical results even if executed multiple times.',
        simpleExample: 'GET and DELETE operations in RESTful architecture.',
        relatedTopic: 'API Design Best Practices',
      },
    ];
  }

  private generateSyntax(course: string, topic: string, existingCode?: string): SyntaxStructureData {
    const lang = course === 'python' ? 'python' : course === 'sql' ? 'sql' : 'javascript';

    if (course === 'python') {
      return {
        title: `${topic} Python Syntax`,
        language: 'python',
        template: `def function_name(param1, param2=default_val):\n    """Docstring explaining purpose"""\n    # Business logic execution\n    result = param1 + param2\n    return result`,
        breakdown: [
          { component: 'def', explanation: 'Keyword instructing Python to define a new callable object.' },
          { component: 'function_name', explanation: 'Descriptive identifier in snake_case indicating action.' },
          { component: '(params)', explanation: 'Comma-separated parameter list with optional default values.' },
          { component: 'return', explanation: 'Terminates function execution and hands value back to caller.' },
        ],
      };
    }

    if (course === 'sql') {
      return {
        title: `${topic} SQL Structure`,
        language: 'sql',
        template: `SELECT column1, COUNT(column2)\nFROM table_name\nWHERE condition_expression\nGROUP BY column1\nHAVING COUNT(column2) > 10\nORDER BY column1 ASC;`,
        breakdown: [
          { component: 'FROM / JOIN', explanation: 'Identifies target source tables and joins relations.' },
          { component: 'WHERE', explanation: 'Filters rows before grouping or aggregations occur.' },
          { component: 'GROUP BY', explanation: 'Aggregates rows sharing identical attribute values.' },
          { component: 'SELECT', explanation: 'Projects desired columns, aliases, or expressions.' },
        ],
      };
    }

    return {
      title: `${topic} Implementation Syntax`,
      language: lang,
      template: `// Syntax definition for ${topic}\nfunction execute${topic.replace(/[^a-zA-Z0-9]/g, '')}(inputData) {\n  const sanitized = validate(inputData);\n  const output = process(sanitized);\n  return output;\n}`,
      breakdown: [
        { component: 'function / const', explanation: 'Declares an immutable reference or function scope.' },
        { component: 'parameters', explanation: 'Inputs supplied by the caller.' },
        { component: 'return', explanation: 'Yields the processed outcome back to the call site.' },
      ],
    };
  }

  private generateExecutionSimulation(
    course: string,
    topic: string,
    existingCode?: string
  ): ExecutionSimulationData {
    const lang = course === 'python' ? 'python' : course === 'sql' ? 'sql' : 'javascript';

    return {
      title: `Step-by-Step Code & State Execution`,
      language: lang,
      codeLines: [
        'numbers = [10, 20, 30, 40]',
        'multiplier = 2',
        'result = []',
        'for n in numbers:',
        '    result.append(n * multiplier)',
        'print("Final:", result)',
      ],
      steps: [
        {
          stepNumber: 1,
          lineIndex: 0,
          codeLine: 'numbers = [10, 20, 30, 40]',
          explanation: 'Allocates an array of 4 integers in memory at consecutive memory locations.',
          variables: { numbers: '[10, 20, 30, 40]', length: 4 },
          output: '',
        },
        {
          stepNumber: 2,
          lineIndex: 1,
          codeLine: 'multiplier = 2',
          explanation: 'Assigns scalar integer literal 2 to variable multiplier.',
          variables: { numbers: '[10, 20, 30, 40]', multiplier: 2 },
          output: '',
        },
        {
          stepNumber: 3,
          lineIndex: 2,
          codeLine: 'result = []',
          explanation: 'Initializes an empty dynamic list ready to receive transformed items.',
          variables: { numbers: '[10, 20, 30, 40]', multiplier: 2, result: '[]' },
          output: '',
        },
        {
          stepNumber: 4,
          lineIndex: 4,
          codeLine: '    result.append(n * multiplier)',
          explanation: 'Iteration 1: n = 10. Multiplies 10 * 2 = 20 and appends to result.',
          variables: { n: 10, multiplier: 2, result: '[20]' },
          output: '',
        },
        {
          stepNumber: 5,
          lineIndex: 4,
          codeLine: '    result.append(n * multiplier)',
          explanation: 'Iteration 2: n = 20. Multiplies 20 * 2 = 40 and appends to result.',
          variables: { n: 20, multiplier: 2, result: '[20, 40]' },
          output: '',
        },
        {
          stepNumber: 6,
          lineIndex: 5,
          codeLine: 'print("Final:", result)',
          explanation: 'Loop finishes all elements. Flushes formatted string buffer to standard output.',
          variables: { result: '[20, 40, 60, 80]' },
          output: 'Final: [20, 40, 60, 80]',
        },
      ],
    };
  }

  private generateDetailedExamples(course: string, topic: string): DetailedExampleItem[] {
    const lang = course === 'python' ? 'python' : course === 'sql' ? 'sql' : 'javascript';

    return [
      {
        title: 'Example 1: Basic / Foundational Pattern',
        type: 'Basic',
        language: lang,
        code: course === 'python'
          ? `# Basic starter implementation\ndef calculate_total(price, tax_rate=0.05):\n    return price + (price * tax_rate)\n\nprint("Total:", calculate_total(100))`
          : `// Basic pattern\nfunction calculateTotal(price, tax = 0.05) {\n  return price + (price * tax);\n}\nconsole.log("Total:", calculateTotal(100));`,
        explanation: 'Minimal implementation demonstrating core syntax and default parameter fallback.',
        output: 'Total: 105.0',
      },
      {
        title: 'Example 2: Practical Business Scenario',
        type: 'Practical',
        language: lang,
        code: course === 'python'
          ? `# Practical: calculate employee bonus tier\ndef evaluate_bonus(salary, performance_score):\n    if performance_score >= 90:\n        return salary * 0.20\n    elif performance_score >= 75:\n        return salary * 0.10\n    return 0.0\n\nprint("Bonus: $", evaluate_bonus(85000, 92))`
          : `// Practical enterprise calculation\nfunction evaluateBonus(salary, score) {\n  if (score >= 90) return salary * 0.20;\n  if (score >= 75) return salary * 0.10;\n  return 0.0;\n}\nconsole.log("Bonus: $", evaluateBonus(85000, 92));`,
        explanation: 'Handles multiple conditional tiers and realistic business thresholds.',
        output: 'Bonus: $ 17000.0',
      },
      {
        title: 'Example 3: Tricky Edge Case Handling',
        type: 'Tricky',
        language: lang,
        code: course === 'python'
          ? `# Tricky: safely handling None or empty collections\ndef safe_average(scores):\n    if not scores:\n        return 0.0 # Guard against ZeroDivisionError\n    return sum(scores) / len(scores)\n\nprint("Empty test:", safe_average([]))\nprint("Normal test:", safe_average([80, 90, 100]))`
          : `// Handling undefined/empty values gracefully\nfunction safeAverage(scores) {\n  if (!scores || scores.length === 0) return 0.0;\n  return scores.reduce((a, b) => a + b, 0) / scores.length;\n}\nconsole.log(safeAverage([]));`,
        explanation: 'Prevents crash conditions like divide-by-zero or accessing null references.',
        output: 'Empty test: 0.0\nNormal test: 90.0',
      },
      {
        title: 'Example 4: Real-World Enterprise Pattern',
        type: 'Real-World',
        language: lang,
        code: course === 'python'
          ? `# Enterprise: Logging decorator with error boundary\nimport time\n\ndef time_execution(fn):\n    def wrapper(*args, **kwargs):\n        start = time.time()\n        result = fn(*args, **kwargs)\n        elapsed_ms = (time.time() - start) * 1000\n        print(f"[{fn.__name__}] finished in {elapsed_ms:.2f}ms")\n        return result\n    return wrapper`
          : `// Enterprise: Async fetch wrapper with timeout\nasync function fetchWithTimeout(url, ms = 5000) {\n  const controller = new AbortController();\n  const id = setTimeout(() => controller.abort(), ms);\n  const res = await fetch(url, { signal: controller.signal });\n  clearTimeout(id);\n  return res.json();\n}`,
        explanation: 'Production pattern including latency telemetry, error handling, and clean composition.',
        output: '[fetchWithTimeout] Success: HTTP 200 (14.2ms)',
      },
    ];
  }

  private generateBeforeVsAfter(course: string, topic: string): BeforeVsAfterData {
    if (course === 'python') {
      return {
        withoutConcept: {
          title: 'Without Concept: Repeated Copy-Paste Code',
          codeOrScenario: `tax1 = 100 * 0.08\ntotal1 = 100 + tax1\n\ntax2 = 250 * 0.08\ntotal2 = 250 + tax2\n\n# If tax rate changes to 0.09, you must find and update every line!`,
          problem: 'High risk of typo errors, difficult maintenance, zero reusability, and massive code bloat.',
        },
        withConcept: {
          title: 'With Concept: Reusable Abstraction',
          codeOrScenario: `def compute_total(price, tax_rate=0.08):\n    return price * (1 + tax_rate)\n\ntotal1 = compute_total(100)\ntotal2 = compute_total(250)`,
          improvedSolution: 'Single source of truth. If tax rate or rules change, update only one function and all call sites benefit immediately.',
        },
        explanation: 'Encapsulating repetitive patterns into structured units saves development time and eliminates regression bugs.',
      };
    }

    return {
      withoutConcept: {
        title: 'Without Concept: Manual Sequential Approach',
        codeOrScenario: `// Manual linear search across 1,000,000 items\nfor (let i = 0; i < items.length; i++) {\n  if (items[i] === target) return i;\n}`,
        problem: 'Takes up to 1,000,000 comparisons. Sluggish performance that locks the thread on large datasets.',
      },
      withConcept: {
        title: `With Concept: Optimized ${topic} Approach`,
        codeOrScenario: `// Logarithmic halving of search space\nlet left = 0, right = items.length - 1;\nwhile (left <= right) {\n  let mid = Math.floor((left + right) / 2);\n  if (items[mid] === target) return mid;\n  if (items[mid] < target) left = mid + 1;\n  else right = mid - 1;\n}`,
        improvedSolution: 'Finds any element in a sorted list of 1,000,000 items in at most 20 comparisons!',
      },
      explanation: 'Algorithmic efficiency reduces computing resources by 99.99% without changing the output.',
    };
  }

  private generateRealWorldUsage(course: string, topic: string): RealWorldUsageItem[] {
    return [
      {
        domain: 'High-Volume Web APIs',
        usage: 'Handling thousands of concurrent user requests per second with isolated worker execution.',
        example: 'Stripe uses this pattern for idempotent payment processing and webhook dispatch.',
      },
      {
        domain: 'Data Processing & Analytics',
        usage: 'Batch data pipelines transforming raw transactional logs into business intelligence dashboards.',
        example: 'Spotify leverages this for personal daily mix song ranking and recommendations.',
      },
      {
        domain: 'Mobile Application State Management',
        usage: 'Ensuring UI components react instantly to background database changes without UI jank.',
        example: 'Uber uses reactive event streams for real-time driver GPS tracking on interactive maps.',
      },
    ];
  }

  private generateRelatedTopics(course: string, topic: string): RelatedTopicItem[] {
    return [
      {
        title: 'Prerequisite Foundations',
        relation: 'Core building block required before this topic',
        courseId: course,
      },
      {
        title: 'Advanced Optimizations',
        relation: 'Techniques to scale this pattern in production',
        courseId: course,
      },
      {
        title: 'Architecture & System Design',
        relation: 'Where this concept connects to large-scale distributed systems',
        courseId: 'system_design',
      },
    ];
  }

  private generateVisualization(
    course: string,
    topic: string,
    base: TopicContent
  ): UniversalVisualizationConfig {
    const tLower = topic.toLowerCase();

    if (tLower.includes('stack')) {
      return {
        type: 'stack',
        title: 'Stack LIFO Visualization',
        data: { elements: [10, 20, 30] },
        operations: ['Push', 'Pop', 'Peek'],
        explanation: 'Last In, First Out (LIFO). Elements are pushed and popped exclusively from the top.',
      };
    }

    if (tLower.includes('queue')) {
      return {
        type: 'queue',
        title: 'Queue FIFO Visualization',
        data: { elements: [10, 20, 30] },
        operations: ['Enqueue', 'Dequeue', 'Peek'],
        explanation: 'First In, First Out (FIFO). Elements enter at REAR and exit from FRONT.',
      };
    }

    if (tLower.includes('tree') || tLower.includes('bst')) {
      return {
        type: 'tree',
        title: 'Binary Tree Hierarchy',
        data: { root: { val: 50, left: { val: 30, left: { val: 20 }, right: { val: 40 } }, right: { val: 70, left: { val: 60 }, right: { val: 80 } } } },
        operations: ['Inorder', 'Preorder', 'Postorder'],
        explanation: 'Hierarchical node structure where left descendants < root < right descendants.',
      };
    }

    if (tLower.includes('recursion')) {
      return {
        type: 'recursion',
        title: 'Recursion Call Stack Unwinding',
        data: { calls: ['fact(4)', 'fact(3)', 'fact(2)', 'fact(1)', 'base case return 1'] },
        operations: ['Recurse Down', 'Unwind Stack'],
        explanation: 'Functions push stack frames until reaching base case, then return values up.',
      };
    }

    if (course === 'system_design' || base.architectureFlow) {
      return {
        type: 'architecture',
        title: 'Distributed System Topology',
        data: base.architectureFlow || { nodes: ['Client', 'Load Balancer', 'API Server', 'Cache', 'Database'] },
        operations: ['Send Request', 'Cache Hit', 'DB Query', 'Return Response'],
        explanation: 'Data traversal across edge CDN, API gateway, cache tier, and primary persistent database.',
      };
    }

    return {
      type: 'array',
      title: 'Indexed Memory Representation',
      data: { elements: [10, 25, 40, 65, 80], pointers: { current: 2 } },
      operations: ['Access by Index', 'Insert Element', 'Delete Element'],
      explanation: 'Contiguous memory layout allowing O(1) instantaneous access by index.',
    };
  }

  private generateComparisonTable(course: string, topic: string): ComparisonTableData {
    if (course === 'python') {
      return {
        title: 'List vs Tuple in Python',
        conceptA: 'List [ ]',
        conceptB: 'Tuple ( )',
        criteria: [
          { criterion: 'Mutability', valA: 'Mutable (can add, remove, modify in place)', valB: 'Immutable (fixed once defined)' },
          { criterion: 'Memory Footprint', valA: 'Higher (over-allocates for dynamic growth)', valB: 'Lower (exact memory allocation)' },
          { criterion: 'Execution Speed', valA: 'Slightly slower iteration', valB: 'Faster access & memory lookup' },
          { criterion: 'Dictionary Keys', valA: 'Cannot be used as dict keys (unhashable)', valB: 'Can be used as dict keys (hashable)' },
        ],
        summary: 'Use lists when collection content needs to change dynamically. Use tuples for fixed heterogenous data structures and dictionary keys.',
      };
    }

    if (course === 'sql') {
      return {
        title: 'WHERE vs HAVING in SQL',
        conceptA: 'WHERE Clause',
        conceptB: 'HAVING Clause',
        criteria: [
          { criterion: 'Filter Target', valA: 'Filters individual rows before grouping', valB: 'Filters aggregated groups after GROUP BY' },
          { criterion: 'Aggregate Functions', valA: 'Cannot contain SUM(), COUNT(), AVG()', valB: 'Can evaluate SUM(), COUNT(), AVG()' },
          { criterion: 'Performance', valA: 'Faster: eliminates rows before aggregation', valB: 'Slower: requires scanning & grouping first' },
          { criterion: 'Execution Order', valA: 'Executes before GROUP BY', valB: 'Executes after GROUP BY' },
        ],
        summary: 'Filter individual rows early using WHERE. Use HAVING only when filtering on calculated aggregate outcomes.',
      };
    }

    return {
      title: 'Imperative vs Declarative Paradigm',
      conceptA: 'Imperative Style',
      conceptB: 'Declarative Style',
      criteria: [
        { criterion: 'Focus', valA: 'Describes HOW to achieve step-by-step', valB: 'Describes WHAT outcome is desired' },
        { criterion: 'State Mutation', valA: 'Explicit manual loops and pointer updates', valB: 'Immutable transforms (.map, .filter, SQL)' },
        { criterion: 'Readability', valA: 'More verbose boilerplate', valB: 'Concise, high-level intent' },
        { criterion: 'Maintainability', valA: 'Prone to off-by-one and mutation bugs', valB: 'Fewer side-effects, easier to test' },
      ],
      summary: 'Modern software engineering favors declarative abstractions backed by battle-tested imperative runtimes.',
    };
  }

  private generateQuiz(course: string, topic: string): TopicQuizQuestion[] {
    return [
      {
        id: `q1_${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        question: `What is the primary architectural purpose of ${topic}?`,
        options: [
          `To enforce modularity, reusability, and clean separation of concerns.`,
          `To force all code onto a single monolithic file.`,
          `To disable unit testing and prevent compilation.`,
          `To execute arbitrary commands without validation.`,
        ],
        correctAnswerIndex: 0,
        explanation: `${topic} encapsulates functionality into predictable, reusable units, drastically simplifying testing and long-term code maintenance.`,
      },
      {
        id: `q2_${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        question: `Which of the following is considered an anti-pattern or common mistake when applying ${topic}?`,
        options: [
          `Writing automated regression tests for edge cases.`,
          `Directly mutating shared global state or ignoring boundary validations.`,
          `Profiling runtime performance under heavy concurrency.`,
          `Using descriptive, self-documenting naming conventions.`,
        ],
        correctAnswerIndex: 1,
        explanation: `Mutating shared state without synchronization or boundary checks creates subtle race conditions and unpredictable side effects.`,
      },
      {
        id: `q3_${topic.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        question: `What happens when you test ${topic} against empty or null boundary inputs?`,
        options: [
          `The system should handle it gracefully without crashing or throwing unhandled exceptions.`,
          `The program must immediately terminate the entire server process.`,
          `It is impossible to pass null or empty values in any programming language.`,
          `It automatically doubles memory consumption indefinitely.`,
        ],
        correctAnswerIndex: 0,
        explanation: `Robust production software incorporates defensive guard clauses to handle empty collections, null inputs, and unexpected boundaries safely.`,
      },
    ];
  }

  private generateInterviewQuestions(course: string, topic: string): TopicInterviewQuestion[] {
    return [
      {
        level: 'Beginner',
        question: `Can you explain the core concept of ${topic} to a junior engineer?`,
        answer: `${topic} provides a structured mechanism to solve a specific class of problems cleanly. It takes inputs, performs well-defined operations, and yields a predictable output while hiding internal implementation complexity.`,
        explanation: 'Interviewers look for clear communication without relying purely on obscure buzzwords.',
        tip: 'Start with a simple 1-sentence summary before diving into technical details.',
      },
      {
        level: 'Intermediate',
        question: `How do you handle edge cases and error boundaries in ${topic}?`,
        answer: `I implement defensive validation at the entry boundary (checking for null, empty collections, or invalid ranges), use structured try-catch or Result types, and ensure all resources (file handles, network connections) are cleaned up in finally blocks.`,
        explanation: 'Evaluates your experience in writing resilient production code rather than just happy-path tutorials.',
        tip: 'Mention graceful degradation and returning safe defaults.',
      },
      {
        level: 'Advanced',
        question: `How does ${topic} scale under high-concurrency or distributed environments?`,
        answer: `To scale, we ensure stateless execution so instances can scale horizontally behind load balancers, minimize locks on shared resources, utilize in-memory caching for hot reads, and decouple synchronous calls using asynchronous message queues.`,
        explanation: 'Tests your understanding of system design trade-offs and distributed systems architecture.',
        tip: 'State trade-offs explicitly: there is no single silver bullet, only optimal trade-offs for given SLA requirements.',
      },
    ];
  }

  private generateMemoryCards(course: string, topic: string): MemoryCardItem[] {
    return [
      {
        id: `card1_${topic}`,
        front: `What is the core definition of ${topic}?`,
        back: `A foundational pattern/technique designed to organize logic, prevent repetition, and ensure predictable execution.`,
        category: 'Definition',
      },
      {
        id: `card2_${topic}`,
        front: `What is the #1 mistake developers make with ${topic}?`,
        back: `Ignoring edge cases (empty inputs, null values) and mutating shared state directly without isolation.`,
        category: 'Common Mistake',
      },
      {
        id: `card3_${topic}`,
        front: `When should you choose ${topic} over alternative approaches?`,
        back: `When you need modularity, provable correctness, testability, and optimal asymptotic efficiency at scale.`,
        category: 'Best Practice',
      },
    ];
  }

  private generateOneMinuteRevision(course: string, topic: string): OneMinuteRevisionData {
    return {
      what: `${topic} is a foundational building block for clean, maintainable, high-performance software.`,
      why: 'Eliminates duplicated code, improves readability, and makes automated testing straightforward.',
      importantSyntax: 'Always follow language conventions (snake_case in Python, camelCase in JS) and declare clear interfaces.',
      importantRule: 'Keep each unit focused on a single responsibility (Single Responsibility Principle).',
      commonMistake: 'Forgetting to handle edge boundaries (empty list, null pointer, 0 divisor).',
      realWorldUse: 'Used in payment gateways, real-time messaging, recommendation engines, and microservices.',
      interviewQuestion: 'Be prepared to explain time/space complexity and how you would scale it under 100k requests/sec.',
    };
  }

  private generateCheatSheet(course: string, topic: string): CheatSheetData {
    return {
      title: `${topic.toUpperCase()} CHEAT SHEET`,
      syntaxSummary: [
        'Standard declaration: clean naming indicating action',
        'Parameter input: prioritize immutable data types',
        'Return statement: return explicit values or safe fallbacks',
      ],
      keyRules: [
        'Rule 1: Pure functions/components with no side effects are easiest to test.',
        'Rule 2: Keep functions small (< 25-30 lines) and focused.',
        'Rule 3: Document non-obvious business assumptions in concise docstrings.',
      ],
      commonPitfalls: [
        'Mutating parameters passed by reference.',
        'Over-engineering with unnecessary abstractions too early.',
        'Missing return statements causing silent undefined/None bugs.',
      ],
      quickTips: [
        '💡 Tip: Write unit tests before writing complex business logic.',
        '💡 Tip: Measure latency with profilers before prematurely optimizing.',
        '💡 Tip: Use linters to enforce consistent formatting across your team.',
      ],
    };
  }

  private generateFinalTest(course: string, topic: string): FinalTestQuestion[] {
    return [
      {
        id: 'ft_1',
        question: `[Concept] Which statement accurately describes ${topic}?`,
        questionType: 'concept',
        options: [
          `It is a modular architecture pattern designed to enforce separation of concerns and maintainability.`,
          `It is an outdated concept that causes security vulnerabilities in all modern applications.`,
          `It is only applicable to single-threaded command-line scripts.`,
          `It replaces the need for any database or operating system.`,
        ],
        correctAnswerIndex: 0,
        explanation: `${topic} is universally adopted because it brings order, predictability, and maintainability to software projects.`,
      },
      {
        id: 'ft_2',
        question: `[Practical] When implementing ${topic} in a production environment, what should be your immediate priority?`,
        questionType: 'practical',
        options: [
          `Validating inputs and handling boundary conditions defensively.`,
          `Disabling error logging to reduce disk write overhead.`,
          `Hardcoding database passwords directly inside the source code.`,
          `Allowing infinite loops to run without timeouts.`,
        ],
        correctAnswerIndex: 0,
        explanation: `Defensive validation and explicit error handling protect production systems against crashes and security exploits.`,
      },
      {
        id: 'ft_3',
        question: `[Code] Consider a function or module applying ${topic}. What is the expected behavior if an empty input is received?`,
        questionType: 'code',
        options: [
          `Gracefully return an empty result, default value, or clear domain error without crashing.`,
          `Crash with a Fatal Memory Error and delete local log files.`,
          `Enter an infinite retry loop until memory runs out.`,
          `Send an unencrypted HTTP packet across the network.`,
        ],
        correctAnswerIndex: 0,
        explanation: `Well-written code handles empty or null input collections gracefully and predictably.`,
      },
      {
        id: 'ft_4',
        question: `[Visual] In the visual execution model of ${topic}, how does data typically traverse?`,
        questionType: 'visual',
        options: [
          `Input parameters -> Processing & Validation -> Result / Output State.`,
          `Output -> Delete Input -> Crash Runtime.`,
          `Random jumping between unconnected memory addresses without stack tracking.`,
          `Data flows backwards from database disk to client without CPU evaluation.`,
        ],
        correctAnswerIndex: 0,
        explanation: `The universal execution lifecycle follows a structured pipeline from validated inputs through processing stages to the final output state.`,
      },
    ];
  }
}

export const interactiveTopicEnricher = new InteractiveTopicEnricher();
