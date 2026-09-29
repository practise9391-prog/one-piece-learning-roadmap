/**
 * Centralized Gamification Configuration & XP Constants (Part 19)
 * 
 * Provides single-source-of-truth constants for XP values, points,
 * level formulas, streak milestones, and anti-farming rules.
 * Never hardcode XP or Points values elsewhere in the application.
 */

export interface GamificationConfigType {
  // XP Rewards
  topicXp: number;
  difficultTopicXp: number;
  moduleXp: number;
  courseXp: number;
  studySessionXp: number; // 25-30 min focus session
  dailyGoalXp: number;
  weeklyGoalXp: number;
  monthlyGoalXp: number;
  practiceCorrectXp: number;
  practiceSetXp: number; // 10 questions set
  speakingSessionXp: number;
  speakingTopicXp: number;
  revisionSessionXp: number;

  // Points Rewards (currency for rewards/customization)
  topicPoints: number;
  difficultTopicPoints: number;
  modulePoints: number;
  coursePoints: number;
  studySessionPoints: number;
  dailyGoalPoints: number;
  weeklyGoalPoints: number;
  monthlyGoalPoints: number;
  practiceCorrectPoints: number;
  practiceSetPoints: number;
  speakingSessionPoints: number;
  speakingTopicPoints: number;
  revisionSessionPoints: number;

  // Streak Milestones (days -> { xp, points })
  streakMilestones: Record<number, { xp: number; points: number; label: string }>;

  // Level Progression Formula
  // Level L -> L+1 requires: baseNextLevelXp + (L - 1) * levelXpIncrement
  baseNextLevelXp: number; // 100 XP for Level 1 -> 2
  levelXpIncrement: number; // +50 XP per additional level
}

export const GamificationConfig: GamificationConfigType = {
  // XP Values
  topicXp: 10,
  difficultTopicXp: 15,
  moduleXp: 50,
  courseXp: 250,
  studySessionXp: 20,
  dailyGoalXp: 25,
  weeklyGoalXp: 75,
  monthlyGoalXp: 200,
  practiceCorrectXp: 2,
  practiceSetXp: 20,
  speakingSessionXp: 15,
  speakingTopicXp: 20,
  revisionSessionXp: 3,

  // Points Values
  topicPoints: 5,
  difficultTopicPoints: 8,
  modulePoints: 20,
  coursePoints: 100,
  studySessionPoints: 10,
  dailyGoalPoints: 10,
  weeklyGoalPoints: 30,
  monthlyGoalPoints: 100,
  practiceCorrectPoints: 1,
  practiceSetPoints: 10,
  speakingSessionPoints: 5,
  speakingTopicPoints: 10,
  revisionSessionPoints: 1,

  // Streak Milestones
  streakMilestones: {
    3: { xp: 50, points: 20, label: '3-Day Voyage' },
    7: { xp: 100, points: 50, label: '7-Day Explorer' },
    14: { xp: 200, points: 100, label: '14-Day Conqueror' },
    30: { xp: 500, points: 250, label: '30-Day Master' },
    60: { xp: 1000, points: 500, label: '60-Day Grand Line Sailor' },
    100: { xp: 2000, points: 1000, label: '100-Day Maritime Legend' },
    365: { xp: 5000, points: 2500, label: '365-Day King of the Seas' },
  },

  // Level Progression Formula:
  // Level 1: 0 to 100 XP (needs 100)
  // Level 2: 100 to 250 XP (needs 150)
  // Level 3: 250 to 450 XP (needs 200)
  // Level 4: 450 to 700 XP (needs 250)
  baseNextLevelXp: 100,
  levelXpIncrement: 50,
};

/**
 * Calculates level metadata from total accumulated XP.
 * Scalable formula that calculates level, progress within level, and next milestone.
 */
export function calculateLevelFromXp(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercentage: number;
  title: string;
} {
  const safeXp = Math.max(0, Math.floor(totalXp));

  let currentLevel = 1;
  let accumulatedXp = 0;

  while (true) {
    // Delta needed to clear currentLevel: 100 + (currentLevel - 1) * 50
    const delta =
      GamificationConfig.baseNextLevelXp +
      (currentLevel - 1) * GamificationConfig.levelXpIncrement;

    if (safeXp < accumulatedXp + delta) {
      const currentLevelXp = safeXp - accumulatedXp;
      const nextLevelXp = delta;
      const progressPercentage =
        nextLevelXp > 0
          ? Math.min(100, Math.round((currentLevelXp / nextLevelXp) * 1000) / 10)
          : 0;

      return {
        level: currentLevel,
        currentLevelXp,
        nextLevelXp,
        progressPercentage,
        title: getTitleForLevel(currentLevel),
      };
    }

    accumulatedXp += delta;
    currentLevel++;
  }
}

/**
 * Returns adventure rank title based on level.
 */
export function getTitleForLevel(level: number): string {
  if (level < 3) return 'Cabin Boy Explorer';
  if (level < 5) return 'Apprentice Navigator';
  if (level < 8) return 'Skilled Helmsman';
  if (level < 12) return 'Grand Line Voyager';
  if (level < 16) return 'Island Conqueror';
  if (level < 20) return 'Maritime Strategist';
  if (level < 25) return 'New World Pioneer';
  if (level < 30) return 'Fleet Commander';
  if (level < 40) return 'Warlord of Knowledge';
  if (level < 50) return 'Emperor of the Seas';
  return 'Legendary Pirate King';
}
