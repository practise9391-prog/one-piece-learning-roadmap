import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MotivationEntry } from '../../models/Motivation';
import { Colors } from '../../theme/colors';

interface DailyMotivationCardProps {
  motivation: MotivationEntry;
  onToggleFavorite: () => void;
}

export const DailyMotivationCard: React.FC<DailyMotivationCardProps> = ({
  motivation,
  onToggleFavorite,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.pill}>
          <Ionicons name="sparkles" size={13} color="#D97706" />
          <Text style={styles.pillText}>{motivation.category}</Text>
        </View>

        <TouchableOpacity
          onPress={onToggleFavorite}
          style={styles.favBtn}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={motivation.is_favorite ? 'heart' : 'heart-outline'}
            size={22}
            color={motivation.is_favorite ? '#EF4444' : '#94A3B8'}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.quote}>"{motivation.message}"</Text>

      <View style={styles.authorRow}>
        <View style={styles.authorLine} />
        <Text style={styles.authorText}>— {motivation.author}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  favBtn: {
    padding: 2,
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#0F172A',
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  authorText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
