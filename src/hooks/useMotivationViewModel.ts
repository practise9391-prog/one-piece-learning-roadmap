import { useState, useEffect, useCallback } from 'react';
import {
  MotivationEntry,
  MotivationCategory,
  DailyGoal,
  DailyChallenge,
  Achievement,
  DailySummary,
  WeeklyLearningSummary,
  DayGoalHistory,
} from '../models/Motivation';
import { motivationRepository } from '../repositories/MotivationRepository';
import { activityRepository, StreakMetrics, getLocalDateString } from '../repositories/ActivityRepository';
import { dashboardService, CurrentLearningItem } from '../services/DashboardService';

export interface UseMotivationViewModelReturn {
  todayMotivation: MotivationEntry | null;
  dailyGoals: DailyGoal[];
  goalsCompletedCount: number;
  goalsTotalCount: number;
  goalsProgressPercentage: number;
  isDailyComplete: boolean;
  streak: StreakMetrics;
  todayChallenge: DailyChallenge | null;
  dailySummary: DailySummary;
  weeklySummary: WeeklyLearningSummary | null;
  goalHistory: DayGoalHistory[];
  achievements: Achievement[];
  unlockedAchievementsCount: number;
  currentLearning: CurrentLearningItem | null;
  quotesList: MotivationEntry[];
  selectedQuoteCategory: MotivationCategory | 'ALL';
  favoritesOnly: boolean;
  loading: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  toggleFavoriteQuote: (id: string) => Promise<void>;
  setQuoteCategory: (category: MotivationCategory | 'ALL') => void;
  toggleFavoritesOnly: () => void;
  acceptChallenge: () => Promise<void>;
}

export function useMotivationViewModel(): UseMotivationViewModelReturn {
  const [todayMotivation, setTodayMotivation] = useState<MotivationEntry | null>(null);
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([]);
  const [streak, setStreak] = useState<StreakMetrics>({
    currentStreak: 0,
    longestStreak: 0,
    totalLearningDays: 0,
    activeWeekDays: [false, false, false, false, false, false, false],
  });
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary>({
    topicsCompleted: 0,
    modulesCompleted: 0,
    practiceSolved: 0,
    notesCreated: 0,
    totalActions: 0,
  });
  const [weeklySummary, setWeeklySummary] = useState<WeeklyLearningSummary | null>(null);
  const [goalHistory, setGoalHistory] = useState<DayGoalHistory[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentLearning, setCurrentLearning] = useState<CurrentLearningItem | null>(null);

  const [quotesList, setQuotesList] = useState<MotivationEntry[]>([]);
  const [selectedQuoteCategory, setSelectedQuoteCategory] = useState<MotivationCategory | 'ALL'>('ALL');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const todayStr = getLocalDateString();
      const [
        fetchedMotivation,
        fetchedGoals,
        fetchedStreak,
        fetchedChallenge,
        fetchedSummary,
        fetchedWeekly,
        fetchedHistory,
        fetchedAchievements,
        fetchedCurrentLearning,
        fetchedQuotes,
      ] = await Promise.all([
        motivationRepository.getTodayMotivation(todayStr),
        motivationRepository.getTodayGoals(todayStr),
        activityRepository.getStreakMetrics(),
        motivationRepository.getTodayChallenge(todayStr),
        motivationRepository.getDailySummary(todayStr),
        motivationRepository.getWeeklySummary(5),
        motivationRepository.getGoalHistory(5),
        motivationRepository.getAchievements(),
        dashboardService.getCurrentLearningItem(),
        motivationRepository.getAllMotivations(selectedQuoteCategory, favoritesOnly),
      ]);

      setTodayMotivation(fetchedMotivation);
      setDailyGoals(fetchedGoals);
      setStreak(fetchedStreak);
      setTodayChallenge(fetchedChallenge);
      setDailySummary(fetchedSummary);
      setWeeklySummary(fetchedWeekly);
      setGoalHistory(fetchedHistory);
      setAchievements(fetchedAchievements);
      setCurrentLearning(fetchedCurrentLearning);
      setQuotesList(fetchedQuotes);
    } catch (err) {
      console.error('Failed to load motivation data from SQLite:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedQuoteCategory, favoritesOnly]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refresh = async () => {
    setRefreshing(true);
    const todayStr = getLocalDateString();
    await motivationRepository.syncTodayGoals(todayStr);
    await loadData();
  };

  const handleToggleFavoriteQuote = async (id: string) => {
    const isFav = await motivationRepository.toggleFavorite(id);
    setQuotesList((prev) =>
      prev.map((q) => (q.id === id ? { ...q, is_favorite: isFav } : q))
    );
    if (todayMotivation && todayMotivation.id === id) {
      setTodayMotivation({ ...todayMotivation, is_favorite: isFav });
    }
  };

  const handleAcceptChallenge = async () => {
    if (!todayChallenge) return;
    await motivationRepository.completeChallenge(todayChallenge.id);
    setTodayChallenge({ ...todayChallenge, is_completed: true, completed_at: new Date().toISOString() });
    await refresh();
  };

  const goalsCompletedCount = dailyGoals.filter((g) => g.is_completed).length;
  const goalsTotalCount = dailyGoals.length;
  const goalsProgressPercentage =
    goalsTotalCount > 0 ? Math.round((goalsCompletedCount / goalsTotalCount) * 100) : 0;
  const isDailyComplete = goalsTotalCount > 0 && goalsCompletedCount === goalsTotalCount;
  const unlockedAchievementsCount = achievements.filter((a) => a.is_unlocked).length;

  return {
    todayMotivation,
    dailyGoals,
    goalsCompletedCount,
    goalsTotalCount,
    goalsProgressPercentage,
    isDailyComplete,
    streak,
    todayChallenge,
    dailySummary,
    weeklySummary,
    goalHistory,
    achievements,
    unlockedAchievementsCount,
    currentLearning,
    quotesList,
    selectedQuoteCategory,
    favoritesOnly,
    loading,
    refreshing,
    refresh,
    toggleFavoriteQuote: handleToggleFavoriteQuote,
    setQuoteCategory: setSelectedQuoteCategory,
    toggleFavoritesOnly: () => setFavoritesOnly((p) => !p),
    acceptChallenge: handleAcceptChallenge,
  };
}
