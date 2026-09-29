import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { BeforeVsAfterData } from '../../../models/TopicContent';

interface BeforeVsAfterViewerProps {
  data: BeforeVsAfterData;
}

export const BeforeVsAfterViewer: React.FC<BeforeVsAfterViewerProps> = ({ data }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="git-compare-outline" size={18} color="#EC4899" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>BEFORE VS AFTER ARCHITECTURE</Text>
      </View>

      {/* Without Concept (Before) */}
      <View style={[styles.comparisonBox, { backgroundColor: isDark ? '#1F1315' : '#FEF2F2', borderColor: '#FECACA' }]}>
        <View style={styles.boxHeaderRow}>
          <Ionicons name="close-circle" size={16} color="#DC2626" />
          <Text style={[styles.boxTitle, { color: '#B91C1C' }]}>
            {data.withoutConcept.title.toUpperCase()}
          </Text>
        </View>
        <View style={[styles.codeContainer, { backgroundColor: isDark ? '#020617' : '#FFFFFF' }]}>
          <Text style={[styles.codeContent, { color: '#EF4444' }]}>
            {data.withoutConcept.codeOrScenario}
          </Text>
        </View>
        <Text style={[styles.problemText, { color: '#991B1B' }]}>
          <Text style={{ fontWeight: '800' }}>Problem: </Text>
          {data.withoutConcept.problem}
        </Text>
      </View>

      {/* With Concept (After) */}
      <View style={[styles.comparisonBox, { backgroundColor: isDark ? '#0E2219' : '#F0FDF4', borderColor: '#BBF7D0' }]}>
        <View style={styles.boxHeaderRow}>
          <Ionicons name="checkmark-circle" size={16} color="#16A34A" />
          <Text style={[styles.boxTitle, { color: '#15803D' }]}>
            {data.withConcept.title.toUpperCase()}
          </Text>
        </View>
        <View style={[styles.codeContainer, { backgroundColor: isDark ? '#020617' : '#FFFFFF' }]}>
          <Text style={[styles.codeContent, { color: '#10B981' }]}>
            {data.withConcept.codeOrScenario}
          </Text>
        </View>
        <Text style={[styles.problemText, { color: '#166534' }]}>
          <Text style={{ fontWeight: '800' }}>Improved Solution: </Text>
          {data.withConcept.improvedSolution}
        </Text>
      </View>

      {/* Improvement explanation */}
      <View style={[styles.summaryBox, { backgroundColor: isDark ? '#0B132B' : '#F8FAFC', borderColor: colors.border }]}>
        <Ionicons name="trending-up-outline" size={16} color="#3B82F6" />
        <Text style={[styles.summaryText, { color: colors.textPrimary }]}>{data.explanation}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  comparisonBox: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  boxHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  boxTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  codeContainer: {
    borderRadius: Radius.sm,
    padding: Spacing.sm + 2,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  codeContent: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 17,
  },
  problemText: {
    fontSize: 12,
    lineHeight: 18,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
  },
  summaryText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
