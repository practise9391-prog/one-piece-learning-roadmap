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
  question: string;
  hint?: string;
  solution: string;
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

export interface TopicContent {
  title: string;
  explanation: string;
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
}
