import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { DailyMotivationCard } from '../../components/motivation/DailyMotivationCard';
import { DailyGoalProgressCard } from '../../components/motivation/DailyGoalProgressCard';
import { TodayGoalsChecklist } from '../../components/motivation/TodayGoalsChecklist';
import { DailyChallengeCard } from '../../components/motivation/DailyChallengeCard';
import { DailySummaryCard } from '../../components/motivation/DailySummaryCard';
import { WeeklySummaryChart } from '../../components/motivation/WeeklySummaryChart';
import { DailyCompletionModal } from '../../components/motivation/DailyCompletionModal';
import { useMotivationViewModel } from '../../hooks/useMotivationViewModel';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { MotivationCategory } from '../../models/Motivation';
import { Colors } from '../../theme/colors';

const CATEGORIES: { id: MotivationCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'CODING', label: 'Coding' },
  { id: 'DISCIPLINE', label: 'Discipline' },
  { id: 'CONSISTENCY', label: 'Streak' },
  { id: 'PROBLEM_SOLVING', label: 'Problems' },
  { id: 'PRACTICE', label: 'Practice' },
  { id: 'CAREER', label: 'Career' },
];

export const MotivationHomeScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const {
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
    achievements,
    unlockedAchievementsCount,
    currentLearning,
    quotesList,
    selectedQuoteCategory,
    favoritesOnly,
    loading,
    refreshing,
    refresh,
    toggleFavoriteQuote,
    setQuoteCategory,
    toggleFavoritesOnly,
    acceptChallenge,
  } = useMotivationViewModel();

  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const handleContinueLearning = () => {
    setShowCelebration(false);
    if (currentLearning) {
      navigate('ModuleDetails', {
        courseId: currentLearning.course.id,
        moduleId: currentLearning.currentModule.id,
      });
    } else {
      navigate('Courses');
    }
  };

  return (
    <AppShell title="MOTIVATION & GOALS">
      <View style={styles.container}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Aligning Voyage Coordinates...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[Colors.primary, Colors.secondary]}
                tintColor={Colors.primary}
              />
            }
          >
            {/* 1. Daily Quote Card */}
            {todayMotivation && (
              <DailyMotivationCard
                motivation={todayMotivation}
                onToggleFavorite={() => toggleFavoriteQuote(todayMotivation.id)}
              />
            )}

            {/* 2. Streak & Achievements Quick Row */}
            <View style={styles.statsStripRow}>
              <View style={styles.streakStripCard}>
                <View style={styles.stripIconWrap}>
                  <Ionicons name="flame" size={20} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.stripNum}>{streak.currentStreak} Days</Text>
                  <Text style={styles.stripLbl}>CURRENT STREAK</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.achieveStripCard}
                onPress={() => navigate('Achievements')}
                activeOpacity={0.8}
              >
                <View style={styles.stripIconWrapAch}>
                  <Ionicons name="trophy" size={18} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stripNum}>
                    {unlockedAchievementsCount} / {achievements.length}
                  </Text>
                  <Text style={styles.stripLbl}>ACHIEVEMENTS →</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 3. Continue Learning Banner */}
            {currentLearning && (
              <TouchableOpacity
                style={styles.continueCard}
                onPress={handleContinueLearning}
                activeOpacity={0.85}
              >
                <View style={styles.continueLeft}>
                  <Text style={styles.continuePre}>RESUME EXPEDITION</Text>
                  <Text style={styles.continueTitle} numberOfLines={1}>
                    {currentLearning.course.name} • {currentLearning.currentModule.title}
                  </Text>
                </View>
                <View style={styles.continueBtn}>
                  <Text style={styles.continueBtnText}>Sail</Text>
                  <Ionicons name="chevron-forward" size={14} color="#0D1B2A" />
                </View>
              </TouchableOpacity>
            )}

            {/* 4. Today's Goal Progress Card */}
            <DailyGoalProgressCard
              completedCount={goalsCompletedCount}
              totalCount={goalsTotalCount}
              percentage={goalsProgressPercentage}
              streakDays={streak.currentStreak}
              isAllCompleted={isDailyComplete}
            />

            {/* 5. Today's Goals Checklist */}
            <TodayGoalsChecklist goals={dailyGoals} />

            {/* 6. Daily Challenge */}
            {todayChallenge && (
              <DailyChallengeCard
                challenge={todayChallenge}
                onAccept={acceptChallenge}
              />
            )}

            {/* 7. Today's Progress Summary */}
            <DailySummaryCard summary={dailySummary} />

            {/* 8. Weekly Routine Summary */}
            {weeklySummary && <WeeklySummaryChart summary={weeklySummary} />}

            {/* 9. Motivation Quotes Explorer Section */}
            <View style={styles.sectionHeader}>
              <Ionicons name="compass-outline" size={18} color="#D97706" />
              <Text style={styles.sectionTitle}>MOTIVATION ARCHIVES</Text>
            </View>

            {/* Category Filter Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.catScroll}
            >
              <TouchableOpacity
                style={[styles.catTab, favoritesOnly && styles.catTabActiveFav]}
                onPress={toggleFavoritesOnly}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={favoritesOnly ? 'heart' : 'heart-outline'}
                  size={12}
                  color={favoritesOnly ? '#FFFFFF' : '#EF4444'}
                />
                <Text style={[styles.catTabText, favoritesOnly && styles.catTabTextActive]}>
                  Favorites
                </Text>
              </TouchableOpacity>

              {CATEGORIES.map((cat) => {
                const isActive = !favoritesOnly && selectedQuoteCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catTab, isActive && styles.catTabActive]}
                    onPress={() => {
                      if (favoritesOnly) toggleFavoritesOnly();
                      setQuoteCategory(cat.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.catTabText, isActive && styles.catTabTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Quotes List */}
            {quotesList.slice(0, 6).map((q) => (
              <DailyMotivationCard
                key={q.id}
                motivation={q}
                onToggleFavorite={() => toggleFavoriteQuote(q.id)}
              />
            ))}
          </ScrollView>
        )}

        {/* Celebration Modal */}
        <DailyCompletionModal
          visible={showCelebration}
          streakDays={streak.currentStreak}
          onContinue={handleContinueLearning}
        />
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  scrollContent: {
    paddingVertical: 14,
    paddingBottom: 40,
  },
  statsStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  streakStripCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  achieveStripCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stripIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripIconWrapAch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripNum: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  stripLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.4,
  },
  continueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.3)',
  },
  continueLeft: {
    flex: 1,
    marginRight: 10,
  },
  continuePre: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.6,
  },
  continueTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  continueBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0D1B2A',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.6,
  },
  catScroll: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  catTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  catTabActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  catTabActiveFav: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  catTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  catTabTextActive: {
    color: '#FFFFFF',
  },
});
