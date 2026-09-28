import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useFocusTimer, formatMinutesOrHours } from '../../hooks/useFocusTimer';
import { roadmapService } from '../../services/RoadmapService';
import { dashboardService, CurrentLearningItem } from '../../services/DashboardService';
import { studySessionRepository } from '../../repositories/StudySessionRepository';
import { activityRepository, StreakMetrics } from '../../repositories/ActivityRepository';
import { Course } from '../../models/Course';
import { Module } from '../../models/Module';
import { Topic } from '../../models/Topic';
import { StudySession, FocusSettings } from '../../models/Focus';
import { Colors } from '../../theme/colors';

const PRESET_DURATIONS = [15, 25, 45, 60];

export const FocusScreen: React.FC = () => {
  const { params, navigate, goBack } = useAppNavigation();
  const {
    session,
    formattedTime,
    formattedElapsed,
    remainingSeconds,
    elapsedSeconds,
    progress,
    isRunning,
    isPaused,
    startSession,
    pauseSession,
    resumeSession,
    endAndSaveSession,
    discardSession,
  } = useFocusTimer();

  // Setup state
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [currentLearning, setCurrentLearning] = useState<CurrentLearningItem | null>(null);

  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [focusSettings, setFocusSettings] = useState<FocusSettings | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modals & completion views
  const [showEndConfirm, setShowEndConfirm] = useState<boolean>(false);
  const [completedSession, setCompletedSession] = useState<StudySession | null>(null);
  const [todayTotalSecs, setTodayTotalSecs] = useState<number>(0);
  const [streakMetrics, setStreakMetrics] = useState<StreakMetrics | null>(null);

  // Pulse animation for active timer
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Load initial courses, current learning, and settings
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [fetchedCourses, fetchedCurrent, settings, todaySecs, streak] = await Promise.all([
        roadmapService.getCourses(),
        dashboardService.getCurrentLearningItem(),
        studySessionRepository.getFocusSettings(),
        studySessionRepository.getTodayStudyTime(),
        activityRepository.getStreakMetrics(),
      ]);

      setCourses(fetchedCourses);
      setCurrentLearning(fetchedCurrent);
      setFocusSettings(settings);
      setTodayTotalSecs(todaySecs);
      setStreakMetrics(streak);

      // Pre-selection logic from params or settings
      const defaultDuration = settings.default_duration || 25;
      if (PRESET_DURATIONS.includes(defaultDuration)) {
        setSelectedMinutes(defaultDuration);
        setIsCustom(false);
      } else {
        setSelectedMinutes(defaultDuration);
        setCustomMinutesInput(String(defaultDuration));
        setIsCustom(true);
      }

      // Check params
      const paramCourseId = params?.courseId;
      const paramModuleId = params?.moduleId;
      const paramTopicId = params?.topicId;

      if (paramCourseId) {
        setSelectedCourseId(paramCourseId);
        const fetchedMods = await roadmapService.getModulesByCourse(paramCourseId);
        setModules(fetchedMods);

        if (paramModuleId) {
          setSelectedModuleId(paramModuleId);
          const fetchedTops = await roadmapService.getTopicsByModule(paramModuleId);
          setTopics(fetchedTops);
          if (paramTopicId) {
            setSelectedTopicId(paramTopicId);
          }
        }
      } else if (fetchedCurrent) {
        // Pre-fill with current learning course
        setSelectedCourseId(fetchedCurrent.course.id);
        const fetchedMods = await roadmapService.getModulesByCourse(fetchedCurrent.course.id);
        setModules(fetchedMods);
        setSelectedModuleId(fetchedCurrent.currentModule.id);
        const fetchedTops = await roadmapService.getTopicsByModule(fetchedCurrent.currentModule.id);
        setTopics(fetchedTops);
      } else if (fetchedCourses.length > 0) {
        setSelectedCourseId(fetchedCourses[0].id);
        const fetchedMods = await roadmapService.getModulesByCourse(fetchedCourses[0].id);
        setModules(fetchedMods);
        if (fetchedMods.length > 0) {
          setSelectedModuleId(fetchedMods[0].id);
          const fetchedTops = await roadmapService.getTopicsByModule(fetchedMods[0].id);
          setTopics(fetchedTops);
        }
      }
    } catch (err) {
      console.warn('Failed to load focus setup data:', err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle course dropdown change
  const handleCourseChange = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setSelectedModuleId('');
    setSelectedTopicId('');
    const fetchedMods = await roadmapService.getModulesByCourse(courseId);
    setModules(fetchedMods);
    if (fetchedMods.length > 0) {
      setSelectedModuleId(fetchedMods[0].id);
      const fetchedTops = await roadmapService.getTopicsByModule(fetchedMods[0].id);
      setTopics(fetchedTops);
      if (fetchedTops.length > 0) {
        setSelectedTopicId(fetchedTops[0].id);
      }
    } else {
      setTopics([]);
    }
  };

  // Handle module dropdown change
  const handleModuleChange = async (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setSelectedTopicId('');
    const fetchedTops = await roadmapService.getTopicsByModule(moduleId);
    setTopics(fetchedTops);
    if (fetchedTops.length > 0) {
      setSelectedTopicId(fetchedTops[0].id);
    }
  };

  // Timer pulse animation when running
  useEffect(() => {
    if (isRunning) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.04,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();
      return () => pulseLoop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning, pulseAnim]);

  // Start Focus Handler
  const handleStart = async () => {
    if (!selectedCourseId) {
      Alert.alert('Select Course', 'Please select a course to begin studying.');
      return;
    }

    let durationMins = selectedMinutes;
    if (isCustom) {
      const parsed = parseInt(customMinutesInput, 10);
      if (isNaN(parsed) || parsed < 5 || parsed > 180) {
        Alert.alert('Invalid Duration', 'Please enter a custom duration between 5 and 180 minutes.');
        return;
      }
      durationMins = parsed;
    }

    try {
      setActionLoading(true);
      await startSession({
        courseId: selectedCourseId,
        moduleId: selectedModuleId || null,
        topicId: selectedTopicId || null,
        plannedDurationSeconds: durationMins * 60,
      });
      // Save last chosen duration in settings
      await studySessionRepository.updateFocusSettings({ default_duration: durationMins });
    } catch (err: any) {
      Alert.alert('Cannot Start Session', err?.message || 'A session is already running.');
    } finally {
      setActionLoading(false);
    }
  };

  // Pause / Resume Handlers
  const handleTogglePause = async () => {
    try {
      if (isRunning) {
        await pauseSession();
      } else {
        await resumeSession();
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to toggle timer.');
    }
  };

  // End Session Early Handlers
  const handleEndAndSave = async () => {
    try {
      setShowEndConfirm(false);
      setActionLoading(true);
      const saved = await endAndSaveSession();
      if (saved) {
        setCompletedSession(saved);
        const updatedToday = await studySessionRepository.getTodayStudyTime();
        setTodayTotalSecs(updatedToday);
      }
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not save session.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDiscard = async () => {
    try {
      setShowEndConfirm(false);
      await discardSession();
    } catch (err: any) {
      Alert.alert('Discard Failed', err?.message || 'Could not discard session.');
    }
  };

  // Reset completion celebration
  const handleContinueAfterComplete = () => {
    setCompletedSession(null);
    if (session?.module_id && session?.course_id) {
      navigate('ModuleDetails', { courseId: session.course_id, moduleId: session.module_id });
    } else {
      navigate('Dashboard');
    }
  };

  // ==========================================
  // RENDER: COMPLETION CELEBRATION VIEW
  // ==========================================
  if (completedSession) {
    const studiedMins = Math.round(completedSession.duration_seconds / 60);
    const todayMins = Math.round(todayTotalSecs / 60);

    return (
      <AppShell title="FOCUS COMPLETE">
        <ScrollView contentContainerStyle={styles.celebrationContainer}>
          <View style={styles.celebrationCrest}>
            <Ionicons name="trophy" size={54} color="#F59E0B" />
          </View>

          <Text style={styles.celebrationTitle}>🎉 FOCUS COMPLETE!</Text>
          <Text style={styles.celebrationSubtitle}>
            Your voyage moved forward across uncharted waters.
          </Text>

          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationCourse}>{completedSession.course_name || 'Technical Island'}</Text>
            {completedSession.module_title ? (
              <Text style={styles.celebrationModule}>
                Module: {completedSession.module_title}
              </Text>
            ) : null}
            {completedSession.topic_title ? (
              <Text style={styles.celebrationTopic}>
                Topic: {completedSession.topic_title}
              </Text>
            ) : null}

            <View style={styles.celebrationDivider} />

            <View style={styles.statGrid}>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{studiedMins} min</Text>
                <Text style={styles.statLbl}>SESSION TIME</Text>
              </View>
              <View style={styles.statDividerVert} />
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{todayMins} min</Text>
                <Text style={styles.statLbl}>TODAY'S TOTAL</Text>
              </View>
              <View style={styles.statDividerVert} />
              <View style={styles.statCol}>
                <Text style={[styles.statVal, { color: '#EF4444' }]}>
                  {streakMetrics?.currentStreak || 1} 🔥
                </Text>
                <Text style={styles.statLbl}>DAY STREAK</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleContinueAfterComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryActionText}>Continue Learning</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={() => {
              setCompletedSession(null);
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryActionText}>Start Another Focus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tertiaryActionButton}
            onPress={() => navigate('FocusHistory')}
            activeOpacity={0.7}
          >
            <Text style={styles.tertiaryActionText}>View Study History ›</Text>
          </TouchableOpacity>
        </ScrollView>
      </AppShell>
    );
  }

  // ==========================================
  // RENDER: ACTIVE / PAUSED TIMER VIEW
  // ==========================================
  if (session) {
    const courseTitle = session.course_name || 'Active Study Island';
    const percentInt = Math.round(progress * 100);

    return (
      <AppShell title="FOCUS MODE">
        <View style={styles.timerScreenContainer}>
          {/* Top Bar Navigation & History */}
          <View style={styles.timerHeaderRow}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigate('Dashboard')}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#94A3B8" />
            </TouchableOpacity>

            <View style={styles.breadcrumbsCenter}>
              <Text style={styles.timerBreadcrumbCourse} numberOfLines={1}>
                {courseTitle}
              </Text>
              {session.module_title ? (
                <Text style={styles.timerBreadcrumbModule} numberOfLines={1}>
                  {session.module_title}
                </Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => navigate('FocusSettings')}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Main Dial & Digits */}
          <View style={styles.dialCenterContainer}>
            <Animated.View
              style={[
                styles.timerDialOuter,
                isPaused && styles.timerDialOuterPaused,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <View style={styles.timerDialInner}>
                <Ionicons
                  name={isPaused ? 'pause-circle-outline' : 'compass-outline'}
                  size={32}
                  color={isPaused ? '#F59E0B' : '#38BDF8'}
                  style={{ marginBottom: 6 }}
                />

                <Text style={styles.largeTimerDigits}>{formattedTime}</Text>

                <View style={[styles.statusBadge, isPaused && styles.statusBadgePaused]}>
                  <Text style={styles.statusBadgeText}>
                    {isPaused ? 'PAUSED' : 'FOCUS IN PROGRESS'}
                  </Text>
                </View>

                <Text style={styles.progressPercentText}>
                  {percentInt}% completed ({formatMinutesOrHours(session.planned_duration_seconds)})
                </Text>
              </View>
            </Animated.View>

            {/* Progress track */}
            <View style={styles.horizontalTrack}>
              <View style={[styles.horizontalFill, { width: `${percentInt}%` }]} />
            </View>
          </View>

          {/* Control Buttons */}
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.pauseResumeBtn, isPaused && styles.pauseResumeBtnPaused]}
              onPress={handleTogglePause}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isPaused ? 'play' : 'pause'}
                size={22}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.pauseResumeBtnText}>
                {isPaused ? 'Resume Focus' : 'Pause'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.endEarlyBtn}
              onPress={() => setShowEndConfirm(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="stop" size={18} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.endEarlyBtnText}>End Session</Text>
            </TouchableOpacity>
          </View>

          {/* Current Goal Reminder */}
          <View style={styles.currentGoalCard}>
            <Ionicons name="flag-outline" size={18} color="#38BDF8" style={{ marginRight: 8 }} />
            <Text style={styles.currentGoalText}>
              Keep your focus strong. Every minute mastered brings you closer to the Grand Line summit.
            </Text>
          </View>

          {/* End Confirmation Modal */}
          <Modal
            visible={showEndConfirm}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowEndConfirm(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <View style={styles.modalCrest}>
                  <Ionicons name="hourglass-outline" size={32} color="#0284C7" />
                </View>
                <Text style={styles.modalTitle}>End Focus Session?</Text>
                <Text style={styles.modalDesc}>
                  You have studied for {formatMinutesOrHours(elapsedSeconds)}. What would you like to do?
                </Text>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => setShowEndConfirm(false)}
                >
                  <Text style={styles.modalPrimaryBtnText}>Continue Studying</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalSaveBtn}
                  onPress={handleEndAndSave}
                >
                  <Ionicons name="checkmark-done" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.modalSaveBtnText}>End & Save Session</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalDiscardBtn}
                  onPress={handleDiscard}
                >
                  <Text style={styles.modalDiscardBtnText}>Discard Without Saving</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </AppShell>
    );
  }

  // ==========================================
  // RENDER: SETUP VIEW (Choose duration & course)
  // ==========================================
  return (
    <AppShell title="FOCUS STUDY">
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Preparing Focus Arena...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.setupContainer}
          contentContainerStyle={styles.setupContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Banner */}
          <View style={styles.setupHeaderBox}>
            <View style={styles.setupIconCircle}>
              <Ionicons name="timer-outline" size={28} color="#38BDF8" />
            </View>
            <View style={styles.setupHeaderTextCol}>
              <Text style={styles.setupTitle}>FOCUS STUDY ARENA</Text>
              <Text style={styles.setupSubtitle}>
                Eliminate distractions and master technology islands with timed sessions.
              </Text>
            </View>
          </View>

          {/* Quick Continue Card */}
          {currentLearning ? (
            <TouchableOpacity
              style={styles.quickContinueCard}
              activeOpacity={0.88}
              onPress={() => {
                setSelectedCourseId(currentLearning.course.id);
                setSelectedModuleId(currentLearning.currentModule.id);
              }}
            >
              <View style={styles.quickContinueTop}>
                <Ionicons name="compass" size={18} color="#F59E0B" />
                <Text style={styles.quickContinueBadge}>CONTINUE CURRENT LEARNING</Text>
              </View>
              <Text style={styles.quickContinueCourse}>{currentLearning.course.name}</Text>
              <Text style={styles.quickContinueModule}>
                Module {currentLearning.currentModule.order}: {currentLearning.currentModule.title}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* 1. SELECT COURSE */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionLabel}>1. SELECT COURSE ISLAND</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {courses.map((c) => {
                const isSelected = c.id === selectedCourseId;
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.courseChip, isSelected && styles.courseChipSelected]}
                    onPress={() => handleCourseChange(c.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.courseChipText,
                        isSelected && styles.courseChipTextSelected,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 2. SELECT MODULE */}
          {modules.length > 0 ? (
            <View style={styles.formSection}>
              <Text style={styles.formSectionLabel}>2. SELECT MODULE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {modules.map((m) => {
                  const isSelected = m.id === selectedModuleId;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.moduleChip, isSelected && styles.moduleChipSelected]}
                      onPress={() => handleModuleChange(m.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.moduleChipText,
                          isSelected && styles.moduleChipTextSelected,
                        ]}
                      >
                        M{m.order}: {m.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {/* 3. SELECT TOPIC (OPTIONAL) */}
          {topics.length > 0 ? (
            <View style={styles.formSection}>
              <Text style={styles.formSectionLabel}>3. SELECT TOPIC (OPTIONAL)</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                <TouchableOpacity
                  style={[styles.topicChip, !selectedTopicId && styles.topicChipSelected]}
                  onPress={() => setSelectedTopicId('')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.topicChipText,
                      !selectedTopicId && styles.topicChipTextSelected,
                    ]}
                  >
                    Whole Module
                  </Text>
                </TouchableOpacity>
                {topics.map((t) => {
                  const isSelected = t.id === selectedTopicId;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={[styles.topicChip, isSelected && styles.topicChipSelected]}
                      onPress={() => setSelectedTopicId(t.id)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.topicChipText,
                          isSelected && styles.topicChipTextSelected,
                        ]}
                      >
                        {t.title}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          {/* 4. CHOOSE DURATION */}
          <View style={styles.formSection}>
            <Text style={styles.formSectionLabel}>4. CHOOSE FOCUS DURATION</Text>
            <View style={styles.presetGrid}>
              {PRESET_DURATIONS.map((mins) => {
                const isSelected = !isCustom && selectedMinutes === mins;
                return (
                  <TouchableOpacity
                    key={mins}
                    style={[styles.presetCard, isSelected && styles.presetCardSelected]}
                    onPress={() => {
                      setSelectedMinutes(mins);
                      setIsCustom(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.presetCardNumber,
                        isSelected && styles.presetCardNumberSelected,
                      ]}
                    >
                      {mins}
                    </Text>
                    <Text
                      style={[
                        styles.presetCardUnit,
                        isSelected && styles.presetCardUnitSelected,
                      ]}
                    >
                      MINUTES
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Input */}
            <View style={styles.customRow}>
              <TouchableOpacity
                style={[styles.customToggleBtn, isCustom && styles.customToggleBtnActive]}
                onPress={() => setIsCustom(true)}
              >
                <Ionicons
                  name={isCustom ? 'radio-button-on' : 'radio-button-off'}
                  size={18}
                  color={isCustom ? '#0284C7' : '#64748B'}
                />
                <Text style={styles.customToggleText}>Custom Duration:</Text>
              </TouchableOpacity>

              <TextInput
                style={[styles.customInput, isCustom && styles.customInputActive]}
                placeholder="5-180"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                value={customMinutesInput}
                onChangeText={(val) => {
                  setCustomMinutesInput(val);
                  setIsCustom(true);
                }}
                maxLength={3}
              />
              <Text style={styles.customUnitLabel}>minutes</Text>
            </View>
          </View>

          {/* Start Button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            disabled={actionLoading}
            activeOpacity={0.88}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.startButtonText}>
                  START FOCUS ({isCustom ? customMinutesInput || '25' : selectedMinutes} MIN)
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Quick links to History & Settings */}
          <View style={styles.footerLinksRow}>
            <TouchableOpacity
              style={styles.footerLink}
              onPress={() => navigate('FocusHistory')}
            >
              <Ionicons name="time-outline" size={16} color="#0284C7" />
              <Text style={styles.footerLinkText}>Study History</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.footerLink}
              onPress={() => navigate('FocusSettings')}
            >
              <Ionicons name="options-outline" size={16} color="#0284C7" />
              <Text style={styles.footerLinkText}>Focus Settings</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </AppShell>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  // SETUP SCREEN STYLES
  setupContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  setupContent: {
    padding: 16,
    paddingBottom: 40,
  },
  setupHeaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  setupIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  setupHeaderTextCol: {
    flex: 1,
  },
  setupTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  setupSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 16,
  },
  quickContinueCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickContinueTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  quickContinueBadge: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  quickContinueCourse: {
    color: '#1E293B',
    fontSize: 15,
    fontWeight: '700',
  },
  quickContinueModule: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  formSection: {
    marginBottom: 20,
  },
  formSectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  courseChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  courseChipSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  courseChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  courseChipTextSelected: {
    color: '#FFFFFF',
  },
  moduleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  moduleChipSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  moduleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  moduleChipTextSelected: {
    color: '#FFFFFF',
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  topicChipSelected: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  topicChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#475569',
  },
  topicChipTextSelected: {
    color: '#FFFFFF',
  },
  presetGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  presetCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  presetCardSelected: {
    backgroundColor: '#F0F9FF',
    borderColor: '#0284C7',
  },
  presetCardNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#334155',
  },
  presetCardNumberSelected: {
    color: '#0284C7',
  },
  presetCardUnit: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 2,
  },
  presetCardUnitSelected: {
    color: '#0284C7',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  customToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  customToggleBtnActive: {},
  customToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginLeft: 6,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    width: 60,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  customInputActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  customUnitLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    marginLeft: 8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 16,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footerLinksRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  footerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  footerLinkText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },

  // ACTIVE TIMER VIEW STYLES
  timerScreenContainer: {
    flex: 1,
    backgroundColor: '#0B1120',
    padding: 20,
    justifyContent: 'space-between',
  },
  timerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breadcrumbsCenter: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 12,
  },
  timerBreadcrumbCourse: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timerBreadcrumbModule: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  dialCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  timerDialOuter: {
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 4,
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  timerDialOuterPaused: {
    borderColor: '#F59E0B',
    shadowColor: '#F59E0B',
  },
  timerDialInner: {
    alignItems: 'center',
  },
  largeTimerDigits: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  statusBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusBadgePaused: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  statusBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressPercentText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
  },
  horizontalTrack: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    marginTop: 24,
    overflow: 'hidden',
  },
  horizontalFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pauseResumeBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 16,
    borderRadius: 14,
    marginRight: 10,
  },
  pauseResumeBtnPaused: {
    backgroundColor: '#D97706',
  },
  pauseResumeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  endEarlyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 14,
  },
  endEarlyBtnText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  currentGoalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  currentGoalText: {
    flex: 1,
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalCrest: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalPrimaryBtn: {
    backgroundColor: '#0284C7',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  modalPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 10,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalDiscardBtn: {
    paddingVertical: 10,
  },
  modalDiscardBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },

  // CELEBRATION VIEW STYLES
  celebrationContainer: {
    padding: 24,
    alignItems: 'center',
  },
  celebrationCrest: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  celebrationSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },
  celebrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  celebrationCourse: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0284C7',
  },
  celebrationModule: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 4,
  },
  celebrationTopic: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 2,
  },
  celebrationDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
  statDividerVert: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 16,
    width: '100%',
    marginBottom: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    marginBottom: 16,
  },
  secondaryActionText: {
    color: '#0284C7',
    fontSize: 14,
    fontWeight: '700',
  },
  tertiaryActionButton: {
    paddingVertical: 8,
  },
  tertiaryActionText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
