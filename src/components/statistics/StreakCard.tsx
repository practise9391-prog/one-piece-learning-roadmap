import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreakMetrics } from '../../repositories/ActivityRepository';
import { Colors } from '../../theme/colors';

interface StreakCardProps {
  metrics: StreakMetrics;
}

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const StreakCard: React.FC<StreakCardProps> = ({ metrics }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.flameCircle}>
          <Ionicons name="flame" size={26} color="#EA580C" />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.headline}>LEARNING STREAK</Text>
          <Text style={styles.streakCount}>
            {metrics.currentStreak} {metrics.currentStreak === 1 ? 'DAY' : 'DAYS'}
          </Text>
        </View>
        <View style={styles.badgeBox}>
          <Ionicons name="trophy" size={14} color={Colors.secondary} />
          <Text style={styles.longestStreakText}>Best: {metrics.longestStreak}d</Text>
        </View>
      </View>

      <Text style={styles.subtext}>
        {metrics.currentStreak > 0
          ? 'Flame ignited! Keep learning daily to power your voyage.'
          : 'Complete a topic or write notes today to reignite your streak.'}
      </Text>

      {/* Week Day Checkboxes */}
      <View style={styles.weekContainer}>
        {WEEK_LABELS.map((dayLabel, index) => {
          const isActive = metrics.activeWeekDays[index];
          return (
            <View key={dayLabel} style={styles.dayCol}>
              <View style={[styles.dayCircle, isActive && styles.dayCircleActive]}>
                <Ionicons
                  name={isActive ? 'checkmark' : 'ellipse'}
                  size={isActive ? 12 : 6}
                  color={isActive ? '#FFFFFF' : '#94A3B8'}
                />
              </View>
              <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>
                {dayLabel}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.totalDaysText}>
          Total Active Days: <Text style={styles.boldWhite}>{metrics.totalLearningDays}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.3)',
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  flameCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(234, 88, 12, 0.4)',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  headline: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F97316',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  streakCount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  badgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  longestStreakText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.secondary,
    marginLeft: 4,
  },
  subtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 14,
    lineHeight: 16,
  },
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  dayCol: {
    alignItems: 'center',
    flex: 1,
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayCircleActive: {
    backgroundColor: '#EA580C',
  },
  dayLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  dayLabelActive: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  footerRow: {
    alignItems: 'flex-end',
  },
  totalDaysText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  boldWhite: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
