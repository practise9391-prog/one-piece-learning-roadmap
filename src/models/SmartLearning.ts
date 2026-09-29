/**
 * Part 22: Advanced AI Personalization, Adaptive Learning & Smart Study Engine
 * Data Models & Types
 */

export type MasteryLevel =
  | 'NOT_STARTED'
  | 'LEARNING'
  | 'DEVELOPING'
  | 'STRONG'
  | 'MASTERED';

export type RevisionPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RevisionStatus = 'DUE' | 'UPCOMING' | 'COMPLETED' | 'SKIPPED';

export type StudyPriorityLevel = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type AdaptiveDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type WeakTopicLabel = 'Needs Practice' | 'Needs Revision' | 'Developing';

export interface TopicMastery {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  topic_id: string;
  topic_title?: string;
  course_name?: string;
  module_title?: string;
  mastery_score: number; // 0 - 100
  mastery_level: MasteryLevel;
  accuracy_score: number; // 0 - 100
  completion_score: number; // 0 or 100
  consistency_score: number; // 0 - 100 based on attempt volume
  recency_score: number; // 0 - 100 based on days since study
  difficulty_score: number; // 0 - 100 based on max difficulty solved
  last_calculated_at: string;
}

export interface TopicMasteryRow {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  topic_id: string;
  mastery_score: number;
  mastery_level: string;
  accuracy_score: number;
  completion_score: number;
  consistency_score: number;
  recency_score: number;
  difficulty_score: number;
  last_calculated_at: string;
  topic_title?: string;
  course_name?: string;
  module_title?: string;
}

export function topicMasteryFromRow(row: TopicMasteryRow): TopicMastery {
  return {
    id: row.id,
    user_id: row.user_id,
    course_id: row.course_id,
    module_id: row.module_id,
    topic_id: row.topic_id,
    topic_title: row.topic_title,
    course_name: row.course_name,
    module_title: row.module_title,
    mastery_score: Number(row.mastery_score) || 0,
    mastery_level: (row.mastery_level as MasteryLevel) || 'NOT_STARTED',
    accuracy_score: Number(row.accuracy_score) || 0,
    completion_score: Number(row.completion_score) || 0,
    consistency_score: Number(row.consistency_score) || 0,
    recency_score: Number(row.recency_score) || 0,
    difficulty_score: Number(row.difficulty_score) || 0,
    last_calculated_at: row.last_calculated_at,
  };
}

export interface RevisionItem {
  id: string;
  user_id: string;
  topic_id: string;
  course_id: string;
  module_id?: string | null;
  topic_title?: string;
  course_name?: string;
  scheduled_date: string; // 'YYYY-MM-DD'
  priority: RevisionPriority;
  status: RevisionStatus;
  reason: string;
  last_revision_date?: string | null;
  next_revision_date?: string | null;
  repetition_count: number;
  interval_days: number;
  created_at: string;
  updated_at: string;
}

export interface RevisionItemRow {
  id: string;
  user_id: string;
  topic_id: string;
  course_id: string;
  module_id: string | null;
  scheduled_date: string;
  priority: string;
  status: string;
  reason: string;
  last_revision_date: string | null;
  next_revision_date: string | null;
  repetition_count: number;
  interval_days: number;
  created_at: string;
  updated_at: string;
  topic_title?: string;
  course_name?: string;
}

export function revisionItemFromRow(row: RevisionItemRow): RevisionItem {
  return {
    id: row.id,
    user_id: row.user_id,
    topic_id: row.topic_id,
    course_id: row.course_id,
    module_id: row.module_id,
    topic_title: row.topic_title,
    course_name: row.course_name,
    scheduled_date: row.scheduled_date,
    priority: (row.priority as RevisionPriority) || 'MEDIUM',
    status: (row.status as RevisionStatus) || 'UPCOMING',
    reason: row.reason,
    last_revision_date: row.last_revision_date,
    next_revision_date: row.next_revision_date,
    repetition_count: row.repetition_count || 0,
    interval_days: row.interval_days || 1,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export interface StudyPriority {
  id: string;
  topic_id: string;
  course_id: string;
  topic_title?: string;
  course_name?: string;
  module_title?: string;
  priority_score: number; // 0 - 100
  priority_level: StudyPriorityLevel;
  reasons: string[];
  calculated_at: string;
}

export interface SmartRecommendation {
  id: string;
  course_id: string;
  course_name: string;
  module_id: string;
  module_title: string;
  topic_id: string;
  topic_title: string;
  difficulty: AdaptiveDifficulty;
  estimated_minutes: number;
  primary_reason: string;
  detailed_reasons: string[];
  mastery_level: MasteryLevel;
  is_weak_topic: boolean;
  is_revision_due: boolean;
}

export interface WeakTopicItem {
  topic_id: string;
  topic_title: string;
  course_id: string;
  course_name: string;
  module_title: string;
  accuracy: number;
  failed_attempts: number;
  total_attempts: number;
  label: WeakTopicLabel;
  reason: string;
}

export interface LearningInsights {
  strong_areas: Array<{
    topic_id: string;
    title: string;
    course: string;
    accuracy: number;
  }>;
  developing_areas: Array<{
    topic_id: string;
    title: string;
    course: string;
    accuracy: number;
  }>;
  revision_required: Array<{
    topic_id: string;
    title: string;
    course: string;
    days_ago: number;
  }>;
  patterns: {
    most_studied_course: string;
    average_accuracy: number;
    avg_session_duration_mins: number;
    most_practiced_difficulty: string;
    most_active_day: string;
    completed_topics_this_week: number;
    total_practice_attempts: number;
  };
}

export interface AdaptivePlanItem {
  id: string;
  type: 'REVISION' | 'NEW_TOPIC' | 'PRACTICE' | 'WEAK_TOPIC';
  allocated_minutes: number;
  topic_id: string;
  topic_title: string;
  course_id: string;
  course_name: string;
  difficulty?: AdaptiveDifficulty;
  reason: string;
  completed?: boolean;
}

export interface AdaptiveDailyPlan {
  target_minutes: number;
  items: AdaptivePlanItem[];
  conflict_with_manual_plan?: boolean;
  conflict_message?: string;
}

export interface InterviewReadinessDomain {
  category: string;
  total_topics: number;
  completed_topics: number;
  readiness_percentage: number;
  practice_accuracy: number;
  status: 'READY' | 'DEVELOPING' | 'NEEDS_WORK';
}

export interface SmartPracticeItem {
  task_id?: string;
  question_id?: string;
  topic_id: string;
  title: string;
  course_id: string;
  course_name: string;
  category: string;
  difficulty: AdaptiveDifficulty;
  reason: string;
}

export interface SmartPracticeSet {
  id: string;
  title: string;
  target_duration_mins: number;
  items: SmartPracticeItem[];
}

export interface SmartLearningSettings {
  id: string;
  user_id: string;
  adaptive_difficulty_enabled: boolean;
  spaced_revision_enabled: boolean;
  revision_interval_multiplier: number;
  default_session_minutes: number;
  prioritize_weak_topics: boolean;
  target_interviews: boolean;
  updated_at: string;
}
