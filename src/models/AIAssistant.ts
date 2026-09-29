/**
 * Part 21 — AI Tutor, AI English Speaking & Personalized Learning Assistant
 * Data Models and Types
 */

export type AIMode = 'TUTOR' | 'CODE' | 'SPEAKING' | 'INTERVIEW' | 'STUDY';

export type AIRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export type AIMessageType =
  | 'TEXT'
  | 'CODE_EXPLANATION'
  | 'DEBUG_ASSIST'
  | 'HINT'
  | 'CORRECTION'
  | 'FEEDBACK'
  | 'ERROR';

export type ExplanationLevel =
  | 'CHILD_FRIENDLY'
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'INTERVIEW';

export type CorrectionLevel = 'NO_CORRECTION' | 'GENTLE' | 'DETAILED';

export type SpeakingMode =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'DAILY_CONVERSATION'
  | 'RANDOM_TOPIC'
  | 'INTERVIEW'
  | 'WORKPLACE'
  | 'TECHNICAL'
  | 'FREE_CONVERSATION';

export type InterviewMode =
  | 'HR'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'PYTHON'
  | 'DSA'
  | 'SQL'
  | 'DEVELOPER';

export interface AITutorContext {
  course_id?: string;
  module_id?: string;
  topic_id?: string;
  topic_title?: string;
  topic_description?: string;
  difficulty?: string;
  code_snippet?: string;
  error_message?: string;
  recent_learning_context?: string;
  relevant_user_note?: string;
}

export interface StructuredCorrection {
  original_sentence: string;
  better_sentence: string;
  reason: string;
  grammar_points?: string[];
  vocabulary_suggestion?: string;
}

export interface SpeakingFeedback {
  communication_rating: 'Needs Practice' | 'Good' | 'Strong' | 'Excellent';
  clarity_rating: 'Needs Improvement' | 'Fair' | 'Clear' | 'Very Clear';
  completeness_rating: 'Incomplete' | 'Adequate' | 'Comprehensive';
  grammar_issues: string[];
  vocabulary_suggestions: string[];
  sentence_improvements: string[];
  technical_accuracy?: string;
  overall_feedback: string;
  corrections_count: number;
  message_count: number;
}

export interface InterviewFeedback {
  communication: 'Needs Practice' | 'Good' | 'Strong' | 'Exceptional';
  clarity: 'Needs Improvement' | 'Clear' | 'Very Clear';
  technical_explanation: 'Basic' | 'Competent' | 'Strong' | 'Masterful';
  grammar: 'Needs Practice' | 'Good' | 'Polished';
  confidence_indicator: 'Hesitant' | 'Steady' | 'Confident';
  observable_strengths: string[];
  areas_to_improve: string[];
  sample_improved_answer: string;
  overall_summary: string;
}

export interface AIConversation {
  id: string;
  mode: AIMode;
  title: string;
  course_id?: string | null;
  module_id?: string | null;
  topic_id?: string | null;
  explanation_level: ExplanationLevel;
  created_at: string;
  updated_at: string;
  is_archived: number;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: AIRole;
  content: string;
  message_type: AIMessageType;
  metadata?: {
    correction?: StructuredCorrection;
    hint_level?: number;
    code?: string;
    explanation_level?: ExplanationLevel;
    error_details?: {
      what_happened: string;
      where: string;
      why: string;
      how_to_fix: string;
      corrected_code: string;
      prevention: string;
    };
    [key: string]: any;
  } | null;
  created_at: string;
}

export interface AISpeakingSession {
  id: string;
  conversation_id: string;
  mode: SpeakingMode;
  topic_id?: string | null;
  scenario_id?: string | null;
  difficulty: string;
  correction_level: CorrectionLevel;
  started_at: string;
  ended_at?: string | null;
  duration_seconds: number;
  message_count: number;
  corrections_count: number;
  is_completed: number;
  feedback?: SpeakingFeedback | null;
}

export interface DailySpeakingTopic {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  vocabulary: string[];
  useful_sentences: string[];
  opening_question: string;
  date_str?: string;
}

export interface AISpeakingScenario {
  id: string;
  title: string;
  category: 'DAILY' | 'WORKPLACE' | 'TECHNICAL' | 'INTERVIEW' | 'FEAR_FREE';
  roles: string; // e.g. "Developer ↔ Team Lead"
  goal: string;
  difficulty: string;
  opening_question: string;
  expected_style: string;
}

