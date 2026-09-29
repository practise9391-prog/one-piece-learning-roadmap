import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectHealthStatus } from '../../models/Project';

interface ProjectHealthCardProps {
  health: ProjectHealthStatus;
}

export const ProjectHealthCard: React.FC<ProjectHealthCardProps> = ({ health }) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleInfo}>
          <Text style={styles.title}>Project Health & Implementation Status</Text>
          <Text style={styles.subtitle}>
            Active Milestone: <Text style={styles.milestoneText}>{health.current_milestone_title}</Text>
          </Text>
        </View>

        <View style={styles.progressCircle}>
          <Text style={styles.progressNum}>{health.overall_progress_pct}%</Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${health.overall_progress_pct}%` },
          ]}
        />
      </View>

      {/* Factual Metrics Grid */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <View style={styles.metricIconRow}>
            <Ionicons name="checkbox-outline" size={14} color="#38BDF8" />
            <Text style={styles.metricLabel}>Tasks</Text>
          </View>
          <Text style={styles.metricVal}>
            {health.tasks_completed} / {health.tasks_total}
          </Text>
          {health.tasks_blocked > 0 && (
            <Text style={styles.alertText}>{health.tasks_blocked} blocked</Text>
          )}
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricIconRow}>
            <Ionicons name="star-outline" size={14} color="#A855F7" />
            <Text style={styles.metricLabel}>Features</Text>
          </View>
          <Text style={styles.metricVal}>
            {health.features_completed} / {health.features_total}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricIconRow}>
            <Ionicons
              name="bug-outline"
              size={14}
              color={health.bugs_open > 0 ? '#EF4444' : '#10B981'}
            />
            <Text style={styles.metricLabel}>Bugs</Text>
          </View>
          <Text
            style={[
              styles.metricVal,
              { color: health.bugs_open > 0 ? '#EF4444' : '#10B981' },
            ]}
          >
            {health.bugs_open} open
          </Text>
          {health.bugs_critical > 0 && (
            <Text style={styles.alertText}>{health.bugs_critical} critical</Text>
          )}
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricIconRow}>
            <Ionicons name="flask-outline" size={14} color="#10B981" />
            <Text style={styles.metricLabel}>Tests</Text>
          </View>
          <Text style={styles.metricVal}>
            {health.tests_passed} / {health.tests_total}
          </Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricIconRow}>
            <Ionicons name="document-text-outline" size={14} color="#F59E0B" />
            <Text style={styles.metricLabel}>Docs</Text>
          </View>
          <Text style={styles.metricVal}>{health.documentation_completion_pct}%</Text>
        </View>

        <View style={styles.metricItem}>
          <View style={styles.metricIconRow}>
            <Ionicons name="calendar-outline" size={14} color="#64748B" />
            <Text style={styles.metricLabel}>Updated</Text>
          </View>
          <Text style={styles.metricVal}>{health.last_activity_date}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleInfo: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  milestoneText: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  progressCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
  },
  progressTrack: {
    height: 5,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 3,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricItem: {
    width: '31%',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1F5F9',
  },
  alertText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 2,
  },
});
