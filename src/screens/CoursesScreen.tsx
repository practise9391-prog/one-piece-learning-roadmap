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
import { AppShell } from '../components/navigation/AppShell';
import { CourseCard } from '../components/CourseCard';
import { useAppNavigation } from '../navigation/NavigationContext';
import { roadmapService } from '../services/RoadmapService';
import { Course } from '../models/Course';
import { Colors } from '../theme/colors';

type FilterTab = 'ALL' | 'IN_PROGRESS' | 'COMPLETED' | 'NOT_STARTED';

export const CoursesScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterTab>('ALL');
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

  const filteredCourses = courses.filter((c) => {
    if (selectedFilter === 'COMPLETED') return c.is_completed;
    if (selectedFilter === 'IN_PROGRESS') {
      return !c.is_completed && (c.started_at || c.introduction_completed || c.completed_modules > 0);
    }
    if (selectedFilter === 'NOT_STARTED') {
      return !c.is_completed && !c.started_at && !c.introduction_completed && c.completed_modules === 0;
    }
    return true;
  });

  const filterCounts = {
    ALL: courses.length,
    IN_PROGRESS: courses.filter((c) => !c.is_completed && (c.started_at || c.introduction_completed || c.completed_modules > 0)).length,
    COMPLETED: courses.filter((c) => c.is_completed).length,
    NOT_STARTED: courses.filter((c) => !c.is_completed && !c.started_at && !c.introduction_completed && c.completed_modules === 0).length,
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.titleRow}>
        <Ionicons name="boat-outline" size={24} color={Colors.primary} style={{ marginRight: 8 }} />
        <Text style={styles.titleText}>Grand Line Islands</Text>
      </View>
      <Text style={styles.subtitleText}>
        Conquer 14 software engineering disciplines one island at a time.
      </Text>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(['ALL', 'IN_PROGRESS', 'COMPLETED', 'NOT_STARTED'] as FilterTab[]).map((tab) => {
          const isActive = selectedFilter === tab;
          const label = tab === 'ALL' ? 'All' : tab === 'IN_PROGRESS' ? 'In Progress' : tab === 'COMPLETED' ? 'Completed' : 'Not Started';
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setSelectedFilter(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {label} ({filterCounts[tab]})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <AppShell title="COURSES">
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Charting Grand Line Islands...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
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
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="compass-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No courses found</Text>
              <Text style={styles.emptySub}>No course islands match the selected filter.</Text>
            </View>
          }
        />
      )}
    </AppShell>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  headerContainer: {
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  subtitleText: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 14,
    lineHeight: 18,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  filterChip: {
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
