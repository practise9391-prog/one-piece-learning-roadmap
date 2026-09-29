import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { KeyTermItem } from '../../../models/TopicContent';

interface KeyTermsViewerProps {
  terms: KeyTermItem[];
  onSelectRelatedTopic?: (topic: string) => void;
}

export const KeyTermsViewer: React.FC<KeyTermsViewerProps> = ({
  terms,
  onSelectRelatedTopic,
}) => {
  const { colors, isDark } = useTheme();
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);

  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="key-outline" size={18} color="#0D9488" />
        <Text style={[styles.title, { color: colors.textPrimary }]}>KEY VOCABULARY & TERMS</Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Tap any term to reveal in-depth definitions and syntax examples:
      </Text>

      <View style={styles.termsGrid}>
        {terms.map((t, idx) => {
          const isExpanded = selectedTerm === t.term;
          return (
            <TouchableOpacity
              key={`term-${idx}`}
              onPress={() => setSelectedTerm(isExpanded ? null : t.term)}
              style={[
                styles.termCard,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F0FDFA',
                  borderColor: isExpanded ? '#0D9488' : isDark ? colors.border : '#CCFBF1',
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={styles.termHeaderRow}>
                <View style={styles.termLeft}>
                  <Ionicons
                    name={isExpanded ? 'chevron-down' : 'chevron-forward'}
                    size={14}
                    color="#0D9488"
                  />
                  <Text style={[styles.termTitle, { color: isDark ? colors.textPrimary : '#115E59' }]}>
                    {t.term}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>TERM</Text>
                </View>
              </View>

              <Text style={[styles.termDef, { color: colors.textSecondary }]}>{t.definition}</Text>

              {isExpanded && (
                <View style={[styles.expandedBox, { borderTopColor: isDark ? colors.border : '#CCFBF1' }]}>
                  {t.simpleExample && (
                    <View style={styles.exampleRow}>
                      <Text style={styles.exampleLabel}>Example:</Text>
                      <Text style={[styles.exampleCode, { color: isDark ? '#38BDF8' : '#0284C7' }]}>
                        {t.simpleExample}
                      </Text>
                    </View>
                  )}

                  {t.relatedTopic && (
                    <TouchableOpacity
                      onPress={() => onSelectRelatedTopic && onSelectRelatedTopic(t.relatedTopic!)}
                      style={styles.relatedRow}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="link-outline" size={13} color="#0D9488" />
                      <Text style={styles.relatedText}>
                        Related: <Text style={{ textDecorationLine: 'underline' }}>{t.relatedTopic}</Text>
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </TouchableOpacity>
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
  termsGrid: {
    gap: Spacing.sm,
  },
  termCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
  },
  termHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  termLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  termTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  badge: {
    backgroundColor: '#0D9488',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  termDef: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  expandedBox: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    gap: 6,
  },
  exampleRow: {
    flexDirection: 'column',
    gap: 2,
  },
  exampleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  exampleCode: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  relatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  relatedText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: '700',
  },
});
