import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoalAnalyticsMetrics } from '../../models/Analytics';
import { useTheme } from '../../theme/ThemeContext';

interface GoalAnalyticsCardProps {
  goals: GoalAnalyticsMetrics;
}

export const GoalAnalyticsCard: React.FC<GoalAnalyticsCardProps> = ({ goals }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}>
      {/* Title */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="flag-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Goal Completion Analytics</Text>
        </View>
        <Text style={[styles.percentBadge, { color: theme.colors.primary }]}>
          {goals.completionPercentage}% Achieved
        </Text>
      </View>

      {/* 4 Status Counters */}
      <View style={styles.countersRow}>
        <View style={[styles.counterBox, { backgroundColor: '#D1FAE530', borderColor: '#10B981' }]}>
          <Text style={[styles.counterVal, { color: '#059669' }]}>{goals.completed}</Text>
          <Text style={[styles.counterLabel, { color: '#065F46' }]}>COMPLETED</Text>
        </View>

        <View style={[styles.counterBox, { backgroundColor: `${theme.colors.primary}20`, borderColor: theme.colors.primary }]}>
          <Text style={[styles.counterVal, { color: theme.colors.primary }]}>{goals.inProgress}</Text>
          <Text style={[styles.counterLabel, { color: theme.colors.primary }]}>IN PROGRESS</Text>
        </View>

        <View style={[styles.counterBox, { backgroundColor: '#FEE2E230', borderColor: '#EF4444' }]}>
          <Text style={[styles.counterVal, { color: '#DC2626' }]}>{goals.missed}</Text>
          <Text style={[styles.counterLabel, { color: '#991B1B' }]}>MISSED</Text>
        </View>
      </View>

      {/* Period Breakdown */}
      <View style={[styles.periodSection, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>GOALS BY TIMEFRAME</Text>
        <View style={styles.periodsRow}>
          <View style={styles.periodItem}>
            <Text style={[styles.periodLabel, { color: theme.colors.textSecondary }]}>Daily Goals</Text>
            <Text style={[styles.periodVal, { color: theme.colors.textPrimary }]}>
              {goals.byPeriod.daily.completed} / {goals.byPeriod.daily.total}
            </Text>
          </View>
          <View style={styles.periodItem}>
            <Text style={[styles.periodLabel, { color: theme.colors.textSecondary }]}>Weekly Goals</Text>
            <Text style={[styles.periodVal, { color: theme.colors.textPrimary }]}>
              {goals.byPeriod.weekly.completed} / {goals.byPeriod.weekly.total}
            </Text>
          </View>
          <View style={styles.periodItem}>
            <Text style={[styles.periodLabel, { color: theme.colors.textSecondary }]}>Monthly Goals</Text>
            <Text style={[styles.periodVal, { color: theme.colors.textPrimary }]}>
              {goals.byPeriod.monthly.completed} / {goals.byPeriod.monthly.total}
            </Text>
          </View>
        </View>
      </View>

      {/* Goal History Preview */}
      {goals.history.length > 0 && (
        <View style={[styles.historySection, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>RECENT GOALS TRACKED</Text>
          {goals.history.slice(0, 4).map((g) => (
            <View key={g.id} style={[styles.goalRow, { borderBottomColor: theme.colors.border }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.goalTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>{g.title}</Text>
                <Text style={[styles.goalSub, { color: theme.colors.textSecondary }]}>
                  {g.period} • Target: {g.targetValue} {g.unit} (Actual: {g.currentValue})
                </Text>
              </View>
              <View
                style={[
                  styles.statusTag,
                  {
                    backgroundColor:
                      g.status === 'COMPLETED'
                        ? '#D1FAE5'
                        : g.status === 'MISSED'
                        ? '#FEE2E2'
                        : `${theme.colors.primary}20`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusTagText,
                    {
                      color:
                        g.status === 'COMPLETED'
                          ? '#059669'
                          : g.status === 'MISSED'
                          ? '#DC2626'
                          : theme.colors.primary,
                    },
                  ]}
                >
                  {g.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
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
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  percentBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  countersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  counterBox: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  counterVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  counterLabel: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  periodSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  periodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodItem: {
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  periodVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  historySection: {
    paddingTop: 12,
    borderTopWidth: 1,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  goalSub: {
    fontSize: 11,
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
