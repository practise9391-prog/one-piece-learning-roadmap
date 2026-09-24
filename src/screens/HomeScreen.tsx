import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { CourseCard } from '../components/CourseCard';
import { OnePieceBadge } from '../components/OnePieceBadge';
import { ActionButton } from '../components/ActionButton';
import { useAppNavigation } from '../navigation/NavigationContext';
import { roadmapService } from '../services/RoadmapService';
import { Course } from '../models/Course';
import { Colors } from '../theme/colors';

export const HomeScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadCourses = useCallback(async () => {
    try {
      const data = await roadmapService.getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses from SQLite:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses();
  };

  const totalCourses = courses.length;
  const completedCourses = courses.filter((c) => c.is_completed).length;
  const totalModules = courses.reduce((acc, c) => acc + c.total_modules, 0);
  const completedModules = courses.reduce((acc, c) => acc + c.completed_modules, 0);

  const renderHeader = () => (
    <View style={styles.listHeaderContainer}>
      {/* Visual Identity Banner */}
      <View style={styles.strawHatBanner}>
        <View style={styles.bannerRow}>
          <View style={styles.crestCircle}>
            <Ionicons name="skull" size={28} color={Colors.primary} />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>Grand Line Voyage</Text>
            <Text style={styles.bannerSub}>
              Conquer 14 Engineering & Core Knowledge Islands
            </Text>
          </View>
        </View>

        {/* Grand Line Summary Metrics */}
        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{totalCourses}</Text>
            <Text style={styles.metricLbl}>Islands</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{completedCourses}</Text>
            <Text style={styles.metricLbl}>Mastered</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{completedModules}</Text>
            <Text style={styles.metricLbl}>Modules Done</Text>
          </View>
        </View>
      </View>

      {/* Database Vault Test Screen Entry Card */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => navigate('DatabaseTest')}
        style={styles.vaultEntryCard}
      >
        <View style={styles.vaultLeft}>
          <View style={styles.vaultIconCircle}>
            <Ionicons name="server-outline" size={24} color={Colors.primary} />
          </View>
          <View style={styles.vaultTextContainer}>
            <View style={styles.vaultBadgeRow}>
              <Text style={styles.vaultTitle}>Database Vault Test Screen</Text>
              <OnePieceBadge label="Part 1 Proof" variant="primary" />
            </View>
            <Text style={styles.vaultSub}>
              Verify local SQLite persistence: add courses, mark modules, write notes & test reload.
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
      </TouchableOpacity>

      {/* Future Screen Quick Launchers (Demonstrates scalable architecture) */}
      <View style={styles.shortcutsRow}>
        <TouchableOpacity
          style={styles.shortcutChip}
          onPress={() => navigate('Dashboard')}
        >
          <Ionicons name="grid-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.shortcutText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shortcutChip}
          onPress={() => navigate('Statistics')}
        >
          <Ionicons name="pie-chart-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.shortcutText}>Stats</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shortcutChip}
          onPress={() => navigate('Notes')}
        >
          <Ionicons name="book-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.shortcutText}>Notes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.shortcutChip}
          onPress={() => navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.shortcutText}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Section Title */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Course Roadmaps in SQLite</Text>
        <Text style={styles.sectionSubtitle}>
          {courses.length} seeded islands loaded from local database
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="One Piece Learning Roadmap"
        subtitle="Grand Line Path to Mastery"
        rightAction={
          <TouchableOpacity onPress={() => navigate('DatabaseTest')}>
            <Ionicons name="shield-checkmark" size={24} color={Colors.secondary} />
          </TouchableOpacity>
        }
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading SQLite Database...</Text>
        </View>
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() => navigate('CourseRoadmap', { courseId: item.id })}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  listHeaderContainer: {
    marginBottom: 12,
  },
  strawHatBanner: {
    backgroundColor: Colors.oceanDepths,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  crestCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  bannerSub: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  metricGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metricCard: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textInverse,
  },
  metricLbl: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  vaultEntryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 14,
  },
  vaultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  vaultIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  vaultTextContainer: {
    flex: 1,
  },
  vaultBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  vaultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  vaultSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shortcutChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginLeft: 6,
  },
  sectionTitleRow: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

