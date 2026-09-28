import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { TimerMode, StudyPlanItem } from '../../models/StudyPlan';
import { studyPlanRepository } from '../../repositories/StudyPlanRepository';
import { getCurrentTimestamp } from '../../utils/dateUtils';

interface StudySessionTimerModalProps {
  visible: boolean;
  item: StudyPlanItem | null;
  onClose: () => void;
  onSessionEnded: () => void;
  onOpenTopicContent?: (item: StudyPlanItem) => void;
}

export const StudySessionTimerModal: React.FC<StudySessionTimerModalProps> = ({
  visible,
  item,
  onClose,
  onSessionEnded,
  onOpenTopicContent,
}) => {
  if (!item) return null;

  const [mode, setMode] = useState<TimerMode>('POMODORO');
  const [targetSeconds, setTargetSeconds] = useState<number>(25 * 60);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pomodoroPhase, setPomodoroPhase] = useState<'STUDY' | 'BREAK'>('STUDY');
  const [startTime, setStartTime] = useState<string>(getCurrentTimestamp());

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (visible) {
      resetTimerForMode('POMODORO');
    } else {
      stopInterval();
    }
    return () => stopInterval();
  }, [visible]);

  const stopInterval = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetTimerForMode = (selectedMode: TimerMode, customMins?: number) => {
    stopInterval();
    setIsRunning(false);
    setMode(selectedMode);
    setSecondsElapsed(0);
    setStartTime(getCurrentTimestamp());

    if (selectedMode === 'POMODORO') {
      setPomodoroPhase('STUDY');
      setTargetSeconds(25 * 60);
      setSecondsRemaining(25 * 60);
    } else if (selectedMode === 'COUNT_DOWN') {
      const dur = (item.plannedMinutes || 25) * 60;
      setTargetSeconds(dur);
      setSecondsRemaining(dur);
    } else if (selectedMode === 'COUNT_UP') {
      setTargetSeconds(0);
      setSecondsRemaining(0);
    } else if (selectedMode === 'CUSTOM') {
      const dur = (customMins || 30) * 60;
      setTargetSeconds(dur);
      setSecondsRemaining(dur);
    }
  };

  const handleStartPause = () => {
    if (isRunning) {
      stopInterval();
      setIsRunning(false);
    } else {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);

        if (mode === 'COUNT_DOWN' || mode === 'POMODORO' || mode === 'CUSTOM') {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }
  };

  const handleTimerComplete = () => {
    stopInterval();
    setIsRunning(false);

    if (mode === 'POMODORO') {
      if (pomodoroPhase === 'STUDY') {
        Alert.alert('Study Session Complete! 🔔', 'Great job! Time for a 5-minute break.', [
          {
            text: 'Start Break',
            onPress: () => {
              setPomodoroPhase('BREAK');
              setTargetSeconds(5 * 60);
              setSecondsRemaining(5 * 60);
              handleStartPause();
            },
          },
          { text: 'Finish Now', onPress: handleStopSession },
        ]);
      } else {
        Alert.alert('Break Over ⚡', 'Ready to continue another focus round?', [
          {
            text: 'Next Study Round',
            onPress: () => {
              setPomodoroPhase('STUDY');
              setTargetSeconds(25 * 60);
              setSecondsRemaining(25 * 60);
              handleStartPause();
            },
          },
          { text: 'Finish', onPress: handleStopSession },
        ]);
      }
    } else {
      Alert.alert('Time Reached! 🎯', 'You have completed your scheduled study duration.', [
        { text: 'Save Session', onPress: handleStopSession },
      ]);
    }
  };

  const handleStopSession = async () => {
    stopInterval();
    setIsRunning(false);

    const durationMinutes = Math.max(1, Math.round(secondsElapsed / 60));
    const now = getCurrentTimestamp();

    try {
      await studyPlanRepository.recordStudySession({
        courseId: item.courseId,
        moduleId: item.moduleId,
        topicId: item.topicId,
        durationMinutes,
        sessionType: mode,
        status: 'COMPLETED',
        startedAt: startTime,
        endedAt: now,
      });

      onSessionEnded();
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to save study session.');
    }
  };

  const formatDisplayTime = () => {
    const totalSecs = mode === 'COUNT_UP' ? secondsElapsed : secondsRemaining;
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.topRow}>
            <View>
              <Text style={styles.topicBadge}>
                {item.courseName} • {item.moduleTitle || 'Module'}
              </Text>
              <Text style={styles.topicTitle}>{item.topicTitle}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Mode Selector */}
          <View style={styles.modeRow}>
            {(['POMODORO', 'COUNT_DOWN', 'COUNT_UP'] as TimerMode[]).map((m) => {
              const isSelected = mode === m;
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.modeChip, isSelected && styles.modeChipActive]}
                  onPress={() => resetTimerForMode(m)}
                  disabled={isRunning}
                >
                  <Text style={[styles.modeChipText, isSelected && styles.modeChipTextActive]}>
                    {m === 'POMODORO' ? 'Pomodoro' : m === 'COUNT_DOWN' ? 'Count Down' : 'Count Up'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Pomodoro Phase Label */}
          {mode === 'POMODORO' && (
            <View
              style={[
                styles.phaseBadge,
                pomodoroPhase === 'BREAK' && { backgroundColor: '#DCFCE7' },
              ]}
            >
              <Text
                style={[
                  styles.phaseBadgeText,
                  pomodoroPhase === 'BREAK' && { color: '#16A34A' },
                ]}
              >
                {pomodoroPhase === 'STUDY' ? '🔥 FOCUS STUDY (25m)' : '☕ SHORT BREAK (5m)'}
              </Text>
            </View>
          )}

          {/* Large Timer Clock */}
          <View style={styles.clockCircle}>
            <Text style={styles.clockText}>{formatDisplayTime()}</Text>
            <Text style={styles.elapsedSubtext}>
              {Math.floor(secondsElapsed / 60)} min spent
            </Text>
          </View>

          {/* Timer Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.mainActionBtn, isRunning && styles.mainActionBtnRunning]}
              onPress={handleStartPause}
            >
              <Ionicons
                name={isRunning ? 'pause' : 'play'}
                size={26}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.mainActionText}>{isRunning ? 'PAUSE' : 'START STUDY'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.stopBtn} onPress={handleStopSession}>
              <Ionicons name="stop-circle-outline" size={24} color="#EF4444" />
              <Text style={styles.stopBtnText}>STOP & RECORD</Text>
            </TouchableOpacity>
          </View>

          {/* Option to open topic content without closing session */}
          {onOpenTopicContent && (
            <TouchableOpacity
              style={styles.openContentBtn}
              onPress={() => {
                onOpenTopicContent(item);
                onClose();
              }}
            >
              <Ionicons name="book-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.openContentText}>Read Topic Notes & Lessons</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    padding: 22,
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  topicBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    maxWidth: 240,
  },
  closeBtn: {
    padding: 4,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  modeChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
  },
  modeChipActive: {
    backgroundColor: Colors.primary,
  },
  modeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  modeChipTextActive: {
    color: '#FFFFFF',
  },
  phaseBadge: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 16,
  },
  phaseBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  clockCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 4,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    marginVertical: 14,
  },
  clockText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  elapsedSubtext: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginTop: 14,
  },
  mainActionBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mainActionBtnRunning: {
    backgroundColor: '#F59E0B',
  },
  mainActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stopBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 14,
    paddingVertical: 14,
  },
  stopBtnText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 4,
  },
  openContentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 6,
  },
  openContentText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
