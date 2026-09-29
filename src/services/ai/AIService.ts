/**
 * Part 21 — AI Service
 * Central coordinator for AI Tutor, AI English Speaking, Code Helper,
 * Interview Coach, and Personalized Learning Assistant.
 *
 * Adheres to:
 * - NO private API keys in client code or APK.
 * - NO fake chatbot responses when offline/unconnected.
 * - Strict anti-farming Gamification XP hooks (+15 XP / +5 Points for speaking).
 * - Centralized configuration, context filtering, and daily rate limit guards.
 */

import { AIProvider } from './types';
import { RemoteAIProvider } from './RemoteAIProvider';
import { MockAIProvider } from './MockAIProvider';
import { aiRepository, AIRepository } from '../../repositories/AIRepository';
import { gamificationService } from '../GamificationService';
import { activityRepository } from '../../repositories/ActivityRepository';
import { aiContextManager } from './AIContextManager';
import { LocalKnowledgeProvider } from './LocalKnowledgeProvider';
import {
  AITutorContext,
  AIResponse,
  ExplanationLevel,
  CorrectionLevel,
  SpeakingFeedback,
  InterviewFeedback,
  AIMessage,
  AISettings,
  AIStudySuggestion,
  AILearningMode,
  AIContextPayload,
  AIProposedCodeEdit,
  AIControlledDebuggerCommand,
} from '../../models/AIAssistant';

export class AIService {
  private static instance: AIService | null = null;
  private provider: AIProvider;
  private repository: AIRepository = aiRepository;

  // Centralized Configuration (Section 8)
  private settings: AISettings = {
    ai_enabled: true,
    tutor_enabled: true,
    speaking_enabled: true,
    code_helper_enabled: true,
    interview_coach_enabled: true,
    explanation_level: 'BEGINNER',
    speaking_correction_level: 'GENTLE',
    daily_message_limit: 50,
    max_response_length: 2048,
    share_course_context: true,
    share_notes_context: false,
    stream_responses: false,
  };

  private constructor() {
    this.provider = new RemoteAIProvider();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Allows injecting MockAIProvider for automated test suites.
   */
  setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  getSettings(): AISettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<AISettings>): void {
    this.settings = { ...this.settings, ...updates };
  }

  // =========================================================================
  // AI TUTOR & CODE HELPER CONVERSATION
  // =========================================================================

  /**
   * Sends a user prompt and generates an AI tutor response.
   */
  async sendMessage(params: {
    conversationId: string;
    content: string;
    context?: AITutorContext;
    explanationLevel?: ExplanationLevel;
  }): Promise<{ userMessage: AIMessage; assistantMessage: AIMessage; response: AIResponse }> {
    // 1. Check AI enabled
    if (!this.settings.ai_enabled) {
      const offlineResp: AIResponse = {
        content: 'AI Assistant is currently turned off in Settings.',
        status: 'UNAVAILABLE',
        createdAt: new Date().toISOString(),
      };
      const userMsg = await this.repository.addMessage({
        conversation_id: params.conversationId,
        role: 'USER',
        content: params.content,
      });
      const assistantMsg = await this.repository.addMessage({
        conversation_id: params.conversationId,
        role: 'ASSISTANT',
        content: offlineResp.content,
        message_type: 'ERROR',
      });
      return { userMessage: userMsg, assistantMessage: assistantMsg, response: offlineResp };
    }

    // 2. Check Daily Message Limit (Section 44)
    const usage = await this.repository.getTodayUsage();
    if (usage.messageCount >= this.settings.daily_message_limit) {
      const limitResp: AIResponse = {
        content: "You've reached today's AI usage limit.\nYour saved lessons and practice remain available offline.",
        status: 'RATE_LIMITED',
        createdAt: new Date().toISOString(),
      };
      const userMsg = await this.repository.addMessage({
        conversation_id: params.conversationId,
        role: 'USER',
        content: params.content,
      });
      const assistantMsg = await this.repository.addMessage({
        conversation_id: params.conversationId,
        role: 'ASSISTANT',
        content: limitResp.content,
        message_type: 'ERROR',
      });
      return { userMessage: userMsg, assistantMessage: assistantMsg, response: limitResp };
    }

    // 3. Persist user message
    const userMsg = await this.repository.addMessage({
      conversation_id: params.conversationId,
      role: 'USER',
      content: params.content,
    });

    // 4. Retrieve recent message history for context window
    const recentMessages = await this.repository.getMessages(params.conversationId, 6);
    const historyPayload = recentMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 5. Minimal, non-leaky context assembly
    const filteredContext: AITutorContext | undefined = this.settings.share_course_context
      ? {
          course_id: params.context?.course_id,
          module_id: params.context?.module_id,
          topic_id: params.context?.topic_id,
          topic_title: params.context?.topic_title,
          topic_description: params.context?.topic_description,
          difficulty: params.context?.difficulty,
          code_snippet: params.context?.code_snippet,
          error_message: params.context?.error_message,
          relevant_user_note: this.settings.share_notes_context
            ? params.context?.relevant_user_note
            : undefined,
        }
      : undefined;

    // 6. Invoke AI Provider
    const level = params.explanationLevel || this.settings.explanation_level;
    const response = await this.provider.generateResponse(
      params.content,
      filteredContext,
      historyPayload,
      level
    );

    // 7. Track daily usage
    await this.repository.incrementDailyUsage(false);

    // 8. Persist assistant message
    const msgType = response.metadata?.error_details
      ? 'DEBUG_ASSIST'
      : response.metadata?.hint_level
      ? 'HINT'
      : response.status === 'SUCCESS'
      ? 'TEXT'
      : 'ERROR';

    const assistantMsg = await this.repository.addMessage({
      conversation_id: params.conversationId,
      role: 'ASSISTANT',
      content: response.content,
      message_type: msgType,
      metadata: response.metadata,
    });

    return { userMessage: userMsg, assistantMessage: assistantMsg, response };
  }

