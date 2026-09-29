import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { CallStackFrame, RecursionNode } from '../../models/Debugger';

interface CallStackViewerProps {
  callStack: CallStackFrame[];
  recursionTree?: RecursionNode;
}

export const CallStackViewer: React.FC<CallStackViewerProps> = ({
  callStack,
  recursionTree,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
      {/* 1. CALL STACK HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="layers-outline" size={15} color="#EC4899" />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            ACTIVE CALL STACK ({callStack.length} {callStack.length === 1 ? 'FRAME' : 'FRAMES'})
          </Text>
        </View>
        <Text style={[styles.activeFrameIndicator, { color: '#EC4899' }]}>
          Top of Stack
        </Text>
      </View>

      {/* Stack Frames (LIFO order: top frame is first) */}
      <View style={styles.stackList}>
        {[...callStack].reverse().map((frame, idx) => {
          const isCurrent = idx === 0;
          return (
            <View
              key={frame.id || idx}
              style={[
                styles.frameCard,
                {
                  backgroundColor: isCurrent ? (isDark ? '#1E293B' : '#FFFFFF') : (isDark ? '#0B132B' : '#F1F5F9'),
                  borderColor: isCurrent ? '#EC4899' : colors.border,
                },
              ]}
            >
              <View style={styles.frameHeader}>
                <View style={styles.fnNameRow}>
                  {isCurrent && (
                    <Ionicons name="arrow-forward" size={13} color="#EC4899" />
                  )}
                  <Text style={[styles.fnName, { color: isCurrent ? '#EC4899' : colors.textPrimary }]}>
                    {frame.functionName}
                    <Text style={styles.argsText}>
                      ({Object.entries(frame.arguments || {}).map(([k, v]) => `${k}=${v}`).join(', ')})
                    </Text>
                  </Text>
                </View>
                <View style={styles.frameMeta}>
                  <Text style={styles.frameLineText}>Line {frame.line}</Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>CURRENT</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Local Variables in Frame */}
              {Object.keys(frame.localVariables || {}).length > 0 && (
                <View style={styles.localVarsRow}>
                  {Object.entries(frame.localVariables).map(([k, v]) => (
                    <View key={k} style={styles.localVarChip}>
                      <Text style={styles.varKey}>{k}:</Text>
                      <Text style={styles.varVal}>{JSON.stringify(v)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* 2. RECURSION TREE VISUALIZATION (Section 19) */}
      {recursionTree && (
        <View style={[styles.recursionSection, { borderTopColor: colors.border }]}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="git-network-outline" size={14} color="#8B5CF6" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              RECURSION TREE
            </Text>
          </View>

          <View style={[styles.recTreeBox, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: colors.border }]}>
            {/* Render recursive depth nodes */}
            {callStack.map((fr, fIdx) => (
              <View key={`rec-${fIdx}`} style={[styles.recNodeRow, { paddingLeft: fIdx * 16 }]}>
                <Ionicons name="return-down-forward" size={12} color="#8B5CF6" />
                <View style={[styles.recNodePill, fIdx === callStack.length - 1 && styles.recActivePill]}>
                  <Text style={styles.recNodeText}>
                    {fr.functionName}({Object.values(fr.arguments || {}).join(', ')})
                  </Text>
                  {fIdx === callStack.length - 1 && (
                    <Text style={styles.recActiveTag}>active frame</Text>
                  )}
                </View>
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
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activeFrameIndicator: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  stackList: {
    gap: 6,
  },
  frameCard: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1.5,
    gap: 4,
  },
  frameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fnNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  fnName: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  argsText: {
    fontSize: 12,
    color: '#94A3B8',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  frameMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  frameLineText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  currentBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentBadgeText: {
    color: '#EC4899',
    fontSize: 9.5,
    fontWeight: '800',
  },
  localVarsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 4,
  },
  localVarChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  varKey: {
    fontSize: 11,
    color: '#EC4899',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  varVal: {
    fontSize: 11,
    color: '#F8FAFC',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  recursionSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  recTreeBox: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  recNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recNodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  recActivePill: {
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  recNodeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#A78BFA',
    fontFamily: 'monospace',
  },
  recActiveTag: {
    fontSize: 9,
    color: '#10B981',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});
