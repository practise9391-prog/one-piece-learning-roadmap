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

export const LearningPreferencesScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { learningPrefs, courses, saveLearningPreferences } = useSettingsViewModel();
  const { theme } = useTheme();

  const courseOptions: DropdownOption[] = courses.map((c) => ({
    label: c.name,
    value: c.id,
    subtitle: `${c.total_modules} modules • ${Math.round(c.progress_percentage || 0)}% completed`,
    icon: 'school-outline',
  }));

  const activeCourseId = learningPrefs?.default_course_id || 'python';

  return (
    <AppShell title="LEARNING PREFS">
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

        {/* Section 1: Default Course */}
        <SettingsSection title="Primary Journey Course" icon="compass-outline">
          <SettingsDropdown
            title="Default Course"
            subtitle="Opens directly when starting study session"
            icon="book-outline"
            value={activeCourseId}
            options={courseOptions.length > 0 ? courseOptions : [{ label: 'Python Masterclass', value: 'python' }]}
            onSelect={(val) => saveLearningPreferences({ default_course_id: val })}
            isLast={true}
          />
        </SettingsSection>

        {/* Section 2: Roadmap Navigation Behavior */}
        <SettingsSection title="Roadmap & Navigation" icon="navigate-outline">
          <SettingsSwitch
            title="Auto-open Current Module"
            subtitle="Immediately expands the in-progress module on roadmap load"
            icon="albums-outline"
            value={learningPrefs?.auto_open_current_module ?? true}
            onValueChange={(val) => saveLearningPreferences({ auto_open_current_module: val })}
          />

          <SettingsSwitch
            title="Auto-scroll to Active Node"
            subtitle="Smoothly centers the current learning position"
            icon="locate-outline"
            value={learningPrefs?.auto_scroll_to_current_node ?? true}
            onValueChange={(val) => saveLearningPreferences({ auto_scroll_to_current_node: val })}
            isLast={true}
          />
        </SettingsSection>

        {/* Section 3: Topic Visibility & Safety */}
        <SettingsSection title="Display & Safety" icon="eye-outline">
          <SettingsSwitch
            title="Show Completed Topics"
            subtitle="Display checkmarked conquered topics in module lists"
            icon="checkmark-done-circle-outline"
            value={learningPrefs?.show_completed_topics ?? true}
            onValueChange={(val) => saveLearningPreferences({ show_completed_topics: val })}
          />

          <SettingsSwitch
            title="Confirm Before Reset"
            subtitle="Show confirmation dialog before resetting learning items"
            icon="shield-outline"
            value={learningPrefs?.confirm_before_reset_progress ?? true}
            onValueChange={(val) => saveLearningPreferences({ confirm_before_reset_progress: val })}
            isLast={true}
          />
        </SettingsSection>

        {/* Info card */}
        <View style={[styles.infoCard, { backgroundColor: `${theme.colors.primary}0D`, borderColor: `${theme.colors.primary}30` }]}>
          <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
            All 14 comprehensive roadmaps (Python, DSA, SQL, Git, Linux, Django, etc.) are stored in your device. Selecting a default course highlights it prominently across the dashboard.
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
