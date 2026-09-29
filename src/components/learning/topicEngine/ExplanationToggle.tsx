import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';

interface ExplanationToggleProps {
  mode: 'simple' | 'technical';
  onToggleMode: (mode: 'simple' | 'technical') => void;
  simpleText: string;
  technicalText: string;
}

export const ExplanationToggle: React.FC<ExplanationToggleProps> = ({
  mode,
  onToggleMode,
  simpleText,
  technicalText,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      {/* Header & Toggle Controls */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons
            name={mode === 'simple' ? 'sparkles' : 'terminal'}
            size={18}
            color={colors.primary}
          />
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            {mode === 'simple' ? 'SIMPLE EXPLANATION' : 'TECHNICAL SPECIFICATION'}
          </Text>
        </View>

        <View style={[styles.toggleContainer, { backgroundColor: isDark ? '#0F172A' : '#E2E8F0' }]}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              mode === 'simple' && [styles.toggleBtnActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => onToggleMode('simple')}
            activeOpacity={0.8}
            accessibilityLabel="Switch to Simple explanation"
          >
            <Ionicons
              name="happy-outline"
              size={13}
              color={mode === 'simple' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                { color: mode === 'simple' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Simple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              mode === 'technical' && [styles.toggleBtnActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => onToggleMode('technical')}
            activeOpacity={0.8}
            accessibilityLabel="Switch to Technical explanation"
          >
            <Ionicons
              name="code-slash"
              size={13}
              color={mode === 'technical' ? '#FFFFFF' : colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleBtnText,
                { color: mode === 'technical' ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              Technical
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Explanation Text */}
      <View style={[styles.contentBox, { backgroundColor: isDark ? '#0B132B' : '#F8FAFC' }]}>
        <Text style={[styles.bodyText, { color: colors.textPrimary }]}>
          {mode === 'simple' ? simpleText : technicalText}
        </Text>
      </View>

      {/* Subtext info */}
      <View style={styles.footerNoteRow}>
        <Ionicons name="information-circle-outline" size={13} color={colors.textTertiary} />
        <Text style={[styles.footerNote, { color: colors.textTertiary }]}>
          {mode === 'simple'
            ? 'Beginner-friendly conceptual breakdown without unnecessary jargon.'
            : 'Exact computer science terminology, memory mechanics, and runtime behavior.'}
        </Text>
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
    gap: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: Radius.full,
    padding: 3,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 4,
  },
  toggleBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  contentBox: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
  },
  footerNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: Spacing.sm,
  },
  footerNote: {
    fontSize: 11,
  },
});
