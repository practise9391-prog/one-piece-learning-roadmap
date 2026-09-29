import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useNotificationsViewModel } from '../../hooks/useNotificationsViewModel';
import { SettingsSection } from '../../components/settings';
import {
  TimePickerModal,
  NotificationReminderRow,
} from '../../components/notifications';
import { useTheme } from '../../theme/ThemeContext';

export const NotificationSettingsScreen: React.FC = () => {
  const {
    preferences,
    permissionStatus,
    isPermissionGranted,
    history,
    loading,
    testSending,
    requestPermission,
    toggleMasterNotifications,
    updateSound,
    updateVibration,
    updateLearningReminder,
    updateMultipleStudyTimes,
    updateAdvanceReminderMinutes,
    updateStudyAlarm,
    updateMorningPlanReminder,
    updateEveningUnfinishedReminder,
    updateWeeklyReminder,
    updateMonthlyReminder,
    updateStreakReminder,
    sendTestNotification,
    openSystemSettings,
  } = useNotificationsViewModel();
  const { theme } = useTheme();

  // Time picker modal state
  const [activePickerKey, setActivePickerKey] = useState<string | null>(null);
  const [activePickerTitle, setActivePickerTitle] = useState<string>('');
  const [activePickerTime, setActivePickerTime] = useState<string>('19:00');

  const openTimePicker = (key: string, title: string, currentTime: string) => {
    setActivePickerKey(key);
    setActivePickerTitle(title);
    setActivePickerTime(currentTime);
  };

  const handleSaveTime = async (time24: string) => {
    if (!activePickerKey) return;

    switch (activePickerKey) {
      case 'learning':
        await updateLearningReminder(preferences?.learning_reminder_enabled ?? true, time24);
        break;
      case 'morning_study':
        await updateMultipleStudyTimes({ morningTime: time24 });
        break;
      case 'afternoon_study':
        await updateMultipleStudyTimes({ afternoonTime: time24 });
        break;
      case 'evening_study':
        await updateMultipleStudyTimes({ eveningTime: time24 });
        break;
      case 'alarm':
        await updateStudyAlarm({ time: time24 });
        break;
      case 'morning_plan':
        await updateMorningPlanReminder(preferences?.morning_plan_reminder_enabled ?? true, time24);
        break;
      case 'evening_unfinished':
        await updateEveningUnfinishedReminder(preferences?.evening_unfinished_reminder_enabled ?? true, time24);
        break;
      case 'weekly':
        await updateWeeklyReminder(preferences?.weekly_reminder_enabled ?? true, undefined, time24);
        break;
      case 'monthly':
        await updateMonthlyReminder(preferences?.monthly_reminder_enabled ?? true, time24);
        break;
      case 'streak':
        await updateStreakReminder(preferences?.streak_reminder_enabled ?? true, time24);
        break;
      default:
        break;
    }
    setActivePickerKey(null);
  };

  const masterEnabled = preferences?.notifications_enabled ?? true;

  if (loading || !preferences) {
    return (
      <AppShell title="Notifications">
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading notification preferences...
          </Text>
        </View>
      </AppShell>
    );
  }

  return (
    <AppShell title="Notifications">
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission Explanation & Warning Banner (Section 2 & 32) */}
        {!isPermissionGranted && (
          <View style={[styles.permissionBanner, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}>
            <View style={styles.bannerHeader}>
              <Ionicons name="notifications-off-outline" size={24} color="#D97706" />
              <Text style={styles.bannerTitle}>Enable Study Notifications</Text>
            </View>
            <Text style={styles.bannerText}>
              Study reminders help you remember your planned learning sessions and keep your daily voyage on track.
            </Text>
            <View style={styles.bannerActions}>
              <TouchableOpacity
                style={[styles.bannerBtnPrimary, { backgroundColor: '#D97706' }]}
                onPress={async () => {
                  const granted = await requestPermission();
                  if (!granted) {
                    Alert.alert(
                      'Permission Required',
                      'Notifications are disabled. Open Android system settings to allow reminders.',
                      [
                        { text: 'Not Now', style: 'cancel' },
                        { text: 'Open Settings', onPress: openSystemSettings },
                      ]
                    );
                  }
                }}
              >
                <Text style={styles.bannerBtnPrimaryText}>Enable Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.bannerBtnSecondary}
                onPress={openSystemSettings}
              >
                <Text style={styles.bannerBtnSecondaryText}>System Settings</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Master Switch Card */}
        <View style={[styles.masterCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.masterInfo}>
            <View style={[styles.iconCircle, { backgroundColor: masterEnabled ? `${theme.colors.primary}20` : '#9CA3AF20' }]}>
              <Ionicons
                name={masterEnabled ? 'notifications' : 'notifications-off'}
                size={24}
                color={masterEnabled ? theme.colors.primary : '#9CA3AF'}
              />
            </View>
            <View style={styles.masterTextWrap}>
              <Text style={[styles.masterTitle, { color: theme.colors.textPrimary }]}>Master Notifications</Text>
              <Text style={[styles.masterSubtitle, { color: theme.colors.textSecondary }]}>
                {masterEnabled ? 'Reminders & alarms active' : 'All reminders paused'}
              </Text>
            </View>
          </View>
          <Switch
            value={masterEnabled}
            onValueChange={toggleMasterNotifications}
            trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* 1. General Preferences Section */}
        <SettingsSection title="GENERAL NOTIFICATION BEHAVIOR">
          <View style={[styles.settingRow, { borderBottomColor: theme.colors.border }]}>
            <View style={styles.rowInfo}>
              <Ionicons name="volume-high-outline" size={20} color={theme.colors.primary} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>Sound</Text>
                <Text style={[styles.rowSubtitle, { color: theme.colors.textSecondary }]}>Play sound with reminders</Text>
              </View>
            </View>
            <Switch
              value={preferences.sound_enabled}
              onValueChange={updateSound}
              disabled={!masterEnabled}
              trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.rowInfo}>
              <Ionicons name="radio-outline" size={20} color={theme.colors.primary} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>Vibration</Text>
                <Text style={[styles.rowSubtitle, { color: theme.colors.textSecondary }]}>Vibrate on alert</Text>
              </View>
            </View>
            <Switch
              value={preferences.vibration_enabled}
              onValueChange={updateVibration}
              disabled={!masterEnabled}
              trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </SettingsSection>

        {/* 2. Study Reminders Section */}
        <SettingsSection title="DAILY STUDY REMINDERS">
          <NotificationReminderRow
            title="Daily Study Reminder"
            subtitle="Reminds you with today's real study plan missions"
            icon="book-outline"
            enabled={preferences.learning_reminder_enabled && masterEnabled}
            time24={preferences.learning_reminder_time}
            onToggle={(enabled) => updateLearningReminder(enabled)}
            onPressTime={() =>
              openTimePicker('learning', 'Primary Study Reminder Time', preferences.learning_reminder_time)
            }
          />

          {/* Multiple Study Times Toggle (Section 5) */}
          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.colors.border }]}>
            <View style={styles.rowInfo}>
              <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: theme.colors.textPrimary }]}>Multiple Study Periods</Text>
                <Text style={[styles.rowSubtitle, { color: theme.colors.textSecondary }]}>
                  Split daily study into morning, afternoon, and evening
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.multiple_study_times_enabled}
              onValueChange={(val) => updateMultipleStudyTimes({ enabled: val })}
              disabled={!masterEnabled}
              trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {preferences.multiple_study_times_enabled && (
            <View style={styles.subTimesContainer}>
              <NotificationReminderRow
                title="Morning Period"
                subtitle="Early session"
                icon="sunny-outline"
                enabled={preferences.morning_study_enabled && masterEnabled}
                time24={preferences.morning_study_time}
                onToggle={(val) => updateMultipleStudyTimes({ morningEnabled: val })}
                onPressTime={() =>
                  openTimePicker('morning_study', 'Morning Study Time', preferences.morning_study_time)
                }
              />
              <NotificationReminderRow
                title="Afternoon Period"
                subtitle="Midday session"
                icon="partly-sunny-outline"
                enabled={preferences.afternoon_study_enabled && masterEnabled}
                time24={preferences.afternoon_study_time}
                onToggle={(val) => updateMultipleStudyTimes({ afternoonEnabled: val })}
                onPressTime={() =>
                  openTimePicker('afternoon_study', 'Afternoon Study Time', preferences.afternoon_study_time)
                }
              />
              <NotificationReminderRow
                title="Evening Period"
                subtitle="Night recap session"
                icon="moon-outline"
                enabled={preferences.evening_study_enabled && masterEnabled}
                time24={preferences.evening_study_time}
                onToggle={(val) => updateMultipleStudyTimes({ eveningEnabled: val })}
                onPressTime={() =>
                  openTimePicker('evening_study', 'Evening Study Time', preferences.evening_study_time)
                }
              />
            </View>
          )}

          {/* Advance Reminder Chips (Section 14 & 15) */}
          <View style={styles.chipSection}>
            <Text style={[styles.chipSectionTitle, { color: theme.colors.textSecondary }]}>
              ADVANCE REMINDER NOTICE
            </Text>
            <View style={styles.chipRow}>
              {[
                { label: 'None', val: 0 },
                { label: '5m', val: 5 },
                { label: '10m', val: 10 },
                { label: '15m', val: 15 },
                { label: '30m', val: 30 },
                { label: '1h', val: 60 },
              ].map((chip) => {
                const isSelected = preferences.advance_reminder_minutes === chip.val;
                return (
                  <TouchableOpacity
                    key={chip.val}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? theme.colors.primary : theme.colors.surface,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                    onPress={() => updateAdvanceReminderMinutes(chip.val)}
                    disabled={!masterEnabled}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary },
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </SettingsSection>

        {/* 3. Study Alarm Section (Section 11, 12, 13) */}
        <SettingsSection title="STUDY ALARM & SNOOZE">
          <NotificationReminderRow
            title="Study Alarm"
            subtitle="High-priority alarm alert at the start of study session"
            icon="alarm-outline"
            enabled={preferences.alarm_enabled && masterEnabled}
            time24={preferences.alarm_time}
            onToggle={(enabled) => updateStudyAlarm({ enabled })}
            onPressTime={() => openTimePicker('alarm', 'Study Alarm Time', preferences.alarm_time)}
          />

          {/* Snooze duration selector */}
          <View style={styles.chipSection}>
            <Text style={[styles.chipSectionTitle, { color: theme.colors.textSecondary }]}>
              SNOOZE INTERVAL
            </Text>
            <View style={styles.chipRow}>
              {[
                { label: '10 min', val: 10 },
                { label: '20 min', val: 20 },
                { label: '30 min', val: 30 },
              ].map((chip) => {
                const isSelected = preferences.snooze_interval_minutes === chip.val;
                return (
                  <TouchableOpacity
                    key={chip.val}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isSelected ? '#DC2626' : theme.colors.surface,
                        borderColor: isSelected ? '#DC2626' : theme.colors.border,
                      },
                    ]}
                    onPress={() => updateStudyAlarm({ snoozeMinutes: chip.val })}
                    disabled={!masterEnabled}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary },
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </SettingsSection>

        {/* 4. Goal Briefings & Progress Reminders */}
        <SettingsSection title="GOALS & PROGRESS BRIEFINGS">
          <NotificationReminderRow
            title="Morning Plan Briefing"
            subtitle="Summary of today's planned topics and hours"
            icon="sunny-outline"
            enabled={preferences.morning_plan_reminder_enabled && masterEnabled}
            time24={preferences.morning_plan_reminder_time}
            onToggle={(enabled) => updateMorningPlanReminder(enabled)}
            onPressTime={() =>
              openTimePicker('morning_plan', 'Morning Plan Time', preferences.morning_plan_reminder_time)
            }
          />

          <NotificationReminderRow
            title="Evening Unfinished Work"
            subtitle="Gentle check-in if planned topics are incomplete"
            icon="alert-circle-outline"
            enabled={preferences.evening_unfinished_reminder_enabled && masterEnabled}
            time24={preferences.evening_unfinished_reminder_time}
            onToggle={(enabled) => updateEveningUnfinishedReminder(enabled)}
            onPressTime={() =>
              openTimePicker('evening_unfinished', 'Evening Check-in Time', preferences.evening_unfinished_reminder_time)
            }
          />

          <NotificationReminderRow
            title="Weekly Summary"
            subtitle={`Recap on ${preferences.weekly_reminder_day} of completed vs planned hours`}
            icon="calendar-outline"
            enabled={preferences.weekly_reminder_enabled && masterEnabled}
            time24={preferences.weekly_reminder_time}
            onToggle={(enabled) => updateWeeklyReminder(enabled)}
            onPressTime={() =>
              openTimePicker('weekly', 'Weekly Summary Time', preferences.weekly_reminder_time)
            }
          />

          <NotificationReminderRow
            title="Monthly Summary"
            subtitle="Monthly learning percentage & milestone check"
            icon="pie-chart-outline"
            enabled={preferences.monthly_reminder_enabled && masterEnabled}
            time24={preferences.monthly_reminder_time}
            onToggle={(enabled) => updateMonthlyReminder(enabled)}
            onPressTime={() =>
              openTimePicker('monthly', 'Monthly Summary Time', preferences.monthly_reminder_time)
            }
          />

          <NotificationReminderRow
            title="Streak Protection"
            subtitle="Alerts you before midnight if your learning streak is at risk"
            icon="flame-outline"
            enabled={preferences.streak_reminder_enabled && masterEnabled}
            time24={preferences.streak_reminder_time}
            onToggle={(enabled) => updateStreakReminder(enabled)}
            onPressTime={() =>
              openTimePicker('streak', 'Streak Alert Time', preferences.streak_reminder_time)
            }
          />
        </SettingsSection>

        {/* 5. Testing & Preview Section (Section 37 & 38) */}
        <SettingsSection title="TEST NOTIFICATIONS">
          <View style={styles.testButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.testBtn,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
              ]}
              onPress={() => sendTestNotification(false)}
              disabled={testSending || !masterEnabled}
            >
              <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.testBtnText, { color: theme.colors.primary }]}>
                {testSending ? 'Sending...' : 'Test Study Reminder'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.testBtn,
                { backgroundColor: theme.colors.surface, borderColor: '#DC2626' },
              ]}
              onPress={() => sendTestNotification(true)}
              disabled={testSending || !masterEnabled}
            >
              <Ionicons name="alarm-outline" size={20} color="#DC2626" />
              <Text style={[styles.testBtnText, { color: '#DC2626' }]}>
                {testSending ? 'Sending...' : 'Test Study Alarm'}
              </Text>
            </TouchableOpacity>
          </View>
        </SettingsSection>

        {/* 6. Notification History Preview (Section 23) */}
        {history.length > 0 && (
          <SettingsSection title="RECENT NOTIFICATION LOG">
            {history.slice(0, 5).map((item) => (
              <View key={item.id} style={[styles.historyRow, { borderBottomColor: theme.colors.border }]}>
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.historyMessage, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                    {item.message}
                  </Text>
                  <Text style={[styles.historyDate, { color: theme.colors.textSecondary }]}>
                    {item.created_at.slice(0, 16).replace('T', ' ')}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        item.status === 'OPENED'
                          ? '#D1FAE5'
                          : item.status === 'SNOOZED'
                          ? '#FEF3C7'
                          : '#E0E7FF',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color:
                          item.status === 'OPENED'
                            ? '#065F46'
                            : item.status === 'SNOOZED'
                            ? '#92400E'
                            : '#3730A3',
                      },
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
            ))}
          </SettingsSection>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={activePickerKey !== null}
        title={activePickerTitle}
        initialTime={activePickerTime}
        onSave={handleSaveTime}
        onClose={() => setActivePickerKey(null)}
      />
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  permissionBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  bannerText: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    marginBottom: 12,
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerBtnPrimary: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  bannerBtnPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
  bannerBtnSecondary: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  bannerBtnSecondaryText: {
    color: '#92400E',
    fontWeight: '600',
    fontSize: 13,
  },
  masterCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  masterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  masterTextWrap: {
    flex: 1,
  },
  masterTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  masterSubtitle: {
    fontSize: 13,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
    gap: 12,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  subTimesContainer: {
    paddingLeft: 12,
    marginBottom: 8,
  },
  chipSection: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  chipSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  testButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  testBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  historyInfo: {
    flex: 1,
    marginRight: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyMessage: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  historyDate: {
    fontSize: 10,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
