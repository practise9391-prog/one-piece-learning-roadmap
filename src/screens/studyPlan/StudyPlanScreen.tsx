import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { Colors } from '../../theme/colors';
import { useAppNavigation } from '../../navigation/NavigationContext';
import {
  StudyPlan,
  StudyPlanItem,
  StudyGoal,
  WeeklyPlanDay,
  MonthlyWeekSummary,
  GoalPeriod,
} from '../../models/StudyPlan';
import {
  studyPlanRepository,
  getTodayDateString,
  getWeekBounds,
} from '../../repositories/StudyPlanRepository';
import { CreateDailyPlanModal } from '../../components/studyPlan/CreateDailyPlanModal';
import { CreateGoalModal } from '../../components/studyPlan/CreateGoalModal';
import { StudySessionTimerModal } from '../../components/studyPlan/StudySessionTimerModal';
import { StudyHistoryModal } from '../../components/studyPlan/StudyHistoryModal';
import { StudyCalendarModal } from '../../components/studyPlan/StudyCalendarModal';
import { StudyPreferencesModal } from '../../components/studyPlan/StudyPreferencesModal';
import { RescheduleTopicModal } from '../../components/studyPlan/RescheduleTopicModal';

type ActiveTab = 'TODAY' | 'WEEK' | 'MONTH';

