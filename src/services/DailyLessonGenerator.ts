import {
  TaskCategory,
  TaskDifficulty,
  StructuredDailyLesson,
  DailyPracticeQuestion,
  WorkedExample,
  SpeakingTaskData,
  CodingChallengeData,
} from '../models/DailyLearning';

export class DailyLessonGenerator {
  /**
   * Generates a complete, structured daily lesson for any category and topic.
   */
  public static generateLesson(
    category: TaskCategory,
    courseId: string,
    topicTitle: string,
    difficulty: TaskDifficulty = 'INTERMEDIATE'
  ): StructuredDailyLesson {
    switch (category) {
      case 'APTITUDE':
        return this.generateAptitudeLesson(topicTitle, difficulty);
      case 'REASONING':
        return this.generateReasoningLesson(topicTitle, difficulty);
      case 'VERBAL_ENGLISH':
        return this.generateVerbalEnglishLesson(topicTitle, difficulty);
      case 'SPEAKING':
        return this.generateSpeakingLesson(topicTitle, difficulty);
      case 'CODING':
        return this.generateCodingLesson(topicTitle, difficulty);
      case 'REVISION':
        return this.generateRevisionLesson(courseId, topicTitle, difficulty);
      case 'MAIN_COURSE':
      default:
        return this.generateTechnicalLesson(courseId, topicTitle, difficulty);
    }
  }

