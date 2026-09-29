import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AlgorithmLabData } from '../../models/TopicContent';
import { Colors } from '../../theme/colors';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { GlobalAITeacherModal } from '../ai/GlobalAITeacherModal';
import { aiContextManager } from '../../services/ai/AIContextManager';

interface Props {
  data: AlgorithmLabData;
}

export const AlgorithmVisualLabWidget: React.FC<Props> = ({ data }) => {
  const { width } = useWindowDimensions();
  const { navigate } = useAppNavigation();
  const isLandscapeOrWide = width >= 720;

  const [aiModalVisible, setAiModalVisible] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 0.25, 0.5, 1, 2, 4

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSteps = data.steps.length;
  const currentStep = data.steps[currentStepIndex] || data.steps[0];

  const handleOpenInDebugger = () => {
    const rawLines = data.codeLines || [];
    const fnName = data.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const code = `def ${fnName}(arr, target):\n` +
      rawLines.map((l) => '    ' + l).join('\n') +
      `\n\n# Test with Algorithm Lab dataset:\narr = [${data.array.join(', ')}]\ntarget = ${data.target ?? 80}\nresult = ${fnName}(arr, target)\nprint("Found at index:", result)\n`;
    navigate('CodeWorkspace', {
      code,
      language: 'python',
      title: data.title,
      mode: 'DEBUG',
      courseId: 'algorithms',
    });
  };

  useEffect(() => {
    if (isPlaying) {
      const baseDelay = 1200;
      const delay = baseDelay / playbackSpeed;
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < totalSteps - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentStepIndex, playbackSpeed, totalSteps]);

  const handlePlayPause = () => {
    if (currentStepIndex >= totalSteps - 1) {
      setCurrentStepIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const speedOptions = [0.25, 0.5, 1, 2, 4];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="hardware-chip-outline" size={18} color="#10B981" />
          <Text style={styles.headerTitle}>{data.title.toUpperCase()}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <TouchableOpacity
            onPress={() => {
              aiContextManager.setAlgorithmContext({
                algorithmName: data.title,
                pointers: {
                  highlighted: currentStep?.highlightedIndices,
                  variables: currentStep?.variables,
                },
                code: data.codeLines?.join('\n'),
              });
              setAiModalVisible(true);
            }}
            style={[styles.openDebuggerBtn, { backgroundColor: '#EC4899' }]}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={12} color="#FFFFFF" />
            <Text style={styles.openDebuggerBtnText}>AI Explain</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleOpenInDebugger}
            style={styles.openDebuggerBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="flask-outline" size={12} color="#FFFFFF" />
            <Text style={styles.openDebuggerBtnText}>Debug Code</Text>
          </TouchableOpacity>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>
              Step {currentStepIndex + 1} / {totalSteps}
            </Text>
          </View>
        </View>
      </View>

      {data.description && <Text style={styles.desc}>{data.description}</Text>}

      {/* Target Info */}
      {data.target !== undefined && (
        <View style={styles.targetBanner}>
          <Ionicons name="locate-outline" size={15} color="#F59E0B" />
          <Text style={styles.targetText}>
            Target to Find: <Text style={styles.targetVal}>{data.target}</Text>
          </Text>
        </View>
      )}

      {/* Array Visualization */}
      <View style={styles.visualSection}>
        <Text style={styles.visualLabel}>Data Structure (Array / Pointers):</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.arrayContainer}>
          {data.array.map((val, idx) => {
            const isHighlighted = currentStep?.highlightedIndices?.includes(idx);
            const isTargetMatched = val === data.target && isHighlighted;
            return (
              <View key={`arr-${idx}`} style={styles.elementWrapper}>
                <View
                  style={[
                    styles.elementBox,
                    isHighlighted && styles.elementBoxHighlighted,
                    isTargetMatched && styles.elementBoxSuccess,
                  ]}
                >
                  <Text
                    style={[
                      styles.elementValue,
                      isHighlighted && styles.elementValueHighlighted,
                      isTargetMatched && styles.elementValueSuccess,
                    ]}
                  >
                    {val}
                  </Text>
                </View>
                <Text style={styles.elementIndex}>[{idx}]</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* Action Banner */}
      <View style={styles.actionBanner}>
        <Ionicons name="information-circle-outline" size={18} color="#38BDF8" />
        <Text style={styles.actionText}>{currentStep?.action || 'Initial state'}</Text>
      </View>

      {/* Main Execution Split (Responsive: Stack on mobile, row on tablet/desktop) */}
      <View style={[styles.executionContainer, isLandscapeOrWide && styles.executionContainerWide]}>
        {/* Code Lines with Highlight */}
        <View style={[styles.codeBox, isLandscapeOrWide && styles.codeBoxWide]}>
          <Text style={styles.codeHeader}>Synchronized Algorithm Code:</Text>
          <ScrollView style={styles.codeScroll} nestedScrollEnabled>
            {data.codeLines.map((line, lIdx) => {
              const isCurrentLine = currentStep?.lineIndex === lIdx;
              return (
                <View
                  key={`line-${lIdx}`}
                  style={[styles.codeLineRow, isCurrentLine && styles.codeLineRowActive]}
                >
                  <Text style={[styles.lineNumber, isCurrentLine && styles.lineNumberActive]}>
                    {lIdx + 1}
                  </Text>
                  <Text style={[styles.codeText, isCurrentLine && styles.codeTextActive]}>
                    {line}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Live Variable Inspector */}
        <View style={[styles.variablesBox, isLandscapeOrWide && styles.variablesBoxWide]}>
          <Text style={styles.variablesHeader}>Live Variable Watch:</Text>
          <View style={styles.variablesTable}>
            {currentStep?.variables && Object.keys(currentStep.variables).length > 0 ? (
              Object.entries(currentStep.variables).map(([varName, val]) => (
                <View key={`var-${varName}`} style={styles.varRow}>
                  <Text style={styles.varName}>{varName}</Text>
                  <Text style={styles.varEquals}>=</Text>
                  <Text style={styles.varValue}>{String(val)}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noVarsText}>No variables in current scope</Text>
            )}
          </View>
        </View>
      </View>

      {/* Controls Bar */}
      <View style={styles.controlsBar}>
        <View style={styles.mainControls}>
          <TouchableOpacity style={styles.ctrlBtn} onPress={handleRestart} activeOpacity={0.7}>
            <Ionicons name="refresh" size={18} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctrlBtn, currentStepIndex === 0 && styles.ctrlBtnDisabled]}
            onPress={handlePrev}
            disabled={currentStepIndex === 0}
            activeOpacity={0.7}
          >
            <Ionicons
              name="play-skip-back"
              size={18}
              color={currentStepIndex === 0 ? '#475569' : '#F8FAFC'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.ctrlBtnPrimary, isPlaying && styles.ctrlBtnPlaying]}
            onPress={handlePlayPause}
            activeOpacity={0.8}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.ctrlBtn,
              currentStepIndex >= totalSteps - 1 && styles.ctrlBtnDisabled,
            ]}
            onPress={handleNext}
            disabled={currentStepIndex >= totalSteps - 1}
            activeOpacity={0.7}
          >
            <Ionicons
              name="play-skip-forward"
              size={18}
              color={currentStepIndex >= totalSteps - 1 ? '#475569' : '#F8FAFC'}
            />
          </TouchableOpacity>
        </View>

        {/* Speed Selector */}
        <View style={styles.speedSelector}>
          {speedOptions.map((s) => (
            <TouchableOpacity
              key={`spd-${s}`}
              style={[styles.speedChip, playbackSpeed === s && styles.speedChipActive]}
              onPress={() => setPlaybackSpeed(s)}
              activeOpacity={0.7}
            >
              <Text style={[styles.speedText, playbackSpeed === s && styles.speedTextActive]}>
                {s}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <GlobalAITeacherModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
        initialMode="ALGORITHM_PATTERN"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0A1224',
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  openDebuggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  openDebuggerBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  stepBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  stepBadgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  desc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  targetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1F2937',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  targetText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  targetVal: {
    color: '#F59E0B',
    fontWeight: '800',
    fontSize: 13,
  },
  visualSection: {
    backgroundColor: '#131D33',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E2C4C',
  },
  visualLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  arrayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  elementWrapper: {
    alignItems: 'center',
  },
  elementBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  elementBoxHighlighted: {
    borderColor: '#38BDF8',
    backgroundColor: '#0C4A6E',
    transform: [{ scale: 1.05 }],
  },
  elementBoxSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#064E3B',
    transform: [{ scale: 1.1 }],
  },
  elementValue: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  elementValueHighlighted: {
    color: '#38BDF8',
  },
  elementValueSuccess: {
    color: '#34D399',
  },
  elementIndex: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 3,
    fontFamily: 'monospace',
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0B213D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  actionText: {
    color: '#BAE6FD',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  executionContainer: {
    gap: 10,
    marginBottom: 12,
  },
  executionContainerWide: {
    flexDirection: 'row',
  },
  codeBox: {
    backgroundColor: '#080E1C',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  codeBoxWide: {
    flex: 1.5,
  },
  codeHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  codeScroll: {
    maxHeight: 170,
  },
  codeLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  codeLineRowActive: {
    backgroundColor: '#1E3A8A',
    borderLeftWidth: 3,
    borderLeftColor: '#60A5FA',
  },
  lineNumber: {
    color: '#475569',
    fontSize: 11,
    width: 24,
    fontFamily: 'monospace',
  },
  lineNumberActive: {
    color: '#93C5FD',
    fontWeight: '700',
  },
  codeText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontFamily: 'monospace',
    flex: 1,
  },
  codeTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  variablesBox: {
    backgroundColor: '#080E1C',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  variablesBoxWide: {
    flex: 1,
  },
  variablesHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  variablesTable: {
    gap: 6,
  },
  varRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131D33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  varName: {
    color: '#F472B6',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  varEquals: {
    color: '#64748B',
    fontSize: 12,
  },
  varValue: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  noVarsText: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    flexWrap: 'wrap',
    gap: 10,
  },
  mainControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ctrlBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlBtnDisabled: {
    opacity: 0.4,
  },
  ctrlBtnPrimary: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  ctrlBtnPlaying: {
    backgroundColor: '#F59E0B',
  },
  speedSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    padding: 3,
    borderRadius: 8,
  },
  speedChip: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  speedChipActive: {
    backgroundColor: '#10B981',
  },
  speedText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  speedTextActive: {
    color: '#FFFFFF',
  },
});
