import { Easing } from 'react-native';
import { AnimationDurations } from './tokens';

/**
 * Central Animation Configuration
 * Provides timing, easings, spring configurations, and reduced-motion-aware duration helpers.
 */

export const AnimationConfig = {
  durations: AnimationDurations,

  easings: {
    standard: Easing.bezier(0.4, 0.0, 0.2, 1),
    decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0.0, 1, 1),
    smoothOut: Easing.out(Easing.cubic),
    bounceSubtle: Easing.bezier(0.175, 0.885, 0.32, 1.15),
  },

  spring: {
    gentle: { friction: 7, tension: 50 },
    responsive: { friction: 6, tension: 70 },
    snappy: { friction: 5, tension: 90 },
    bouncy: { friction: 4, tension: 100 },
  },

  /**
   * Helper that returns instant/minimal duration if reducedMotion is active.
   */
  getDuration(targetMs: number, reducedMotion: boolean): number {
    if (reducedMotion) {
      return 0;
    }
    return targetMs;
  },

  /**
   * Helper that returns 0 opacity/offset transforms if reduced motion is requested.
   */
  getTranslate(offset: number, reducedMotion: boolean): number {
    return reducedMotion ? 0 : offset;
  },
};
