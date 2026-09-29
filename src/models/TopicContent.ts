export interface TopicCodeSnippet {
  language: string;
  code: string;
  output?: string;
}

export interface CommonMistakeItem {
  mistake: string;
  correction: string;
  explanation?: string;
}

export interface PracticeProblemItem {
  title?: string;
  question: string;
  hint?: string;
  solution: string;
  starterCode?: string;
}

export interface VocabularyItem {
  word: string;
  meaning: string;
  example: string;
}

export interface DialogueItem {
  speaker: string;
  text: string;
}


export interface ArchitectureNode {
  id: string;
  label: string;
  role: string;
  type: 'client' | 'cdn' | 'gateway' | 'lb' | 'service' | 'cache' | 'database' | 'queue' | 'storage' | 'search';
  techExamples?: string[];
  explanation?: string;
  hitMissInfo?: string;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
}

export interface ArchitectureFlowData {
  title: string;
  description?: string;
  nodes: ArchitectureNode[];
  edges?: ArchitectureEdge[];
  flowSteps?: string[];
}

export interface SystemDesignTradeOff {
  title: string;
  optionA: string;
  optionB: string;
  comparison: Array<{ criterion: string; optionA: string; optionB: string }>;
  recommendation: string;
}

export interface SystemDesignInterviewQnA {
  question: string;
  answer: string;
  tips?: string;
}

export interface SystemDesignAnalogy {
  title: string;
  scenario: string;
  mapping: Array<{ realWorld: string; systemDesign: string; explanation: string }>;
}


export interface AlgorithmApproachProgression {
  name: string;
  type: 'BRUTE_FORCE' | 'BETTER' | 'OPTIMAL';
  complexity: string;
  code: string;
  bottleneck?: string;
  explanation: string;
}

export interface AlgorithmComplexityAnalysis {
  timeBest: string;
  timeAvg: string;
  timeWorst: string;
  space: string;
  explanation: string;
}

export interface AlgorithmLabStep {
  lineIndex: number;
  variables: Record<string, string | number | boolean>;
  highlightedIndices?: number[];
  action: string;
}

export interface AlgorithmLabData {
  title: string;
  description?: string;
  array: number[];
  target?: number;
  codeLines: string[];
  steps: AlgorithmLabStep[];
}

export interface MiniProjectSpec {
  title: string;
  description: string;
  keySteps?: string[];
}

export interface WhyItMattersData {
  whatProblemItSolves: string;
  whyDevelopersUseIt: string;
  whatHappensWithoutIt: string;
  realApplication: string;
  keyTakeaway: string;
}

export interface RealLifeExampleData {
  title: string;
  scenario: string;
  input: string;
  processing: string;
  output: string;
  connectionToConcept: string;
}

export interface HowItWorksStep {
  stepNumber: number;
  title: string;
  description: string;
  codeOrFormula?: string;
  stateBadge?: string;
}

export interface HowItWorksData {
  title?: string;
  flowType?: 'linear' | 'decision' | 'cyclical' | 'layered';
  steps: HowItWorksStep[];
}

export interface KeyTermItem {
  term: string;
  definition: string;
  simpleExample?: string;
  relatedTopic?: string;
}

export interface SyntaxStructureData {
  title?: string;
  language?: string;
  template: string;
  breakdown: Array<{
    component: string;
    explanation: string;
  }>;
}

export interface ExecutionStepItem {
  stepNumber: number;
  lineIndex: number;
  codeLine: string;
  explanation: string;
  variables: Record<string, string | number | boolean>;
  output?: string;
  memory?: string;
  callStack?: string[];
}

export interface ExecutionSimulationData {
  title?: string;
  language: string;
  codeLines: string[];
  steps: ExecutionStepItem[];
}

export interface DetailedExampleItem {
  title: string;
  type: 'Basic' | 'Practical' | 'Tricky' | 'Real-World';
  code?: string;
  language?: string;
  explanation: string;
  output?: string;
}

