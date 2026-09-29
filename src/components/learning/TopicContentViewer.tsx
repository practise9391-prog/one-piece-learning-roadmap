import { AlgorithmVisualLabWidget } from './AlgorithmVisualLabWidget';
import { SystemDesignDiagramWidget } from './SystemDesignDiagramWidget';
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

      
            {/* EXPLAIN LIKE I'M 5 */}
      {content.elif5Story && (
        <View style={styles.elif5Card}>
          <View style={styles.elif5Header}>
            <Ionicons name="sparkles" size={16} color="#EC4899" />
            <Text style={styles.elif5HeaderText}>EXPLAIN LIKE I'M 5</Text>
          </View>
          <Text style={styles.elif5Text}>{content.elif5Story}</Text>
        </View>
      )}

      {/* SYSTEM DESIGN REAL-WORLD ANALOGY */}
      {content.analogy && (
        <View style={styles.analogyCard}>
          <View style={styles.analogyHeader}>
            <Ionicons name="bulb" size={16} color="#F59E0B" />
            <Text style={styles.analogyHeaderText}>{content.analogy.title || 'REAL-WORLD ANALOGY'}</Text>
          </View>
          <Text style={styles.analogyScenario}>{content.analogy.scenario}</Text>
          {content.analogy.mapping && content.analogy.mapping.length > 0 && (
            <View style={styles.mappingTable}>
              {content.analogy.mapping.map((m, idx) => (
                <View key={"map-" + idx} style={styles.mappingRow}>
                  <View style={styles.mappingLeft}>
                    <Text style={styles.mappingReal}>{m.realWorld}</Text>
                    <Ionicons name="arrow-forward" size={12} color="#6366F1" />
                    <Text style={styles.mappingSys}>{m.systemDesign}</Text>
                  </View>
                  <Text style={styles.mappingExpl}>{m.explanation}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* SYSTEM DESIGN ARCHITECTURE DIAGRAM */}
      {content.architectureFlow && (
        <SystemDesignDiagramWidget data={content.architectureFlow} />
      )}

      {/* SYSTEM DESIGN TRADE-OFFS */}
      {content.tradeOffs && (
        <View style={styles.tradeOffCard}>
          <View style={styles.tradeOffHeader}>
            <Ionicons name="git-compare-outline" size={16} color="#6366F1" />
            <Text style={styles.tradeOffHeaderText}>{content.tradeOffs.title || 'ARCHITECTURAL TRADE-OFFS'}</Text>
          </View>
          <View style={styles.tradeOffTable}>
            <View style={styles.tradeOffTableHeader}>
              <Text style={[styles.tradeOffColHeader, { flex: 1 }]}>Criterion</Text>
              <Text style={[styles.tradeOffColHeader, { flex: 1.2, color: '#38BDF8' }]}>{content.tradeOffs.optionA}</Text>
              <Text style={[styles.tradeOffColHeader, { flex: 1.2, color: '#A78BFA' }]}>{content.tradeOffs.optionB}</Text>
            </View>
            {content.tradeOffs.comparison.map((row, idx) => (
              <View key={"comp-" + idx} style={styles.tradeOffTableRow}>
                <Text style={[styles.tradeOffCell, styles.tradeOffCriterion]}>{row.criterion}</Text>
                <Text style={styles.tradeOffCell}>{row.optionA}</Text>
                <Text style={styles.tradeOffCell}>{row.optionB}</Text>
              </View>
            ))}
          </View>
          <View style={styles.recommendationBox}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={styles.recommendationText}>
              <Text style={{ fontWeight: '800' }}>When to Choose: </Text>
              {content.tradeOffs.recommendation}
            </Text>
          </View>
        </View>
      )}

      
      {/* ALGORITHM VISUAL LAB WIDGET */}
      {content.algorithmLabData && (
        <AlgorithmVisualLabWidget data={content.algorithmLabData} />
      )}

      {/* INTERNAL MECHANICS (UNDER THE HOOD) */}
      {content.internalMechanics && (
        <View style={styles.mechanicsCard}>
          <View style={styles.mechanicsHeader}>
            <Ionicons name="cog-outline" size={16} color="#00D8FE" />
            <Text style={styles.mechanicsHeaderText}>UNDER THE HOOD / INTERNAL MECHANICS</Text>
          </View>
          <Text style={styles.mechanicsText}>{content.internalMechanics}</Text>
        </View>
      )}

      {/* APPROACH PROGRESSION (BRUTE FORCE -> BETTER -> OPTIMAL) */}
      {content.approachProgression && content.approachProgression.length > 0 && (
        <View style={styles.progressionCard}>
          <View style={styles.progressionHeader}>
            <Ionicons name="trending-up-outline" size={16} color="#10B981" />
            <Text style={styles.progressionHeaderText}>BRUTE FORCE → BETTER → OPTIMAL</Text>
          </View>
          {content.approachProgression.map((app, aIdx) => (
            <View key={'app-' + aIdx} style={styles.approachBox}>
              <View style={styles.approachTopRow}>
                <View
                  style={[
                    styles.approachBadge,
                    app.type === 'OPTIMAL'
                      ? styles.approachBadgeOpt
                      : app.type === 'BETTER'
                      ? styles.approachBadgeBetter
                      : styles.approachBadgeBrute,
                  ]}
                >
                  <Text style={styles.approachBadgeText}>{app.name} ({app.type})</Text>
                </View>
                <Text style={styles.complexityTag}>{app.complexity}</Text>
              </View>
              <Text style={styles.approachExpl}>{app.explanation}</Text>
              <CodeBlock code={app.code} language="python" />
              {app.bottleneck && (
                <View style={styles.bottleneckRow}>
                  <Ionicons name="alert-circle-outline" size={14} color="#F59E0B" />
                  <Text style={styles.bottleneckText}>
                    <Text style={{ fontWeight: '700' }}>Bottleneck: </Text>
                    {app.bottleneck}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}

      {/* COMPLEXITY ANALYSIS */}
      {content.complexityAnalysis && (
        <View style={styles.complexityCard}>
          <View style={styles.complexityHeader}>
            <Ionicons name="speedometer-outline" size={16} color="#3B82F6" />
            <Text style={styles.complexityHeaderText}>COMPLEXITY ANALYSIS</Text>
          </View>
          <View style={styles.complexityGrid}>
            <View style={styles.complexityCol}>
              <Text style={styles.complexityLabel}>Best Case</Text>
              <Text style={styles.complexityVal}>{content.complexityAnalysis.timeBest}</Text>
            </View>
            <View style={styles.complexityCol}>
              <Text style={styles.complexityLabel}>Average</Text>
              <Text style={styles.complexityVal}>{content.complexityAnalysis.timeAvg}</Text>
            </View>
            <View style={styles.complexityCol}>
              <Text style={styles.complexityLabel}>Worst Case</Text>
              <Text style={styles.complexityVal}>{content.complexityAnalysis.timeWorst}</Text>
            </View>
            <View style={styles.complexityCol}>
              <Text style={styles.complexityLabel}>Space</Text>
              <Text style={styles.complexityVal}>{content.complexityAnalysis.space}</Text>
            </View>
          </View>
          <Text style={styles.complexityExpl}>{content.complexityAnalysis.explanation}</Text>
        </View>
      )}

      {/* MINI PROJECT SPEC */}
      {content.miniProject && (
        <View style={styles.projectCard}>
          <View style={styles.projectHeader}>
            <Ionicons name="rocket-outline" size={16} color="#8B5CF6" />
            <Text style={styles.projectHeaderText}>MINI PROJECT: {content.miniProject.title.toUpperCase()}</Text>
          </View>
          <Text style={styles.projectDesc}>{content.miniProject.description}</Text>
          {content.miniProject.keySteps && content.miniProject.keySteps.length > 0 && (
            <View style={styles.projectStepsBox}>
              {content.miniProject.keySteps.map((step, sIdx) => (
                <View key={'step-' + sIdx} style={styles.projectStepRow}>
                  <Text style={styles.stepNum}>{sIdx + 1}.</Text>
                  <Text style={styles.stepContent}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* 5 PRACTICE TASKS CHECKLIST */}
      {content.practiceTasksList && content.practiceTasksList.length > 0 && (
        <View style={styles.tasksListCard}>
          <View style={styles.tasksListHeader}>
            <Ionicons name="checkbox-outline" size={16} color="#10B981" />
            <Text style={styles.tasksListHeaderText}>5 TOPIC PRACTICE TASKS</Text>
          </View>
          {content.practiceTasksList.map((task, tIdx) => (
            <View key={'ptask-' + tIdx} style={styles.taskRow}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.taskTitle}>{task}</Text>
            </View>
          ))}
        </View>
      )}
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

      
      {/* SYSTEM DESIGN INTERVIEW QUESTIONS */}
      {content.interviewQuestions && content.interviewQuestions.length > 0 && (
        <View style={styles.interviewCard}>
          <View style={styles.interviewHeader}>
            <Ionicons name="school-outline" size={16} color="#EC4899" />
            <Text style={styles.interviewHeaderText}>SYSTEM DESIGN INTERVIEW QUESTIONS</Text>
          </View>
          {content.interviewQuestions.map((q, idx) => (
            <View key={"iq-" + idx} style={styles.interviewItem}>
              <Text style={styles.interviewQuestionText}>Q{idx + 1}: {q.question}</Text>
              <View style={styles.interviewAnswerBox}>
                <Text style={styles.interviewAnswerText}>{q.answer}</Text>
              </View>
              {q.tips ? (
                <Text style={styles.interviewTipText}>💡 Interviewer Tip: {q.tips}</Text>
              ) : null}
            </View>
          ))}
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

  analogyCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  analogyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  analogyHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.8,
  },
  analogyScenario: {
    fontSize: 13,
    lineHeight: 20,
    color: '#78350F',
    marginBottom: 10,
  },
  mappingTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  mappingRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  mappingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  mappingReal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  mappingSys: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  mappingExpl: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16,
  },
  tradeOffCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3730A3',
  },
  tradeOffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  tradeOffHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A5B4FC',
    letterSpacing: 0.8,
  },
  tradeOffTable: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tradeOffTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  tradeOffColHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  tradeOffTableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tradeOffCell: {
    flex: 1.2,
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  tradeOffCriterion: {
    flex: 1,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#064E3B',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  recommendationText: {
    fontSize: 11,
    color: '#A7F3D0',
    flex: 1,
    lineHeight: 16,
  },
  interviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  interviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  interviewHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#BE185D',
    letterSpacing: 0.8,
  },
  interviewItem: {
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDF2F8',
  },
  interviewQuestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#831843',
    marginBottom: 6,
  },
  interviewAnswerBox: {
    backgroundColor: '#FFF1F2',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F43F5E',
  },
  interviewAnswerText: {
    fontSize: 12,
    color: '#4C0519',
    lineHeight: 18,
  },
  interviewTipText: {
    fontSize: 11,
    color: '#9D174D',
    marginTop: 4,
    fontStyle: 'italic',
  },

  elif5Card: {
    backgroundColor: '#FDF2F8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#EC4899',
  },
  elif5Header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  elif5HeaderText: {
    color: '#BE185D',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  elif5Text: {
    color: '#831843',
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  mechanicsCard: {
    backgroundColor: '#F0FDFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#00D8FE',
  },
  mechanicsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  mechanicsHeaderText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mechanicsText: {
    color: '#0C4A6E',
    fontSize: 13,
    lineHeight: 19,
  },
  progressionCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  progressionHeaderText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  approachBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  approachTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  approachBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  approachBadgeBrute: {
    backgroundColor: '#FEE2E2',
  },
  approachBadgeBetter: {
    backgroundColor: '#FEF3C7',
  },
  approachBadgeOpt: {
    backgroundColor: '#D1FAE5',
  },
  approachBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  complexityTag: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  approachExpl: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  bottleneckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFBEB',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  bottleneckText: {
    color: '#B45309',
    fontSize: 11,
    flex: 1,
  },
  complexityCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  complexityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  complexityHeaderText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  complexityGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  complexityCol: {
    alignItems: 'center',
  },
  complexityLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  complexityVal: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  complexityExpl: {
    color: '#1E3A8A',
    fontSize: 12,
    lineHeight: 17,
  },
  projectCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  projectHeaderText: {
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  projectDesc: {
    color: '#4C1D95',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  projectStepsBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    gap: 6,
  },
  projectStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  stepNum: {
    color: '#8B5CF6',
    fontWeight: '700',
    fontSize: 12,
  },
  stepContent: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  tasksListCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  tasksListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tasksListHeaderText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  taskTitle: {
    color: '#065F46',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },

});
