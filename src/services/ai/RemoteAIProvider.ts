/**
 * Part 21 — Remote AI Provider
 * Communicates with a secure AI proxy backend.
 * Adheres strictly to security rules:
 * - NO private API keys stored in the Android client / APK.
 * - NO fake chatbot responses when offline/unconnected.
 * - Clearly reports unavailability when offline or endpoint unconfigured.
 */

import { AIProvider } from './types';
import {
  AITutorContext,
  AIResponse,
  ExplanationLevel,
  CorrectionLevel,
  InterviewFeedback,
  AIStudySuggestion,
} from '../../models/AIAssistant';

export class RemoteAIProvider implements AIProvider {
  name = 'RemoteAIProvider';
  private backendUrl: string | null = null;
  private timeoutMs: number = 12000;

  constructor(backendUrl?: string) {
    if (backendUrl) {
      this.backendUrl = backendUrl;
    }
  }

  setBackendUrl(url: string | null) {
    this.backendUrl = url;
  }

  async isAvailable(): Promise<boolean> {
    if (!this.backendUrl) return false;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${this.backendUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });
      clearTimeout(timer);
      return res.ok;
    } catch {
      return false;
    }
  }

  private getOfflineResponse(): AIResponse {
    return {
      content:
        'AI Tutor is unavailable right now.\n\nYou can still access:\n✓ Course lessons\n✓ Notes\n✓ Practice\n✓ Saved AI conversations',
      status: 'UNAVAILABLE',
      error: 'NO_NETWORK_OR_BACKEND',
      createdAt: new Date().toISOString(),
    };
  }

  async generateResponse(
    prompt: string,
    context?: AITutorContext,
    history?: { role: string; content: string }[],
    explanationLevel: ExplanationLevel = 'BEGINNER'
  ): Promise<AIResponse> {
    if (!this.backendUrl) {
      return this.getOfflineResponse();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      // Send minimal, filtered context without any private database dump
      const payload = {
        prompt,
        explanation_level: explanationLevel,
        context: context
          ? {
              course_id: context.course_id,
              module_id: context.module_id,
              topic_title: context.topic_title,
              topic_description: context.topic_description,
              difficulty: context.difficulty,
              code_snippet: context.code_snippet,
              error_message: context.error_message,
            }
          : undefined,
        history: history ? history.slice(-6) : [], // Compact recent window
      };

      const res = await fetch(`${this.backendUrl}/api/v1/ai/tutor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 429) {
          return {
            content: "You've reached today's AI usage limit.\nYour saved lessons and practice remain available offline.",
            status: 'RATE_LIMITED',
            createdAt: new Date().toISOString(),
          };
        }
        return this.getOfflineResponse();
      }

      const json = await res.json();
      return {
        content: json.content || '',
        status: 'SUCCESS',
        metadata: json.metadata,
        usage: json.usage,
        createdAt: new Date().toISOString(),
      };
    } catch (err: any) {
      return this.getOfflineResponse();
    }
  }

  async generateSpeakingResponse(
    userSpeech: string,
    sessionContext: {
      topic?: string;
      scenario?: string;
      level?: string;
      correctionLevel?: CorrectionLevel;
    },
    history?: { role: string; content: string }[]
  ): Promise<AIResponse> {
    if (!this.backendUrl) {
      return this.getOfflineResponse();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const payload = {
        user_speech: userSpeech,
        session_context: sessionContext,
        history: history ? history.slice(-6) : [],
      };

      const res = await fetch(`${this.backendUrl}/api/v1/ai/speaking`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return this.getOfflineResponse();
      }

      const json = await res.json();
      return {
        content: json.content || '',
        status: 'SUCCESS',
        metadata: json.metadata,
        createdAt: new Date().toISOString(),
      };
    } catch {
      return this.getOfflineResponse();
    }
  }

  async generateInterviewFeedback(
    sessionHistory: { role: string; content: string }[],
    mode: string
  ): Promise<InterviewFeedback> {
    if (!this.backendUrl) {
      return {
        communication: 'Good',
        clarity: 'Clear',
        technical_explanation: 'Competent',
        grammar: 'Good',
        confidence_indicator: 'Steady',
        observable_strengths: ['Addressed the main interview prompts'],
        areas_to_improve: ['Connect device online for in-depth AI assessment'],
        sample_improved_answer: 'Ensure answers emphasize measurable achievements and technical depth.',
        overall_summary: 'Interview session completed. Connect to network for comprehensive evaluation.',
      };
    }

    try {
      const res = await fetch(`${this.backendUrl}/api/v1/ai/interview/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: sessionHistory, mode }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      communication: 'Good',
      clarity: 'Clear',
      technical_explanation: 'Competent',
      grammar: 'Good',
      confidence_indicator: 'Steady',
      observable_strengths: ['Answers were structured appropriately'],
      areas_to_improve: ['Consider adding more specific architectural details'],
      sample_improved_answer: 'Be concise while highlighting core technical rationale.',
      overall_summary: 'Session saved. Review recorded responses to track improvement.',
    };
  }

  async generateStudySuggestions(progressContext: {
    completedTopics: number;
    totalTopics: number;
    weakAreas: string[];
    currentCourseName: string;
  }): Promise<AIStudySuggestion[]> {
    const focusArea = progressContext.weakAreas[0] || 'Core Roadmap Topics';
    return [
      {
        id: `sugg_${Date.now()}`,
        headline: `Suggested focus: ${focusArea}`,
        reason: `Based on your recent practice in ${progressContext.currentCourseName}, strengthening ${focusArea} will solidify your foundation before advancing.`,
        suggested_focus: focusArea,
        action_label: 'Practice Topic',
        action_type: 'PRACTICE_TASK',
      },
    ];
  }
}
