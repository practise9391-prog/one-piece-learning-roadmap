import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import {
  SettingsSection,
  SettingsSwitch,
  SettingsDropdown,
} from '../../components/settings';
import { studySessionRepository } from '../../repositories/StudySessionRepository';
import { FocusSettings } from '../../models/Focus';

export const FocusSettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<FocusSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    studySessionRepository.getFocusSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const handleUpdate = async (updates: Partial<FocusSettings>) => {
    if (!settings) return;
    const next = { ...settings, ...updates };
    setSettings(next);
    await studySessionRepository.updateFocusSettings(updates);
  };

  return (
    <AppShell title="FOCUS SETTINGS">
      {loading || !settings ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0284C7" />
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1: Default Duration */}
          <SettingsSection title="Timer Configuration" icon="timer-outline">
            <SettingsDropdown
              title="Default Focus Duration"
              subtitle="Initial duration selected when opening Focus Mode"
              icon="time-outline"
              value={String(settings.default_duration)}
              options={[
                { label: '15 Minutes (Quick Focus)', value: '15' },
                { label: '25 Minutes (Standard Focus)', value: '25' },
                { label: '45 Minutes (Deep Focus)', value: '45' },
                { label: '60 Minutes (Long Focus)', value: '60' },
                { label: '90 Minutes (Marathon Focus)', value: '90' },
              ]}
              onSelect={(val) => handleUpdate({ default_duration: parseInt(val, 10) })}
            />

            <SettingsDropdown
              title="Minimum Qualifying Duration"
              subtitle="Sessions shorter than this do not count toward daily goals or streaks"
              icon="shield-checkmark-outline"
              value={String(settings.min_qualifying_seconds)}
              options={[
                { label: '3 Minutes (180s)', value: '180' },
                { label: '5 Minutes (300s) — Recommended', value: '300' },
                { label: '10 Minutes (600s)', value: '600' },
              ]}
              onSelect={(val) => handleUpdate({ min_qualifying_seconds: parseInt(val, 10) })}
              isLast={true}
            />
          </SettingsSection>

          {/* Section 2: Completion & Feedback */}
          <SettingsSection title="Completion Alerts" icon="notifications-outline">
            <SettingsSwitch
              title="Vibration on Completion"
              subtitle="Vibrate the phone when a session finishes"
              icon="phone-portrait-outline"
              value={settings.vibration_enabled}
              onValueChange={(val) => handleUpdate({ vibration_enabled: val })}
            />

            <SettingsSwitch
              title="Sound on Completion"
              subtitle="Play a completion chime when timer reaches zero"
              icon="volume-high-outline"
              value={settings.sound_enabled}
              onValueChange={(val) => handleUpdate({ sound_enabled: val })}
            />

            <SettingsSwitch
              title="Auto-Prompt Next Session"
              subtitle="Prompt to immediately launch another session after completing one"
              icon="repeat-outline"
              value={settings.auto_start_next}
              onValueChange={(val) => handleUpdate({ auto_start_next: val })}
              isLast={true}
            />
          </SettingsSection>

          {/* Section 3: Interface Integration */}
          <SettingsSection title="Display Preferences" icon="tv-outline">
            <SettingsSwitch
              title="Show Focus Card on Dashboard"
              subtitle="Display today's focus study progress and quick launch button on the Home Dashboard"
              icon="grid-outline"
              value={settings.show_dashboard_card}
              onValueChange={(val) => handleUpdate({ show_dashboard_card: val })}
              isLast={true}
            />
          </SettingsSection>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={18} color="#0284C7" />
            <Text style={styles.infoText}>
              All focus preferences are saved locally on your Android device and operate 100% offline.
            </Text>
          </View>
        </ScrollView>
      )}
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginTop: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#0369A1',
    lineHeight: 16,
    marginLeft: 8,
    flex: 1,
  },
});
