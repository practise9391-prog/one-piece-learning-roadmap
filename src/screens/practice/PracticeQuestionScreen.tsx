import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { PracticeCompletionModal } from '../../components/practice/PracticeCompletionModal';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { practiceRepository } from '../../repositories/PracticeRepository';
import { PracticeQuestion } from '../../models/Practice';
import { Colors } from '../../theme/colors';

export const PracticeQuestionScreen: React.FC = () => {
  const { params, goBack, navigate } = useAppNavigation();
  const questionId = params?.questionId;
  const categoryId = params?.categoryId;

  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [allQuestions, setAllQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // User input states
  const [codeDraft, setCodeDraft] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState<boolean>(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState<boolean>(false);

  // Accordion visibility
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [completionModalVisible, setCompletionModalVisible] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);

  const loadQuestionData = useCallback(async () => {
    try {
      setLoading(true);
      if (!questionId) return;

      const q = await practiceRepository.getQuestionById(questionId);
      if (!q) return;

      setQuestion(q);
      setCodeDraft(q.user_draft || q.content || '');

      // Load sibling questions in category for navigation
      const siblings = await practiceRepository.getQuestions({ categoryId: q.category_id });
      setAllQuestions(siblings);
      const idx = siblings.findIndex((item) => item.id === q.id);
      setCurrentIndex(idx >= 0 ? idx : 0);

      // Reset state for new question
      setSelectedOption(null);
      setMcqSubmitted(q.is_completed);
      setShowHint(false);
      setShowSolution(false);
    } catch (err) {
      console.error('Failed to load practice question:', err);
    } finally {
      setLoading(false);
    }
  }, [questionId]);

  useEffect(() => {
    loadQuestionData();
  }, [loadQuestionData]);

  const handleToggleBookmark = async () => {
    if (!question) return;
    const nextState = await practiceRepository.toggleBookmark(question.id);
    setQuestion((prev) => (prev ? { ...prev, is_bookmarked: nextState } : null));
  };

  const handleSaveDraft = (text: string) => {
    setCodeDraft(text);
    if (question) {
      practiceRepository.saveDraft(question.id, text).catch(() => {});
    }
  };

  const handleRunCode = () => {
    Alert.alert(
      '⚙️ Code Runner',
      'Code execution engine will be available in a future update. Verify your logic and tap Submit!'
    );
  };

  const handleSubmitCode = async () => {
    if (!question) return;
    await practiceRepository.markQuestionComplete(question.id);
    setQuestion((prev) => (prev ? { ...prev, is_completed: true } : null));
    setIsCorrectAnswer(true);
    setCompletionModalVisible(true);
  };

  const handleSubmitMCQ = async () => {
    if (!question || !selectedOption) {
      Alert.alert('Selection Required', 'Please select an option before submitting.');
      return;
    }

    const isCorrect = selectedOption.trim() === question.correct_answer?.trim();
    await practiceRepository.submitAnswer(question.id, selectedOption, isCorrect);

    setMcqSubmitted(true);
    setIsCorrectAnswer(isCorrect);
    setShowSolution(true);

    if (isCorrect) {
      setQuestion((prev) => (prev ? { ...prev, is_completed: true } : null));
      setCompletionModalVisible(true);
    }
  };

  const handleNextQuestion = () => {
    setCompletionModalVisible(false);
    if (currentIndex < allQuestions.length - 1) {
      const nextQ = allQuestions[currentIndex + 1];
      navigate('PracticeQuestion', { questionId: nextQ.id, categoryId: nextQ.category_id });
    } else {
      goBack();
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      const prevQ = allQuestions[currentIndex - 1];
      navigate('PracticeQuestion', { questionId: prevQ.id, categoryId: prevQ.category_id });
    }
  };

  if (loading || !question) {
    return (
      <AppShell title="CHALLENGE">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading question workspace...</Text>
        </View>
      </AppShell>
    );
  }

  const getDifficultyStyle = (diff: string) => {
    switch (diff) {
      case 'HARD':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'MEDIUM':
        return { bg: '#FEF3C7', text: '#B45309' };
      default:
        return { bg: '#DCFCE7', text: '#15803D' };
    }
  };
  const diffStyle = getDifficultyStyle(question.difficulty);

  return (
    <AppShell title={`${question.category_id.toUpperCase()} CHALLENGE`}>
      <View style={styles.mainWrapper}>
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          {/* Header Controls */}
          <View style={styles.headerRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={goBack} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.headerInfoCol}>
              <Text style={styles.headerCategoryText}>
                {question.category_id.toUpperCase()} • Question {currentIndex + 1} of {allQuestions.length}
              </Text>
              <Text style={styles.headerTitleText} numberOfLines={1}>
                {question.title}
              </Text>
            </View>

            <TouchableOpacity style={styles.iconBtn} onPress={handleToggleBookmark} activeOpacity={0.7}>
              <Ionicons
                name={question.is_bookmarked ? 'star' : 'star-outline'}
                size={22}
                color={question.is_bookmarked ? Colors.secondary : '#94A3B8'}
              />
            </TouchableOpacity>
          </View>

          {/* Badges Bar */}
          <View style={styles.badgesBar}>
            <View style={[styles.badgePill, { backgroundColor: diffStyle.bg }]}>
              <Text style={[styles.badgePillText, { color: diffStyle.text }]}>
                {question.difficulty}
              </Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.badgePillText, { color: '#2563EB' }]}>
                {question.question_type}
              </Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.badgePillText, { color: '#64748B' }]}>
                {question.topic}
              </Text>
            </View>
            {question.is_completed && (
              <View style={[styles.badgePill, { backgroundColor: '#DCFCE7', marginLeft: 'auto' }]}>
                <Ionicons name="checkmark-circle" size={12} color="#15803D" style={{ marginRight: 3 }} />
                <Text style={[styles.badgePillText, { color: '#15803D' }]}>SOLVED</Text>
              </View>
            )}
          </View>

          {/* Question Description */}
          <View style={styles.questionCard}>
            <Text style={styles.questionTitleMain}>{question.title}</Text>
            <Text style={styles.questionDescText}>{question.description}</Text>

            {/* Example Input / Output if available */}
            {question.example_input && (
              <View style={styles.exampleBox}>
                <Text style={styles.exampleLabel}>EXAMPLE:</Text>
                <Text style={styles.exampleText}>
                  <Text style={styles.boldText}>Input: </Text>
                  {question.example_input}
                </Text>
                {question.example_output && (
                  <Text style={styles.exampleText}>
                    <Text style={styles.boldText}>Output: </Text>
                    {question.example_output}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Interactive Workspace by question_type */}
          {question.question_type === 'CODING' && (
            <View style={styles.codingWorkspace}>
              <Text style={styles.workspaceLabel}>YOUR CODE SOLUTION:</Text>
              <TextInput
                style={styles.codeEditor}
                multiline
                value={codeDraft}
                onChangeText={handleSaveDraft}
                placeholder="Write your code here..."
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.codingActionRow}>
                <TouchableOpacity style={styles.runBtn} onPress={handleRunCode} activeOpacity={0.8}>
                  <Ionicons name="play" size={14} color={Colors.textPrimary} style={{ marginRight: 4 }} />
                  <Text style={styles.runBtnText}>RUN CODE</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitCode} activeOpacity={0.8}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.submitBtnText}>SUBMIT SOLUTION</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {(question.question_type === 'MCQ' || question.question_type === 'OUTPUT_PREDICTION') && (
            <View style={styles.mcqWorkspace}>
              <Text style={styles.workspaceLabel}>SELECT THE CORRECT OPTION:</Text>

              {question.content.length > 0 && (
                <View style={styles.codeSnippetBox}>
                  <Text style={styles.codeSnippetText}>{question.content}</Text>
                </View>
              )}

              {question.options?.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                let optionStyle = styles.optionItem;
                if (isSelected) optionStyle = styles.optionItemSelected;
                if (mcqSubmitted) {
                  if (opt === question.correct_answer) optionStyle = styles.optionItemCorrect;
                  else if (isSelected && !isCorrectAnswer) optionStyle = styles.optionItemWrong;
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    style={optionStyle}
                    onPress={() => !mcqSubmitted && setSelectedOption(opt)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.radioCircle}>
                      {isSelected && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.optionText}>{opt}</Text>
                    {mcqSubmitted && opt === question.correct_answer && (
                      <Ionicons name="checkmark-circle" size={18} color="#15803D" style={{ marginLeft: 'auto' }} />
                    )}
                  </TouchableOpacity>
                );
              })}

              {!mcqSubmitted && (
                <TouchableOpacity style={styles.submitBtnFull} onPress={handleSubmitMCQ} activeOpacity={0.8}>
                  <Text style={styles.submitBtnText}>SUBMIT ANSWER</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {question.question_type === 'SQL' && (
            <View style={styles.sqlWorkspace}>
              <Text style={styles.workspaceLabel}>WRITE YOUR SQL QUERY:</Text>
              <TextInput
                style={styles.sqlEditor}
                multiline
                value={codeDraft}
                onChangeText={handleSaveDraft}
                placeholder="SELECT ... FROM ... WHERE ...;"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.submitBtnFull} onPress={handleSubmitCode} activeOpacity={0.8}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.submitBtnText}>CHECK & SUBMIT QUERY</Text>
              </TouchableOpacity>
            </View>
          )}

          {(question.question_type === 'DEBUGGING' || question.question_type === 'CONCEPT') && (
            <View style={styles.conceptWorkspace}>
              {question.content.length > 0 && (
                <View style={styles.codeSnippetBox}>
                  <Text style={styles.codeSnippetText}>{question.content}</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.revealBtn}
                onPress={() => {
                  setShowSolution(true);
                  practiceRepository.markQuestionComplete(question.id).catch(() => {});
                  setQuestion((prev) => (prev ? { ...prev, is_completed: true } : null));
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="bulb-outline" size={16} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.revealBtnText}>
                  {showSolution ? 'EXPLANATION REVEALED' : 'REVEAL EXPLANATION & ANSWER'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 💡 HINT ACCORDION */}
          {question.hint && (
            <View style={styles.accordionBox}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setShowHint(!showHint)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="bulb" size={18} color="#D97706" style={{ marginRight: 6 }} />
                  <Text style={styles.accordionTitle}>💡 HINT</Text>
                </View>
                <Ionicons
                  name={showHint ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color="#64748B"
                />
              </TouchableOpacity>
              {showHint && (
                <View style={styles.accordionBody}>
                  <Text style={styles.hintBodyText}>{question.hint}</Text>
                </View>
              )}
            </View>
          )}

          {/* VIEW SOLUTION ACCORDION */}
          <View style={styles.accordionBox}>
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() => setShowSolution(!showSolution)}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="document-text" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.accordionTitle}>REFERENCE SOLUTION & EXPLANATION</Text>
              </View>
              <Ionicons
                name={showSolution ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#64748B"
              />
            </TouchableOpacity>
            {showSolution && (
              <View style={styles.accordionBody}>
                <Text style={styles.solutionText}>{question.solution}</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Navigation Toolbar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            disabled={currentIndex === 0}
            onPress={handlePrevQuestion}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={16} color={currentIndex === 0 ? '#CBD5E1' : Colors.textPrimary} />
            <Text style={[styles.navBtnText, currentIndex === 0 && styles.navBtnTextDisabled]}>Previous</Text>
          </TouchableOpacity>

          <Text style={styles.navProgressText}>
            {currentIndex + 1} / {allQuestions.length}
          </Text>

          <TouchableOpacity
            style={[styles.navBtn, currentIndex === allQuestions.length - 1 && styles.navBtnDisabled]}
            disabled={currentIndex === allQuestions.length - 1}
            onPress={handleNextQuestion}
            activeOpacity={0.7}
          >
            <Text style={[styles.navBtnText, currentIndex === allQuestions.length - 1 && styles.navBtnTextDisabled]}>Next</Text>
            <Ionicons name="chevron-forward" size={16} color={currentIndex === allQuestions.length - 1 ? '#CBD5E1' : Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Practice Completion Modal */}
        <PracticeCompletionModal
          visible={completionModalVisible}
          questionTitle={question.title}
          isCorrect={isCorrectAnswer}
          onNext={handleNextQuestion}
          onClose={() => setCompletionModalVisible(false)}
        />
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfoCol: {
    flex: 1,
    marginHorizontal: 10,
  },
  headerCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  headerTitleText: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  badgesBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  questionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  questionTitleMain: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  questionDescText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  exampleBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 10,
    marginTop: 12,
  },
  exampleLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  boldText: {
    fontWeight: '700',
  },
  codingWorkspace: {
    marginBottom: 14,
  },
  workspaceLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  codeEditor: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    fontFamily: 'monospace',
    fontSize: 13,
    borderRadius: 12,
    padding: 14,
    minHeight: 140,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#334155',
  },
  codingActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 10,
  },
  runBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  runBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  submitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 11,
    borderRadius: 10,
  },
  submitBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  mcqWorkspace: {
    marginBottom: 14,
  },
  codeSnippetBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  codeSnippetText: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionItemSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#3B82F6',
  },
  optionItemCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#16A34A',
  },
  optionItemWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: '#DC2626',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  optionText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  sqlWorkspace: {
    marginBottom: 14,
  },
  sqlEditor: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    fontFamily: 'monospace',
    fontSize: 13,
    borderRadius: 12,
    padding: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#334155',
  },
  conceptWorkspace: {
    marginBottom: 14,
  },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  revealBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  accordionBox: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  accordionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  accordionBody: {
    padding: 14,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  hintBodyText: {
    fontSize: 12,
    color: '#D97706',
    lineHeight: 18,
    marginTop: 8,
  },
  solutionText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 8,
    fontFamily: 'monospace',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  navBtnDisabled: {
    opacity: 0.5,
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginHorizontal: 4,
  },
  navBtnTextDisabled: {
    color: '#94A3B8',
  },
  navProgressText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
});