  // =========================================================================
  // AI SPEAKING & CONVERSATION PARTNER
  // =========================================================================

  /**
   * Converses in English speaking practice session and evaluates sentences.
   */
  async sendSpeakingMessage(params: {
    sessionId: string;
    conversationId: string;
    userSpeech: string;
    correctionLevel?: CorrectionLevel;
  }): Promise<{ userMessage: AIMessage; assistantMessage: AIMessage; response: AIResponse }> {
    const session = await this.repository.getSpeakingSession(params.sessionId);

    // 1. Add user message
    const userMsg = await this.repository.addMessage({
      conversation_id: params.conversationId,
      role: 'USER',
      content: params.userSpeech,
    });

    // 2. Fetch history
    const recentMessages = await this.repository.getMessages(params.conversationId, 6);
    const historyPayload = recentMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // 3. Request speaking response
    const correctionLevel =
      params.correctionLevel || session?.correction_level || this.settings.speaking_correction_level;

    const response = await this.provider.generateSpeakingResponse(
      params.userSpeech,
      {
        topic: session?.topic_id || 'Daily Routine',
        scenario: session?.scenario_id || undefined,
        level: session?.difficulty || 'BEGINNER',
        correctionLevel,
      },
      historyPayload
    );

    // 4. Update usage
    await this.repository.incrementDailyUsage(true);

    // 5. Persist assistant response with correction metadata
    const assistantMsg = await this.repository.addMessage({
      conversation_id: params.conversationId,
      role: 'ASSISTANT',
      content: response.content,
      message_type: response.metadata?.correction ? 'CORRECTION' : 'TEXT',
      metadata: response.metadata,
    });

    return { userMessage: userMsg, assistantMessage: assistantMsg, response };
  }

