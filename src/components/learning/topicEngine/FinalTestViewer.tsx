import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { FinalTestQuestion } from '../../../models/TopicContent';

interface FinalTestViewerProps {
  questions: FinalTestQuestion[];
  topicId: string;
  onTestComplete: (passed: boolean, score: number, total: number) => void;
  isAlreadyPassed?: boolean;
}

export const FinalTestViewer: React.FC<FinalTestViewerProps> = ({
  questions,
  topicId,
  onTestComplete,
  isAlreadyPassed = false,
}) => {
  const { colors, isDark } = useTheme();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState<boolean>(isAlreadyPassed);

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
      let correct = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctAnswerIndex) correct++;
      });
      const passed = correct >= Math.ceil(questions.length * 0.75);
      setIsFinished(true);
      onTestComplete(passed, correct, questions.length);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setIsFinished(false);
  };

  if (isFinished) {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) correct++;
    });
    const percentage = Math.round((correct / questions.length) * 100);
    const passed = percentage >= 75 || isAlreadyPassed;

    return (
      <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: passed ? '#10B981' : '#F59E0B' }]}>
        <View style={styles.resultsBox}>
          <Ionicons
            name={passed ? 'ribbon' : 'alert-circle'}
            size={48}
            color={passed ? '#10B981' : '#F59E0B'}
          />
          <Text style={[styles.resultsTitle, { color: colors.textPrimary }]}>
            {passed ? 'TOPIC ASSESSMENT PASSED! 🏆' : 'PASS THRESHOLD NOT REACHED'}
          </Text>
          <Text style={[styles.resultsScore, { color: passed ? '#10B981' : '#F59E0B' }]}>
            Score: {correct} / {questions.length} ({percentage}%)
          </Text>
          <Text style={[styles.resultsSubtext, { color: colors.textSecondary }]}>
            {passed
              ? 'Congratulations! You have demonstrated comprehensive mastery across concept, practical, and code questions.'
              : 'You need at least 75% to achieve verified mastery. Review the cheat sheet and retake!'}
          </Text>

          <TouchableOpacity
            onPress={handleRestart}
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryBtnText}>Retake Final Assessment</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="trophy-outline" size={18} color="#D97706" />
          <Text style={[styles.title, { color: colors.textPrimary }]}>FINAL TOPIC ASSESSMENT</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: '#D97706' }]}>
          <Text style={styles.typeBadgeText}>
            {currentQ.questionType.toUpperCase()} ({currentIndex + 1}/{questions.length})
          </Text>
        </View>
      </View>

      <Text style={[styles.questionText, { color: colors.textPrimary }]}>{currentQ.question}</Text>

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
              key={`ft-opt-${optIdx}`}
              onPress={() => handleSelectOption(optIdx)}
              disabled={isSubmitted}
              style={[styles.optionRow, { backgroundColor: btnBg, borderColor: btnBorder }]}
              activeOpacity={0.8}
            >
              <View style={[styles.letterBadge, isThisSelected && { backgroundColor: colors.primary }]}>
                <Text style={[styles.letterText, isThisSelected && { color: '#FFFFFF' }]}>
                  {String.fromCharCode(65 + optIdx)}
                </Text>
              </View>
              <Text style={[styles.optionText, { color: textCol }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Immediate feedback if submitted */}
      {isSubmitted && (
        <View
          style={[
            styles.feedbackBox,
            {
              backgroundColor: isCorrect ? (isDark ? '#064E3B' : '#F0FDF4') : (isDark ? '#450A0A' : '#FEF2F2'),
              borderColor: isCorrect ? '#BBF7D0' : '#FECACA',
            },
          ]}
        >
          <Text
            style={[
              styles.feedbackTitle,
              { color: isCorrect ? (isDark ? '#A7F3D0' : '#065F46') : (isDark ? '#FECACA' : '#991B1B') },
            ]}
          >
            {isCorrect ? 'Correct ✓' : 'Incorrect'}
          </Text>
          <Text style={[styles.feedbackExpl, { color: isDark ? colors.textPrimary : '#1E293B' }]}>
            {currentQ.explanation}
          </Text>
        </View>
      )}

      {/* Action Row */}
      <View style={styles.actionRow}>
        {!isSubmitted ? (
          <TouchableOpacity
            onPress={handleSubmitQuestion}
            disabled={!hasSelected}
            style={[styles.submitBtn, { backgroundColor: hasSelected ? colors.primary : colors.border }]}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>Submit Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleNext}
            style={[styles.submitBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>
              {currentIndex < questions.length - 1 ? 'Next Question ➔' : 'Finish Assessment 🏁'}
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
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
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
  letterBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  letterText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  feedbackBox: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    gap: 4,
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  feedbackExpl: {
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
  resultsBox: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: 8,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  resultsScore: {
    fontSize: 22,
    fontWeight: '800',
  },
  resultsSubtext: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
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
