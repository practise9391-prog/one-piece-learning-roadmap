export interface Course {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: string;
  order: number;
  total_modules: number;
  completed_modules: number;
  progress_percentage: number;
  is_completed: boolean;
  started_at?: string | null;
  completed_at?: string | null;
  introduction_completed?: boolean;
  welcome_title?: string | null;
  welcome_description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CourseRow {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: string;
  order_index: number;
  total_modules: number;
  completed_modules: number;
  progress_percentage: number;
  is_completed: number;
  started_at: string | null;
  completed_at: string | null;
  introduction_completed: number;
  welcome_title: string | null;
  welcome_description: string | null;
  created_at: string;
  updated_at: string;
}

export function courseFromRow(row: CourseRow): Course {
  return {
    id: row.id,
    name: row.name,
    description: row.description || '',
    icon: row.icon || 'book',
    theme: row.theme || 'default',
    order: row.order_index,
    total_modules: row.total_modules,
    completed_modules: row.completed_modules,
    progress_percentage: row.progress_percentage,
    is_completed: row.is_completed === 1,
    started_at: row.started_at || null,
    completed_at: row.completed_at || null,
    introduction_completed: row.introduction_completed === 1,
    welcome_title: row.welcome_title || null,
    welcome_description: row.welcome_description || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
