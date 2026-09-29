import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { ComparisonTableData } from '../../../models/TopicContent';

interface ComparisonTableViewProps {
  data: ComparisonTableData;
}

export const ComparisonTableView: React.FC<ComparisonTableViewProps> = ({ data }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="swap-horizontal-outline" size={18} color="#6366F1" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {data.title.toUpperCase()}
        </Text>
      </View>

      {/* Comparison Table */}
      <View style={[styles.table, { borderColor: colors.border }]}>
        {/* Table Header */}
        <View style={[styles.tableHeader, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
          <Text style={[styles.colHeader, { flex: 1, color: colors.textSecondary }]}>Criterion</Text>
          <Text style={[styles.colHeader, { flex: 1.2, color: '#38BDF8' }]}>{data.conceptA}</Text>
          <Text style={[styles.colHeader, { flex: 1.2, color: '#A78BFA' }]}>{data.conceptB}</Text>
        </View>

        {/* Table Rows */}
        {data.criteria.map((row, idx) => (
          <View
            key={`row-${idx}`}
            style={[
              styles.tableRow,
              { borderTopColor: colors.border },
              idx % 2 === 1 && { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#FAFAFA' },
            ]}
          >
            <Text style={[styles.cellText, styles.criterionCell, { color: colors.textPrimary }]}>
              {row.criterion}
            </Text>
            <Text style={[styles.cellText, { color: colors.textSecondary }]}>{row.valA}</Text>
            <Text style={[styles.cellText, { color: colors.textSecondary }]}>{row.valB}</Text>
          </View>
        ))}
      </View>

      {/* Summary Box */}
      <View style={[styles.summaryBox, { backgroundColor: isDark ? '#172554' : '#EFF6FF', borderColor: '#93C5FD' }]}>
        <Ionicons name="bulb" size={16} color="#2563EB" />
        <Text style={[styles.summaryText, { color: isDark ? colors.textPrimary : '#1E40AF' }]}>
          <Text style={{ fontWeight: '800' }}>Rule of Thumb: </Text>
          {data.summary}
        </Text>
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
  table: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
  },
  cellText: {
    flex: 1.2,
    fontSize: 11,
    lineHeight: 16,
    paddingRight: 6,
  },
  criterionCell: {
    flex: 1,
    fontWeight: '700',
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
