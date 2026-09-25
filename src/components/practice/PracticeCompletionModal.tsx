import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface PracticeCompletionModalProps {
  visible: boolean;
  questionTitle: string;
  isCorrect: boolean;
  onNext: () => void;
  onClose: () => void;
}

export const PracticeCompletionModal: React.FC<PracticeCompletionModalProps> = ({
  visible,
  questionTitle,
  isCorrect,
  onNext,
  onClose,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.crestCircle}>
            <Ionicons
              name={isCorrect ? 'trophy' : 'bulb'}
              size={36}
              color={isCorrect ? Colors.secondary : Colors.primary}
            />
          </View>

          <Text style={styles.headline}>
            {isCorrect ? '⚔ TRAINING COMPLETE' : 'CHALLENGE REVIEW'}
          </Text>
          <Text style={styles.questionName} numberOfLines={2}>
            {questionTitle}
          </Text>

          <Text style={styles.message}>
            {isCorrect
              ? 'Great job, warrior! Your solution has been recorded in your voyage log.'
              : 'Review the explanation and solution below to master this concept.'}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.secondaryBtnText}>Review Solution</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtn} onPress={onNext} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>Next Challenge</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 179, 0, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  crestCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 179, 0, 0.4)',
  },
  headline: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.8,
  },
  questionName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 10,
  },
  message: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
