export type TaskType =
  | 'CODING'
  | 'MCQ'
  | 'SQL'
  | 'DEBUGGING'
  | 'OUTPUT_PREDICTION'
  | 'CONCEPT'
  | 'FILL_IN_THE_BLANK'
  | 'PRACTICAL'
  | 'PROJECT'
  | 'INTERVIEW';

export type TaskDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type TaskPracticeStatus = 'NOT_STARTED' | 'ATTEMPTED' | 'SOLVED' | 'MASTERED';

export type SubmissionStatus =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'
  | 'COMPILE_ERROR'
  | 'SYSTEM_ERROR';

export interface TaskApproach {
  name: string;
  type: 'BRUTE_FORCE' | 'BETTER' | 'OPTIMAL' | 'ALTERNATIVE';
  complexity_time: string;
  complexity_space: string;
  explanation: string;
  code: string;
  when_to_use?: string;
}

export interface TaskTestCase {
  id: string;
  task_id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  order_index: number;
  weight: number;
  timeout_ms: number;
  created_at: string;
}

export interface TaskTestCaseRow {
  id: string;
  task_id: string;
  input: string;
  expected_output: string;
  is_hidden: number;
  order_index: number;
  weight: number;
  timeout_ms: number;
  created_at: string;
}

export function taskTestCaseFromRow(row: TaskTestCaseRow): TaskTestCase {
  return {
    id: row.id,
    task_id: row.task_id,
    input: row.input,
    expected_output: row.expected_output,
    is_hidden: row.is_hidden === 1,
    order_index: row.order_index,
    weight: row.weight,
    timeout_ms: row.timeout_ms || 2000,
    created_at: row.created_at,
  };
}

export interface PracticeTask {
  id: string;
  course_id: string;
  module_id?: string | null;
  topic_id?: string | null;
  category_id: string;
  title: string;
  description: string;
  instructions?: string | null;
  task_type: TaskType;
  difficulty: TaskDifficulty;
  language: string;
  starter_code: string;
  solution: string;
  explanation: string;
  hints: string[];
  expected_output?: string | null;
  options?: string[];
  correct_answer?: string | null;
  approaches?: TaskApproach[];
  time_limit: number;
  memory_limit: number;
  points: number;
  xp: number;
  order_index: number;
  is_active: boolean;
  is_completed: boolean;
  completed_at?: string | null;
  is_bookmarked: boolean;
  status: TaskPracticeStatus;
  user_draft?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PracticeTaskRow {
  id: string;
  course_id: string;
  module_id: string | null;
  topic_id: string | null;
  category_id: string;
  title: string;
  description: string;
  instructions: string | null;
  task_type: string;
  difficulty: string;
  language: string;
  starter_code: string;
  solution: string;
  explanation: string;
  hints: string | null;
  expected_output: string | null;
  options: string | null;
  correct_answer: string | null;
  approaches: string | null;
  time_limit: number;
  memory_limit: number;
  points: number;
  xp: number;
  order_index: number;
  is_active: number;
  is_completed: number;
  completed_at: string | null;
  is_bookmarked: number;
  status: string;
  user_draft: string | null;
  created_at: string;
  updated_at: string;
}

export function practiceTaskFromRow(row: PracticeTaskRow): PracticeTask {
  let parsedHints: string[] = [];
  if (row.hints) {
    try {
      parsedHints = JSON.parse(row.hints);
    } catch {
      parsedHints = [row.hints];
    }
  }

  let parsedOptions: string[] | undefined;
  if (row.options) {
    try {
      parsedOptions = JSON.parse(row.options);
    } catch {
      parsedOptions = [];
    }
  }

  let parsedApproaches: TaskApproach[] | undefined;
  if (row.approaches) {
    try {
      parsedApproaches = JSON.parse(row.approaches);
    } catch {
      parsedApproaches = [];
    }
  }

  return {
    id: row.id,
    course_id: row.course_id,
    module_id: row.module_id,
    topic_id: row.topic_id,
    category_id: row.category_id,
    title: row.title,
    description: row.description,
    instructions: row.instructions,
    task_type: row.task_type as TaskType,
    difficulty: row.difficulty as TaskDifficulty,
    language: row.language || 'python',
    starter_code: row.starter_code || '',
    solution: row.solution || '',
    explanation: row.explanation || '',
    hints: parsedHints,
    expected_output: row.expected_output,
    options: parsedOptions,
    correct_answer: row.correct_answer,
    approaches: parsedApproaches,
    time_limit: row.time_limit || 2,
    memory_limit: row.memory_limit || 128,
    points: row.points || 10,
    xp: row.xp || 20,
    order_index: row.order_index,
    is_active: row.is_active === 1,
    is_completed: row.is_completed === 1,
    completed_at: row.completed_at,
    is_bookmarked: row.is_bookmarked === 1,
    status: (row.status as TaskPracticeStatus) || (row.is_completed === 1 ? 'SOLVED' : 'NOT_STARTED'),
    user_draft: row.user_draft,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export interface TaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  language: string;
  source_code: string;
  status: SubmissionStatus;
  passed_tests: number;
  total_tests: number;
  score: number;
  execution_time_ms: number;
  memory_used_kb: number;
  failed_test_index?: number | null;
  revealed_failed_test?: boolean;
  error_message?: string | null;
  submitted_at: string;
}

export interface TaskSubmissionRow {
  id: string;
  task_id: string;
  user_id: string;
  language: string;
  source_code: string;
  status: string;
  passed_tests: number;
  total_tests: number;
  score: number;
  execution_time_ms: number;
  memory_used_kb: number;
  failed_test_index: number | null;
  revealed_failed_test: number;
  error_message: string | null;
  submitted_at: string;
}

export function taskSubmissionFromRow(row: TaskSubmissionRow): TaskSubmission {
  return {
    id: row.id,
    task_id: row.task_id,
    user_id: row.user_id,
    language: row.language,
    source_code: row.source_code,
    status: row.status as SubmissionStatus,
    passed_tests: row.passed_tests,
    total_tests: row.total_tests,
    score: row.score,
    execution_time_ms: row.execution_time_ms,
    memory_used_kb: row.memory_used_kb,
    failed_test_index: row.failed_test_index,
    revealed_failed_test: row.revealed_failed_test === 1,
    error_message: row.error_message,
    submitted_at: row.submitted_at,
  };
}

export interface ExecutionResult {
  status:
    | 'SUCCESS'
    | 'COMPILE_ERROR'
    | 'RUNTIME_ERROR'
    | 'TIME_LIMIT'
    | 'MEMORY_LIMIT'
    | 'SYSTEM_ERROR'
    | 'UNSUPPORTED_LANGUAGE';
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  memoryUsed: number;
  errorMessage?: string;
}

export interface TestRunResult {
  testCaseId: string;
  index: number;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  isHidden: boolean;
  executionTimeMs: number;
  errorMessage?: string;
}

export interface SubmissionEvaluationResult {
  submission: TaskSubmission;
  results: TestRunResult[];
  allPassed: boolean;
  rewardAwarded?: boolean;
  xpAwarded?: number;
  pointsAwarded?: number;
}
