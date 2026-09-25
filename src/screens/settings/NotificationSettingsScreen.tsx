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
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useNotificationsViewModel } from '../../hooks/useNotificationsViewModel';
import { SettingsSection } from '../../components/settings';
import {
  TimePickerModal,
  NotificationReminderRow,
} from '../../components/notifications';
import { useTheme } from '../../theme/ThemeContext';

export const NotificationSettingsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const {
    preferences,
    permissionStatus,
    isPermissionGranted,
    loading,
    testSending,
    requestPermission,
    toggleMasterNotifications,
    updateLearningReminder,
    updateGoalReminder,
    updateStreakReminder,
    updatePracticeReminder,
    updateMotivationReminder,
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
    switch (activePickerKey) {
      case 'learning':
        await updateLearningReminder(preferences?.learning_reminder_enabled ?? true, time24);
        break;
      case 'goal':
        await updateGoalReminder(preferences?.goal_reminder_enabled ?? true, time24);
        break;
      case 'streak':
        await updateStreakReminder(preferences?.streak_reminder_enabled ?? true, time24);
        break;
      case 'practice':
        await updatePracticeReminder(preferences?.practice_reminder_enabled ?? true, time24);
        break;
      case 'motivation':
        await updateMotivationReminder(preferences?.motivation_notification_enabled ?? true, time24);
        break;
    }
  };

  const handleTestNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      Alert.alert(
        'Test Notification Sent',
        'Check your Android notification shade! Tapping it will bring you directly to the deck.'
      );
    } else {
      Alert.alert(
        'Permission Required',
        'Notification permission is disabled on your device. Please grant permission to receive test alerts.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: openSystemSettings },
        ]
      );
    }
  };

  if (loading) {
    return (
      <AppShell title="NOTIFICATIONS">
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Loading reminder engine...
          </Text>
        </View>
      </AppShell>
    );
  }

  const masterEnabled = preferences?.notifications_enabled ?? true;

  return (
    <AppShell title="NOTIFICATIONS">
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

        {/* Header Hero Banner */}
        <View style={[styles.heroBanner, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.heroLeft}>
            <View style={[styles.bellBox, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Ionicons name="notifications" size={26} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroTitle, { color: theme.colors.textPrimary }]}>
                Learning Reminders
              </Text>
              <Text style={[styles.heroSub, { color: theme.colors.textSecondary }]}>
                Stay on course with your daily learning journey
              </Text>
            </View>
          </View>
        </View>

        {/* Android Permission Status Card */}
        <View
          style={[
            styles.statusCard,
            {
              backgroundColor: !isPermissionGranted
                ? 'rgba(245, 158, 11, 0.1)'
                : masterEnabled
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(100, 116, 139, 0.1)',
              borderColor: !isPermissionGranted
                ? '#F59E0B'
                : masterEnabled
                ? '#10B981'
                : '#64748B',
            },
          ]}
        >
          <View style={styles.statusRow}>
            <Ionicons
              name={
                !isPermissionGranted
                  ? 'alert-circle'
                  : masterEnabled
                  ? 'checkmark-circle'
                  : 'notifications-off'
              }
              size={22}
              color={!isPermissionGranted ? '#F59E0B' : masterEnabled ? '#10B981' : '#64748B'}
            />
            <View style={styles.statusTextCol}>
              <Text
                style={[
                  styles.statusTitle,
                  { color: !isPermissionGranted ? '#D97706' : masterEnabled ? '#15803D' : '#475569' },
                ]}
              >
                {!isPermissionGranted
                  ? 'Permission Required'
                  : masterEnabled
                  ? 'Notifications Active'
                  : 'Notifications Paused'}
              </Text>
              <Text style={[styles.statusSub, { color: theme.colors.textSecondary }]}>
                {!isPermissionGranted
                  ? 'Android permission is needed to deliver scheduled study alerts.'
                  : masterEnabled
                  ? 'Scheduled reminders will trigger using Android local alarms.'
                  : 'All scheduled alarms are paused.'}
              </Text>
            </View>

            {!isPermissionGranted && (
              <TouchableOpacity
                style={styles.permissionActionBtn}
                onPress={requestPermission}
                activeOpacity={0.8}
              >
                <Text style={styles.permissionActionText}>ALLOW</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Master Toggle Section */}
        <SettingsSection title="Master Controls" icon="toggle-outline">
          <View style={styles.masterRow}>
            <View style={styles.masterLeft}>
              <Ionicons name="power-outline" size={20} color={theme.colors.primary} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={[styles.masterTitle, { color: theme.colors.textPrimary }]}>
                  Enable Reminders
                </Text>
                <Text style={[styles.masterSub, { color: theme.colors.textSecondary }]}>
                  Master switch for all local learning notifications
                </Text>
              </View>
            </View>

            <Switch
              value={masterEnabled}
              onValueChange={toggleMasterNotifications}
              trackColor={{
                false: theme.colors.divider,
                true: `${theme.colors.primary}80`,
              }}
              thumbColor={masterEnabled ? theme.colors.primary : '#FFFFFF'}
            />
          </View>
        </SettingsSection>

        {/* Individual Reminders */}
        {masterEnabled && (
          <SettingsSection title="Scheduled Reminders" icon="alarm-outline">
            {/* 1. Daily Learning Reminder */}
            <NotificationReminderRow
              icon="book-outline"
              iconColor="#2563EB"
              title="Daily Learning Reminder"
              subtitle="Remind me to continue active course and modules"
              enabled={preferences?.learning_reminder_enabled ?? true}
              time24={preferences?.learning_reminder_time ?? '19:00'}
              onToggle={(val) => updateLearningReminder(val)}
              onPressTime={() =>
                openTimePicker('learning', 'Daily Learning Reminder', preferences?.learning_reminder_time ?? '19:00')
              }
            />

            {/* 2. Daily Goal Reminder */}
            <NotificationReminderRow
              icon="flag-outline"
              iconColor="#16A34A"
              title="Daily Goals Reminder"
              subtitle="Alerts if today's goals remain incomplete before night"
              enabled={preferences?.goal_reminder_enabled ?? true}
              time24={preferences?.goal_reminder_time ?? '20:30'}
              onToggle={(val) => updateGoalReminder(val)}
              onPressTime={() =>
                openTimePicker('goal', 'Daily Goals Reminder', preferences?.goal_reminder_time ?? '20:30')
              }
            />

            {/* 3. Streak Reminder */}
            <NotificationReminderRow
              icon="flame-outline"
              iconColor="#E53935"
              title="Streak Protection Reminder"
              subtitle="Triggered if no learning activity has been logged today"
              enabled={preferences?.streak_reminder_enabled ?? true}
              time24={preferences?.streak_reminder_time ?? '21:00'}
              onToggle={(val) => updateStreakReminder(val)}
              onPressTime={() =>
                openTimePicker('streak', 'Streak Protection Reminder', preferences?.streak_reminder_time ?? '21:00')
              }
            />

            {/* 4. Practice Reminder */}
            <NotificationReminderRow
              icon="code-slash-outline"
              iconColor="#0284C7"
              title="Practice Dojo Reminder"
              subtitle="Alerts if practice questions goal is waiting"
              enabled={preferences?.practice_reminder_enabled ?? true}
              time24={preferences?.practice_reminder_time ?? '18:30'}
              onToggle={(val) => updatePracticeReminder(val)}
              onPressTime={() =>
                openTimePicker('practice', 'Practice Dojo Reminder', preferences?.practice_reminder_time ?? '18:30')
              }
            />

            {/* 5. Daily Motivation */}
            <NotificationReminderRow
              icon="sunny-outline"
              iconColor="#FFB300"
              title="Daily Motivation Message"
              subtitle="Morning inspiration dispatch from the Grand Line"
              enabled={preferences?.motivation_notification_enabled ?? true}
              time24={preferences?.motivation_notification_time ?? '08:00'}
              onToggle={(val) => updateMotivationReminder(val)}
              onPressTime={() =>
                openTimePicker('motivation', 'Daily Motivation Message', preferences?.motivation_notification_time ?? '08:00')
              }
              isLast={true}
            />
          </SettingsSection>
        )}

        {/* Section 3: Diagnostic / Test Notification */}
        <SettingsSection title="Testing & Verification" icon="shield-checkmark-outline">
          <View style={styles.testContainer}>
            <TouchableOpacity
              style={[styles.testBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleTestNotification}
              disabled={testSending}
              activeOpacity={0.8}
            >
              {testSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.testBtnText}>SEND TEST NOTIFICATION</Text>
                </>
              )}
            </TouchableOpacity>
            <Text style={[styles.testNote, { color: theme.colors.textSecondary }]}>
              Triggers a real local Android notification immediately. Tap the notification in your status bar to verify deep-linking.
            </Text>
          </View>
        </SettingsSection>

        {/* Offline & Battery Guarantee Box */}
        <View style={styles.offlineBox}>
          <Ionicons name="battery-charging-outline" size={18} color="#10B981" />
          <Text style={[styles.offlineText, { color: theme.colors.textSecondary }]}>
            100% Offline-First. Notifications use Android standard alarms. Zero cloud servers, zero background battery drain, and zero data tracking.
          </Text>
        </View>
      </ScrollView>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={activePickerKey !== null}
        initialTime={activePickerTime}
        title={activePickerTitle}
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
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
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
  heroBanner: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  heroSub: {
    fontSize: 12,
    marginTop: 2,
  },
  statusCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusTextCol: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  permissionActionBtn: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permissionActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  masterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  masterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  masterTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  masterSub: {
    fontSize: 12,
    marginTop: 2,
  },
  testContainer: {
    padding: 16,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
    marginBottom: 10,
  },
  testBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  testNote: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  offlineBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    marginTop: 4,
  },
  offlineText: {
    fontSize: 11,
    marginLeft: 10,
    flex: 1,
    lineHeight: 16,
  },
});
