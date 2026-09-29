import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { OneMinuteRevisionData } from '../../../models/TopicContent';

interface OneMinuteRevisionViewerProps {
  data: OneMinuteRevisionData;
}

export const OneMinuteRevisionViewer: React.FC<OneMinuteRevisionViewerProps> = ({ data }) => {
  const { colors, isDark } = useTheme();

  const revisionItems = [
    { label: 'WHAT?', icon: 'bulb-outline', color: '#F59E0B', text: data.what },
    { label: 'WHY?', icon: 'help-circle-outline', color: '#3B82F6', text: data.why },
    { label: 'IMPORTANT SYNTAX?', icon: 'code-slash', color: '#10B981', text: data.importantSyntax },
    { label: 'IMPORTANT RULE?', icon: 'shield-checkmark-outline', color: '#8B5CF6', text: data.importantRule },
    { label: 'COMMON MISTAKE?', icon: 'alert-circle-outline', color: '#EF4444', text: data.commonMistake },
    { label: 'REAL-WORLD USE?', icon: 'globe-outline', color: '#06B6D4', text: data.realWorldUse },
    { label: 'TOP INTERVIEW QUESTION?', icon: 'school-outline', color: '#EC4899', text: data.interviewQuestion },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: '#F59E0B' }]}>
      <View style={styles.header}>
        <Ionicons name="flash" size={18} color="#F59E0B" />
        <Text style={[styles.title, { color: '#D97706' }]}>⚡ 1-MINUTE HIGH-SPEED REVISION</Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Scan these core facts right before interviews or tests:
      </Text>

      <View style={styles.itemsList}>
        {revisionItems.map((item, idx) => (
          <View
            key={`rev-${idx}`}
            style={[
              styles.row,
              { backgroundColor: isDark ? '#0F172A' : '#FFFBEB', borderColor: isDark ? colors.border : '#FDE68A' },
            ]}
          >
            <View style={styles.labelCol}>
              <Ionicons name={item.icon as any} size={14} color={item.color} />
              <Text style={[styles.labelText, { color: item.color }]}>{item.label}</Text>
            </View>
            <Text style={[styles.textValue, { color: colors.textPrimary }]}>{item.text}</Text>
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
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },
  itemsList: {
    gap: 8,
  },
  row: {
    padding: Spacing.sm + 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    gap: 4,
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  textValue: {
    fontSize: 12,
    lineHeight: 18,
  },
});