export const StudyPlanScreen: React.FC = () => {
  const { openDrawer, navigate } = useAppNavigation();

  const [activeTab, setActiveTab] = useState<ActiveTab>('TODAY');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Data states
  const [dailyPlan, setDailyPlan] = useState<StudyPlan | null>(null);
  const [unfinishedItems, setUnfinishedItems] = useState<StudyPlanItem[]>([]);
  const [weeklyDays, setWeeklyDays] = useState<WeeklyPlanDay[]>([]);
  const [monthlyWeeks, setMonthlyWeeks] = useState<MonthlyWeekSummary[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [goals, setGoals] = useState<StudyGoal[]>([]);
  const [currentStreak, setCurrentStreak] = useState<number>(0);

  // Modals
  const [showCreatePlanModal, setShowCreatePlanModal] = useState<boolean>(false);
  const [showCreateGoalModal, setShowCreateGoalModal] = useState<boolean>(false);
  const [createGoalPeriod, setCreateGoalPeriod] = useState<GoalPeriod>('DAILY');
  const [showTimerModal, setShowTimerModal] = useState<boolean>(false);
  const [activeTimerItem, setActiveTimerItem] = useState<StudyPlanItem | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState<boolean>(false);
  const [rescheduleItem, setRescheduleItem] = useState<StudyPlanItem | null>(null);

  const todayStr = getTodayDateString();

  const loadData = useCallback(async () => {
    try {
      // Daily Plan & Unfinished
      const plan = await studyPlanRepository.getDailyPlan(todayStr);
      setDailyPlan(plan);

      const unfinished = await studyPlanRepository.getUnfinishedTopicsFromPreviousDays(5);
      setUnfinishedItems(unfinished);

      // Weekly breakdown
      const days = await studyPlanRepository.getWeeklyDayBreakdown();
      setWeeklyDays(days);

      // Monthly roadmap & summary
      const weeks = await studyPlanRepository.getMonthlyWeekProgress();
      setMonthlyWeeks(weeks);

      const mSummary = await studyPlanRepository.getMonthlySummary();
      setMonthlySummary(mSummary);

      // Goals & Streak
      const allGoals = await studyPlanRepository.getGoals();
      setGoals(allGoals);

      const streak = await studyPlanRepository.calculateCurrentStreak();
      setCurrentStreak(streak);
    } catch (err) {
      console.error('Failed to load study plan data:', err);
    }
  }, [todayStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleStartStudy = (item: StudyPlanItem) => {
    setActiveTimerItem(item);
    setShowTimerModal(true);
  };

  const handleMarkItemDone = async (item: StudyPlanItem) => {
    await studyPlanRepository.markPlanItemCompleted(item.id, item.plannedMinutes || 25);
    await loadData();
  };

  const handleOpenReschedule = (item: StudyPlanItem) => {
    setRescheduleItem(item);
    setShowRescheduleModal(true);
  };

  const handleContinueUnfinished = async () => {
    await studyPlanRepository.continueUnfinishedTopics(todayStr);
    Alert.alert('Missions Added', 'Yesterday\'s unfinished topics have been added to today\'s voyage!');
    await loadData();
  };

  // Calculations for today's header
  const plannedMin = dailyPlan?.plannedMinutes || 0;
  const completedMin = dailyPlan?.completedMinutes || 0;
  const plannedTopics = dailyPlan?.plannedTopics || 0;
  const completedTopics = dailyPlan?.completedTopics || 0;
  const remainingTopics = Math.max(0, plannedTopics - completedTopics);

  const timePct = plannedMin > 0 ? Math.min(100, Math.round((completedMin / plannedMin) * 100)) : 0;
  const isGoalReached = plannedTopics > 0 && completedTopics >= plannedTopics;

  // Format date display (e.g. Monday, September 28)
  const dateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <AppShell title="STUDY PLAN">
      {/* Top Header Row with Calendar & History buttons */}
      <View style={styles.topControlRow}>
        <View>
          <Text style={styles.screenHeading}>Voyage Study Plan 🎯</Text>
          <Text style={styles.screenSubheading}>{dateFormatted}</Text>
        </View>
        <View style={styles.topIconsRow}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowCalendarModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setShowHistoryModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="time-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        {(['TODAY', 'WEEK', 'MONTH'] as ActiveTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                {tab === 'TODAY' ? "Today's Plan" : tab === 'WEEK' ? 'Weekly Plan' : 'Monthly Roadmap'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* ========================================================================= */}
        {/* TAB 1: TODAY'S STUDY PLAN */}
        {/* ========================================================================= */}
        {activeTab === 'TODAY' && (
          <>
            {/* Dashboard Compact Widgets */}
            <View style={styles.widgetsGrid}>
              <View style={styles.widgetCard}>
                <View style={styles.widgetHeader}>
                  <Text style={styles.widgetLabel}>TODAY</Text>
                  <Ionicons name="timer-outline" size={14} color="#0284C7" />
                </View>
                <Text style={styles.widgetVal}>
                  {completedMin}/{plannedMin}m
                </Text>
                <Text style={styles.widgetSub}>{timePct}% completed</Text>
              </View>

              <View style={styles.widgetCard}>
                <View style={styles.widgetHeader}>
                  <Text style={styles.widgetLabel}>TOPICS LEFT</Text>
                  <Ionicons name="checkbox-outline" size={14} color="#10B981" />
                </View>
                <Text style={styles.widgetVal}>{remainingTopics}</Text>
                <Text style={styles.widgetSub}>{completedTopics} completed</Text>
              </View>

              <View style={styles.widgetCard}>
                <View style={styles.widgetHeader}>
                  <Text style={styles.widgetLabel}>STREAK</Text>
                  <Ionicons name="flame" size={14} color="#EA580C" />
                </View>
                <Text style={styles.widgetVal}>{currentStreak}d</Text>
                <Text style={styles.widgetSub}>Study voyage</Text>
              </View>
            </View>

            {/* Today's Plan Header Card */}
            <View style={styles.todayCard}>
              <View style={styles.todayTopRow}>
                <View>
                  <Text style={styles.todayDateText}>{dateFormatted}</Text>
                  <Text style={styles.todayGoalText}>
                    Goal: {Math.round(plannedMin / 60)}h ({plannedMin} minutes)
                  </Text>
                </View>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressCircleVal}>{timePct}%</Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${timePct}%` }]} />
              </View>

              <View style={styles.progressStatsRow}>
                <Text style={styles.progressStatText}>
                  ⏱️ {completedMin} / {plannedMin} minutes
                </Text>
                <Text style={styles.progressStatText}>
                  📚 {completedTopics} / {plannedTopics} topics
                </Text>
              </View>
            </View>

            {/* Goal Celebration Banner */}
            {isGoalReached && !dailyPlan?.isRestDay && (
              <View style={styles.celebrationBanner}>
                <Ionicons name="trophy" size={24} color="#D97706" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.celebrationTitle}>Today's Goal Completed! 🎉</Text>
                  <Text style={styles.celebrationSub}>
                    Outstanding work, Voyager! All planned missions achieved today.
                  </Text>
                </View>
              </View>
            )}

            {/* Rest Day Banner */}
            {dailyPlan?.isRestDay && (
              <View style={styles.restDayBanner}>
                <Text style={{ fontSize: 26, marginRight: 10 }}>🏖️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.restDayBannerTitle}>Today is a Rest Day</Text>
                  <Text style={styles.restDayBannerSub}>
                    Enjoy your recharge! No daily targets required. This will not count as a missed study day.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.changePlanBtn}
                  onPress={() => setShowCreatePlanModal(true)}
                >
                  <Text style={styles.changePlanBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Continue Unfinished Topics Prompt */}
            {unfinishedItems.length > 0 && !dailyPlan?.isRestDay && (
              <View style={styles.unfinishedCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.unfinishedTitle}>Unfinished Topics Available</Text>
                  <Text style={styles.unfinishedSub}>
                    {unfinishedItems.length} topics carried over from past days.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={handleContinueUnfinished}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueBtnText}>Add to Today</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Quick Actions Row */}
            <View style={styles.quickRow}>
              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => setShowCreatePlanModal(true)}
              >
                <Ionicons name="add-circle-outline" size={16} color={Colors.primary} />
                <Text style={styles.quickActionText}>
                  {dailyPlan ? 'Edit Plan' : 'Create Today\'s Plan'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => {
                  setCreateGoalPeriod('DAILY');
                  setShowCreateGoalModal(true);
                }}
              >
                <Ionicons name="flag-outline" size={16} color="#0284C7" />
                <Text style={styles.quickActionText}>Add Goal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => setShowHistoryModal(true)}
              >
                <Ionicons name="time-outline" size={16} color="#D97706" />
                <Text style={styles.quickActionText}>History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickActionBtn}
                onPress={() => setShowPreferencesModal(true)}
              >
                <Ionicons name="options-outline" size={16} color="#475569" />
                <Text style={styles.quickActionText}>Prefs</Text>
              </TouchableOpacity>
            </View>

            {/* Today's Topics List */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>TODAY'S MISSIONS</Text>
              {remainingTopics > 0 && (
                <Text style={styles.sectionSubBadge}>{remainingTopics} remaining</Text>
              )}
            </View>

            {(!dailyPlan || (dailyPlan.items || []).length === 0) && !dailyPlan?.isRestDay ? (
              <View style={styles.emptyCard}>
                <Ionicons name="compass-outline" size={48} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No study plan for today.</Text>
                <Text style={styles.emptySub}>
                  Set your daily duration and let the planner pick the best lessons.
                </Text>
                <TouchableOpacity
                  style={styles.createTodayBtn}
                  onPress={() => setShowCreatePlanModal(true)}
                >
                  <Ionicons name="sparkles" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.createTodayBtnText}>Create Today's Plan</Text>
                </TouchableOpacity>
              </View>
            ) : (
              (dailyPlan?.items || []).map((item) => {
                const isCompleted = item.status === 'COMPLETED';
                return (
                  <View key={item.id} style={[styles.missionCard, isCompleted && styles.missionCardCompleted]}>
                    <View style={styles.missionHeader}>
                      <View style={styles.courseTagBadge}>
                        <Text style={styles.courseTagText}>{item.courseName}</Text>
                      </View>
                      <View style={styles.timeEstimateTag}>
                        <Ionicons name="time-outline" size={12} color="#64748B" style={{ marginRight: 3 }} />
                        <Text style={styles.timeEstimateText}>{item.plannedMinutes} min</Text>
                      </View>
                    </View>

                    {item.moduleTitle ? (
                      <Text style={styles.missionModuleText}>{item.moduleTitle}</Text>
                    ) : null}
                    <Text style={[styles.missionTopicText, isCompleted && styles.missionTopicDone]}>
                      {item.topicTitle}
                    </Text>

                    {/* Actions */}
                    <View style={styles.missionActionsRow}>
                      {isCompleted ? (
                        <View style={styles.completedBadge}>
                          <Ionicons name="checkmark-circle" size={15} color="#10B981" />
                          <Text style={styles.completedBadgeText}>Completed ✓</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.startBtn}
                          onPress={() => handleStartStudy(item)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="play" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.startBtnText}>Start Study</Text>
                        </TouchableOpacity>
                      )}

                      {!isCompleted && (
                        <TouchableOpacity
                          style={styles.checkDoneBtn}
                          onPress={() => handleMarkItemDone(item)}
                        >
                          <Ionicons name="checkmark-outline" size={16} color="#16A34A" />
                        </TouchableOpacity>
                      )}

                      <TouchableOpacity
                        style={styles.rescheduleIconBtn}
                        onPress={() => handleOpenReschedule(item)}
                      >
                        <Ionicons name="arrow-redo-outline" size={16} color="#64748B" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WEEKLY STUDY PLAN */}
        {/* ========================================================================= */}
        {activeTab === 'WEEK' && (
          <>
            <View style={styles.weekOverviewCard}>
              <View style={styles.weekOverviewHeader}>
                <View>
                  <Text style={styles.weekTitle}>Weekly Voyage Plan</Text>
                  <Text style={styles.weekSubtitle}>Daily distribution & target pacing</Text>
                </View>
                <TouchableOpacity
                  style={styles.addWeeklyGoalBtn}
                  onPress={() => {
                    setCreateGoalPeriod('WEEKLY');
                    setShowCreateGoalModal(true);
                  }}
                >
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Text style={styles.addWeeklyGoalBtnText}>Add Goal</Text>
                </TouchableOpacity>
              </View>

              {/* Day-by-Day Cards */}
              {weeklyDays.map((day) => (
                <View key={day.dateStr} style={styles.dayRowCard}>
                  <View style={styles.dayRowLeft}>
                    <Text style={styles.dayRowName}>{day.dayName.toUpperCase()}</Text>
                    <Text style={styles.dayRowDate}>{day.dateStr.slice(5)}</Text>
                  </View>

                  <View style={styles.dayRowCenter}>
                    {day.isRestDay ? (
                      <Text style={styles.restDayDayText}>🏖️ Rest Day</Text>
                    ) : (
                      <>
                        <View style={styles.dayBarBg}>
                          <View
                            style={[
                              styles.dayBarFill,
                              { width: `${day.progressPercentage}%` },
                              day.progressPercentage >= 100 && { backgroundColor: '#10B981' },
                            ]}
                          />
                        </View>
                        <Text style={styles.dayProgressText}>
                          {Math.round(day.completedMinutes / 60)}h {day.completedMinutes % 60}m / {Math.round(day.plannedMinutes / 60)}h ({day.completedTopics}/{day.plannedTopics} topics)
                        </Text>
                      </>
                    )}
                  </View>

                  <View style={styles.dayRowRight}>
                    <Text
                      style={[
                        styles.dayRowPct,
                        day.progressPercentage >= 100 && { color: '#10B981' },
                      ]}
                    >
                      {day.isRestDay ? 'REST' : `${day.progressPercentage}%`}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Weekly Goals Section */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>ACTIVE WEEKLY GOALS</Text>
            </View>

            {goals.filter((g) => g.period === 'WEEKLY').length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="flag-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Create your weekly goal.</Text>
                <Text style={styles.emptySub}>
                  Set a 10h study target or select specific topics to accomplish.
                </Text>
                <TouchableOpacity
                  style={styles.createTodayBtn}
                  onPress={() => {
                    setCreateGoalPeriod('WEEKLY');
                    setShowCreateGoalModal(true);
                  }}
                >
                  <Text style={styles.createTodayBtnText}>Add Weekly Goal</Text>
                </TouchableOpacity>
              </View>
            ) : (
              goals
                .filter((g) => g.period === 'WEEKLY')
                .map((g) => (
                  <View key={g.id} style={styles.goalCard}>
                    <View style={styles.goalTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.goalTitle}>{g.title}</Text>
                        {g.description ? <Text style={styles.goalDesc}>{g.description}</Text> : null}
                      </View>
                      <View
                        style={[
                          styles.goalStatusBadge,
                          g.status === 'COMPLETED' && { backgroundColor: '#DCFCE7' },
                          g.status === 'MISSED' && { backgroundColor: '#FEE2E2' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.goalStatusText,
                            g.status === 'COMPLETED' && { color: '#15803D' },
                            g.status === 'MISSED' && { color: '#DC2626' },
                          ]}
                        >
                          {g.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.goalProgressBg}>
                      <View
                        style={[
                          styles.goalProgressFill,
                          {
                            width: `${Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.goalProgressText}>
                      {g.currentValue} / {g.targetValue} {g.unit} ({Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))}%)
                    </Text>
                  </View>
                ))
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: MONTHLY ROADMAP & GOALS */}
        {/* ========================================================================= */}
        {activeTab === 'MONTH' && (
          <>
            {monthlySummary && (
              <View style={styles.monthSummaryCard}>
                <View style={styles.monthHeaderRow}>
                  <View>
                    <Text style={styles.monthHeaderTitle}>
                      {monthlySummary.monthName.toUpperCase()} {monthlySummary.year}
                    </Text>
                    <Text style={styles.monthHeaderSub}>Monthly Voyage Roadmap</Text>
                  </View>
                  <View style={styles.monthPctBadge}>
                    <Text style={styles.monthPctText}>{monthlySummary.progressPercentage}%</Text>
                  </View>
                </View>

                {/* 4-Stat Box */}
                <View style={styles.monthStatsRow}>
                  <View style={styles.monthStatCol}>
                    <Text style={styles.monthStatVal}>
                      {Math.round(monthlySummary.completedMinutes / 60)}h
                    </Text>
                    <Text style={styles.monthStatLbl}>COMPLETED</Text>
                  </View>
                  <View style={styles.monthStatCol}>
                    <Text style={styles.monthStatVal}>
                      {Math.round(monthlySummary.plannedMinutes / 60)}h
                    </Text>
                    <Text style={styles.monthStatLbl}>GOAL</Text>
                  </View>
                  <View style={styles.monthStatCol}>
                    <Text style={styles.monthStatVal}>{monthlySummary.completedTopics}</Text>
                    <Text style={styles.monthStatLbl}>TOPICS</Text>
                  </View>
                  <View style={styles.monthStatCol}>
                    <Text style={styles.monthStatVal}>{monthlySummary.coursesWorkedOnCount}</Text>
                    <Text style={styles.monthStatLbl}>COURSES</Text>
                  </View>
                </View>

                {/* Visual Roadmap Weeks */}
                <Text style={styles.visualRoadmapTitle}>PROGRESS BY WEEK</Text>
                {monthlyWeeks.map((w) => (
                  <View key={w.weekLabel} style={styles.weekProgressRow}>
                    <Text style={styles.weekProgressLabel}>{w.weekLabel}</Text>
                    <View style={styles.weekProgressTrack}>
                      <View
                        style={[
                          styles.weekProgressFill,
                          { width: `${w.progressPercentage}%` },
                          w.progressPercentage >= 100 && { backgroundColor: '#10B981' },
                        ]}
                      />
                    </View>
                    <Text style={styles.weekProgressPct}>{w.progressPercentage}%</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Monthly Goals */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>MONTHLY GOALS</Text>
              <TouchableOpacity
                onPress={() => {
                  setCreateGoalPeriod('MONTHLY');
                  setShowCreateGoalModal(true);
                }}
              >
                <Text style={styles.addGoalLink}>+ Add Monthly Goal</Text>
              </TouchableOpacity>
            </View>

            {goals.filter((g) => g.period === 'MONTHLY').length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="flag-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>Create your monthly goal.</Text>
                <Text style={styles.emptySub}>
                  Study 40 hours, complete 100 topics, or master entire modules.
                </Text>
                <TouchableOpacity
                  style={styles.createTodayBtn}
                  onPress={() => {
                    setCreateGoalPeriod('MONTHLY');
                    setShowCreateGoalModal(true);
                  }}
                >
                  <Text style={styles.createTodayBtnText}>Add Monthly Goal</Text>
                </TouchableOpacity>
              </View>
            ) : (
              goals
                .filter((g) => g.period === 'MONTHLY')
                .map((g) => (
                  <View key={g.id} style={styles.goalCard}>
                    <View style={styles.goalTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.goalTitle}>{g.title}</Text>
                        {g.description ? <Text style={styles.goalDesc}>{g.description}</Text> : null}
                      </View>
                      <View
                        style={[
                          styles.goalStatusBadge,
                          g.status === 'COMPLETED' && { backgroundColor: '#DCFCE7' },
                          g.status === 'MISSED' && { backgroundColor: '#FEE2E2' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.goalStatusText,
                            g.status === 'COMPLETED' && { color: '#15803D' },
                            g.status === 'MISSED' && { color: '#DC2626' },
                          ]}
                        >
                          {g.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.goalProgressBg}>
                      <View
                        style={[
                          styles.goalProgressFill,
                          {
                            width: `${Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.goalProgressText}>
                      {g.currentValue} / {g.targetValue} {g.unit} ({Math.min(100, Math.round((g.currentValue / g.targetValue) * 100))}%)
                    </Text>
                  </View>
                ))
            )}
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <CreateDailyPlanModal
        visible={showCreatePlanModal}
        onClose={() => setShowCreatePlanModal(false)}
        onPlanCreated={loadData}
      />

      <CreateGoalModal
        visible={showCreateGoalModal}
        defaultPeriod={createGoalPeriod}
        onClose={() => setShowCreateGoalModal(false)}
        onGoalCreated={loadData}
      />

      <StudySessionTimerModal
        visible={showTimerModal}
        item={activeTimerItem}
        onClose={() => setShowTimerModal(false)}
        onSessionEnded={loadData}
        onOpenTopicContent={(item) => {
          navigate('ModuleDetails', { courseId: item.courseId, moduleId: item.moduleId });
        }}
      />

      <StudyHistoryModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      <StudyCalendarModal
        visible={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onSelectDate={async (dateStr) => {
          const plan = await studyPlanRepository.getDailyPlan(dateStr);
          if (plan) {
            setDailyPlan(plan);
            setActiveTab('TODAY');
          }
        }}
      />

      <StudyPreferencesModal
        visible={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onSaved={loadData}
      />

      <RescheduleTopicModal
        visible={showRescheduleModal}
        item={rescheduleItem}
        onClose={() => setShowRescheduleModal(false)}
        onRescheduled={loadData}
      />
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  screenHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  screenSubheading: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  topIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#EFF6FF',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: Colors.primary,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  widgetsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  widgetCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  widgetLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  widgetVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  widgetSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '600',
  },
  todayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  todayTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayDateText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  todayGoalText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressStatText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  celebrationTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  celebrationSub: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 2,
  },
  restDayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 14,
  },
  restDayBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7E22CE',
  },
  restDayBannerSub: {
    fontSize: 11,
    color: '#9333EA',
    marginTop: 2,
    lineHeight: 16,
  },
  changePlanBtn: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  changePlanBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7E22CE',
  },
  unfinishedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 14,
  },
  unfinishedTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2410C',
  },
  unfinishedSub: {
    fontSize: 11,
    color: '#EA580C',
    marginTop: 1,
  },
  continueBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  sectionSubBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    lineHeight: 18,
  },
  createTodayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  createTodayBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  missionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  missionCardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    opacity: 0.85,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  courseTagBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  courseTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  timeEstimateTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeEstimateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  missionModuleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  missionTopicText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
    marginBottom: 10,
  },
  missionTopicDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  missionActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  startBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  checkDoneBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduleIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedBadge: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  completedBadgeText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
  },
  weekOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  weekOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  weekSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  addWeeklyGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 2,
  },
  addWeeklyGoalBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  dayRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dayRowLeft: {
    width: 60,
  },
  dayRowName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayRowDate: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  dayRowCenter: {
    flex: 1,
    paddingHorizontal: 8,
  },
  dayBarBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  dayBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  dayProgressText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  restDayDayText: {
    fontSize: 11,
    color: '#9333EA',
    fontWeight: '700',
  },
  dayRowRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  dayRowPct: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  goalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  goalDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  goalStatusBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 8,
  },
  goalStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  goalProgressBg: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  goalProgressText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
  },
  monthSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  monthHeaderTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  monthHeaderSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  monthPctBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  monthPctText: {
    fontSize: 14,
    fontWeight: '900',
    color: Colors.primary,
  },
  monthStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  monthStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  monthStatVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  monthStatLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  visualRoadmapTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  weekProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weekProgressLabel: {
    width: 60,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  weekProgressTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  weekProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  weekProgressPct: {
    width: 36,
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'right',
  },
  addGoalLink: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
});
