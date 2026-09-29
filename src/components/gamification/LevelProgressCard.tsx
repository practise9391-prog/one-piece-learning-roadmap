import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserGamificationProfile } from '../../models/Gamification';
import { useTheme } from '../../theme/ThemeContext';

interface LevelProgressCardProps {
  profile: UserGamificationProfile;
}

export const LevelProgressCard: React.FC<LevelProgressCardProps> = ({ profile }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}>
      {/* Header with Level & Title */}
      <View style={styles.headerRow}>
        <View style={styles.levelBadgeCol}>
          <View style={[styles.crestCircle, { backgroundColor: `${theme.colors.primary}20` }]}>
            <Ionicons name="compass" size={28} color={theme.colors.primary} />
          </View>
          <View style={styles.titleWrap}>
            <Text style={[styles.preTitle, { color: theme.colors.textSecondary }]}>
              ADVENTURE RANK
            </Text>
            <Text style={[styles.levelTitle, { color: theme.colors.textPrimary }]}>
              Level {profile.current_level}
            </Text>
            <Text style={[styles.rankSubtitle, { color: theme.colors.primary }]}>
              {profile.level_title}
            </Text>
          </View>
        </View>

        <View style={[styles.pointsBadge, { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }]}>
          <Ionicons name="sparkles" size={14} color="#D97706" />
          <Text style={styles.pointsText}>{profile.points_balance.toLocaleString()} Pts</Text>
        </View>
      </View>

      {/* Progress Bar & XP Counter */}
      <View style={styles.xpProgressContainer}>
        <View style={styles.xpRow}>
          <Text style={[styles.xpLabel, { color: theme.colors.textSecondary }]}>
            Level Progress
          </Text>
          <Text style={[styles.xpFraction, { color: theme.colors.textPrimary }]}>
            {profile.current_level_xp.toLocaleString()} / {profile.next_level_xp.toLocaleString()} XP
          </Text>
        </View>

        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${profile.level_progress_percentage}%`,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={[styles.statsStrip, { borderTopColor: theme.colors.border }]}>
        <View style={styles.statCol}>
          <Text style={[styles.statVal, { color: theme.colors.textPrimary }]}>
            {profile.total_xp.toLocaleString()}
          </Text>
          <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>TOTAL XP</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.statCol}>
          <Text style={[styles.statVal, { color: '#059669' }]}>
            {profile.badges_unlocked_count}/{profile.badges_total_count}
          </Text>
          <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>BADGES</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.statCol}>
          <Text style={[styles.statVal, { color: '#D97706' }]}>
            {profile.achievements_unlocked_count}/{profile.achievements_total_count}
          </Text>
          <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>ACHIEVED</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

        <View style={styles.statCol}>
          <Text style={[styles.statVal, { color: '#E11D48' }]}>
            🔥 {profile.current_streak}d
          </Text>
          <Text style={[styles.statLbl, { color: theme.colors.textSecondary }]}>STREAK</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  levelBadgeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  crestCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  titleWrap: {
    flex: 1,
  },
  preTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  levelTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  rankSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  xpProgressContainer: {
    marginBottom: 14,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  xpLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  xpFraction: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  statsStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  statLbl: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  divider: {
    width: 1,
    height: 24,
  },
});
