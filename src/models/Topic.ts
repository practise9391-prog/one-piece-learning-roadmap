export interface Topic {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order: number;
  is_completed: boolean;
  completed_at?: string | null;
  created_at?: string;
}

export interface TopicRow {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
  is_completed: number;
  completed_at: string | null;
  created_at: string;
}

export function topicFromRow(row: TopicRow): Topic {
  return {
    id: row.id,
    module_id: row.module_id,
    title: row.title,
    description: row.description || '',
    order: row.order_index,
    is_completed: row.is_completed === 1,
    completed_at: row.completed_at,
    created_at: row.created_at,
  };
}
