import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useSettingsViewModel } from '../../hooks/useSettingsViewModel';
import { AVATAR_OPTIONS, AvatarOption } from '../../models/Settings';
import { useTheme } from '../../theme/ThemeContext';

export const ProfileSettingsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const { profile, saveProfile } = useSettingsViewModel();
  const { theme } = useTheme();

  const [displayName, setDisplayName] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>('compass');
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name);
      setSelectedAvatar(profile.avatar_type || 'compass');
    }
  }, [profile]);

  const activeAvatarObj =
    AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Invalid Name', 'Please enter a valid display name for your captain profile.');
      return;
    }

    try {
      setSaving(true);
      await saveProfile(displayName.trim(), selectedAvatar);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell title="MY PROFILE">
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

        {/* Profile Avatar Card Preview */}
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatarLargeCircle,
              { backgroundColor: `${theme.colors.primary}18`, borderColor: theme.colors.secondary },
            ]}
          >
            <Text style={styles.avatarLargeEmoji}>{activeAvatarObj.symbol}</Text>
          </View>
          <Text style={[styles.previewName, { color: theme.colors.textPrimary }]}>
            {displayName || 'Grand Line Scholar'}
          </Text>
          <Text style={[styles.avatarRole, { color: theme.colors.secondary }]}>
            {activeAvatarObj.name.toUpperCase()}
          </Text>
          <Text style={[styles.avatarDesc, { color: theme.colors.textSecondary }]}>
            "{activeAvatarObj.description}"
          </Text>
        </View>

        {/* Display Name Input */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            CAPTAIN / DISPLAY NAME
          </Text>
          <View
            style={[
              styles.inputBox,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color={theme.colors.primary}
              style={{ marginRight: 10 }}
            />
            <TextInput
              style={[styles.input, { color: theme.colors.textPrimary }]}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.textTertiary}
              maxLength={30}
              autoCapitalize="words"
            />
          </View>
        </View>

        {/* Choose Adventure Avatar */}
        <View style={styles.sectionBlock}>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            CHOOSE YOUR ADVENTURE CREST
          </Text>
          <View style={styles.avatarGrid}>
            {AVATAR_OPTIONS.map((item: AvatarOption) => {
              const isSelected = item.id === selectedAvatar;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.avatarGridItem,
                    {
                      backgroundColor: isSelected
                        ? `${theme.colors.primary}15`
                        : theme.colors.surface,
                      borderColor: isSelected
                        ? theme.colors.primary
                        : theme.colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedAvatar(item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.avatarSymbol}>{item.symbol}</Text>
                  <Text
                    style={[
                      styles.avatarGridName,
                      {
                        color: isSelected
                          ? theme.colors.primary
                          : theme.colors.textPrimary,
                        fontWeight: isSelected ? '800' : '600',
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.activeCheck}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={theme.colors.primary}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          <Ionicons
            name={saveSuccess ? 'checkmark-circle' : 'save-outline'}
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.saveBtnText}>
            {saving ? 'SAVING...' : saveSuccess ? 'SAVED TO LOCAL VAULT!' : 'SAVE PROFILE'}
          </Text>
        </TouchableOpacity>

        {/* Local Storage Privacy Note */}
        <View style={styles.noteBox}>
          <Ionicons name="shield-checkmark-outline" size={16} color="#10B981" />
          <Text style={[styles.noteText, { color: theme.colors.textSecondary }]}>
            100% Offline-First. Your profile name and avatar are stored strictly inside your local device SQLite vault.
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
  previewCard: {
    alignItems: 'center',
    padding: 22,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  avatarLargeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarLargeEmoji: {
    fontSize: 42,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  avatarRole: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 4,
  },
  avatarDesc: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    fontStyle: 'italic',
    paddingHorizontal: 16,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  avatarGridItem: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  avatarSymbol: {
    fontSize: 30,
    marginBottom: 6,
  },
  avatarGridName: {
    fontSize: 12,
    textAlign: 'center',
  },
  activeCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  noteText: {
    fontSize: 11,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
});
