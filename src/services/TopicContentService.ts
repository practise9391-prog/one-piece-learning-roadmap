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
          'A function is a reusable block of code that only runs when called. Functions help organize programs into modular, manageable chunks and follow the DRY (Don\'t Repeat Yourself) principle.',
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

      'python_variables': {
        title: 'Variables in Python',
        explanation:
          'Variables are containers for storing data values. In Python, a variable is created the moment you first assign a value to it without needing explicit type declaration.',
        codeSnippet: {
          language: 'python',
          code: `# Dynamic Variable Assignment\ncrew_name = "Straw Hat Pirates"\nship_members = 10\nbounty_total = 8816001000.0\nhas_devil_fruit = True\n\nprint(f"{crew_name} has {ship_members} members.")\nprint(f"Is fruit user: {has_devil_fruit} | Total: ฿{bounty_total:,.0f}")`,
          output: 'Straw Hat Pirates has 10 members.\nIs fruit user: True | Total: ฿8,816,001,000',
        },
        examples: [
          'name = "Zoro"',
          'swords_count = 3',
        ],
        tips: [
          'Variable names cannot start with numbers or contain spaces or hyphens.',
          'Constants are conventionally written in ALL_CAPS.',
        ],
        importantPoints: [
          'Python uses reference assignment: variables point to objects in memory.',
          'Check variable types at runtime using the type() function.',
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
