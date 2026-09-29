import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { SyntaxStructureData } from '../../../models/TopicContent';

interface SyntaxStructureViewerProps {
  data: SyntaxStructureData;
}

export const SyntaxStructureViewer: React.FC<SyntaxStructureViewerProps> = ({ data }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="code-working-outline" size={18} color="#0284C7" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {data.title ? data.title.toUpperCase() : 'SYNTAX & CODE STRUCTURE'}
        </Text>
      </View>

      {/* Code Template Box */}
      <View style={[styles.templateBox, { backgroundColor: isDark ? '#020617' : '#0F172A' }]}>
        <View style={styles.macButtons}>
          <View style={[styles.macDot, { backgroundColor: '#EF4444' }]} />
          <View style={[styles.macDot, { backgroundColor: '#F59E0B' }]} />
          <View style={[styles.macDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.languageBadge}>
            {data.language ? data.language.toUpperCase() : 'SYNTAX TEMPLATE'}
          </Text>
        </View>
        <Text style={styles.templateCode}>{data.template}</Text>
      </View>

      {/* Breakdown of syntax tokens */}
      <Text style={[styles.breakdownHeader, { color: colors.textSecondary }]}>
        ANATOMY BREAKDOWN:
      </Text>

      <View style={styles.breakdownList}>
        {data.breakdown.map((item, idx) => (
          <View
            key={`stx-${idx}`}
            style={[
              styles.breakdownRow,
              { backgroundColor: isDark ? '#0F172A' : '#F1F5F9', borderColor: colors.border },
            ]}
          >
            <View style={styles.componentBadge}>
              <Text style={styles.componentText}>{item.component}</Text>
            </View>
            <Ionicons name="arrow-forward" size={14} color="#64748B" style={{ marginHorizontal: 6 }} />
            <Text style={[styles.explanationText, { color: colors.textPrimary }]}>
              {item.explanation}
            </Text>
          </View>
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
  templateBox: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  macButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  macDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  languageBadge: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginLeft: 6,
  },
  templateCode: {
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  breakdownHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  breakdownList: {
    gap: 6,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  componentBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  componentText: {
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  explanationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
});
