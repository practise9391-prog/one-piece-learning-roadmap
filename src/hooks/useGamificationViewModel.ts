import { useState, useEffect, useCallback } from 'react';
import { gamificationService } from '../services/GamificationService';
import {
  UserGamificationProfile,
  Badge,
  BadgeCategory,
  GamificationAchievement,
  XpTransaction,
  PointsTransaction,
  RewardResult,
} from '../models/Gamification';

export type GamificationTab = 'achievements' | 'badges' | 'history';

export interface LevelUpModalState {
  visible: boolean;
  oldLevel: number;
  newLevel: number;
  levelTitle: string;
}

export interface RewardToastState {
  visible: boolean;
  xp: number;
  points: number;
  description: string;
}

export interface UnlockModalState {
  visible: boolean;
  title: string;
  subtitle: string;
  icon: string;
  xp: number;
  points: number;
}

export function useGamificationViewModel() {
  const [profile, setProfile] = useState<UserGamificationProfile | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [achievements, setAchievements] = useState<GamificationAchievement[]>([]);
  const [xpTransactions, setXpTransactions] = useState<XpTransaction[]>([]);
  const [pointsTransactions, setPointsTransactions] = useState<PointsTransaction[]>([]);

  const [activeTab, setActiveTab] = useState<GamificationTab>('achievements');
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [badgeCategory, setBadgeCategory] = useState<BadgeCategory | 'ALL'>('ALL');

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals & Toasts State
  const [levelUpModal, setLevelUpModal] = useState<LevelUpModalState | null>(null);
  const [rewardToast, setRewardToast] = useState<RewardToastState | null>(null);
  const [unlockModal, setUnlockModal] = useState<UnlockModalState | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [
        fetchedProfile,
        fetchedBadges,
        fetchedAchievements,
        fetchedXpTx,
        fetchedPtsTx,
      ] = await Promise.all([
        gamificationService.getProfile(),
        gamificationService.getBadges(badgeCategory),
        gamificationService.getAchievements(achievementFilter),
        gamificationService.getXpHistory(30),
        gamificationService.getPointsHistory(30),
      ]);

      setProfile(fetchedProfile);
      setBadges(fetchedBadges);
      setAchievements(fetchedAchievements);
      setXpTransactions(fetchedXpTx);
      setPointsTransactions(fetchedPtsTx);
    } catch (err) {
      console.error('Failed to load gamification data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [badgeCategory, achievementFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to live rewards (for animations/toasts across screens)
  useEffect(() => {
    const unsubscribe = gamificationService.subscribe((result: RewardResult) => {
      // 1. Level up celebration
      if (result.levelUpOccurred && result.newLevel) {
        setLevelUpModal({
          visible: true,
          oldLevel: result.oldLevel || 1,
          newLevel: result.newLevel,
          levelTitle: profile?.level_title || 'Grand Line Explorer',
        });
      }

      // 2. Badge / Achievement major celebration
      if (result.unlockedBadges.length > 0) {
        const b = result.unlockedBadges[0];
        setUnlockModal({
          visible: true,
          title: 'Badge Unlocked!',
          subtitle: b.name,
          icon: b.icon,
          xp: 50,
          points: 25,
        });
      } else if (result.unlockedAchievements.length > 0) {
        const a = result.unlockedAchievements[0];
        setUnlockModal({
          visible: true,
          title: 'Achievement Unlocked!',
          subtitle: a.title,
          icon: a.icon,
          xp: a.xp_reward,
          points: a.points_reward,
        });
      } else if (result.xpAwarded > 0 || result.pointsAwarded > 0) {
        // Minor reward toast
        setRewardToast({
          visible: true,
          xp: result.xpAwarded,
          points: result.pointsAwarded,
          description: result.description,
        });
      }

      // Refresh totals in background
      gamificationService.getProfile().then(setProfile).catch(() => {});
    });

    return unsubscribe;
  }, [profile?.level_title]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const dismissLevelUp = () => setLevelUpModal(null);
  const dismissToast = () => setRewardToast(null);
  const dismissUnlock = () => setUnlockModal(null);

  return {
    profile,
    badges,
    achievements,
    xpTransactions,
    pointsTransactions,
    activeTab,
    setActiveTab,
    achievementFilter,
    setAchievementFilter,
    badgeCategory,
    setBadgeCategory,
    loading,
    refreshing,
    refresh: onRefresh,
    levelUpModal,
    rewardToast,
    unlockModal,
    dismissLevelUp,
    dismissToast,
    dismissUnlock,
  };
}
