import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { FlowchartNode } from '../../models/Debugger';

interface FlowchartViewerProps {
  nodes: FlowchartNode[];
  activeLineNumber?: number;
}

export const FlowchartViewer: React.FC<FlowchartViewerProps> = ({
  nodes,
  activeLineNumber,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="git-network-outline" size={15} color="#38BDF8" />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            SYNCHRONIZED FLOWCHART EXECUTION GRAPH
          </Text>
        </View>
        <Text style={[styles.activeLineText, { color: '#10B981' }]}>
          {activeLineNumber ? `Active Node: Line ${activeLineNumber}` : 'Flowchart Synced'}
        </Text>
      </View>

      {/* Nodes Diagram */}
      <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.flowScroll}>
        {nodes.map((node, idx) => {
          const isActive = node.type !== 'START' && node.type !== 'END' && node.line === activeLineNumber;
          const isDecision = node.type === 'DECISION' || node.type === 'LOOP';

          return (
            <React.Fragment key={node.id}>
              {/* Flowchart Node Card */}
              <View
                style={[
                  styles.nodeCard,
                  isDecision && styles.decisionNode,
                  node.type === 'START' && styles.startEndNode,
                  node.type === 'END' && styles.startEndNode,
                  {
                    backgroundColor: isActive
                      ? 'rgba(16, 185, 129, 0.2)'
                      : isDark
                      ? '#1E293B'
                      : '#FFFFFF',
                    borderColor: isActive
                      ? '#10B981'
                      : isDecision
                      ? '#F59E0B'
                      : colors.border,
                  },
                ]}
              >
                <View style={styles.nodeContentRow}>
                  {isActive && (
                    <Ionicons name="arrow-forward-circle" size={15} color="#10B981" />
                  )}
                  <View style={styles.labelCol}>
                    <Text
                      style={[
                        styles.nodeLabel,
                        {
                          color: isActive ? '#10B981' : colors.textPrimary,
                          fontWeight: isActive ? '800' : '600',
                        },
                      ]}
                    >
                      {node.label}
                    </Text>
                    {node.type !== 'START' && node.type !== 'END' && (
                      <Text style={styles.nodeSubtext}>Line {node.line} • {node.type}</Text>
                    )}
                  </View>
                  {isActive && (
                    <View style={styles.activePill}>
                      <Text style={styles.activePillText}>ACTIVE</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Connecting Flow Arrow */}
              {idx < nodes.length - 1 && (
                <View style={styles.arrowRow}>
                  <View style={[styles.arrowLine, { backgroundColor: isActive ? '#10B981' : colors.border }]} />
                  <Ionicons
                    name="arrow-down"
                    size={14}
                    color={isActive ? '#10B981' : colors.textSecondary}
                  />
                </View>
              )}
            </React.Fragment>
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
    maxHeight: 380,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  activeLineText: {
    fontSize: 11,
    fontWeight: '700',
  },
  flowScroll: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  nodeCard: {
    width: '92%',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1.5,
    marginVertical: 2,
  },
  startEndNode: {
    borderRadius: 20,
    width: '50%',
    alignItems: 'center',
  },
  decisionNode: {
    borderLeftWidth: 4,
  },
  nodeContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelCol: {
    flex: 1,
  },
  nodeLabel: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  nodeSubtext: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  activePill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  arrowRow: {
    alignItems: 'center',
    height: 18,
    justifyContent: 'center',
  },
  arrowLine: {
    width: 2,
    height: 6,
  },
});