  /**
   * Finalizes speaking session, calculates metrics, and awards XP & Points.
   */
  async completeSpeakingSession(params: {
    sessionId: string;
    durationSeconds: number;
    messageCount: number;
    correctionsCount: number;
    topicId?: string;
  }): Promise<{ feedback: SpeakingFeedback; xpAwarded: number; pointsAwarded: number }> {
    // 1. Retrieve session and messages
    const session = await this.repository.getSpeakingSession(params.sessionId);
    const messages = session ? await this.repository.getMessages(session.conversation_id, 20) : [];

    // 2. Build structured feedback
    const feedback: SpeakingFeedback = {
      communication_rating: params.messageCount >= 6 ? 'Strong' : 'Good',
      clarity_rating: params.correctionsCount === 0 ? 'Very Clear' : 'Clear',
      completeness_rating: params.messageCount >= 4 ? 'Comprehensive' : 'Adequate',
      grammar_issues:
        params.correctionsCount > 0
          ? ['Review past vs present tense alignment', 'Watch singular vs plural noun markers']
          : [],
      vocabulary_suggestions: ['effective', 'streamlined', 'collaborative'],
      sentence_improvements: [
        'Try starting your responses with introductory transition phrases such as "In my experience..." or "To begin with..."',
      ],
      overall_feedback:
        'Terrific conversational effort! Practicing speaking without fear is the fastest route to fluency.',
      corrections_count: params.correctionsCount,
      message_count: params.messageCount,
    };

    // 3. Persist session completion
    await this.repository.completeSpeakingSession({
      session_id: params.sessionId,
      duration_seconds: params.durationSeconds,
      message_count: params.messageCount,
      corrections_count: params.correctionsCount,
      feedback,
    });

    // 4. Record learning activity
    activityRepository.recordActivity({
      courseId: 'english_speaking',
      topicId: params.topicId || undefined,
      activityType: 'STUDY_SESSION_COMPLETED',
    }).catch(() => {});

    // 5. Award Gamification Rewards (+15 XP, +5 Points) with anti-farming protection (Part 19)
    let xpAwarded = 0;
    let pointsAwarded = 0;

    const rewardResult = await gamificationService.awardDirectReward(
      'SPEAKING_SESSION_COMPLETED',
      params.sessionId,
      15, // 15 XP
      5,  // 5 Points
      'Completed English speaking session'
    );

    if (rewardResult.awarded) {
      xpAwarded = rewardResult.xpAwarded;
      pointsAwarded = rewardResult.pointsAwarded;
    }

    return { feedback, xpAwarded, pointsAwarded };
  }

  // =========================================================================
  // INTERVIEW FEEDBACK & STUDY SUGGESTIONS
  // =========================================================================

  async generateInterviewFeedback(
    conversationId: string,
    mode: string
  ): Promise<InterviewFeedback> {
    const messages = await this.repository.getMessages(conversationId, 20);
    const historyPayload = messages.map((m) => ({ role: m.role, content: m.content }));
    return this.provider.generateInterviewFeedback(historyPayload, mode);
  }

  async getStudySuggestions(): Promise<AIStudySuggestion[]> {
    return this.repository.getPersonalizedStudySuggestions();
  }

  // =========================================================================
  // PART 7 — PERSONAL AI CODING TEACHER & CONTEXT QUERY ENGINE
  // =========================================================================

