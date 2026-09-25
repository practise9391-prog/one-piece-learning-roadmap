import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressDataPoint } from '../../services/StatisticsService';
import { Colors } from '../../theme/colors';

interface ProgressOverTimeChartProps {
  hasEnoughData: boolean;
  dataPoints: ProgressDataPoint[];
}

export const ProgressOverTimeChart: React.FC<ProgressOverTimeChartProps> = ({
  hasEnoughData,
  dataPoints,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Ionicons name="trending-up" size={18} color={Colors.secondary} style={{ marginRight: 6 }} />
        <Text style={styles.cardTitle}>PROGRESS OVER TIME</Text>
      </View>

      {!hasEnoughData || dataPoints.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bar-chart-outline" size={36} color="#64748B" />
          <Text style={styles.emptyTitle}>Not enough history yet</Text>
          <Text style={styles.emptySub}>
            Complete modules on different days to build your progress growth curve.
          </Text>
        </View>
      ) : (
        <View style={styles.chartContainer}>
          <View style={styles.barsRow}>
            {dataPoints.map((pt, i) => (
              <View key={i} style={styles.barCol}>
                <Text style={styles.barPctLabel}>{pt.percentage}%</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${Math.max(8, pt.percentage)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.dateLabel}>{pt.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    paddingHorizontal: 16,
  },
  chartContainer: {
    paddingVertical: 8,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 140,
    paddingTop: 16,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 14,
    height: 90,
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginVertical: 4,
  },
  barFill: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 7,
  },
  barPctLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
  },
  dateLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
});
