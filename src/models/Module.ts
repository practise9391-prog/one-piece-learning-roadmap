export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  is_completed: boolean;
  completed_at?: string | null;
  created_at?: string;
}

export interface ModuleRow {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  is_completed: number;
  completed_at: string | null;
  created_at: string;
}

export function moduleFromRow(row: ModuleRow): Module {
  return {
    id: row.id,
    course_id: row.course_id,
    title: row.title,
    description: row.description || '',
    order: row.order_index,
    is_completed: row.is_completed === 1,
    completed_at: row.completed_at,
    created_at: row.created_at,
  };
}

