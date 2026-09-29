import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { RealLifeExampleData } from '../../../models/TopicContent';

interface RealLifeExampleViewerProps {
  data: RealLifeExampleData;
}

export const RealLifeExampleViewer: React.FC<RealLifeExampleViewerProps> = ({ data }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          REAL-LIFE ANALOGY: {data.title.toUpperCase()}
        </Text>
      </View>

      <Text style={[styles.scenarioText, { color: colors.textPrimary }]}>{data.scenario}</Text>

      {/* Input -> Processing -> Output Flow */}
      <View style={[styles.flowContainer, { backgroundColor: isDark ? '#0B132B' : '#F8FAFC' }]}>
        {/* Input */}
        <View style={styles.flowStage}>
          <View style={[styles.stageIconBadge, { backgroundColor: '#38BDF8' }]}>
            <Ionicons name="log-in-outline" size={16} color="#FFFFFF" />
          </View>
          <Text style={[styles.stageLabel, { color: colors.textSecondary }]}>INPUT</Text>
          <Text style={[styles.stageValue, { color: colors.textPrimary }]}>{data.input}</Text>
        </View>

        <Ionicons name="arrow-forward" size={16} color="#94A3B8" style={styles.arrow} />

        {/* Processing */}
        <View style={styles.flowStage}>
          <View style={[styles.stageIconBadge, { backgroundColor: '#818CF8' }]}>
            <Ionicons name="cog-outline" size={16} color="#FFFFFF" />
          </View>
          <Text style={[styles.stageLabel, { color: colors.textSecondary }]}>PROCESSING</Text>
          <Text style={[styles.stageValue, { color: colors.textPrimary }]}>{data.processing}</Text>
        </View>

        <Ionicons name="arrow-forward" size={16} color="#94A3B8" style={styles.arrow} />

        {/* Output */}
        <View style={styles.flowStage}>
          <View style={[styles.stageIconBadge, { backgroundColor: '#34D399' }]}>
            <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
          </View>
          <Text style={[styles.stageLabel, { color: colors.textSecondary }]}>OUTPUT</Text>
          <Text style={[styles.stageValue, { color: colors.textPrimary }]}>{data.output}</Text>
        </View>
      </View>

      {/* Connection to software concept */}
      <View style={[styles.connectionBox, { backgroundColor: isDark ? '#1E293B' : '#F0FDF4', borderColor: '#BBF7D0' }]}>
        <Ionicons name="link-outline" size={16} color="#059669" />
        <Text style={[styles.connectionText, { color: isDark ? colors.textPrimary : '#065F46' }]}>
          <Text style={{ fontWeight: '800' }}>Connection to Code: </Text>
          {data.connectionToConcept}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  scenarioText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  flowContainer: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  flowStage: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  stageIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stageLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  stageValue: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 15,
  },
  arrow: {
    marginHorizontal: 2,
  },
  connectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
  },
  connectionText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
