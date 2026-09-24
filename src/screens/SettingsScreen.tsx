import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../components/navigation/AppShell';
import { useAppNavigation } from '../navigation/NavigationContext';
import { Colors } from '../theme/colors';

export const SettingsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  return (
    <AppShell title="SETTINGS">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Section 1: Appearance */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>APPEARANCE</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon-outline" size={20} color={Colors.primary} />
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Theme</Text>
                <Text style={styles.settingSub}>Dark Pirate Voyage (Active)</Text>
              </View>
            </View>
            <Ionicons name="checkmark-circle" size={20} color={Colors.secondary} />
          </View>
        </View>

        {/* Section 2: Notifications */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color="#2563EB" />
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Daily Study Reminders</Text>
                <Text style={styles.settingSub}>Remind at 09:00 AM (Coming soon)</Text>
              </View>
            </View>
            <Switch value={false} disabled={true} />
          </View>
        </View>

        {/* Section 3: Learning Goals */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>LEARNING</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="flag-outline" size={20} color="#16A34A" />
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Daily Module Goal</Text>
                <Text style={styles.settingSub}>1 module per day</Text>
              </View>
            </View>
            <Text style={styles.goalPill}>1 / Day</Text>
          </View>
        </View>

        {/* Section 4: Data & Local Storage */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>DATA & STORAGE</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="server-outline" size={20} color="#D97706" />
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>SQLite Vault Engine</Text>
                <Text style={styles.settingSub}>onepiece_roadmap.db (Online)</Text>
              </View>
            </View>
            <View style={styles.connectedBadge}>
              <Text style={styles.connectedText}>Connected</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingActionRow}
            activeOpacity={0.7}
            onPress={() => navigate('DatabaseTest')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.primary} />
              <View style={styles.settingTextCol}>
                <Text style={styles.settingActionTitle}>Database Test Screen</Text>
                <Text style={styles.settingSub}>Developer persistence vault verification</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.settingActionRow}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Backup Data', 'Database backup and JSON export will be available in Part 7.')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="cloud-upload-outline" size={20} color="#94A3B8" />
              <View style={styles.settingTextCol}>
                <Text style={styles.settingActionTitle}>Backup & Export</Text>
                <Text style={styles.settingSub}>Export progress and notes to JSON</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Section 5: About */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>ABOUT</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={20} color="#64748B" />
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Application Version</Text>
                <Text style={styles.settingSub}>1.0.0 (Grand Line Edition)</Text>
              </View>
            </View>
            <Text style={styles.versionTag}>v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 36,
  },
  sectionHeaderRow: {
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextCol: {
    marginLeft: 12,
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  settingSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  goalPill: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: '#FEF2F2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  connectedBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  connectedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  versionTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
});
