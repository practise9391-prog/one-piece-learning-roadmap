import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { Colors } from '../../theme/colors';
import {
  DailyLearningPlan,
  DailyLearningTask,
  DailySummaryData,
  RevisionSchedule,
  TaskCategory,
} from '../../models/DailyLearning';
import { dailyLearningRepository } from '../../repositories/DailyLearningRepository';
import { getLocalDateString } from '../../repositories/ActivityRepository';
import { DailyLessonRunnerModal } from '../../components/daily/DailyLessonRunnerModal';
import { DailyCalendarModal } from '../../components/daily/DailyCalendarModal';
import { DailyPlanSettingsModal } from '../../components/daily/DailyPlanSettingsModal';
import { MissedTasksBanner } from '../../components/daily/MissedTasksBanner';
import { useAppNavigation } from '../../navigation/NavigationContext';

export const DailyLearningScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [plan, setPlan] = useState<DailyLearningPlan | null>(null);
  const [missedTasks, setMissedTasks] = useState<DailyLearningTask[]>([]);
  const [dueRevisions, setDueRevisions] = useState<RevisionSchedule[]>([]);
  const [todaySummary, setTodaySummary] = useState<DailySummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals state
  const [activeTaskForModal, setActiveTaskForModal] = useState<DailyLearningTask | null>(null);
  const [calendarModalVisible, setCalendarModalVisible] = useState<boolean>(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState<boolean>(false);

  const loadData = useCallback(async (dateStr: string = selectedDate) => {
    try {
      const todayStr = getLocalDateString();
      const loadedPlan = await dailyLearningRepository.getOrCreateTodayPlan(dateStr);
      setPlan(loadedPlan);

      // Check missed tasks from yesterday only if viewing today
      if (dateStr === todayStr) {
        const missed = await dailyLearningRepository.getIncompleteTasksFromYesterday(todayStr);
        setMissedTasks(missed);
      } else {
        setMissedTasks([]);
      }

      // Check due revisions
      const revs = await dailyLearningRepository.getDueRevisions(dateStr);
      setDueRevisions(revs);

      // Check today's summary
      const summary = await dailyLearningRepository.getTodaySummary(dateStr);
      setTodaySummary(summary);
    } catch (err) {
      console.error('Failed to load daily learning data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadData(selectedDate);
  }, [selectedDate, loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData(selectedDate);
  };

  const handleRegeneratePlan = () => {
    Alert.alert(
      'Regenerate Plan',
      'Do you want to re-distribute your daily plan based on your current settings? Any pending tasks will be updated.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const freshPlan = await dailyLearningRepository.generatePlanForDate(selectedDate, true);
            setPlan(freshPlan);
            setLoading(false);
          },
        },
      ]
    );
  };

  const handleAddMissedTasks = async () => {
    const ids = missedTasks.map((t) => t.id);
    await dailyLearningRepository.addMissedTasksToToday(ids, selectedDate);
    setMissedTasks([]);
    loadData(selectedDate);
  };

  const handleDismissMissedTasks = async () => {
    const ids = missedTasks.map((t) => t.id);
    await dailyLearningRepository.dismissMissedTasks(ids);
    setMissedTasks([]);
  };

  const handleTaskCompleted = (updatedTask: DailyLearningTask) => {
    if (!plan) return;
    const updatedTasks = plan.tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    const completedCount = updatedTasks.filter((t) => t.status === 'COMPLETED').length;
    const completionPct = Math.round((completedCount / updatedTasks.length) * 100);

    setPlan({
      ...plan,
      completedMinutes: plan.completedMinutes + updatedTask.estimatedMinutes,
      completionPercentage: completionPct,
      status: completionPct === 100 ? 'COMPLETED' : 'IN_PROGRESS',
      tasks: updatedTasks,
    });

    loadData(selectedDate);
  };

  // Filter tasks
  const filteredTasks = (plan?.tasks || []).filter((t) => {
    if (selectedCategory === 'ALL') return true;
    return t.category === selectedCategory;
  });

  const categoriesList: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Tasks' },
    { id: 'MAIN_COURSE', label: 'Main Course' },
    { id: 'APTITUDE', label: 'Aptitude' },
    { id: 'REASONING', label: 'Reasoning' },
    { id: 'VERBAL_ENGLISH', label: 'English' },
    { id: 'SPEAKING', label: 'Speaking' },
    { id: 'CODING', label: 'Coding' },
    { id: 'REVISION', label: 'Revision' },
  ];

  const todayStr = getLocalDateString();
  const isToday = selectedDate === todayStr;

  return (
    <AppShell title="DAILY LEARNING">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP CONTROLS & GREETING */}
        <View style={styles.topControlRow}>
          <View>
            <Text style={styles.greetingText}>Daily Study Schedule 👋</Text>
            <Text style={styles.dateSubText}>
              {isToday ? "Today's Plan — " : 'Plan for — '}
              {selectedDate}
            </Text>
          </View>

          <View style={styles.topIconsRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setCalendarModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={20} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setSettingsModalVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={20} color="#0F172A" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleRegeneratePlan}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <View>
            {/* 1. HERO STUDY TARGET & PROGRESS CARD */}
            {plan && (
              <View style={styles.heroCard}>
                <View style={styles.heroTop}>
                  <View>
                    <Text style={styles.heroLabel}>TODAY'S TARGET</Text>
                    <Text style={styles.heroTimeMain}>
                      {Math.floor(plan.completedMinutes / 60)}h {plan.completedMinutes % 60}m
                      <Text style={styles.heroTimePlanned}>
                        {' '}/ {Math.floor(plan.plannedMinutes / 60)}h {plan.plannedMinutes % 60}m
                      </Text>
                    </Text>
                  </View>

                  <View style={styles.pillRow}>
                    <View style={styles.streakPill}>
                      <Ionicons name="flame" size={14} color="#D97706" style={{ marginRight: 4 }} />
                      <Text style={styles.streakText}>
                        {todaySummary?.streak || 1} Day Streak
                      </Text>
                    </View>
                  </View>
                </View>

                {/* PROGRESS TRACK */}
                <View style={styles.trackContainer}>
                  <View style={[styles.fillTrack, { width: `${Math.min(100, plan.completionPercentage)}%` }]} />
                </View>

                <View style={styles.heroBottomRow}>
                  <Text style={styles.heroPctText}>{plan.completionPercentage}% Completed</Text>
                  <Text style={styles.heroRemainingText}>
                    {Math.max(0, plan.plannedMinutes - plan.completedMinutes)}m remaining
                  </Text>
                </View>
              </View>
            )}

            {/* 2. MISSED TASKS FROM YESTERDAY BANNER */}
            {missedTasks.length > 0 && (
              <MissedTasksBanner
                tasks={missedTasks}
                onAddToToday={handleAddMissedTasks}
                onDismiss={handleDismissMissedTasks}
              />
            )}

            {/* 3. SPACED REVISION ALERT SECTION */}
            {dueRevisions.length > 0 && (
              <View style={styles.revisionNoticeCard}>
                <View style={styles.revHeaderRow}>
                  <Ionicons name="repeat" size={18} color="#D97706" />
                  <Text style={styles.revTitle}>Spaced Revision Due ({dueRevisions.length})</Text>
                </View>
                <Text style={styles.revSub}>
                  Topics ready for active recall to lock in long-term memory.
                </Text>
                {dueRevisions.slice(0, 2).map((rev, idx) => (
                  <View key={idx} style={styles.revItemRow}>
                    <View style={styles.revDot} />
                    <Text style={styles.revTopicTitle} numberOfLines={1}>
                      {rev.topicTitle} (Level {rev.revisionLevel})
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* 4. CATEGORY FILTER TABS */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContent}
            >
              {categoriesList.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.filterChip, isSelected && styles.filterChipActive]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* 5. TODAY'S TASKS LIST */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                SCHEDULED TASKS ({filteredTasks.length})
              </Text>
            </View>

            {filteredTasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-done-circle-outline" size={40} color="#10B981" />
                <Text style={styles.emptyTitle}>No Tasks In This Category</Text>
                <Text style={styles.emptySub}>All scheduled tasks in this category are completed or clear.</Text>
              </View>
            ) : (
              filteredTasks.map((t) => {
                const isCompleted = t.status === 'COMPLETED';

                return (
                  <View key={t.id} style={[styles.taskCard, isCompleted && styles.taskCardCompleted]}>
                    <View style={styles.taskCardTop}>
                      <View style={styles.taskBadgeRow}>
                        <View style={[styles.catBadge, { backgroundColor: getCategoryBg(t.category) }]}>
                          <Text style={[styles.catBadgeText, { color: getCategoryColor(t.category) }]}>
                            {t.category.replace('_', ' ')}
                          </Text>
                        </View>

                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityBg(t.priority) }]}>
                          <Text style={[styles.priorityText, { color: getPriorityColor(t.priority) }]}>
                            {t.priority}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.durationText}>{t.estimatedMinutes} min</Text>
                    </View>

                    <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>
                      {t.title}
                    </Text>

                    <View style={styles.taskCardBottom}>
                      <View style={styles.diffPill}>
                        <Text style={styles.diffPillText}>{t.difficulty}</Text>
                      </View>

                      {isCompleted ? (
                        <View style={styles.completedInfoRow}>
                          {t.accuracy !== undefined && (
                            <Text style={styles.scoreText}>{t.accuracy}% Acc</Text>
                          )}
                          <TouchableOpacity
                            style={styles.reviewBtn}
                            onPress={() => setActiveTaskForModal(t)}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginRight: 4 }} />
                            <Text style={styles.reviewBtnText}>Done</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.startBtn}
                          onPress={() => setActiveTaskForModal(t)}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="play" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                          <Text style={styles.startBtnText}>START LESSON</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })
            )}

            {/* 6. TODAY'S SUMMARY & SMART RECOMMENDATIONS */}
            {todaySummary && todaySummary.completedTasks > 0 && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryTopRow}>
                  <View style={styles.summaryCrest}>
                    <Ionicons name="trophy" size={24} color="#D97706" />
                  </View>
                  <View style={styles.summaryTextCol}>
                    <Text style={styles.summaryHeading}>Daily Session Highlights</Text>
                    <Text style={styles.summarySub}>
                      {todaySummary.completedTasks} / {todaySummary.totalTasks} tasks mastered today
                    </Text>
                  </View>
                  <View style={styles.xpBox}>
                    <Text style={styles.xpVal}>+{todaySummary.xpEarned}</Text>
                    <Text style={styles.xpLbl}>XP EARNED</Text>
                  </View>
                </View>

                {todaySummary.recommendations.length > 0 && (
                  <View style={styles.recContainer}>
                    <Text style={styles.recTitle}>Recommended for Tomorrow:</Text>
                    {todaySummary.recommendations.map((rec, rIdx) => (
                      <View key={rIdx} style={styles.recRow}>
                        <Text style={styles.recBullet}>•</Text>
                        <Text style={styles.recText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL 1: LESSON RUNNER */}
      {activeTaskForModal && (
        <DailyLessonRunnerModal
          visible={!!activeTaskForModal}
          task={activeTaskForModal}
          onClose={() => setActiveTaskForModal(null)}
          onTaskCompleted={handleTaskCompleted}
        />
      )}

      {/* MODAL 2: CALENDAR VIEW */}
      <DailyCalendarModal
        visible={calendarModalVisible}
        onClose={() => setCalendarModalVisible(false)}
        onSelectDate={(dateStr) => {
          setSelectedDate(dateStr);
          loadData(dateStr);
        }}
      />

      {/* MODAL 3: DAILY PREFERENCES SETTINGS */}
      <DailyPlanSettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        onSettingsSaved={() => loadData(selectedDate)}
      />
    </AppShell>
  );
};

function getCategoryBg(cat: TaskCategory): string {
  switch (cat) {
    case 'APTITUDE':
      return '#FFFBEB';
    case 'REASONING':
      return '#EEF2FF';
    case 'VERBAL_ENGLISH':
      return '#F0FDFA';
    case 'SPEAKING':
      return '#ECFDF5';
    case 'CODING':
      return '#FEF2F2';
    case 'REVISION':
      return '#FAF5FF';
    default:
      return '#EFF6FF';
  }
}

function getCategoryColor(cat: TaskCategory): string {
  switch (cat) {
    case 'APTITUDE':
      return '#D97706';
    case 'REASONING':
      return '#4F46E5';
    case 'VERBAL_ENGLISH':
      return '#0D9488';
    case 'SPEAKING':
      return '#059669';
    case 'CODING':
      return '#DC2626';
    case 'REVISION':
      return '#9333EA';
    default:
      return '#0284C7';
  }
}

function getPriorityBg(p: string): string {
  switch (p) {
    case 'HIGH':
      return '#FEE2E2';
    case 'LOW':
      return '#F1F5F9';
    default:
      return '#FEF3C7';
  }
}

function getPriorityColor(p: string): string {
  switch (p) {
    case 'HIGH':
      return '#B91C1C';
    case 'LOW':
      return '#475569';
    default:
      return '#B45309';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  dateSubText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  topIconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroTimeMain: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
  },
  heroTimePlanned: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  streakText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  trackContainer: {
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  fillTrack: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroPctText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primary,
  },
  heroRemainingText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  revisionNoticeCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 16,
  },
  revHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  revTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7E22CE',
    marginLeft: 6,
  },
  revSub: {
    fontSize: 11,
    color: '#9333EA',
    marginBottom: 8,
  },
  revItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  revDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#9333EA',
    marginRight: 6,
  },
  revTopicTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B21A8',
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterContent: {
    paddingRight: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskCardCompleted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.85,
  },
  taskCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  durationText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  taskTitleCompleted: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  taskCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diffPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  diffPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  completedInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    marginRight: 8,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  reviewBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryCrest: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  summarySub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  xpBox: {
    alignItems: 'flex-end',
  },
  xpVal: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.secondaryDark,
  },
  xpLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
  },
  recContainer: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
  },
  recTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 6,
  },
  recRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  recBullet: {
    fontWeight: '900',
    color: Colors.primary,
    marginRight: 6,
    fontSize: 14,
  },
  recText: {
    fontSize: 11,
    color: '#475569',
    flex: 1,
    lineHeight: 16,
  },
});
