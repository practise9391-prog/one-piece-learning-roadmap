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
      {/* 1. CONCEPT EXPLANATION */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Ionicons name="book-outline" size={16} color={Colors.primary} />
          <Text style={styles.sectionHeaderText}>CONCEPT EXPLANATION</Text>
        </View>
        <Text style={styles.explanationText}>{content.explanation}</Text>
      </View>

      {/* 2. FORMULA CARD (APTITUDE & MATH) */}
      {content.formulaCard && (
        <View style={styles.formulaCard}>
          <View style={styles.formulaHeader}>
            <Ionicons name="calculator-outline" size={16} color="#B45309" />
            <Text style={styles.formulaHeaderText}>
              {content.formulaCard.title || 'KEY FORMULA / SHORTCUT'}
            </Text>
          </View>
          <View style={styles.formulaBox}>
            <Text style={styles.formulaText}>{content.formulaCard.formula}</Text>
          </View>
          {content.formulaCard.explanation ? (
            <Text style={styles.formulaExplanation}>{content.formulaCard.explanation}</Text>
          ) : null}
        </View>
      )}

      {/* 3. ESSENTIAL VOCABULARY (ENGLISH / VERBAL / SPEAKING) */}
      {content.vocabulary && content.vocabulary.length > 0 && (
        <View style={styles.vocabCard}>
          <View style={styles.vocabHeader}>
            <Ionicons name="text-outline" size={16} color="#0D9488" />
            <Text style={styles.vocabHeaderText}>ESSENTIAL VOCABULARY</Text>
          </View>
          {content.vocabulary.map((v, idx) => (
            <View key={`voc-${idx}`} style={styles.vocabItem}>
              <View style={styles.vocabRow}>
                <Text style={styles.vocabWord}>{v.word}</Text>
                <Text style={styles.vocabMeaning}>— {v.meaning}</Text>
              </View>
              <Text style={styles.vocabExample}>e.g. "{v.example}"</Text>
            </View>
          ))}
        </View>
      )}

      {/* 4. REAL-LIFE CONVERSATION / DIALOGUE (ENGLISH SPEAKING) */}
      {content.dialogue && content.dialogue.length > 0 && (
        <View style={styles.dialogueCard}>
          <View style={styles.dialogueHeader}>
            <Ionicons name="chatbubbles-outline" size={16} color="#059669" />
            <Text style={styles.dialogueHeaderText}>EXAMPLE CONVERSATION</Text>
          </View>
          {content.dialogue.map((d, idx) => (
            <View key={`dia-${idx}`} style={styles.dialogueRow}>
              <Text style={styles.dialogueSpeaker}>{d.speaker}:</Text>
              <Text style={styles.dialogueText}>"{d.text}"</Text>
            </View>
          ))}
        </View>
      )}

      {/* 5. CODE DEMONSTRATION (IF APPLICABLE) */}
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

      {/* 6. COMMON MISTAKES & CORRECTIONS */}
      {content.commonMistakes && content.commonMistakes.length > 0 && (
        <View style={styles.mistakesCard}>
          <View style={styles.mistakesHeader}>
            <Ionicons name="alert-circle-outline" size={16} color="#DC2626" />
            <Text style={styles.mistakesHeaderText}>COMMON MISTAKES & CORRECTIONS</Text>
          </View>
          {content.commonMistakes.map((m, idx) => (
            <View key={`mis-${idx}`} style={styles.mistakeItem}>
              <View style={styles.mistakeRow}>
                <Ionicons name="close-circle" size={14} color="#EF4444" style={{ marginTop: 2 }} />
                <Text style={styles.wrongText}>Incorrect: {m.mistake}</Text>
              </View>
              <View style={styles.mistakeRow}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginTop: 2 }} />
                <Text style={styles.correctText}>Better: {m.correction}</Text>
              </View>
              {m.explanation ? (
                <Text style={styles.mistakeExplanation}>{m.explanation}</Text>
              ) : null}
            </View>
          ))}
        </View>
      )}

      {/* 7. BETTER WAYS TO SAY IT */}
      {content.betterWays && content.betterWays.length > 0 && (
        <View style={styles.betterWaysCard}>
          <View style={styles.betterWaysHeader}>
            <Ionicons name="sparkles-outline" size={16} color="#2563EB" />
            <Text style={styles.betterWaysHeaderText}>BETTER WAYS TO SAY IT</Text>
          </View>
          {content.betterWays.map((bw, idx) => (
            <View key={`bw-${idx}`} style={styles.betterWaysRow}>
              <Ionicons name="arrow-forward" size={12} color="#3B82F6" style={{ marginTop: 3 }} />
              <Text style={styles.betterWaysText}>{bw}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 8. PRACTICE DRILL & SOLUTION */}
      {content.practiceProblem && (
        <View style={styles.practiceCard}>
          <View style={styles.practiceHeader}>
            <Ionicons name="pencil-outline" size={16} color="#4F46E5" />
            <Text style={styles.practiceHeaderText}>PRACTICE DRILL</Text>
          </View>
          <Text style={styles.practiceQuestion}>{content.practiceProblem.question}</Text>
          {content.practiceProblem.hint ? (
            <Text style={styles.practiceHint}>💡 Hint: {content.practiceProblem.hint}</Text>
          ) : null}
          <View style={styles.solutionBox}>
            <Text style={styles.solutionLabel}>SOLUTION / WALKTHROUGH:</Text>
            <Text style={styles.solutionText}>{content.practiceProblem.solution}</Text>
          </View>
        </View>
      )}

      {/* 9. USER SPEAKING TASK */}
      {content.speakingPrompt && (
        <View style={styles.speakingTaskCard}>
          <View style={styles.speakingTaskHeader}>
            <Ionicons name="mic-outline" size={16} color="#059669" />
            <Text style={styles.speakingTaskHeaderText}>YOUR SPEAKING TASK</Text>
          </View>
          <Text style={styles.speakingTaskText}>{content.speakingPrompt}</Text>
        </View>
      )}

      {/* 10. TIPS */}
      {content.tips && content.tips.length > 0 && (
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={16} color="#D97706" />
            <Text style={styles.tipsHeaderText}>EXPERT STRATEGY TIPS</Text>
          </View>
          {content.tips.map((tip, idx) => (
            <View key={`tip-${idx}`} style={styles.bulletRow}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 11. KEY TAKEAWAYS */}
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
  formulaCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  formulaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  formulaHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.8,
  },
  formulaBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
    marginBottom: 8,
  },
  formulaText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  formulaExplanation: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 18,
  },
  vocabCard: {
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  vocabHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  vocabHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F766E',
    letterSpacing: 0.8,
  },
  vocabItem: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCFBF1',
    paddingBottom: 6,
  },
  vocabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  vocabWord: {
    fontSize: 13,
    fontWeight: '800',
    color: '#115E59',
  },
  vocabMeaning: {
    fontSize: 12,
    color: '#0F766E',
  },
  vocabExample: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#134E4A',
    marginTop: 2,
  },
  dialogueCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dialogueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  dialogueHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  dialogueRow: {
    marginBottom: 6,
  },
  dialogueSpeaker: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  dialogueText: {
    fontSize: 13,
    color: '#064E3B',
    lineHeight: 18,
    marginLeft: 6,
  },
  mistakesCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  mistakesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  mistakesHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#991B1B',
    letterSpacing: 0.8,
  },
  mistakeItem: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
    paddingBottom: 8,
  },
  mistakeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 3,
  },
  wrongText: {
    flex: 1,
    fontSize: 12,
    color: '#DC2626',
    textDecorationLine: 'line-through',
  },
  correctText: {
    flex: 1,
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  mistakeExplanation: {
    fontSize: 11,
    color: '#7F1D1D',
    marginTop: 2,
    marginLeft: 20,
  },
  betterWaysCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  betterWaysHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  betterWaysHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.8,
  },
  betterWaysRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginVertical: 3,
  },
  betterWaysText: {
    flex: 1,
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  practiceCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  practiceHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#3730A3',
    letterSpacing: 0.8,
  },
  practiceQuestion: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E1B4B',
    marginBottom: 6,
    lineHeight: 19,
  },
  practiceHint: {
    fontSize: 11,
    color: '#4338CA',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  solutionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  solutionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6366F1',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  solutionText: {
    fontSize: 12,
    color: '#312E81',
    lineHeight: 18,
  },
  speakingTaskCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#34D399',
  },
  speakingTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  speakingTaskHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.8,
  },
  speakingTaskText: {
    fontSize: 13,
    color: '#064E3B',
    fontWeight: '600',
    lineHeight: 20,
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
