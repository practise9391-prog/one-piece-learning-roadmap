export interface UserProfile {
  id: string;
  display_name: string;
  avatar_type: string;
  created_at: string;
  updated_at: string;
}

export interface AvatarOption {
  id: string;
  symbol: string;
  name: string;
  description: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'compass', symbol: '🧭', name: 'Log Pose Compass', description: 'Guides your destiny across uncharted waters' },
  { id: 'sword', symbol: '⚔️', name: 'Pirate Cutlass', description: 'Carves your way through complex challenges' },
  { id: 'wave', symbol: '🌊', name: 'All Blue Wave', description: 'Rides the limitless sea of knowledge' },
  { id: 'flag', symbol: '🏴', name: 'Jolly Roger Flag', description: 'Fly high with unyielding adventure spirit' },
  { id: 'map', symbol: '🗺️', name: 'Grand Line Chart', description: 'Mastering every route and secret territory' },
  { id: 'dragon', symbol: '🐉', name: 'Sea Dragon', description: 'Majestic strength and untamed determination' },
  { id: 'flame', symbol: '🔥', name: 'Will of Fire', description: 'A passion that never burns out' },
  { id: 'star', symbol: '⭐', name: 'Brave Star', description: 'Shines brightly even in the darkest storms' },
];

export interface LearningPreferences {
  default_course_id: string;
  auto_open_current_module: boolean;
  auto_scroll_to_current_node: boolean;
  show_completed_topics: boolean;
  confirm_before_reset_progress: boolean;
}

export interface DailyGoalPreferences {
  topics_per_day: number;
  practice_per_day: number;
  modules_per_day: number;
  weekly_days_target: number;
}

export interface PracticePreferences {
  default_difficulty: 'all' | 'easy' | 'medium' | 'hard';
  show_completed_questions: boolean;
  auto_continue_next_question: boolean;
  show_hints: boolean;
  show_solutions: boolean;
}

export interface NewsPreferencesSettings {
  categories: Record<string, boolean>;
  refresh_automatically: boolean;
  use_wifi_only: boolean;
  cache_articles: boolean;
}

export interface MotivationPreferences {
  daily_motivation_enabled: boolean;
  show_motivation_on_dashboard: boolean;
  favorite_messages_only: boolean;
  repeat_messages: boolean;
}

export type ThemeMode = 'ocean' | 'dark' | 'light' | 'system';

export interface AppearancePreferences {
  theme_id: ThemeMode;
  animations_enabled: boolean;
  reduced_motion: boolean;
}

export interface NotificationPreferences {
  daily_learning_reminder: boolean;
  streak_reminder: boolean;
  news_updates_reminder: boolean;
}

export interface SoundPreferences {
  sound_effects_enabled: boolean;
}

export interface DatabaseStatistics {
  courses_count: number;
  modules_count: number;
  topics_count: number;
  notes_count: number;
  practice_questions_count: number;
  news_articles_count: number;
  learning_activities_count: number;
  news_cache_bytes: number;
  database_size_desc: string;
}

export interface BackupMetadata {
  backup_version: number;
  created_at: string;
  app_version: string;
  app_name: string;
}

export interface BackupPayload {
  metadata: BackupMetadata;
  data: {
    user_profile?: UserProfile;
    app_settings?: Record<string, string>;
    goal_settings?: Record<string, string>;
    notes?: any[];
    topics_progress?: { id: string; is_completed: number; completed_at: string | null }[];
    modules_progress?: { id: string; is_completed: number; completed_at: string | null; completed_topics_count: number; status: string }[];
    courses_progress?: { id: string; completed_modules: number; progress_percentage: number; is_completed: number; started_at: string | null; completed_at: string | null }[];
    learning_activity?: any[];
    practice_attempts?: any[];
    practice_bookmarks?: string[];
    news_bookmarks?: any[];
    motivation_favorites?: string[];
    achievements?: any[];
  };
}

export interface BackupValidationResult {
  valid: boolean;
  error?: string;
  backup?: BackupPayload;
  stats?: {
    notes_count: number;
    completed_topics: number;
    completed_modules: number;
    created_at: string;
  };
}