export interface BeforeVsAfterData {
  withoutConcept: {
    title: string;
    codeOrScenario: string;
    problem: string;
  };
  withConcept: {
    title: string;
    codeOrScenario: string;
    improvedSolution: string;
  };
  explanation: string;
}

export interface RealWorldUsageItem {
  domain: string;
  usage: string;
  example: string;
}

export interface RelatedTopicItem {
  title: string;
  relation: string;
  courseId?: string;
  moduleId?: string;
  topicId?: string;
}

export interface UniversalVisualizationConfig {
  type:
    | 'array'
    | 'stack'
    | 'queue'
    | 'tree'
    | 'graph'
    | 'recursion'
    | 'sorting'
    | 'binary-search'
    | 'linked-list'
    | 'architecture'
    | 'component-tree'
    | 'git-flow'
    | 'database'
    | 'custom';
  title?: string;
  data: any;
  steps?: any[];
  operations?: string[];
  explanation?: string;
}

export interface ComparisonTableData {
  title: string;
  conceptA: string;
  conceptB: string;
  criteria: Array<{
    criterion: string;
    valA: string;
    valB: string;
  }>;
  summary: string;
}

export interface TopicQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface TopicInterviewQuestion {
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  question: string;
  answer: string;
  explanation?: string;
  tip?: string;
  relatedConcept?: string;
}

export interface MemoryCardItem {
  id: string;
  front: string;
  back: string;
  category?: string;
}

export interface OneMinuteRevisionData {
  what: string;
  why: string;
  importantSyntax: string;
  importantRule: string;
  commonMistake: string;
  realWorldUse: string;
  interviewQuestion: string;
}

export interface CheatSheetData {
  title: string;
  syntaxSummary: string[];
  keyRules: string[];
  commonPitfalls: string[];
  quickTips: string[];
}

export interface FinalTestQuestion {
  id: string;
  question: string;
  questionType: 'concept' | 'practical' | 'code' | 'visual';
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface TopicContent {
  title: string;
  explanation: string;
  simpleExplanation?: string;
  technicalExplanation?: string;
  whyItMatters?: WhyItMattersData;
  realLifeExample?: RealLifeExampleData;
  howItWorks?: HowItWorksData;
  keyTerms?: KeyTermItem[];
  syntaxStructure?: SyntaxStructureData;
  executionSimulation?: ExecutionSimulationData;
  detailedExamples?: DetailedExampleItem[];
  beforeVsAfter?: BeforeVsAfterData;
  realWorldUsage?: RealWorldUsageItem[];
  relatedTopicsList?: RelatedTopicItem[];
  universalVisualization?: UniversalVisualizationConfig;
  comparisonTable?: ComparisonTableData;
  quizQuestions?: TopicQuizQuestion[];
  interviewQuestionsList?: TopicInterviewQuestion[];
  memoryCards?: MemoryCardItem[];
  oneMinuteRevision?: OneMinuteRevisionData;
  cheatSheet?: CheatSheetData;
  finalTestQuestions?: FinalTestQuestion[];

  codeSnippet?: TopicCodeSnippet;
  examples?: string[];
  tips?: string[];
  importantPoints?: string[];
  formulaCard?: {
    title: string;
    formula: string;
    explanation: string;
  };
  commonMistakes?: CommonMistakeItem[];
  betterWays?: string[];
  practiceProblem?: PracticeProblemItem;
  vocabulary?: VocabularyItem[];
  dialogue?: DialogueItem[];
  speakingPrompt?: string;
  analogy?: SystemDesignAnalogy;
  architectureFlow?: ArchitectureFlowData;
  tradeOffs?: SystemDesignTradeOff;
  interviewQuestions?: SystemDesignInterviewQnA[];
  elif5Story?: string;
  internalMechanics?: string;
  miniProject?: MiniProjectSpec;
  practiceTasksList?: string[];
  approachProgression?: AlgorithmApproachProgression[];
  complexityAnalysis?: AlgorithmComplexityAnalysis;
  algorithmLabData?: AlgorithmLabData;
}
