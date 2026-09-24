import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../components/navigation/AppShell';
import { useAppNavigation } from '../navigation/NavigationContext';
import { Colors } from '../theme/colors';

export const PracticeScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  return (
    <AppShell title="PRACTICE">
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="code-slash" size={44} color={Colors.secondary} />
          </View>
          <Text style={styles.title}>Practice Arena</Text>
          <Text style={styles.subtitle}>Curated Bounty Challenges</Text>
          <Text style={styles.description}>
            Practice center is coming in the next update. It will integrate problem sets from LeetCode, HackerRank, and GeeksforGeeks mapped island-by-island.
          </Text>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigate('Dashboard')}
            activeOpacity={0.8}
          >
            <Text style={styles.backButtonText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
    maxWidth: 360,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: 16,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
