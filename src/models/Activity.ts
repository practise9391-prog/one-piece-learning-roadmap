export type ActivityType =
  | 'MODULE_OPENED'
  | 'TOPIC_COMPLETED'
  | 'MODULE_COMPLETED'
  | 'NOTE_CREATED'
  | 'NOTE_UPDATED';

export interface LearningActivity {
  id: string;
  course_id: string;
  module_id?: string | null;
  topic_id?: string | null;
  activity_type: ActivityType;
  activity_date: string; // 'YYYY-MM-DD'
  created_at: string;
}

export interface LearningActivityRow {
  id: string;
  course_id: string;
  module_id: string | null;
  topic_id: string | null;
  activity_type: string;
  activity_date: string;
  created_at: string;
}

export function activityFromRow(row: LearningActivityRow): LearningActivity {
  return {
    id: row.id,
    course_id: row.course_id,
    module_id: row.module_id,
    topic_id: row.topic_id,
    activity_type: row.activity_type as ActivityType,
    activity_date: row.activity_date,
    created_at: row.created_at,
  };
}
