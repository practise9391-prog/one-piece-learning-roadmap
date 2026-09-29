import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { DataStructureState } from '../../models/Debugger';

interface DataStructureVisualizerProps {
  dataStructureState?: DataStructureState;
}

export const DataStructureVisualizer: React.FC<DataStructureVisualizerProps> = ({
  dataStructureState,
}) => {
  const { colors, isDark } = useTheme();

  if (!dataStructureState || !dataStructureState.items || dataStructureState.items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
        <View style={styles.header}>
          <Ionicons name="git-commit-outline" size={15} color="#10B981" />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            DATA STRUCTURE & ALGORITHM LAB
          </Text>
        </View>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No array or list data structure is currently active in the execution trace.
        </Text>
      </View>
    );
  }

  const { kind, name, items, pointers } = dataStructureState;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="bar-chart-outline" size={15} color="#10B981" />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {kind === 'BINARY_SEARCH' ? 'BINARY SEARCH BOUNDARY TRACKER' : `${kind} VISUALIZATION: '${name}'`}
          </Text>
        </View>
        <Text style={[styles.itemCountBadge, { color: '#10B981' }]}>
          {items.length} Elements
        </Text>
      </View>

      {/* Pointers Legend */}
      {pointers && Object.keys(pointers).length > 0 && (
        <View style={styles.pointersLegendRow}>
          {Object.entries(pointers).map(([pName, pIdx]) => (
            <View key={pName} style={styles.pointerPill}>
              <Text
                style={[
                  styles.pointerTagText,
                  pName === 'low'
                    ? { color: '#38BDF8' }
                    : pName === 'mid'
                    ? { color: '#10B981' }
                    : pName === 'high'
                    ? { color: '#F59E0B' }
                    : { color: '#EC4899' },
                ]}
              >
                {pName}: index {pIdx}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Array Element Blocks with Pointers */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.arrayScroll}>
        {items.map((val, idx) => {
          // Identify pointers pointing to this index
          const activePtrs = pointers
            ? Object.entries(pointers).filter(([_, pIdx]) => pIdx === idx).map(([p]) => p)
            : [];

          const isMid = activePtrs.includes('mid');
          const isLow = activePtrs.includes('low');
          const isHigh = activePtrs.includes('high');

          return (
            <View key={idx} style={styles.elementColumn}>
              {/* Pointer Labels above cell */}
              <View style={styles.pointersAbove}>
                {activePtrs.map((ptr) => (
                  <View
                    key={ptr}
                    style={[
                      styles.ptrBadge,
                      ptr === 'mid'
                        ? styles.midBadge
                        : ptr === 'low'
                        ? styles.lowBadge
                        : styles.highBadge,
                    ]}
                  >
                    <Text style={styles.ptrBadgeText}>{ptr}</Text>
                    <Ionicons name="arrow-down" size={10} color="#FFFFFF" />
                  </View>
                ))}
              </View>

              {/* Element Cell */}
              <View
                style={[
                  styles.cellBox,
                  {
                    backgroundColor: isMid
                      ? 'rgba(16, 185, 129, 0.25)'
                      : isLow || isHigh
                      ? 'rgba(56, 189, 248, 0.15)'
                      : isDark
                      ? '#1E293B'
                      : '#FFFFFF',
                    borderColor: isMid
                      ? '#10B981'
                      : isLow
                      ? '#38BDF8'
                      : isHigh
                      ? '#F59E0B'
                      : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cellValue,
                    {
                      color: isMid ? '#10B981' : isDark ? colors.textPrimary : '#0F172A',
                      fontWeight: isMid ? '800' : '600',
                    },
                  ]}
                >
                  {JSON.stringify(val)}
                </Text>
              </View>

              {/* Index Number */}
              <Text style={styles.indexLabel}>[{idx}]</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginVertical: 6,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  itemCountBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  pointersLegendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pointerPill: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pointerTagText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  arrayScroll: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  elementColumn: {
    alignItems: 'center',
    gap: 4,
  },
  pointersAbove: {
    height: 36,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 2,
  },
  ptrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  midBadge: {
    backgroundColor: '#10B981',
  },
  lowBadge: {
    backgroundColor: '#0284C7',
  },
  highBadge: {
    backgroundColor: '#D97706',
  },
  ptrBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cellBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellValue: {
    fontSize: 14,
    fontFamily: 'monospace',
  },
  indexLabel: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'monospace',
  },
});
