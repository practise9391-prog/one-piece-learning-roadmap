import { AdaptiveDifficulty, TopicMastery } from '../models/SmartLearning';

/**
 * Adaptive Difficulty Service (Section 10)
 * Recommends optimal practice difficulty based on actual performance and topic mastery.
 * Avoids abrupt jumps by adjusting 1 level at a time.
 */
export class AdaptiveDifficultyService {
  private static instance: AdaptiveDifficultyService | null = null;

  public static getInstance(): AdaptiveDifficultyService {
    if (!AdaptiveDifficultyService.instance) {
      AdaptiveDifficultyService.instance = new AdaptiveDifficultyService();
    }
    return AdaptiveDifficultyService.instance;
  }

  private readonly DIFFICULTY_TIERS: AdaptiveDifficulty[] = ['EASY', 'MEDIUM', 'HARD', 'EXPERT'];

  /**
   * Computes the recommended difficulty for a given topic mastery and recent accuracy.
   */
  getRecommendedDifficulty(
    mastery?: TopicMastery | null,
    recentAccuracy?: number,
    currentDifficulty: AdaptiveDifficulty = 'MEDIUM'
  ): AdaptiveDifficulty {
    const accuracy = recentAccuracy !== undefined ? recentAccuracy : (mastery?.accuracy_score || 50);
    const score = mastery?.mastery_score || 0;
    const currentIndex = this.DIFFICULTY_TIERS.indexOf(currentDifficulty);

    let targetIndex = currentIndex;

    // Rule 1: High accuracy & strong mastery -> increase difficulty gradually
    if (accuracy >= 80 && score >= 70) {
      targetIndex = Math.min(currentIndex + 1, this.DIFFICULTY_TIERS.length - 1);
    }
    // Rule 2: Low accuracy or low mastery -> decrease difficulty gradually
    else if (accuracy < 50 || score < 40) {
      targetIndex = Math.max(currentIndex - 1, 0);
    }

    return this.DIFFICULTY_TIERS[targetIndex];
  }

  /**
   * Explains why a specific difficulty was selected.
   */
  getDifficultyExplanation(
    difficulty: AdaptiveDifficulty,
    accuracy: number,
    masteryLevel: string
  ): string {
    switch (difficulty) {
      case 'EXPERT':
        return `Selected EXPERT difficulty because you demonstrated outstanding accuracy (${accuracy}%) and achieved Mastered level.`;
      case 'HARD':
        return `Selected HARD challenge based on consistent high performance (${accuracy}%) and solid topic comprehension.`;
      case 'MEDIUM':
        return `Selected MEDIUM level to balance conceptual reinforcement with practical problem solving (${accuracy}% accuracy).`;
      case 'EASY':
      default:
        return `Selected EASY level with guided hints to help solidify fundamental concepts before advancing.`;
    }
  }
}

export const adaptiveDifficultyService = AdaptiveDifficultyService.getInstance();
