import React from 'react';
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
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useProgressAnalyticsViewModel, AnalyticsTab } from '../../hooks/useProgressAnalyticsViewModel';
import { OverallProgressCard } from '../../components/progress/OverallProgressCard';
import { CourseProgressCard } from '../../components/progress/CourseProgressCard';
import { StudyTimeChart } from '../../components/progress/StudyTimeChart';
import { StreakCalendarCard } from '../../components/progress/StreakCalendarCard';
import { PracticeDomainCard } from '../../components/progress/PracticeDomainCard';
import { GoalAnalyticsCard } from '../../components/progress/GoalAnalyticsCard';
import { useTheme } from '../../theme/ThemeContext';

export const ProgressDashboardScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { theme } = useTheme();

  const {
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
    refresh,
    formatMinutes,
  } = useProgressAnalyticsViewModel();

  const tabs: Array<{ id: AnalyticsTab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { id: 'overview', label: 'Overview', icon: 'grid-outline' },
    { id: 'courses', label: 'Courses', icon: 'book-outline' },
    { id: 'completed', label: 'Completed', icon: 'checkmark-circle-outline' },
    { id: 'remaining', label: 'Remaining', icon: 'hourglass-outline' },
    { id: 'time', label: 'Study Time', icon: 'time-outline' },
    { id: 'goals', label: 'Goals', icon: 'flag-outline' },
    { id: 'domains', label: 'Domains', icon: 'school-outline' },
  ];

  if (loading && !refreshing) {
    return (
      <AppShell title="Learning Progress">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Calculating Learning Progress from Local Data...
          </Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Learning Progress">
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Top Horizontal Tab Navigator */}
        <View style={[styles.navTabsTrack, { borderBottomColor: theme.colors.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navTabsContent}
          >
            {tabs.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.navTabBtn,
                    isSelected && [styles.navTabBtnActive, { borderBottomColor: theme.colors.primary }],
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Ionicons
                    name={tab.icon}
                    size={16}
                    color={isSelected ? theme.colors.primary : theme.colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.navTabLabel,
                      { color: isSelected ? theme.colors.primary : theme.colors.textSecondary },
                      isSelected && styles.navTabLabelActive,
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Content Body */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[theme.colors.primary]} />
          }
        >
          {error && (
            <View style={[styles.errorBox, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
              <Text style={{ color: '#DC2626', fontWeight: '600' }}>{error}</Text>
            </View>
          )}

          {/* =========================================================================
              TAB 1: OVERVIEW
              ========================================================================= */}
          {activeTab === 'overview' && (
            <View>
              {overall && <OverallProgressCard metrics={overall} />}

              {/* Today's Quick Snapshot */}
              {daily && (
                <View style={[styles.dailyCard, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}>
                  <View style={styles.dailyHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Ionicons name="sunny-outline" size={18} color="#F59E0B" />
                      <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Today's Snapshot</Text>
                    </View>
                    <Text style={[styles.dailyPercent, { color: theme.colors.primary }]}>{daily.progressPercentage}% Completed</Text>
                  </View>
                  <View style={styles.dailyGrid}>
                    <View style={styles.dailyStat}>
                      <Text style={[styles.statSub, { color: theme.colors.textSecondary }]}>Planned</Text>
                      <Text style={[styles.statMain, { color: theme.colors.textPrimary }]}>{formatMinutes(daily.plannedMinutes)}</Text>
                    </View>
                    <View style={styles.dailyStat}>
                      <Text style={[styles.statSub, { color: theme.colors.textSecondary }]}>Studied</Text>
                      <Text style={[styles.statMain, { color: '#10B981' }]}>{formatMinutes(daily.completedMinutes)}</Text>
                    </View>
                    <View style={styles.dailyStat}>
                      <Text style={[styles.statSub, { color: theme.colors.textSecondary }]}>Topics</Text>
                      <Text style={[styles.statMain, { color: theme.colors.textPrimary }]}>{daily.topicsCompleted}/{daily.topicsPlanned}</Text>
                    </View>
                    <View style={styles.dailyStat}>
                      <Text style={[styles.statSub, { color: theme.colors.textSecondary }]}>Sessions</Text>
                      <Text style={[styles.statMain, { color: theme.colors.textPrimary }]}>{daily.sessionsCount}</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Study Time Chart */}
              {studyTime && <StudyTimeChart studyTime={studyTime} formatMinutes={formatMinutes} />}

              {/* Streak Card */}
              {streak && <StreakCalendarCard streak={streak} />}

              {/* Course Comparison List (Section 33) */}
              {courseComparison.length > 0 && (
                <View style={[styles.cardContainer, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Course Comparison</Text>
                    <Text style={[styles.sectionSub, { color: theme.colors.textSecondary }]}>{courseComparison.length} Tracks</Text>
                  </View>
                  {courseComparison.map((item) => (
                    <View key={item.courseId} style={[styles.compRow, { borderBottomColor: theme.colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.compName, { color: theme.colors.textPrimary }]}>{item.courseName}</Text>
                        <Text style={[styles.compSub, { color: theme.colors.textSecondary }]}>
                          {item.completedTopics}/{item.totalTopics} topics • {formatMinutes(item.studyMinutes)}
                        </Text>
                      </View>
                      <View style={[styles.compBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
                        <Text style={[styles.compPercent, { color: theme.colors.primary }]}>{item.progressPercentage}%</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* =========================================================================
              TAB 2: COURSES
              ========================================================================= */}
          {activeTab === 'courses' && (
            <View>
              {/* Filter Chips */}
              <View style={styles.chipsRow}>
                {(['all', 'in_progress', 'completed', 'not_started'] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: courseFilter === f ? theme.colors.primary : theme.colors.surface,
                        borderColor: courseFilter === f ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => setCourseFilter(f)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: courseFilter === f ? '#FFFFFF' : theme.colors.textPrimary },
                      ]}
                    >
                      {f.replace('_', ' ').toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Courses List */}
              {courses.map((course) => (
                <CourseProgressCard
                  key={course.courseId}
                  course={course}
                  onPress={() => navigate('CourseProgressDetail', { courseId: course.courseId })}
                  formatMinutes={formatMinutes}
                />
              ))}
            </View>
          )}

          {/* =========================================================================
              TAB 3: COMPLETED ITEMS (Section 11)
              ========================================================================= */}
          {activeTab === 'completed' && (
            <View>
              <View style={[styles.headerBanner, { backgroundColor: '#D1FAE530', borderColor: '#10B981' }]}>
                <Ionicons name="checkmark-done-circle" size={24} color="#059669" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bannerTitle, { color: '#065F46' }]}>Completed Milestones</Text>
                  <Text style={[styles.bannerSub, { color: '#047857' }]}>
                    {completedItems.length} topics and achievements conquered on your voyage
                  </Text>
                </View>
              </View>

              {completedItems.map((item) => (
                <View
                  key={item.id}
                  style={[styles.completedRow, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}
                >
                  <View style={[styles.checkCircle, { backgroundColor: '#10B981' }]}>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                    <Text style={[styles.itemSub, { color: theme.colors.textSecondary }]}>
                      {item.courseName} {item.moduleTitle ? `→ ${item.moduleTitle}` : ''}
                    </Text>
                    <Text style={[styles.itemDate, { color: theme.colors.textSecondary }]}>
                      Completed: {item.completedAt ? item.completedAt.slice(0, 10) : 'Recent'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* =========================================================================
              TAB 4: REMAINING TOPICS (Section 12)
              ========================================================================= */}
          {activeTab === 'remaining' && (
            <View>
              {/* Recommended Next Topic Banner */}
              {recommendedNext && (
                <View style={[styles.recommendedBanner, { backgroundColor: `${theme.colors.primary}15`, borderColor: theme.colors.primary }]}>
                  <View style={styles.recIconWrap}>
                    <Ionicons name="compass" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recHeader, { color: theme.colors.primary }]}>RECOMMENDED NEXT MISSION</Text>
                    <Text style={[styles.recTitle, { color: theme.colors.textPrimary }]}>{recommendedNext.topicTitle}</Text>
                    <Text style={[styles.recSub, { color: theme.colors.textSecondary }]}>
                      {recommendedNext.courseName} → {recommendedNext.moduleTitle}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.remainingHeader}>
                <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                  Remaining Voyage Path ({remainingItems.length} Topics)
                </Text>
              </View>

              {remainingItems.map((item) => (
                <View
                  key={item.topicId}
                  style={[styles.remainingRow, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}
                >
                  <View
                    style={[
                      styles.circleStatus,
                      {
                        backgroundColor: item.isLocked ? '#9CA3AF20' : `${theme.colors.primary}20`,
                        borderColor: item.isLocked ? '#9CA3AF' : theme.colors.primary,
                      },
                    ]}
                  >
                    <Ionicons
                      name={item.isLocked ? 'lock-closed' : 'arrow-forward'}
                      size={14}
                      color={item.isLocked ? '#9CA3AF' : theme.colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: theme.colors.textPrimary }]}>{item.topicTitle}</Text>
                    <Text style={[styles.itemSub, { color: theme.colors.textSecondary }]}>
                      {item.courseName} → {item.moduleTitle}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.lockTag,
                      { backgroundColor: item.isLocked ? '#F3F4F6' : `${theme.colors.primary}15` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.lockTagText,
                        { color: item.isLocked ? '#6B7280' : theme.colors.primary },
                      ]}
                    >
                      {item.isLocked ? 'LOCKED' : 'AVAILABLE'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* =========================================================================
              TAB 5: STUDY TIME & ACTIVITY (Section 16, 17, 18, 19)
              ========================================================================= */}
          {activeTab === 'time' && (
            <View>
              {studyTime && <StudyTimeChart studyTime={studyTime} formatMinutes={formatMinutes} />}

              {/* Activity Timeline Section (Section 19) */}
              <View style={[styles.timelineCard, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>Learning Activity Timeline</Text>
                  {/* Timeline filters */}
                  <View style={styles.activityFilters}>
                    {(['all', 'today', 'week', 'month'] as const).map((af) => (
                      <TouchableOpacity
                        key={af}
                        style={[
                          styles.afBtn,
                          activityFilter === af && { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={() => onActivityFilterChange(af)}
                      >
                        <Text
                          style={[
                            styles.afBtnText,
                            { color: activityFilter === af ? '#FFFFFF' : theme.colors.textSecondary },
                          ]}
                        >
                          {af.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {activityTimeline.length === 0 ? (
                  <View style={styles.emptyActivity}>
                    <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                      No recent activities logged in this period.
                    </Text>
                  </View>
                ) : (
                  activityTimeline.map((item) => (
                    <View key={item.id} style={[styles.timelineRow, { borderBottomColor: theme.colors.border }]}>
                      <View style={[styles.actIcon, { backgroundColor: `${item.color}20` }]}>
                        <Ionicons name={item.icon as any} size={18} color={item.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.actTitle, { color: theme.colors.textPrimary }]}>{item.title}</Text>
                        <Text style={[styles.actSub, { color: theme.colors.textSecondary }]}>{item.subtitle}</Text>
                        <Text style={[styles.actDate, { color: theme.colors.textSecondary }]}>
                          {item.activityDate} • {item.createdAt ? item.createdAt.slice(11, 16) : ''}
                        </Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          {/* =========================================================================
              TAB 6: GOALS (Section 21 & 22)
              ========================================================================= */}
          {activeTab === 'goals' && (
            <View>
              {goals && <GoalAnalyticsCard goals={goals} />}
            </View>
          )}

          {/* =========================================================================
              TAB 7: DOMAINS & PRACTICE (Section 23, 24, 25, 26, 27)
              ========================================================================= */}
          {activeTab === 'domains' && (
            <View>
              <PracticeDomainCard
                activeDomain={activeDomain}
                domainData={domainData}
                onSelectDomain={onDomainChange}
              />
            </View>
          )}

          {/* Bottom spacing */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  navTabsTrack: {
    borderBottomWidth: 1,
  },
  navTabsContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  navTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navTabBtnActive: {
    borderBottomWidth: 2,
  },
  navTabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  navTabLabelActive: {
    fontWeight: '700',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  dailyCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  dailyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dailyStat: {
    alignItems: 'center',
  },
  statSub: {
    fontSize: 11,
    marginBottom: 2,
  },
  statMain: {
    fontSize: 15,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  itemDate: {
    fontSize: 10,
    marginTop: 4,
  },
  recommendedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  recIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  recTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  recSub: {
    fontSize: 12,
    marginTop: 2,
  },
  remainingHeader: {
    marginBottom: 10,
  },
  remainingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  circleStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lockTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timelineCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 12,
  },
  activityFilters: {
    flexDirection: 'row',
    gap: 4,
  },
  afBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  afBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  actIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  actSub: {
    fontSize: 12,
    marginTop: 2,
  },
  actDate: {
    fontSize: 10,
    marginTop: 4,
  },
  emptyActivity: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
  cardContainer: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  compRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  compName: {
    fontSize: 14,
    fontWeight: '600',
  },
  compSub: {
    fontSize: 12,
    marginTop: 2,
  },
  compBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
});
