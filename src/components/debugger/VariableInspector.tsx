import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { VariableSnapshot } from '../../models/Debugger';

interface VariableInspectorProps {
  variables: Record<string, VariableSnapshot>;
  memory?: Record<string, any>;
}

export const VariableInspector: React.FC<VariableInspectorProps> = ({
  variables,
  memory = {},
}) => {
  const { colors, isDark } = useTheme();
  const entries = Object.entries(variables);

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
      {/* Active Variables Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="hardware-chip-outline" size={15} color="#6366F1" />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            ACTIVE VARIABLES & SCOPE
          </Text>
        </View>
        <Text style={[styles.badgeCount, { color: colors.textSecondary }]}>
          {entries.length} in scope
        </Text>
      </View>

      {/* Variables List */}
      {entries.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No variables in active scope yet. Step through code to initialize.
          </Text>
        </View>
      ) : (
        <View style={styles.varGrid}>
          {entries.map(([name, snapshot]) => {
            const isUpdated = snapshot.isUpdated;
            const isCreated = snapshot.isCreated;

            return (
              <View
                key={name}
                style={[
                  styles.varCard,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                    borderColor: isUpdated ? '#38BDF8' : isCreated ? '#10B981' : colors.border,
                  },
                ]}
              >
                {/* Variable Name and Status Badge */}
                <View style={styles.varTopRow}>
                  <Text style={[styles.varName, { color: '#6366F1' }]}>{name}</Text>
                  <View style={styles.statusBadges}>
                    <Text style={styles.typeBadge}>{snapshot.type}</Text>
                    {isUpdated && (
                      <View style={styles.updatedBadge}>
                        <Text style={styles.updatedBadgeText}>UPDATED</Text>
                      </View>
                    )}
                    {isCreated && (
                      <View style={styles.createdBadge}>
                        <Text style={styles.createdBadgeText}>NEW</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Value Transition */}
                {isUpdated && snapshot.previousValue !== undefined ? (
                  <View style={styles.updateRow}>
                    <Text style={[styles.oldValText, { color: colors.textSecondary }]}>
                      {JSON.stringify(snapshot.previousValue)}
                    </Text>
                    <Ionicons name="arrow-forward" size={12} color="#38BDF8" />
                    <Text style={[styles.newValText, { color: '#38BDF8' }]}>
                      {JSON.stringify(snapshot.value)}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.valRow}>
                    <Text style={[styles.varValue, { color: colors.textPrimary }]}>
                      {JSON.stringify(snapshot.value)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Memory / Heap State */}
      {Object.keys(memory).length > 0 && (
        <View style={[styles.memorySection, { borderTopColor: colors.border }]}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="server-outline" size={14} color="#10B981" />
            <Text style={[styles.memoryTitle, { color: colors.textSecondary }]}>
              MEMORY / HEAP REFERENCES
            </Text>
          </View>
          <View style={styles.memoryGrid}>
            {Object.entries(memory).map(([key, val]) => (
              <View key={key} style={[styles.memoryItem, { borderColor: colors.border }]}>
                <Text style={[styles.memKey, { color: '#10B981' }]}>{key} →</Text>
                <Text style={[styles.memVal, { color: colors.textPrimary }]}>
                  {JSON.stringify(val)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginVertical: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badgeCount: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyBox: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  varGrid: {
    gap: 8,
  },
  varCard: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  varTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  varName: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statusBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typeBadge: {
    fontSize: 10,
    color: '#94A3B8',
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  updatedBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  updatedBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#38BDF8',
  },
  createdBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  createdBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#10B981',
  },
  valRow: {
    paddingTop: 2,
  },
  varValue: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 2,
  },
  oldValText: {
    fontSize: 12,
    textDecorationLine: 'line-through',
    fontFamily: 'monospace',
  },
  newValText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  memorySection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  memoryTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  memoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  memoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  memKey: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  memVal: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
});