  // ==========================================
  // 1. APTITUDE LESSON GENERATOR
  // ==========================================
  private static generateAptitudeLesson(
    topicTitle: string,
    difficulty: TaskDifficulty
  ): StructuredDailyLesson {
    const isPercentage = topicTitle.toLowerCase().includes('percent');
    const isProfitLoss = topicTitle.toLowerCase().includes('profit') || topicTitle.toLowerCase().includes('loss');
    const isRatio = topicTitle.toLowerCase().includes('ratio') || topicTitle.toLowerCase().includes('proportion');
    const isTimeWork = topicTitle.toLowerCase().includes('work') || topicTitle.toLowerCase().includes('pipe');

    let conceptSummary = `Mastering ${topicTitle} is essential for quantitative speed and placement tests. Focus on understanding the fractional basis rather than rote memorization.`;
    let understandingAnalogy = `Think of this concept like dividing a treasure chest among crew members: proportional shares ensure exact calculations every single time.`;
    let formulas: string[] = [];
    let workedExamples: WorkedExample[] = [];
    let questions: DailyPracticeQuestion[] = [];

    if (isPercentage) {
      conceptSummary = `A percentage represents a fraction with denominator 100. Converting fractions (e.g. 1/6 = 16.66%, 1/8 = 12.5%) into instant multipliers is the secret to 10-second solutions.`;
      understandingAnalogy = `If a ship's cargo increases by 25% (1/4), it is now 125% (5/4) of its original size. If it then decreases by 20% (1/5), it returns exactly to original (5/4 × 4/5 = 1).`;
      formulas = [
        'Percentage Change = ((New Value - Old Value) / Old Value) × 100%',
        'Successive Change formula: a + b + (ab / 100)%',
        'If price increases by R%, consumption must decrease by [R / (100 + R)] × 100% to keep expenditure constant.',
        'Fraction Multipliers: +20% = ×1.2, -15% = ×0.85, +33.33% = ×4/3',
      ];
      workedExamples = [
        {
          question: 'The price of sugar rises by 25%. By what percentage must a family reduce consumption so that total expenditure remains unchanged?',
          stepByStep: [
            'Let original price = 100 and original consumption = 100. Total expenditure = 100 × 100 = 10,000.',
            'New price = 125. Required new consumption = 10,000 / 125 = 80.',
            'Reduction needed = 100 - 80 = 20 units.',
            'Percentage reduction = (20 / 100) × 100 = 20%.',
            'Shortcut: [R / (100 + R)] × 100 = [25 / 125] × 100 = 1/5 × 100 = 20%.',
          ],
          answer: '20% reduction',
        },
      ];
      questions = [
        {
          id: 'q_apt_1',
          question: 'What is 16.67% of 420?',
          options: ['60', '70', '80', '65'],
          correctIndex: 1,
          explanation: '16.67% is equivalent to the fraction 1/6. (1/6) × 420 = 70.',
          difficulty: 'BEGINNER',
        },
        {
          id: 'q_apt_2',
          question: 'A number is first increased by 20% and then decreased by 20%. What is the net change in the number?',
          options: ['No change', '4% increase', '4% decrease', '2% decrease'],
          correctIndex: 2,
          explanation: 'Using successive formula a + b + (ab/100): 20 - 20 - (400/100) = -4%. Hence, 4% decrease.',
          difficulty: 'INTERMEDIATE',
        },
        {
          id: 'q_apt_3',
          question: 'If A earns 25% more than B, by what percentage does B earn less than A?',
          options: ['25%', '20%', '16.67%', '33.33%'],
          correctIndex: 1,
          explanation: 'Let B = 100 => A = 125. B is 25 less than A. Percentage = (25 / 125) × 100 = 20%.',
          difficulty: 'INTERMEDIATE',
        },
        {
          id: 'q_apt_4',
          question: 'In an election between two candidates, the winner gets 58% of votes and wins by a majority of 1,600 votes. What was the total number of votes polled?',
          options: ['8,000', '10,000', '12,000', '16,000'],
          correctIndex: 1,
          explanation: 'Winner = 58%, Loser = 42%. Difference = 16%. If 16% = 1,600, then 100% = 10,000.',
          difficulty: 'ADVANCED',
        },
        {
          id: 'q_apt_5',
          question: 'If the radius of a circle is increased by 10%, by what percentage does its area increase?',
          options: ['20%', '21%', '10%', '25%'],
          correctIndex: 1,
          explanation: 'Area is proportional to r². Net change = 10 + 10 + (10 × 10)/100 = 21%.',
          difficulty: 'ADVANCED',
        },
      ];
    } else if (isProfitLoss) {
      conceptSummary = `Profit and Loss is an extension of percentages where Cost Price (CP) is the base (100%). Selling Price (SP) determines profit or loss.`;
      understandingAnalogy = `When buying goods in Loguetown to sell in Water 7, every penny above the purchase cost is pure profit, while markups create room for negotiation discounts.`;
      formulas = [
        'Profit % = ((SP - CP) / CP) × 100',
        'Loss % = ((CP - SP) / CP) × 100',
        'SP = CP × (100 + P%) / 100',
        'Marked Price (MP) Discount: SP = MP × (100 - Discount%) / 100',
      ];
      workedExamples = [
        {
          question: 'A merchant buys an item for $400 and sells it for $500. Find the profit percentage.',
          stepByStep: [
            'CP = $400, SP = $500',
            'Profit = SP - CP = $500 - $400 = $100',
            'Profit % = (100 / 400) × 100 = 25%',
          ],
          answer: '25% Profit',
        },
      ];
      questions = [
        {
          id: 'q_pl_1',
          question: 'If an item is sold for $240 at a 20% profit, what was its cost price?',
          options: ['$190', '$200', '$210', '$220'],
          correctIndex: 1,
          explanation: 'SP = 120% of CP. CP = 240 / 1.20 = $200.',
          difficulty: 'BEGINNER',
        },
        {
          id: 'q_pl_2',
          question: 'A shopkeeper sells an article at a discount of 10% on marked price and still makes 20% profit. If CP is $300, what is the Marked Price?',
          options: ['$360', '$400', '$450', '$380'],
          correctIndex: 1,
          explanation: 'SP = 300 × 1.20 = 360. MP × 0.90 = 360 => MP = 360 / 0.9 = $400.',
          difficulty: 'INTERMEDIATE',
        },
      ];
    } else {
      // General quantitative lesson
      formulas = [
        'Speed = Distance / Time',
        'Work = Rate × Time',
        'Total Work = LCM of individual times',
        'Efficiency is inversely proportional to time taken.',
      ];
      workedExamples = [
        {
          question: 'A can complete a job in 12 days and B in 24 days. How long will they take working together?',
          stepByStep: [
            'Total work = LCM(12, 24) = 24 units.',
            'Rate of A = 24 / 12 = 2 units/day.',
            'Rate of B = 24 / 24 = 1 unit/day.',
            'Combined rate = 2 + 1 = 3 units/day.',
            'Time taken = 24 / 3 = 8 days.',
          ],
          answer: '8 days',
        },
      ];
      questions = [
        {
          id: 'q_gen_1',
          question: 'If Pipe A fills a tank in 4 hours and Pipe B empties it in 6 hours, how long does it take to fill the tank when both are open?',
          options: ['10 hours', '12 hours', '8 hours', '15 hours'],
          correctIndex: 1,
          explanation: 'Net rate = 1/4 - 1/6 = (3 - 2)/12 = 1/12 tank per hour. Time = 12 hours.',
          difficulty: 'INTERMEDIATE',
        },
        {
          id: 'q_gen_2',
          question: 'Two trains traveling in opposite directions at 54 km/h and 36 km/h cross each other in 12 seconds. What is the sum of their lengths?',
          options: ['250 m', '300 m', '360 m', '400 m'],
          correctIndex: 1,
          explanation: 'Relative speed = 54 + 36 = 90 km/h = 90 × (5/18) = 25 m/s. Total length = Speed × Time = 25 × 12 = 300 meters.',
          difficulty: 'ADVANCED',
        },
      ];
    }

    return {
      title: topicTitle,
      conceptSummary,
      understandingAnalogy,
      formulasAndRules: formulas,
      workedExamples,
      practiceQuestions: questions,
    };
  }

