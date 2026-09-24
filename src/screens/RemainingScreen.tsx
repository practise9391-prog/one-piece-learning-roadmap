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
import { ProgressBar } from '../components/ProgressBar';
import { useAppNavigation } from '../navigation/NavigationContext';
import { dashboardService, RemainingCourseItem } from '../services/DashboardService';
import { Colors } from '../theme/colors';

export const RemainingScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  const [remainingCourses, setRemainingCourses] = useState<RemainingCourseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadRemaining = useCallback(async () => {
    try {
      const data = await dashboardService.getRemainingCourses();
      setRemainingCourses(data);
    } catch (err) {
      console.error('Failed to query remaining courses from SQLite:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRemaining();
  }, [loadRemaining]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRemaining();
  };

  const totalRemainingModules = remainingCourses.reduce((sum, item) => sum + item.remainingModules, 0);

  return (
    <AppShell title="REMAINING">
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Calculating Remaining Voyage Distance...</Text>
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
          {/* Summary Banner */}
          <View style={styles.summaryBanner}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryIconCircle}>
                <Ionicons name="hourglass" size={24} color={Colors.secondary} />
              </View>
              <View style={styles.summaryTextCol}>
                <Text style={styles.summaryTitle}>UNCONQUERED HORIZON</Text>
                <Text style={styles.summaryCount}>
                  {totalRemainingModules} Modules Remaining Across {remainingCourses.length} Islands
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>REMAINING COURSES</Text>
          </View>

          {remainingCourses.length > 0 ? (
            remainingCourses.map((item) => (
              <TouchableOpacity
                key={item.course.id}
                style={styles.remainingCard}
                activeOpacity={0.8}
                onPress={() => navigate('CourseRoadmap', { courseId: item.course.id })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.emblemBox}>
                    <Ionicons name="boat-outline" size={20} color={Colors.primary} />
                  </View>
                  <View style={styles.titleCol}>
                    <Text style={styles.courseName}>{item.course.name}</Text>
                    <Text style={styles.remainingCountText}>
                      {item.remainingModules} modules remaining
                    </Text>
                  </View>
                  <View style={styles.progressPill}>
                    <Text style={styles.progressPillText}>
                      {item.completedModules} / {item.totalModules}
                    </Text>
                  </View>
                </View>

                <View style={styles.progressSection}>
                  <ProgressBar
                    percentage={item.course.progress_percentage}
                    height={6}
                    color={Colors.primary}
                  />
                  <View style={styles.progressFooter}>
                    <Text style={styles.progressPercentText}>
                      {Math.round(item.course.progress_percentage)}% Conquered
                    </Text>
                    <Text style={styles.tapToOpenText}>Tap to open roadmap →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.allCompleteContainer}>
              <Ionicons name="trophy" size={54} color={Colors.secondary} />
              <Text style={styles.allCompleteTitle}>Everything is Complete! 🎉</Text>
              <Text style={styles.allCompleteSub}>
                You have mastered every course and module on the Grand Line!
              </Text>
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
  summaryBanner: {
    backgroundColor: Colors.oceanDepths,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.25)',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 1,
  },
  summaryCount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  remainingCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emblemBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleCol: {
    flex: 1,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  remainingCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginTop: 1,
  },
  progressPill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  progressPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  progressSection: {
    marginTop: 2,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tapToOpenText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  allCompleteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 54,
    paddingHorizontal: 24,
  },
  allCompleteTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  allCompleteSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
