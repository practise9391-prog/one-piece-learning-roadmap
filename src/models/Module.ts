export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order: number;
  icon?: string;
  is_completed: boolean;
  completed_at?: string | null;
  created_at?: string;
  topic_count?: number;
  completed_topic_count?: number;
  last_opened_topic_id?: string | null;
}

export interface ModuleRow {
  id: string;
  course_id: string;
  title: string;
  description: string;
  order_index: number;
  icon?: string | null;
  is_completed: number;
  completed_at: string | null;
  created_at: string;
  topic_count?: number;
  completed_topic_count?: number;
  last_opened_topic_id?: string | null;
}

export function moduleFromRow(row: ModuleRow): Module {
  return {
    id: row.id,
    course_id: row.course_id,
    title: row.title,
    description: row.description || '',
    order: row.order_index,
    icon: row.icon || 'book-outline',
    is_completed: row.is_completed === 1,
    completed_at: row.completed_at,
    created_at: row.created_at,
    topic_count: row.topic_count ?? 0,
    completed_topic_count: row.completed_topic_count ?? 0,
    last_opened_topic_id: row.last_opened_topic_id || null,
  };
}
