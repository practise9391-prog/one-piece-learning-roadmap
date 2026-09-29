/**
 * Part 24: Real-World Project Builder, Portfolio & Project-Based Learning System
 * Data Models & Types
 */

export type ProjectDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

export type ProjectCategory =
  | 'PYTHON'
  | 'DSA'
  | 'WEB'
  | 'DJANGO'
  | 'SQL'
  | 'JAVASCRIPT'
  | 'FRAPPE'
  | 'ML'
  | 'CUSTOM';

export type ProjectStatus =
  | 'IDEA'
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ARCHIVED';

export type MilestoneStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';

export type TaskType =
  | 'FEATURE'
  | 'BUG'
  | 'DESIGN'
  | 'DATABASE'
  | 'API'
  | 'FRONTEND'
  | 'BACKEND'
  | 'TESTING'
  | 'DOCUMENTATION'
  | 'DEPLOYMENT'
  | 'RESEARCH';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED' | 'CANCELLED';

export type RelationshipType = 'REQUIRES' | 'PRACTICES' | 'APPLIES' | 'REINFORCES';

export type FeatureStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'DEFERRED';

export type BugSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type BugStatus = 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'VERIFIED' | 'CLOSED';

export type TestCaseStatus = 'NOT_RUN' | 'PASSED' | 'FAILED' | 'BLOCKED';

export type TestCaseType = 'MANUAL' | 'AUTOMATED' | 'EDGE_CASE' | 'REGRESSION';

export interface ProjectTemplate {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  estimated_hours: number;
  required_skills: string[];
  recommended_courses: string[];
  recommended_topics: string[];
  prerequisites: string[];
  learning_outcomes: string[];
  suggested_features: string[];
  created_at: string;
}

export interface UserProject {
  id: string;
  user_id: string;
  template_id?: string | null;
  name: string;
  description: string;
  category: ProjectCategory;
  difficulty: ProjectDifficulty;
  status: ProjectStatus;
  progress: number; // 0 - 100 calculated from milestones/tasks/tests/docs
  estimated_hours: number;
  actual_hours: number;
  start_date?: string | null;
  target_date?: string | null;
  completed_date?: string | null;
  technologies: string[];
  github_url?: string | null;
  live_url?: string | null;
  problem_statement?: string | null;
  goal?: string | null;
  is_pinned_in_portfolio?: boolean;
  is_hidden_in_portfolio?: boolean;
  portfolio_order?: number;
  portfolio_description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  order: number;
  status: MilestoneStatus;
  progress: number;
  start_date?: string | null;
  target_date?: string | null;
  completed_date?: string | null;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  milestone_id?: string | null;
  title: string;
  description: string;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  estimated_minutes: number;
  actual_minutes: number;
  due_date?: string | null;
  completed_at?: string | null;
  practice_task_id?: string | null;
  order_index: number;
  created_at: string;
}

export interface ProjectLearningLink {
  id: string;
  project_id: string;
  course_id: string;
  module_id?: string | null;
  topic_id?: string | null;
  relationship_type: RelationshipType;
  // Joined fields from topics/modules/courses
  topic_title?: string;
  course_name?: string;
  module_title?: string;
  is_topic_completed?: boolean;
}

export interface ProjectFeature {
  id: string;
  project_id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: FeatureStatus;
  milestone_id?: string | null;
  created_at: string;
}

export interface ProjectBug {
  id: string;
  project_id: string;
  title: string;
  description: string;
  severity: BugSeverity;
  status: BugStatus;
  reproduction_steps?: string | null;
  expected_result?: string | null;
  actual_result?: string | null;
  resolution?: string | null;
  created_at: string;
  resolved_at?: string | null;
}

export interface ProjectTestCase {
  id: string;
  project_id: string;
  title: string;
  description: string;
  input?: string | null;
  expected_output?: string | null;
  actual_output?: string | null;
  status: TestCaseStatus;
  test_type: TestCaseType;
  created_at: string;
}

export interface ProjectDocumentation {
  project_id: string;
  title: string;
  problem: string;
  goal: string;
  features: string;
  technologies: string;
  architecture: string;
  database: string;
  apis: string;
  important_decisions: string;
  challenges: string;
  solutions: string;
  testing: string;
  deployment: string;
  future_improvements: string;
  updated_at: string;
}

export interface PortfolioProfile {
  id: string;
  user_id: string;
  name: string;
  headline: string;
  bio: string;
  skills: string[];
  location_text: string;
  github_url: string;
  linkedin_url: string;
  portfolio_url: string;
  updated_at: string;
}

export interface ProjectDashboardStats {
  active_projects_count: number;
  completed_projects_count: number;
  total_ideas_count: number;
  tasks_completed_count: number;
  tasks_remaining_count: number;
  open_bugs_count: number;
  portfolio_projects_count: number;
  technologies_used: string[];
  current_project: UserProject | null;
  current_milestone: ProjectMilestone | null;
}

export interface ProjectHealthStatus {
  project_id: string;
  tasks_total: number;
  tasks_completed: number;
  tasks_overdue: number;
  tasks_blocked: number;
  features_total: number;
  features_completed: number;
  bugs_open: number;
  bugs_critical: number;
  tests_total: number;
  tests_passed: number;
  documentation_completion_pct: number;
  last_activity_date: string;
  current_milestone_title: string;
  overall_progress_pct: number;
}
