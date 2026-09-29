import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OverallProgressMetrics } from '../../models/Analytics';
import { useTheme } from '../../theme/ThemeContext';

interface OverallProgressCardProps {
  metrics: OverallProgressMetrics;
}

export const OverallProgressCard: React.FC<OverallProgressCardProps> = ({ metrics }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={[styles.iconBox, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Ionicons name="compass" size={24} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>GRAND LINE VOYAGE</Text>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Overall Progress</Text>
          </View>
        </View>
        <View style={[styles.percentBadge, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.percentText}>{metrics.completionPercentage}%</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarTrack, { backgroundColor: `${theme.colors.primary}25` }]}>
        <View
          style={[
            styles.progressBarFill,
            {
              backgroundColor: theme.colors.primary,
              width: `${Math.min(100, Math.max(0, metrics.completionPercentage))}%`,
            },
          ]}
        />
      </View>

      {/* Key Metric Blocks */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: `${theme.colors.surface}80`, borderColor: theme.colors.border }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Courses</Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
            {metrics.coursesCompleted} <Text style={[styles.statTotal, { color: theme.colors.textSecondary }]}>/ {metrics.totalCourses}</Text>
          </Text>
          <Text style={[styles.statSub, { color: theme.colors.primary }]}>
            {metrics.coursesStarted} started
          </Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: `${theme.colors.surface}80`, borderColor: theme.colors.border }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Modules</Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
            {metrics.completedModules} <Text style={[styles.statTotal, { color: theme.colors.textSecondary }]}>/ {metrics.totalModules}</Text>
          </Text>
          <Text style={[styles.statSub, { color: '#F59E0B' }]}>
            {metrics.remainingModules} remaining
          </Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: `${theme.colors.surface}80`, borderColor: theme.colors.border }]}>
          <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>Topics</Text>
          <Text style={[styles.statValue, { color: theme.colors.textPrimary }]}>
            {metrics.completedTopics} <Text style={[styles.statTotal, { color: theme.colors.textSecondary }]}>/ {metrics.totalTopics}</Text>
          </Text>
          <Text style={[styles.statSub, { color: '#10B981' }]}>
            {metrics.remainingTopics} remaining
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  percentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  percentText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  progressBarTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  statTotal: {
    fontSize: 12,
    fontWeight: '500',
  },
  statSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
