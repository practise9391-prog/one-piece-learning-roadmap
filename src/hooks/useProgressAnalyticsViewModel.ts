import { useState, useEffect, useCallback } from 'react';
import {
  OverallProgressMetrics,
  CourseProgressSummary,
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
} from '../models/Analytics';
import { analyticsService } from '../services/AnalyticsService';

export type AnalyticsTab =
  | 'overview'
  | 'courses'
  | 'completed'
  | 'remaining'
  | 'time'
  | 'goals'
  | 'domains';

export function useProgressAnalyticsViewModel() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('overview');
  const [courseFilter, setCourseFilter] = useState<'all' | 'in_progress' | 'completed' | 'not_started'>('all');
  const [courseSort, setCourseSort] = useState<'order' | 'progress' | 'recent' | 'name' | 'time'>('order');
  const [activityFilter, setActivityFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [activeDomain, setActiveDomain] = useState<'aptitude' | 'reasoning' | 'verbal_english' | 'english_speaking'>('aptitude');

  const [overall, setOverall] = useState<OverallProgressMetrics | null>(null);
  const [courses, setCourses] = useState<CourseProgressSummary[]>([]);
  const [completedItems, setCompletedItems] = useState<CompletedItem[]>([]);
  const [remainingItems, setRemainingItems] = useState<RemainingItem[]>([]);
  const [recommendedNext, setRecommendedNext] = useState<RemainingItem | null>(null);
  const [daily, setDaily] = useState<DailyProgressMetrics | null>(null);
  const [weekly, setWeekly] = useState<WeeklyProgressMetrics | null>(null);
  const [monthly, setMonthly] = useState<MonthlyProgressMetrics | null>(null);
  const [studyTime, setStudyTime] = useState<StudyTimeBreakdown | null>(null);
  const [activityTimeline, setActivityTimeline] = useState<ActivityTimelineItem[]>([]);
  const [streak, setStreak] = useState<StreakAnalyticsData | null>(null);
  const [goals, setGoals] = useState<GoalAnalyticsMetrics | null>(null);
  const [practice, setPractice] = useState<PracticeAnalyticsMetrics | null>(null);
  const [domainData, setDomainData] = useState<DomainProgressMetrics | null>(null);
  const [courseComparison, setCourseComparison] = useState<CourseComparisonItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const [
        fetchedOverall,
        fetchedCourses,
        fetchedCompleted,
        fetchedRemaining,
        fetchedDaily,
        fetchedWeekly,
        fetchedMonthly,
        fetchedStudyTime,
        fetchedTimeline,
        fetchedStreak,
        fetchedGoals,
        fetchedPractice,
        fetchedDomain,
        fetchedComparison,
      ] = await Promise.all([
        analyticsService.getOverallProgress(),
        analyticsService.getCourseProgressList(courseFilter, courseSort),
        analyticsService.getCompletedItems(50),
        analyticsService.getRemainingItems({ filter: 'all', limit: 100 }),
        analyticsService.getDailyProgress(),
        analyticsService.getWeeklyProgress(),
        analyticsService.getMonthlyProgress(),
        analyticsService.getStudyTimeBreakdown(),
        analyticsService.getActivityTimeline(activityFilter, 50),
        analyticsService.getStreakAnalytics(),
        analyticsService.getGoalAnalytics(),
        analyticsService.getPracticeAnalytics(),
        analyticsService.getDomainProgress(activeDomain),
        analyticsService.getCourseComparison(),
      ]);

      setOverall(fetchedOverall);
      setCourses(fetchedCourses);
      setCompletedItems(fetchedCompleted);
      setRemainingItems(fetchedRemaining.items);
      setRecommendedNext(fetchedRemaining.recommendedNext);
      setDaily(fetchedDaily);
      setWeekly(fetchedWeekly);
      setMonthly(fetchedMonthly);
      setStudyTime(fetchedStudyTime);
      setActivityTimeline(fetchedTimeline);
      setStreak(fetchedStreak);
      setGoals(fetchedGoals);
      setPractice(fetchedPractice);
      setDomainData(fetchedDomain);
      setCourseComparison(fetchedComparison);
    } catch (err: any) {
      console.error('[useProgressAnalyticsViewModel] loadData error:', err);
      setError('Failed to calculate learning analytics from local data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseFilter, courseSort, activityFilter, activeDomain]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onDomainChange = async (domain: 'aptitude' | 'reasoning' | 'verbal_english' | 'english_speaking') => {
    setActiveDomain(domain);
    try {
      const data = await analyticsService.getDomainProgress(domain);
      setDomainData(data);
    } catch (err) {
      console.warn('Error changing domain:', err);
    }
  };

  const onActivityFilterChange = async (filter: 'today' | 'week' | 'month' | 'all') => {
    setActivityFilter(filter);
    try {
      const data = await analyticsService.getActivityTimeline(filter, 50);
      setActivityTimeline(data);
    } catch (err) {
      console.warn('Error changing activity filter:', err);
    }
  };

  return {
    activeTab,
    setActiveTab,
    courseFilter,
    setCourseFilter,
    courseSort,
    setCourseSort,
    activityFilter,
    onActivityFilterChange,
    activeDomain,
    onDomainChange,
    overall,
    courses,
    completedItems,
    remainingItems,
    recommendedNext,
    daily,
    weekly,
    monthly,
    studyTime,
    activityTimeline,
    streak,
    goals,
    practice,
    domainData,
    courseComparison,
    loading,
    refreshing,
    error,
    refresh: () => loadData(true),
    formatMinutes: analyticsService.formatMinutes,
  };
}
