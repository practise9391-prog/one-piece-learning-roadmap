import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { CodeEditor } from '../../components/practice/CodeEditor';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import { practiceTaskRepository } from '../../repositories/PracticeTaskRepository';
import { codeExecutionService } from '../../services/execution/CodeExecutionService';
import {
  PracticeTask,
  TaskTestCase,
  TaskSubmission,
  TestRunResult,
  ExecutionResult,
} from '../../models/PracticeTask';
import { notesService } from '../../services/NotesService';
import { VisualDebugger, AICodingTeacherPanel } from '../../components/debugger';
import { ExecutionTrace, LearningMode, SavedCodeSnippet } from '../../models/Debugger';
import { codeWorkspaceRepository } from '../../repositories/CodeWorkspaceRepository';
import { adapterRegistry } from '../../services/execution/adapters';

export const CodingProblemScreen: React.FC = () => {
  const { params, goBack, navigate } = useAppNavigation();
  const { theme } = useTheme();

  const taskId = params?.taskId || params?.questionId || 'task_py_reverse_string';
  const incomingCode = params?.code;
  const incomingLanguage = params?.language || 'python';
  const incomingTitle = params?.title || params?.topicTitle;
  const incomingMode = (params?.mode as LearningMode) || 'NORMAL';

  const [task, setTask] = useState<PracticeTask | null>(null);
  const [testCases, setTestCases] = useState<TaskTestCase[]>([]);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>([]);
  const [bestSubmission, setBestSubmission] = useState<TaskSubmission | null>(null);

  // Active view tab: 'CODE' | 'DEBUG' | 'AI' | 'TESTS' | 'SUBMISSIONS' | 'SOLUTION'
  const [activeTab, setActiveTab] = useState<'CODE' | 'DEBUG' | 'AI' | 'TESTS' | 'SUBMISSIONS' | 'SOLUTION'>('CODE');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(incomingLanguage);
  const [learningMode, setLearningMode] = useState<LearningMode>(incomingMode);
  const [debugTrace, setDebugTrace] = useState<ExecutionTrace | null>(null);
  const [activeLineNumber, setActiveLineNumber] = useState<number | undefined>(undefined);
  const [breakpoints, setBreakpoints] = useState<number[]>([]);
  const [isDebugging, setIsDebugging] = useState<boolean>(false);

  // Modals for Snippets & Languages
  const [saveModalVisible, setSaveModalVisible] = useState<boolean>(false);
  const [snippetTitle, setSnippetTitle] = useState<string>(incomingTitle || 'My Code Snippet');
  const [snippetsModalVisible, setSnippetsModalVisible] = useState<boolean>(false);
  const [savedSnippets, setSavedSnippets] = useState<SavedCodeSnippet[]>([]);
  const [langPickerVisible, setLangPickerVisible] = useState<boolean>(false);

  // Code editor states
  const [code, setCode] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  // MCQ / Prediction states
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isOptionSubmitted, setIsOptionSubmitted] = useState<boolean>(false);
  const [isOptionCorrect, setIsOptionCorrect] = useState<boolean>(false);

  // Execution states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [runResult, setRunResult] = useState<ExecutionResult | null>(null);
  const [testResults, setTestResults] = useState<TestRunResult[]>([]);

  // Hints progressive reveal
  const [unlockedHintsCount, setUnlockedHintsCount] = useState<number>(0);

  // Note modal state
  const [noteModalVisible, setNoteModalVisible] = useState<boolean>(false);
  const [noteText, setNoteText] = useState<string>('');

  // Submission success modal
  const [successModalVisible, setSuccessModalVisible] = useState<boolean>(false);
  const [lastSubmissionXp, setLastSubmissionXp] = useState<number>(20);
  const [lastSubmissionPoints, setLastSubmissionPoints] = useState<number>(10);

  const [loading, setLoading] = useState<boolean>(true);

  const loadTaskData = useCallback(async () => {
    try {
      setLoading(true);
      const [t, tc, subs, best] = await Promise.all([
        practiceTaskRepository.getTaskById(taskId),
        practiceTaskRepository.getTestCases(taskId, false),
        practiceTaskRepository.getSubmissions(taskId),
        practiceTaskRepository.getBestSubmission(taskId),
      ]);

      if (t) {
        setTask(t);
        setCode(incomingCode || t.user_draft || t.starter_code || '');
        setSelectedLanguage(t.language || incomingLanguage || 'python');
        if (t.is_completed) {
          setIsOptionSubmitted(true);
          setIsOptionCorrect(true);
          setSelectedOption(t.correct_answer || null);
        }
      } else {
        const defaultCode = incomingCode || 'a = 10\nb = 20\nc = a + b\nprint(c)';
        const fallbackTask: PracticeTask = {
          id: `workspace_${Date.now()}`,
          course_id: params?.courseId || 'general',
          module_id: params?.moduleId || '',
          topic_id: params?.topicId || '',
          category_id: 'algorithms',
          title: incomingTitle || 'Interactive Code Workspace',
          description: 'Experiment, run, and visually debug code in real time.',
          task_type: 'CODING',
          difficulty: 'MEDIUM',
          language: incomingLanguage,
          starter_code: defaultCode,
          solution: '',
          explanation: 'Interactive workspace environment with execution trace inspection.',
          hints: [],
          time_limit: 2,
          memory_limit: 128,
          points: 10,
          xp: 20,
          order_index: 0,
          is_active: true,
          is_completed: false,
          is_bookmarked: false,
          status: 'NOT_STARTED',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setTask(fallbackTask);
        setCode(defaultCode);
        setSelectedLanguage(incomingLanguage);
      }
      setTestCases(tc);
      setSubmissions(subs);
      setBestSubmission(best);
    } catch (err) {
      console.error('Failed to load practice task:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId, incomingCode, incomingLanguage, incomingTitle, params?.courseId, params?.moduleId, params?.topicId]);

  useEffect(() => {
    loadTaskData();
  }, [loadTaskData]);

  const handleToggleBookmark = async () => {
    if (!task) return;
    const next = await practiceTaskRepository.toggleBookmark(task.id);
    setTask((prev) => (prev ? { ...prev, is_bookmarked: next } : null));
  };

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (task && task.id && !task.id.startsWith('workspace_')) {
      practiceTaskRepository.saveDraft(task.id, newCode).catch(() => {});
    }
  };

  const handleStartDebug = async (overrideInput?: string) => {
    if (isDebugging || isRunning) return;
    try {
      setIsDebugging(true);
      const inputToUse =
        overrideInput !== undefined
          ? overrideInput
          : showCustomInput
          ? customInput
          : testCases[0]?.input || '';

      const trace = await codeExecutionService.debug(selectedLanguage, code, inputToUse);
      setDebugTrace(trace);
      setActiveTab('DEBUG');
      if (trace.steps.length > 0) {
        setActiveLineNumber(trace.steps[0].sourceLine);
      }

      // Persist debug session context (Section 34)
      codeWorkspaceRepository.saveDebugSession({
        id: `ds_${Date.now()}`,
        user_id: 'default_user',
        task_id: task?.id,
        topic_id: params?.topicId,
        course_id: params?.courseId,
        language: selectedLanguage,
        code,
        current_step: 0,
        total_steps: trace.totalSteps,
        trace_summary: `Generated ${trace.totalSteps} steps in ${trace.executionTimeMs}ms`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).catch(() => {});
    } catch (err: any) {
      Alert.alert('Debugger Error', err?.message || 'Failed to start debugger');
    } finally {
      setIsDebugging(false);
    }
  };

  const handleDebugTestCase = (tc: TaskTestCase) => {
    handleStartDebug(tc.input);
  };

  const handleToggleBreakpoint = (line: number) => {
    setBreakpoints((prev) =>
      prev.includes(line) ? prev.filter((l) => l !== line) : [...prev, line]
    );
  };

  const handleOpenSaveModal = () => {
    setSnippetTitle(task?.title || 'Interactive Code Snippet');
    setSaveModalVisible(true);
  };

  const handleSaveSnippet = async () => {
    if (!snippetTitle.trim()) return;
    try {
      await codeWorkspaceRepository.saveSnippet({
        id: `snip_${Date.now()}`,
        title: snippetTitle.trim(),
        user_id: 'default_user',
        course_id: params?.courseId,
        topic_id: params?.topicId,
        task_id: task?.id,
        language: selectedLanguage,
        code,
        learning_mode: learningMode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setSaveModalVisible(false);
      Alert.alert('Saved', 'Your code snippet has been saved to your library.');
    } catch (err: any) {
      Alert.alert('Save Error', err?.message || 'Failed to save code snippet');
    }
  };

  const handleOpenSnippetsList = async () => {
    const list = await codeWorkspaceRepository.getSnippets('default_user');
    setSavedSnippets(list);
    setSnippetsModalVisible(true);
  };

  const handleLoadSnippet = (snip: SavedCodeSnippet) => {
    setCode(snip.code);
    setSelectedLanguage(snip.language);
    setLearningMode(snip.learning_mode);
    setSnippetsModalVisible(false);
    setActiveTab('CODE');
  };

  const handleRunCustom = async () => {
    if (!task || isRunning || isSubmitting) return;
    try {
      setIsRunning(true);
      setActiveTab('CODE');
      const inputToUse = showCustomInput ? customInput : testCases[0]?.input || '';
      const result = await codeExecutionService.execute(selectedLanguage, code, inputToUse, (task.time_limit || 2) * 1000);
      setRunResult(result);
    } catch (err: any) {
      Alert.alert('Execution Error', err?.message || 'Failed to run code');
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunSampleTests = async () => {
    if (!task || isRunning || isSubmitting) return;
    try {
      setIsRunning(true);
      setActiveTab('TESTS');
      const visibleTests = testCases.filter((tc) => !tc.is_hidden);
      const results = await codeExecutionService.runTestCases(task.language, code, visibleTests);
      setTestResults(results);
    } catch (err: any) {
      Alert.alert('Test Runner Error', err?.message || 'Failed to run tests');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!task || isRunning || isSubmitting) return;
    try {
      setIsSubmitting(true);
      // Fetch all tests including hidden
      const allTests = await practiceTaskRepository.getAllTestCasesForExecution(task.id);

      const evaluation = await codeExecutionService.evaluateSubmission(
        task.id,
        task.language,
        code,
        allTests
      );

      setTestResults(evaluation.results);

      // Record in database
      const { rewardAwarded, xpAwarded } = await practiceTaskRepository.recordSubmission(
        evaluation.submission
      );

      // Reload submissions and stats
      const [updatedSubs, updatedBest] = await Promise.all([
        practiceTaskRepository.getSubmissions(task.id),
        practiceTaskRepository.getBestSubmission(task.id),
      ]);
      setSubmissions(updatedSubs);
      setBestSubmission(updatedBest);

      if (evaluation.allPassed) {
        setTask((prev) => (prev ? { ...prev, is_completed: true, status: 'SOLVED' } : null));
        setLastSubmissionXp(xpAwarded || task.xp);
        setLastSubmissionPoints(task.points);
        setSuccessModalVisible(true);
      } else {
        setActiveTab('TESTS');
      }
    } catch (err: any) {
      Alert.alert('Submission Error', err?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectOption = (opt: string) => {
    if (isOptionSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitOption = async () => {
    if (!task || !selectedOption) return;
    const isCorrect = selectedOption.trim() === task.correct_answer?.trim();
    setIsOptionSubmitted(true);
    setIsOptionCorrect(isCorrect);

    if (isCorrect) {
      const submission: TaskSubmission = {
        id: `sub_${Date.now()}`,
        task_id: task.id,
        user_id: 'default_user',
        language: task.language,
        source_code: selectedOption,
        status: 'ACCEPTED',
        passed_tests: 1,
        total_tests: 1,
        score: 100,
        execution_time_ms: 50,
        memory_used_kb: 1024,
        submitted_at: new Date().toISOString(),
      };
      await practiceTaskRepository.recordSubmission(submission);
      setTask((prev) => (prev ? { ...prev, is_completed: true, status: 'SOLVED' } : null));
      setLastSubmissionXp(task.xp || 15);
      setLastSubmissionPoints(task.points || 10);
      setSuccessModalVisible(true);
    } else {
      Alert.alert('Incorrect Answer', 'Review the question and try again.');
    }
  };

  const handleRevealFailedTest = async (testCaseId: string) => {
    if (!task) return;
    Alert.alert(
      'Reveal Hidden Test Case',
      'Are you sure you want to reveal this hidden test case? Your learning is best served trying to reason through edge cases first.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reveal',
          onPress: async () => {
            await practiceTaskRepository.revealFailedTest(task.id, testCaseId);
            const tc = await practiceTaskRepository.getTestCases(task.id, false);
            setTestCases(tc);
          },
        },
      ]
    );
  };

  const handleSaveNote = async () => {
    if (!task || !noteText.trim()) return;
    try {
      await notesService.addNote({
        courseId: task.course_id,
        moduleId: task.module_id || undefined,
        noteText: `[Task: ${task.title}]\n${noteText.trim()}`,
      });
      setNoteModalVisible(false);
      setNoteText('');
      Alert.alert('Note Saved', 'Your note has been saved to your course notes.');
    } catch {
      Alert.alert('Error', 'Failed to save note.');
    }
  };

  const unlockNextHint = () => {
    if (!task?.hints) return;
    if (unlockedHintsCount < task.hints.length) {
      setUnlockedHintsCount((prev) => prev + 1);
    }
  };

  const difficultyColor = useMemo(() => {
    switch (task?.difficulty) {
      case 'EASY':
        return '#10B981';
      case 'MEDIUM':
        return '#F59E0B';
      case 'HARD':
      case 'EXPERT':
        return '#EF4444';
      default:
        return '#64748B';
    }
  }, [task?.difficulty]);

  if (loading || !task) {
    return (
      <AppShell title="Coding Challenge" showBackButton onBackPress={goBack}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
          <Text style={styles.loadingText}>Loading challenge...</Text>
        </View>
      </AppShell>
    );
  }

  const isCodingOrDebugging =
    task.task_type === 'CODING' ||
    task.task_type === 'DEBUGGING' ||
    task.task_type === 'SQL';

  return (
    <AppShell title={task.title} showBackButton onBackPress={goBack}>
      <View style={styles.container}>
        {/* Header Task Badge Bar */}
        <View style={styles.headerBar}>
          <View style={styles.badgeRow}>
            <View style={[styles.diffBadge, { borderColor: difficultyColor }]}>
              <View style={[styles.diffDot, { backgroundColor: difficultyColor }]} />
              <Text style={[styles.diffText, { color: difficultyColor }]}>{task.difficulty}</Text>
            </View>

            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{task.task_type}</Text>
            </View>

            <View style={styles.rewardBadge}>
              <Text style={styles.rewardText}>+{task.xp} XP</Text>
            </View>

            {task.is_completed && (
              <View style={styles.solvedBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.solvedBadgeText}>SOLVED</Text>
              </View>
            )}
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setNoteModalVisible(true)}
              accessibilityLabel="Add Note"
            >
              <Ionicons name="create-outline" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleToggleBookmark}
              accessibilityLabel="Bookmark Task"
            >
              <Ionicons
                name={task.is_bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={task.is_bookmarked ? '#F59E0B' : '#94A3B8'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Workspace Toolbar: Language, Learning Mode, and Quick Actions */}
        <View style={styles.workspaceBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workspaceBarScroll}>
            {/* Language Picker Button */}
            <TouchableOpacity
              style={styles.langPickerBtn}
              onPress={() => setLangPickerVisible(true)}
              activeOpacity={0.7}
            >
              <View style={styles.langIndicatorDot} />
              <Text style={styles.langPickerText}>{selectedLanguage.toUpperCase()}</Text>
              <Ionicons name="chevron-down" size={12} color="#94A3B8" />
            </TouchableOpacity>

            {/* Learning Modes */}
            <View style={styles.modePillGroup}>
              {(['NORMAL', 'LEARNING', 'DEBUG', 'INTERVIEW'] as LearningMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setLearningMode(mode)}
                  style={[
                    styles.modePill,
                    learningMode === mode && styles.modePillActive,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modePillText, learningMode === mode && styles.modePillTextActive]}>
                    {mode.charAt(0) + mode.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Actions */}
            <TouchableOpacity
              style={styles.workspaceActionBtn}
              onPress={handleOpenSaveModal}
              activeOpacity={0.7}
            >
              <Ionicons name="save-outline" size={13} color="#F59E0B" />
              <Text style={styles.workspaceActionText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.workspaceActionBtn}
              onPress={handleOpenSnippetsList}
              activeOpacity={0.7}
            >
              <Ionicons name="folder-open-outline" size={13} color="#38BDF8" />
              <Text style={styles.workspaceActionText}>Snippets</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'CODE' && styles.tabBtnActive]}
            onPress={() => setActiveTab('CODE')}
          >
            <Ionicons
              name={isCodingOrDebugging ? 'code-slash' : 'document-text'}
              size={15}
              color={activeTab === 'CODE' ? '#0284C7' : '#64748B'}
            />
            <Text style={[styles.tabText, activeTab === 'CODE' && styles.tabTextActive]}>
              {isCodingOrDebugging ? 'Editor' : 'Question'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'DEBUG' && styles.tabBtnActive]}
            onPress={() => {
              if (!debugTrace) {
                handleStartDebug();
              } else {
                setActiveTab('DEBUG');
              }
            }}
          >
            <Ionicons
              name="bug"
              size={15}
              color={activeTab === 'DEBUG' ? '#10B981' : '#64748B'}
            />
            <Text style={[styles.tabText, activeTab === 'DEBUG' && { color: '#10B981', fontWeight: '700' }]}>
              Debugger {debugTrace ? `(${debugTrace.totalSteps})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'AI' && styles.tabBtnActive]}
            onPress={() => setActiveTab('AI')}
          >
            <Ionicons
              name="sparkles"
              size={15}
              color={activeTab === 'AI' ? '#EC4899' : '#64748B'}
            />
            <Text style={[styles.tabText, activeTab === 'AI' && { color: '#EC4899', fontWeight: '700' }]}>
              AI Teacher
            </Text>
          </TouchableOpacity>

          {isCodingOrDebugging && testCases.length > 0 && (
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'TESTS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('TESTS')}
            >
              <Ionicons
                name="checkmark-done"
                size={15}
                color={activeTab === 'TESTS' ? '#0284C7' : '#64748B'}
              />
              <Text style={[styles.tabText, activeTab === 'TESTS' && styles.tabTextActive]}>
                Tests ({testCases.length})
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'SUBMISSIONS' && styles.tabBtnActive]}
            onPress={() => setActiveTab('SUBMISSIONS')}
          >
            <Ionicons
              name="time"
              size={15}
              color={activeTab === 'SUBMISSIONS' ? '#0284C7' : '#64748B'}
            />
            <Text style={[styles.tabText, activeTab === 'SUBMISSIONS' && styles.tabTextActive]}>
              History ({submissions.length})
            </Text>
          </TouchableOpacity>

          {learningMode !== 'INTERVIEW' && (
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'SOLUTION' && styles.tabBtnActive]}
              onPress={() => setActiveTab('SOLUTION')}
            >
              <Ionicons
                name="bulb"
                size={15}
                color={activeTab === 'SOLUTION' ? '#0284C7' : '#64748B'}
              />
              <Text style={[styles.tabText, activeTab === 'SOLUTION' && styles.tabTextActive]}>
                Hints
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Scrollable Content Body */}
        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
          {/* TAB 1: CODE & PROBLEM DESCRIPTION */}
          {activeTab === 'CODE' && (
            <View>
              {/* Problem Statement Card */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Problem Statement</Text>
                <Text style={styles.problemDesc}>{task.description}</Text>

                {task.instructions && (
                  <View style={styles.instructionsBox}>
                    <Text style={styles.instructionsTitle}>Instructions:</Text>
                    <Text style={styles.instructionsText}>{task.instructions}</Text>
                  </View>
                )}
              </View>

              {/* CODING EDITOR SECTION */}
              {isCodingOrDebugging ? (
                <View>
                  <CodeEditor
                    code={code}
                    onChangeCode={handleCodeChange}
                    language={selectedLanguage}
                    starterCode={task.starter_code}
                    activeLineNumber={activeLineNumber}
                    errorLineNumber={runResult?.status !== 'SUCCESS' && runResult?.errorMessage ? activeLineNumber : undefined}
                    breakpoints={breakpoints}
                    onToggleBreakpoint={handleToggleBreakpoint}
                  />

                  {/* Custom Input Toggle */}
                  <TouchableOpacity
                    style={styles.customInputToggle}
                    onPress={() => setShowCustomInput(!showCustomInput)}
                  >
                    <Ionicons
                      name={showCustomInput ? 'chevron-down' : 'chevron-forward'}
                      size={14}
                      color="#0284C7"
                    />
                    <Text style={styles.customInputToggleText}>Custom Input (Experimentation)</Text>
                  </TouchableOpacity>

                  {showCustomInput && (
                    <TextInput
                      style={styles.customInputBox}
                      value={customInput}
                      onChangeText={setCustomInput}
                      placeholder="Enter custom standard input..."
                      placeholderTextColor="#64748B"
                      multiline
                    />
                  )}

                  {/* Execution Action Buttons */}
                  <View style={styles.execActionRow}>
                    <TouchableOpacity
                      style={[styles.runBtn, isRunning && styles.btnDisabled]}
                      onPress={handleRunCustom}
                      disabled={isRunning || isSubmitting || isDebugging}
                      activeOpacity={0.8}
                    >
                      {isRunning ? (
                        <ActivityIndicator size="small" color="#0284C7" />
                      ) : (
                        <>
                          <Ionicons name="play" size={15} color="#0284C7" />
                          <Text style={styles.runBtnText}>Run</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.debugBtn, isDebugging && styles.btnDisabled]}
                      onPress={() => handleStartDebug()}
                      disabled={isRunning || isSubmitting || isDebugging}
                      activeOpacity={0.8}
                    >
                      {isDebugging ? (
                        <ActivityIndicator size="small" color="#10B981" />
                      ) : (
                        <>
                          <Ionicons name="bug" size={15} color="#10B981" />
                          <Text style={styles.debugBtnText}>Debug</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={handleOpenSaveModal}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="save-outline" size={15} color="#F59E0B" />
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>

                    {isCodingOrDebugging && (
                      <TouchableOpacity
                        style={[styles.submitBtn, isSubmitting && styles.btnDisabled]}
                        onPress={handleSubmit}
                        disabled={isRunning || isSubmitting || isDebugging}
                        activeOpacity={0.85}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Ionicons name="cloud-upload" size={16} color="#FFFFFF" />
                            <Text style={styles.submitBtnText}>Submit</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Visual Debugger in Learning / Debug Mode */}
                  {(learningMode === 'LEARNING' || learningMode === 'DEBUG') && debugTrace && (
                    <View style={{ marginTop: 8 }}>
                      <VisualDebugger
                        trace={debugTrace}
                        onActiveLineChange={(l) => setActiveLineNumber(l)}
                      />
                    </View>
                  )}

                  {/* Console Run Result */}
                  {runResult && (
                    <View style={styles.consoleBox}>
                      <View style={styles.consoleHeader}>
                        <Text style={styles.consoleTitle}>Console Output</Text>
                        <Text
                          style={[
                            styles.consoleStatus,
                            runResult.status === 'SUCCESS' ? styles.statusSuccess : styles.statusError,
                          ]}
                        >
                          {runResult.status} ({runResult.executionTime.toFixed(2)}s)
                        </Text>
                      </View>
                      <Text style={styles.consoleOutput}>
                        {runResult.stdout || runResult.stderr || runResult.errorMessage || '(No output)'}
                      </Text>
                    </View>
                  )}
                </View>
              ) : (
                /* MCQ / OUTPUT PREDICTION VIEW */
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Select Answer</Text>
                  {task.options?.map((opt, i) => {
                    const isSelected = selectedOption === opt;
                    const isCorrect = isOptionSubmitted && opt === task.correct_answer;
                    const isWrong = isOptionSubmitted && isSelected && opt !== task.correct_answer;

                    return (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.optionCard,
                          isSelected && styles.optionCardSelected,
                          isCorrect && styles.optionCardCorrect,
                          isWrong && styles.optionCardWrong,
                        ]}
                        onPress={() => handleSelectOption(opt)}
                        disabled={isOptionSubmitted}
                        activeOpacity={0.7}
                      >
                        <View style={styles.radioCircle}>
                          {isSelected && <View style={styles.radioInner} />}
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                            isCorrect && styles.optionTextCorrect,
                          ]}
                        >
                          {opt}
                        </Text>
                        {isCorrect && (
                          <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                        )}
                        {isWrong && <Ionicons name="close-circle" size={18} color="#EF4444" />}
                      </TouchableOpacity>
                    );
                  })}

                  {!isOptionSubmitted ? (
                    <TouchableOpacity
                      style={[styles.submitBtn, !selectedOption && styles.btnDisabled]}
                      onPress={handleSubmitOption}
                      disabled={!selectedOption}
                    >
                      <Text style={styles.submitBtnText}>Check Answer</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationTitle}>Explanation:</Text>
                      <Text style={styles.explanationText}>{task.explanation}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* TAB 2: TEST CASES (Visible & Hidden) */}
          {activeTab === 'TESTS' && (
            <View>
              <View style={styles.testSummaryHeader}>
                <Text style={styles.sectionTitle}>Test Suite</Text>
                <TouchableOpacity
                  style={styles.runAllTestsBtn}
                  onPress={handleRunSampleTests}
                  disabled={isRunning}
                >
                  <Ionicons name="play" size={13} color="#FFFFFF" />
                  <Text style={styles.runAllTestsText}>Run Sample Tests</Text>
                </TouchableOpacity>
              </View>

              {testCases.map((tc, idx) => {
                const result = testResults.find((r) => r.testCaseId === tc.id);
                const isFailed = result && !result.passed;

                return (
                  <View key={tc.id} style={styles.testCaseCard}>
                    <View style={styles.testCaseHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.testCaseIndex}>Test Case #{idx + 1}</Text>
                        {tc.is_hidden ? (
                          <View style={styles.hiddenPill}>
                            <Ionicons name="lock-closed" size={11} color="#94A3B8" />
                            <Text style={styles.hiddenPillText}>Hidden</Text>
                          </View>
                        ) : (
                          <View style={styles.samplePill}>
                            <Text style={styles.samplePillText}>Sample</Text>
                          </View>
                        )}
                      </View>

                      {result ? (
                        <View
                          style={[
                            styles.testStatusTag,
                            result.passed ? styles.tagPassed : styles.tagFailed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.testStatusText,
                              result.passed ? styles.textPassed : styles.textFailed,
                            ]}
                          >
                            {result.passed ? '✓ PASSED' : '✗ FAILED'}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View style={styles.testIOBlock}>
                      <Text style={styles.ioLabel}>Input:</Text>
                      <Text style={styles.ioValue}>{tc.input}</Text>

                      <Text style={styles.ioLabel}>Expected Output:</Text>
                      <Text style={styles.ioValue}>{tc.expected_output}</Text>

                      {result?.actualOutput ? (
                        <>
                          <Text style={styles.ioLabel}>Your Output:</Text>
                          <Text
                            style={[
                              styles.ioValue,
                              result.passed ? styles.ioValueCorrect : styles.ioValueWrong,
                            ]}
                          >
                            {result.actualOutput}
                          </Text>
                        </>
                      ) : null}
                    </View>

                    {/* Reveal Hidden Test option if failed */}
                    {tc.is_hidden && isFailed && tc.input === '🔒 Hidden Test Case' ? (
                      <TouchableOpacity
                        style={styles.revealBtn}
                        onPress={() => handleRevealFailedTest(tc.id)}
                      >
                        <Ionicons name="eye-outline" size={13} color="#0284C7" />
                        <Text style={styles.revealBtnText}>Reveal Failed Test Case</Text>
                      </TouchableOpacity>
                    ) : null}
                    {isFailed && (
                      <View style={styles.failedActionsRow}>
                        <TouchableOpacity
                          style={styles.debugFailedTestBtn}
                          onPress={() => handleDebugTestCase(tc)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="bug" size={13} color="#10B981" />
                          <Text style={styles.debugFailedTestBtnText}>Debug This Test Case</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.tryAgainBtn}
                          onPress={() => {
                            setCustomInput(tc.input);
                            setShowCustomInput(true);
                            setActiveTab('CODE');
                          }}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="reload" size={13} color="#0284C7" />
                          <Text style={styles.tryAgainBtnText}>Try Again</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* TAB: VISUAL DEBUGGER */}
          {activeTab === 'DEBUG' && (
            <View>
              <VisualDebugger
                trace={debugTrace}
                onActiveLineChange={(l) => setActiveLineNumber(l)}
                onClose={() => setActiveTab('CODE')}
              />
            </View>
          )}

          {/* TAB: AI CODING TEACHER */}
          {activeTab === 'AI' && (
            <View>
              <AICodingTeacherPanel
                code={code}
                language={selectedLanguage}
                currentStep={debugTrace?.steps[0]}
                activeLineNumber={activeLineNumber}
                error={runResult?.errorMessage || runResult?.stderr}
                topicTitle={task.title}
                onApplyCodeFix={(newCode) => {
                  setCode(newCode);
                  setActiveTab('CODE');
                }}
                onHighlightLine={(line) => {
                  setActiveLineNumber(line);
                }}
                courseId={task.category_id}
              />
            </View>
          )}

          {/* TAB 3: SUBMISSIONS HISTORY */}
          {activeTab === 'SUBMISSIONS' && (
            <View>
              {bestSubmission && (
                <View style={styles.bestSubCard}>
                  <View style={styles.bestSubHeader}>
                    <Ionicons name="trophy" size={18} color="#F59E0B" />
                    <Text style={styles.bestSubTitle}>Best Result</Text>
                  </View>
                  <View style={styles.bestSubStats}>
                    <Text style={styles.bestStat}>Status: <Text style={{ fontWeight: '700', color: '#10B981' }}>{bestSubmission.status}</Text></Text>
                    <Text style={styles.bestStat}>Score: <Text style={{ fontWeight: '700' }}>{bestSubmission.score}%</Text></Text>
                    <Text style={styles.bestStat}>Time: <Text style={{ fontWeight: '700' }}>{(bestSubmission.execution_time_ms / 1000).toFixed(2)}s</Text></Text>
                  </View>
                </View>
              )}

              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>All Attempts ({submissions.length})</Text>
              {submissions.length === 0 ? (
                <Text style={styles.emptyText}>No submissions yet. Write code and tap Submit Solution!</Text>
              ) : (
                submissions.map((sub, i) => (
                  <View key={sub.id} style={styles.subCard}>
                    <View style={styles.subCardHeader}>
                      <Text style={styles.subIndex}>Attempt #{submissions.length - i}</Text>
                      <View
                        style={[
                          styles.testStatusTag,
                          sub.status === 'ACCEPTED' ? styles.tagPassed : styles.tagFailed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.testStatusText,
                            sub.status === 'ACCEPTED' ? styles.textPassed : styles.textFailed,
                          ]}
                        >
                          {sub.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.subDetail}>
                      Passed: {sub.passed_tests} / {sub.total_tests} tests • Score: {sub.score}%
                    </Text>
                    <Text style={styles.subDate}>
                      Submitted: {new Date(sub.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>

                    <TouchableOpacity
                      style={styles.loadCodeBtn}
                      onPress={() => {
                        setCode(sub.source_code);
                        setActiveTab('CODE');
                      }}
                    >
                      <Ionicons name="code-working" size={13} color="#0284C7" />
                      <Text style={styles.loadCodeText}>Load This Code Into Editor</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          )}

          {/* TAB 4: HINTS & SOLUTION WITH MULTIPLE APPROACHES */}
          {activeTab === 'SOLUTION' && (
            <View>
              {/* Progressive Hints Accordion */}
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.sectionTitle}>Progressive Hints</Text>
                  <Text style={styles.hintCountText}>
                    {unlockedHintsCount} / {task.hints?.length || 0} Revealed
                  </Text>
                </View>

                {task.hints?.slice(0, unlockedHintsCount).map((h, i) => (
                  <View key={i} style={styles.hintBox}>
                    <Text style={styles.hintTitle}>Hint #{i + 1}:</Text>
                    <Text style={styles.hintBody}>{h}</Text>
                  </View>
                ))}

                {unlockedHintsCount < (task.hints?.length || 0) && (
                  <TouchableOpacity style={styles.unlockHintBtn} onPress={unlockNextHint}>
                    <Ionicons name="key-outline" size={14} color="#0284C7" />
                    <Text style={styles.unlockHintText}>
                      Reveal Next Hint (#{unlockedHintsCount + 1})
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Multiple Approaches */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Multiple Approaches & Complexity</Text>
                {task.approaches && task.approaches.length > 0 ? (
                  task.approaches.map((app, i) => (
                    <View key={i} style={styles.approachCard}>
                      <View style={styles.approachHeader}>
                        <Text style={styles.approachName}>{app.name}</Text>
                        <View style={styles.complexityPill}>
                          <Text style={styles.complexityText}>
                            Time: {app.complexity_time} • Space: {app.complexity_space}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.approachExp}>{app.explanation}</Text>
                      {app.when_to_use && (
                        <Text style={styles.whenToUse}>When to use: {app.when_to_use}</Text>
                      )}
                      <View style={styles.codeSnippetBox}>
                        <Text style={styles.codeSnippet}>{app.code}</Text>
                      </View>
                    </View>
                  ))
                ) : (
                  <View>
                    <Text style={styles.solutionText}>{task.solution}</Text>
                    <Text style={styles.explanationText}>{task.explanation}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Note Editor Modal */}
        <Modal visible={noteModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.noteModalContent}>
              <Text style={styles.modalTitle}>Add Study Note</Text>
              <Text style={styles.modalSub}>Link a personal note to "{task.title}"</Text>
              <TextInput
                style={styles.noteInput}
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Write your observation or algorithm note here..."
                placeholderTextColor="#64748B"
                multiline
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setNoteModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveNote}>
                  <Text style={styles.modalSaveText}>Save Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Accepted Success Celebration Modal */}
        <Modal visible={successModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.successModalCard}>
              <Ionicons name="ribbon" size={48} color="#F59E0B" />
              <Text style={styles.successTitle}>✓ ACCEPTED</Text>
              <Text style={styles.successSub}>All test cases passed successfully!</Text>

              <View style={styles.rewardGainRow}>
                <View style={styles.rewardPill}>
                  <Text style={styles.rewardPillVal}>+{lastSubmissionXp} XP</Text>
                </View>
                <View style={[styles.rewardPill, { backgroundColor: '#FEF3C7' }]}>
                  <Text style={[styles.rewardPillVal, { color: '#B45309' }]}>
                    +{lastSubmissionPoints} Points
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.continueSuccessBtn}
                onPress={() => setSuccessModalVisible(false)}
              >
                <Text style={styles.continueSuccessText}>Continue Journey</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 1. Save Code Snippet Modal */}
        <Modal visible={saveModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Ionicons name="save" size={20} color="#F59E0B" />
                <Text style={styles.modalTitle}>Save Code Snippet</Text>
              </View>

              <Text style={styles.modalSub}>
                Save your current {selectedLanguage.toUpperCase()} code into your offline SQLite library.
              </Text>

              <TextInput
                style={styles.saveTitleInput}
                placeholder="Snippet Title e.g. Binary Search Implementation"
                placeholderTextColor="#94A3B8"
                value={snippetTitle}
                onChangeText={setSnippetTitle}
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setSaveModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, !snippetTitle.trim() && { opacity: 0.5 }]}
                  onPress={handleSaveSnippet}
                  disabled={!snippetTitle.trim()}
                >
                  <Text style={styles.modalSaveText}>Save Snippet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 2. Saved Snippets Library Modal */}
        <Modal visible={snippetsModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { maxHeight: 500 }]}>
              <View style={styles.modalHeaderRow}>
                <Ionicons name="folder-open" size={20} color="#38BDF8" />
                <Text style={styles.modalTitle}>Saved Code Library</Text>
              </View>

              <ScrollView style={{ maxHeight: 360, marginVertical: 8 }}>
                {savedSnippets.length === 0 ? (
                  <Text style={styles.emptyText}>No saved code snippets yet. Click "Save" to keep code.</Text>
                ) : (
                  savedSnippets.map((snip) => (
                    <View key={snip.id} style={styles.snippetItemCard}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.snippetItemTitle}>{snip.title}</Text>
                        <Text style={styles.snippetItemMeta}>
                          {snip.language.toUpperCase()} • Mode: {snip.learning_mode}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.loadSnippetBtn}
                        onPress={() => handleLoadSnippet(snip)}
                      >
                        <Text style={styles.loadSnippetBtnText}>Load</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSnippetsModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* 3. Language Picker Modal */}
        <Modal visible={langPickerVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Ionicons name="terminal" size={20} color="#10B981" />
                <Text style={styles.modalTitle}>Select Programming Language</Text>
              </View>

              <View style={{ gap: 8, marginVertical: 12 }}>
                {adapterRegistry.getAllSupportedLanguages().map((lang) => {
                  const isSelected = selectedLanguage.toLowerCase() === lang.id.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={lang.id}
                      style={[
                        styles.langSelectItem,
                        isSelected && styles.langSelectItemActive,
                      ]}
                      onPress={() => {
                        setSelectedLanguage(lang.id);
                        setLangPickerVisible(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.langSelectName, isSelected && { color: '#10B981' }]}>
                          {lang.name}
                        </Text>
                        <Text style={styles.langSelectCapability}>
                          {lang.isExecutable ? '✓ Local Secure Sandbox Runner' : '✎ Syntax, Flowchart & Editing'}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setLangPickerVisible(false)}
              >
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  diffDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  diffText: {
    fontSize: 11,
    fontWeight: '700',
  },
  typeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  rewardBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  solvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  solvedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 11,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#0284C7',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0284C7',
    fontWeight: '700',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  problemDesc: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#334155',
  },
  instructionsBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
  },
  customInputToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  customInputToggleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0284C7',
  },
  customInputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
    fontSize: 12.5,
    color: '#0F172A',
    minHeight: 60,
    marginBottom: 10,
  },
  execActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 6,
  },
  runBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  runBtnText: {
    color: '#0284C7',
    fontWeight: '700',
    fontSize: 14,
  },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  consoleBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  consoleTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  consoleStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusSuccess: {
    color: '#10B981',
  },
  statusError: {
    color: '#EF4444',
  },
  consoleOutput: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  optionCardSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  optionCardCorrect: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  optionCardWrong: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#94A3B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0284C7',
  },
  optionText: {
    flex: 1,
    fontSize: 13.5,
    color: '#334155',
  },
  optionTextSelected: {
    color: '#0284C7',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#065F46',
    fontWeight: '700',
  },
  explanationBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  explanationTitle: {
    fontWeight: '700',
    color: '#065F46',
    fontSize: 13,
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  testSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  runAllTestsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  runAllTestsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  testCaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  testCaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  testCaseIndex: {
    fontWeight: '700',
    color: '#0F172A',
    fontSize: 13,
  },
  hiddenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hiddenPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  samplePill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  samplePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
  },
  testStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagPassed: {
    backgroundColor: '#ECFDF5',
  },
  tagFailed: {
    backgroundColor: '#FEF2F2',
  },
  testStatusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  textPassed: {
    color: '#10B981',
  },
  textFailed: {
    color: '#EF4444',
  },
  testIOBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    gap: 4,
  },
  ioLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  ioValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#0F172A',
    marginBottom: 4,
  },
  ioValueCorrect: {
    color: '#10B981',
  },
  ioValueWrong: {
    color: '#EF4444',
  },
  revealBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginTop: 8,
    borderRadius: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  revealBtnText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '700',
  },
  bestSubCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    marginBottom: 10,
  },
  bestSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  bestSubTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  bestSubStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bestStat: {
    fontSize: 12,
    color: '#475569',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 20,
  },
  subCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subIndex: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  subDetail: {
    fontSize: 12.5,
    color: '#334155',
  },
  subDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  loadCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  loadCodeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hintCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
  },
  hintBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 10,
    marginBottom: 8,
  },
  hintTitle: {
    fontWeight: '700',
    color: '#B45309',
    fontSize: 12,
    marginBottom: 2,
  },
  hintBody: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  unlockHintBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  unlockHintText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  approachCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 14,
  },
  approachHeader: {
    marginBottom: 4,
  },
  approachName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  complexityPill: {
    marginTop: 3,
  },
  complexityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  approachExp: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginVertical: 4,
  },
  whenToUse: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748B',
    marginBottom: 6,
  },
  codeSnippetBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
  },
  codeSnippet: {
    color: '#E2E8F0',
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 17,
  },
  solutionText: {
    fontFamily: 'monospace',
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    fontSize: 12,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noteModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },
  noteInput: {
    height: 120,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    marginBottom: 14,
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalCancelText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  successModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#10B981',
    marginTop: 10,
  },
  successSub: {
    fontSize: 13,
    color: '#475569',
    marginTop: 4,
    marginBottom: 16,
  },
  rewardGainRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  rewardPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rewardPillVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284C7',
  },
  continueSuccessBtn: {
    backgroundColor: '#0284C7',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueSuccessText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  workspaceBar: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 6,
  },
  workspaceBarScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  langPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  langIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  langPickerText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  modePillGroup: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 6,
    padding: 2,
    gap: 2,
  },
  modePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  modePillActive: {
    backgroundColor: '#0284C7',
  },
  modePillText: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '600',
  },
  modePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  workspaceActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  workspaceActionText: {
    color: '#F1F5F9',
    fontSize: 11,
    fontWeight: '600',
  },
  debugBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
  },
  debugBtnText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#F59E0B',
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '700',
  },
  failedActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  debugFailedTestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  debugFailedTestBtnText: {
    color: '#10B981',
    fontSize: 11.5,
    fontWeight: '700',
  },
  tryAgainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tryAgainBtnText: {
    color: '#0284C7',
    fontSize: 11.5,
    fontWeight: '600',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  saveTitleInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#0F172A',
    marginVertical: 12,
  },
  snippetItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  snippetItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  snippetItemMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  loadSnippetBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  loadSnippetBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  modalCloseBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  langSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  langSelectItemActive: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  langSelectName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  langSelectCapability: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
});
