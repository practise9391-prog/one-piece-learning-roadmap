import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { DetailedExampleItem } from '../../../models/TopicContent';
import { CodeBlock } from '../../common/CodeBlock';

interface DetailedExamplesViewerProps {
  examples: DetailedExampleItem[];
}

export const DetailedExamplesViewer: React.FC<DetailedExamplesViewerProps> = ({ examples }) => {
  const { colors, isDark } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  if (!examples || examples.length === 0) return null;

  const activeExample = examples[selectedIndex] || examples[0];

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="code-slash-outline" size={18} color="#0284C7" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>MULTIPLE CODE EXAMPLES</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { backgroundColor: isDark ? '#0B132B' : '#F1F5F9' }]}>
        {examples.map((ex, idx) => {
          const isActive = idx === selectedIndex;
          return (
            <TouchableOpacity
              key={`ex-tab-${idx}`}
              onPress={() => setSelectedIndex(idx)}
              style={[
                styles.tabBtn,
                isActive && [styles.tabBtnActive, { backgroundColor: colors.primary }],
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, { color: isActive ? '#FFFFFF' : colors.textSecondary }]}>
                {ex.type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Example Details */}
      <View style={styles.detailsContainer}>
        <Text style={[styles.exampleTitle, { color: colors.textPrimary }]}>
          {activeExample.title}
        </Text>
        <Text style={[styles.exampleExpl, { color: colors.textSecondary }]}>
          {activeExample.explanation}
        </Text>

        {activeExample.code && (
          <CodeBlock
            code={activeExample.code}
            language={activeExample.language || 'python'}
            output={activeExample.output}
            topicTitle={activeExample.title}
          />
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
  tabsRow: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.md,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailsContainer: {
    gap: 6,
  },
  exampleTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  exampleExpl: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
});
