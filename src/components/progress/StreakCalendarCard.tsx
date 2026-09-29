import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StreakAnalyticsData } from '../../models/Analytics';
import { useTheme } from '../../theme/ThemeContext';

interface StreakCalendarCardProps {
  streak: StreakAnalyticsData;
}

export const StreakCalendarCard: React.FC<StreakCalendarCardProps> = ({ streak }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={[styles.flameCircle, { backgroundColor: '#EF444420' }]}>
            <Ionicons name="flame" size={24} color="#EF4444" />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Learning Streak</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Consecutive Study Days</Text>
          </View>
        </View>

        <View style={styles.streakCounters}>
          <View style={styles.counterBox}>
            <Text style={[styles.counterNumber, { color: '#EF4444' }]}>{streak.currentStreak}</Text>
            <Text style={[styles.counterLabel, { color: theme.colors.textSecondary }]}>CURRENT</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <View style={styles.counterBox}>
            <Text style={[styles.counterNumber, { color: theme.colors.primary }]}>{streak.longestStreak}</Text>
            <Text style={[styles.counterLabel, { color: theme.colors.textSecondary }]}>LONGEST</Text>
          </View>
        </View>
      </View>

      {/* Week Calendar Row (Mon - Sun) */}
      <View style={styles.weekCalendar}>
        {streak.activeDaysLast7.map((day) => (
          <View key={day.date} style={styles.dayCol}>
            <Text style={[styles.dayName, { color: theme.colors.textSecondary }]}>{day.dayName}</Text>
            <View
              style={[
                styles.checkCircle,
                {
                  backgroundColor: day.isActive ? '#10B981' : `${theme.colors.border}60`,
                  borderColor: day.isActive ? '#10B981' : theme.colors.border,
                },
              ]}
            >
              <Ionicons
                name={day.isActive ? 'checkmark' : 'ellipse'}
                size={day.isActive ? 14 : 6}
                color={day.isActive ? '#FFFFFF' : theme.colors.textSecondary}
              />
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          {streak.totalLearningDays} total active learning days recorded
        </Text>
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
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flameCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  streakCounters: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterBox: {
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  counterLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 24,
  },
  weekCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginBottom: 8,
  },
  dayCol: {
    alignItems: 'center',
    gap: 6,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
  },
});
