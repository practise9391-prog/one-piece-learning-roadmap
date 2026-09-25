import { useState, useEffect, useCallback } from 'react';
import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { settingsRepository } from '../repositories/SettingsRepository';
import { dataManagementRepository } from '../repositories/DataManagementRepository';
import { courseRepository } from '../repositories/CourseRepository';
import { Course } from '../models/Course';
import {
  UserProfile,
  LearningPreferences,
  DailyGoalPreferences,
  PracticePreferences,
  NewsPreferencesSettings,
  MotivationPreferences,
  AppearancePreferences,
  NotificationPreferences,
  SoundPreferences,
  DatabaseStatistics,
  BackupPayload,
  BackupValidationResult,
  ThemeMode,
} from '../models/Settings';
import { useTheme } from '../theme/ThemeContext';

export function useSettingsViewModel() {
  const { theme, themeId, setThemeId, reducedMotion, setReducedMotion } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [learningPrefs, setLearningPrefs] = useState<LearningPreferences | null>(null);
  const [goalPrefs, setGoalPrefs] = useState<DailyGoalPreferences | null>(null);
  const [practicePrefs, setPracticePrefs] = useState<PracticePreferences | null>(null);
  const [newsPrefs, setNewsPrefs] = useState<NewsPreferencesSettings | null>(null);
  const [motivationPrefs, setMotivationPrefs] = useState<MotivationPreferences | null>(null);
  const [appearancePrefs, setAppearancePrefs] = useState<AppearancePreferences | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences | null>(null);
  const [soundPrefs, setSoundPrefs] = useState<SoundPreferences | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStatistics | null>(null);
  const [newsCacheStats, setNewsCacheStats] = useState<{ storedArticles: number; estimatedBytes: number }>({
    storedArticles: 0,
    estimatedBytes: 0,
  });

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [
        p,
        cList,
        lPrefs,
        gPrefs,
        prPrefs,
        nPrefs,
        mPrefs,
        aPrefs,
        notifPrefs,
        sndPrefs,
        stats,
        ncStats,
      ] = await Promise.all([
        settingsRepository.getUserProfile(),
        courseRepository.getAll(),
        settingsRepository.getLearningPreferences(),
        settingsRepository.getDailyGoalPreferences(),
        settingsRepository.getPracticePreferences(),
        settingsRepository.getNewsPreferences(),
        settingsRepository.getMotivationPreferences(),
        settingsRepository.getAppearancePreferences(),
        settingsRepository.getNotificationPreferences(),
        settingsRepository.getSoundPreferences(),
        dataManagementRepository.getDatabaseStatistics(),
        settingsRepository.getNewsCacheStats(),
      ]);

      setProfile(p);
      setCourses(cList);
      setLearningPrefs(lPrefs);
      setGoalPrefs(gPrefs);
      setPracticePrefs(prPrefs);
      setNewsPrefs(nPrefs);
      setMotivationPrefs(mPrefs);
      setAppearancePrefs(aPrefs);
      setNotificationPrefs(notifPrefs);
      setSoundPrefs(sndPrefs);
      setDbStats(stats);
      setNewsCacheStats(ncStats);
    } catch (err) {
      console.error('Failed to load settings data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // --- Profile Actions ---
  const saveProfile = async (displayName: string, avatarType: string) => {
    const updated = await settingsRepository.updateUserProfile(displayName, avatarType);
    setProfile(updated);
    return updated;
  };

  // --- Learning Preferences Actions ---
  const saveLearningPreferences = async (prefs: Partial<LearningPreferences>) => {
    await settingsRepository.updateLearningPreferences(prefs);
    setLearningPrefs((prev) => (prev ? { ...prev, ...prefs } : null));
  };

  // --- Daily Goal Actions ---
  const saveDailyGoals = async (goals: Partial<DailyGoalPreferences>) => {
    await settingsRepository.updateDailyGoalPreferences(goals);
    setGoalPrefs((prev) => (prev ? { ...prev, ...goals } : null));
  };

  // --- Practice Preferences Actions ---
  const savePracticePreferences = async (prefs: Partial<PracticePreferences>) => {
    await settingsRepository.updatePracticePreferences(prefs);
    setPracticePrefs((prev) => (prev ? { ...prev, ...prefs } : null));
  };

  // --- News Preferences Actions ---
  const saveNewsPreferences = async (prefs: Partial<NewsPreferencesSettings>) => {
    await settingsRepository.updateNewsPreferences(prefs);
    setNewsPrefs((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        ...prefs,
        categories: { ...prev.categories, ...(prefs.categories || {}) },
      };
    });
  };

  const clearNewsCache = async (preserveBookmarks: boolean = true) => {
    const deletedCount = await settingsRepository.clearNewsCache(preserveBookmarks);
    const ncStats = await settingsRepository.getNewsCacheStats();
    const stats = await dataManagementRepository.getDatabaseStatistics();
    setNewsCacheStats(ncStats);
    setDbStats(stats);
    return deletedCount;
  };

  // --- Motivation Preferences Actions ---
  const saveMotivationPreferences = async (prefs: Partial<MotivationPreferences>) => {
    await settingsRepository.updateMotivationPreferences(prefs);
    setMotivationPrefs((prev) => (prev ? { ...prev, ...prefs } : null));
  };

  // --- Appearance Preferences Actions ---
  const saveTheme = async (mode: ThemeMode) => {
    await setThemeId(mode);
    await settingsRepository.updateAppearancePreferences({ theme_id: mode });
    setAppearancePrefs((prev) => (prev ? { ...prev, theme_id: mode } : null));
  };

  const saveReducedMotion = async (val: boolean) => {
    await setReducedMotion(val);
    await settingsRepository.updateAppearancePreferences({ reduced_motion: val });
    setAppearancePrefs((prev) => (prev ? { ...prev, reduced_motion: val } : null));
  };

  const saveAnimationsEnabled = async (val: boolean) => {
    await settingsRepository.updateAppearancePreferences({ animations_enabled: val });
    setAppearancePrefs((prev) => (prev ? { ...prev, animations_enabled: val } : null));
  };

  // --- Notification Preferences (Preparation) ---
  const saveNotificationPreferences = async (prefs: Partial<NotificationPreferences>) => {
    await settingsRepository.updateNotificationPreferences(prefs);
    setNotificationPrefs((prev) => (prev ? { ...prev, ...prefs } : null));
  };

  // --- Sound Preferences (Preparation) ---
  const saveSoundPreferences = async (prefs: Partial<SoundPreferences>) => {
    await settingsRepository.updateSoundPreferences(prefs);
    setSoundPrefs((prev) => (prev ? { ...prev, ...prefs } : null));
  };

  // --- Data Management Actions ---
  const exportBackupJson = async (): Promise<string> => {
    const payload = await dataManagementRepository.exportUserData();
    return JSON.stringify(payload, null, 2);
  };

  const shareBackup = async (): Promise<boolean> => {
    try {
      const json = await exportBackupJson();
      await Share.share({
        title: 'One Piece Learning Roadmap Backup',
        message: json,
      });
      return true;
    } catch (err) {
      console.warn('Share backup error:', err);
      return false;
    }
  };

  const copyBackupToClipboard = async (): Promise<boolean> => {
    try {
      const json = await exportBackupJson();
      await Clipboard.setStringAsync(json);
      return true;
    } catch (err) {
      console.warn('Copy to clipboard error:', err);
      return false;
    }
  };

  const validateBackupString = (jsonString: string): BackupValidationResult => {
    return dataManagementRepository.validateBackup(jsonString);
  };

  const importBackupData = async (
    backup: BackupPayload,
    mode: 'merge' | 'replace' = 'merge'
  ): Promise<{ success: boolean; message: string }> => {
    const result = await dataManagementRepository.importBackup(backup, mode);
    if (result.success) {
      await loadAll();
    }
    return result;
  };

  const resetAllProgress = async (): Promise<{ success: boolean; message: string }> => {
    const result = await dataManagementRepository.resetProgress();
    if (result.success) {
      await loadAll();
    }
    return result;
  };

  const deleteAllLocalData = async (): Promise<{ success: boolean; message: string }> => {
    const result = await dataManagementRepository.deleteAllData();
    if (result.success) {
      await loadAll();
    }
    return result;
  };

  return {
    loading,
    profile,
    courses,
    learningPrefs,
    goalPrefs,
    practicePrefs,
    newsPrefs,
    motivationPrefs,
    appearancePrefs,
    notificationPrefs,
    soundPrefs,
    dbStats,
    newsCacheStats,
    activeTheme: theme,
    currentThemeId: themeId,
    reducedMotion,
    refreshSettings: loadAll,
    saveProfile,
    saveLearningPreferences,
    saveDailyGoals,
    savePracticePreferences,
    saveNewsPreferences,
    clearNewsCache,
    saveMotivationPreferences,
    saveTheme,
    saveReducedMotion,
    saveAnimationsEnabled,
    saveNotificationPreferences,
    saveSoundPreferences,
    exportBackupJson,
    shareBackup,
    copyBackupToClipboard,
    validateBackupString,
    importBackupData,
    resetAllProgress,
    deleteAllLocalData,
  };
}
