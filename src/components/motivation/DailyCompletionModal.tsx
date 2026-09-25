import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';

interface DailyCompletionModalProps {
  visible: boolean;
  streakDays: number;
  onContinue: () => void;
}

export const DailyCompletionModal: React.FC<DailyCompletionModalProps> = ({
  visible,
  streakDays,
  onContinue,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="trophy" size={44} color="#D97706" />
          </View>

          <Text style={styles.preTitle}>VOYAGE ACCOMPLISHED</Text>
          <Text style={styles.title}>🎉 Daily Journey Complete!</Text>
          <Text style={styles.desc}>
            You conquered all of your daily goals today! Your learning streak advances to:
          </Text>

          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={24} color="#D97706" />
            <Text style={styles.streakNum}>{streakDays}</Text>
            <Text style={styles.streakLbl}>DAYS CONSECUTIVE</Text>
          </View>

          <TouchableOpacity style={styles.btn} onPress={onContinue} activeOpacity={0.8}>
            <Text style={styles.btnText}>CONTINUE LEARNING</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  preTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 1.2,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 4,
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  streakNum: {
    fontSize: 22,
    fontWeight: '900',
    color: '#B45309',
  },
  streakLbl: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  btn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  btnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});
