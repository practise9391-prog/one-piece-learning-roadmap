/**
 * Gamification & Rewards Data Models (Part 19)
 */

export type RewardEventType =
  | 'TOPIC_COMPLETED'
  | 'MODULE_COMPLETED'
  | 'COURSE_COMPLETED'
  | 'STUDY_SESSION_COMPLETED'
  | 'DAILY_GOAL_COMPLETED'
  | 'WEEKLY_GOAL_COMPLETED'
  | 'MONTHLY_GOAL_COMPLETED'
  | 'PRACTICE_CORRECT'
  | 'PRACTICE_SET_COMPLETED'
  | 'SPEAKING_SESSION_COMPLETED'
  | 'SPEAKING_TOPIC_COMPLETED'
  | 'STREAK_MILESTONE'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'BADGE_UNLOCKED'
  | 'REVISION_SESSION'
  | 'STORE_PURCHASE'
  | 'BONUS_REWARD'
  | 'TASK_ACCEPTED'
  | 'PRACTICE_TASK_COMPLETED' | 'CAREER_PROJECT_ADDED' | 'CAREER_PROJECT_COMPLETED';

export interface XpTransaction {
  id: string;
  user_id: string;
  event_type: RewardEventType;
  source_id: string;
  course_id?: string | null;
  module_id?: string | null;
  topic_id?: string | null;
  xp_amount: number;
  description: string;
  created_at: string;
}

export interface PointsTransaction {
  id: string;
  user_id: string;
  transaction_type: 'EARNED' | 'SPENT';
  event_type: RewardEventType;
  source_id: string;
  points_amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export type BadgeCategory =
  | 'LEARNING'
  | 'COURSE'
  | 'STREAK'
  | 'PRACTICE'
  | 'SPEAKING'
  | 'GOALS'
  | 'MILESTONE'
  | 'SPECIAL';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  requirement_type: string;
  requirement_value: number;
  is_hidden: boolean;
  display_order: number;
  is_unlocked: boolean;
  unlocked_at?: string | null;
  current_progress?: number;
  progress_percentage?: number;
}

export type AchievementCategory =
  | 'LEARNING'
  | 'COURSE'
  | 'STREAK'
  | 'PRACTICE'
  | 'SPEAKING'
  | 'GOAL'
  | 'TIME'
  | 'SPECIAL';

export interface GamificationAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  points_reward: number;
  is_hidden: boolean;
  is_unlocked: boolean;
  unlocked_at?: string | null;
  current_progress?: number;
  progress_percentage?: number;
}

export interface UserGamificationProfile {
  total_xp: number;
  current_level: number;
  current_level_xp: number;
  next_level_xp: number;
  level_progress_percentage: number;
  level_title: string;
  points_balance: number;
  total_points_earned: number;
  total_points_spent: number;
  badges_unlocked_count: number;
  badges_total_count: number;
  achievements_unlocked_count: number;
  achievements_total_count: number;
  current_streak: number;
  longest_streak: number;
  updated_at: string;
}

export interface RewardResult {
  awarded: boolean;
  reason?: 'SUCCESS' | 'ALREADY_AWARDED' | 'INVALID_EVENT';
  event_type: RewardEventType;
  source_id: string;
  xpAwarded: number;
  pointsAwarded: number;
  levelUpOccurred: boolean;
  oldLevel?: number;
  newLevel?: number;
  unlockedBadges: Badge[];
  unlockedAchievements: GamificationAchievement[];
  description: string;
}

export interface GamificationSettings {
  show_xp_animations: boolean;
  show_reward_popups: boolean;
  play_reward_sounds: boolean;
  show_achievement_notifications: boolean;
  show_streak_celebrations: boolean;
  enable_motivational_messages: boolean;
}

export interface RewardEventRecord {
  id: string;
  event_type: RewardEventType;
  source_id: string;
  xp: number;
  points: number;
  created_at: string;
  processed: number;
}
