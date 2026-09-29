import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { TopicContent } from '../../../models/TopicContent';

interface SearchResult {
  sectionKey: string;
  sectionTitle: string;
  preview: string;
  icon: string;
}

interface TopicSearchModalProps {
  visible: boolean;
  onClose: () => void;
  topicTitle: string;
  content: TopicContent;
  onSelectSection: (sectionKey: string) => void;
}

export const TopicSearchModal: React.FC<TopicSearchModalProps> = ({
  visible,
  onClose,
  topicTitle,
  content,
  onSelectSection,
}) => {
  const { colors, isDark } = useTheme();
  const [query, setQuery] = useState<string>('');

  const searchableSections: SearchResult[] = useMemo(() => {
    const list: SearchResult[] = [];

    if (content.explanation) {
      list.push({
        sectionKey: 'explanation',
        sectionTitle: 'Concept Explanation',
        preview: content.explanation.slice(0, 100) + '...',
        icon: 'book-outline',
      });
    }

    if (content.whyItMatters) {
      list.push({
        sectionKey: 'why_it_matters',
        sectionTitle: 'Why It Matters',
        preview: `${content.whyItMatters.whatProblemItSolves} ${content.whyItMatters.whyDevelopersUseIt}`.slice(0, 100) + '...',
        icon: 'shield-outline',
      });
    }

    if (content.realLifeExample) {
      list.push({
        sectionKey: 'real_life',
        sectionTitle: `Real-Life Analogy: ${content.realLifeExample.title}`,
        preview: content.realLifeExample.scenario.slice(0, 100) + '...',
        icon: 'bulb-outline',
      });
    }

    if (content.howItWorks) {
      list.push({
        sectionKey: 'how_it_works',
        sectionTitle: 'How It Works (Internal Pipeline)',
        preview: content.howItWorks.steps.map((s) => s.title).join(' ➔ '),
        icon: 'git-network-outline',
      });
    }

    if (content.keyTerms && content.keyTerms.length > 0) {
      list.push({
        sectionKey: 'key_terms',
        sectionTitle: 'Key Vocabulary & Terms',
        preview: content.keyTerms.map((t) => t.term).join(', '),
        icon: 'key-outline',
      });
    }

    if (content.syntaxStructure) {
      list.push({
        sectionKey: 'syntax',
        sectionTitle: 'Syntax & Code Structure',
        preview: content.syntaxStructure.template.slice(0, 100) + '...',
        icon: 'code-working-outline',
      });
    }

    if (content.executionSimulation) {
      list.push({
        sectionKey: 'execution',
        sectionTitle: 'Step-by-Step Code Execution',
        preview: content.executionSimulation.codeLines.join('\n').slice(0, 100) + '...',
        icon: 'play-forward-circle-outline',
      });
    }

    if (content.universalVisualization) {
      list.push({
        sectionKey: 'visualization',
        sectionTitle: `Interactive ${content.universalVisualization.type.toUpperCase()} Visualization`,
        preview: content.universalVisualization.explanation || 'Interactive visual state machine',
        icon: 'sparkles-outline',
      });
    }

    if (content.detailedExamples && content.detailedExamples.length > 0) {
      list.push({
        sectionKey: 'examples',
        sectionTitle: 'Detailed Code Examples',
        preview: content.detailedExamples.map((e) => e.title).join(' | '),
        icon: 'code-slash-outline',
      });
    }

    if (content.commonMistakes && content.commonMistakes.length > 0) {
      list.push({
        sectionKey: 'mistakes',
        sectionTitle: 'Common Mistakes & Fixes',
        preview: content.commonMistakes.map((m) => m.mistake).join(', ').slice(0, 100) + '...',
        icon: 'alert-circle-outline',
      });
    }

    if (content.beforeVsAfter) {
      list.push({
        sectionKey: 'before_after',
        sectionTitle: 'Before vs After Architecture',
        preview: `${content.beforeVsAfter.withoutConcept.title} vs ${content.beforeVsAfter.withConcept.title}`,
        icon: 'git-compare-outline',
      });
    }

    if (content.comparisonTable) {
      list.push({
        sectionKey: 'comparison',
        sectionTitle: `Comparison: ${content.comparisonTable.title}`,
        preview: `${content.comparisonTable.conceptA} vs ${content.comparisonTable.conceptB}`,
        icon: 'swap-horizontal-outline',
      });
    }

    if (content.practiceProblem) {
      list.push({
        sectionKey: 'practice',
        sectionTitle: 'Topic Practice Drill',
        preview: content.practiceProblem.question.slice(0, 100) + '...',
        icon: 'pencil-outline',
      });
    }

    if (content.quizQuestions && content.quizQuestions.length > 0) {
      list.push({
        sectionKey: 'quiz',
        sectionTitle: 'Topic Knowledge Quiz',
        preview: `${content.quizQuestions.length} multiple-choice assessment questions`,
        icon: 'help-circle-outline',
      });
    }

    if (content.interviewQuestionsList && content.interviewQuestionsList.length > 0) {
      list.push({
        sectionKey: 'interview',
        sectionTitle: 'Topic Interview Questions',
        preview: content.interviewQuestionsList.map((q) => q.question).join(', ').slice(0, 100) + '...',
        icon: 'chatbubbles-outline',
      });
    }

    if (content.memoryCards && content.memoryCards.length > 0) {
      list.push({
        sectionKey: 'memory_cards',
        sectionTitle: 'Active Recall Memory Cards',
        preview: `${content.memoryCards.length} revision flashcards with flip reveal`,
        icon: 'albums-outline',
      });
    }

    if (content.oneMinuteRevision) {
      list.push({
        sectionKey: 'one_minute',
        sectionTitle: '⚡ 1-Minute Revision',
        preview: `What? ${content.oneMinuteRevision.what.slice(0, 80)}...`,
        icon: 'flash-outline',
      });
    }

    if (content.cheatSheet) {
      list.push({
        sectionKey: 'cheat_sheet',
        sectionTitle: 'Compact Topic Cheat Sheet',
        preview: content.cheatSheet.keyRules.join(' | ').slice(0, 100) + '...',
        icon: 'document-text-outline',
      });
    }

    if (content.finalTestQuestions && content.finalTestQuestions.length > 0) {
      list.push({
        sectionKey: 'final_test',
        sectionTitle: 'Final Topic Assessment',
        preview: `${content.finalTestQuestions.length} comprehensive evaluation questions`,
        icon: 'trophy-outline',
      });
    }

    return list;
  }, [content]);

  const filteredResults = useMemo(() => {
    if (!query.trim()) return searchableSections;
    const qLower = query.toLowerCase().trim();
    return searchableSections.filter(
      (sec) =>
        sec.sectionTitle.toLowerCase().includes(qLower) ||
        sec.preview.toLowerCase().includes(qLower)
    );
  }, [query, searchableSections]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.surfaceCard, borderColor: colors.border },
          ]}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={styles.titleWithIcon}>
              <Ionicons name="search" size={20} color={colors.primary} />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Search Inside Topic
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Search Input Box */}
          <View
            style={[
              styles.inputBox,
              { backgroundColor: isDark ? '#020617' : '#F1F5F9', borderColor: colors.border },
            ]}
          >
            <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              value={query}
              onChangeText={setQuery}
              placeholder={`Search "${topicTitle}" sections, code, terms...`}
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Results List */}
          <ScrollView contentContainerStyle={styles.resultsList} showsVerticalScrollIndicator={false}>
            {filteredResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={32} color={colors.textTertiary} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No sections matching "{query}" found in this topic.
                </Text>
              </View>
            ) : (
              filteredResults.map((res, idx) => (
                <TouchableOpacity
                  key={`res-${idx}`}
                  onPress={() => {
                    onSelectSection(res.sectionKey);
                    onClose();
                  }}
                  style={[
                    styles.resultItem,
                    { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border },
                  ]}
                  activeOpacity={0.75}
                >
                  <View style={[styles.itemIconBadge, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                    <Ionicons name={res.icon as any} size={16} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>
                      {res.sectionTitle}
                    </Text>
                    <Text style={[styles.itemPreview, { color: colors.textSecondary }]} numberOfLines={2}>
                      {res.preview}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color={colors.textTertiary} />
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderTopWidth: 2,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: Spacing.lg,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 8,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  resultsList: {
    gap: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 12,
  },
  itemIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  itemPreview: {
    fontSize: 11,
    lineHeight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
