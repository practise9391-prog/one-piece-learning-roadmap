import { analyticsRepository } from '../repositories/AnalyticsRepository';
import {
  OverallProgressMetrics,
  CourseProgressSummary,
  CourseDetailAnalytics,
  CompletedItem,
  RemainingItem,
  DailyProgressMetrics,
  WeeklyProgressMetrics,
  MonthlyProgressMetrics,
  StudyTimeBreakdown,
  ActivityTimelineItem,
  StreakAnalyticsData,
  GoalAnalyticsMetrics,
  DomainProgressMetrics,
  PracticeAnalyticsMetrics,
  CourseComparisonItem,
  ProgressTrendsData,
} from '../models/Analytics';

export class AnalyticsService {
  private static instance: AnalyticsService | null = null;

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  async getOverallProgress(): Promise<OverallProgressMetrics> {
    return analyticsRepository.getOverallProgress();
  }

  async getCourseProgressList(
    filter: 'all' | 'in_progress' | 'completed' | 'not_started' = 'all',
    sortBy: 'order' | 'progress' | 'recent' | 'name' | 'time' = 'order'
  ): Promise<CourseProgressSummary[]> {
    return analyticsRepository.getCourseProgressList(filter, sortBy);
  }

  async getCourseDetailAnalytics(courseId: string): Promise<CourseDetailAnalytics | null> {
    return analyticsRepository.getCourseDetailAnalytics(courseId);
  }

  async getCompletedItems(limit?: number): Promise<CompletedItem[]> {
    return analyticsRepository.getCompletedItems(limit);
  }

  async getRemainingItems(params?: {
    courseId?: string;
    filter?: 'all' | 'available' | 'locked';
    limit?: number;
  }): Promise<{ items: RemainingItem[]; recommendedNext: RemainingItem | null }> {
    return analyticsRepository.getRemainingItems(params);
  }

  async getDailyProgress(dateStr?: string): Promise<DailyProgressMetrics> {
    return analyticsRepository.getDailyProgress(dateStr);
  }

  async getWeeklyProgress(targetDate?: Date): Promise<WeeklyProgressMetrics> {
    return analyticsRepository.getWeeklyProgress(targetDate);
  }

  async getMonthlyProgress(year?: number, month?: number): Promise<MonthlyProgressMetrics> {
    return analyticsRepository.getMonthlyProgress(year, month);
  }

  async getStudyTimeBreakdown(): Promise<StudyTimeBreakdown> {
    return analyticsRepository.getStudyTimeBreakdown();
  }

  async getActivityTimeline(
    filter: 'today' | 'week' | 'month' | 'all' = 'all',
    limit?: number
  ): Promise<ActivityTimelineItem[]> {
    return analyticsRepository.getActivityTimeline(filter, limit);
  }

  async getStreakAnalytics(): Promise<StreakAnalyticsData> {
    return analyticsRepository.getStreakAnalytics();
  }

  async getGoalAnalytics(): Promise<GoalAnalyticsMetrics> {
    return analyticsRepository.getGoalAnalytics();
  }

  async getDomainProgress(
    domain: 'aptitude' | 'reasoning' | 'verbal_english' | 'english_speaking'
  ): Promise<DomainProgressMetrics> {
    return analyticsRepository.getDomainProgress(domain);
  }

  async getPracticeAnalytics(): Promise<PracticeAnalyticsMetrics> {
    return analyticsRepository.getPracticeAnalytics();
  }

  async getCourseComparison(): Promise<CourseComparisonItem[]> {
    return analyticsRepository.getCourseComparison();
  }

  async getProgressTrends(range: '7d' | '30d' | '90d' = '7d'): Promise<ProgressTrendsData> {
    return analyticsRepository.getProgressTrends(range);
  }

  formatMinutes(mins: number): string {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
}

export const analyticsService = AnalyticsService.getInstance();