  // ==========================================
  // 2. REASONING LESSON GENERATOR
  // ==========================================
  private static generateReasoningLesson(
    topicTitle: string,
    difficulty: TaskDifficulty
  ): StructuredDailyLesson {
    const isBloodRelations = topicTitle.toLowerCase().includes('blood') || topicTitle.toLowerCase().includes('relation');
    const isCodingDecoding = topicTitle.toLowerCase().includes('coding') || topicTitle.toLowerCase().includes('cipher');

    let conceptSummary = `In ${topicTitle}, precision in tracking variables and structured elimination is the key to solving questions without confusion.`;
    let understandingAnalogy = `Approach reasoning like an investigator connecting clues on a pinboard: eliminate false leads step-by-step until only the true arrangement remains.`;
    let rules: string[] = [];
    let workedExamples: WorkedExample[] = [];
    let questions: DailyPracticeQuestion[] = [];

    if (isBloodRelations) {
      rules = [
        'Use standard tree symbols: [Square] = Male, (Circle) = Female, <=> = Married, | = Offspring, - = Sibling.',
        'Maternal hierarchy refers to Mother\'s side (Maternal Uncle = Mama), Paternal refers to Father\'s side.',
        'Never assume gender based on name; only establish gender through explicit pronouns or relationships.',
        'In coded blood relations (e.g. P + Q means P is father of Q), decipher relations right-to-left.',
      ];
      workedExamples = [
        {
          question: 'Pointing to a photograph, Rohit said, "She is the only daughter of my grandfather\'s only son." How is Rohit related to the girl?',
          stepByStep: [
            'Grandfather\'s only son = Rohit\'s Father.',
            'Only daughter of Rohit\'s Father = Rohit\'s Sister.',
            'Therefore, Rohit is the brother of the girl in the photograph.',
          ],
          answer: 'Brother',
        },
      ];
      questions = [
        {
          id: 'q_reas_1',
          question: 'Pointing to a man, a woman said, "His mother is the only daughter of my mother." How is the woman related to the man?',
          options: ['Sister', 'Mother', 'Aunt', 'Grandmother'],
          correctIndex: 1,
          explanation: '"Only daughter of my mother" is the woman herself. So the man\'s mother is the woman. She is his Mother.',
          difficulty: 'BEGINNER',
        },
        {
          id: 'q_reas_2',
          question: 'If A + B means A is the brother of B; A - B means A is the sister of B; A * B means A is the father of B. Which means C is the son of M?',
          options: ['M * C + N', 'M * C - N', 'C + M * N', 'N * C + M'],
          correctIndex: 0,
          explanation: 'In M * C + N: M is father of C, and C is brother of N (confirming C is male). Thus C is the son of M.',
          difficulty: 'INTERMEDIATE',
        },
        {
          id: 'q_reas_3',
          question: 'A family has a husband, wife, two sons, and two daughters. All ladies were invited to dinner. Both sons went out to play. Husband did not return from office. Who was at home?',
          options: ['Only the husband', 'Nobody was at home', 'Only the wife', 'Both daughters'],
          correctIndex: 1,
          explanation: 'Wife & daughters went to dinner. Sons were out playing. Husband did not return. Hence, nobody was at home.',
          difficulty: 'BEGINNER',
        },
      ];
    } else if (isCodingDecoding) {
      rules = [
        'EJOTY rule: E=5, J=10, O=15, T=20, Y=25 for rapid forward letter numbering.',
        'Opposite letters sum to 27 (A-Z, B-Y, C-X, D-W, E-V, etc.).',
        'Check for fixed shift (+1, +2), alternate shift (+1, -1), or reversed word order.',
        'In fictitious language coding, compare two sentences with one shared word to isolate its code.',
      ];
      workedExamples = [
        {
          question: 'If "LOGIC" is coded as "JMEHB", what is the code for "BRAIN"?',
          stepByStep: [
            'Compare letters: L(12) -> J(10) [-2], O(15) -> M(13) [-2], G(7) -> E(5) [-2], I(9) -> H(8) [-1], C(3) -> B(2) [-1].',
            'Pattern is -2 for first three letters, -1 for next two.',
            'B(2)-2 = Z(26), R(18)-2 = P(16), A(1)-2 = Y(25), I(9)-1 = H(8), N(14)-1 = M(13).',
            'Code is "ZPYHM".',
          ],
          answer: 'ZPYHM',
        },
      ];
      questions = [
        {
          id: 'q_reas_cd_1',
          question: 'In a certain code, "ROAD" is written as "URDG". How is "SWAN" written in that code?',
          options: ['VXDQ', 'VZDQ', 'UXDQ', 'VZEP'],
          correctIndex: 1,
          explanation: 'Each letter is shifted forward by +3 (R+3=U, O+3=R, A+3=D, D+3=G). S+3=V, W+3=Z, A+3=D, N+3=Q => VZDQ.',
          difficulty: 'BEGINNER',
        },
        {
          id: 'q_reas_cd_2',
          question: 'If "pit dar na" means "you are good", and "dar tok pa" means "good and bad", what is the code for "good"?',
          options: ['pit', 'dar', 'na', 'tok'],
          correctIndex: 1,
          explanation: 'The common English word in both sentences is "good", and the common code word is "dar". Therefore, "good" = "dar".',
          difficulty: 'INTERMEDIATE',
        },
      ];
    } else {
      rules = [
        'Diagram standard Venn intersections for all Syllogisms.',
        'Always check for direction reference points (North is Up, South is Down, East is Right, West is Left).',
        'In Linear Seating, facing North means Right is East; facing South means Right is West.',
      ];
      workedExamples = [
        {
          question: 'A person walks 5 km North, turns right and walks 12 km. How far is he from his starting point?',
          stepByStep: [
            'Forms a right-angled triangle with sides 5 km and 12 km.',
            'Hypotenuse = √(5² + 12²) = √(25 + 144) = √169 = 13 km.',
          ],
          answer: '13 km North-East',
        },
      ];
      questions = [
        {
          id: 'q_reas_dir_1',
          question: 'Ravi travels 4 km towards East, then turns right and travels 3 km. How far is he from his starting point?',
          options: ['7 km', '5 km', '1 km', '6 km'],
          correctIndex: 1,
          explanation: 'Pythagorean theorem: √(4² + 3²) = √(16 + 9) = √25 = 5 km.',
          difficulty: 'BEGINNER',
        },
      ];
    }

    return {
      title: topicTitle,
      conceptSummary,
      understandingAnalogy,
      formulasAndRules: rules,
      workedExamples,
      practiceQuestions: questions,
    };
  }

