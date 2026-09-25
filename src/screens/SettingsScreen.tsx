import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../components/navigation/AppShell';
import { useAppNavigation } from '../navigation/NavigationContext';
import { useSettingsViewModel } from '../hooks/useSettingsViewModel';
import { SettingsSection, SettingsRow } from '../components/settings';
import { AVATAR_OPTIONS } from '../models/Settings';
import { useTheme } from '../theme/ThemeContext';

export const SettingsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const {
    profile,
    learningPrefs,
    goalPrefs,
    currentThemeId,
    dbStats,
  } = useSettingsViewModel();
  const { theme } = useTheme();

  const activeAvatarObj =
    AVATAR_OPTIONS.find((a) => a.id === profile?.avatar_type) || AVATAR_OPTIONS[0];

  // Theme name label
  const themeLabels: Record<string, string> = {
    ocean: 'Ocean Adventure',
    dark: 'Dark Adventure',
    light: 'Light Adventure',
    system: 'System Default',
  };

  return (
    <AppShell title="SETTINGS">
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Banner */}
        <TouchableOpacity
          style={[
            styles.profileBanner,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => navigate('ProfileSettings')}
          activeOpacity={0.8}
        >
          <View style={styles.profileLeft}>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: `${theme.colors.primary}18`, borderColor: theme.colors.secondary },
              ]}
            >
              <Text style={styles.avatarEmoji}>{activeAvatarObj.symbol}</Text>
            </View>
            <View style={styles.profileDetails}>
              <View style={styles.captainBadgeRow}>
                <Text style={[styles.captainName, { color: theme.colors.textPrimary }]}>
                  {profile?.display_name || 'Pavan'}
                </Text>
                <View style={[styles.captainRank, { backgroundColor: `${theme.colors.secondary}20` }]}>
                  <Text style={[styles.captainRankText, { color: theme.colors.secondaryDark }]}>
                    CAPTAIN
                  </Text>
                </View>
              </View>
              <Text style={[styles.avatarTitle, { color: theme.colors.textSecondary }]}>
                {activeAvatarObj.name} • Local Vault Profile
              </Text>
            </View>
          </View>
          <View style={styles.editProfileBtn}>
            <Ionicons name="create-outline" size={18} color={theme.colors.primary} />
          </View>
        </TouchableOpacity>

        {/* SECTION 1: PROFILE */}
        <SettingsSection title="Profile & Identity" icon="person-outline">
          <SettingsRow
            icon="finger-print-outline"
            title="Edit Captain Profile"
            subtitle="Change display name and nautical avatar crest"
            onPress={() => navigate('ProfileSettings')}
            isLast={true}
          />
        </SettingsSection>

        {/* SECTION 2: LEARNING */}
        <SettingsSection title="Learning & Roadmap" icon="school-outline">
          <SettingsRow
            icon="compass-outline"
            title="Learning Preferences"
            subtitle="Default course, auto-open modules, auto-scroll"
            valueText={learningPrefs?.default_course_id?.toUpperCase()}
            onPress={() => navigate('LearningPreferences')}
          />

          <SettingsRow
            icon="flame-outline"
            title="Daily Goals"
            subtitle={`${goalPrefs?.topics_per_day ?? 2} topics • ${goalPrefs?.practice_per_day ?? 5} practice questions`}
            badge={`${goalPrefs?.topics_per_day ?? 2}/Day`}
            onPress={() => navigate('DailyGoalSettings')}
            isLast={true}
          />
        </SettingsSection>

        {/* SECTION 3: PRACTICE */}
        <SettingsSection title="Practice & Training Dojo" icon="code-slash-outline">
          <SettingsRow
            icon="flash-outline"
            title="Practice Preferences"
            subtitle="Difficulty filter, hints, detailed solutions, auto-advance"
            onPress={() => navigate('PracticeSettings')}
            isLast={true}
          />
        </SettingsSection>

        {/* SECTION 4: NEWS */}
        <SettingsSection title="Dispatches & News Feeds" icon="newspaper-outline">
          <SettingsRow
            icon="funnel-outline"
            title="News Preferences"
            subtitle="Categories, auto-sync, Wi-Fi only, cache management"
            onPress={() => navigate('NewsSettings')}
            isLast={true}
          />
        </SettingsSection>

        {/* SECTION 5: MOTIVATION */}
        <SettingsSection title="Motivation & Routine" icon="sparkles-outline">
          <SettingsRow
            icon="sunny-outline"
            title="Motivation Preferences"
            subtitle="Daily rotation, dashboard quote banner, favorite messages"
            onPress={() => navigate('MotivationSettings')}
            isLast={true}
          />
        </SettingsSection>

        {/* SECTION 6: APPEARANCE */}
        <SettingsSection title="Appearance & Motion" icon="color-palette-outline">
          <SettingsRow
            icon="color-filter-outline"
            title="Theme & Visuals"
            subtitle={themeLabels[currentThemeId] || 'Ocean Adventure'}
            badge={currentThemeId.toUpperCase()}
            onPress={() => navigate('AppearanceSettings')}
            isLast={true}
          />
        </SettingsSection>

        {/* SECTION 7: DATA & STORAGE */}
        <SettingsSection title="Data Vault & Portability" icon="server-outline">
          <SettingsRow
            icon="cube-outline"
            title="Data Management"
            subtitle={`Storage, JSON Export/Import, Reset Progress (${dbStats?.courses_count ?? 14} courses)`}
            badge="LOCAL"
            badgeColor="#10B981"
            onPress={() => navigate('DataManagement')}
          />

          <SettingsRow
            icon="shield-checkmark-outline"
            title="Developer SQLite Test Screen"
            subtitle="Inspect raw database persistence and foreign keys"
            onPress={() => navigate('DatabaseTest')}
            isLast={true}
          />
        </SettingsSection>

        {/* SECTION 8: ABOUT */}
        <SettingsSection title="About Application" icon="information-circle-outline">
          <SettingsRow
            icon="planet-outline"
            title="About One Piece Roadmap"
            subtitle="Version 1.0.0 Grand Line Edition • Offline-first"
            badge="v1.0.0"
            badgeColor="#64748B"
            onPress={() => navigate('About')}
            isLast={true}
          />
        </SettingsSection>

        {/* Footer Note */}
        <View style={styles.footerNote}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            ONE PIECE LEARNING ROADMAP • 100% OFFLINE-FIRST VAULT
          </Text>
        </View>
      </ScrollView>
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
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarEmoji: {
    fontSize: 26,
  },
  profileDetails: {
    flex: 1,
  },
  captainBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  captainName: {
    fontSize: 16,
    fontWeight: '800',
  },
  captainRank: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  captainRankText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  avatarTitle: {
    fontSize: 11,
    marginTop: 2,
  },
  editProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
});
