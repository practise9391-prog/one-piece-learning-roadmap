export type StudySessionStatus = 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface StudySession {
  id: string;
  course_id: string;
  module_id?: string | null;
  topic_id?: string | null;
  started_at: string;
  ended_at?: string | null;
  duration_seconds: number;
  planned_duration_seconds: number;
  status: StudySessionStatus;
  paused_at?: string | null;
  total_paused_seconds: number;
  created_at: string;

  // Joined display attributes (optional)
  course_name?: string;
  module_title?: string;
  topic_title?: string;
}

export interface FocusSettings {
  default_duration: number; // in minutes (e.g. 25)
  auto_start_next: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  show_dashboard_card: boolean;
  min_qualifying_seconds: number; // e.g. 300 (5 minutes)
}

export interface FocusCourseStats {
  course_id: string;
  course_name: string;
  total_seconds: number;
  session_count: number;
}

export interface DayStudyTime {
  date: string;
  day_label: string;
  seconds: number;
}

export interface FocusOverallStats {
  today_seconds: number;
  week_seconds: number;
  month_seconds: number;
  total_seconds: number;
  today_sessions_count: number;
  week_sessions_count: number;
  month_sessions_count: number;
  total_sessions_count: number;
  average_duration_seconds: number;
  longest_duration_seconds: number;
}

export interface ActiveFocusState {
  session: StudySession | null;
  remainingSeconds: number;
  elapsedSeconds: number;
  progress: number; // 0 to 1
  isRunning: boolean;
  isPaused: boolean;
}
