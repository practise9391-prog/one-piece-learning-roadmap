import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { HowItWorksData } from '../../../models/TopicContent';

interface HowItWorksViewerProps {
  data: HowItWorksData;
}

export const HowItWorksViewer: React.FC<HowItWorksViewerProps> = ({ data }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="git-network-outline" size={18} color="#6366F1" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {data.title ? data.title.toUpperCase() : 'HOW IT WORKS (INTERNAL FLOW)'}
        </Text>
      </View>

      <View style={styles.stepsList}>
        {data.steps.map((step, idx) => (
          <View key={`step-${idx}`} style={styles.stepItem}>
            {/* Step Left Indicator */}
            <View style={styles.stepLeft}>
              <View style={[styles.stepNumberCircle, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
              </View>
              {idx < data.steps.length - 1 && (
                <View style={[styles.connectingLine, { backgroundColor: colors.border }]} />
              )}
            </View>

            {/* Step Content */}
            <View
              style={[
                styles.stepCard,
                { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border },
              ]}
            >
              <View style={styles.stepTopRow}>
                <Text style={[styles.stepTitle, { color: colors.textPrimary }]}>{step.title}</Text>
                {step.stateBadge && (
                  <View style={styles.badgePill}>
                    <Text style={styles.badgePillText}>{step.stateBadge}</Text>
                  </View>
                )}
              </View>

              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                {step.description}
              </Text>

              {step.codeOrFormula && (
                <View style={[styles.codeBox, { backgroundColor: isDark ? '#020617' : '#0F172A' }]}>
                  <Text style={styles.codeText}>{step.codeOrFormula}</Text>
                </View>
              )}
            </View>
          </View>
        ))}
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
  stepsList: {
    gap: Spacing.xs,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepLeft: {
    alignItems: 'center',
    width: 32,
    marginRight: 10,
  },
  stepNumberCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  connectingLine: {
    width: 2,
    height: 48,
    marginVertical: 4,
  },
  stepCard: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  stepTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgePill: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  codeBox: {
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  codeText: {
    color: '#38BDF8',
    fontFamily: 'monospace',
    fontSize: 11,
  },
});
