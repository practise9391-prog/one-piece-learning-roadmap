import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import { Spacing, Radius } from '../../theme/tokens';
import { Header } from '../../components/Header';
import { ProgressBar } from '../../components/ProgressBar';
import { CodeBlock } from '../../components/common/CodeBlock';
import { NotesEditor } from '../../components/learning/NotesEditor';
import {
  TopicLearningHeader,
  ExplanationToggle,
  WhyItMattersViewer,
  RealLifeExampleViewer,
  HowItWorksViewer,
  KeyTermsViewer,
  SyntaxStructureViewer,
  ExecutionSimulationViewer,
  UniversalVisualizationViewer,
  DetailedExamplesViewer,
  BeforeVsAfterViewer,
  ComparisonTableView,
  TopicQuizViewer,
  TopicInterviewViewer,
  MemoryCardsViewer,
  OneMinuteRevisionViewer,
  CheatSheetViewer,
  FinalTestViewer,
  TopicSearchModal,
} from '../../components/learning/topicEngine';
import { GlobalAITeacherModal } from '../../components/ai/GlobalAITeacherModal';
import { aiContextManager } from '../../services/ai/AIContextManager';

import { roadmapService } from '../../services/RoadmapService';
import { progressService } from '../../services/ProgressService';
import { topicContentService } from '../../services/TopicContentService';
import { topicRepository } from '../../repositories/TopicRepository';
import { topicLearningRepository, TopicLearningState } from '../../repositories/TopicLearningRepository';
import { practiceRepository } from '../../repositories/PracticeRepository';
import { activityRepository } from '../../repositories/ActivityRepository';
import { gamificationService } from '../../services/GamificationService';

import { Course } from '../../models/Course';
import { Module } from '../../models/Module';
import { Topic } from '../../models/Topic';
import { TopicContent } from '../../models/TopicContent';
import { PracticeQuestion } from '../../models/Practice';

