import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { SettingsSection, SettingsInfoRow } from '../../components/settings';
import { useTheme } from '../../theme/ThemeContext';

export const AboutScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { theme } = useTheme();

  // Read app version dynamically from app configuration
  let appVersion = '1.0.0';
  let appSlug = 'one-piece-learning-roadmap';
  try {
    const appConfig = require('../../../app.json');
    appVersion = appConfig?.expo?.version || '1.0.0';
    appSlug = appConfig?.expo?.slug || 'one-piece-learning-roadmap';
  } catch {
    // fallback default
  }

  const features = [
    { title: '14 Comprehensive Roadmaps', desc: 'Python, DSA, SQL, Git, Linux, Django, Machine Learning, and more', icon: 'map-outline' },
    { title: 'Interactive Practice Dojo', desc: 'Curated technical problems across 10 subject domains', icon: 'code-slash-outline' },
    { title: 'Progress Analytics', desc: 'Real-time completion metrics, activity heatmap, and streak tracking', icon: 'bar-chart-outline' },
    { title: 'Nautical Markdown Notes', desc: 'Create, edit, and retain personal study notes offline', icon: 'create-outline' },
    { title: 'Daily Motivation Engine', desc: 'Rotating inspirational wisdom and milestone achievements', icon: 'sparkles-outline' },
    { title: 'Developer & AI Dispatches', desc: 'Curated tech and developer news cached for offline access', icon: 'newspaper-outline' },
  ];

  return (
    <AppShell title="ABOUT APPLICATION">
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

        {/* Hero Banner */}
        <View style={[styles.heroCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={[styles.logoEmblem, { backgroundColor: `${theme.colors.secondary}15`, borderColor: theme.colors.secondary }]}>
            <Ionicons name="compass" size={44} color={theme.colors.secondary} />
          </View>
          <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>
            ONE PIECE LEARNING ROADMAP
          </Text>
          <Text style={[styles.editionTag, { color: theme.colors.primary }]}>
            GRAND LINE EDITION
          </Text>
          <Text style={[styles.appMission, { color: theme.colors.textSecondary }]}>
            An offline-first educational adventure application designed to master programming, data structures, systems, and engineering roadmaps.
          </Text>
        </View>

        {/* Section 1: Build Information */}
        <SettingsSection title="System Information" icon="information-circle-outline">
          <SettingsInfoRow
            icon="git-branch-outline"
            label="Application Version"
            value={`v${appVersion}`}
            subValue="Build 1.0.0"
          />
          <SettingsInfoRow
            icon="cube-outline"
            label="Package Slug"
            value={appSlug}
          />
          <SettingsInfoRow
            icon="server-outline"
            label="Storage Architecture"
            value="Offline-First SQLite Vault"
          />
          <SettingsInfoRow
            icon="hardware-chip-outline"
            label="Platform Runtime"
            value="React Native & Expo"
            isLast={true}
          />
        </SettingsSection>

        {/* Section 2: Core Capabilities */}
        <SettingsSection title="Core Capabilities" icon="list-outline">
          {features.map((f, idx) => (
            <View
              key={f.title}
              style={[
                styles.featureRow,
                idx < features.length - 1 && [styles.borderBottom, { borderBottomColor: theme.colors.divider }],
              ]}
            >
              <View style={[styles.featureIconBox, { backgroundColor: `${theme.colors.primary}12` }]}>
                <Ionicons name={f.icon as any} size={18} color={theme.colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: theme.colors.textPrimary }]}>{f.title}</Text>
                <Text style={[styles.featureDesc, { color: theme.colors.textSecondary }]}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </SettingsSection>

        {/* Section 3: Privacy Transparency */}
        <SettingsSection title="Privacy & Security" icon="shield-checkmark-outline">
          <View style={styles.privacyContent}>
            <Text style={[styles.privacyHeadline, { color: theme.colors.textPrimary }]}>
              PRIVACY PROMISE
            </Text>
            <Text style={[styles.privacyBody, { color: theme.colors.textSecondary }]}>
              Your core learning data—including study notes, topic completion timestamps, streaks, daily goals, and practice logs—is stored strictly on this device inside your private local SQLite database.
            </Text>
            <Text style={[styles.privacyBody, { color: theme.colors.textSecondary, marginTop: 8 }]}>
              News features may communicate with external technology RSS/JSON feeds when internet access is enabled. External websites opened from the News section are controlled by their respective publishers.
            </Text>
          </View>
        </SettingsSection>

        {/* Section 4: Open Source Attribution */}
        <SettingsSection title="Open Source Libraries" icon="code-outline">
          <View style={styles.libContent}>
            <Text style={[styles.libText, { color: theme.colors.textSecondary }]}>
              Built with React Native, Expo, Expo-SQLite, React, TypeScript, and Ionicons vector iconography.
            </Text>
          </View>
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
  heroCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  logoEmblem: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  editionTag: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 4,
    marginBottom: 10,
  },
  appMission: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
  },
  featureIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  featureDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  privacyContent: {
    padding: 16,
  },
  privacyHeadline: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  privacyBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  libContent: {
    padding: 16,
  },
  libText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
