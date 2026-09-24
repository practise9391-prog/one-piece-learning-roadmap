import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../components/navigation/AppShell';
import { useAppNavigation } from '../navigation/NavigationContext';
import { Colors } from '../theme/colors';

export const MotivationScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  return (
    <AppShell title="MOTIVATION">
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="flame" size={44} color="#D97706" />
          </View>
          <Text style={styles.title}>Will of the Explorer</Text>
          <Text style={styles.subtitle}>Daily Grit & Philosophy</Text>
          <Text style={styles.quote}>
            "If you don't take risks, you can't create a future. Every line of code written is an island charted."
          </Text>
          <Text style={styles.author}>— Grand Line Captain</Text>

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
    color: '#D97706',
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 20,
    marginVertical: 16,
  },
  author: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 20,
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
