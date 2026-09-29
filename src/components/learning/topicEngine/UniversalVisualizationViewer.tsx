import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { UniversalVisualizationConfig } from '../../../models/TopicContent';

interface UniversalVisualizationViewerProps {
  config: UniversalVisualizationConfig;
}

export const UniversalVisualizationViewer: React.FC<UniversalVisualizationViewerProps> = ({
  config,
}) => {
  const { colors, isDark } = useTheme();

  // Array state
  const [arrayElements, setArrayElements] = useState<number[]>(
    Array.isArray(config.data?.elements) ? config.data.elements : [10, 20, 30, 40, 50]
  );
  const [activePointerIndex, setActivePointerIndex] = useState<number>(0);

  // Stack state
  const [stackElements, setStackElements] = useState<number[]>([10, 20, 30]);

  // Queue state
  const [queueElements, setQueueElements] = useState<number[]>([10, 20, 30]);

  // Recursion state
  const [recursionFrames, setRecursionFrames] = useState<string[]>([
    'factorial(4)',
    'factorial(3)',
    'factorial(2)',
    'factorial(1) -> return 1',
  ]);

  // Status message
  const [actionMessage, setActionMessage] = useState<string>(
    config.explanation || 'Interactive visual lab initialized. Tap operations below:'
  );

  // Array operations
  const handlePointerStep = () => {
    setActivePointerIndex((prev) => (prev + 1) % arrayElements.length);
    setActionMessage(`Pointer advanced to Index ${(activePointerIndex + 1) % arrayElements.length}. Value: ${arrayElements[(activePointerIndex + 1) % arrayElements.length]}`);
  };

  const handleArrayInsert = () => {
    const newVal = Math.floor(Math.random() * 90) + 10;
    setArrayElements((prev) => [...prev, newVal]);
    setActionMessage(`Inserted element [${newVal}] at the end of array.`);
  };

  const handleArrayReset = () => {
    setArrayElements([10, 20, 30, 40, 50]);
    setActivePointerIndex(0);
    setActionMessage('Array reset to default state.');
  };

  // Stack operations
  const handleStackPush = () => {
    if (stackElements.length >= 6) {
      setActionMessage('Stack Overflow! Maximum demonstration capacity reached.');
      return;
    }
    const newVal = (stackElements.length + 1) * 10;
    setStackElements((prev) => [newVal, ...prev]);
    setActionMessage(`Pushed [${newVal}] onto TOP of stack.`);
  };

  const handleStackPop = () => {
    if (stackElements.length === 0) {
      setActionMessage('Stack Underflow! Stack is currently empty.');
      return;
    }
    const popped = stackElements[0];
    setStackElements((prev) => prev.slice(1));
    setActionMessage(`Popped [${popped}] from TOP of stack.`);
  };

  // Queue operations
  const handleQueueEnqueue = () => {
    if (queueElements.length >= 6) {
      setActionMessage('Queue full! Dequeue items before enqueuing new ones.');
      return;
    }
    const newVal = (queueElements.length + 1) * 10;
    setQueueElements((prev) => [newVal, ...prev]);
    setActionMessage(`Enqueued [${newVal}] at REAR of queue.`);
  };

  const handleQueueDequeue = () => {
    if (queueElements.length === 0) {
      setActionMessage('Queue empty! No items to dequeue.');
      return;
    }
    const dequeued = queueElements[0];
    setQueueElements((prev) => prev.slice(1));
    setActionMessage(`Dequeued [${dequeued}] from FRONT of queue.`);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color="#8B5CF6" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {config.title ? config.title.toUpperCase() : `INTERACTIVE ${config.type.toUpperCase()} VISUALIZATION`}
        </Text>
      </View>

      {/* Visual Canvas Area */}
      <View style={[styles.canvas, { backgroundColor: isDark ? '#020617' : '#0F172A' }]}>
        {/* 1. ARRAY VISUALIZATION */}
        {config.type === 'array' && (
          <View style={styles.arrayContainer}>
            <Text style={styles.canvasSublabel}>CONTIGUOUS MEMORY INDICES & VALUES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.arrayRow}>
              {arrayElements.map((val, idx) => {
                const isPointed = idx === activePointerIndex;
                return (
                  <TouchableOpacity
                    key={`arr-${idx}`}
                    onPress={() => {
                      setActivePointerIndex(idx);
                      setActionMessage(`Selected Index ${idx}: Value = ${val}`);
                    }}
                    style={[styles.arrayCell, isPointed && styles.arrayCellActive]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.cellIndex, isPointed && styles.cellIndexActive]}>[{idx}]</Text>
                    <View style={[styles.cellBox, isPointed && styles.cellBoxActive]}>
                      <Text style={[styles.cellVal, isPointed && styles.cellValActive]}>{val}</Text>
                    </View>
                    {isPointed && (
                      <View style={styles.pointerBadge}>
                        <Ionicons name="arrow-up" size={12} color="#10B981" />
                        <Text style={styles.pointerText}>PTR</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 2. STACK VISUALIZATION */}
        {config.type === 'stack' && (
          <View style={styles.stackContainer}>
            <Text style={styles.canvasSublabel}>STACK LIFO MEMORY (LAST IN, FIRST OUT)</Text>
            <View style={styles.stackBucket}>
              {stackElements.map((val, idx) => (
                <View key={`stk-${idx}`} style={[styles.stackPlate, idx === 0 && styles.stackPlateTop]}>
                  {idx === 0 && <Text style={styles.topPointerLabel}>TOP ➔</Text>}
                  <Text style={styles.stackVal}>[ {val} ]</Text>
                </View>
              ))}
              {stackElements.length === 0 && (
                <Text style={styles.emptyStackText}>(Empty Stack)</Text>
              )}
            </View>
          </View>
        )}

        {/* 3. QUEUE VISUALIZATION */}
        {config.type === 'queue' && (
          <View style={styles.queueContainer}>
            <Text style={styles.canvasSublabel}>QUEUE FIFO (FIRST IN, FIRST OUT)</Text>
            <View style={styles.queueRow}>
              <Text style={styles.queueEndLabel}>FRONT ➔</Text>
              {queueElements.map((val, idx) => (
                <View key={`q-${idx}`} style={styles.queueItem}>
                  <Text style={styles.queueVal}>[{val}]</Text>
                </View>
              ))}
              <Text style={styles.queueEndLabel}>⮜ REAR</Text>
            </View>
          </View>
        )}

        {/* 4. RECURSION / CALL STACK VISUALIZATION */}
        {config.type === 'recursion' && (
          <View style={styles.recursionContainer}>
            <Text style={styles.canvasSublabel}>ACTIVE EXECUTION CALL STACK FRAMES</Text>
            <View style={styles.recursionList}>
              {recursionFrames.map((frame, idx) => (
                <View key={`rec-${idx}`} style={styles.recursionFrame}>
                  <Ionicons name="layers-outline" size={14} color="#38BDF8" />
                  <Text style={styles.recursionFrameText}>{frame}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 5. DEFAULT / TREE / GRAPH / ARCHITECTURE */}
        {config.type !== 'array' && config.type !== 'stack' && config.type !== 'queue' && config.type !== 'recursion' && (
          <View style={styles.archContainer}>
            <Text style={styles.canvasSublabel}>INTERACTIVE TOPOLOGY MAP</Text>
            <View style={styles.archNodeRow}>
              <View style={styles.archNode}>
                <Ionicons name="phone-portrait-outline" size={16} color="#38BDF8" />
                <Text style={styles.archNodeText}>Client</Text>
              </View>
              <Ionicons name="arrow-forward" size={14} color="#64748B" />
              <View style={styles.archNode}>
                <Ionicons name="git-network-outline" size={16} color="#A78BFA" />
                <Text style={styles.archNodeText}>Gateway</Text>
              </View>
              <Ionicons name="arrow-forward" size={14} color="#64748B" />
              <View style={styles.archNode}>
                <Ionicons name="server-outline" size={16} color="#34D399" />
                <Text style={styles.archNodeText}>Backend</Text>
              </View>
              <Ionicons name="arrow-forward" size={14} color="#64748B" />
              <View style={styles.archNode}>
                <Ionicons name="server" size={16} color="#FBBF24" />
                <Text style={styles.archNodeText}>Database</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Action Status Feedback */}
      <View style={[styles.statusBox, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
        <Ionicons name="information-circle-outline" size={15} color="#8B5CF6" />
        <Text style={[styles.statusText, { color: colors.textPrimary }]}>{actionMessage}</Text>
      </View>

      {/* Interactive Operation Buttons */}
      <View style={styles.operationsRow}>
        {config.type === 'array' && (
          <>
            <TouchableOpacity onPress={handlePointerStep} style={styles.opBtn} activeOpacity={0.8}>
              <Ionicons name="arrow-forward-circle" size={16} color="#FFFFFF" />
              <Text style={styles.opBtnText}>Advance Pointer</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleArrayInsert} style={[styles.opBtn, { backgroundColor: '#0284C7' }]} activeOpacity={0.8}>
              <Ionicons name="add-circle" size={16} color="#FFFFFF" />
              <Text style={styles.opBtnText}>Insert Item</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleArrayReset} style={[styles.opBtn, { backgroundColor: '#475569' }]} activeOpacity={0.8}>
              <Ionicons name="refresh" size={16} color="#FFFFFF" />
              <Text style={styles.opBtnText}>Reset</Text>
            </TouchableOpacity>
          </>
        )}

        {config.type === 'stack' && (
          <>
            <TouchableOpacity onPress={handleStackPush} style={[styles.opBtn, { backgroundColor: '#10B981' }]} activeOpacity={0.8}>
              <Ionicons name="arrow-down-circle" size={16} color="#FFFFFF" />
              <Text style={styles.opBtnText}>Push()</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleStackPop} style={[styles.opBtn, { backgroundColor: '#EF4444' }]} activeOpacity={0.8}>
              <Ionicons name="arrow-up-circle" size={16} color="#FFFFFF" />
              <Text style={styles.opBtnText}>Pop()</Text>
            </TouchableOpacity>
          </>
        )}

        {config.type === 'queue' && (
          <>
            <TouchableOpacity onPress={handleQueueEnqueue} style={[styles.opBtn, { backgroundColor: '#6366F1' }]} activeOpacity={0.8}>
              <Ionicons name="add-circle" size={16} color="#FFFFFF" />
              <Text style={styles.opBtnText}>Enqueue()</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleQueueDequeue} style={[styles.opBtn, { backgroundColor: '#F59E0B' }]} activeOpacity={0.8}>
              <Ionicons name="remove-circle" size={16} color="#FFFFFF" />
              <Text style={styles.opBtnText}>Dequeue()</Text>
            </TouchableOpacity>
          </>
        )}

        {config.type !== 'array' && config.type !== 'stack' && config.type !== 'queue' && (
          <TouchableOpacity
            onPress={() => setActionMessage('Simulated round-trip request: Client ➔ Gateway ➔ Backend ➔ DB (2.4ms)')}
            style={[styles.opBtn, { backgroundColor: '#8B5CF6' }]}
            activeOpacity={0.8}
          >
            <Ionicons name="paper-plane" size={15} color="#FFFFFF" />
            <Text style={styles.opBtnText}>Send Test Request</Text>
          </TouchableOpacity>
        )}
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
  canvas: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    minHeight: 120,
    justifyContent: 'center',
  },
  canvasSublabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  arrayContainer: {
    alignItems: 'center',
  },
  arrayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  arrayCell: {
    alignItems: 'center',
  },
  arrayCellActive: {
    transform: [{ scale: 1.05 }],
  },
  cellIndex: {
    color: '#64748B',
    fontSize: 10,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  cellIndexActive: {
    color: '#10B981',
    fontWeight: '800',
  },
  cellBox: {
    width: 44,
    height: 44,
    backgroundColor: '#1E293B',
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellBoxActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  cellVal: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  cellValActive: {
    color: '#10B981',
  },
  pointerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  pointerText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  stackContainer: {
    alignItems: 'center',
  },
  stackBucket: {
    width: 140,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderBottomWidth: 3,
    borderColor: '#38BDF8',
    padding: 6,
    gap: 4,
    alignItems: 'center',
  },
  stackPlate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    width: '100%',
    justifyContent: 'center',
  },
  stackPlateTop: {
    backgroundColor: 'rgba(56, 189, 248, 0.25)',
    borderColor: '#38BDF8',
    borderWidth: 1,
  },
  topPointerLabel: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    marginRight: 6,
  },
  stackVal: {
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyStackText: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  queueContainer: {
    alignItems: 'center',
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  queueEndLabel: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '800',
  },
  queueItem: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4338CA',
  },
  queueVal: {
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
  },
  recursionContainer: {
    alignItems: 'center',
  },
  recursionList: {
    width: '90%',
    gap: 4,
  },
  recursionFrame: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 6,
    borderRadius: 4,
    gap: 8,
  },
  recursionFrameText: {
    color: '#F8FAFC',
    fontFamily: 'monospace',
    fontSize: 11,
  },
  archContainer: {
    alignItems: 'center',
  },
  archNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  archNode: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 8,
    borderRadius: Radius.sm,
    gap: 4,
  },
  archNodeText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '700',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: Radius.sm,
    gap: 6,
    marginBottom: Spacing.sm,
  },
  statusText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  operationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  opBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    gap: 5,
  },
  opBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
