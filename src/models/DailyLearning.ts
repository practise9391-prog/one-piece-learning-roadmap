export type DailyPlanStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED';

export type TaskCategory =
  | 'MAIN_COURSE'
  | 'APTITUDE'
  | 'REASONING'
  | 'VERBAL_ENGLISH'
  | 'SPEAKING'
  | 'CODING'
  | 'REVISION';

export type TaskPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type TaskLessonType =
  | 'LESSON'
  | 'PRACTICE'
  | 'QUIZ'
  | 'SPEAKING_DRILL'
  | 'CODING_CHALLENGE'
  | 'REVISION';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export type PreferredStudyTime = 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Custom';

export interface WorkedExample {
  question: string;
  stepByStep: string[];
  answer: string;
}

export interface DailyPracticeQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: TaskDifficulty;
}

export interface SpeakingTaskData {
  scenario: string;
  role: string;
  preparationSeconds: number;
  speakingSeconds: number;
  usefulVocab: string[];
  suggestedPhrases: string[];
  prompt: string;
}

export interface CodingChallengeData {
  problem: string;
  inputDescription: string;
  outputDescription: string;
  sampleInput: string;
  sampleOutput: string;
  hint: string;
  starterCode: string;
  solutionWalkthrough: string;
}

export interface StructuredDailyLesson {
  title: string;
  conceptSummary: string;
  understandingAnalogy: string;
  formulasAndRules: string[];
  workedExamples: WorkedExample[];
  practiceQuestions: DailyPracticeQuestion[];
  speakingTask?: SpeakingTaskData;
  codingChallenge?: CodingChallengeData;
}

export interface DailyLearningTask {
  id: string;
  dailyPlanId: string;
  courseId: string;
  courseName: string;
  category: TaskCategory;
  moduleId?: string;
  topicId?: string;
  title: string;
  lessonType: TaskLessonType;
  priority: TaskPriority;
  difficulty: TaskDifficulty;
  estimatedMinutes: number;
  status: TaskStatus;
  startedAt?: string;
  completedAt?: string;
  score?: number;
  totalQuestions?: number;
  accuracy?: number;
  xpEarned?: number;
  orderIndex: number;
  lessonData?: StructuredDailyLesson;
}

export interface DailyLearningPlan {
  id: string;
  date: string; // YYYY-MM-DD
  plannedMinutes: number;
  completedMinutes: number;
  status: DailyPlanStatus;
  completionPercentage: number;
  tasks: DailyLearningTask[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RevisionSchedule {
  id: string;
  courseId: string;
  moduleId?: string;
  topicId: string;
  topicTitle: string;
  lastStudiedAt: string;
  nextRevisionDate: string; // YYYY-MM-DD
  revisionLevel: number; // 1 to 5
  lastScore?: number;
  lastAccuracy?: number;
  intervalDays: number;
  status: 'PENDING' | 'REVISED' | 'OVERDUE';
  updatedAt: string;
}

export interface DailyLearningSettings {
  targetMinutes: number;
  aptitudeQuestions: number;
  reasoningQuestions: number;
  englishQuestions: number;
  speakingMinutes: number;
  codingTasks: number;
  preferredTime: PreferredStudyTime;
  customTimeWindow: string;
  activeCourses: string[];
}

export interface DailySummaryData {
  date: string;
  completedTasks: number;
  totalTasks: number;
  completedMinutes: number;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
  xpEarned: number;
  streak: number;
  recommendations: string[];
}

export interface CalendarDayStatus {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  hasPlan: boolean;
  status?: DailyPlanStatus;
  completedMinutes: number;
  plannedMinutes: number;
  taskCount: number;
  completedTaskCount: number;
}
