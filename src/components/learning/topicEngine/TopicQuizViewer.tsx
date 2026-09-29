import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { TopicQuizQuestion } from '../../../models/TopicContent';

interface TopicQuizViewerProps {
  questions: TopicQuizQuestion[];
  topicId: string;
  bestScore?: number;
  onQuizComplete?: (score: number, total: number) => void;
}

export const TopicQuizViewer: React.FC<TopicQuizViewerProps> = ({
  questions,
  topicId,
  bestScore = 0,
  onQuizComplete,
}) => {
  const { colors, isDark } = useTheme();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState<boolean>(false);

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const hasSelected = selectedAnswers[currentIndex] !== undefined;
  const isSubmitted = submittedAnswers[currentIndex] === true;
  const selectedOption = selectedAnswers[currentIndex];
  const isCorrect = isSubmitted && selectedOption === currentQ.correctAnswerIndex;

  const handleSelectOption = (optIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleSubmitQuestion = () => {
    if (!hasSelected || isSubmitted) return;
    setSubmittedAnswers((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      let correctCount = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswerIndex) {
          correctCount++;
        }
      });
      setIsFinished(true);
      if (onQuizComplete) {
        onQuizComplete(correctCount, questions.length);
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setIsFinished(false);
  };

  if (isFinished) {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) score++;
    });
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
        <View style={styles.resultsContainer}>
          <Ionicons
            name={percentage >= 70 ? 'trophy' : 'refresh-circle'}
            size={48}
            color={percentage >= 70 ? '#F59E0B' : colors.primary}
          />
          <Text style={[styles.resultsTitle, { color: colors.textPrimary }]}>
            {percentage >= 70 ? 'Topic Quiz Completed!' : 'Keep Practicing!'}
          </Text>
          <Text style={[styles.resultsScore, { color: percentage >= 70 ? '#10B981' : '#F59E0B' }]}>
            {score} / {questions.length} ({percentage}%)
          </Text>
          {bestScore > 0 && (
            <Text style={[styles.bestScoreText, { color: colors.textSecondary }]}>
              Best Recorded Score: {bestScore} / {questions.length}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleRestartQuiz}
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retake Topic Quiz</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="help-circle-outline" size={18} color="#F59E0B" />
          <Text style={[styles.title, { color: colors.textPrimary }]}>TOPIC KNOWLEDGE QUIZ</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: isDark ? '#0B132B' : '#FEF3C7' }]}>
          <Text style={[styles.badgeText, { color: '#D97706' }]}>
            Question {currentIndex + 1} / {questions.length}
          </Text>
        </View>
      </View>

      {/* Question Text */}
      <Text style={[styles.questionText, { color: colors.textPrimary }]}>{currentQ.question}</Text>

      {/* Options List */}
      <View style={styles.optionsList}>
        {currentQ.options.map((opt, optIdx) => {
          const isThisSelected = selectedOption === optIdx;
          const isThisCorrect = currentQ.correctAnswerIndex === optIdx;

          let btnBg = isDark ? '#0F172A' : '#F8FAFC';
          let btnBorder = colors.border;
          let textCol = colors.textPrimary;

          if (isSubmitted) {
            if (isThisCorrect) {
              btnBg = isDark ? '#064E3B' : '#DCFCE7';
              btnBorder = '#10B981';
              textCol = isDark ? '#FFFFFF' : '#065F46';
            } else if (isThisSelected) {
              btnBg = isDark ? '#7F1D1D' : '#FEE2E2';
              btnBorder = '#EF4444';
              textCol = isDark ? '#FFFFFF' : '#991B1B';
            }
          } else if (isThisSelected) {
            btnBg = isDark ? '#1E293B' : '#EFF6FF';
            btnBorder = colors.primary;
          }

          return (
            <TouchableOpacity
              key={`opt-${optIdx}`}
              onPress={() => handleSelectOption(optIdx)}
              disabled={isSubmitted}
              style={[styles.optionRow, { backgroundColor: btnBg, borderColor: btnBorder }]}
              activeOpacity={0.8}
            >
              <View style={[styles.optionLetterBadge, isThisSelected && { backgroundColor: colors.primary }]}>
                <Text
                  style={[
                    styles.optionLetterText,
                    isThisSelected && { color: '#FFFFFF' },
                  ]}
                >
                  {String.fromCharCode(65 + optIdx)}
                </Text>
              </View>
              <Text style={[styles.optionText, { color: textCol }]}>{opt}</Text>
              {isSubmitted && isThisCorrect && (
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              )}
              {isSubmitted && isThisSelected && !isThisCorrect && (
                <Ionicons name="close-circle" size={18} color="#EF4444" />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback / Explanation Box */}
      {isSubmitted && (
        <View
          style={[
            styles.explanationBox,
            {
              backgroundColor: isCorrect ? (isDark ? '#064E3B' : '#F0FDF4') : (isDark ? '#450A0A' : '#FEF2F2'),
              borderColor: isCorrect ? '#BBF7D0' : '#FECACA',
            },
          ]}
        >
          <View style={styles.feedbackHeaderRow}>
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'alert-circle'}
              size={18}
              color={isCorrect ? '#10B981' : '#EF4444'}
            />
            <Text
              style={[
                styles.feedbackTitle,
                { color: isCorrect ? (isDark ? '#A7F3D0' : '#065F46') : (isDark ? '#FECACA' : '#991B1B') },
              ]}
            >
              {isCorrect ? 'Correct ✓' : 'Incorrect'}
            </Text>
          </View>
          <Text style={[styles.explanationText, { color: isDark ? colors.textPrimary : '#1E293B' }]}>
            {currentQ.explanation}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {!isSubmitted ? (
          <TouchableOpacity
            onPress={handleSubmitQuestion}
            disabled={!hasSelected}
            style={[styles.submitBtn, { backgroundColor: hasSelected ? colors.primary : colors.border }]}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>Check Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>
              {currentIndex < questions.length - 1 ? 'Next Question ➔' : 'Complete Quiz ✓'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  questionText: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: Spacing.md,
  },
  optionsList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    gap: 10,
  },
  optionLetterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  optionLetterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  explanationBox: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: 4,
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  submitBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.sm,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  resultsContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  resultsScore: {
    fontSize: 24,
    fontWeight: '800',
  },
  bestScoreText: {
    fontSize: 12,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    gap: 6,
    marginTop: Spacing.sm,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
