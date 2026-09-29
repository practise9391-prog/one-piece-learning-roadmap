import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AnimationConfig } from '../../theme/animationConfig';
import { useTheme } from '../../theme/ThemeContext';

interface TopicCompletionFeedbackProps {
  visible: boolean;
  topicTitle: string;
  nextTopicTitle?: string;
  xpEarned?: number;
  onContinue: () => void;
  onDismiss: () => void;
}

export const TopicCompletionFeedback: React.FC<TopicCompletionFeedbackProps> = ({
  visible,
  topicTitle,
  nextTopicTitle,
  xpEarned = 10,
  onContinue,
  onDismiss,
}) => {
  const { reducedMotion } = useTheme();

  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      if (reducedMotion) {
        scaleAnim.setValue(1);
        opacityAnim.setValue(1);
        checkmarkScale.setValue(1);
        return;
      }

      scaleAnim.setValue(0.4);
      opacityAnim.setValue(0);
      checkmarkScale.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(checkmarkScale, {
          toValue: 1,
          friction: 4,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [checkmarkScale, opacityAnim, reducedMotion, scaleAnim, visible]);

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Checkmark Circle */}
          <View style={styles.iconCircle}>
            <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
              <Ionicons name="checkmark" size={36} color="#FFFFFF" />
            </Animated.View>
          </View>

          {/* XP Badge */}
          <View style={styles.xpPill}>
            <Ionicons name="flash" size={14} color="#F59E0B" />
            <Text style={styles.xpText}>+{xpEarned} XP Earned</Text>
          </View>

          <Text style={styles.title}>Topic Conquered!</Text>
          <Text style={styles.topicName} numberOfLines={2}>
            {topicTitle}
          </Text>

          {nextTopicTitle ? (
            <View style={styles.unlockBanner}>
              <Ionicons name="lock-open-outline" size={16} color="#10B981" />
              <Text style={styles.unlockText}>
                Next Unlocked: <Text style={styles.nextName}>{nextTopicTitle}</Text>
              </Text>
            </View>
          ) : (
            <View style={styles.unlockBanner}>
              <Ionicons name="checkmark-done-circle" size={16} color="#10B981" />
              <Text style={styles.unlockText}>All topics on this module completed!</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss} activeOpacity={0.7}>
              <Text style={styles.dismissText}>Stay Here</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.8}>
              <Text style={styles.continueText}>Continue</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 14, 33, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    maxWidth: 400,
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#312E81',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  xpText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 4,
  },
  topicName: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  unlockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#064E3B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    width: '100%',
    marginBottom: 18,
  },
  unlockText: {
    color: '#A7F3D0',
    fontSize: 12,
    flex: 1,
  },
  nextName: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  dismissBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  dismissText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  continueBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#0284C7',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
