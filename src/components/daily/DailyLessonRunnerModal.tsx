import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { DailyLearningTask, DailyPracticeQuestion } from '../../models/DailyLearning';
import { dailyLearningRepository } from '../../repositories/DailyLearningRepository';

interface DailyLessonRunnerModalProps {
  visible: boolean;
  task: DailyLearningTask | null;
  onClose: () => void;
  onTaskCompleted: (task: DailyLearningTask) => void;
}

type LessonTab = 'LEARN' | 'FORMULAS' | 'EXAMPLES' | 'PRACTICE' | 'SPEAKING' | 'CODING' | 'RESULT';

export const DailyLessonRunnerModal: React.FC<DailyLessonRunnerModalProps> = ({
  visible,
  task,
  onClose,
  onTaskCompleted,
}) => {
  if (!task) return null;

  const lessonData = task.lessonData;
  const isSpeaking = task.category === 'SPEAKING' || !!lessonData?.speakingTask;
  const isCoding = task.category === 'CODING' || !!lessonData?.codingChallenge;
  const hasPractice = (lessonData?.practiceQuestions || []).length > 0;

  const [currentTab, setCurrentTab] = useState<LessonTab>('LEARN');
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [answeredSubmitted, setAnsweredSubmitted] = useState<Record<number, boolean>>({});
  const [startTime] = useState<number>(Date.now());
  const [speakingPhase, setSpeakingPhase] = useState<'PREP' | 'SPEAKING' | 'DONE'>('PREP');
  const [speakingSecondsLeft, setSpeakingSecondsLeft] = useState<number>(
    lessonData?.speakingTask?.preparationSeconds || 45
  );
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [confidenceRating, setConfidenceRating] = useState<number>(4);

  // Timer for speaking drill
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && speakingSecondsLeft > 0) {
      interval = setInterval(() => {
        setSpeakingSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (speakingSecondsLeft === 0 && timerRunning) {
      if (speakingPhase === 'PREP') {
        setSpeakingPhase('SPEAKING');
        setSpeakingSecondsLeft(lessonData?.speakingTask?.speakingSeconds || 90);
      } else {
        setSpeakingPhase('DONE');
        setTimerRunning(false);
      }
    }
    return () => clearInterval(interval);
  }, [timerRunning, speakingSecondsLeft, speakingPhase]);

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (answeredSubmitted[qIdx]) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
    setAnsweredSubmitted((prev) => ({ ...prev, [qIdx]: true }));
  };

  const calculateScore = () => {
    const questions = lessonData?.practiceQuestions || [];
    if (questions.length === 0) return { score: 1, total: 1, accuracy: 100 };

    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });

    const accuracy = Math.round((correct / questions.length) * 100);
    return { score: correct, total: questions.length, accuracy };
  };

  const handleFinishLesson = async () => {
    const durationSeconds = Math.max(30, Math.round((Date.now() - startTime) / 1000));
    const { score, total, accuracy } = calculateScore();
    const xp = accuracy >= 80 ? 40 : 25;

    try {
      await dailyLearningRepository.completeTask(task.id, {
        score,
        totalQuestions: total,
        accuracy,
        timeSpentSeconds: durationSeconds,
        xpEarned: xp,
      });

      onTaskCompleted({
        ...task,
        status: 'COMPLETED',
        score,
        totalQuestions: total,
        accuracy,
        xpEarned: xp,
      });

      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to save completed task. Please try again.');
    }
  };

  const questions: DailyPracticeQuestion[] = lessonData?.practiceQuestions || [];
  const currentQ = questions[activeQuestionIdx];
  const { score, total, accuracy } = calculateScore();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeContainer}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <View style={styles.headerTitleCol}>
            <Text style={styles.categoryBadgeText}>{task.category.replace('_', ' ')}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {task.title}
            </Text>
          </View>
          <View style={[styles.diffBadge, { backgroundColor: getDifficultyBg(task.difficulty) }]}>
            <Text style={[styles.diffText, { color: getDifficultyColor(task.difficulty) }]}>
              {task.difficulty}
            </Text>
          </View>
        </View>

        {/* TABS NAVIGATION */}
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tabBtn, currentTab === 'LEARN' && styles.tabBtnActive]}
            onPress={() => setCurrentTab('LEARN')}
          >
            <Ionicons name="book-outline" size={16} color={currentTab === 'LEARN' ? Colors.primary : '#64748B'} />
            <Text style={[styles.tabText, currentTab === 'LEARN' && styles.tabTextActive]}>Concept</Text>
          </TouchableOpacity>

          {(lessonData?.formulasAndRules || []).length > 0 && (
            <TouchableOpacity
              style={[styles.tabBtn, currentTab === 'FORMULAS' && styles.tabBtnActive]}
              onPress={() => setCurrentTab('FORMULAS')}
            >
              <Ionicons name="calculator-outline" size={16} color={currentTab === 'FORMULAS' ? Colors.primary : '#64748B'} />
              <Text style={[styles.tabText, currentTab === 'FORMULAS' && styles.tabTextActive]}>Rules</Text>
            </TouchableOpacity>
          )}

          {(lessonData?.workedExamples || []).length > 0 && (
            <TouchableOpacity
              style={[styles.tabBtn, currentTab === 'EXAMPLES' && styles.tabBtnActive]}
              onPress={() => setCurrentTab('EXAMPLES')}
            >
              <Ionicons name="bulb-outline" size={16} color={currentTab === 'EXAMPLES' ? Colors.primary : '#64748B'} />
              <Text style={[styles.tabText, currentTab === 'EXAMPLES' && styles.tabTextActive]}>Examples</Text>
            </TouchableOpacity>
          )}

          {hasPractice && (
            <TouchableOpacity
              style={[styles.tabBtn, currentTab === 'PRACTICE' && styles.tabBtnActive]}
              onPress={() => setCurrentTab('PRACTICE')}
            >
              <Ionicons name="create-outline" size={16} color={currentTab === 'PRACTICE' ? Colors.primary : '#64748B'} />
              <Text style={[styles.tabText, currentTab === 'PRACTICE' && styles.tabTextActive]}>
                Quiz ({questions.length})
              </Text>
            </TouchableOpacity>
          )}

          {isSpeaking && (
            <TouchableOpacity
              style={[styles.tabBtn, currentTab === 'SPEAKING' && styles.tabBtnActive]}
              onPress={() => setCurrentTab('SPEAKING')}
            >
              <Ionicons name="mic-outline" size={16} color={currentTab === 'SPEAKING' ? Colors.primary : '#64748B'} />
              <Text style={[styles.tabText, currentTab === 'SPEAKING' && styles.tabTextActive]}>Speak</Text>
            </TouchableOpacity>
          )}

          {isCoding && (
            <TouchableOpacity
              style={[styles.tabBtn, currentTab === 'CODING' && styles.tabBtnActive]}
              onPress={() => setCurrentTab('CODING')}
            >
              <Ionicons name="code-slash-outline" size={16} color={currentTab === 'CODING' ? Colors.primary : '#64748B'} />
              <Text style={[styles.tabText, currentTab === 'CODING' && styles.tabTextActive]}>Code</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CONTENT BODY */}
        <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
          {/* TAB 1: LEARN & UNDERSTAND */}
          {currentTab === 'LEARN' && (
            <View>
              <View style={styles.cardSection}>
                <View style={styles.cardHeader}>
                  <Ionicons name="compass-outline" size={20} color={Colors.primary} />
                  <Text style={styles.cardTitle}>Core Concept</Text>
                </View>
                <Text style={styles.cardBodyText}>
                  {lessonData?.conceptSummary || 'Understand the core concepts of this lesson.'}
                </Text>
              </View>

              {lessonData?.understandingAnalogy ? (
                <View style={[styles.cardSection, styles.analogyCard]}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="bulb" size={20} color="#D97706" />
                    <Text style={[styles.cardTitle, { color: '#B45309' }]}>Intuitive Analogy</Text>
                  </View>
                  <Text style={[styles.cardBodyText, { color: '#92400E' }]}>
                    {lessonData.understandingAnalogy}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.nextStageBtn}
                onPress={() => {
                  if ((lessonData?.formulasAndRules || []).length > 0) setCurrentTab('FORMULAS');
                  else if ((lessonData?.workedExamples || []).length > 0) setCurrentTab('EXAMPLES');
                  else if (hasPractice) setCurrentTab('PRACTICE');
                  else if (isSpeaking) setCurrentTab('SPEAKING');
                  else if (isCoding) setCurrentTab('CODING');
                  else setCurrentTab('RESULT');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.nextStageBtnText}>Continue to Next Phase ›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 2: FORMULAS & RULES */}
          {currentTab === 'FORMULAS' && (
            <View>
              <View style={styles.cardSection}>
                <View style={styles.cardHeader}>
                  <Ionicons name="flash-outline" size={20} color="#0284C7" />
                  <Text style={[styles.cardTitle, { color: '#0369A1' }]}>Key Rules & Formulas</Text>
                </View>
                {(lessonData?.formulasAndRules || []).map((rule, idx) => (
                  <View key={idx} style={styles.formulaRow}>
                    <View style={styles.formulaBullet} />
                    <Text style={styles.formulaText}>{rule}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.nextStageBtn}
                onPress={() => {
                  if ((lessonData?.workedExamples || []).length > 0) setCurrentTab('EXAMPLES');
                  else if (hasPractice) setCurrentTab('PRACTICE');
                  else setCurrentTab('RESULT');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.nextStageBtnText}>Continue to Worked Examples ›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 3: WORKED EXAMPLES */}
          {currentTab === 'EXAMPLES' && (
            <View>
              {(lessonData?.workedExamples || []).map((ex, idx) => (
                <View key={idx} style={styles.cardSection}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="document-text-outline" size={20} color="#10B981" />
                    <Text style={[styles.cardTitle, { color: '#047857' }]}>Example {idx + 1}</Text>
                  </View>
                  <Text style={styles.exampleQuestion}>{ex.question}</Text>
                  <View style={styles.stepsContainer}>
                    {ex.stepByStep.map((s, sIdx) => (
                      <View key={sIdx} style={styles.stepRow}>
                        <Text style={styles.stepNum}>{sIdx + 1}.</Text>
                        <Text style={styles.stepText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.answerBox}>
                    <Text style={styles.answerLabel}>FINAL RESULT:</Text>
                    <Text style={styles.answerVal}>{ex.answer}</Text>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.nextStageBtn}
                onPress={() => {
                  if (hasPractice) setCurrentTab('PRACTICE');
                  else if (isSpeaking) setCurrentTab('SPEAKING');
                  else setCurrentTab('RESULT');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.nextStageBtnText}>Start Interactive Practice ›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 4: PRACTICE DRILL / QUIZ */}
          {currentTab === 'PRACTICE' && currentQ && (
            <View>
              {/* Question progress counter */}
              <View style={styles.quizProgressBarRow}>
                <Text style={styles.quizCounterText}>
                  Question {activeQuestionIdx + 1} of {questions.length}
                </Text>
                <View style={styles.quizTrack}>
                  <View
                    style={[
                      styles.quizFill,
                      { width: `${((activeQuestionIdx + 1) / questions.length) * 100}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.cardSection}>
                <Text style={styles.quizQuestionPrompt}>{currentQ.question}</Text>

                {currentQ.options.map((opt: string, optIdx: number) => {
                  const isSubmitted = !!answeredSubmitted[activeQuestionIdx];
                  const isSelected = selectedAnswers[activeQuestionIdx] === optIdx;
                  const isCorrect = currentQ.correctIndex === optIdx;

                  return (
                    <TouchableOpacity
                      key={optIdx}
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionSelected,
                        isSubmitted && isCorrect && styles.optionCorrect,
                        isSubmitted && isSelected && !isCorrect && styles.optionWrong,
                      ]}
                      onPress={() => handleSelectOption(activeQuestionIdx, optIdx)}
                      activeOpacity={0.7}
                      disabled={isSubmitted}
                    >
                      <View style={styles.optLetterCircle}>
                        <Text style={styles.optLetter}>
                          {String.fromCharCode(65 + optIdx)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSubmitted && isCorrect && styles.optionTextCorrect,
                          isSubmitted && isSelected && !isCorrect && styles.optionTextWrong,
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Explanation on answer */}
                {answeredSubmitted[activeQuestionIdx] && (
                  <View style={styles.explanationBox}>
                    <Text style={styles.explanationTitle}>
                      {selectedAnswers[activeQuestionIdx] === currentQ.correctIndex
                        ? '✅ Correct Answer!'
                        : '❌ Incorrect'}
                    </Text>
                    <Text style={styles.explanationBody}>{currentQ.explanation}</Text>
                  </View>
                )}
              </View>

              {/* Navigation between questions */}
              <View style={styles.quizNavRow}>
                <TouchableOpacity
                  style={[styles.quizNavBtn, activeQuestionIdx === 0 && styles.quizNavBtnDisabled]}
                  disabled={activeQuestionIdx === 0}
                  onPress={() => setActiveQuestionIdx((prev) => prev - 1)}
                >
                  <Text style={styles.quizNavBtnText}>‹ Previous</Text>
                </TouchableOpacity>

                {activeQuestionIdx < questions.length - 1 ? (
                  <TouchableOpacity
                    style={styles.quizNavBtnPrimary}
                    onPress={() => setActiveQuestionIdx((prev) => prev + 1)}
                  >
                    <Text style={styles.quizNavBtnPrimaryText}>Next Question ›</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.quizNavBtnPrimary, { backgroundColor: '#10B981' }]}
                    onPress={() => setCurrentTab('RESULT')}
                  >
                    <Text style={styles.quizNavBtnPrimaryText}>View Results 🏆</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* TAB 5: SPEAKING DRILL */}
          {currentTab === 'SPEAKING' && lessonData?.speakingTask && (
            <View>
              <View style={styles.cardSection}>
                <View style={styles.cardHeader}>
                  <Ionicons name="mic" size={22} color="#059669" />
                  <Text style={[styles.cardTitle, { color: '#047857' }]}>
                    {lessonData.speakingTask.scenario}
                  </Text>
                </View>
                <Text style={styles.speakingRole}>Your Role: {lessonData.speakingTask.role}</Text>
                <View style={styles.promptBox}>
                  <Text style={styles.promptLabel}>SPEAKING PROMPT:</Text>
                  <Text style={styles.promptText}>{lessonData.speakingTask.prompt}</Text>
                </View>
              </View>

              {/* VOCABULARY ASSIST */}
              <View style={styles.cardSection}>
                <Text style={styles.subHeadTitle}>Suggested Vocabulary</Text>
                <View style={styles.vocabWrap}>
                  {lessonData.speakingTask.usefulVocab.map((w, idx) => (
                    <View key={idx} style={styles.vocabChip}>
                      <Text style={styles.vocabChipText}>{w}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* TIMER SECTION */}
              <View style={styles.timerCard}>
                <Text style={styles.phaseTitle}>
                  {speakingPhase === 'PREP'
                    ? 'Preparation Phase (Gather your points)'
                    : speakingPhase === 'SPEAKING'
                    ? 'Speaking Phase (Speak out loud!)'
                    : 'Drill Complete!'}
                </Text>
                <Text style={styles.timerBig}>
                  {Math.floor(speakingSecondsLeft / 60)}:
                  {speakingSecondsLeft % 60 < 10
                    ? `0${speakingSecondsLeft % 60}`
                    : speakingSecondsLeft % 60}
                </Text>

                <TouchableOpacity
                  style={[
                    styles.timerControlBtn,
                    timerRunning ? styles.timerStop : styles.timerStart,
                  ]}
                  onPress={() => setTimerRunning((prev) => !prev)}
                >
                  <Text style={styles.timerControlText}>
                    {timerRunning ? 'PAUSE TIMER' : 'START TIMER'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* SELF RATING */}
              <View style={styles.cardSection}>
                <Text style={styles.subHeadTitle}>Self Confidence Rating</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setConfidenceRating(star)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={star <= confidenceRating ? 'star' : 'star-outline'}
                        size={32}
                        color="#F59E0B"
                        style={{ marginHorizontal: 6 }}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.nextStageBtn}
                onPress={() => setCurrentTab('RESULT')}
                activeOpacity={0.8}
              >
                <Text style={styles.nextStageBtnText}>Complete Speaking Drill ›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 6: CODING CHALLENGE */}
          {currentTab === 'CODING' && lessonData?.codingChallenge && (
            <View>
              <View style={styles.cardSection}>
                <Text style={styles.codingProblemTitle}>
                  {lessonData.codingChallenge.problem}
                </Text>
                <Text style={styles.codingSubtitle}>
                  Input: {lessonData.codingChallenge.inputDescription}
                </Text>
                <Text style={styles.codingSubtitle}>
                  Output: {lessonData.codingChallenge.outputDescription}
                </Text>
                <View style={styles.codeSnippetBox}>
                  <Text style={styles.codeSnippetText}>
                    {lessonData.codingChallenge.starterCode}
                  </Text>
                </View>
              </View>

              <View style={styles.cardSection}>
                <View style={styles.cardHeader}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
                  <Text style={[styles.cardTitle, { color: '#047857' }]}>Optimal Solution Walkthrough</Text>
                </View>
                <Text style={styles.cardBodyText}>
                  {lessonData.codingChallenge.solutionWalkthrough}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.nextStageBtn}
                onPress={() => setCurrentTab('RESULT')}
                activeOpacity={0.8}
              >
                <Text style={styles.nextStageBtnText}>View Lesson Summary ›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 7: RESULT & SAVING */}
          {currentTab === 'RESULT' && (
            <View style={styles.resultContainer}>
              <View style={styles.celebrateCrest}>
                <Text style={styles.celebrateEmoji}>🎉</Text>
              </View>

              <Text style={styles.resultHeader}>Lesson Completed!</Text>
              <Text style={styles.resultSub}>{task.title}</Text>

              {/* STATS GRID */}
              <View style={styles.statsCard}>
                {hasPractice && (
                  <View style={styles.statCol}>
                    <Text style={styles.statVal}>
                      {score}/{total}
                    </Text>
                    <Text style={styles.statLbl}>QUESTIONS</Text>
                  </View>
                )}

                {hasPractice && <View style={styles.statDivider} />}

                <View style={styles.statCol}>
                  <Text style={[styles.statVal, { color: '#10B981' }]}>{accuracy}%</Text>
                  <Text style={styles.statLbl}>ACCURACY</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statCol}>
                  <Text style={[styles.statVal, { color: Colors.secondaryDark }]}>
                    +{accuracy >= 80 ? 40 : 25}
                  </Text>
                  <Text style={styles.statLbl}>XP EARNED</Text>
                </View>
              </View>

              {/* DIFFICULTY ADAPTATION NOTICE */}
              <View style={styles.adaptationCard}>
                <Ionicons
                  name={accuracy >= 85 ? 'arrow-up-circle' : accuracy < 60 ? 'refresh-circle' : 'checkmark-circle'}
                  size={24}
                  color={accuracy >= 85 ? '#10B981' : accuracy < 60 ? '#EF4444' : '#0284C7'}
                />
                <View style={styles.adaptationCol}>
                  <Text style={styles.adaptationTitle}>
                    {accuracy >= 85
                      ? 'Mastery Demonstrated (>85%)'
                      : accuracy < 60
                      ? 'Revision Scheduled (<60%)'
                      : 'Consistent Performance'}
                  </Text>
                  <Text style={styles.adaptationSub}>
                    {accuracy >= 85
                      ? 'Topic scheduled for next Spaced Revision level in 7 days.'
                      : accuracy < 60
                      ? 'Topic scheduled for quick review tomorrow to reinforce understanding.'
                      : 'Topic will review in 3 days.'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.completeBtn}
                onPress={handleFinishLesson}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.completeBtnText}>SAVE & FINISH TASK</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

function getDifficultyBg(diff: string): string {
  switch (diff) {
    case 'BEGINNER':
      return '#DCFCE7';
    case 'ADVANCED':
      return '#FEE2E2';
    default:
      return '#FEF3C7';
  }
}

function getDifficultyColor(diff: string): string {
  switch (diff) {
    case 'BEGINNER':
      return '#15803D';
    case 'ADVANCED':
      return '#B91C1C';
    default:
      return '#B45309';
  }
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleCol: {
    flex: 1,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '800',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginLeft: 6,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    paddingBottom: 40,
  },
  cardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  analogyCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  cardBodyText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  nextStageBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  nextStageBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  formulaBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
    marginTop: 6,
    marginRight: 8,
  },
  formulaText: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  exampleQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
    lineHeight: 20,
  },
  stepsContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  stepNum: {
    fontWeight: '800',
    color: '#0284C7',
    marginRight: 6,
    width: 18,
  },
  stepText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  answerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
  },
  answerLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  answerVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#047857',
  },
  // QUIZ STYLES
  quizProgressBarRow: {
    marginBottom: 12,
  },
  quizCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  quizTrack: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  quizFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  quizQuestionPrompt: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 16,
    lineHeight: 22,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  optionCorrect: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  optionWrong: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  optLetterCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  optLetter: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
  },
  optionText: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
    flex: 1,
  },
  optionTextCorrect: {
    fontSize: 13,
    color: '#065F46',
    fontWeight: '700',
    flex: 1,
  },
  optionTextWrong: {
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '600',
    flex: 1,
  },
  explanationBox: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  explanationTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
    color: '#166534',
  },
  explanationBody: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 18,
  },
  quizNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  quizNavBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
  },
  quizNavBtnDisabled: {
    opacity: 0.4,
  },
  quizNavBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  quizNavBtnPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  quizNavBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // SPEAKING STYLES
  speakingRole: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 8,
  },
  promptBox: {
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  promptLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#047857',
    marginBottom: 4,
  },
  promptText: {
    fontSize: 13,
    color: '#065F46',
    lineHeight: 20,
    fontWeight: '600',
  },
  subHeadTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  vocabWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vocabChip: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  vocabChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  timerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  phaseTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
  },
  timerBig: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 16,
  },
  timerControlBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  timerStart: {
    backgroundColor: '#059669',
  },
  timerStop: {
    backgroundColor: '#EF4444',
  },
  timerControlText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 6,
  },
  // CODING STYLES
  codingProblemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  codingSubtitle: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
  },
  codeSnippetBox: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  codeSnippetText: {
    fontFamily: 'monospace',
    color: '#38BDF8',
    fontSize: 12,
    lineHeight: 18,
  },
  // RESULTS STYLES
  resultContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  celebrateCrest: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  celebrateEmoji: {
    fontSize: 32,
  },
  resultHeader: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  resultSub: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 20,
    textAlign: 'center',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLbl: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  adaptationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 14,
    borderRadius: 12,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  adaptationCol: {
    marginLeft: 10,
    flex: 1,
  },
  adaptationTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0369A1',
  },
  adaptationSub: {
    fontSize: 11,
    color: '#0284C7',
    marginTop: 2,
    lineHeight: 16,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
