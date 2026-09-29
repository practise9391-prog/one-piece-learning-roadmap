import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { MemoryCardItem } from '../../../models/TopicContent';

interface MemoryCardsViewerProps {
  cards: MemoryCardItem[];
  savedRevisionState?: Record<string, boolean> | null;
  onRevisionChange?: (state: Record<string, boolean>) => void;
}

export const MemoryCardsViewer: React.FC<MemoryCardsViewerProps> = ({
  cards,
  savedRevisionState,
  onRevisionChange,
}) => {
  const { colors, isDark } = useTheme();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [revisionMap, setRevisionMap] = useState<Record<string, boolean>>(
    savedRevisionState || {}
  );

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex] || cards[0];
  const isKnown = revisionMap[currentCard.id] === true;

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(cards.length - 1);
    }
  };

  const handleMark = (known: boolean) => {
    const updated = { ...revisionMap, [currentCard.id]: known };
    setRevisionMap(updated);
    if (onRevisionChange) {
      onRevisionChange(updated);
    }
    handleNext();
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="albums-outline" size={18} color="#D97706" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>ACTIVE RECALL MEMORY CARDS</Text>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>
            {currentIndex + 1} / {cards.length}
          </Text>
        </View>
      </View>

      {/* Flip Card Canvas */}
      <TouchableOpacity
        onPress={handleFlip}
        style={[
          styles.flashcard,
          {
            backgroundColor: isFlipped
              ? (isDark ? '#064E3B' : '#ECFDF5')
              : (isDark ? '#0B132B' : '#EFF6FF'),
            borderColor: isFlipped ? '#34D399' : '#60A5FA',
          },
        ]}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.sideBadge}>
            <Text style={styles.sideBadgeText}>{isFlipped ? 'BACK (ANSWER)' : 'FRONT (QUESTION)'}</Text>
          </View>
          {isKnown && (
            <View style={styles.knownBadge}>
              <Ionicons name="checkmark-circle" size={12} color="#10B981" />
              <Text style={styles.knownBadgeText}>Mastered</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardPrompt, { color: isFlipped ? (isDark ? '#FFFFFF' : '#064E3B') : (isDark ? '#FFFFFF' : '#1E3A8A') }]}>
            {isFlipped ? currentCard.back : currentCard.front}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Ionicons name="swap-vertical" size={14} color="#64748B" />
          <Text style={styles.cardFooterText}>Tap to {isFlipped ? 'flip back' : 'reveal answer'}</Text>
        </View>
      </TouchableOpacity>

      {/* Navigation & Recall Rating Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={handlePrev} style={[styles.navBtn, { borderColor: colors.border }]} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={16} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.recallActions}>
          <TouchableOpacity
            onPress={() => handleMark(false)}
            style={[styles.recallBtn, styles.reviewAgainBtn]}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={14} color="#DC2626" />
            <Text style={styles.reviewAgainText}>Review Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleMark(true)}
            style={[styles.recallBtn, styles.knownBtn]}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={14} color="#FFFFFF" />
            <Text style={styles.knownText}>I Know This ✓</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleNext} style={[styles.navBtn, { borderColor: colors.border }]} activeOpacity={0.7}>
          <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
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
    flex: 1,
  },
  counterBadge: {
    backgroundColor: '#D97706',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  flashcard: {
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 2,
    minHeight: 140,
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sideBadge: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sideBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  knownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  knownBadgeText: {
    color: '#15803D',
    fontSize: 10,
    fontWeight: '800',
  },
  cardBody: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cardPrompt: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cardFooterText: {
    color: '#64748B',
    fontSize: 11,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recallActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  recallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    gap: 4,
  },
  reviewAgainBtn: {
    backgroundColor: '#FEE2E2',
  },
  reviewAgainText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
  },
  knownBtn: {
    backgroundColor: '#10B981',
  },
  knownText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
