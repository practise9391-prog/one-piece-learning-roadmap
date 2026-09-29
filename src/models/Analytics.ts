export type CourseAnalyticsStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
export type ModuleAnalyticsStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';

export type DateRangeFilter =
  | 'today'
  | '7days'
  | '30days'
  | '3months'
  | '6months'
  | '1year'
  | 'all';

export interface OverallProgressMetrics {
  totalCourses: number;
  coursesStarted: number;
  coursesCompleted: number;
  totalModules: number;
  completedModules: number;
  remainingModules: number;
  totalTopics: number;
  completedTopics: number;
  remainingTopics: number;
  completionPercentage: number;
}

export interface CourseProgressSummary {
  courseId: string;
  courseName: string;
  icon: string;
  theme: string;
  status: CourseAnalyticsStatus;
  totalModules: number;
  completedModules: number;
  totalTopics: number;
  completedTopics: number;
  remainingTopics: number;
  progressPercentage: number;
  studyMinutes: number;
  currentModuleName?: string;
  firstStartedDate?: string | null;
  lastStudiedDate?: string | null;
  completedDate?: string | null;
  sessionsCount: number;
}

export interface ModuleProgressDetail {
  moduleId: string;
  courseId: string;
  title: string;
  description?: string;
  orderIndex: number;
  status: ModuleAnalyticsStatus;
  totalTopics: number;
  completedTopics: number;
  progressPercentage: number;
  isCompleted: boolean;
  completedAt?: string | null;
  topics: TopicProgressDetail[];
}

export interface TopicProgressDetail {
  topicId: string;
  moduleId: string;
  courseId: string;
  courseName?: string;
  moduleTitle?: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string | null;
  lastStudiedDate?: string | null;
  studyMinutes: number;
  isLocked: boolean;
  orderIndex: number;
  hasPracticeQuestions: boolean;
}

export interface CourseDetailAnalytics {
  course: CourseProgressSummary;
  modules: ModuleProgressDetail[];
  streakDays: number;
  recentActivity: Array<{
    id: string;
    type: string;
    date: string;
    details: string;
  }>;
}

export interface CompletedItem {
  id: string;
  type: 'COURSE' | 'MODULE' | 'TOPIC';
  title: string;
  courseId: string;
  courseName: string;
  moduleId?: string;
  moduleTitle?: string;
  completedAt: string;
}

export interface RemainingItem {
  topicId: string;
  topicTitle: string;
  moduleId: string;
  moduleTitle: string;
  courseId: string;
  courseName: string;
  orderIndex: number;
  isLocked: boolean;
}

export interface DailyProgressMetrics {
  date: string;
  plannedMinutes: number;
  completedMinutes: number;
  progressPercentage: number;
  topicsPlanned: number;
  topicsCompleted: number;
  sessionsCount: number;
  dailyGoalsCompleted: number;
  dailyGoalsTotal: number;
  practiceQuestionsToday: number;
  notesCreatedToday: number;
  speakingSessionsToday: number;
}

export interface WeeklyProgressMetrics {
  weekStart: string;
  weekEnd: string;
  totalStudyMinutes: number;
  averageDailyMinutes: number;
  topicsCompleted: number;
  modulesCompleted: number;
  coursesStudied: number;
  practiceQuestions: number;
  speakingSessions: number;
  goalsCompleted: number;
  goalsMissed: number;
  currentStreak: number;
  dailyBreakdown: Array<{
    dayName: string;
    date: string;
    minutes: number;
  }>;
}

export interface MonthlyProgressMetrics {
  month: number;
  year: number;
  monthName: string;
  totalStudyMinutes: number;
  averageDailyMinutes: number;
  topicsCompleted: number;
  modulesCompleted: number;
  coursesStudied: number;
  goalsCompleted: number;
  practiceCompleted: number;
  mostStudiedCourse?: string;
  mostActiveDay?: string;
  currentStreak: number;
  longestStreak: number;
  weeklyProgress: Array<{
    weekLabel: string;
    minutes: number;
  }>;
}

