export type ProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface UserProgress {
  id: string;
  course_id: string;
  module_id: string;
  status: ProgressStatus;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserProgressRow {
  id: string;
  course_id: string;
  module_id: string;
  status: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export function progressFromRow(row: UserProgressRow): UserProgress {
  return {
    id: row.id,
    course_id: row.course_id,
    module_id: row.module_id,
    status: (row.status as ProgressStatus) || 'not_started',
    completed_at: row.completed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

