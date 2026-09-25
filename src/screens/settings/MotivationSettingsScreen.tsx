import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useSettingsViewModel } from '../../hooks/useSettingsViewModel';
import { SettingsSection, SettingsSwitch } from '../../components/settings';
import { useTheme } from '../../theme/ThemeContext';

export const MotivationSettingsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { motivationPrefs, saveMotivationPreferences } = useSettingsViewModel();
  const { theme } = useTheme();

  return (
    <AppShell title="MOTIVATION PREFS">
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation back bar */}
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => navigate('Settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
          <Text style={[styles.backText, { color: theme.colors.primary }]}>
            Back to Settings
          </Text>
        </TouchableOpacity>

        {/* Section 1: Daily Motivation Engine */}
        <SettingsSection title="Motivation Engine" icon="sparkles-outline">
          <SettingsSwitch
            title="Daily Motivational Wisdom"
            subtitle="Rotate inspirational quotes each morning at sunrise"
            icon="sunny-outline"
            value={motivationPrefs?.daily_motivation_enabled ?? true}
            onValueChange={(val) => saveMotivationPreferences({ daily_motivation_enabled: val })}
          />

          <SettingsSwitch
            title="Show on Main Dashboard"
            subtitle="Display the daily adventure quote banner on the captain's deck"
            icon="home-outline"
            value={motivationPrefs?.show_motivation_on_dashboard ?? true}
            onValueChange={(val) => saveMotivationPreferences({ show_motivation_on_dashboard: val })}
            isLast={true}
          />
        </SettingsSection>

        {/* Section 2: Quote Filtering & Repetition */}
        <SettingsSection title="Quote Rotation Rules" icon="options-outline">
          <SettingsSwitch
            title="Favorite Messages Only"
            subtitle="Only rotate among quotes you have saved with a gold heart"
            icon="heart-outline"
            value={motivationPrefs?.favorite_messages_only ?? false}
            onValueChange={(val) => saveMotivationPreferences({ favorite_messages_only: val })}
          />

          <SettingsSwitch
            title="Permit Repeated Quotes"
            subtitle="Allow quotes to repeat before all 20 unique quotes have been shown"
            icon="repeat-outline"
            value={motivationPrefs?.repeat_messages ?? false}
            onValueChange={(val) => saveMotivationPreferences({ repeat_messages: val })}
            isLast={true}
          />
        </SettingsSection>

        {/* Quotes Hub Shortcut */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          onPress={() => navigate('Motivation')}
          activeOpacity={0.7}
        >
          <View style={styles.actionLeft}>
            <View style={[styles.actionIconBox, { backgroundColor: `${theme.colors.secondary}20` }]}>
              <Ionicons name="flame" size={20} color={theme.colors.secondary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionTitle, { color: theme.colors.textPrimary }]}>
                Browse All Motivation Quotes
              </Text>
              <Text style={[styles.actionSub, { color: theme.colors.textSecondary }]}>
                Explore Growth, Discipline, Courage, and Persistence quotes
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.colors.textTertiary} />
        </TouchableOpacity>
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
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  actionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
});