export interface AIResponse {
  content: string;
  status: 'SUCCESS' | 'UNAVAILABLE' | 'ERROR' | 'RATE_LIMITED';
  error?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AISettings {
  ai_enabled: boolean;
  tutor_enabled: boolean;
  speaking_enabled: boolean;
  code_helper_enabled: boolean;
  interview_coach_enabled: boolean;
  explanation_level: ExplanationLevel;
  speaking_correction_level: CorrectionLevel;
  daily_message_limit: number;
  max_response_length: number;
  share_course_context: boolean;
  share_notes_context: boolean;
  stream_responses: boolean;
}

export interface AIStudySuggestion {
  id: string;
  headline: string;
  reason: string;
  suggested_focus: string;
  course_id?: string;
  topic_id?: string;
  action_label: string;
  action_type: 'STUDY_TOPIC' | 'PRACTICE_TASK' | 'REVISION';
}

// =========================================================================
// PART 7 — PERSONAL AI CODING TEACHER & CONTEXT MODELS
// =========================================================================

export type AILearningMode =
  | 'SIMPLE_EXPLANATION'
  | 'TECHNICAL_EXPLANATION'
  | 'GUIDED'
  | 'DEBUGGING'
  | 'INTERVIEW'
  | 'SOLUTION'
  | 'CODE_REVIEW'
  | 'VISUAL_EXPLANATION'
  | 'ALGORITHM_PATTERN'
  | 'BRUTE_BETTER_OPTIMAL'
  | 'SYSTEM_DESIGN_ARCH'
  | 'QUIZ';

export type AIProviderType = 'AUTOMATIC' | 'OPENAI' | 'GEMINI' | 'LOCAL_OFFLINE';
export type AIExecutionMode = 'FAST' | 'BALANCED' | 'DEEP';
export type AIExplanationStyle = 'SIMPLE' | 'NORMAL' | 'TECHNICAL';
export type AITeachingStyle = 'GUIDE_ME' | 'DIRECT' | 'INTERVIEW';

export interface AILearningPreferences {
  id: string;
  provider: AIProviderType;
  model: string;
  mode: AIExecutionMode;
  explanation_style: AIExplanationStyle;
  teaching_style: AITeachingStyle;
  save_conversations: boolean;
  save_voice_transcripts: boolean;
  save_code_snapshots: boolean;
  send_code_to_ai: boolean;
  updated_at: string;
}

export interface AICodeSnapshot {
  id: string;
  conversation_id: string;
  title: string;
  code: string;
  language: string;
  active_line?: number;
  execution_state_json?: string;
  created_at: string;
}

export interface AIContextPayload {
  source:
    | 'TOPIC'
    | 'COMPILER'
    | 'DEBUGGER'
    | 'PRACTICE'
    | 'ALGORITHM'
    | 'REACT'
    | 'SYSTEM_DESIGN'
    | 'QUIZ'
    | 'INTERVIEW'
    | 'VOICE';
  courseId?: string;
  moduleId?: string;
  topicId?: string;
  topicTitle?: string;
  currentSection?: string;
  explanationText?: string;
  exampleCode?: string;

  // Code / Compiler
  language?: string;
  code?: string;
  selectedCode?: string;
  output?: string;
  error?: string;
  executionStatus?: string;
  activeLineNumber?: number;

  // Debugger
  currentStepIndex?: number;
  totalSteps?: number;
  currentStepOperation?: string;
  variables?: Record<string, any>;
  callStack?: string[];
  loopState?: { variable: string; iteration: number; condition: string };
  conditionState?: { condition: string; result: boolean; branchTaken: string };

  // Practice
  practiceQuestionId?: string;
  questionTitle?: string;
  questionDescription?: string;
  failedTestCase?: {
    input: string;
    expected: string;
    actual: string;
  };
  hintsGiven?: string[];

  // Algorithm / React / System Design specific
  algorithmName?: string;
  algorithmPointers?: Record<string, any>;
  complexityBest?: string;
  complexityWorst?: string;
  reactComponent?: string;
  reactHook?: string;
  systemArchitectureComponents?: string[];
  systemTradeOffs?: string;

  // User question
  userQuestion?: string;
}

export interface AIProposedCodeEdit {
  originalCode: string;
  proposedCode: string;
  diffExplanation: string;
  targetLine?: number;
}

export interface AIControlledDebuggerCommand {
  command:
    | 'HIGHLIGHT_LINE'
    | 'SHOW_VARIABLE'
    | 'SHOW_CALCULATION'
    | 'SHOW_MEMORY'
    | 'SHOW_CALL_STACK'
    | 'SHOW_FLOW'
    | 'SHOW_OUTPUT'
    | 'SHOW_ERROR';
  payload: Record<string, any>;
}

