/**
 * Part 21 — Mock AI Provider
 * Strictly for automated testing and local test assertions.
 * Never used as a fake substitute in production.
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

export class MockAIProvider implements AIProvider {
  name = 'MockAIProvider';

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async generateResponse(
    prompt: string,
    context?: AITutorContext,
    _history?: { role: string; content: string }[],
    explanationLevel: ExplanationLevel = 'BEGINNER'
  ): Promise<AIResponse> {
    const p = prompt.toLowerCase();

    // 1. Binary Search explanations tailored to level
    if (p.includes('binary search')) {
      if (explanationLevel === 'CHILD_FRIENDLY') {
        return {
          content: 'Imagine searching for a word in a huge dictionary. Instead of reading page 1, 2, 3, you flip open right in the middle! If your word is further back, you throw away the front half.',
          status: 'SUCCESS',
          createdAt: new Date().toISOString(),
        };
      } else if (explanationLevel === 'ADVANCED') {
        return {
          content: 'Binary search operates on a monotonic search space with O(log N) logarithmic time complexity by maintaining two pointers (left and right) and halving the candidate interval at each iteration.',
          status: 'SUCCESS',
          createdAt: new Date().toISOString(),
        };
      } else {
        return {
          content: 'Binary search is an efficient search algorithm on sorted lists that repeatedly divides the search interval in half until the target is found.',
          status: 'SUCCESS',
          createdAt: new Date().toISOString(),
        };
      }
    }

    // 2. Real-life example requests
    if (p.includes('queue') && p.includes('real-life')) {
      return {
        content: 'Real life Queue:\nThink of people standing in a ticket counter line. The first person to arrive is the first one served and leaves first (FIFO: First-In, First-Out).',
        status: 'SUCCESS',
        createdAt: new Date().toISOString(),
      };
    }

    // 3. Debugging / Error explanation
    if (p.includes('indexerror') || p.includes('error')) {
      return {
        content: 'What happened: IndexError occurred because the loop accessed an index equal to len(items).\nWhere: items[i] on the last iteration.\nWhy: In Python, indexing is 0-based up to len-1.\nHow to fix: Use `range(len(items))` or iterate directly over elements with `for item in items:`.',
        status: 'SUCCESS',
        metadata: {
          error_details: {
            what_happened: 'IndexError: list index out of range',
            where: 'items[i]',
            why: '0-based indexing boundary exceeded',
            how_to_fix: 'Iterate directly with `for item in items:`',
            corrected_code: 'for item in items:\n    print(item)',
            prevention: 'Avoid manual index math in Python loops',
          },
        },
        createdAt: new Date().toISOString(),
      };
    }

    // 4. Progressive Hints
    if (p.includes('hint')) {
      return {
        content: 'Hint 1: Think about how you can identify visited characters without rescanning the entire string.',
        status: 'SUCCESS',
        metadata: { hint_level: 1 },
        createdAt: new Date().toISOString(),
      };
    }

    // Default context-aware response
    const topicMention = context?.topic_title ? ` regarding ${context.topic_title}` : '';
    return {
      content: `[Mock AI Explanation${topicMention}]: Here is a clear explanation for: "${prompt}".`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
  }

  async generateSpeakingResponse(
    userSpeech: string,
    sessionContext: {
      topic?: string;
      scenario?: string;
      level?: string;
      correctionLevel?: CorrectionLevel;
    },
    _history?: { role: string; content: string }[]
  ): Promise<AIResponse> {
    const s = userSpeech.toLowerCase();

    // Check for common grammatical flaws to test correction system
    if (s.includes('i go office') || s.includes('work many task')) {
      return {
        content: 'That sounds like a productive day! Could you tell me about the most challenging task you handled?',
        status: 'SUCCESS',
        metadata: {
          correction: {
            original_sentence: userSpeech,
            better_sentence: 'Today I went to the office and worked on many tasks.',
            reason: '"went" is the past tense of "go", and "tasks" is plural because you mentioned many.',
            grammar_points: ['Past Tense: go -> went', 'Countable Noun: many tasks'],
            vocabulary_suggestion: 'worked on / tackled',
          },
        },
        createdAt: new Date().toISOString(),
      };
    }

    return {
      content: `Great thought! In the context of "${sessionContext.topic || 'our conversation'}", how do you usually plan for that?`,
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
    };
  }

  async generateInterviewFeedback(
    _sessionHistory: { role: string; content: string }[],
    _mode: string
  ): Promise<InterviewFeedback> {
    return {
      communication: 'Good',
      clarity: 'Clear',
      technical_explanation: 'Strong',
      grammar: 'Good',
      confidence_indicator: 'Steady',
      observable_strengths: [
        'Structured answers using the STAR method',
        'Accurate technical terminology',
        'Directly addressed the interviewer question',
      ],
      areas_to_improve: [
        'Could provide more concrete metrics on past project impact',
        'Avoid filler phrases during transitions',
      ],
      sample_improved_answer:
        'In my recent project, I designed a RESTful API using Python and SQLite that reduced query latency by 35% through indexing.',
      overall_summary:
        'Solid interview performance demonstrating strong grasp of software fundamentals and clear communication.',
    };
  }

  async generateStudySuggestions(progressContext: {
    completedTopics: number;
    totalTopics: number;
    weakAreas: string[];
    currentCourseName: string;
  }): Promise<AIStudySuggestion[]> {
    return [
      {
        id: 'sugg_mock_1',
        headline: `Focus on ${progressContext.weakAreas[0] || 'Arrays Practice'}`,
        reason: `Your accuracy in ${progressContext.weakAreas[0] || 'Arrays'} has room for improvement. Consolidating this will boost your ${progressContext.currentCourseName} roadmap velocity.`,
        suggested_focus: progressContext.weakAreas[0] || 'Arrays & HashMaps',
        action_label: 'Practice Problems',
        action_type: 'PRACTICE_TASK',
      },
    ];
  }
}
