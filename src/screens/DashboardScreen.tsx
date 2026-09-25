import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../components/navigation/AppShell';
import { OnePieceBadge } from '../components/OnePieceBadge';
import { ProgressBar } from '../components/ProgressBar';
import { useAppNavigation } from '../navigation/NavigationContext';
import { roadmapService } from '../services/RoadmapService';
import { dashboardService, OverallProgressStats, CurrentLearningItem } from '../services/DashboardService';
import { Course } from '../models/Course';
import { UserProfile, AVATAR_OPTIONS } from '../models/Settings';
import { settingsRepository } from '../repositories/SettingsRepository';
import { Colors } from '../theme/colors';

export const DashboardScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  const [stats, setStats] = useState<OverallProgressStats | null>(null);
  const [currentLearning, setCurrentLearning] = useState<CurrentLearningItem | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [fetchedStats, fetchedCurrent, fetchedCourses, fetchedProfile] = await Promise.all([
        dashboardService.getOverallStats(),
        dashboardService.getCurrentLearningItem(),
        roadmapService.getCourses(),
        settingsRepository.getUserProfile(),
      ]);
      setStats(fetchedStats);
      setCurrentLearning(fetchedCurrent);
      setCourses(fetchedCourses);
      setUserProfile(fetchedProfile);
    } catch (err) {
      console.error('Failed to load dashboard data from SQLite:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleContinue = () => {
    if (currentLearning) {
      navigate('ModuleDetails', {
        courseId: currentLearning.course.id,
        moduleId: currentLearning.currentModule.id,
      });
    } else {
      navigate('Courses');
    }
  };

  const getCourseStatusBadge = (course: Course) => {
    if (course.is_completed) {
      return { label: 'COMPLETED ✓', variant: 'success' as const, bg: '#DCFCE7', text: '#15803D' };
    }
    if (course.started_at || course.introduction_completed || course.completed_modules > 0) {
      return { label: 'IN PROGRESS', variant: 'primary' as const, bg: '#FEF3C7', text: '#B45309' };
    }
    return { label: 'NOT STARTED', variant: 'secondary' as const, bg: '#F1F5F9', text: '#64748B' };
  };

  return (
    <AppShell title="ONE PIECE LEARNING">
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading Dashboard from SQLite...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
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
          {/* 1. HERO SECTION */}
          <View style={styles.heroCard}>
            <View style={styles.heroTopRow}>
              <TouchableOpacity
                style={styles.heroCrest}
                onPress={() => navigate('ProfileSettings')}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 24 }}>
                  {AVATAR_OPTIONS.find((a) => a.id === userProfile?.avatar_type)?.symbol || '🧭'}
                </Text>
              </TouchableOpacity>
              <View style={styles.heroTitleCol}>
                <Text style={styles.heroPreTitle}>
                  CAPTAIN {userProfile?.display_name ? userProfile.display_name.toUpperCase() : 'PAVAN'}'S VOYAGE
                </Text>
                <Text style={styles.heroTitle}>LEARNING JOURNEY</Text>
              </View>
            </View>

            <Text style={styles.heroQuote}>
              "Keep moving forward across every engineering island."
            </Text>

            <View style={styles.heroMetricRow}>
              <Text style={styles.heroMetricText}>
                {stats?.completedModules || 0} Modules Completed
              </Text>
              <Text style={styles.heroPercentText}>
                {stats?.overallProgressPercentage || 0}%
              </Text>
            </View>

            <View style={styles.heroProgressTrack}>
              <View
                style={[
                  styles.heroProgressFill,
                  { width: `${stats?.overallProgressPercentage || 0}%` },
                ]}
              />
            </View>

            <TouchableOpacity
              style={styles.heroButton}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.heroButtonText}>
                {currentLearning ? 'Continue Learning' : 'Explore Courses'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={styles.btnIcon} />
            </TouchableOpacity>
          </View>

          {/* 2. CONTINUE LEARNING CARD */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>CONTINUE LEARNING</Text>
          </View>

          {currentLearning ? (
            <TouchableOpacity
              style={styles.continueCard}
              activeOpacity={0.88}
              onPress={handleContinue}
            >
              <View style={styles.continueHeader}>
                <View style={styles.courseEmblemBox}>
                  <Ionicons name="boat" size={22} color={Colors.primary} />
                </View>
                <View style={styles.continueCourseCol}>
                  <Text style={styles.continueCourseName}>{currentLearning.course.name}</Text>
                  <Text style={styles.continueModuleTitle}>
                    Module {currentLearning.currentModule.order}: {currentLearning.currentModule.title}
                  </Text>
                </View>
              </View>

              <View style={styles.continueProgressRow}>
                <Text style={styles.continueModulesDone}>
                  {currentLearning.completedModules} / {currentLearning.totalModules} Modules
                </Text>
                <Text style={styles.continuePct}>
                  {Math.round(currentLearning.progressPercentage)}%
                </Text>
              </View>

              <ProgressBar
                percentage={currentLearning.progressPercentage}
                height={8}
                color={Colors.primary}
              />

              <View style={styles.continueActionRow}>
                <Text style={styles.continueHint}>Resume from saved module checkpoint</Text>
                <View style={styles.continueBtnChip}>
                  <Text style={styles.continueBtnText}>CONTINUE</Text>
                  <Ionicons name="play" size={12} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyContinueCard}>
              <Ionicons name="navigate-outline" size={36} color={Colors.secondary} />
              <Text style={styles.emptyContinueTitle}>Start Your Learning Journey</Text>
              <Text style={styles.emptyContinueSub}>
                Chart your course across 14 technology islands on the Grand Line.
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigate('Courses')}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreBtnText}>Explore Courses</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* 3. QUICK ACTIONS */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>QUICK ACTIONS</Text>
          </View>

          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => navigate('Courses')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="book-outline" size={22} color="#2563EB" />
              </View>
              <Text style={styles.quickLabel}>Courses</Text>
              <Text style={styles.quickSub}>{courses.length} Islands</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => navigate('Notes')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="journal-outline" size={22} color="#16A34A" />
              </View>
              <Text style={styles.quickLabel}>Notes</Text>
              <Text style={styles.quickSub}>{stats?.totalNotes || 0} Saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => navigate('Statistics')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#FAF5FF' }]}>
                <Ionicons name="pie-chart-outline" size={22} color="#9333EA" />
              </View>
              <Text style={styles.quickLabel}>Stats</Text>
              <Text style={styles.quickSub}>Voyage Data</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => navigate('PracticeLinks')}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="code-slash-outline" size={22} color="#D97706" />
              </View>
              <Text style={styles.quickLabel}>Practice</Text>
              <Text style={styles.quickSub}>Code Arena</Text>
            </TouchableOpacity>
          </View>

          {/* 4. OVERALL PROGRESS CARD */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>OVERALL PROGRESS</Text>
          </View>

          <View style={styles.overallStatsCard}>
            <View style={styles.statMetricGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{stats?.totalCourses || 0}</Text>
                <Text style={styles.statLbl}>TOTAL COURSES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{stats?.startedCourses || 0}</Text>
                <Text style={styles.statLbl}>STARTED</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: Colors.success }]}>
                  {stats?.completedCourses || 0}
                </Text>
                <Text style={styles.statLbl}>COMPLETED</Text>
              </View>
            </View>

            <View style={styles.statsSeparator} />

            <View style={styles.statMetricGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{stats?.totalModules || 0}</Text>
                <Text style={styles.statLbl}>TOTAL MODULES</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{stats?.completedModules || 0}</Text>
                <Text style={styles.statLbl}>COMPLETED</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: Colors.secondary }]}>
                  {stats?.overallProgressPercentage || 0}%
                </Text>
                <Text style={styles.statLbl}>PROGRESS</Text>
              </View>
            </View>
          </View>

          {/* 5. YOUR COURSES SECTION */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>YOUR COURSES</Text>
            <TouchableOpacity onPress={() => navigate('Courses')} activeOpacity={0.7}>
              <Text style={styles.viewAllText}>View All ({courses.length})</Text>
            </TouchableOpacity>
          </View>

          {courses.map((course) => {
            const statusInfo = getCourseStatusBadge(course);
            return (
              <TouchableOpacity
                key={course.id}
                style={styles.courseItemCard}
                activeOpacity={0.8}
                onPress={() => navigate('CourseRoadmap', { courseId: course.id })}
              >
                <View style={styles.courseCardTop}>
                  <View style={styles.courseIconCircle}>
                    <Ionicons name="boat-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.courseTitleCol}>
                    <Text style={styles.courseCardName}>{course.name}</Text>
                    <Text style={styles.courseCardModules}>
                      {course.completed_modules} / {course.total_modules} modules completed
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusInfo.text }]}>
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.courseProgressBarRow}>
                  <ProgressBar
                    percentage={course.progress_percentage}
                    height={6}
                    color={course.is_completed ? Colors.success : Colors.primary}
                  />
                  <Text style={styles.coursePctText}>
                    {Math.round(course.progress_percentage)}%
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </AppShell>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36,
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
  heroCard: {
    backgroundColor: Colors.oceanDepths,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.25)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroCrest: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroQuote: {
    fontSize: 13,
    fontStyle: 'italic',
    color: '#CBD5E1',
    marginVertical: 10,
    lineHeight: 18,
  },
  heroMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroMetricText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  heroPercentText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.secondary,
  },
  heroProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  heroProgressFill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 4,
  },
  heroButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  heroButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  btnIcon: {
    marginLeft: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  continueCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  continueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  courseEmblemBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  continueCourseCol: {
    flex: 1,
  },
  continueCourseName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  continueModuleTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  continueProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  continueModulesDone: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  continuePct: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  continueActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  continueHint: {
    fontSize: 11,
    color: '#94A3B8',
  },
  continueBtnChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyContinueCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyContinueTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 10,
  },
  emptyContinueSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  quickGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  quickSub: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  overallStatsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statMetricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  statLbl: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  statsSeparator: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  courseItemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  courseCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  courseTitleCol: {
    flex: 1,
  },
  courseCardName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  courseCardModules: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  courseProgressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coursePctText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 8,
    minWidth: 32,
    textAlign: 'right',
  },
});
