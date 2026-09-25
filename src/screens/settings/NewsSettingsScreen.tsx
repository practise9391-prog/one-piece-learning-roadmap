import React, { useState } from 'react';
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
import {
  SettingsSection,
  SettingsSwitch,
  SettingsInfoRow,
} from '../../components/settings';
import { useTheme } from '../../theme/ThemeContext';

export const NewsSettingsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const {
    newsPrefs,
    newsCacheStats,
    saveNewsPreferences,
    clearNewsCache,
  } = useSettingsViewModel();
  const { theme } = useTheme();

  const [clearing, setClearing] = useState<boolean>(false);

  const categories = [
    { key: 'TECH', label: 'Technology', icon: 'hardware-chip-outline' },
    { key: 'AI', label: 'Artificial Intelligence', icon: 'sparkles-outline' },
    { key: 'DEVELOPER', label: 'Developer & Code', icon: 'code-slash-outline' },
    { key: 'STOCKS', label: 'Finance & Markets', icon: 'trending-up-outline' },
    { key: 'EDUCATION', label: 'Study & Learning', icon: 'school-outline' },
    { key: 'TRENDS', label: 'Industry Trends', icon: 'planet-outline' },
  ];

  const handleToggleCategory = (catKey: string, currentVal: boolean) => {
    saveNewsPreferences({
      categories: {
        ...(newsPrefs?.categories || {}),
        [catKey]: !currentVal,
      },
    });
  };

  const handleClearCacheConfirm = () => {
    Alert.alert(
      'Clear cached news?',
      'This removes downloaded news articles from your local offline cache. Bookmarked articles will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              setClearing(true);
              const deleted = await clearNewsCache(true);
              Alert.alert('Cache Cleared', `Successfully removed ${deleted} cached articles. Bookmarks were kept safe.`);
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to clear news cache.');
            } finally {
              setClearing(false);
            }
          },
        },
      ]
    );
  };

  const cacheSizeFormatted =
    newsCacheStats.estimatedBytes > 1024 * 1024
      ? `${(newsCacheStats.estimatedBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(newsCacheStats.estimatedBytes / 1024)} KB`;

  return (
    <AppShell title="NEWS PREFERENCES">
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

        {/* Section 1: Feed Categories */}
        <SettingsSection title="Enabled Categories" icon="newspaper-outline">
          {categories.map((c, idx) => {
            const isEnabled = newsPrefs?.categories?.[c.key] ?? true;
            return (
              <SettingsSwitch
                key={c.key}
                title={c.label}
                icon={c.icon as any}
                value={isEnabled}
                onValueChange={() => handleToggleCategory(c.key, isEnabled)}
                isLast={idx === categories.length - 1}
              />
            );
          })}
        </SettingsSection>

        {/* Section 2: Sync & Connectivity */}
        <SettingsSection title="Sync & Network" icon="cloud-download-outline">
          <SettingsSwitch
            title="Refresh Automatically"
            subtitle="Fetch fresh dispatches when connecting to the Grand Line network"
            icon="sync-outline"
            value={newsPrefs?.refresh_automatically ?? true}
            onValueChange={(val) => saveNewsPreferences({ refresh_automatically: val })}
          />

          <SettingsSwitch
            title="Use Wi-Fi Only"
            subtitle="Conserve mobile data when updating online feeds (simulated offline-safe)"
            icon="wifi-outline"
            value={newsPrefs?.use_wifi_only ?? false}
            onValueChange={(val) => saveNewsPreferences({ use_wifi_only: val })}
          />

          <SettingsSwitch
            title="Offline Cache Articles"
            subtitle="Keep articles locally for instant reading without internet"
            icon="archive-outline"
            value={newsPrefs?.cache_articles ?? true}
            onValueChange={(val) => saveNewsPreferences({ cache_articles: val })}
            isLast={true}
          />
        </SettingsSection>

        {/* Section 3: News Cache Management */}
        <SettingsSection title="News Cache Storage" icon="server-outline">
          <SettingsInfoRow
            icon="documents-outline"
            label="Stored Articles"
            value={newsCacheStats.storedArticles}
          />

          <SettingsInfoRow
            icon="pie-chart-outline"
            label="Estimated Cache Footprint"
            value={cacheSizeFormatted}
            isLast={true}
          />

          <View style={styles.clearBtnContainer}>
            <TouchableOpacity
              style={[styles.clearBtn, { borderColor: theme.colors.error }]}
              onPress={handleClearCacheConfirm}
              disabled={clearing || newsCacheStats.storedArticles === 0}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.error} style={{ marginRight: 6 }} />
              <Text style={[styles.clearBtnText, { color: theme.colors.error }]}>
                {clearing ? 'CLEARING...' : 'CLEAR NEWS CACHE'}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.clearNote, { color: theme.colors.textTertiary }]}>
              Leaves your bookmarked articles untouched.
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
  clearBtnContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    width: '100%',
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  clearNote: {
    fontSize: 11,
    marginTop: 8,
  },
});