export interface StudyTimeBreakdown {
  todayMinutes: number;
  thisWeekMinutes: number;
  thisMonthMinutes: number;
  allTimeMinutes: number;
  byCourse: Array<{
    courseId: string;
    courseName: string;
    minutes: number;
    percentage: number;
  }>;
  byDayLast7Days: Array<{
    date: string;
    dayName: string;
    minutes: number;
  }>;
}

export interface ActivityTimelineItem {
  id: string;
  activityType: string;
  title: string;
  subtitle: string;
  courseId?: string;
  courseName?: string;
  activityDate: string;
  createdAt: string;
  icon: string;
  color: string;
}

export interface StreakAnalyticsData {
  currentStreak: number;
  longestStreak: number;
  totalLearningDays: number;
  activeDaysLast7: Array<{
    dayName: string;
    date: string;
    isActive: boolean;
  }>;
  activeDatesSet: string[];
}

export interface GoalAnalyticsMetrics {
  completed: number;
  inProgress: number;
  missed: number;
  cancelled: number;
  total: number;
  completionPercentage: number;
  byPeriod: {
    daily: { completed: number; total: number };
    weekly: { completed: number; total: number };
    monthly: { completed: number; total: number };
  };
  history: Array<{
    id: string;
    title: string;
    period: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    status: string;
    completionPercentage: number;
  }>;
}

export interface TopicPerformance {
  topicId: string;
  topicTitle: string;
  courseName: string;
  accuracy: number;
  attempts: number;
  correct: number;
  recommendedAction?: string;
}

export interface DomainProgressMetrics {
  domain: 'aptitude' | 'reasoning' | 'verbal_english' | 'english_speaking';
  title: string;
  topicsCompleted: number;
  topicsTotal: number;
  completionPercentage: number;
  questionsAttempted: number;
  questionsCorrect: number;
  accuracyPercentage: number;
  difficultyBreakdown: {
    easy: { attempted: number; correct: number; accuracy: number };
    medium: { attempted: number; correct: number; accuracy: number };
    hard: { attempted: number; correct: number; accuracy: number };
  };
  weakTopics: TopicPerformance[];
  strongTopics: TopicPerformance[];
  speakingSessionsCount?: number;
  speakingScenariosCount?: number;
  speakingMinutes?: number;
}

export interface PracticeAnalyticsMetrics {
  attempted: number;
  correct: number;
  incorrect: number;
  accuracyPercentage: number;
  byCourse: Array<{
    courseId: string;
    courseName: string;
    attempted: number;
    correct: number;
    accuracy: number;
  }>;
  byDifficulty: {
    easy: { attempted: number; correct: number; accuracy: number };
    medium: { attempted: number; correct: number; accuracy: number };
    hard: { attempted: number; correct: number; accuracy: number };
  };
  byType: Array<{
    type: string;
    attempted: number;
    correct: number;
    accuracy: number;
  }>;
  weakTopics: TopicPerformance[];
  strongTopics: TopicPerformance[];
}

export interface CourseComparisonItem {
  courseId: string;
  courseName: string;
  icon: string;
  progressPercentage: number;
  studyMinutes: number;
  completedTopics: number;
  totalTopics: number;
}

export interface ProgressTrendsData {
  completionTrend: Array<{ date: string; cumulativeCompleted: number }>;
  studyTimeTrend: Array<{ date: string; minutes: number }>;
  accuracyTrend: Array<{ date: string; accuracy: number; attempts: number }>;
}

export interface ProgressSnapshot {
  id: string;
  snapshotDate: string;
  courseId?: string | null;
  totalTopics: number;
  completedTopics: number;
  completionPercentage: number;
  studyMinutes: number;
  practiceAttempts: number;
  practiceCorrect: number;
  createdAt: string;
}
