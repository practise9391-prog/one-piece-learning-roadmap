export type SpeakingLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type SpeakingCategory =
  | 'LEVEL_FOUNDATION'
  | 'DAILY_TOPIC'
  | 'REAL_LIFE_SCENARIO'
  | 'WORKPLACE'
  | 'INTERVIEW'
  | 'SPEAK_WITHOUT_FEAR'
  | 'ADVANCED_CONVERSATION';

export type SpeakingMode =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'INTERVIEW'
  | 'WORKPLACE'
  | 'DAILY_TOPIC'
  | 'RANDOM_TOPIC'
  | 'TECHNICAL_CONVERSATION'
  | 'FREE_CONVERSATION'
  | 'SPEAK_WITHOUT_FEAR';

export interface DialogueExchange {
  speaker: string;
  text: string;
  translation?: string;
}

import { CommonMistakeItem } from './TopicContent';

export interface SpeakingLessonFormat {
  topicTitle: string;
  simpleExplanation: string;
  importantVocabulary: { word: string; meaning: string; example: string }[];
  usefulSentences: string[];
  realLifeExamples: string[];
  exampleConversation: DialogueExchange[];
  commonMistakes: CommonMistakeItem[];
  betterWaysToSayIt: { casual: string; professional: string }[];
  userSpeakingTask: string;
  aiConversationPrompt: string;
  feedbackTips: string[];
}

export interface SpeakingTopic {
  id: string;
  title: string;
  description: string;
  level: SpeakingLevel;
  category: SpeakingCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  scenario_type?: string;
  lesson_content?: SpeakingLessonFormat;
  order_index: number;
  is_completed: boolean;
  completed_at?: string | null;
}

export interface SpeakingScenario {
  id: string;
  title: string;
  category: 'CAMPUS' | 'WORKPLACE' | 'SERVICE' | 'DAILY';
  role_user: string;
  role_partner: string;
  situation: string;
  useful_vocabulary: string[];
  sample_dialogue: DialogueExchange[];
  practice_prompt: string;
  order_index: number;
}

export interface SpeakingSession {
  id: string;
  topic_id?: string;
  scenario_id?: string;
  mode: SpeakingMode;
  duration_seconds: number;
  transcript: DialogueExchange[];
  feedback_notes?: string;
  created_at: string;
}

export interface VoiceSupportPreparation {
  isVoiceSupported: boolean;
  speechToTextReady: boolean;
  textToSpeechReady: boolean;
  audioInputMode: 'text_only' | 'simulated_audio' | 'native_voice';
}
