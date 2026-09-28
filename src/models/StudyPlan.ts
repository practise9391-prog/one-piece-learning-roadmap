export type PlanType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type PlanStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'MISSED'
  | 'CANCELLED'
  | 'PAUSED'
  | 'REST_DAY';

export type PlanItemStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'RESCHEDULED';

export type StudyGoalType =
  | 'TIME_GOAL'
  | 'TOPIC_GOAL'
  | 'MODULE_GOAL'
  | 'COURSE_GOAL'
  | 'SESSION_GOAL'
  | 'STREAK_GOAL';

export type GoalType = StudyGoalType;

export type GoalPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export type GoalStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'MISSED'
  | 'CANCELLED'
  | 'PAUSED';

export type TimerMode = 'COUNT_UP' | 'COUNT_DOWN' | 'POMODORO' | 'CUSTOM';

export interface StudyPlanItem {
  id: string;
  studyPlanId: string;
  courseId: string;
  courseName?: string;
  moduleId?: string;
  moduleTitle?: string;
  topicId: string;
  topicTitle?: string;
  plannedMinutes: number;
  actualMinutes: number;
  orderIndex: number;
  status: PlanItemStatus;
  startedAt?: string | null;
  completedAt?: string | null;
  rescheduledToDate?: string | null;
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  planType: PlanType;
  date?: string | null; // 'YYYY-MM-DD'
  weekStart?: string | null; // 'YYYY-MM-DD'
  weekEnd?: string | null; // 'YYYY-MM-DD'
  month?: number | null; // 1-12
  year?: number | null;
  plannedMinutes: number;
  completedMinutes: number;
  plannedTopics: number;
  completedTopics: number;
  isRestDay: boolean;
  status: PlanStatus;
  notes?: string | null;
  items?: StudyPlanItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyGoal {
  id: string;
  goalType: GoalType;
  period: GoalPeriod;
  title: string;
  description?: string | null;
  targetValue: number;
  currentValue: number;
  unit: string; // 'minutes', 'hours', 'topics', 'modules', 'courses', 'sessions', 'days'
  courseId?: string | null;
  moduleId?: string | null;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  status: GoalStatus;
  createdAt: string;
  completedAt?: string | null;
}

export interface StudyPreferences {
  dailyMinutes: number;
  weeklyMinutes: number;
  monthlyMinutes: number;
  preferredCourses: string[];
  preferredSessionMinutes: number;
  automaticPlanEnabled: boolean;
  carryForwardEnabled: boolean;
  restDays: string[];
}

export interface WeeklyPlanDay {
  dayName: string; // 'Monday', 'Tuesday', etc.
  dateStr: string; // 'YYYY-MM-DD'
  plannedMinutes: number;
  completedMinutes: number;
  plannedTopics: number;
  completedTopics: number;
  isRestDay: boolean;
  progressPercentage: number;
}

export interface MonthlyWeekSummary {
  weekNumber: number; // 1, 2, 3, 4, 5
  weekLabel: string; // 'WEEK 1', 'WEEK 2'
  startDate: string;
  endDate: string;
  plannedMinutes: number;
  completedMinutes: number;
  progressPercentage: number;
}

export interface StudySessionHistoryItem {
  id: string;
  courseId: string;
  courseName: string;
  moduleId?: string;
  moduleTitle?: string;
  topicId?: string;
  topicTitle?: string;
  durationMinutes: number;
  date: string;
  sessionType: TimerMode;
  status: 'completed' | 'in_progress' | 'cancelled';
  notes?: string;
}
