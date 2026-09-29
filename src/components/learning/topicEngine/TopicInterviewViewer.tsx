import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { TopicInterviewQuestion } from '../../../models/TopicContent';

interface TopicInterviewViewerProps {
  questions: TopicInterviewQuestion[];
  onAnswerRevealed?: (revealedCount: number) => void;
}

export const TopicInterviewViewer: React.FC<TopicInterviewViewerProps> = ({
  questions,
  onAnswerRevealed,
}) => {
  const { colors, isDark } = useTheme();
  const [selectedLevel, setSelectedLevel] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [revealedIds, setRevealedIds] = useState<Record<number, boolean>>({});

  if (!questions || questions.length === 0) return null;

  const filtered = selectedLevel === 'All'
    ? questions
    : questions.filter((q) => q.level === selectedLevel);

  const toggleReveal = (index: number) => {
    const nextState = { ...revealedIds, [index]: !revealedIds[index] };
    setRevealedIds(nextState);
    if (onAnswerRevealed) {
      const count = Object.values(nextState).filter(Boolean).length;
      onAnswerRevealed(count);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles-outline" size={18} color="#EC4899" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>TOPIC INTERVIEW PREPARATION</Text>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterRow, { backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}>
        {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => {
          const isActive = selectedLevel === lvl;
          return (
            <TouchableOpacity
              key={lvl}
              onPress={() => setSelectedLevel(lvl)}
              style={[
                styles.filterBtn,
                isActive && [styles.filterBtnActive, { backgroundColor: colors.primary }],
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  { color: isActive ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {lvl}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Questions list */}
      <View style={styles.questionsList}>
        {filtered.map((item, idx) => {
          const isRevealed = !!revealedIds[idx];
          return (
            <View
              key={`iq-${idx}`}
              style={[
                styles.questionCard,
                { backgroundColor: isDark ? '#0F172A' : '#FDF2F8', borderColor: isDark ? colors.border : '#FBCFE8' },
              ]}
            >
              {/* Level Badge & Question */}
              <View style={styles.qTopRow}>
                <View
                  style={[
                    styles.levelBadge,
                    item.level === 'Beginner'
                      ? styles.levelBadgeBeg
                      : item.level === 'Intermediate'
                      ? styles.levelBadgeInt
                      : styles.levelBadgeAdv,
                  ]}
                >
                  <Text style={styles.levelBadgeText}>{item.level.toUpperCase()}</Text>
                </View>
                <Text style={[styles.qIndex, { color: colors.textTertiary }]}>Q{idx + 1}</Text>
              </View>

              <Text style={[styles.questionText, { color: colors.textPrimary }]}>{item.question}</Text>

              {/* Reveal Toggle */}
              <TouchableOpacity
                onPress={() => toggleReveal(idx)}
                style={[styles.revealBtn, { borderColor: '#EC4899' }]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isRevealed ? 'eye-off-outline' : 'eye-outline'}
                  size={15}
                  color="#DB2777"
                />
                <Text style={styles.revealBtnText}>
                  {isRevealed ? 'Hide Answer' : 'Reveal Answer & Architecture Tips'}
                </Text>
              </TouchableOpacity>

              {/* Revealed Answer Box */}
              {isRevealed && (
                <View style={[styles.answerBox, { backgroundColor: isDark ? '#020617' : '#FFFFFF', borderColor: '#F472B6' }]}>
                  <Text style={styles.answerLabel}>MODEL INTERVIEW ANSWER:</Text>
                  <Text style={[styles.answerText, { color: colors.textPrimary }]}>{item.answer}</Text>

                  {item.tip && (
                    <View style={styles.tipBox}>
                      <Ionicons name="bulb" size={14} color="#D97706" />
                      <Text style={styles.tipText}>
                        <Text style={{ fontWeight: '800' }}>Interviewer Tip: </Text>
                        {item.tip}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  filterRow: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.md,
    gap: 4,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  filterBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  filterBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  questionsList: {
    gap: Spacing.md,
  },
  questionCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
  },
  qTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  levelBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  levelBadgeBeg: {
    backgroundColor: '#10B981',
  },
  levelBadgeInt: {
    backgroundColor: '#3B82F6',
  },
  levelBadgeAdv: {
    backgroundColor: '#8B5CF6',
  },
  levelBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  qIndex: {
    fontSize: 11,
    fontWeight: '800',
  },
  questionText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 6,
  },
  revealBtnText: {
    color: '#DB2777',
    fontSize: 11,
    fontWeight: '800',
  },
  answerBox: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 6,
  },
  answerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EC4899',
    letterSpacing: 0.6,
  },
  answerText: {
    fontSize: 12,
    lineHeight: 18,
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 6,
    gap: 6,
    marginTop: 4,
  },
  tipText: {
    flex: 1,
    fontSize: 11,
    color: '#78350F',
    lineHeight: 15,
  },
});
