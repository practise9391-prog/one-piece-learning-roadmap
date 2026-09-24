import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TopicContent } from '../../models/TopicContent';
import { CodeBlock } from '../common/CodeBlock';
import { Colors } from '../../theme/colors';

interface TopicContentViewerProps {
  content: TopicContent;
}

export const TopicContentViewer: React.FC<TopicContentViewerProps> = ({ content }) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="book-outline" size={16} color={Colors.primary} />
          <Text style={styles.sectionHeaderText}>CONCEPT EXPLANATION</Text>
        </View>
        <Text style={styles.explanationText}>{content.explanation}</Text>
      </View>

      {content.codeSnippet && (
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="code-slash" size={16} color="#0284C7" />
            <Text style={styles.sectionHeaderText}>CODE DEMONSTRATION</Text>
          </View>
          <CodeBlock
            code={content.codeSnippet.code}
            language={content.codeSnippet.language}
            output={content.codeSnippet.output}
          />
        </View>
      )}

      {content.tips && content.tips.length > 0 && (
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={16} color="#D97706" />
            <Text style={styles.tipsHeaderText}>PIRATE NAVIGATOR TIPS</Text>
          </View>
          {content.tips.map((tip, idx) => (
            <View key={`tip-${idx}`} style={styles.bulletRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {content.importantPoints && content.importantPoints.length > 0 && (
        <View style={styles.importantCard}>
          <View style={styles.importantHeader}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#059669" />
            <Text style={styles.importantHeaderText}>KEY TAKEAWAYS</Text>
          </View>
          {content.importantPoints.map((point, idx) => (
            <View key={`pt-${idx}`} style={styles.bulletRow}>
              <Ionicons name="checkmark-done" size={14} color="#10B981" style={styles.checkIcon} />
              <Text style={styles.importantText}>{point}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    gap: 12,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1E293B',
  },
  tipsCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  tipsHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
    gap: 6,
  },
  tipBullet: {
    fontSize: 14,
    color: '#D97706',
    lineHeight: 18,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#78350F',
  },
  importantCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  importantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  importantHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  checkIcon: {
    marginTop: 2,
  },
  importantText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#064E3B',
    fontWeight: '500',
  },
});
