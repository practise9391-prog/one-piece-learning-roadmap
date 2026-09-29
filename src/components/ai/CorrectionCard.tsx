import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StructuredCorrection } from '../../models/AIAssistant';

interface CorrectionCardProps {
  correction: StructuredCorrection;
}

export const CorrectionCard: React.FC<CorrectionCardProps> = ({ correction }) => {
  return (
    <View style={styles.card}>
      <View style={styles.badgeHeader}>
        <Ionicons name="sparkles" size={15} color="#10B981" />
        <Text style={styles.headerTitle}>Friendly Polish & Tip</Text>
      </View>

      {/* Original Sentence */}
      <View style={styles.rowBox}>
        <Text style={styles.rowLabel}>YOUR SENTENCE</Text>
        <Text style={styles.originalText}>{correction.original_sentence}</Text>
      </View>

      {/* Improved / Better Sentence */}
      <View style={[styles.rowBox, styles.betterBox]}>
        <Text style={styles.betterLabel}>MORE NATURAL WAY</Text>
        <Text style={styles.betterText}>{correction.better_sentence}</Text>
      </View>

      {/* Reason / Why */}
      <View style={styles.reasonBox}>
        <Text style={styles.reasonLabel}>WHY?</Text>
        <Text style={styles.reasonText}>{correction.reason}</Text>
      </View>

      {/* Grammar points tags */}
      {correction.grammar_points && correction.grammar_points.length > 0 && (
        <View style={styles.tagsRow}>
          {correction.grammar_points.map((pt, idx) => (
            <View key={`pt_${idx}`} style={styles.tagPill}>
              <Text style={styles.tagPillText}>{pt}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  badgeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 0.3,
  },
  rowBox: {
    marginBottom: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 7,
    borderRadius: 6,
  },
  betterBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  rowLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  betterLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  originalText: {
    fontSize: 13,
    color: '#CBD5E1',
    fontStyle: 'italic',
  },
  betterText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  reasonBox: {
    marginTop: 4,
  },
  reasonLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F59E0B',
    marginBottom: 1,
  },
  reasonText: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 8,
  },
  tagPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagPillText: {
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: '600',
  },
});
