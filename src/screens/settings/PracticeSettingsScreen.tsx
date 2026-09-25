import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useSettingsViewModel } from '../../hooks/useSettingsViewModel';
import {
  SettingsSection,
  SettingsDropdown,
  SettingsSwitch,
  DropdownOption,
} from '../../components/settings';
import { useTheme } from '../../theme/ThemeContext';

export const PracticeSettingsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { practicePrefs, savePracticePreferences } = useSettingsViewModel();
  const { theme } = useTheme();

  const difficultyOptions: DropdownOption[] = [
    { label: 'All Difficulties', value: 'all', subtitle: 'Show questions across all ranks', icon: 'list-outline' },
    { label: 'Easy (Apprentice)', value: 'easy', subtitle: 'Great for rapid warmup practice', icon: 'shield-outline' },
    { label: 'Medium (Veteran)', value: 'medium', subtitle: 'Standard technical interview level', icon: 'flash-outline' },
    { label: 'Hard (Grand Master)', value: 'hard', subtitle: 'Challenging multi-concept problems', icon: 'flame-outline' },
  ];

  return (
    <AppShell title="PRACTICE PREFS">
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

        {/* Section 1: Question Filtering */}
        <SettingsSection title="Difficulty & Filter" icon="funnel-outline">
          <SettingsDropdown
            title="Default Difficulty"
            subtitle="Initial filter selected in the training dojo"
            icon="speedometer-outline"
            value={practicePrefs?.default_difficulty || 'all'}
            options={difficultyOptions}
            onSelect={(val: any) => savePracticePreferences({ default_difficulty: val })}
          />

          <SettingsSwitch
            title="Show Solved Problems"
            subtitle="Keep completed challenges visible in category lists"
            icon="checkmark-done-circle-outline"
            value={practicePrefs?.show_completed_questions ?? true}
            onValueChange={(val) => savePracticePreferences({ show_completed_questions: val })}
            isLast={true}
          />
        </SettingsSection>

        {/* Section 2: Interactive Session Flow */}
        <SettingsSection title="Challenge Solving Flow" icon="play-circle-outline">
          <SettingsSwitch
            title="Auto-Advance Next Problem"
            subtitle="Automatically navigate to the next challenge after correct answer"
            icon="arrow-forward-circle-outline"
            value={practicePrefs?.auto_continue_next_question ?? true}
            onValueChange={(val) => savePracticePreferences({ auto_continue_next_question: val })}
          />

          <SettingsSwitch
            title="Enable Hints"
            subtitle="Display strategic clues when facing difficult problems"
            icon="bulb-outline"
            value={practicePrefs?.show_hints ?? true}
            onValueChange={(val) => savePracticePreferences({ show_hints: val })}
          />

          <SettingsSwitch
            title="Detailed Solution Explanations"
            subtitle="Show full theoretical breakdown and complexity insights"
            icon="document-text-outline"
            value={practicePrefs?.show_solutions ?? true}
            onValueChange={(val) => savePracticePreferences({ show_solutions: val })}
            isLast={true}
          />
        </SettingsSection>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: `${theme.colors.primary}0D`, borderColor: `${theme.colors.primary}30` }]}>
          <Ionicons name="hardware-chip-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            All 10 Practice Categories (DSA, Python, SQL, JS, Git, Linux, Frappe, Django, Aptitude, English) respect these solving preferences.
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
    flex: 1,
  },
});
