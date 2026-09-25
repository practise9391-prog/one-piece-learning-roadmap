import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useSettingsViewModel } from '../../hooks/useSettingsViewModel';
import { SettingsSection } from '../../components/settings';
import { useTheme } from '../../theme/ThemeContext';

export const DailyGoalSettingsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { goalPrefs, saveDailyGoals } = useSettingsViewModel();
  const { theme } = useTheme();

  const [topics, setTopics] = useState<number>(2);
  const [practice, setPractice] = useState<number>(5);
  const [modules, setModules] = useState<number>(1);
  const [days, setDays] = useState<number>(5);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (goalPrefs) {
      setTopics(goalPrefs.topics_per_day);
      setPractice(goalPrefs.practice_per_day);
      setModules(goalPrefs.modules_per_day);
      setDays(goalPrefs.weekly_days_target);
    }
  }, [goalPrefs]);

  const handleSave = async () => {
    try {
      await saveDailyGoals({
        topics_per_day: topics,
        practice_per_day: practice,
        modules_per_day: modules,
        weekly_days_target: days,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Unable to update daily goals.');
    }
  };

  const renderStepper = (
    label: string,
    subtitle: string,
    value: number,
    setter: (val: number) => void,
    min: number,
    max: number,
    icon: keyof typeof Ionicons.glyphMap,
    isLast: boolean = false
  ) => (
    <View
      style={[
        styles.stepperRow,
        !isLast && [styles.borderBottom, { borderBottomColor: theme.colors.divider }],
      ]}
    >
      <View style={styles.stepperLeft}>
        <View style={[styles.iconBox, { backgroundColor: `${theme.colors.primary}15` }]}>
          <Ionicons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.stepperLabel, { color: theme.colors.textPrimary }]}>
            {label}
          </Text>
          <Text style={[styles.stepperSub, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        </View>
      </View>

      <View style={styles.stepperControls}>
        <TouchableOpacity
          style={[
            styles.stepBtn,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceHover },
            value <= min && styles.stepBtnDisabled,
          ]}
          onPress={() => setter(Math.max(min, value - 1))}
          disabled={value <= min}
          activeOpacity={0.7}
        >
          <Ionicons
            name="remove"
            size={16}
            color={value <= min ? theme.colors.textTertiary : theme.colors.textPrimary}
          />
        </TouchableOpacity>

        <View style={styles.valueDisplay}>
          <Text style={[styles.valueNum, { color: theme.colors.primary }]}>{value}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.stepBtn,
            { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceHover },
            value >= max && styles.stepBtnDisabled,
          ]}
          onPress={() => setter(Math.min(max, value + 1))}
          disabled={value >= max}
          activeOpacity={0.7}
        >
          <Ionicons
            name="add"
            size={16}
            color={value >= max ? theme.colors.textTertiary : theme.colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AppShell title="DAILY GOALS">
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

        {/* Section 1: Daily Target Values */}
        <SettingsSection title="Daily Learning Targets" icon="flame-outline">
          {renderStepper(
            'Topics Per Day',
            'Roadmap study items to conquer daily',
            topics,
            setTopics,
            0,
            20,
            'book-outline'
          )}

          {renderStepper(
            'Practice Questions',
            'Coding and aptitude challenges per day',
            practice,
            setPractice,
            0,
            50,
            'code-slash-outline'
          )}

          {renderStepper(
            'Modules Per Day',
            'Complete milestone modules per day',
            modules,
            setModules,
            0,
            10,
            'layers-outline',
            true
          )}
        </SettingsSection>

        {/* Section 2: Weekly Routine Target */}
        <SettingsSection title="Weekly Habit Cadence" icon="calendar-outline">
          {renderStepper(
            'Learning Days / Week',
            'Recommended minimum for healthy streaks (1-7)',
            days,
            setDays,
            1,
            7,
            'trending-up-outline',
            true
          )}
        </SettingsSection>

        {/* Save CTA */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons
            name={savedSuccess ? 'checkmark-circle' : 'checkmark-done'}
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.saveBtnText}>
            {savedSuccess ? 'TARGETS UPDATED!' : 'APPLY NEW GOALS'}
          </Text>
        </TouchableOpacity>

        {/* Helpful Explanation */}
        <View style={styles.helperCard}>
          <Ionicons name="sparkles-outline" size={18} color="#FFB300" />
          <Text style={[styles.helperText, { color: theme.colors.textSecondary }]}>
            Your daily goals reset at midnight. Future generated goals will automatically adopt these targets, keeping your pirate crew motivated on the Grand Line!
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
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  stepperLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepperLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepperSub: {
    fontSize: 12,
    marginTop: 2,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.4,
  },
  valueDisplay: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueNum: {
    fontSize: 16,
    fontWeight: '800',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  helperCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 179, 0, 0.08)',
  },
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    marginLeft: 10,
    flex: 1,
  },
});
