export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type QuestionType =
  | 'CODING'
  | 'MCQ'
  | 'SQL'
  | 'DEBUGGING'
  | 'CONCEPT'
  | 'OUTPUT_PREDICTION';

export interface PracticeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: string;
  order_index: number;
  is_active: boolean;
  total_questions?: number;
  completed_questions?: number;
  progress_percentage?: number;
}

export interface PracticeCategoryRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: string;
  order_index: number;
  is_active: number;
  total_questions?: number;
  completed_questions?: number;
}

export function practiceCategoryFromRow(row: PracticeCategoryRow): PracticeCategory {
  const total = row.total_questions || 0;
  const completed = row.completed_questions || 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    icon: row.icon || 'code-slash',
    theme: row.theme || 'default',
    order_index: row.order_index,
    is_active: row.is_active === 1,
    total_questions: total,
    completed_questions: completed,
    progress_percentage: pct,
  };
}

export interface PracticeQuestion {
  id: string;
  category_id: string;
  title: string;
  description: string;
  difficulty: QuestionDifficulty;
  question_type: QuestionType;
  content: string;
  solution: string;
  hint: string;
  example_input?: string | null;
  example_output?: string | null;
  options?: string[]; // Parsed from JSON
  correct_answer?: string | null;
  topic: string;
  source: string;
  external_url?: string | null;
  order_index: number;
  is_completed: boolean;
  completed_at?: string | null;
  is_bookmarked: boolean;
  user_draft?: string | null;
  created_at: string;
}

export interface PracticeQuestionRow {
  id: string;
  category_id: string;
  title: string;
  description: string;
  difficulty: string;
  question_type: string;
  content: string;
  solution: string;
  hint: string;
  example_input: string | null;
  example_output: string | null;
  options: string | null;
  correct_answer: string | null;
  topic: string;
  source: string;
  external_url: string | null;
  order_index: number;
  is_completed: number;
  completed_at: string | null;
  is_bookmarked: number;
  user_draft: string | null;
  created_at: string;
}

export function practiceQuestionFromRow(row: PracticeQuestionRow): PracticeQuestion {
  let parsedOptions: string[] | undefined;
  if (row.options) {
    try {
      parsedOptions = JSON.parse(row.options);
    } catch {
      parsedOptions = [];
    }
  }

  return {
    id: row.id,
    category_id: row.category_id,
    title: row.title,
    description: row.description,
    difficulty: row.difficulty as QuestionDifficulty,
    question_type: row.question_type as QuestionType,
    content: row.content || '',
    solution: row.solution || '',
    hint: row.hint || '',
    example_input: row.example_input,
    example_output: row.example_output,
    options: parsedOptions,
    correct_answer: row.correct_answer,
    topic: row.topic || 'General',
    source: row.source || 'Curated',
    external_url: row.external_url,
    order_index: row.order_index,
    is_completed: row.is_completed === 1,
    completed_at: row.completed_at,
    is_bookmarked: row.is_bookmarked === 1,
    user_draft: row.user_draft,
    created_at: row.created_at,
  };
}

export interface PracticeAttempt {
  id: string;
  question_id: string;
  category_id: string;
  user_answer?: string | null;
  is_correct: boolean;
  attempted_at: string;
}
