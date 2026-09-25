import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '../ProgressBar';
import { PracticeCategory } from '../../models/Practice';
import { Colors } from '../../theme/colors';

interface PracticeCategoryCardProps {
  category: PracticeCategory;
  onPress: () => void;
}

export const PracticeCategoryCard: React.FC<PracticeCategoryCardProps> = ({
  category,
  onPress,
}) => {
  const isCompleted = category.total_questions! > 0 && category.completed_questions === category.total_questions;

  return (
    <TouchableOpacity
      style={[styles.card, isCompleted && styles.cardCompleted]}
      activeOpacity={0.82}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>{category.icon}</Text>
        </View>
        <View style={styles.titleCol}>
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryDesc} numberOfLines={1}>
            {category.description}
          </Text>
        </View>
        {isCompleted ? (
          <View style={styles.completedPill}>
            <Ionicons name="checkmark-circle" size={14} color="#15803D" />
            <Text style={styles.completedText}>DONE</Text>
          </View>
        ) : (
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>
              {category.completed_questions} / {category.total_questions}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.progressRow}>
        <View style={styles.barWrap}>
          <ProgressBar
            percentage={category.progress_percentage || 0}
            height={6}
            color={isCompleted ? Colors.success : Colors.primary}
          />
        </View>
        <Text style={styles.pctText}>{category.progress_percentage || 0}%</Text>
      </View>

      <View style={styles.actionRow}>
        <Text style={styles.actionHint}>
          {category.total_questions! - category.completed_questions!} challenges remaining
        </Text>
        <View style={styles.trainBtn}>
          <Text style={styles.trainBtnText}>TRAIN</Text>
          <Ionicons name="chevron-forward" size={12} color="#FFFFFF" style={{ marginLeft: 2 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardCompleted: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 20,
  },
  titleCol: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  categoryDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  completedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 3,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  barWrap: {
    flex: 1,
  },
  pctText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginLeft: 8,
    minWidth: 32,
    textAlign: 'right',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  actionHint: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  trainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  trainBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
