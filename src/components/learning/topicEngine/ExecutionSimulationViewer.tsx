import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { ExecutionSimulationData } from '../../../models/TopicContent';
import { useAppNavigation } from '../../../navigation/NavigationContext';

interface ExecutionSimulationViewerProps {
  data: ExecutionSimulationData;
  onExplainAgain?: () => void;
  onWhyPress?: () => void;
}

export const ExecutionSimulationViewer: React.FC<ExecutionSimulationViewerProps> = ({
  data,
  onExplainAgain,
  onWhyPress,
}) => {
  const { colors, isDark } = useTheme();
  const { navigate } = useAppNavigation();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSteps = data.steps.length;
  const currentStep = data.steps[currentStepIndex] || data.steps[0];

  const handleOpenInDebugger = () => {
    navigate('CodeWorkspace', {
      code: data.codeLines.join('\n'),
      language: data.language || 'python',
      title: data.title || 'Interactive Code Simulation',
      mode: 'DEBUG',
    });
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < totalSteps - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, totalSteps]);

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

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="play-forward-circle-outline" size={20} color="#10B981" />
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {data.title ? data.title.toUpperCase() : 'STEP-BY-STEP CODE EXECUTION'}
          </Text>
        </View>
        <View style={[styles.stepBadge, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
          <Text style={[styles.stepBadgeText, { color: '#059669' }]}>
            Step {currentStepIndex + 1} / {totalSteps}
          </Text>
        </View>
      </View>

      {/* Code Viewer with Active Line Highlighting */}
      <View style={[styles.codeContainer, { backgroundColor: isDark ? '#020617' : '#0F172A' }]}>
        <View style={styles.codeHeader}>
          <Text style={styles.codeLang}>{data.language.toUpperCase()} EXECUTION RUNTIME</Text>
          <TouchableOpacity
            onPress={handleOpenInDebugger}
            style={styles.openDebuggerHeaderBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="flask-outline" size={12} color="#FFFFFF" />
            <Text style={styles.openDebuggerHeaderBtnText}>Try in Debugger</Text>
          </TouchableOpacity>
        </View>
        {data.codeLines.map((line, idx) => {
          const isActive = idx === currentStep.lineIndex;
          return (
            <View
              key={`line-${idx}`}
              style={[styles.lineRow, isActive && styles.activeLineRow]}
            >
              <Text style={[styles.lineNumber, isActive && styles.activeLineNumber]}>
                {idx + 1}
              </Text>
              {isActive && (
                <Ionicons
                  name="arrow-forward"
                  size={12}
                  color="#10B981"
                  style={styles.activePointer}
                />
              )}
              <Text style={[styles.lineText, isActive && styles.activeLineText]}>
                {line}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Step Explanation */}
      <View style={[styles.explanationCard, { backgroundColor: isDark ? '#1E293B' : '#F0FDF4', borderColor: '#BBF7D0' }]}>
        <Ionicons name="information-circle" size={16} color="#10B981" />
        <Text style={[styles.explanationText, { color: isDark ? colors.textPrimary : '#064E3B' }]}>
          {currentStep.explanation}
        </Text>
      </View>

      {/* Synchronized Variable State Viewer */}
      <View style={[styles.variablesCard, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
        <View style={styles.variablesHeader}>
          <Ionicons name="hardware-chip-outline" size={14} color="#6366F1" />
          <Text style={[styles.variablesTitle, { color: colors.textSecondary }]}>
            ACTIVE VARIABLE STATE
          </Text>
        </View>
        <View style={styles.varGrid}>
          {Object.entries(currentStep.variables).map(([key, val], vIdx) => (
            <View key={`var-${vIdx}`} style={[styles.varPill, { borderColor: colors.border }]}>
              <Text style={[styles.varName, { color: '#6366F1' }]}>{key}:</Text>
              <Text style={[styles.varVal, { color: colors.textPrimary }]}>{String(val)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Synchronized Output Terminal */}
      {currentStep.output !== undefined && (
        <View style={[styles.outputBox, { backgroundColor: isDark ? '#020617' : '#0F172A' }]}>
          <Text style={styles.outputLabel}>STANDARD OUTPUT:</Text>
          <Text style={styles.outputText}>
            {currentStep.output ? currentStep.output : '(Waiting for print buffer...)'}
          </Text>
        </View>
      )}

      {/* Playback Controls */}
      <View style={[styles.controlsRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={handleRestart}
          style={[styles.controlBtn, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={16} color={colors.textSecondary} />
          <Text style={[styles.controlBtnText, { color: colors.textSecondary }]}>Restart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePrev}
          disabled={currentStepIndex === 0}
          style={[styles.controlBtn, currentStepIndex === 0 && { opacity: 0.4 }, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Ionicons name="play-skip-back" size={16} color={colors.textPrimary} />
          <Text style={[styles.controlBtnText, { color: colors.textPrimary }]}>Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePlayPause}
          style={[styles.playBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#FFFFFF" />
          <Text style={styles.playBtnText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          disabled={currentStepIndex === totalSteps - 1}
          style={[styles.controlBtn, currentStepIndex === totalSteps - 1 && { opacity: 0.4 }, { borderColor: colors.border }]}
          activeOpacity={0.7}
        >
          <Text style={[styles.controlBtnText, { color: colors.textPrimary }]}>Next</Text>
          <Ionicons name="play-skip-forward" size={16} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Meaningful Learning Controls */}
      <View style={styles.learningControlsRow}>
        <TouchableOpacity
          onPress={handleOpenInDebugger}
          style={[styles.learningActionBtn, { borderColor: '#6366F1', backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF' }]}
          activeOpacity={0.75}
        >
          <Ionicons name="flask-outline" size={14} color="#6366F1" />
          <Text style={[styles.learningActionBtnText, { color: '#6366F1', fontWeight: '800' }]}>Try in Debugger</Text>
        </TouchableOpacity>

        {onExplainAgain && (
          <TouchableOpacity
            onPress={onExplainAgain}
            style={[styles.learningActionBtn, { borderColor: '#38BDF8' }]}
            activeOpacity={0.75}
          >
            <Ionicons name="help-circle-outline" size={14} color="#0284C7" />
            <Text style={styles.learningActionBtnText}>Explain Simpler</Text>
          </TouchableOpacity>
        )}

        {onWhyPress && (
          <TouchableOpacity
            onPress={onWhyPress}
            style={[styles.learningActionBtn, { borderColor: '#F59E0B' }]}
            activeOpacity={0.75}
          >
            <Ionicons name="bulb-outline" size={14} color="#D97706" />
            <Text style={[styles.learningActionBtnText, { color: '#D97706' }]}>Why This Step?</Text>
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  codeContainer: {
    borderRadius: Radius.md,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.sm,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 4,
  },
  openDebuggerHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  openDebuggerHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  codeLang: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  activeLineRow: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
  },
  lineNumber: {
    color: '#475569',
    width: 20,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  activeLineNumber: {
    color: '#10B981',
    fontWeight: '800',
  },
  activePointer: {
    marginRight: 4,
  },
  lineText: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: 12,
    flex: 1,
  },
  activeLineText: {
    color: '#6EE7B7',
    fontWeight: '700',
  },
  explanationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  variablesCard: {
    borderRadius: Radius.md,
    padding: Spacing.sm + 4,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  variablesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  variablesTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  varGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  varPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 1,
    gap: 4,
  },
  varName: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  varVal: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  outputBox: {
    borderRadius: Radius.md,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.md,
  },
  outputLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  outputText: {
    color: '#A7F3D0',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm + 2,
    borderTopWidth: 1,
    marginBottom: Spacing.sm,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 4,
  },
  controlBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    gap: 5,
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  learningControlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  learningActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 5,
  },
  learningActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
});
