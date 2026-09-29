import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudyTimeBreakdown } from '../../models/Analytics';
import { useTheme } from '../../theme/ThemeContext';

interface StudyTimeChartProps {
  studyTime: StudyTimeBreakdown;
  formatMinutes: (min: number) => string;
}

export const StudyTimeChart: React.FC<StudyTimeChartProps> = ({ studyTime, formatMinutes }) => {
  const { theme } = useTheme();

  // Find max minutes for relative height in 7-day chart
  const maxDayMin = Math.max(1, ...studyTime.byDayLast7Days.map((d) => d.minutes));

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}>
      {/* Title */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Study Time Analytics</Text>
        </View>
        <Text style={[styles.allTimeText, { color: theme.colors.primary }]}>
          {formatMinutes(studyTime.allTimeMinutes)} Total
        </Text>
      </View>

      {/* 4 Summary Metric Pills */}
      <View style={styles.pillsRow}>
        <View style={[styles.pill, { backgroundColor: `${theme.colors.surface}90`, borderColor: theme.colors.border }]}>
          <Text style={[styles.pillLabel, { color: theme.colors.textSecondary }]}>Today</Text>
          <Text style={[styles.pillVal, { color: theme.colors.textPrimary }]}>{formatMinutes(studyTime.todayMinutes)}</Text>
        </View>

        <View style={[styles.pill, { backgroundColor: `${theme.colors.surface}90`, borderColor: theme.colors.border }]}>
          <Text style={[styles.pillLabel, { color: theme.colors.textSecondary }]}>This Week</Text>
          <Text style={[styles.pillVal, { color: theme.colors.textPrimary }]}>{formatMinutes(studyTime.thisWeekMinutes)}</Text>
        </View>

        <View style={[styles.pill, { backgroundColor: `${theme.colors.surface}90`, borderColor: theme.colors.border }]}>
          <Text style={[styles.pillLabel, { color: theme.colors.textSecondary }]}>This Month</Text>
          <Text style={[styles.pillVal, { color: theme.colors.textPrimary }]}>{formatMinutes(studyTime.thisMonthMinutes)}</Text>
        </View>

        <View style={[styles.pill, { backgroundColor: `${theme.colors.surface}90`, borderColor: theme.colors.border }]}>
          <Text style={[styles.pillLabel, { color: theme.colors.textSecondary }]}>All Time</Text>
          <Text style={[styles.pillVal, { color: theme.colors.primary }]}>{formatMinutes(studyTime.allTimeMinutes)}</Text>
        </View>
      </View>

      {/* 7-Day Bar Chart */}
      <View style={styles.chartSection}>
        <Text style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>PAST 7 DAYS ACTIVITY</Text>
        <View style={styles.barsContainer}>
          {studyTime.byDayLast7Days.map((d, index) => {
            const heightPercent = Math.min(100, Math.max(8, Math.round((d.minutes / maxDayMin) * 100)));
            const isToday = index === studyTime.byDayLast7Days.length - 1;

            return (
              <View key={d.date} style={styles.barCol}>
                <Text style={[styles.barTimeText, { color: theme.colors.textSecondary }]}>
                  {d.minutes > 0 ? `${d.minutes}m` : '-'}
                </Text>
                <View style={[styles.barSlot, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: isToday ? theme.colors.secondary : theme.colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.dayName,
                    {
                      color: isToday ? theme.colors.secondary : theme.colors.textSecondary,
                      fontWeight: isToday ? '700' : '500',
                    },
                  ]}
                >
                  {d.dayName}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Course Distribution */}
      {studyTime.byCourse.length > 0 && (
        <View style={[styles.courseDistSection, { borderTopColor: theme.colors.border }]}>
          <Text style={[styles.chartSubtitle, { color: theme.colors.textSecondary }]}>STUDY TIME BY COURSE</Text>
          {studyTime.byCourse.slice(0, 5).map((c) => (
            <View key={c.courseId} style={styles.courseDistRow}>
              <View style={styles.courseDistInfo}>
                <Text style={[styles.distCourseName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                  {c.courseName}
                </Text>
                <Text style={[styles.distCourseTime, { color: theme.colors.textSecondary }]}>
                  {formatMinutes(c.minutes)} ({c.percentage}%)
                </Text>
              </View>
              <View style={[styles.miniTrack, { backgroundColor: `${theme.colors.primary}20` }]}>
                <View
                  style={[
                    styles.miniFill,
                    {
                      width: `${c.percentage}%`,
                      backgroundColor: theme.colors.primary,
                    },
                  ]}
                />
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
  allTimeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  pill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  pillLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  pillVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  chartSection: {
    marginBottom: 12,
  },
  chartSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTimeText: {
    fontSize: 9,
    marginBottom: 4,
  },
  barSlot: {
    width: 14,
    height: 80,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  dayName: {
    fontSize: 11,
    marginTop: 6,
  },
  courseDistSection: {
    paddingTop: 14,
    borderTopWidth: 1,
  },
  courseDistRow: {
    marginBottom: 10,
  },
  courseDistInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  distCourseName: {
    fontSize: 13,
    fontWeight: '600',
  },
  distCourseTime: {
    fontSize: 12,
  },
  miniTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 3,
  },
});
