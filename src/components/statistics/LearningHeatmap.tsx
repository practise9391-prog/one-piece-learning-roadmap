import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MonthHeatmap } from '../../services/StatisticsService';
import { Colors } from '../../theme/colors';

interface LearningHeatmapProps {
  heatmap: MonthHeatmap;
}

const DOW_HEADERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const LearningHeatmap: React.FC<LearningHeatmapProps> = ({ heatmap }) => {
  const getCellColor = (level: 0 | 1 | 2 | 3) => {
    switch (level) {
      case 3:
        return '#F59E0B'; // Fiery Gold
      case 2:
        return '#10B981'; // Vibrant Emerald
      case 1:
        return '#059669'; // Soft Emerald
      default:
        return '#1E293B'; // Inactive slate
    }
  };

  // Generate leading empty cells for day offset
  const leadingOffsetCells = Array.from({ length: heatmap.firstDayOffset });

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.monthTitle}>
          {heatmap.monthName} {heatmap.year}
        </Text>
        <Text style={styles.activitySummaryText}>Activity Heatmap</Text>
      </View>

      {/* DOW headers */}
      <View style={styles.dowRow}>
        {DOW_HEADERS.map((h, i) => (
          <Text key={i} style={styles.dowHeader}>
            {h}
          </Text>
        ))}
      </View>

      {/* Grid of days */}
      <View style={styles.grid}>
        {leadingOffsetCells.map((_, i) => (
          <View key={`lead_${i}`} style={styles.cellEmpty} />
        ))}
        {heatmap.days.map((day) => {
          const bg = getCellColor(day.intensityLevel);
          return (
            <View
              key={day.dateString}
              style={[
                styles.cell,
                { backgroundColor: bg },
                day.isToday && styles.cellToday,
              ]}
            >
              <Text
                style={[
                  styles.dayNum,
                  day.intensityLevel > 0 ? styles.dayNumActive : styles.dayNumMuted,
                ]}
              >
                {day.dayNumber}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <Text style={styles.legendLabel}>Less</Text>
        <View style={[styles.legendBox, { backgroundColor: '#1E293B' }]} />
        <View style={[styles.legendBox, { backgroundColor: '#059669' }]} />
        <View style={[styles.legendBox, { backgroundColor: '#10B981' }]} />
        <View style={[styles.legendBox, { backgroundColor: '#F59E0B' }]} />
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0A1128',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.25)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  activitySummaryText: {
    fontSize: 11,
    color: Colors.secondary,
    fontWeight: '700',
  },
  dowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dowHeader: {
    width: 32,
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cellEmpty: {
    width: 32,
    height: 32,
    margin: 2,
  },
  cell: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  dayNum: {
    fontSize: 10,
    fontWeight: '700',
  },
  dayNumActive: {
    color: '#FFFFFF',
  },
  dayNumMuted: {
    color: '#475569',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: '#64748B',
    marginHorizontal: 3,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});