  // ==========================================
  // 3. VERBAL ENGLISH LESSON GENERATOR
  // ==========================================
  private static generateVerbalEnglishLesson(
    topicTitle: string,
    difficulty: TaskDifficulty
  ): StructuredDailyLesson {
    const rules = [
      'Subject-Verb Agreement: A singular subject takes a singular verb; plural subject takes plural verb.',
      'Neither/Nor & Either/Or: Verb agrees with the subject closest to it (proximity rule).',
      'Tense Consistency: Do not shift tenses mid-sentence unless describing consecutive historical events.',
      'Active vs Passive: Active voice ("The developer fixed the bug") is punchier and preferred over passive voice ("The bug was fixed by the developer").',
    ];

    const workedExamples: WorkedExample[] = [
      {
        question: 'Identify the error: "Each of the crew members were given a new navigation map."',
        stepByStep: [
          '"Each" is an indefinite singular pronoun.',
          'Therefore, it requires a singular verb ("was" instead of "were").',
          'Correct: "Each of the crew members was given a new navigation map."',
        ],
        answer: 'Replace "were" with "was"',
      },
    ];

    const questions: DailyPracticeQuestion[] = [
      {
        id: 'q_verb_1',
        question: 'Neither the manager nor the employees _____ present at the conference.',
        options: ['was', 'were', 'is', 'are being'],
        correctIndex: 1,
        explanation: 'Under the proximity rule for "neither...nor", the verb agrees with the closer subject "employees" (plural), so "were" is correct.',
        difficulty: 'INTERMEDIATE',
      },
      {
        id: 'q_verb_2',
        question: 'Choose the word most nearly opposite in meaning to "CANDID":',
        options: ['Frank', 'Deceitful', 'Blunt', 'Direct'],
        correctIndex: 1,
        explanation: '"Candid" means truthful and straightforward. The opposite is "Deceitful" (dishonest or secretive).',
        difficulty: 'INTERMEDIATE',
      },
      {
        id: 'q_verb_3',
        question: 'She has been working on this machine _____ morning.',
        options: ['for', 'since', 'from', 'in'],
        correctIndex: 1,
        explanation: '"Since" is used with a specific point in time ("morning"), whereas "for" is used with a duration ("for 4 hours").',
        difficulty: 'BEGINNER',
      },
    ];

    return {
      title: topicTitle,
      conceptSummary: `Effective verbal ability hinges on understanding structural rules, eliminating ambiguous modifiers, and expanding contextual vocabulary.`,
      understandingAnalogy: `Grammar is like clean architecture in code: consistent syntax ensures the listener receives the message with zero compilation ambiguity.`,
      formulasAndRules: rules,
      workedExamples,
      practiceQuestions: questions,
    };
  }

