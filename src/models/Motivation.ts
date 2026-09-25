export type MotivationCategory =
  | 'GENERAL'
  | 'CODING'
  | 'DISCIPLINE'
  | 'CONSISTENCY'
  | 'EXAMS'
  | 'CAREER'
  | 'PROBLEM_SOLVING'
  | 'COURSE_COMPLETION'
  | 'PRACTICE';

export interface MotivationEntry {
  id: string;
  message: string;
  author: string;
  category: MotivationCategory;
  is_favorite: boolean;
  is_active: boolean;
  created_at: string;
}

export type GoalType =
  | 'COMPLETE_TOPIC'
  | 'COMPLETE_MODULE'
  | 'PRACTICE_QUESTIONS'
  | 'STUDY_SESSION'
  | 'WRITE_NOTE';

export interface DailyGoal {
  id: string;
  date: string; // YYYY-MM-DD
  goal_type: GoalType;
  title: string;
  target: number;
  current: number;
  is_completed: boolean;
  completed_at?: string | null;
  course_id?: string | null;
  module_id?: string | null;
  topic_id?: string | null;
  created_at: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  challenge_type: 'PRACTICE' | 'TOPIC' | 'REVIEW';
  target_id?: string | null;
  is_completed: boolean;
  completed_at?: string | null;
  created_at: string;
}

export type AchievementCategory =
  | 'STREAK'
  | 'TOPICS'
  | 'MODULES'
  | 'COURSES'
  | 'PRACTICE'
  | 'NOTES';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement_type: string;
  requirement_value: number;
  is_unlocked: boolean;
  unlocked_at?: string | null;
  created_at: string;
}

export interface StudySession {
  id: string;
  course_id?: string | null;
  module_id?: string | null;
  started_at: string;
  ended_at?: string | null;
  duration_seconds: number;
  created_at: string;
}

export interface DailySummary {
  topicsCompleted: number;
  modulesCompleted: number;
  practiceSolved: number;
  notesCreated: number;
  totalActions: number;
}

export interface DayGoalHistory {
  date: string;
  formattedDate: string;
  totalGoals: number;
  completedGoals: number;
  percentage: number;
}

export interface WeeklyLearningSummary {
  days: {
    dayLabel: string;
    date: string;
    hasActivity: boolean;
    activityCount: number;
  }[];
  activeDaysCount: number;
  weeklyTargetDays: number;
  totalGoalsCompleted: number;
  totalTopicsCompleted: number;
  totalModulesCompleted: number;
  totalPracticeSolved: number;
}
