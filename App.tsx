import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProvider } from './src/navigation/NavigationContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { dbManager } from './src/database/DatabaseManager';
import { Colors } from './src/theme/colors';

export default function App() {
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const initDatabase = async () => {
    try {
      setDbError(null);
      await dbManager.getDatabase();
      setDbReady(true);
    } catch (err: any) {
      console.error('Database initialization failed:', err);
      setDbError(err?.message || 'Failed to initialize local SQLite database');
    }
  };

  useEffect(() => {
    initDatabase();
  }, []);

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

  if (!dbReady) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <View style={styles.loadingBox}>
          <View style={styles.skullBadge}>
            <Ionicons name="compass" size={44} color={Colors.secondary} />
          </View>
          <Text style={styles.loadingTitle}>One Piece Learning Roadmap</Text>
          <Text style={styles.loadingSubtitle}>Setting Sail on the Grand Line...</Text>
          <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
          <Text style={styles.loadingDetail}>Initializing local SQLite database</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.appContainer}>
      <StatusBar style="light" />
      <NavigationProvider>
        <AppNavigator />
      </NavigationProvider>
    </SafeAreaView>
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
  loadingBox: {
    alignItems: 'center',
  },
  skullBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 179, 0, 0.4)',
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: Colors.secondary,
    fontWeight: '600',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  spinner: {
    marginVertical: 24,
  },
  loadingDetail: {
    fontSize: 12,
    color: '#94A3B8',
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
