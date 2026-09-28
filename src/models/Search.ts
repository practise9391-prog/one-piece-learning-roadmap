export type TopicStatusFilter =
  | 'ALL'
  | 'COMPLETED'
  | 'IN_PROGRESS'
  | 'AVAILABLE'
  | 'LOCKED'
  | 'REMAINING';

export type DifficultyFilter = 'ALL' | 'beginner' | 'intermediate' | 'advanced';

export interface RoadmapSearchFilter {
  courseId?: string;
  moduleId?: string;
  difficulty?: DifficultyFilter;
  status?: TopicStatusFilter;
  query?: string;
}

export interface RoadmapSearchResult {
  topicId: string;
  topicTitle: string;
  topicDescription: string;
  moduleId: string;
  moduleTitle: string;
  courseId: string;
  courseName: string;
  courseTheme?: string;
  isCompleted: boolean;
  status: 'completed' | 'in_progress' | 'available' | 'locked';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
