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
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import { AnalyticsService } from '../../services/AnalyticsService';
import { CourseDetailAnalytics, ModuleProgressDetail } from '../../models/Analytics';

interface CourseDetailAnalyticsScreenProps {
  courseId?: string;
}

export const CourseDetailAnalyticsScreen: React.FC<CourseDetailAnalyticsScreenProps> = ({
  courseId: propCourseId,
}) => {
  const { navigate, goBack, params } = useAppNavigation();
  const { theme } = useTheme();
  const analyticsService = AnalyticsService.getInstance();

  const courseId = propCourseId || params?.courseId || 'python';

  const [data, setData] = useState<CourseDetailAnalytics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const loadCourseAnalytics = useCallback(async () => {
    try {
      const result = await analyticsService.getCourseDetailAnalytics(courseId);
      setData(result);
      // Auto-expand the first in-progress or available module
      if (result?.modules) {
        const activeMod = result.modules.find(
          (m) => m.status === 'IN_PROGRESS' || m.status === 'AVAILABLE'
        ) || result.modules[0];
        if (activeMod) {
          setExpandedModules(new Set([activeMod.moduleId]));
        }
      }
    } catch (err) {
      console.error('Failed to load course detail analytics:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourseAnalytics();
  }, [loadCourseAnalytics]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCourseAnalytics();
  };

  const toggleModule = (modId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(modId)) {
        next.delete(modId);
      } else {
        next.add(modId);
      }
      return next;
    });
  };

  const formatMinutes = (totalMinutes: number): string => {
    if (!totalMinutes || totalMinutes <= 0) return '0 min';
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { text: 'COMPLETED', bg: '#D1FAE5', color: '#065F46', icon: 'checkmark-circle' };
      case 'IN_PROGRESS':
        return { text: 'IN PROGRESS', bg: '#FEF3C7', color: '#B45309', icon: 'play-circle' };
      case 'AVAILABLE':
        return { text: 'AVAILABLE', bg: '#DBEAFE', color: '#1D4ED8', icon: 'ellipse-outline' };
      default:
        return { text: 'LOCKED', bg: '#F1F5F9', color: '#64748B', icon: 'lock-closed' };
    }
  };

  if (loading && !refreshing) {
    return (
      <AppShell title="Course Analytics">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading course analytics...
          </Text>
        </View>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell title="Course Analytics">
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
          <Text style={[styles.emptyText, { color: theme.colors.textPrimary }]}>
            Course analytics not found
          </Text>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => goBack()}
          >
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </AppShell>
    );
  }

  const { course, modules } = data;
  const courseBadge = getStatusBadge(course.status);

  return (
    <AppShell title={course.courseName}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Navigation Breadcrumb */}
        <TouchableOpacity
          style={styles.breadcrumb}
          onPress={() => goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={18} color={theme.colors.primary} />
          <Text style={[styles.breadcrumbText, { color: theme.colors.primary }]}>
            Back to Progress Overview
          </Text>
        </TouchableOpacity>

        {/* 1. COURSE HERO SUMMARY CARD */}
        <View style={[styles.card, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}>
          <View style={styles.headerRow}>
            <View style={styles.courseIdentity}>
              <View style={[styles.iconWrap, { backgroundColor: `${theme.colors.primary}15` }]}>
                <Text style={styles.iconText}>{course.icon || '📖'}</Text>
              </View>
              <View style={styles.titleCol}>
                <Text style={[styles.courseTitle, { color: theme.colors.textPrimary }]}>
                  {course.courseName}
                </Text>
                <Text style={[styles.courseCategory, { color: theme.colors.textSecondary }]}>
                  {course.theme ? `${course.theme.toUpperCase()} TRACK` : 'GRAND LINE TRACK'}
                </Text>
              </View>
            </View>

            <View style={[styles.badge, { backgroundColor: courseBadge.bg }]}>
              <Text style={[styles.badgeText, { color: courseBadge.color }]}>
                {courseBadge.text}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressRow}>
            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${course.progressPercentage}%`,
                    backgroundColor: course.status === 'COMPLETED' ? '#10B981' : theme.colors.primary,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressPct, { color: theme.colors.primary }]}>
              {course.progressPercentage}%
            </Text>
          </View>

          {/* Metrics Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="bookmark-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.statVal, { color: theme.colors.textPrimary }]}>
                {course.completedTopics} / {course.totalTopics}
              </Text>
              <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>Topics Done</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="layers-outline" size={18} color="#059669" />
              <Text style={[styles.statVal, { color: theme.colors.textPrimary }]}>
                {course.completedModules} / {course.totalModules}
              </Text>
              <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>Modules Done</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="time-outline" size={18} color="#D97706" />
              <Text style={[styles.statVal, { color: theme.colors.textPrimary }]}>
                {formatMinutes(course.studyMinutes)}
              </Text>
              <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>Study Time</Text>
            </View>

            <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
              <Ionicons name="play-outline" size={18} color="#7C3AED" />
              <Text style={[styles.statVal, { color: theme.colors.textPrimary }]}>
                {course.sessionsCount}
              </Text>
              <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>Sessions</Text>
            </View>
          </View>

          {/* Date Information */}
          <View style={styles.dateInfoRow}>
            {course.firstStartedDate && (
              <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                Started: {course.firstStartedDate}
              </Text>
            )}
            {course.lastStudiedDate && (
              <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
                Last Studied: {course.lastStudiedDate}
              </Text>
            )}
          </View>

          {/* Quick Action Navigation */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: theme.colors.primary }]}
              onPress={() => navigate('CourseRoadmap', { courseId: course.courseId })}
            >
              <Ionicons name="map-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.outlineBtnText, { color: theme.colors.primary }]}>
                Roadmap View
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.solidBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => navigate('FocusMode', { courseId: course.courseId })}
            >
              <Ionicons name="timer-outline" size={16} color="#FFFFFF" />
              <Text style={styles.solidBtnText}>Focus Study</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. MODULE DRILLDOWN SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
            Module Breakdown ({modules.length} Modules)
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
            Tap module to view topics and status
          </Text>
        </View>

        {modules.map((mod: ModuleProgressDetail, index: number) => {
          const isExpanded = expandedModules.has(mod.moduleId);
          const modBadge = getStatusBadge(mod.status);

          return (
            <View
              key={mod.moduleId}
              style={[
                styles.moduleCard,
                {
                  backgroundColor: theme.colors.surfaceCard,
                  borderColor: theme.colors.border,
                  opacity: mod.status === 'LOCKED' ? 0.75 : 1,
                },
              ]}
            >
              {/* Module Header */}
              <TouchableOpacity
                style={styles.moduleHeader}
                onPress={() => toggleModule(mod.moduleId)}
                activeOpacity={0.8}
              >
                <View style={styles.moduleTopRow}>
                  <View style={styles.moduleOrderCol}>
                    <Text style={[styles.moduleOrder, { color: theme.colors.textSecondary }]}>
                      MODULE {index + 1}
                    </Text>
                    <Text style={[styles.moduleTitleText, { color: theme.colors.textPrimary }]}>
                      {mod.title}
                    </Text>
                  </View>

                  <View style={[styles.badge, { backgroundColor: modBadge.bg }]}>
                    <Text style={[styles.badgeText, { color: modBadge.color }]}>
                      {modBadge.text}
                    </Text>
                  </View>
                </View>

                {/* Module Progress Bar */}
                <View style={styles.moduleProgressRow}>
                  <View style={styles.moduleBarTrack}>
                    <View
                      style={[
                        styles.moduleBarFill,
                        {
                          width: `${mod.progressPercentage}%`,
                          backgroundColor: mod.isCompleted ? '#10B981' : theme.colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.moduleRatio, { color: theme.colors.textSecondary }]}>
                    {mod.completedTopics}/{mod.totalTopics} topics ({mod.progressPercentage}%)
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={theme.colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>

              {/* Topics List (Accordion Body) */}
              {isExpanded && (
                <View style={[styles.topicsContainer, { borderTopColor: theme.colors.border }]}>
                  {mod.topics.map((top, tIdx) => (
                    <View
                      key={top.topicId}
                      style={[
                        styles.topicRow,
                        {
                          borderBottomColor: tIdx < mod.topics.length - 1 ? theme.colors.border : 'transparent',
                        },
                      ]}
                    >
                      <View style={styles.topicLeft}>
                        <Ionicons
                          name={
                            top.isCompleted
                              ? 'checkmark-circle'
                              : top.isLocked
                              ? 'lock-closed'
                              : 'ellipse-outline'
                          }
                          size={18}
                          color={
                            top.isCompleted
                              ? '#10B981'
                              : top.isLocked
                              ? '#94A3B8'
                              : theme.colors.primary
                          }
                          style={styles.topicIcon}
                        />
                        <View style={styles.topicInfoCol}>
                          <Text
                            style={[
                              styles.topicTitle,
                              {
                                color: top.isCompleted
                                  ? theme.colors.textSecondary
                                  : theme.colors.textPrimary,
                                textDecorationLine: top.isCompleted ? 'line-through' : 'none',
                              },
                            ]}
                          >
                            {top.title}
                          </Text>
                          {top.completedAt && (
                            <Text style={[styles.topicSubText, { color: '#059669' }]}>
                              Completed {top.completedAt.split('T')[0]}
                            </Text>
                          )}
                          {top.hasPracticeQuestions && (
                            <View style={styles.practiceTag}>
                              <Ionicons name="code-slash" size={10} color="#D97706" />
                              <Text style={styles.practiceTagText}>Practice Available</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {!top.isLocked && (
                        <TouchableOpacity
                          style={[
                            styles.topicActionBtn,
                            {
                              backgroundColor: top.isCompleted
                                ? `${theme.colors.primary}10`
                                : theme.colors.primary,
                            },
                          ]}
                          onPress={() =>
                            navigate('FocusMode', {
                              courseId: course.courseId,
                              moduleId: mod.moduleId,
                              topic: top.title,
                            })
                          }
                        >
                          <Ionicons
                            name="play"
                            size={12}
                            color={top.isCompleted ? theme.colors.primary : '#FFFFFF'}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* 3. RECENT ACTIVITY LIST */}
        {data.recentActivity && data.recentActivity.length > 0 && (
          <View style={styles.activitySection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Recent Activity in this Course
            </Text>
            <View
              style={[
                styles.activityCard,
                { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border },
              ]}
            >
              {data.recentActivity.map((act, aIdx) => (
                <View
                  key={act.id}
                  style={[
                    styles.activityRow,
                    {
                      borderBottomColor:
                        aIdx < data.recentActivity.length - 1 ? theme.colors.border : 'transparent',
                    },
                  ]}
                >
                  <Ionicons name="flash-outline" size={14} color={theme.colors.primary} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={[styles.activityText, { color: theme.colors.textPrimary }]}>
                      {act.type.replace(/_/g, ' ')}
                    </Text>
                    <Text style={[styles.activityDate, { color: theme.colors.textSecondary }]}>
                      {act.date}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  backBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  breadcrumbText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  courseIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  titleCol: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  courseCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPct: {
    fontSize: 14,
    fontWeight: '700',
    width: 42,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  statLbl: {
    fontSize: 11,
    marginTop: 2,
  },
  dateInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  dateText: {
    fontSize: 11,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  outlineBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  solidBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  solidBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  moduleCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  moduleHeader: {
    padding: 14,
  },
  moduleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  moduleOrderCol: {
    flex: 1,
    marginRight: 8,
  },
  moduleOrder: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  moduleTitleText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  moduleProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moduleBarTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  moduleBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  moduleRatio: {
    fontSize: 11,
  },
  topicsContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  topicLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  topicIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  topicInfoCol: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  topicSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  practiceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  practiceTagText: {
    fontSize: 10,
    color: '#B45309',
    fontWeight: '600',
  },
  topicActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activitySection: {
    marginTop: 16,
  },
  activityCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  activityText: {
    fontSize: 13,
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 11,
    marginTop: 2,
  },
});
