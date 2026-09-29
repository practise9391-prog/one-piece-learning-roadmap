/**
 * Part 21 — AI Tutor & Assistant
 * Provider Interfaces
 */

import {
  AITutorContext,
  AIResponse,
  ExplanationLevel,
  CorrectionLevel,
  SpeakingFeedback,
  InterviewFeedback,
  AIStudySuggestion,
} from '../../models/AIAssistant';

export interface AIProvider {
  name: string;
  isAvailable(): Promise<boolean>;

  generateResponse(
    prompt: string,
    context?: AITutorContext,
    history?: { role: string; content: string }[],
    explanationLevel?: ExplanationLevel
  ): Promise<AIResponse>;

  generateSpeakingResponse(
    userSpeech: string,
    sessionContext: {
      topic?: string;
      scenario?: string;
      level?: string;
      correctionLevel?: CorrectionLevel;
    },
    history?: { role: string; content: string }[]
  ): Promise<AIResponse>;

  generateInterviewFeedback(
    sessionHistory: { role: string; content: string }[],
    mode: string
  ): Promise<InterviewFeedback>;

  generateStudySuggestions(
    progressContext: {
      completedTopics: number;
      totalTopics: number;
      weakAreas: string[];
      currentCourseName: string;
    }
  ): Promise<AIStudySuggestion[]>;
}
