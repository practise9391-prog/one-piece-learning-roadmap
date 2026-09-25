import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PracticeQuestion } from '../../models/Practice';
import { Colors } from '../../theme/colors';

interface PracticeQuestionCardProps {
  question: PracticeQuestion;
  index: number;
  onPress: () => void;
  onToggleBookmark: () => void;
}

export const PracticeQuestionCard: React.FC<PracticeQuestionCardProps> = ({
  question,
  index,
  onPress,
  onToggleBookmark,
}) => {
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'HARD':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'MEDIUM':
        return { bg: '#FEF3C7', text: '#B45309' };
      default:
        return { bg: '#DCFCE7', text: '#15803D' };
    }
  };

  const diffStyle = getDifficultyColor(question.difficulty);

  return (
    <TouchableOpacity
      style={[styles.card, question.is_completed && styles.cardCompleted]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.statusCircle}>
          {question.is_completed ? (
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
          ) : (
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
          )}
        </View>

        <View style={styles.titleCol}>
          <Text style={styles.questionTitle} numberOfLines={2}>
            {question.title}
          </Text>
          <View style={styles.tagsRow}>
            <View style={[styles.diffBadge, { backgroundColor: diffStyle.bg }]}>
              <Text style={[styles.diffBadgeText, { color: diffStyle.text }]}>
                {question.difficulty}
              </Text>
            </View>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{question.question_type}</Text>
            </View>
            <Text style={styles.topicText}>• {question.topic}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.bookmarkBtn}
          onPress={onToggleBookmark}
          activeOpacity={0.7}
        >
          <Ionicons
            name={question.is_bookmarked ? 'star' : 'star-outline'}
            size={20}
            color={question.is_bookmarked ? Colors.secondary : '#94A3B8'}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCircle: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  titleCol: {
    flex: 1,
    marginRight: 8,
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  diffBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  diffBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#2563EB',
  },
  topicText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  bookmarkBtn: {
    padding: 4,
  },
});
