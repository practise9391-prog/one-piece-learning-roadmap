import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { CheatSheetData } from '../../../models/TopicContent';

interface CheatSheetViewerProps {
  data: CheatSheetData;
}

export const CheatSheetViewer: React.FC<CheatSheetViewerProps> = ({ data }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={18} color="#059669" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>{data.title.toUpperCase()}</Text>
      </View>

      {/* Syntax Summary */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: '#059669' }]}>SYNTAX OVERVIEW</Text>
        {data.syntaxSummary.map((item, idx) => (
          <View key={`syn-${idx}`} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: '#059669' }]}>▸</Text>
            <Text style={[styles.bulletText, { color: colors.textPrimary }]}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Key Rules */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: '#2563EB' }]}>GOLDEN RULES</Text>
        {data.keyRules.map((item, idx) => (
          <View key={`rule-${idx}`} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: '#2563EB' }]}>✔</Text>
            <Text style={[styles.bulletText, { color: colors.textPrimary }]}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Common Pitfalls */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: '#DC2626' }]}>PITFALLS TO AVOID</Text>
        {data.commonPitfalls.map((item, idx) => (
          <View key={`pit-${idx}`} style={styles.bulletRow}>
            <Text style={[styles.bullet, { color: '#DC2626' }]}>✖</Text>
            <Text style={[styles.bulletText, { color: colors.textPrimary }]}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Pro Tips */}
      <View style={[styles.tipsBox, { backgroundColor: isDark ? '#1E293B' : '#FEF3C7' }]}>
        {data.quickTips.map((tip, idx) => (
          <Text key={`tip-${idx}`} style={[styles.tipText, { color: isDark ? colors.textPrimary : '#78350F' }]}>
            {tip}
          </Text>
        ))}
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
  section: {
    marginBottom: Spacing.md,
    gap: 4,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  bullet: {
    fontSize: 11,
    lineHeight: 18,
    fontWeight: '800',
  },
  bulletText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  tipsBox: {
    borderRadius: Radius.sm,
    padding: Spacing.sm + 4,
    gap: 4,
  },
  tipText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
  },
});
