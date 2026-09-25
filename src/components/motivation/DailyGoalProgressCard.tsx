import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface DailyGoalProgressCardProps {
  completedCount: number;
  totalCount: number;
  percentage: number;
  streakDays: number;
  isAllCompleted: boolean;
}

export const DailyGoalProgressCard: React.FC<DailyGoalProgressCardProps> = ({
  completedCount,
  totalCount,
  percentage,
  streakDays,
  isAllCompleted,
}) => {
  return (
    <View style={[styles.card, isAllCompleted && styles.completedCard]}>
      <View style={styles.topRow}>
        <View style={styles.badgeRow}>
          <View style={[styles.streakBadge, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="flame" size={16} color="#D97706" />
            <Text style={styles.streakText}>{streakDays} Day Streak</Text>
          </View>
          {isAllCompleted ? (
            <View style={styles.completePill}>
              <Text style={styles.completePillText}>100% CONQUERED</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.progressCounter}>
          {completedCount} / {totalCount} Goals
        </Text>
      </View>

      <Text style={styles.title}>
        {isAllCompleted ? '🎉 Daily Journey Complete!' : "Today's Voyage Progress"}
      </Text>

      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${percentage}%` },
            isAllCompleted && { backgroundColor: Colors.success },
          ]}
        />
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.subtext}>
          {isAllCompleted
            ? 'Excellent sailing! You kept the momentum alive today.'
            : `${totalCount - completedCount} more to complete today's adventure.`}
        </Text>
        <Text style={styles.pctText}>{percentage}%</Text>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  completedCard: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  completePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  completePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.4,
  },
  progressCounter: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
  },
  track: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  subtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  pctText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
});
