import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../components/navigation/AppShell';
import { dashboardService, OverallProgressStats } from '../services/DashboardService';
import { Colors } from '../theme/colors';

export const StatisticsScreen: React.FC = () => {
  const [stats, setStats] = useState<OverallProgressStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await dashboardService.getOverallStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load statistics from SQLite:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
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
          {/* Main Progress Ring Card */}
          <View style={styles.heroAnalyticsCard}>
            <View style={styles.circleGauge}>
              <Text style={styles.gaugePercent}>{stats?.overallProgressPercentage || 0}%</Text>
              <Text style={styles.gaugeLabel}>COMPLETE</Text>
            </View>

            <View style={styles.heroTextCol}>
              <Text style={styles.heroCardTitle}>VOYAGE COMPLETION</Text>
              <Text style={styles.heroCardSub}>
                {stats?.completedModules || 0} of {stats?.totalModules || 0} modules conquered across the Grand Line.
              </Text>
              <View style={styles.timeTrackerNote}>
                <Ionicons name="time-outline" size={14} color={Colors.secondary} />
                <Text style={styles.timeTrackerText}>Time tracking coming soon.</Text>
              </View>
            </View>
          </View>

          {/* Metric Grid */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>MILESTONE TOTALS</Text>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="boat" size={20} color="#2563EB" />
              </View>
              <Text style={styles.metricVal}>
                {stats?.completedCourses || 0} / {stats?.totalCourses || 14}
              </Text>
              <Text style={styles.metricLbl}>Courses Mastered</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="checkmark-done" size={20} color="#D97706" />
              </View>
              <Text style={styles.metricVal}>
                {stats?.completedModules || 0} / {stats?.totalModules || 0}
              </Text>
              <Text style={styles.metricLbl}>Modules Conquered</Text>
            </View>
          </View>

          <View style={styles.gridRow}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="list" size={20} color="#16A34A" />
              </View>
              <Text style={styles.metricVal}>
                {stats?.completedTopics || 0} / {stats?.totalTopics || 0}
              </Text>
              <Text style={styles.metricLbl}>Topics Mastered</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIconBox, { backgroundColor: '#FAF5FF' }]}>
                <Ionicons name="journal" size={20} color="#9333EA" />
              </View>
              <Text style={styles.metricVal}>{stats?.totalNotes || 0}</Text>
              <Text style={styles.metricLbl}>Notes Documented</Text>
            </View>
          </View>

          {/* Technology Domains Overview */}
          <View style={[styles.sectionHeaderRow, { marginTop: 14 }]}>
            <Text style={styles.sectionTitle}>DISCIPLINE COVERAGE</Text>
          </View>

          <View style={styles.domainCard}>
            <View style={styles.domainRow}>
              <Ionicons name="code-working" size={18} color={Colors.primary} />
              <Text style={styles.domainTitle}>Core Programming</Text>
              <Text style={styles.domainBadge}>Python, JS, TS, Go</Text>
            </View>
            <View style={styles.domainRow}>
              <Ionicons name="terminal" size={18} color="#D97706" />
              <Text style={styles.domainTitle}>Systems & Infrastructure</Text>
              <Text style={styles.domainBadge}>Linux, Git, Docker</Text>
            </View>
            <View style={styles.domainRow}>
              <Ionicons name="server" size={18} color="#16A34A" />
              <Text style={styles.domainTitle}>Data & Algorithms</Text>
              <Text style={styles.domainBadge}>SQL, DSA</Text>
            </View>
            <View style={styles.domainRow}>
              <Ionicons name="phone-portrait" size={18} color="#2563EB" />
              <Text style={styles.domainTitle}>Frontend & Mobile</Text>
              <Text style={styles.domainBadge}>HTML/CSS, React Native</Text>
            </View>
          </View>
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
  heroAnalyticsCard: {
    backgroundColor: Colors.oceanDepths,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.25)',
  },
  circleGauge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    borderWidth: 3,
    borderColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gaugePercent: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  gaugeLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.5,
  },
  heroTextCol: {
    flex: 1,
  },
  heroCardTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  heroCardSub: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
    marginTop: 4,
  },
  timeTrackerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  timeTrackerText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '600',
    marginLeft: 5,
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
  gridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  metricLbl: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  domainCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  domainTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginLeft: 10,
  },
  domainBadge: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
});