  // ==========================================
  // 4. ENGLISH SPEAKING LESSON GENERATOR
  // ==========================================
  private static generateSpeakingLesson(
    topicTitle: string,
    difficulty: TaskDifficulty
  ): StructuredDailyLesson {
    const isSelfIntro = topicTitle.toLowerCase().includes('intro');

    const speakingTask: SpeakingTaskData = {
      scenario: isSelfIntro ? 'Technical Job Interview: Icebreaker' : 'Workplace Stand-Up / Team Sync',
      role: isSelfIntro ? 'Software Engineer Candidate' : 'Developer giving daily update',
      preparationSeconds: 45,
      speakingSeconds: 90,
      usefulVocab: ['architecting', 'collaborative', 'initiative', 'milestone', 'scalable', 'efficient'],
      suggestedPhrases: [
        'Good morning, everyone. Thanks for the opportunity.',
        'Over the past year, I have focused on building resilient mobile apps...',
        'One technical challenge I recently solved involved...',
        'My goal is to bring robust code quality and proactive problem-solving to the team.',
      ],
      prompt: isSelfIntro
        ? 'Introduce yourself in 90 seconds. Cover your background, your main programming strengths, a key project you are proud of, and why you love technology.'
        : 'Give a crisp 60-second update: state what you accomplished yesterday, what you are building today, and one technical blocker you resolved.',
    };

    return {
      title: topicTitle,
      conceptSummary: `Speaking English with poise requires breath pacing, steady eye contact, and replacing filler words ("um", "like") with short deliberate pauses.`,
      understandingAnalogy: `Speaking without fear is like sailing into new waters: once you launch the opening sentence with energy, the rest of your thoughts flow naturally.`,
      formulasAndRules: [
        'P-E-E formula for spoken answers: Point -> Example -> Explanation.',
        'Use the 3-second pause: Take a breath before answering instead of saying "uh/um".',
        'End sentences with downward vocal inflection for authority and confidence.',
        'Keep sentences between 8 to 15 words for maximum spoken clarity.',
      ],
      workedExamples: [
        {
          question: 'Sample 90-Second Self-Introduction:',
          stepByStep: [
            'Opening: "Hello everyone, my name is Pavan. I am a full-stack developer passionate about building scalable, offline-first mobile applications."',
            'Experience: "Over the past several months, I have built an educational learning roadmap app with SQLite local caching and responsive navigation."',
            'Strength: "My core strengths lie in TypeScript, React Native, and clean architecture."',
            'Closing: "I look forward to discussing how I can add immediate value to your engineering team today."',
          ],
          answer: 'Complete Spoken Script',
        },
      ],
      practiceQuestions: [],
      speakingTask,
    };
  }

