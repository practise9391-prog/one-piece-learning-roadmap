import { smartLearningRepository, SmartLearningRepository } from '../repositories/SmartLearningRepository';
import {
  SmartRecommendation,
  WeakTopicItem,
  RevisionItem,
  LearningInsights,
  AdaptiveDailyPlan,
  InterviewReadinessDomain,
  SmartPracticeSet,
  TopicMastery,
  StudyPriority,
  SmartLearningSettings,
} from '../models/SmartLearning';
import { aiService } from './ai/AIService';
import { notificationService } from './NotificationService';
import { gamificationService } from './GamificationService';

export class SmartLearningService {
  private static instance: SmartLearningService | null = null;
  private repository: SmartLearningRepository = smartLearningRepository;

  public static getInstance(): SmartLearningService {
    if (!SmartLearningService.instance) {
      SmartLearningService.instance = new SmartLearningService();
    }
    return SmartLearningService.instance;
  }

  // =========================================================================
  // CORE DASHBOARD & RECOMMENDATION QUERIES
  // =========================================================================

  async getRecommendedTopic(): Promise<SmartRecommendation | null> {
    return this.repository.getTopRecommendedTopic();
  }

  async getWeakTopics(): Promise<WeakTopicItem[]> {
    return this.repository.getWeakTopics();
  }

  async getDueRevisions(): Promise<RevisionItem[]> {
    return this.repository.getDueRevisions();
  }

  async getUpcomingRevisions(limit?: number): Promise<RevisionItem[]> {
    return this.repository.getUpcomingRevisions(limit);
  }

  async getRecentlyRevised(limit?: number): Promise<RevisionItem[]> {
    return this.repository.getRecentlyRevised(limit);
  }

  async getTopicMastery(topicId: string): Promise<TopicMastery> {
    return this.repository.getOrCalculateTopicMastery(topicId);
  }

  async getStudyPriorities(): Promise<StudyPriority[]> {
    return this.repository.calculateStudyPriorities();
  }

  async getLearningInsights(): Promise<LearningInsights> {
    return this.repository.getLearningInsights();
  }

  async getInterviewReadiness(): Promise<InterviewReadinessDomain[]> {
    return this.repository.getInterviewReadiness();
  }

  async generateAdaptivePlan(targetMinutes: number = 60): Promise<AdaptiveDailyPlan> {
    return this.repository.generateSmartDailyPlan(targetMinutes);
  }

  async applyAdaptivePlan(plan: AdaptiveDailyPlan): Promise<{ success: boolean; itemsAdded: number; message: string }> {
    return this.repository.applySmartPlanToToday(plan);
  }

  async generatePracticeSet(targetMinutes: number = 30, courseId?: string): Promise<SmartPracticeSet> {
    return this.repository.generateAdaptivePracticeSet(targetMinutes, courseId);
  }

  async scheduleTopicRevision(topicId: string, courseId: string, accuracy?: number): Promise<RevisionItem> {
    const item = await this.repository.scheduleRevision(topicId, courseId, accuracy);

    // Schedule notification via Part 17 NotificationService if enabled
    try {
      await notificationService.scheduleStudyReminder({
        id: `rev_${item.id}`,
        title: '📚 Revision Due Today',
        body: `Time to review ${item.topic_title || 'your scheduled concept'}. A quick session preserves long-term recall!`,
        triggerTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
      });
    } catch {
      // Graceful fallback if notifications not permitted
    }

    return item;
  }

  async completeTopicRevision(
    revisionId: string,
    accuracy: number
  ): Promise<{ nextRevisionDate: string; xpAwarded: number; pointsAwarded: number }> {
    return this.repository.completeRevision(revisionId, accuracy);
  }

  async getSettings(): Promise<SmartLearningSettings> {
    return this.repository.getSettings();
  }

  async updateSettings(settings: Partial<SmartLearningSettings>): Promise<void> {
    return this.repository.updateSettings(settings);
  }

  // =========================================================================
  // AI INTEGRATION: "Ask AI about my learning" (Section 16 & 17)
  // =========================================================================

  /**
   * Provides contextual AI insights based strictly on user's real database facts.
   * If offline, returns a clear guidance message.
   */
  async askAboutLearning(userQuery: string): Promise<string> {
    try {
      const insights = await this.repository.getLearningInsights();
      const topRec = await this.repository.getTopRecommendedTopic();
      const weakTopics = await this.repository.getWeakTopics();
      const dueRevs = await this.repository.getDueRevisions();

      // Assemble minimal non-leaking context
      const minimalContext = {
        top_recommendation: topRec ? `${topRec.course_name} → ${topRec.topic_title} (${topRec.primary_reason})` : 'All current roadmap topics completed',
        weak_topics_count: weakTopics.length,
        top_weak_topic: weakTopics.length > 0 ? `${weakTopics[0].topic_title} (${weakTopics[0].accuracy}% accuracy)` : 'None',
        due_revisions_count: dueRevs.length,
        most_studied_course: insights.patterns.most_studied_course,
        average_practice_accuracy: `${insights.patterns.average_accuracy}%`,
      };

      const prompt = `User question: "${userQuery}"\n\nReal user learning context:\n` +
        `- Next recommended topic: ${minimalContext.top_recommendation}\n` +
        `- Topics needing practice: ${minimalContext.weak_topics_count} (Top: ${minimalContext.top_weak_topic})\n` +
        `- Revisions due today: ${minimalContext.due_revisions_count}\n` +
        `- Primary focus: ${minimalContext.most_studied_course}\n` +
        `- Overall practice accuracy: ${minimalContext.average_practice_accuracy}\n\n` +
        `Provide an encouraging, concise 2-3 sentence answer directly addressing their question using only these real learning metrics.`;

      // Call AI Service
      const response = await aiService.sendMessage({
        conversationId: 'smart_learning_assistant',
        
        content: prompt,
      });

      if (response && response.response && response.response.content) {
        return response.response.content;
      }
    } catch {
      // Fallback
    }

    return "Smart Learning Recommendation: Based on your current roadmap, we recommend continuing with your next curriculum topic and tackling due revisions to keep your memory sharp!";
  }
}

export const smartLearningService = SmartLearningService.getInstance();
