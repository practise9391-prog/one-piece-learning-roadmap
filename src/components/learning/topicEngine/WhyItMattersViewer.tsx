import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { WhyItMattersData } from '../../../models/TopicContent';

interface WhyItMattersViewerProps {
  data: WhyItMattersData;
}

export const WhyItMattersViewer: React.FC<WhyItMattersViewerProps> = ({ data }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="help-buoy-outline" size={18} color="#F59E0B" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>WHY IT MATTERS</Text>
      </View>

      <View style={styles.grid}>
        {/* What Problem It Solves */}
        <View style={[styles.itemBox, { backgroundColor: isDark ? '#1E293B' : '#FEF3C7', borderColor: '#FDE68A' }]}>
          <View style={styles.itemHeader}>
            <Ionicons name="shield-outline" size={15} color="#D97706" />
            <Text style={[styles.itemTitle, { color: '#B45309' }]}>What Problem Does It Solve?</Text>
          </View>
          <Text style={[styles.itemText, { color: isDark ? colors.textPrimary : '#78350F' }]}>
            {data.whatProblemItSolves}
          </Text>
        </View>

        {/* Why Developers Use It */}
        <View style={[styles.itemBox, { backgroundColor: isDark ? '#1E293B' : '#ECFDF5', borderColor: '#A7F3D0' }]}>
          <View style={styles.itemHeader}>
            <Ionicons name="construct-outline" size={15} color="#059669" />
            <Text style={[styles.itemTitle, { color: '#047857' }]}>Why Developers Use It</Text>
          </View>
          <Text style={[styles.itemText, { color: isDark ? colors.textPrimary : '#064E3B' }]}>
            {data.whyDevelopersUseIt}
          </Text>
        </View>

        {/* What Happens Without It */}
        <View style={[styles.itemBox, { backgroundColor: isDark ? '#1E293B' : '#FEF2F2', borderColor: '#FECACA' }]}>
          <View style={styles.itemHeader}>
            <Ionicons name="warning-outline" size={15} color="#DC2626" />
            <Text style={[styles.itemTitle, { color: '#B91C1C' }]}>What Happens Without It?</Text>
          </View>
          <Text style={[styles.itemText, { color: isDark ? colors.textPrimary : '#7F1D1D' }]}>
            {data.whatHappensWithoutIt}
          </Text>
        </View>

        {/* Where It Appears in Real Apps */}
        <View style={[styles.itemBox, { backgroundColor: isDark ? '#1E293B' : '#EFF6FF', borderColor: '#BFDBFE' }]}>
          <View style={styles.itemHeader}>
            <Ionicons name="globe-outline" size={15} color="#2563EB" />
            <Text style={[styles.itemTitle, { color: '#1D4ED8' }]}>Where It Appears In Real Software</Text>
          </View>
          <Text style={[styles.itemText, { color: isDark ? colors.textPrimary : '#1E3A8A' }]}>
            {data.realApplication}
          </Text>
        </View>
      </View>

      {/* Key Takeaway Banner */}
      <View style={[styles.takeawayBanner, { backgroundColor: isDark ? '#172554' : '#F0FDF4', borderColor: '#86EFAC' }]}>
        <Ionicons name="sparkles" size={16} color="#16A34A" />
        <Text style={[styles.takeawayText, { color: isDark ? colors.textPrimary : '#14532D' }]}>
          <Text style={{ fontWeight: '800' }}>Key Takeaway: </Text>
          {data.keyTakeaway}
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
    gap: 7,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  grid: {
    gap: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  itemBox: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  itemText: {
    fontSize: 13,
    lineHeight: 19,
  },
  takeawayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
  },
  takeawayText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