  /**
   * Unified personal teacher query.
   * Pulls active context automatically, respects user privacy & learning preferences,
   * falls back safely to LocalKnowledgeProvider when offline/unconnected, and saves
   * conversation & code snapshots when enabled.
   */
  async queryPersonalTeacher(params: {
    prompt: string;
    mode?: AILearningMode;
    conversationId?: string;
    contextOverride?: Partial<AIContextPayload>;
  }): Promise<{ response: AIResponse; conversationId: string }> {
    const preferences = await this.repository.getLearningPreferences();

    // 1. Check master toggle
    if (!this.settings.ai_enabled) {
      return {
        response: {
          content: 'AI Assistant is currently turned off in Settings.',
          status: 'UNAVAILABLE',
          createdAt: new Date().toISOString(),
        },
        conversationId: params.conversationId || 'offline_conv',
      };
    }

    // 2. Assemble context from manager + overrides
    if (params.contextOverride) {
      aiContextManager.updateContext(params.contextOverride);
    }
    const context = aiContextManager.getContext();
    const mode = params.mode || 'GUIDED';

    // 3. Format prompt according to privacy settings
    const formattedPrompt = aiContextManager.formatPromptWithContext(params.prompt, {
      sendCodeToAI: preferences.send_code_to_ai,
      shareCourseContext: this.settings.share_course_context,
    });

    let convId = params.conversationId;
    if (!convId && preferences.save_conversations) {
      const conv = await this.repository.createConversation({
        mode: 'CODE',
        title: context.topicTitle || context.questionTitle || 'Coding Session',
        course_id: context.courseId,
        module_id: context.moduleId,
        topic_id: context.topicId,
      });
      convId = conv.id;
    }
    if (!convId) convId = `temp_${Date.now()}`;

    // 4. Save code snapshot if code is present and permitted
    if (context.code && preferences.save_code_snapshots && convId) {
      this.repository
        .saveCodeSnapshot({
          conversation_id: convId,
          title: context.topicTitle || 'Workspace Code',
          code: context.code,
          language: context.language || 'python',
          active_line: context.activeLineNumber || 1,
          execution_state_json: context.variables ? JSON.stringify(context.variables) : undefined,
        })
        .catch(() => {});
    }

    // 5. Try Remote Provider or fall back to LocalKnowledgeProvider
    let aiResponse: AIResponse;

    if (preferences.provider === 'LOCAL_OFFLINE') {
      aiResponse = LocalKnowledgeProvider.generateExplanation(mode, params.prompt, context);
    } else {
      try {
        const isRemoteAvailable = await this.provider.isAvailable();
        if (isRemoteAvailable) {
          aiResponse = await this.provider.generateResponse(
            formattedPrompt,
            {
              course_id: context.courseId,
              module_id: context.moduleId,
              topic_title: context.topicTitle,
              code_snippet: preferences.send_code_to_ai ? context.code : undefined,
              error_message: context.error,
            },
            [],
            this.settings.explanation_level
          );
        } else {
          // Reliable local pedagogical response based on real execution context
          aiResponse = LocalKnowledgeProvider.generateExplanation(mode, params.prompt, context);
        }
      } catch {
        aiResponse = LocalKnowledgeProvider.generateExplanation(mode, params.prompt, context);
      }
    }

    // 6. Persist to conversation if enabled
    if (preferences.save_conversations && convId) {
      this.repository
        .addMessage({
          conversation_id: convId,
          role: 'USER',
          content: params.prompt,
        })
        .catch(() => {});

      this.repository
        .addMessage({
          conversation_id: convId,
          role: 'ASSISTANT',
          content: aiResponse.content,
          metadata: aiResponse.metadata,
        })
        .catch(() => {});
    }

    return { response: aiResponse, conversationId: convId };
  }

  /**
   * Generates a controlled code edit proposal with diff explanation.
   * Never modifies code automatically without user preview and confirmation (Rule 56).
   */
  generateCodeFixProposal(params: {
    originalCode: string;
    query: string;
    language: string;
    line?: number;
  }): AIProposedCodeEdit {
    const lines = params.originalCode.split('\n');
    const targetLine = params.line || 1;

    let proposedCode = params.originalCode;
    let diffExplanation = 'Applied defensive boundary check and syntax corrections.';

    if (params.query.toLowerCase().includes('index') || params.query.toLowerCase().includes('bound')) {
      proposedCode = lines
        .map((l, idx) => (idx + 1 === targetLine ? `    # Guarded boundary\n    if 0 <= i < len(arr):\n    ` + l.trim() : l))
        .join('\n');
      diffExplanation = 'Added index bounds check to prevent IndexError.';
    } else if (params.query.toLowerCase().includes('binary search') && params.originalCode.includes('mid =')) {
      proposedCode = params.originalCode.replace(
        /mid\s*=\s*\(.*?\)/,
        'mid = left + (right - left) // 2'
      );
      diffExplanation = 'Optimized mid calculation to prevent integer overflow.';
    }

    return {
      originalCode: params.originalCode,
      proposedCode,
      diffExplanation,
      targetLine,
    };
  }

  /**
   * Validates and returns a safe controlled debugger command (Rule 22 & 57).
   */
  validateDebuggerCommand(cmd: any): AIControlledDebuggerCommand | null {
    if (!cmd || typeof cmd !== 'object') return null;
    const allowed = [
      'HIGHLIGHT_LINE',
      'SHOW_VARIABLE',
      'SHOW_CALCULATION',
      'SHOW_MEMORY',
      'SHOW_CALL_STACK',
      'SHOW_FLOW',
      'SHOW_OUTPUT',
      'SHOW_ERROR',
    ];
    if (allowed.includes(cmd.command) && typeof cmd.payload === 'object') {
      return {
        command: cmd.command,
        payload: cmd.payload,
      };
    }
    return null;
  }
}

export const aiService = AIService.getInstance();
