import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeeklyLearningSummary } from '../../models/Motivation';
import { Colors } from '../../theme/colors';

interface WeeklySummaryChartProps {
  summary: WeeklyLearningSummary;
}

export const WeeklySummaryChart: React.FC<WeeklySummaryChartProps> = ({ summary }) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.heading}>WEEKLY ROUTINE</Text>
          <Text style={styles.subheading}>
            {summary.activeDaysCount} of {summary.weeklyTargetDays} Target Active Days
          </Text>
        </View>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {summary.activeDaysCount >= summary.weeklyTargetDays ? 'TARGET MET ✓' : 'IN STRIDE'}
          </Text>
        </View>
      </View>

      <View style={styles.daysRow}>
        {summary.days.map((d, i) => (
          <View key={i} style={styles.dayCol}>
            <View
              style={[
                styles.dot,
                d.hasActivity && styles.dotActive,
              ]}
            >
              {d.hasActivity && (
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              )}
            </View>
            <Text style={[styles.dayLabel, d.hasActivity && styles.dayLabelActive]}>
              {d.dayLabel}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  heading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dotActive: {
    backgroundColor: Colors.secondary,
    borderColor: '#D97706',
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  dayLabelActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
});
