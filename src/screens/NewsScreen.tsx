import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../components/navigation/AppShell';
import { useAppNavigation } from '../navigation/NavigationContext';
import { Colors } from '../theme/colors';

export const NewsScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  return (
    <AppShell title="NEWS">
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="newspaper-outline" size={44} color="#2563EB" />
          </View>
          <Text style={styles.title}>Developer Dispatch</Text>
          <Text style={styles.subtitle}>Tech & AI Headlines</Text>
          <Text style={styles.description}>
            Curated developer updates, breakthrough AI models, and technology industry news will be featured here when connected to the network.
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
    backgroundColor: '#EFF6FF',
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
    color: '#2563EB',
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