  // ==========================================
  // 5. CODING CHALLENGE LESSON GENERATOR
  // ==========================================
  private static generateCodingLesson(
    topicTitle: string,
    difficulty: TaskDifficulty
  ): StructuredDailyLesson {
    const codingChallenge: CodingChallengeData = {
      problem: 'Two Sum Problem: Given an array of integers and a target integer, return indices of the two numbers such that they add up to target.',
      inputDescription: 'An array of integers `nums` and an integer `target`.',
      outputDescription: 'List of two indices [i, j] where nums[i] + nums[j] == target.',
      sampleInput: 'nums = [2, 7, 11, 15], target = 9',
      sampleOutput: '[0, 1]',
      hint: 'Use a hash map to store previously seen numbers and their indices for O(n) lookup.',
      starterCode: `def two_sum(nums: list[int], target: int) -> list[int]:\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []`,
      solutionWalkthrough: 'By checking `target - num` in a hash map, we avoid an O(n²) nested loop and achieve optimal O(n) time and O(n) auxiliary space.',
    };

    return {
      title: topicTitle,
      conceptSummary: `Algorithmic problem solving requires recognizing pattern templates (two-pointer, hash table, sliding window) and analyzing time/space trade-offs.`,
      understandingAnalogy: `Hash tables are like ship logbooks: instead of searching every cabin for a crewmate, you check the ledger index in O(1) time.`,
      formulasAndRules: [
        'Time Complexity: Prefer O(n) or O(n log n) over O(n²).',
        'Space Complexity: Trading extra memory (hash table) to save CPU cycles is often optimal.',
        'Edge cases to check: empty array, negative numbers, duplicate values, large numbers.',
      ],
      workedExamples: [
        {
          question: 'Why does a Hash Map reduce Two Sum from O(n²) to O(n)?',
          stepByStep: [
            'Brute force checks every pair (n × (n-1) / 2) -> O(n²).',
            'With Hash Map, for each element we calculate complement = target - num.',
            'Dictionary lookup is average O(1).',
            'Single pass through n elements results in O(n) total time.',
          ],
          answer: 'O(n) Optimal Time',
        },
      ],
      practiceQuestions: [],
      codingChallenge,
    };
  }

