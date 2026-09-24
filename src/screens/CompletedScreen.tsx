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
import { useAppNavigation } from '../navigation/NavigationContext';
import { dashboardService, CompletedModuleItem } from '../services/DashboardService';
import { Course } from '../models/Course';
import { formatDate } from '../utils/dateUtils';
import { Colors } from '../theme/colors';

export const CompletedScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  const [completedCourses, setCompletedCourses] = useState<Course[]>([]);
  const [completedModules, setCompletedModules] = useState<CompletedModuleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadCompletedData = useCallback(async () => {
    try {
      const [courses, modules] = await Promise.all([
        dashboardService.getCompletedCourses(),
        dashboardService.getRecentlyCompletedModules(25),
      ]);
      setCompletedCourses(courses);
      setCompletedModules(modules);
    } catch (err) {
      console.error('Failed to load completed items from SQLite:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCompletedData();
  }, [loadCompletedData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCompletedData();
  };

  const hasAnyCompleted = completedCourses.length > 0 || completedModules.length > 0;

  return (
    <AppShell title="COMPLETED">
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching Completed Milestones...</Text>
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
          {/* Section 1: Completed Courses */}
          <View style={styles.sectionHeaderRow}>
            <View style={styles.headerTitleGroup}>
              <Ionicons name="trophy" size={18} color={Colors.secondary} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>COMPLETED COURSES ({completedCourses.length})</Text>
            </View>
          </View>

          {completedCourses.length > 0 ? (
            completedCourses.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.completedCourseCard}
                activeOpacity={0.8}
                onPress={() => navigate('CourseCompletion', { courseId: c.id, replay: true })}
              >
                <View style={styles.courseEmblemCircle}>
                  <Ionicons name="ribbon" size={24} color={Colors.secondary} />
                </View>
                <View style={styles.courseInfoCol}>
                  <Text style={styles.courseNameText}>{c.name}</Text>
                  <Text style={styles.courseModulesDone}>
                    All {c.total_modules} Modules Mastered
                  </Text>
                  {c.completed_at && (
                    <Text style={styles.completedDateText}>
                      Finished on {formatDate(c.completed_at)}
                    </Text>
                  )}
                </View>
                <View style={styles.badge100}>
                  <Text style={styles.badge100Text}>100% ✓</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.miniEmptyCard}>
              <Text style={styles.miniEmptyText}>No courses completed to 100% yet.</Text>
            </View>
          )}

          {/* Section 2: Recently Completed Modules */}
          <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
            <View style={styles.headerTitleGroup}>
              <Ionicons name="checkmark-done" size={18} color={Colors.success} style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>
                RECENTLY COMPLETED MODULES ({completedModules.length})
              </Text>
            </View>
          </View>

          {completedModules.length > 0 ? (
            completedModules.map((m) => (
              <TouchableOpacity
                key={m.moduleId}
                style={styles.moduleItemCard}
                activeOpacity={0.8}
                onPress={() =>
                  navigate('ModuleDetails', {
                    courseId: m.courseId,
                    moduleId: m.moduleId,
                  })
                }
              >
                <View style={styles.checkmarkCircle}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
                <View style={styles.moduleInfoCol}>
                  <Text style={styles.moduleCourseLabel}>{m.courseName}</Text>
                  <Text style={styles.moduleTitleText}>{m.moduleTitle}</Text>
                  {m.completedAt && (
                    <Text style={styles.moduleDateText}>
                      Completed {formatDate(m.completedAt)}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.miniEmptyCard}>
              <Text style={styles.miniEmptyText}>No modules completed yet.</Text>
            </View>
          )}

          {!hasAnyCompleted && (
            <View style={styles.grandEmptyContainer}>
              <View style={styles.grandIconCircle}>
                <Ionicons name="trophy-outline" size={44} color={Colors.secondary} />
              </View>
              <Text style={styles.grandEmptyTitle}>No Milestones Completed Yet</Text>
              <Text style={styles.grandEmptySub}>
                Your journey starts here. Complete your first module topic checklist to unlock completed achievements.
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  completedCourseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 179, 0, 0.4)',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  courseEmblemCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  courseInfoCol: {
    flex: 1,
  },
  courseNameText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  courseModulesDone: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  completedDateText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  badge100: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  badge100Text: {
    fontSize: 12,
    fontWeight: '900',
    color: '#15803D',
  },
  moduleItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  checkmarkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  moduleInfoCol: {
    flex: 1,
  },
  moduleCourseLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  moduleTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  moduleDateText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  miniEmptyCard: {
    padding: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  miniEmptyText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  grandEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    marginTop: 10,
  },
  grandIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  grandEmptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  grandEmptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
