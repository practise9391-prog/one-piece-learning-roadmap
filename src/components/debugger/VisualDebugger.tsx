import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { AnimationConfig } from '../../theme/animationConfig';
import { ExecutionTrace } from '../../models/Debugger';
import { DebugControlBar } from './DebugControlBar';
import { VariableInspector } from './VariableInspector';
import { ExpressionEvaluator } from './ExpressionEvaluator';
import { CallStackViewer } from './CallStackViewer';
import { DataStructureVisualizer } from './DataStructureVisualizer';
import { FlowchartViewer } from './FlowchartViewer';

interface VisualDebuggerProps {
  trace: ExecutionTrace | null;
  onActiveLineChange?: (line: number) => void;
  onClose?: () => void;
}

type DebuggerTab = 'STEPS' | 'VARS' | 'STACK' | 'DATA_STRUCTURES' | 'FLOWCHART';

export const VisualDebugger: React.FC<VisualDebuggerProps> = ({
  trace,
  onActiveLineChange,
  onClose,
}) => {
  const { colors, isDark, reducedMotion } = useTheme();
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<DebuggerTab>('STEPS');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const totalSteps = trace ? trace.steps.length : 0;
  const currentStep = trace && trace.steps.length > 0 ? trace.steps[currentStepIndex] : undefined;

  // Sync active line whenever step changes
  useEffect(() => {
    if (currentStep && onActiveLineChange) {
      onActiveLineChange(currentStep.sourceLine);
    }
  }, [currentStepIndex, currentStep, onActiveLineChange]);

  // Step transition subtle animation
  useEffect(() => {
    if (!reducedMotion) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: AnimationConfig.getDuration(80, reducedMotion),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: AnimationConfig.getDuration(120, reducedMotion),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [currentStepIndex, fadeAnim, reducedMotion]);

  // Auto-play timer loop
  useEffect(() => {
    if (isPlaying && totalSteps > 0) {
      const delay = Math.max(250, 1200 / speed);
      timerRef.current = setTimeout(() => {
        if (currentStepIndex < totalSteps - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, delay);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStepIndex, totalSteps, speed]);

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

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    onClose?.();
  };

  if (!trace || totalSteps === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
        <Ionicons name="bug-outline" size={28} color="#94A3B8" />
        <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Visual Debugger Idle</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
          Click "Debug" in the toolbar above to generate a step-by-step execution trace and inspect variables, expressions, and call stacks.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#020617' : '#FFFFFF', borderColor: colors.border }]}>
      {/* Top Controls Bar */}
      <DebugControlBar
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        currentStep={currentStep}
        isPlaying={isPlaying}
        speed={speed}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onRestart={handleRestart}
        onStop={handleStop}
        onChangeSpeed={setSpeed}
      />

      {/* Synchronized Navigation Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('STEPS')}
          style={[styles.tabBtn, activeTab === 'STEPS' && styles.tabBtnActive]}
          activeOpacity={0.7}
        >
          <Ionicons name="flash-outline" size={13} color={activeTab === 'STEPS' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'STEPS' && styles.tabTextActive]}>
            Evaluation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('VARS')}
          style={[styles.tabBtn, activeTab === 'VARS' && styles.tabBtnActive]}
          activeOpacity={0.7}
        >
          <Ionicons name="hardware-chip-outline" size={13} color={activeTab === 'VARS' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'VARS' && styles.tabTextActive]}>
            Variables ({currentStep ? Object.keys(currentStep.variables).length : 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('STACK')}
          style={[styles.tabBtn, activeTab === 'STACK' && styles.tabBtnActive]}
          activeOpacity={0.7}
        >
          <Ionicons name="layers-outline" size={13} color={activeTab === 'STACK' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'STACK' && styles.tabTextActive]}>
            Call Stack ({currentStep ? currentStep.callStack.length : 0})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('DATA_STRUCTURES')}
          style={[styles.tabBtn, activeTab === 'DATA_STRUCTURES' && styles.tabBtnActive]}
          activeOpacity={0.7}
        >
          <Ionicons name="bar-chart-outline" size={13} color={activeTab === 'DATA_STRUCTURES' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'DATA_STRUCTURES' && styles.tabTextActive]}>
            Algorithm Lab
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('FLOWCHART')}
          style={[styles.tabBtn, activeTab === 'FLOWCHART' && styles.tabBtnActive]}
          activeOpacity={0.7}
        >
          <Ionicons name="git-network-outline" size={13} color={activeTab === 'FLOWCHART' ? '#38BDF8' : '#94A3B8'} />
          <Text style={[styles.tabText, activeTab === 'FLOWCHART' && styles.tabTextActive]}>
            Flowchart
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Panels */}
      <Animated.View style={{ opacity: fadeAnim }}>
        {activeTab === 'STEPS' && <ExpressionEvaluator currentStep={currentStep} />}
        {activeTab === 'VARS' && (
          <VariableInspector
            variables={currentStep?.variables || {}}
            memory={currentStep?.memory || {}}
          />
        )}
        {activeTab === 'STACK' && (
          <CallStackViewer
            callStack={currentStep?.callStack || []}
            recursionTree={currentStep?.recursionTree}
          />
        )}
        {activeTab === 'DATA_STRUCTURES' && (
          <DataStructureVisualizer
            dataStructureState={currentStep?.dataStructureState}
          />
        )}
        {activeTab === 'FLOWCHART' && (
          <FlowchartViewer
            nodes={trace.flowchartNodes || []}
            activeLineNumber={currentStep?.sourceLine}
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
  },
  emptyContainer: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 340,
    lineHeight: 18,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderBottomWidth: 2,
    borderBottomColor: '#38BDF8',
  },
  tabText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
});