  // ==========================================
  // 6. TECHNICAL MAIN COURSE GENERATOR
  // ==========================================
  private static generateTechnicalLesson(
    courseId: string,
    topicTitle: string,
    difficulty: TaskDifficulty
  ): StructuredDailyLesson {
    return {
      title: topicTitle,
      conceptSummary: `Deep-dive into ${topicTitle} under ${courseId.toUpperCase()}. Understand the core architecture, syntax patterns, and defensive programming practices.`,
      understandingAnalogy: `Good software engineering is like shipbuilding: proper modular components make the entire vessel resistant to rough seas and scale.`,
      formulasAndRules: [
        'Keep functions small, pure, and focused on a single responsibility (SRP).',
        'Handle null/undefined edge cases explicitly.',
        'Write descriptive variable names that eliminate the need for explanatory comments.',
      ],
      workedExamples: [
        {
          question: `Practical implementation of ${topicTitle}`,
          stepByStep: [
            '1. Define clean typed interfaces for inputs and outputs.',
            '2. Implement defensive guards against invalid parameters.',
            '3. Execute the core business logic.',
            '4. Return deterministic, predictable results.',
          ],
          answer: 'Production Implementation',
        },
      ],
      practiceQuestions: [
        {
          id: `q_tech_${Date.now()}_1`,
          question: `What is the primary architectural advantage of modularity in ${topicTitle}?`,
          options: [
            'Decreases testability and increases coupling',
            'Isolates concerns, enhances reusability, and simplifies testing',
            'Slightly slows down compile time',
            'Requires duplicate database migrations',
          ],
          correctIndex: 1,
          explanation: 'Modularity isolates concerns into cohesive units, making code easier to test, refactor, and maintain without side effects.',
          difficulty: 'INTERMEDIATE',
        },
        {
          id: `q_tech_${Date.now()}_2`,
          question: 'Which of the following represents defensive error handling best practice?',
          options: [
            'Swallowing all exceptions silently with empty catch blocks',
            'Validating inputs upfront and returning descriptive errors',
            'Assuming external network APIs will never time out',
            'Hardcoding credentials directly inside component files',
          ],
          correctIndex: 1,
          explanation: 'Validating inputs upfront prevents invalid state propagation and makes debugging immediate.',
          difficulty: 'BEGINNER',
        },
      ],
    };
  }

  // ==========================================
  // 7. REVISION LESSON GENERATOR
  // ==========================================
  private static generateRevisionLesson(
    courseId: string,
    topicTitle: string,
    difficulty: TaskDifficulty
  ): StructuredDailyLesson {
    return {
      title: `Revision: ${topicTitle}`,
      conceptSummary: `Spaced Repetition Review for ${topicTitle}. Testing your memory retrieval reinforces neural pathways and cements long-term mastery.`,
      understandingAnalogy: `Reviewing a topic across spaced intervals turns temporary short-term memory into permanent intuition, like treading a path until it becomes permanent.`,
      formulasAndRules: [
        'Retrieve from memory before checking the answer.',
        'Identify whether any mistake was due to misreading, formula confusion, or conceptual gap.',
        'High scores (>85%) will advance this topic to a longer spaced review interval.',
      ],
      workedExamples: [
        {
          question: `Quick Retrieval Check for ${topicTitle}`,
          stepByStep: [
            '1. Recall the primary definition and formula.',
            '2. State two common pitfalls to avoid.',
            '3. Solve the practice questions without consulting notes.',
          ],
          answer: 'Spaced Retrieval Complete',
        },
      ],
      practiceQuestions: [
        {
          id: `q_rev_${Date.now()}_1`,
          question: `Which strategy best ensures long-term retention of ${topicTitle}?`,
          options: [
            'Cramming once the night before an exam',
            'Active recall and solving questions across spaced intervals',
            'Rereading notes passively without testing yourself',
            'Skipping practice problems entirely',
          ],
          correctIndex: 1,
          explanation: 'Cognitive science shows active recall and spaced repetition produce vastly superior long-term retention compared to passive rereading.',
          difficulty: 'BEGINNER',
        },
      ],
    };
  }
}
