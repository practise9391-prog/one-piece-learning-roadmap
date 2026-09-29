import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useGamificationViewModel } from '../../hooks/useGamificationViewModel';
import { LevelProgressCard } from '../../components/gamification/LevelProgressCard';
import { BadgeGrid } from '../../components/gamification/BadgeGrid';
import { AchievementCard } from '../../components/gamification/AchievementCard';
import { LevelUpModal } from '../../components/gamification/LevelUpModal';
import { XpToast } from '../../components/gamification/XpToast';
import { RewardPopupModal } from '../../components/gamification/RewardPopupModal';
import { useTheme } from '../../theme/ThemeContext';

export const RewardsDashboardScreen: React.FC = () => {
  const { theme } = useTheme();

  const {
    profile,
    badges,
    achievements,
    xpTransactions,
    pointsTransactions: _pointsTransactions,
    activeTab,
    setActiveTab,
    achievementFilter,
    setAchievementFilter,
    badgeCategory,
    setBadgeCategory,
    loading,
    refreshing,
    refresh,
    levelUpModal,
    rewardToast,
    unlockModal,
    dismissLevelUp,
    dismissToast,
    dismissUnlock,
  } = useGamificationViewModel();

  if (loading && !refreshing) {
    return (
      <AppShell title="Rewards & Honors">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading adventure rewards...
          </Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Rewards & Honors">
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* 1. LEVEL PROGRESS CARD (Section 2) */}
        {profile && <LevelProgressCard profile={profile} />}

        {/* 2. MAIN NAVIGATION TABS */}
        <View style={[styles.tabBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'achievements' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('achievements')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="trophy-outline"
              size={16}
              color={activeTab === 'achievements' ? '#FFFFFF' : theme.colors.textPrimary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'achievements' ? '#FFFFFF' : theme.colors.textPrimary },
              ]}
            >
              Achievements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'badges' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('badges')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="ribbon-outline"
              size={16}
              color={activeTab === 'badges' ? '#FFFFFF' : theme.colors.textPrimary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'badges' ? '#FFFFFF' : theme.colors.textPrimary },
              ]}
            >
              Badges
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'history' && { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="time-outline"
              size={16}
              color={activeTab === 'history' ? '#FFFFFF' : theme.colors.textPrimary}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'history' ? '#FFFFFF' : theme.colors.textPrimary },
              ]}
            >
              Ledger
            </Text>
          </TouchableOpacity>
        </View>

        {/* TAB 1: ACHIEVEMENTS (Section 21) */}
        {activeTab === 'achievements' && (
          <View>
            {/* Filter pills: All / Unlocked / Locked */}
            <View style={styles.filterRow}>
              {(['all', 'unlocked', 'locked'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.subFilterChip,
                    {
                      backgroundColor:
                        achievementFilter === f ? theme.colors.primary : theme.colors.surface,
                      borderColor:
                        achievementFilter === f ? theme.colors.primary : theme.colors.border,
                    },
                  ]}
                  onPress={() => setAchievementFilter(f)}
                >
                  <Text
                    style={[
                      styles.subFilterText,
                      { color: achievementFilter === f ? '#FFFFFF' : theme.colors.textPrimary },
                    ]}
                  >
                    {f.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {achievements.map((ach) => (
              <AchievementCard key={ach.id} achievement={ach} />
            ))}
          </View>
        )}

        {/* TAB 2: BADGES (Section 22) */}
        {activeTab === 'badges' && (
          <BadgeGrid
            badges={badges}
            activeCategory={badgeCategory}
            onCategoryChange={setBadgeCategory}
          />
        )}

        {/* TAB 3: LEDGER / HISTORY (Section 6, 13) */}
        {activeTab === 'history' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
                Recent XP & Points Transactions
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textSecondary }]}>
                Traceable audit trail of verified learning activities
              </Text>
            </View>

            {xpTransactions.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceCard }]}>
                <Ionicons name="sparkles-outline" size={32} color={theme.colors.textSecondary} />
                <Text style={[styles.emptyCardText, { color: theme.colors.textSecondary }]}>
                  No XP transactions recorded yet. Complete your first topic to earn XP!
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.historyCard,
                  { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border },
                ]}
              >
                {xpTransactions.map((tx, idx) => (
                  <View
                    key={tx.id}
                    style={[
                      styles.txRow,
                      {
                        borderBottomColor:
                          idx < xpTransactions.length - 1 ? theme.colors.border : 'transparent',
                      },
                    ]}
                  >
                    <View style={styles.txIconWrap}>
                      <Ionicons name="sparkles" size={16} color="#2563EB" />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={[styles.txDesc, { color: theme.colors.textPrimary }]}>
                        {tx.description}
                      </Text>
                      <Text style={[styles.txDate, { color: theme.colors.textSecondary }]}>
                        {tx.created_at.split('T')[0]} • {tx.event_type.replace(/_/g, ' ')}
                      </Text>
                    </View>
                    <View style={styles.txAmountWrap}>
                      <Text style={styles.txAmountText}>+{tx.xp_amount} XP</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Popups & Toasts */}
      {rewardToast && (
        <XpToast
          visible={rewardToast.visible}
          xp={rewardToast.xp}
          points={rewardToast.points}
          description={rewardToast.description}
          onDismiss={dismissToast}
        />
      )}

      {levelUpModal && (
        <LevelUpModal
          visible={levelUpModal.visible}
          oldLevel={levelUpModal.oldLevel}
          newLevel={levelUpModal.newLevel}
          levelTitle={levelUpModal.levelTitle}
          onDismiss={dismissLevelUp}
        />
      )}

      {unlockModal && (
        <RewardPopupModal
          visible={unlockModal.visible}
          title={unlockModal.title}
          subtitle={unlockModal.subtitle}
          icon={unlockModal.icon}
          xp={unlockModal.xp}
          points={unlockModal.points}
          onDismiss={dismissUnlock}
        />
      )}
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  tabBar: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  subFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  subFilterText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyCardText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  historyCard: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  txIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '600',
  },
  txDate: {
    fontSize: 10,
    marginTop: 2,
  },
  txAmountWrap: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  txAmountText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
});
