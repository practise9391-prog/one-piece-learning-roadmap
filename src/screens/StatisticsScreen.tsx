import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../components/navigation/AppShell';
import { ProgressBar } from '../components/ProgressBar';
import { CourseStatisticsCard, StreakCard, LearningHeatmap, ProgressOverTimeChart } from '../components/statistics';
import { useAppNavigation } from '../navigation/NavigationContext';
import {
  statisticsService,
  OverallStatistics,
  CourseProgressStat,
  MonthHeatmap,
  AchievementItem,
  ProgressDataPoint,
} from '../services/StatisticsService';
import { StreakMetrics } from '../repositories/ActivityRepository';
import { studySessionRepository } from '../repositories/StudySessionRepository';
import { FocusOverallStats, FocusCourseStats, DayStudyTime } from '../models/Focus';
import { formatMinutesOrHours } from '../hooks/useFocusTimer';
import { formatDate } from '../utils/dateUtils';
import { Colors } from '../theme/colors';

export const StatisticsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  const [overall, setOverall] = useState<OverallStatistics | null>(null);
  const [courseStats, setCourseStats] = useState<CourseProgressStat[]>([]);
  const [streakMetrics, setStreakMetrics] = useState<StreakMetrics | null>(null);
  const [heatmap, setHeatmap] = useState<MonthHeatmap | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [progressHistory, setProgressHistory] = useState<{
    hasEnoughData: boolean;
    dataPoints: ProgressDataPoint[];
  }>({ hasEnoughData: false, dataPoints: [] });
  const [focusStats, setFocusStats] = useState<FocusOverallStats | null>(null);
  const [focusCourseStats, setFocusCourseStats] = useState<FocusCourseStats[]>([]);
  const [focusDayChart, setFocusDayChart] = useState<DayStudyTime[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Animated progress bar value
  const progressAnim = useRef(new Animated.Value(0)).current;

  const loadStatistics = useCallback(async () => {
    try {
      const [
        fetchedOverall,
        fetchedCourses,
        fetchedStreak,
        fetchedHeatmap,
        fetchedAchievements,
        fetchedHistory,
        fetchedFocusStats,
        fetchedFocusCourses,
        fetchedFocusDays,
      ] = await Promise.all([
        statisticsService.getOverallStatistics(),
        statisticsService.getCourseStatistics(),
        statisticsService.getStreakMetrics(),
        statisticsService.getCalendarHeatmap(),
        statisticsService.getRecentAchievements(10),
        statisticsService.getProgressHistory(),
        studySessionRepository.getFocusOverallStats(),
        studySessionRepository.getStudySessionsByCourse(),
        studySessionRepository.getStudyTimeByDayLast7Days(),
      ]);

      setOverall(fetchedOverall);
      setCourseStats(fetchedCourses);
      setStreakMetrics(fetchedStreak);
      setHeatmap(fetchedHeatmap);
      setAchievements(fetchedAchievements);
      setProgressHistory(fetchedHistory);
      setFocusStats(fetchedFocusStats);
      setFocusCourseStats(fetchedFocusCourses);
      setFocusDayChart(fetchedFocusDays);

      // Animate progress
      Animated.timing(progressAnim, {
        toValue: fetchedOverall.overallProgressPercentage,
        duration: 900,
        useNativeDriver: false,
      }).start();
    } catch (err) {
      console.error('Failed to load statistics from SQLite:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [progressAnim]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStatistics();
  };

  const handleOpenCourseRoadmap = (courseId: string) => {
    navigate('CourseRoadmap', { courseId });
  };

  return (
    <AppShell title="STATISTICS">
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Calculating Voyage Analytics...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {/* 1. COMPLETED ALL STATE BANNER */}
          {overall?.isAllCompleted && (
            <View style={styles.allCompletedBanner}>
              <Ionicons name="trophy" size={32} color={Colors.secondary} />
              <View style={styles.allCompletedTextCol}>
                <Text style={styles.allCompletedTitle}>🏆 JOURNEY COMPLETE</Text>
                <Text style={styles.allCompletedSub}>
                  You conquered all 14 courses on the Grand Line! Keep practicing and honing your skills.
                </Text>
              </View>
            </View>
          )}

          {/* 2. OVERALL JOURNEY CARD */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <View style={styles.crestCircle}>
                <Ionicons name="compass" size={24} color={Colors.secondary} />
              </View>
              <View style={styles.heroTitleCol}>
                <Text style={styles.heroPreTitle}>📊 MY LEARNING STATS</Text>
                <Text style={styles.heroTitle}>OVERALL JOURNEY</Text>
              </View>
              <View style={styles.pctBadge}>
                <Text style={styles.pctBadgeText}>{overall?.overallProgressPercentage || 0}%</Text>
              </View>
            </View>

            {/* Large Progress Bar */}
            <View style={styles.heroTrack}>
              <Animated.View
                style={[
                  styles.heroFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>

            {/* Core Metrics Triad */}
            <View style={styles.metricsTriadRow}>
              <View style={styles.triadItem}>
                <Text style={styles.triadVal}>
                  {overall?.completedCourses} / {overall?.totalCourses}
                </Text>
                <Text style={styles.triadLbl}>COURSES</Text>
              </View>
              <View style={styles.triadDivider} />
              <View style={styles.triadItem}>
                <Text style={styles.triadVal}>
                  {overall?.completedModules} / {overall?.totalModules}
                </Text>
                <Text style={styles.triadLbl}>MODULES</Text>
              </View>
              <View style={styles.triadDivider} />
              <View style={styles.triadItem}>
                <Text style={styles.triadVal}>
                  {overall?.completedTopics} / {overall?.totalTopics}
                </Text>
                <Text style={styles.triadLbl}>TOPICS</Text>
              </View>
            </View>
          </View>

          {/* 3. NEW USER MEANINGFUL EMPTY STATE */}
          {!overall?.hasStartedAny && (
            <View style={styles.newUserCard}>
              <Ionicons name="boat-outline" size={38} color={Colors.primary} />
              <Text style={styles.newUserTitle}>YOUR JOURNEY STARTS HERE</Text>
              <Text style={styles.newUserSub}>
                You haven't started learning yet. Choose a course island and begin your grand line journey.
              </Text>
              <TouchableOpacity
                style={styles.startLearningBtn}
                onPress={() => navigate('Courses')}
                activeOpacity={0.8}
              >
                <Text style={styles.startLearningBtnText}>START LEARNING</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* 4. LEARNING STREAK SYSTEM */}
          {streakMetrics && <StreakCard metrics={streakMetrics} />}

          {/* 5. LEARNING CALENDAR / HEATMAP */}
          {heatmap && <LearningHeatmap heatmap={heatmap} />}

          {/* 6. LEARNING BREAKDOWN */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>LEARNING BREAKDOWN</Text>
          </View>

          <View style={styles.breakdownGrid}>
            {/* Courses Breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownCardHeader}>
                <Ionicons name="boat" size={16} color="#2563EB" />
                <Text style={styles.breakdownCardTitle}>Courses</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Completed</Text>
                <Text style={[styles.breakdownVal, { color: Colors.success }]}>
                  {overall?.completedCourses}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>In Progress</Text>
                <Text style={[styles.breakdownVal, { color: '#D97706' }]}>
                  {overall?.inProgressCourses}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Not Started</Text>
                <Text style={styles.breakdownVal}>{overall?.notStartedCourses}</Text>
              </View>
            </View>

            {/* Modules Breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownCardHeader}>
                <Ionicons name="layers" size={16} color="#9333EA" />
                <Text style={styles.breakdownCardTitle}>Modules</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Completed</Text>
                <Text style={[styles.breakdownVal, { color: Colors.success }]}>
                  {overall?.completedModules}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Remaining</Text>
                <Text style={[styles.breakdownVal, { color: Colors.primary }]}>
                  {overall?.remainingModules}
                </Text>
              </View>
              <View style={styles.miniBarWrap}>
                <ProgressBar
                  percentage={overall?.overallProgressPercentage || 0}
                  height={5}
                  color={Colors.primary}
                />
              </View>
            </View>
          </View>

          {/* 7. TOPIC STATISTICS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>TOPIC PROGRESS</Text>
          </View>

          <View style={styles.topicCard}>
            <View style={styles.topicHeaderRow}>
              <View>
                <Text style={styles.topicCountLabel}>Completed Topics</Text>
                <Text style={styles.topicCountVal}>
                  {overall?.completedTopics} / {overall?.totalTopics}
                </Text>
              </View>
              <View style={styles.topicRemainingBox}>
                <Text style={styles.topicRemainingVal}>{overall?.remainingTopics}</Text>
                <Text style={styles.topicRemainingLabel}>Remaining</Text>
              </View>
            </View>

            <View style={styles.topicBarRow}>
              <ProgressBar
                percentage={overall?.topicProgressPercentage || 0}
                height={8}
                color="#10B981"
              />
              <Text style={styles.topicPercentText}>
                {overall?.topicProgressPercentage || 0}%
              </Text>
            </View>
          </View>

          {/* FOCUS STUDY STATISTICS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>🎯 FOCUS & STUDY TIME</Text>
            <TouchableOpacity onPress={() => navigate('FocusHistory')} activeOpacity={0.7}>
              <Text style={styles.viewHistoryLink}>History ›</Text>
            </TouchableOpacity>
          </View>

          {/* Primary Focus Metrics Card */}
          <View style={styles.focusStatCard}>
            <View style={styles.focusCardTopRow}>
              <View style={styles.focusStatHeaderCol}>
                <Text style={styles.focusStatHeading}>Voyage Study Metrics</Text>
                <Text style={styles.focusStatSub}>Calculated from verified local study sessions</Text>
              </View>
              <TouchableOpacity
                style={styles.launchFocusBtn}
                onPress={() => navigate('FocusMode')}
                activeOpacity={0.85}
              >
                <Ionicons name="timer" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.launchFocusBtnText}>START FOCUS</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.focusMetricsGrid}>
              <View style={styles.focusMetricTile}>
                <Text style={styles.focusTileValue}>
                  {formatMinutesOrHours(focusStats?.today_seconds || 0)}
                </Text>
                <Text style={styles.focusTileLabel}>TODAY</Text>
              </View>

              <View style={styles.focusTileDivider} />

              <View style={styles.focusMetricTile}>
                <Text style={styles.focusTileValue}>
                  {formatMinutesOrHours(focusStats?.week_seconds || 0)}
                </Text>
                <Text style={styles.focusTileLabel}>THIS WEEK</Text>
              </View>

              <View style={styles.focusTileDivider} />

              <View style={styles.focusMetricTile}>
                <Text style={styles.focusTileValue}>
                  {formatMinutesOrHours(focusStats?.month_seconds || 0)}
                </Text>
                <Text style={styles.focusTileLabel}>THIS MONTH</Text>
              </View>
            </View>

            <View style={styles.focusStatDividerHoriz} />

            <View style={styles.focusSecondaryGrid}>
              <View style={styles.focusSecondaryTile}>
                <Text style={styles.secondaryTileLabel}>Sessions Today</Text>
                <Text style={styles.secondaryTileValue}>{focusStats?.today_sessions_count || 0}</Text>
              </View>
              <View style={styles.focusSecondaryTile}>
                <Text style={styles.secondaryTileLabel}>This Week</Text>
                <Text style={styles.secondaryTileValue}>{focusStats?.week_sessions_count || 0}</Text>
              </View>
              <View style={styles.focusSecondaryTile}>
                <Text style={styles.secondaryTileLabel}>Average</Text>
                <Text style={styles.secondaryTileValue}>
                  {formatMinutesOrHours(focusStats?.average_duration_seconds || 0)}
                </Text>
              </View>
              <View style={styles.focusSecondaryTile}>
                <Text style={styles.secondaryTileLabel}>Longest</Text>
                <Text style={styles.secondaryTileValue}>
                  {formatMinutesOrHours(focusStats?.longest_duration_seconds || 0)}
                </Text>
              </View>
            </View>
          </View>

          {/* Study Time 7-Day Chart */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Ionicons name="bar-chart-outline" size={16} color="#0284C7" />
              <Text style={styles.chartTitle}>Study Time (Last 7 Days)</Text>
            </View>

            <View style={styles.barChartContainer}>
              {focusDayChart.map((d, idx) => {
                const maxDaySecs = Math.max(1, ...focusDayChart.map((c) => c.seconds));
                const barHeight = Math.max(6, Math.round((d.seconds / maxDaySecs) * 80));
                const mins = Math.round(d.seconds / 60);

                return (
                  <View key={idx} style={styles.barCol}>
                    <Text style={styles.barMinsText}>{mins > 0 ? `${mins}m` : ''}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { height: barHeight },
                          d.seconds > 0 && styles.barFillActive,
                        ]}
                      />
                    </View>
                    <Text style={styles.barDayLabel}>{d.day_label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Study Time By Course Distribution */}
          {focusCourseStats.length > 0 ? (
            <View style={styles.courseDistCard}>
              <View style={styles.chartHeader}>
                <Ionicons name="pie-chart-outline" size={16} color="#0284C7" />
                <Text style={styles.chartTitle}>Study Time by Course</Text>
              </View>

              {focusCourseStats.map((cs) => {
                const totalCourseStudy = focusStats?.total_seconds || 1;
                const coursePct = Math.min(100, Math.round((cs.total_seconds / totalCourseStudy) * 100));

                return (
                  <View key={cs.course_id} style={styles.courseDistRow}>
                    <View style={styles.courseDistHeader}>
                      <Text style={styles.courseDistName} numberOfLines={1}>
                        {cs.course_name}
                      </Text>
                      <Text style={styles.courseDistTime}>
                        {formatMinutesOrHours(cs.total_seconds)} ({coursePct}%)
                      </Text>
                    </View>
                    <View style={styles.courseDistTrack}>
                      <View style={[styles.courseDistFill, { width: `${coursePct}%` }]} />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          {/* 8. COURSE PROGRESS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>COURSE PROGRESS ({courseStats.length})</Text>
          </View>

          {courseStats.map((item) => (
            <CourseStatisticsCard
              key={item.course.id}
              stat={item}
              onPress={() => handleOpenCourseRoadmap(item.course.id)}
            />
          ))}

          {/* 9. RECENT ACHIEVEMENTS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>RECENT ACHIEVEMENTS</Text>
          </View>

          {achievements.length > 0 ? (
            <View style={styles.achievementsCard}>
              {achievements.map((ach, idx) => (
                <View
                  key={ach.id}
                  style={[
                    styles.achievementRow,
                    idx < achievements.length - 1 && styles.achievementDivider,
                  ]}
                >
                  <View style={styles.achievementIconBox}>
                    <Ionicons
                      name={
                        ach.type === 'COURSE'
                          ? 'trophy'
                          : ach.type === 'MODULE'
                          ? 'checkmark-circle'
                          : 'list-circle'
                      }
                      size={18}
                      color={
                        ach.type === 'COURSE'
                          ? Colors.secondary
                          : ach.type === 'MODULE'
                          ? Colors.success
                          : Colors.primary
                      }
                    />
                  </View>
                  <View style={styles.achievementTextCol}>
                    <Text style={styles.achievementCourseName}>{ach.courseName}</Text>
                    <Text style={styles.achievementTitle}>{ach.title}</Text>
                  </View>
                  <Text style={styles.achievementDate}>{formatDate(ach.completedAt)}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyCardText}>No achievements completed yet.</Text>
            </View>
          )}

          {/* 10. PROGRESS OVER TIME */}
          <ProgressOverTimeChart
            hasEnoughData={progressHistory.hasEnoughData}
            dataPoints={progressHistory.dataPoints}
          />
        </ScrollView>
      )}
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
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
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  allCompletedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.secondary,
  },
  allCompletedTextCol: {
    flex: 1,
    marginLeft: 12,
  },
  allCompletedTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.secondary,
  },
  allCompletedSub: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 16,
    marginTop: 2,
  },
  heroCard: {
    backgroundColor: Colors.oceanDepths,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  crestCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.4)',
  },
  heroTitleCol: {
    flex: 1,
  },
  heroPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  pctBadge: {
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  pctBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.secondary,
  },
  heroTrack: {
    height: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 4.5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 4.5,
  },
  metricsTriadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  triadItem: {
    flex: 1,
    alignItems: 'center',
  },
  triadVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  triadLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginTop: 3,
  },
  triadDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  newUserCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newUserTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  newUserSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: 10,
    paddingHorizontal: 12,
  },
  startLearningBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  startLearningBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  viewHistoryLink: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  focusStatCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  focusCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  focusStatHeaderCol: {
    flex: 1,
    marginRight: 8,
  },
  focusStatHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  focusStatSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  launchFocusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  launchFocusBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  focusMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  focusMetricTile: {
    flex: 1,
    alignItems: 'center',
  },
  focusTileValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primary,
  },
  focusTileLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginTop: 3,
  },
  focusTileDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  focusStatDividerHoriz: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  focusSecondaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  focusSecondaryTile: {
    flex: 1,
    alignItems: 'center',
  },
  secondaryTileLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
  },
  secondaryTileValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barMinsText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    minHeight: 12,
  },
  barTrack: {
    width: 16,
    height: 80,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#CBD5E1',
    borderRadius: 8,
  },
  barFillActive: {
    backgroundColor: Colors.primary,
  },
  barDayLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 6,
  },
  courseDistCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseDistRow: {
    marginBottom: 12,
  },
  courseDistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  courseDistName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  courseDistTime: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  courseDistTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  courseDistFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  breakdownGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  breakdownCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  breakdownCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  breakdownLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  breakdownVal: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  miniBarWrap: {
    marginTop: 8,
  },
  topicCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicCountLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  topicCountVal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  topicRemainingBox: {
    alignItems: 'flex-end',
  },
  topicRemainingVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706',
  },
  topicRemainingLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  topicBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicPercentText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    marginLeft: 10,
    minWidth: 34,
    textAlign: 'right',
  },
  achievementsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  achievementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  achievementDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  achievementIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  achievementTextCol: {
    flex: 1,
  },
  achievementCourseName: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  achievementDate: {
    fontSize: 10,
    color: '#94A3B8',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyCardText: {
    fontSize: 12,
    color: '#64748B',
  },
});
