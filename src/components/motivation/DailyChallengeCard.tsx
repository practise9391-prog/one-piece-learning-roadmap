import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyChallenge } from '../../models/Motivation';
import { Colors } from '../../theme/colors';

interface DailyChallengeCardProps {
  challenge: DailyChallenge;
  onAccept: () => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  challenge,
  onAccept,
}) => {
  return (
    <View style={[styles.card, challenge.is_completed && styles.cardCompleted]}>
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>⚔ DAILY CHALLENGE</Text>
        </View>
        {challenge.is_completed ? (
          <View style={styles.donePill}>
            <Ionicons name="checkmark-circle" size={14} color="#059669" />
            <Text style={styles.donePillText}>COMPLETED</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.desc}>{challenge.description}</Text>

      <TouchableOpacity
        style={[styles.btn, challenge.is_completed && styles.btnCompleted]}
        onPress={onAccept}
        disabled={challenge.is_completed}
        activeOpacity={0.8}
      >
        <Ionicons
          name={challenge.is_completed ? 'checkmark-done' : 'flash'}
          size={16}
          color="#FFFFFF"
        />
        <Text style={styles.btnText}>
          {challenge.is_completed ? 'CHALLENGE COMPLETE (+1 ACH)' : 'ACCEPT CHALLENGE'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.3)',
  },
  cardCompleted: {
    backgroundColor: '#064E3B',
    borderColor: '#059669',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 0.6,
  },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  donePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  desc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  btnCompleted: {
    backgroundColor: '#059669',
  },
  btnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});
