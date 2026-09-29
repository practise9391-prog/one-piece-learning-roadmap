import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';
import { ExecutionStep } from '../../models/Debugger';

interface DebugControlBarProps {
  currentStepIndex: number;
  totalSteps: number;
  currentStep?: ExecutionStep;
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onStepInto?: () => void;
  onStepOut?: () => void;
  onRestart: () => void;
  onStop: () => void;
  onChangeSpeed: (speed: number) => void;
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 1.5, 2];

export const DebugControlBar: React.FC<DebugControlBarProps> = ({
  currentStepIndex,
  totalSteps,
  currentStep,
  isPlaying,
  speed,
  onPlayPause,
  onNext,
  onPrev,
  onStepInto,
  onStepOut,
  onRestart,
  onStop,
  onChangeSpeed,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0B132B' : '#F1F5F9', borderColor: colors.border }]}>
      {/* Top Status Row */}
      <View style={styles.statusRow}>
        <View style={styles.badgeGroup}>
          <View style={[styles.stepBadge, { backgroundColor: isDark ? '#064E3B' : '#DCFCE7' }]}>
            <Text style={[styles.stepBadgeText, { color: '#059669' }]}>
              Step {totalSteps > 0 ? currentStepIndex + 1 : 0} of {totalSteps}
            </Text>
          </View>
          {currentStep && (
            <View style={[styles.lineBadge, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
              <Ionicons name="arrow-forward-circle" size={13} color="#10B981" />
              <Text style={[styles.lineBadgeText, { color: colors.textPrimary }]}>
                Line {currentStep.sourceLine}
              </Text>
            </View>
          )}
          {currentStep && (
            <View style={[styles.opBadge, { backgroundColor: isDark ? '#312E81' : '#EEF2FF' }]}>
              <Text style={[styles.opBadgeText, { color: '#6366F1' }]}>
                {currentStep.operation}
              </Text>
            </View>
          )}
        </View>

        {/* Speed Selector Pills */}
        <View style={styles.speedRow}>
          {SPEED_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => onChangeSpeed(s)}
              style={[
                styles.speedPill,
                speed === s && styles.speedPillActive,
                { borderColor: speed === s ? '#38BDF8' : colors.border },
              ]}
              activeOpacity={0.7}
              accessibilityLabel={`Set playback speed to ${s}x`}
            >
              <Text style={[styles.speedText, speed === s && styles.speedTextActive]}>
                {s}x
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Action Controls Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlsScroll}>
        <TouchableOpacity
          onPress={onRestart}
          style={[styles.btn, { borderColor: colors.border }]}
          activeOpacity={0.7}
          accessibilityLabel="Restart Debugger"
        >
          <Ionicons name="refresh" size={16} color={colors.textSecondary} />
          <Text style={[styles.btnText, { color: colors.textSecondary }]}>Restart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPrev}
          disabled={currentStepIndex <= 0}
          style={[styles.btn, currentStepIndex <= 0 && styles.btnDisabled, { borderColor: colors.border }]}
          activeOpacity={0.7}
          accessibilityLabel="Step Backward"
        >
          <Ionicons name="play-skip-back" size={16} color={colors.textPrimary} />
          <Text style={[styles.btnText, { color: colors.textPrimary }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onPlayPause}
          style={[styles.playBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
          accessibilityLabel={isPlaying ? 'Pause' : 'Continue'}
        >
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#FFFFFF" />
          <Text style={styles.playBtnText}>{isPlaying ? 'Pause' : 'Continue'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNext}
          disabled={currentStepIndex >= totalSteps - 1}
          style={[styles.btn, currentStepIndex >= totalSteps - 1 && styles.btnDisabled, { borderColor: colors.border }]}
          activeOpacity={0.7}
          accessibilityLabel="Step Over"
        >
          <Text style={[styles.btnText, { color: colors.textPrimary }]}>Step Over</Text>
          <Ionicons name="play-skip-forward" size={16} color={colors.textPrimary} />
        </TouchableOpacity>

        {onStepInto && (
          <TouchableOpacity
            onPress={onStepInto}
            style={[styles.btn, { borderColor: colors.border }]}
            activeOpacity={0.7}
            accessibilityLabel="Step Into"
          >
            <Ionicons name="arrow-down" size={15} color="#38BDF8" />
            <Text style={[styles.btnText, { color: '#38BDF8' }]}>Step Into</Text>
          </TouchableOpacity>
        )}

        {onStepOut && (
          <TouchableOpacity
            onPress={onStepOut}
            style={[styles.btn, { borderColor: colors.border }]}
            activeOpacity={0.7}
            accessibilityLabel="Step Out"
          >
            <Ionicons name="arrow-up" size={15} color="#A78BFA" />
            <Text style={[styles.btnText, { color: '#A78BFA' }]}>Step Out</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={onStop}
          style={[styles.btn, { borderColor: colors.border }]}
          activeOpacity={0.7}
          accessibilityLabel="Stop Debugging"
        >
          <Ionicons name="stop" size={15} color="#EF4444" />
          <Text style={[styles.btnText, { color: '#EF4444' }]}>Stop</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 6,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  stepBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  lineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lineBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  opBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  opBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  speedRow: {
    flexDirection: 'row',
    gap: 4,
  },
  speedPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  speedPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  speedText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
  },
  speedTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  controlsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  btnDisabled: {
    opacity: 0.35,
  },
  btnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  playBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
