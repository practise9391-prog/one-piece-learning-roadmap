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
}

export const topicContentService = new TopicContentService();
