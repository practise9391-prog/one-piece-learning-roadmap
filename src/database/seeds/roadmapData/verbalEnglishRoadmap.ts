import { CourseRoadmapSeed } from './types';

export const verbalEnglishRoadmap: CourseRoadmapSeed = {
  courseId: 'verbal_english',
  modules: [
    // --- STAGE 1: GRAMMAR FOUNDATIONS & PARTS OF SPEECH ---
    {
      title: 'English Foundations',
      description: 'Sentence architecture (SVO), clauses, phrases, and sentence classifications.',
      icon: 'book-outline',
      topics: [
        'Sentence Anatomy: Subject, Predicate, and Direct/Indirect Objects',
        'Phrases vs Dependent Clauses vs Independent Clauses',
        'Declarative, Interrogative, Imperative, and Exclamatory Sentences',
        'Simple, Compound, Complex, and Compound-Complex Sentence Structures',
      ],
    },
    {
      title: 'Parts of Speech Overview',
      description: 'The 8 parts of speech and how word functions vary by context.',
      icon: 'list-outline',
      topics: [
        'The 8 Parts of Speech: Definitions and Interrelationships',
        'Same Word Functioning as Different Parts of Speech (e.g., Round, Like)',
        'Recognizing Word Forms, Roots, and Grammatical Suffixes',
      ],
    },
    {
      title: 'Nouns',
      description: 'Noun categories, countable/uncountable, plurals, and possessive forms.',
      icon: 'cube-outline',
      topics: [
        'Proper, Common, Abstract, and Collective Noun Distinctions',
        'Countable vs Uncountable Nouns and Quantity Modifiers (Much vs Many)',
        'Singular and Plural Formation Rules and Irregular Plurals',
        'Possessive Nouns: Correct Use of Apostrophes with Singular and Plural Nouns',
      ],
    },
    {
      title: 'Pronouns',
      description: 'Personal, relative, reflexive, and pronoun-antecedent agreement.',
      icon: 'person-outline',
      topics: [
        'Personal Pronouns: Subjective (He/She) vs Objective (Him/Her) Cases',
        'Relative Pronouns: Who vs Whom, Which vs That Rules',
        'Reflexive and Emphatic Pronouns (-self, -selves) Correct Usage',
        'Indefinite Pronouns (Everyone, Somebody, Neither) Concord',
        'Pronoun-Antecedent Agreement Across Complex Sentences',
      ],
    },
    {
      title: 'Verbs & Verbals',
      description: 'Action, linking, auxiliary, modals, gerunds, and infinitives.',
      icon: 'flash-outline',
      topics: [
        'Action Verbs vs Linking Verbs vs Auxiliary Helping Verbs',
        'Modal Auxiliaries: Can, Could, May, Might, Must, Should, Would',
        'Transitive vs Intransitive Verbs and Object Complements',
        'Verbals: Gerunds (-ing as noun), Infinitives (to + verb), and Participles',
        'Stative Verbs vs Dynamic Verbs and Continuous Tense Restrictions',
      ],
    },
    {
      title: 'Adjectives',
      description: 'Descriptive, degrees of comparison, and proper adjective ordering.',
      icon: 'color-filter-outline',
      topics: [
        'Types of Adjectives: Descriptive, Quantitative, and Demonstrative',
        'Degrees of Comparison: Positive, Comparative, and Superlative Forms',
        'The Royal Order of Adjectives (Quantity, Opinion, Size, Age, Shape, Color, Origin)',
        'Adjectives Functioning as Nouns and Compound Adjectives',
      ],
    },
    {
      title: 'Adverbs',
      description: 'Adverbs of manner, time, frequency, degree, and sentence placement.',
      icon: 'options-outline',
      topics: [
        'Adverbs of Manner, Time, Place, Frequency, and Degree',
        'Formation of Adverbs from Adjectives (-ly ending variations)',
        'Distinguishing Adjectives from Adverbs (Fast, Hard, Early, Well)',
        'Precise Sentence Placement of Adverbs to Avoid Misplaced Modifiers',
      ],
    },
    {
      title: 'Articles',
      description: 'Indefinite a/an, definite the, and zero article omission rules.',
      icon: 'document-text-outline',
      topics: [
        'Indefinite Articles (A vs An based on Initial Vowel/Consonant Sounds)',
        'Definite Article (The): Specific Entities, Superlatives, and Geography',
        'Omission of Articles (Zero Article with Languages, Meals, Proper Nouns)',
        'Common Placement Exam Article Traps and Error Patterns',
      ],
    },
    {
      title: 'Prepositions',
      description: 'Prepositions of time, place, direction, and dependent prepositions.',
      icon: 'pin-outline',
      topics: [
        'Prepositions of Time: At, On, In, For, Since, By, During',
        'Prepositions of Place and Movement: In, At, On, Into, Onto, Across, Through',
        'Dependent Prepositions Fixed to Common Verbs (Rely on, Insist on)',
        'Common Prepositional Idioms and Phrasal Expressions',
      ],
    },
    {
      title: 'Conjunctions',
      description: 'Coordinating FANBOYS, subordinating, and correlative pairs.',
      icon: 'link-outline',
      topics: [
        'Coordinating Conjunctions: FANBOYS (For, And, Nor, But, Or, Yet, So)',
        'Subordinating Conjunctions: Because, Although, Unless, While, Since',
        'Correlative Conjunctions: Either...Or, Neither...Nor, Not Only...But Also',
        'Preventing Run-On Sentences and Comma Splices with Conjunctions',
      ],
    },

    // --- STAGE 2: TENSES & CORE GRAMMAR PRECISION ---
    {
      title: 'Tenses: Present Tenses',
      description: 'Simple present, continuous, perfect, and perfect continuous.',
      icon: 'time-outline',
      topics: [
        'Simple Present: Habitual Actions, Universal Truths, and Routines',
        'Present Continuous: Ongoing Actions and Temporary States',
        'Present Perfect: Past Events with Direct Present Consequence',
        'Present Perfect Continuous: Actions Initiated in Past Continuing to Now',
      ],
    },
    {
      title: 'Tenses: Past & Future Tenses',
      description: 'Simple past, past perfect, future forms, and timeline mapping.',
      icon: 'hourglass-outline',
      topics: [
        'Simple Past vs Past Continuous Tense Distinctions',
        'Past Perfect Tense: The Earlier of Two Past Actions ("Had Done")',
        'Past Perfect Continuous Tense Form and Usage',
        'Future Tenses: Will vs Going To, Future Continuous, and Future Perfect',
        'Mastering Timeline Mapping Across Complex Sentences',
      ],
    },
    {
      title: 'Subject-Verb Agreement',
      description: 'Concord rules for singular/plural, compound subjects, and indefinite pronouns.',
      icon: 'checkmark-circle-outline',
      topics: [
        'Basic Concord: Singular Subject with Singular Verb, Plural with Plural',
        'Compound Subjects Connected by "And" vs "Or / Nor / Either / Neither"',
        'Intervening Prepositional Phrases and Parenthetical Modifiers',
        'Collective Nouns Concord (Team, Committee, Jury: Singular vs Plural)',
        'Indefinite Pronouns Concord: Each, Everyone, Somebody, Nobody, None',
      ],
    },
    {
      title: 'Active and Passive Voice',
      description: 'Transformation rules across tenses, agent omission, and report style.',
      icon: 'swap-horizontal-outline',
      topics: [
        'Core Concept: Agent (Doer) vs Patient (Receiver) in Sentences',
        'Tense-by-Tense Active to Passive Transformation Formulas',
        'When to Use Passive Voice in Technical Reports and Scientific Writing',
        'Passive Voice with Modal Auxiliaries (Can be done, Must be done)',
        'Sentences with Two Objects (Direct and Indirect Passive Shifts)',
      ],
    },
    {
      title: 'Direct and Indirect Speech',
      description: 'Reported speech rules: tense shifts, pronoun adjustments, and commands.',
      icon: 'chatbubbles-outline',
      topics: [
        'Direct Quotation Rules, Inverted Commas, and Punctuation Conventions',
        'Tense Backshift Rules in Reported Statements (Present to Past)',
        'Exceptions to Tense Backshift: Universal Truths and Habitual Facts',
        'Pronoun Shifts and Time/Place Adverb Changes (Now to Then, Here to There)',
        'Reporting Interrogative Questions (Yes/No vs Wh- Questions)',
        'Reporting Imperative Orders, Requests, Warnings, and Exclamations',
      ],
    },

    // --- STAGE 3: VOCABULARY & SENTENCE SKILLS ---
    {
      title: 'Vocabulary & Word Building',
      description: 'Greek and Latin root words, prefixes, suffixes, and collocations.',
      icon: 'bulb-outline',
      topics: [
        'Greek and Latin Root Words Method (Chron, Spec, Bene, Mal, Bio, Path)',
        'Prefixes (Re-, Pre-, Post-, Anti-) and Suffixes (-tion, -able, -ment, -ize)',
        'High-Frequency Academic and Professional Collocations',
        'Using Context Clues (Contrast, Restatement, Cause) to Deduce Meaning',
      ],
    },
    {
      title: 'Synonyms & Antonyms',
      description: 'Nuance, formal vs informal pairs, connotations, and negation prefixes.',
      icon: 'copy-outline',
      topics: [
        'Denotation vs Connotation: Subtle Shades of Meaning (Frugal vs Miserly)',
        'Academic and Business Synonyms for Overused Words',
        'Direct Opposites vs Gradual Continuum Antonyms',
        'Negative Prefix Antonyms: Un-, In-, Im-, Ir-, Il-, Dis-, Mis-',
        'Eliminating Antonym Distractors in Multiple-Choice Questions',
      ],
    },
    {
      title: 'One-Word Substitutions',
      description: 'Terms for personality, studies, administration, and corporate roles.',
      icon: 'pricetag-outline',
      topics: [
        'Terms Describing Personality Traits, Character, and Human Behavior',
        'Terms Related to Sciences, Studies, Arts, and Vocations (-logy, -graphy)',
        'Terms Related to Government Systems, Governance, and Authority',
        'Common Corporate, Legal, and Technical One-Word Substitutes',
      ],
    },
    {
      title: 'Idioms, Phrases & Phrasal Verbs',
      description: 'Workplace idioms, everyday phrases, and phrasal verb combinations.',
      icon: 'chatbubble-ellipses-outline',
      topics: [
        'High-Yield Business and Workplace Idioms (Bite the bullet, Touch base)',
        'Common Colloquial Idioms and Everyday Metaphors',
        'Phrasal Verbs with Take, Bring, Put, Call, Break, and Turn',
        'Separable vs Inseparable Phrasal Verbs in Professional Discourse',
      ],
    },
    {
      title: 'Sentence Correction & Error Detection',
      description: 'Dangling modifiers, parallelism, redundancy, and four-part error drills.',
      icon: 'create-outline',
      topics: [
        'Identifying Dangling and Misplaced Modifiers in Sentences',
        'Faulty Parallelism in Lists, Series, and Comparison Structures',
        'Redundancy, Wordiness, and Cliché Elimination Techniques',
        'Spotting Grammatical Errors in Four-Part Split Sentence Drills',
      ],
    },
    {
      title: 'Fill in the Blanks & Sentence Completion',
      description: 'Single-blank vocabulary and double-blank contextual transitions.',
      icon: 'pencil-outline',
      topics: [
        'Single-Blank Questions: Precision Vocabulary and Grammatical Agreement',
        'Double-Blank Questions: Balancing Conjunctions and Tone Consistency',
        'Contrast and Transition Markers (Although, However, Despite, Moreover)',
        'Prepositional Fill-in-the-Blank Questions in Placement Tests',
      ],
    },
    {
      title: 'Sentence Rearrangement & Para Jumbles',
      description: 'Mandatory pairs, pronoun links, chronology, and paragraph coherence.',
      icon: 'shuffle-outline',
      topics: [
        'Identifying the Independent Opening / Topic Sentence',
        'Finding Mandatory Sentence Pairs (Cause-Effect, Acronym-Full Form)',
        'Tracking Pronoun and Demonstrative Noun Links Across Sentences',
        'Chronological and Logical Narrative Order Strategy',
      ],
    },

    // --- STAGE 4: READING, WRITING & PLACEMENT SKILLS ---
    {
      title: 'Reading Comprehension: Strategies',
      description: 'Skimming, scanning, identifying author tone, inference, and main ideas.',
      icon: 'reader-outline',
      topics: [
        'Active Reading: Skimming for Central Theme vs Scanning for Factual Details',
        'Determining the Author Tone and Perspective (Critical, Objective, Sarcastic)',
        'Drawing Valid Logical Inferences from Passage Statements',
        'Handling Vocabulary-in-Context and Reference-Based Questions',
      ],
    },
    {
      title: 'Cloze Tests & Critical Reading',
      description: 'Elimination in continuous passages and evaluating argument logic.',
      icon: 'file-tray-full-outline',
      topics: [
        'Cloze Test Mastery: Reading First for Cohesion Before Selecting Options',
        'Grammar vs Vocabulary Elimination Clues in Cloze Paragraphs',
        'Critical Reading: Evaluating Underlying Assumptions in Short Texts',
        'Strengthening vs Weakening Conclusions in Argument Passages',
      ],
    },
    {
      title: 'Written Communication: Principles',
      description: 'The 7 Cs of communication, paragraph structure, and executive clarity.',
      icon: 'document-text-outline',
      topics: [
        'The 7 Cs of Professional Communication (Clear, Concise, Concrete, etc.)',
        'Paragraph Architecture: Topic Sentence, Supporting Facts, Concluding Insight',
        'Eliminating Passive Fluff, Jargon, and Unnecessary Corporate Speak',
        'Self-Editing and Proofreading Checklist for Technical Writers',
      ],
    },
    {
      title: 'Email Writing: Professional Standards',
      description: 'Actionable subject lines, salutations, body structure, and sign-offs.',
      icon: 'mail-outline',
      topics: [
        'Crafting Clear, Concise, and Actionable Email Subject Lines',
        'Professional Salutations, Openings, and Context Setting',
        'Structuring Requests, Status Updates, Escalations, and Meeting Notes',
        'Polite Disagreements, Constructive Feedback, and Professional Sign-offs',
      ],
    },
    {
      title: 'Workplace & Resume Communication',
      description: 'Action verbs for resumes, technical chat etiquette, and documentation.',
      icon: 'briefcase-outline',
      topics: [
        'Strong Action Verbs and Quantifiable Metrics for Resume Bullet Points',
        'Writing an Impactful Cover Letter for Engineering Positions',
        'Technical Chat Etiquette (Slack, Teams, PR Code Reviews, Issue Tracking)',
        'Drafting Clear Release Notes and User-Facing Documentation',
      ],
    },
    {
      title: 'Interview English & HR Questions',
      description: 'Tell me about yourself, STAR storytelling, strengths, and weaknesses.',
      icon: 'mic-outline',
      topics: [
        'Crafting Your "Tell Me About Yourself" Pitch (Present-Past-Future Formula)',
        'The STAR Method for Behavioral Questions (Situation, Task, Action, Result)',
        'Framing Technical Strengths and Areas of Growth Constructively',
        'Asking Insightful, High-Impact Questions to the Interview Panel',
      ],
    },
    {
      title: 'Placement Verbal Tests',
      description: 'Corporate placement mock simulations and error pattern reviews.',
      icon: 'trophy-outline',
      topics: [
        'Full-Length Placement Verbal Test: TCS NQT Format Mock Simulation',
        'Infosys Verbal Ability Pattern: Error Spotting and Reading Comprehension',
        'Accenture and Cognizant Verbal Ability Simulations',
        'Reviewing the Top 20 Most Frequent Placement Verbal Mistakes',
      ],
    },
  ],
};
