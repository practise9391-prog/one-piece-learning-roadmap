import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface IncompleteWarningModalProps {
  visible: boolean;
  completedTopicsCount: number;
  totalTopicsCount: number;
  onContinueLearning: () => void;
  onCompleteAnyway: () => void;
  allowOverride?: boolean;
}

export const IncompleteWarningModal: React.FC<IncompleteWarningModalProps> = ({
  visible,
  completedTopicsCount,
  totalTopicsCount,
  onContinueLearning,
  onCompleteAnyway,
  allowOverride = true,
}) => {
  const remaining = totalTopicsCount - completedTopicsCount;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.warningCard}>
          <View style={styles.warningIconCircle}>
            <Ionicons name="alert-circle" size={32} color="#D97706" />
          </View>

          <Text style={styles.warningTitle}>Topics Still Incomplete</Text>
          <Text style={styles.warningDesc}>
            Some curriculum topics on this island are still unfinished. We recommend mastering all
            topics before completing this module.
          </Text>

          <View style={styles.statsCard}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{completedTopicsCount} / {totalTopicsCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={[styles.statNum, { color: '#EF4444' }]}>{remaining}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
          </View>

          <View style={styles.buttonStack}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={onContinueLearning}
              activeOpacity={0.85}
            >
              <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
              <Text style={styles.continueButtonText}>Continue Learning</Text>
            </TouchableOpacity>

            {allowOverride && (
              <TouchableOpacity
                style={styles.overrideButton}
                onPress={onCompleteAnyway}
                activeOpacity={0.7}
              >
                <Text style={styles.overrideButtonText}>Complete Anyway</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface CompletionAnimationModalProps {
  visible: boolean;
  moduleOrder: number;
  moduleTitle: string;
  nextModuleTitle?: string;
  isCourseCompleted: boolean;
  onProceedNext: () => void;
  onDismiss: () => void;
}

export const CompletionAnimationModal: React.FC<CompletionAnimationModalProps> = ({
  visible,
  moduleOrder,
  moduleTitle,
  nextModuleTitle,
  isCourseCompleted,
  onProceedNext,
  onDismiss,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.3);
      opacityAnim.setValue(0);
      glowAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(glowAnim, {
              toValue: 0.3,
              duration: 1000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    }
  }, [visible, scaleAnim, opacityAnim, glowAnim]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.celebrationCard,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.crestContainer}>
            <Animated.View
              style={[
                styles.crestGlow,
                {
                  opacity: glowAnim,
                },
              ]}
            />
            <View style={styles.crestCircle}>
              <Ionicons
                name={isCourseCompleted ? 'trophy' : 'checkmark-circle'}
                size={54}
                color={isCourseCompleted ? '#F59E0B' : '#10B981'}
              />
            </View>
          </View>

          <Text style={styles.celebrationTitle}>
            {isCourseCompleted ? '🎉 Course Completed!' : 'Module Completed! 🏴‍☠️'}
          </Text>

          <Text style={styles.celebrationSubtitle}>
            Island #{moduleOrder} ({moduleTitle}) conquered!
          </Text>

          <View style={styles.unlockBanner}>
            <Ionicons
              name={isCourseCompleted ? 'ribbon' : 'key'}
              size={18}
              color={isCourseCompleted ? '#D97706' : '#2563EB'}
            />
            <Text style={styles.unlockBannerText}>
              {isCourseCompleted
                ? 'All Grand Line modules mastered. You are a Master Developer!'
                : nextModuleTitle
                ? `Next module unlocked: "${nextModuleTitle}"`
                : 'Next module unlocked!'}
            </Text>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
              activeOpacity={0.7}
            >
              <Text style={styles.dismissButtonText}>Roadmap View</Text>
            </TouchableOpacity>

            {nextModuleTitle && !isCourseCompleted && (
              <TouchableOpacity
                style={styles.proceedButton}
                onPress={onProceedNext}
                activeOpacity={0.85}
              >
                <Text style={styles.proceedButtonText}>Next Island</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  warningCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
  },
  warningIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  warningTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsCard: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 18,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#CBD5E1',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  buttonStack: {
    width: '100%',
    gap: 8,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  overrideButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  overrideButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  celebrationCard: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  crestContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  crestGlow: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#BBF7D0',
  },
  crestCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    textAlign: 'center',
  },
  celebrationSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 16,
  },
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 8,
    marginBottom: 20,
  },
  unlockBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    lineHeight: 17,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  dismissButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  dismissButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  proceedButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    gap: 6,
  },
  proceedButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
