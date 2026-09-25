import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useSettingsViewModel } from '../../hooks/useSettingsViewModel';
import {
  SettingsSection,
  SettingsRadioGroup,
  SettingsSwitch,
  RadioOption,
} from '../../components/settings';
import { useTheme } from '../../theme/ThemeContext';
import { ThemeMode } from '../../models/Settings';

export const AppearanceSettingsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const {
    appearancePrefs,
    notificationPrefs,
    soundPrefs,
    currentThemeId,
    reducedMotion,
    saveTheme,
    saveReducedMotion,
    saveAnimationsEnabled,
  } = useSettingsViewModel();
  const { theme } = useTheme();

  const themeOptions: RadioOption[] = [
    {
      label: 'Ocean Adventure',
      value: 'ocean',
      subtitle: 'Grand Line Deep Navy & Glowing Cyan Waves',
      icon: 'water-outline',
      badge: 'RECOMMENDED',
    },
    {
      label: 'Dark Adventure',
      value: 'dark',
      subtitle: 'Pirate Midnight Slate & Straw Hat Scarlet',
      icon: 'moon-outline',
    },
    {
      label: 'Light Adventure',
      value: 'light',
      subtitle: 'Crisp Island Parchment & Bright White Decks',
      icon: 'sunny-outline',
    },
    {
      label: 'System Default',
      value: 'system',
      subtitle: 'Synchronize seamlessly with your device operating system',
      icon: 'phone-portrait-outline',
    },
  ];

  return (
    <AppShell title="APPEARANCE">
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

        {/* Section 1: Themes */}
        <SettingsSection title="Application Theme" icon="color-palette-outline">
          <SettingsRadioGroup
            options={themeOptions}
            selectedValue={currentThemeId}
            onSelect={(val) => saveTheme(val as ThemeMode)}
          />
        </SettingsSection>

        {/* Course Visual Identity Guarantee Card */}
        <View
          style={[
            styles.coursePledgeCard,
            {
              backgroundColor: `${theme.colors.secondary}12`,
              borderColor: `${theme.colors.secondary}35`,
            },
          ]}
        >
          <View style={styles.coursePledgeRow}>
            <Ionicons name="shield-checkmark" size={20} color={theme.colors.secondary} />
            <Text style={[styles.coursePledgeTitle, { color: theme.colors.textPrimary }]}>
              Course Identity Preservation
            </Text>
          </View>
          <Text style={[styles.coursePledgeText, { color: theme.colors.textSecondary }]}>
            Global theme applies to menus, decks, and shells. Each course retains its authentic signature visual identity (Python blue/yellow, DSA red, Git orange, SQL ocean sky, etc.) on its roadmaps.
          </Text>
        </View>

        {/* Section 2: Motion & Animation Settings */}
        <SettingsSection title="Motion & Dynamics" icon="sparkles-outline">
          <SettingsSwitch
            title="UI Animations"
            subtitle="Enable smooth transitions and interactive feedback"
            icon="film-outline"
            value={appearancePrefs?.animations_enabled ?? true}
            onValueChange={(val) => saveAnimationsEnabled(val)}
          />

          <SettingsSwitch
            title="Reduced Motion"
            subtitle="Minimize transitions, pulsing badges, and counter animations for accessibility and battery conservation"
            icon="accessibility-outline"
            value={reducedMotion}
            onValueChange={(val) => saveReducedMotion(val)}
            isLast={true}
          />
        </SettingsSection>

        {/* Section 3: Sound & Haptics (Preparation) */}
        <SettingsSection title="Sound & Audio" icon="volume-high-outline">
          <SettingsSwitch
            title="Adventure Sound Effects"
            subtitle="Original nautical chimes and quest fanfare (Coming in future updates)"
            icon="musical-notes-outline"
            value={soundPrefs?.sound_effects_enabled ?? false}
            onValueChange={() => {}}
            disabled={true}
            disabledBadge="COMING SOON"
            isLast={true}
          />
        </SettingsSection>

        {/* Section 4: Notifications (Preparation) */}
        <SettingsSection title="Device Notifications" icon="notifications-outline">
          <SettingsSwitch
            title="Daily Study Reminder"
            subtitle="Morning dispatch at 09:00 AM (Infrastructure in preparation)"
            icon="alarm-outline"
            value={notificationPrefs?.daily_learning_reminder ?? false}
            onValueChange={() => {}}
            disabled={true}
            disabledBadge="COMING SOON"
          />

          <SettingsSwitch
            title="Streak Protection Reminder"
            subtitle="Alert before midnight if daily goals remain incomplete"
            icon="flame-outline"
            value={notificationPrefs?.streak_reminder ?? false}
            onValueChange={() => {}}
            disabled={true}
            disabledBadge="COMING SOON"
          />

          <SettingsSwitch
            title="Weekly Tech News Digest"
            subtitle="Curated developer and AI stories summary"
            icon="newspaper-outline"
            value={notificationPrefs?.news_updates_reminder ?? false}
            onValueChange={() => {}}
            disabled={true}
            disabledBadge="COMING SOON"
            isLast={true}
          />
        </SettingsSection>
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
  coursePledgeCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 18,
  },
  coursePledgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  coursePledgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  coursePledgeText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
