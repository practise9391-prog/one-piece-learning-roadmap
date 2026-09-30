export interface CareerPillarProgress {
  id: string;
  name: string;
  weight: number; // Percentage contribution (e.g., 30 for 30%)
  completedUnits: number;
  totalUnits: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface CareerStage {
  stageNumber: number;
  title: string;
  subtitle: string;
  description: string;
  targetRole: string;
  requiredSkills: string[];
  courseIds: string[];
  isUnlocked: boolean;
  isCurrent: boolean;
  isCompleted: boolean;
  completionPercentage: number;
}

export interface TodayMissionTask {
  id: string;
  title: string;
  category: 'DSA' | 'SYSTEM_DESIGN' | 'FRONTEND' | 'BACKEND' | 'REVISION' | 'QUIZ';
  targetScreen: 'InteractiveTopic' | 'CodingProblem' | 'CodeWorkspace' | 'CourseRoadmap' | 'PracticeCategory';
  params: Record<string, any>;
  estimatedMinutes: number;
  xpReward: number;
  isCompleted: boolean;
}

export interface CareerGoalSummary {
  targetRole: string;
  targetCompensation: string;
  targetDaysRemaining: number;
  overallReadinessPercentage: number;
  currentStageNumber: number;
  totalStages: number;
  pillars: CareerPillarProgress[];
  stages: CareerStage[];
  todayMissions: TodayMissionTask[];
  streakDays: number;
  totalXp: number;
  solvedProblemsCount: number;
  completedTopicsCount: number;
}

