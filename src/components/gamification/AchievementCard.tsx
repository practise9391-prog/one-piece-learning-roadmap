import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GamificationAchievement } from '../../models/Gamification';
import { useTheme } from '../../theme/ThemeContext';

interface AchievementCardProps {
  achievement: GamificationAchievement;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({ achievement }) => {
  const { theme } = useTheme();
  const isDone = achievement.is_unlocked;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surfaceCard,
          borderColor: isDone ? '#F59E0B' : theme.colors.border,
          opacity: isDone ? 1 : 0.85,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: isDone ? '#FEF3C7' : '#F1F5F9',
              borderColor: isDone ? '#FCD34D' : '#E2E8F0',
            },
          ]}
        >
          <Text style={{ fontSize: 26 }}>
            {achievement.is_hidden && !isDone ? '❓' : achievement.icon}
          </Text>
        </View>

        <View style={styles.titleCol}>
          <View style={styles.badgeLine}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {achievement.title}
            </Text>
            {isDone && (
              <View style={styles.unlockedTag}>
                <Ionicons name="checkmark-circle" size={12} color="#065F46" />
                <Text style={styles.unlockedTagText}>DONE</Text>
              </View>
            )}
          </View>
          <Text style={[styles.desc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {achievement.description}
          </Text>
        </View>
      </View>

      {/* Rewards Row */}
      <View style={styles.rewardsRow}>
        <View style={styles.rewardPills}>
          <View style={styles.xpPill}>
            <Text style={styles.xpPillText}>+{achievement.xp_reward} XP</Text>
          </View>
          <View style={styles.ptsPill}>
            <Text style={styles.ptsPillText}>+{achievement.points_reward} Pts</Text>
          </View>
        </View>

        <Text style={[styles.categoryText, { color: theme.colors.textSecondary }]}>
          {achievement.category}
        </Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${achievement.progress_percentage || (isDone ? 100 : 0)}%`,
                backgroundColor: isDone ? '#10B981' : theme.colors.primary,
              },
            ]}
          />
        </View>
        <View style={styles.progressFooter}>
          <Text style={[styles.progressRatio, { color: theme.colors.textSecondary }]}>
            {isDone
              ? 'Unlocked!'
              : `${achievement.current_progress || 0} / ${achievement.requirement_value}`}
          </Text>
          <Text
            style={[
              styles.progressPct,
              { color: isDone ? '#059669' : theme.colors.primary },
            ]}
          >
            {achievement.progress_percentage || (isDone ? 100 : 0)}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 12,
  },
  titleCol: {
    flex: 1,
  },
  badgeLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  unlockedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 6,
  },
  unlockedTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  rewardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardPills: {
    flexDirection: 'row',
    gap: 6,
  },
  xpPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  xpPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  ptsPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  ptsPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginTop: 2,
  },
  track: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  progressRatio: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressPct: {
    fontSize: 11,
    fontWeight: '800',
  },
});
