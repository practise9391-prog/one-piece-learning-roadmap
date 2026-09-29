import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProvider } from './src/navigation/NavigationContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/theme/ThemeContext';
import { ToastProvider } from './src/components/common/GlobalToast';
import { AppSplashScreen } from './src/components/common/AppSplashScreen';
import { AppOnboardingModal } from './src/components/common/AppOnboardingModal';
import { dbManager } from './src/database/DatabaseManager';
import { settingsRepository } from './src/repositories/SettingsRepository';
import { Colors } from './src/theme/colors';

export default function App() {
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [splashFinished, setSplashFinished] = useState<boolean>(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);

  const initDatabase = async () => {
    try {
      setDbError(null);
      await dbManager.getDatabase();
      setDbReady(true);

      // Check onboarding state from SQLite
      try {
        const hasSeen = await settingsRepository.getSetting('has_seen_onboarding', 'false');
        if (hasSeen !== 'true') {
          setShowOnboarding(true);
        }
      } catch (e) {
        console.warn('[App] Check onboarding error:', e);
      }

      // Restore and verify notification schedules on launch
      import('./src/services/NotificationService').then(({ notificationService }) => {
        notificationService.rescheduleAllNotifications().catch((e) =>
          console.warn('[App] Reschedule notifications on launch error:', e)
        );
      });
    } catch (err: any) {
      console.error('Database initialization failed:', err);
      setDbError(err?.message || 'Failed to initialize local SQLite database');
    }
  };

  useEffect(() => {
    initDatabase();
  }, []);

  const handleFinishOnboarding = async () => {
    setShowOnboarding(false);
    try {
      await settingsRepository.setSetting('has_seen_onboarding', 'true');
    } catch (e) {
      console.warn('Failed to save onboarding completed state:', e);
    }
  };

  if (dbError) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.errorBox}>
          <Ionicons name="warning" size={48} color={Colors.error} />
          <Text style={styles.errorTitle}>Database Initialization Failed</Text>
          <Text style={styles.errorMessage}>{dbError}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={initDatabase}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry Database Init</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <SafeAreaView style={styles.appContainer}>
          <StatusBar style="light" />
          <NavigationProvider>
            <AppNavigator />
          </NavigationProvider>

          {/* First-time onboarding modal */}
          {showOnboarding && splashFinished && (
            <AppOnboardingModal
              visible={showOnboarding}
              onFinish={handleFinishOnboarding}
            />
          )}

          {/* Full-screen initial opening splash with real initialization state */}
          {!splashFinished && (
            <AppSplashScreen
              isReady={dbReady}
              statusMessage={dbReady ? 'Ready! Welcome aboard Captain.' : 'Preparing your learning journey...'}
              onFinish={() => setSplashFinished(true)}
            />
          )}
        </SafeAreaView>
      </ToastProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: Colors.oceanDepths,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.oceanDepths,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorBox: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.error,
    marginTop: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 18,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 14,
  },
});
