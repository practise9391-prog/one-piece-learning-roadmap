import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Header } from '../../components/Header';
import { DailyGoalProgressCard } from '../../components/motivation/DailyGoalProgressCard';
import { TodayGoalsChecklist } from '../../components/motivation/TodayGoalsChecklist';
import { DailySummaryCard } from '../../components/motivation/DailySummaryCard';
import { WeeklySummaryChart } from '../../components/motivation/WeeklySummaryChart';
import { useMotivationViewModel } from '../../hooks/useMotivationViewModel';
import { useAppNavigation } from '../../navigation/NavigationContext';

export const DailyLearningScreen: React.FC = () => {
  const { goBack } = useAppNavigation();
  const {
    dailyGoals,
    goalsCompletedCount,
    goalsTotalCount,
    goalsProgressPercentage,
    isDailyComplete,
    streak,
    dailySummary,
    weeklySummary,
  } = useMotivationViewModel();

  return (
    <View style={styles.container}>
      <Header
        title="Today's Goals"
        subtitle="Daily Learning Routine"
        showBack
        onBackPress={goBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <DailyGoalProgressCard
          completedCount={goalsCompletedCount}
          totalCount={goalsTotalCount}
          percentage={goalsProgressPercentage}
          streakDays={streak.currentStreak}
          isAllCompleted={isDailyComplete}
        />

        <TodayGoalsChecklist goals={dailyGoals} />

        <DailySummaryCard summary={dailySummary} />

        {weeklySummary && <WeeklySummaryChart summary={weeklySummary} />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
});
