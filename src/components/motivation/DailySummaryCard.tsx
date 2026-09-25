import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailySummary } from '../../models/Motivation';

interface DailySummaryCardProps {
  summary: DailySummary;
}

export const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ summary }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>TODAY'S ACTIVITY SUMMARY</Text>

      <View style={styles.grid}>
        <View style={styles.metric}>
          <Text style={styles.num}>{summary.topicsCompleted}</Text>
          <Text style={styles.lbl}>TOPICS DONE</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <Text style={styles.num}>{summary.practiceSolved}</Text>
          <Text style={styles.lbl}>CHALLENGES</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <Text style={styles.num}>{summary.modulesCompleted}</Text>
          <Text style={styles.lbl}>MODULES</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <Text style={styles.num}>{summary.notesCreated}</Text>
          <Text style={styles.lbl}>NOTES</Text>
        </View>
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
  heading: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: '#F1F5F9',
  },
  num: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  lbl: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 2,
  },
});