export const InteractiveTopicScreen: React.FC = () => {
  const { params, goBack, navigate } = useAppNavigation();
  const { colors, isDark } = useTheme();

  const courseId = params?.courseId || 'python';
  const moduleId = params?.moduleId || '';
  const initialTopicId = params?.topicId || '';

  const [loading, setLoading] = useState<boolean>(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState<number>(0);
  const [content, setContent] = useState<TopicContent | null>(null);
  const [learningState, setLearningState] = useState<TopicLearningState | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);

  // Local interactive states
  const [explanationMode, setExplanationMode] = useState<'simple' | 'technical'>('simple');
  const [searchModalVisible, setSearchModalVisible] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [activePracticeHintIndex, setActivePracticeHintIndex] = useState<number>(0);
  const [showPracticeSolution, setShowPracticeSolution] = useState<boolean>(false);
  const [aiTeacherModalVisible, setAiTeacherModalVisible] = useState<boolean>(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const sectionPositionsRef = useRef<Record<string, number>>({});

  const currentTopic = topics[currentTopicIndex] || null;

  // Load all course, module, topic, and state data
  const loadTopicData = useCallback(async () => {
    try {
      setLoading(true);
      const courseData = await roadmapService.getCourseWithModules(courseId);
      setCourse(courseData.course);

      let targetModule = courseData.modules.find((m) => m.id === moduleId);
      if (!targetModule && courseData.modules.length > 0) {
        targetModule = courseData.modules[0];
      }
      setModule(targetModule || null);

      if (targetModule) {
        const modTopics = await topicRepository.getByModuleId(targetModule.id);
        setTopics(modTopics);

        let initialIdx = 0;
        if (initialTopicId) {
          const found = modTopics.findIndex((t) => t.id === initialTopicId);
          if (found !== -1) initialIdx = found;
        } else if (targetModule.last_opened_topic_id) {
          const found = modTopics.findIndex((t) => t.id === targetModule.last_opened_topic_id);
          if (found !== -1) initialIdx = found;
        }
        setCurrentTopicIndex(initialIdx);

        const activeTop = modTopics[initialIdx];
        if (activeTop) {
          // Load enriched content
          const richContent = topicContentService.getContent(
            courseId,
            targetModule.title,
            activeTop.title,
            activeTop.content
          );
          setContent(richContent);

          // Load learning state
          const state = await topicLearningRepository.getOrCreate(
            activeTop.id,
            courseId,
            targetModule.id
          );
          setLearningState(state);
          setExplanationMode(state.explanationMode);

          // Mark lesson read in state
          topicLearningRepository.markLessonRead(activeTop.id).catch(() => {});

          // Load practice questions
          practiceRepository
            .getQuestions({ categoryId: courseId, topic: activeTop.title })
            .then((res) => {
              if (res.length > 0) {
                setPracticeQuestions(res);
              } else {
                practiceRepository.getQuestions({ categoryId: courseId }).then(setPracticeQuestions);
              }
            })
            .catch(() => {});

          // Record learning activity
          activityRepository
            .recordActivity({
              courseId,
              moduleId: targetModule.id,
              topicId: activeTop.id,
              activityType: 'MODULE_OPENED',
            })
            .catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to load topic learning engine data:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId, initialTopicId]);

  useEffect(() => {
    loadTopicData();
  }, [loadTopicData]);

  // Handle switching to a different topic
  const handleSelectTopic = async (idx: number) => {
    if (idx < 0 || idx >= topics.length) return;
    setCurrentTopicIndex(idx);
    const nextTop = topics[idx];
    if (nextTop && module) {
      setShowPracticeSolution(false);
      setActivePracticeHintIndex(0);

      const richContent = topicContentService.getContent(
        courseId,
        module.title,
        nextTop.title,
        nextTop.content
      );
      setContent(richContent);

      const state = await topicLearningRepository.getOrCreate(nextTop.id, courseId, module.id);
      setLearningState(state);
      setExplanationMode(state.explanationMode);

      topicLearningRepository.markLessonRead(nextTop.id).catch(() => {});

      // Scroll to top
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleExplanationToggle = async (mode: 'simple' | 'technical') => {
    setExplanationMode(mode);
    if (currentTopic) {
      await topicLearningRepository.updateExplanationMode(currentTopic.id, mode);
    }
  };

  const handleContinueSection = (sectionKey: string) => {
    const yPos = sectionPositionsRef.current[sectionKey];
    if (yPos !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yPos, animated: true });
    }
  };

  const handleRestartTopic = async () => {
    if (!currentTopic || !module) return;
    Alert.alert('Restart Topic', 'Are you sure you want to restart this topic from the beginning?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restart',
        style: 'destructive',
        onPress: async () => {
          await topicLearningRepository.updateLastSection(currentTopic.id, 'introduction');
          await topicLearningRepository.updateLessonStep(currentTopic.id, 0);
          setLearningState((prev: TopicLearningState | null) => (prev ? { ...prev, lastSection: 'introduction', lessonStep: 0 } : null));
          scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        },
      },
    ]);
  };

  const handleQuizComplete = async (score: number, total: number) => {
    if (!currentTopic || !module) return;
    await topicLearningRepository.recordQuizAttempt(currentTopic.id, score, total);
    setLearningState((prev: TopicLearningState | null) =>
      prev
        ? {
            ...prev,
            quizAttempted: true,
            quizScore: score,
            quizTotalQuestions: total,
            quizBestScore: Math.max(prev.quizBestScore, score),
          }
        : null
    );

    // Award XP
    gamificationService.onTopicCompleted(currentTopic.id, courseId, module.id, false, currentTopic.title).catch(() => {});
  };

  const handleFinalTestComplete = async (passed: boolean, score: number, total: number) => {
    if (!currentTopic || !module) return;
    await topicLearningRepository.recordFinalTest(currentTopic.id, score);
    setLearningState((prev: TopicLearningState | null) =>
      prev
        ? { ...prev, finalTestAttempted: true, finalTestScore: score }
        : null
    );

    if (passed) {
      // Mark topic complete in database and progress hierarchy
      await topicLearningRepository.markComplete(currentTopic.id);
      const res = await progressService.toggleTopicCompletion(courseId, module.id, currentTopic.id);
      setTopics((prev) => prev.map((t) => (t.id === currentTopic.id ? res.topic : t)));
      setModule(res.module);
      setCourse(res.course);

      gamificationService.onTopicCompleted(currentTopic.id, courseId, module.id, false, currentTopic.title).catch(() => {});

      Alert.alert(
        '🏆 Topic Mastered!',
        `Congratulations! You have completed all learning, visual, and assessment criteria for "${currentTopic.title}".`,
        [
          {
            text: 'Next Topic ➔',
            onPress: () => {
              if (currentTopicIndex < topics.length - 1) {
                handleSelectTopic(currentTopicIndex + 1);
              } else {
                goBack();
              }
            },
          },
          { text: 'Stay Here', style: 'cancel' },
        ]
      );
    }
  };

  const calculateTopicProgress = (): number => {
    if (!learningState) return currentTopic?.is_completed ? 100 : 0;
    if (currentTopic?.is_completed) return 100;
    return topicLearningRepository.calculateProgress(
      learningState,
      !!content?.universalVisualization,
      !!content?.quizQuestions?.length
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Interactive Topic Engine" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Initializing Interactive Learning Pipeline...
          </Text>
        </View>
      </View>
    );
  }

  if (!currentTopic || !module || !content) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Topic Not Found" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.textPrimary }]}>
            Unable to Load Interactive Topic
          </Text>
          <Text style={[styles.errorSubtitle, { color: colors.textSecondary }]}>
            Could not find topic data in local SQLite database.
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
            onPress={loadTopicData}
            activeOpacity={0.8}
          >
            <Text style={styles.retryBtnText}>Retry Loading</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const progressPct = calculateTopicProgress();

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title={currentTopic.title}
        subtitle={`${course?.name || 'Course'} • Module ${module.order}`}
        showBack
        onBackPress={goBack}
        rightAction={
          <TouchableOpacity
            onPress={() => setSearchModalVisible(true)}
            style={styles.headerSearchBtn}
            accessibilityLabel="Search topic contents"
          >
            <Ionicons name="search" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 1. TOPIC HEADER & RESUME CONTROLS */}
        <TopicLearningHeader
          courseName={course?.name || 'Roadmap'}
          moduleName={module.title}
          moduleOrder={module.order}
          topicTitle={currentTopic.title}
          topicIndex={currentTopicIndex}
          totalTopics={topics.length}
          difficulty="Beginner"
          estimatedMinutes={25}
          progressPercentage={progressPct}
          isCompleted={currentTopic.is_completed}
          lastSection={learningState?.lastSection}
          onContinueSection={handleContinueSection}
          onRestartTopic={handleRestartTopic}
          hasPrevTopic={currentTopicIndex > 0}
          hasNextTopic={currentTopicIndex < topics.length - 1}
          onPrevTopic={() => handleSelectTopic(currentTopicIndex - 1)}
          onNextTopic={() => handleSelectTopic(currentTopicIndex + 1)}
          onSearchPress={() => setSearchModalVisible(true)}
          isBookmarked={isBookmarked}
          onToggleBookmark={() => setIsBookmarked(!isBookmarked)}
        />

        {/* CONTEXTUAL AI PERSONAL TEACHER BAR (Part 7) */}
        <TouchableOpacity
          onPress={() => {
            aiContextManager.setTopicContext({
              courseId,
              moduleId: module?.id,
              topicId: currentTopic?.id,
              topicTitle: currentTopic?.title || 'Active Topic',
              currentSection: learningState?.lastSection || 'Overview',
              explanationText: content?.explanation,
              exampleCode: content?.codeSnippet?.code,
            });
            setAiTeacherModalVisible(true);
          }}
          style={[styles.aiTeacherLaunchBtn, { backgroundColor: isDark ? '#1E1B4B' : '#EEF2FF', borderColor: '#818CF8' }]}
          activeOpacity={0.8}
        >
          <View style={styles.aiTeacherLaunchLeft}>
            <View style={styles.aiTeacherIconCircle}>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.aiTeacherLaunchTitle, { color: isDark ? '#C7D2FE' : '#3730A3' }]}>
                Ask Personal AI Teacher
              </Text>
              <Text style={styles.aiTeacherLaunchSubtitle} numberOfLines={1}>
                Voice analogies, hints, visual diagrams & quiz
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6366F1" />
        </TouchableOpacity>

        {/* 2. SIMPLE VS TECHNICAL EXPLANATION TOGGLE */}
        <View
          onLayout={(e) => {
            sectionPositionsRef.current['explanation'] = e.nativeEvent.layout.y;
          }}
        >
          <ExplanationToggle
            mode={explanationMode}
            onToggleMode={handleExplanationToggle}
            simpleText={content.simpleExplanation || content.explanation}
            technicalText={content.technicalExplanation || content.explanation}
          />
        </View>

        {/* 3. WHY IT MATTERS */}
        {content.whyItMatters && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['why_it_matters'] = e.nativeEvent.layout.y;
            }}
          >
            <WhyItMattersViewer data={content.whyItMatters} />
          </View>
        )}

        {/* 4. REAL-LIFE RELATABLE EXAMPLE */}
        {content.realLifeExample && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['real_life'] = e.nativeEvent.layout.y;
            }}
          >
            <RealLifeExampleViewer data={content.realLifeExample} />
          </View>
        )}

        {/* 5. HOW IT WORKS (INTERNAL FLOW) */}
        {content.howItWorks && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['how_it_works'] = e.nativeEvent.layout.y;
            }}
          >
            <HowItWorksViewer data={content.howItWorks} />
          </View>
        )}

        {/* 6. KEY VOCABULARY & TERMS */}
        {content.keyTerms && content.keyTerms.length > 0 && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['key_terms'] = e.nativeEvent.layout.y;
            }}
          >
            <KeyTermsViewer
              terms={content.keyTerms}
              onSelectRelatedTopic={(termTopic) => {
                Alert.alert('Related Concept', `Explore "${termTopic}" in curriculum modules.`);
              }}
            />
          </View>
        )}

        {/* 7. SYNTAX & CODE STRUCTURE */}
        {content.syntaxStructure && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['syntax'] = e.nativeEvent.layout.y;
            }}
          >
            <SyntaxStructureViewer data={content.syntaxStructure} />
          </View>
        )}

        {/* 8. STEP-BY-STEP CODE EXECUTION SIMULATION */}
        {content.executionSimulation && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['execution'] = e.nativeEvent.layout.y;
            }}
          >
            <ExecutionSimulationViewer
              data={content.executionSimulation}
              onExplainAgain={() => setExplanationMode('simple')}
              onWhyPress={() => {
                Alert.alert(
                  'Why this step?',
                  'Each line transforms the runtime memory snapshot deterministically before handing control back.'
                );
              }}
            />
          </View>
        )}

        {/* 9. UNIVERSAL DATA-DRIVEN VISUALIZATION */}
        {content.universalVisualization && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['visualization'] = e.nativeEvent.layout.y;
            }}
          >
            <UniversalVisualizationViewer config={content.universalVisualization} />
          </View>
        )}

        {/* 10. MULTIPLE CODE EXAMPLES (BASIC, PRACTICAL, TRICKY, REAL-WORLD) */}
        {content.detailedExamples && content.detailedExamples.length > 0 && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['examples'] = e.nativeEvent.layout.y;
            }}
          >
            <DetailedExamplesViewer examples={content.detailedExamples} />
          </View>
        )}

        {/* 11. BEFORE VS AFTER COMPARISON */}
        {content.beforeVsAfter && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['before_after'] = e.nativeEvent.layout.y;
            }}
          >
            <BeforeVsAfterViewer data={content.beforeVsAfter} />
          </View>
        )}

        {/* 12. COMPARISON TABLE */}
        {content.comparisonTable && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['comparison'] = e.nativeEvent.layout.y;
            }}
          >
            <ComparisonTableView data={content.comparisonTable} />
          </View>
        )}

        {/* 13. TOPIC PRACTICE DRILL & PROGRESSIVE HINTS */}
        {content.practiceProblem && (
          <View
            style={[styles.practiceCard, { backgroundColor: colors.surfaceCard, borderColor: '#6366F1' }]}
            onLayout={(e) => {
              sectionPositionsRef.current['practice'] = e.nativeEvent.layout.y;
            }}
          >
            <View style={styles.practiceHeader}>
              <Ionicons name="pencil-outline" size={18} color="#6366F1" />
              <Text style={[styles.practiceTitle, { color: colors.textPrimary }]}>TOPIC PRACTICE DRILL</Text>
            </View>

            <Text style={[styles.practiceQuestion, { color: colors.textPrimary }]}>
              {content.practiceProblem.question}
            </Text>

            {content.practiceProblem.hint && (
              <View style={[styles.hintBox, { backgroundColor: isDark ? '#172554' : '#EFF6FF', borderColor: '#93C5FD' }]}>
                <Ionicons name="bulb-outline" size={15} color="#2563EB" />
                <Text style={[styles.hintText, { color: isDark ? colors.textPrimary : '#1E40AF' }]}>
                  💡 Hint: {content.practiceProblem.hint}
                </Text>
              </View>
            )}

            <View style={styles.practiceBtnRow}>
              <TouchableOpacity
                onPress={() => {
                  navigate('CodeWorkspace', {
                    title: `${currentTopic?.title || 'Topic'} - Practice Drill`,
                    code: content.practiceProblem?.starterCode || `# Practice: ${currentTopic?.title || 'Coding Drill'}\n# Task: ${content.practiceProblem?.question || ''}\n\n# Write your solution below:\n`,
                    language: courseId === 'javascript' ? 'javascript' : courseId === 'sql' ? 'sql' : 'python',
                    mode: 'PRACTICE',
                    courseId,
                  });
                }}
                style={[styles.workspacePracticeBtn, { backgroundColor: '#6366F1' }]}
                activeOpacity={0.8}
              >
                <Ionicons name="code-slash" size={16} color="#FFFFFF" />
                <Text style={styles.workspacePracticeBtnText}>Solve in Code Workspace</Text>
              </TouchableOpacity>

              {!showPracticeSolution ? (
                <TouchableOpacity
                  onPress={() => {
                    setShowPracticeSolution(true);
                    if (currentTopic) {
                      topicLearningRepository.recordPracticeAttempt(currentTopic.id, 100).catch(() => {});
                    }
                  }}
                  style={[styles.showSolutionBtn, { backgroundColor: colors.surfaceCard, borderWidth: 1.5, borderColor: colors.border }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="eye-outline" size={16} color={colors.textPrimary} />
                  <Text style={[styles.showSolutionBtnText, { color: colors.textPrimary }]}>Reveal Walkthrough</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {showPracticeSolution && (
              <View style={[styles.solutionBox, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: '#34D399' }]}>
                <Text style={styles.solutionHeader}>WALKTHROUGH & SOLUTION:</Text>
                <Text style={[styles.solutionText, { color: isDark ? colors.textPrimary : '#064E3B' }]}>
                  {content.practiceProblem.solution}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 14. TOPIC KNOWLEDGE QUIZ */}
        {content.quizQuestions && content.quizQuestions.length > 0 && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['quiz'] = e.nativeEvent.layout.y;
            }}
          >
            <TopicQuizViewer
              questions={content.quizQuestions}
              topicId={currentTopic.id}
              bestScore={learningState?.quizBestScore}
              onQuizComplete={handleQuizComplete}
            />
          </View>
        )}

        {/* 15. TOPIC INTERVIEW QUESTIONS */}
        {content.interviewQuestionsList && content.interviewQuestionsList.length > 0 && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['interview'] = e.nativeEvent.layout.y;
            }}
          >
            <TopicInterviewViewer
              questions={content.interviewQuestionsList}
              onAnswerRevealed={(count) => {
                topicLearningRepository.recordInterviewAnswered(currentTopic.id, count).catch(() => {});
              }}
            />
          </View>
        )}

        {/* 16. PERSONAL NOTES EDITOR */}
        <NotesEditor
          courseId={courseId}
          moduleId={module.id}
          moduleTitle={`${module.title} • ${currentTopic.title}`}
        />

        {/* 17. ACTIVE RECALL MEMORY CARDS */}
        {content.memoryCards && content.memoryCards.length > 0 && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['memory_cards'] = e.nativeEvent.layout.y;
            }}
          >
            <MemoryCardsViewer
              cards={content.memoryCards}
              savedRevisionState={learningState?.revisionState}
              onRevisionChange={(revState) => {
                topicLearningRepository.updateRevisionState(currentTopic.id, revState).catch(() => {});
              }}
            />
          </View>
        )}

        {/* 18. ⚡ 1-MINUTE HIGH-SPEED REVISION */}
        {content.oneMinuteRevision && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['one_minute'] = e.nativeEvent.layout.y;
            }}
          >
            <OneMinuteRevisionViewer data={content.oneMinuteRevision} />
          </View>
        )}

        {/* 19. COMPACT TOPIC CHEAT SHEET */}
        {content.cheatSheet && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['cheat_sheet'] = e.nativeEvent.layout.y;
            }}
          >
            <CheatSheetViewer data={content.cheatSheet} />
          </View>
        )}

        {/* 20. FINAL TOPIC ASSESSMENT & COMPLETION */}
        {content.finalTestQuestions && content.finalTestQuestions.length > 0 && (
          <View
            onLayout={(e) => {
              sectionPositionsRef.current['final_test'] = e.nativeEvent.layout.y;
            }}
          >
            <FinalTestViewer
              questions={content.finalTestQuestions}
              topicId={currentTopic.id}
              onTestComplete={handleFinalTestComplete}
              isAlreadyPassed={currentTopic.is_completed}
            />
          </View>
        )}

        {/* Bottom Navigation Row */}
        <View style={styles.bottomNavRow}>
          <TouchableOpacity
            onPress={() => handleSelectTopic(currentTopicIndex - 1)}
            disabled={currentTopicIndex === 0}
            style={[styles.bottomNavBtn, currentTopicIndex === 0 && { opacity: 0.4 }, { borderColor: colors.border }]}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={16} color={colors.textPrimary} />
            <Text style={[styles.bottomNavText, { color: colors.textPrimary }]}>Previous Topic</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (currentTopicIndex < topics.length - 1) {
                handleSelectTopic(currentTopicIndex + 1);
              } else {
                goBack();
              }
            }}
            style={[styles.bottomNavBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.bottomNavText, { color: '#FFFFFF' }]}>
              {currentTopicIndex < topics.length - 1 ? 'Next Topic ➔' : 'Back to Module ✓'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* In-Topic Search Modal */}
      <TopicSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        topicTitle={currentTopic.title}
        content={content}
        onSelectSection={handleContinueSection}
      />

      {/* Global AI Personal Teacher Modal (Part 7) */}
      <GlobalAITeacherModal
        visible={aiTeacherModalVisible}
        onClose={() => setAiTeacherModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
  },
  errorSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  headerSearchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 60,
  },
  aiTeacherLaunchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm + 4,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  aiTeacherLaunchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  aiTeacherIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTeacherLaunchTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  aiTeacherLaunchSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  practiceCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md + 2,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: Spacing.sm,
  },
  practiceTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  practiceQuestion: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: Spacing.md,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 6,
    marginBottom: Spacing.md,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  practiceBtnRow: {
    gap: 8,
    marginBottom: Spacing.sm,
  },
  workspacePracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.sm,
    gap: 6,
  },
  workspacePracticeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  showSolutionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: Radius.sm,
    gap: 6,
  },
  showSolutionBtnText: {
    fontSize: 12,
    fontWeight: '800',
  },
  solutionBox: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    gap: 6,
  },
  solutionHeader: {
    color: '#059669',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  solutionText: {
    fontSize: 13,
    lineHeight: 19,
  },
  bottomNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
    gap: 10,
  },
  bottomNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    gap: 6,
  },
  bottomNavText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
