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
import { ProgressBar } from '../components/ProgressBar';
import { OnePieceBadge } from '../components/OnePieceBadge';
import { useAppNavigation } from '../navigation/NavigationContext';
import { roadmapService } from '../services/RoadmapService';
import { progressService } from '../services/ProgressService';
import { Course } from '../models/Course';
import { Module } from '../models/Module';
import { Colors } from '../theme/colors';

export const CourseDetailsScreen: React.FC = () => {
  const { params, goBack, navigate } = useAppNavigation();
  const courseId = params?.courseId || 'python';

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadCourseData = useCallback(async () => {
    try {
      const data = await roadmapService.getCourseWithModules(courseId);
      setCourse(data.course);
      setModules(data.modules);
    } catch (err) {
      console.error('Failed to load course details from SQLite:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCourseData();
  };

  const handleToggleModuleDirect = async (item: Module) => {
    try {
      if (item.is_completed) {
        const updatedCourse = await progressService.uncompleteModule(courseId, item.id);
        setCourse(updatedCourse);
      } else {
        const updatedCourse = await progressService.completeModule(courseId, item.id);
        setCourse(updatedCourse);
      }
      await loadCourseData();
    } catch (err) {
      console.error('Failed to toggle module completion:', err);
    }
  };

  const theme = Colors.courseThemes[courseId] || {
    primary: Colors.accent,
    secondary: Colors.accentLight,
    bg: Colors.surfaceHover,
  };

  const renderHeader = () => {
    if (!course) return null;

    return (
      <View style={styles.courseHeaderCard}>
        <View style={styles.badgeRow}>
          <OnePieceBadge
            label={`Island #${course.order}`}
            variant="gold"
          />
          <OnePieceBadge
            label={course.is_completed ? 'Mastered' : `${Math.round(course.progress_percentage)}% Complete`}
            variant={course.is_completed ? 'success' : 'ocean'}
          />
        </View>

        <Text style={styles.courseTitle}>{course.name}</Text>
        {course.description ? (
          <Text style={styles.courseDescription}>{course.description}</Text>
        ) : null}

        <View style={styles.progressContainer}>
          <View style={styles.progressStatsRow}>
            <Text style={styles.modulesCountText}>
              {course.completed_modules} of {course.total_modules} Modules Completed
            </Text>
            <Text style={styles.percentageText}>
              {course.progress_percentage.toFixed(0)}%
            </Text>
          </View>
          <ProgressBar
            percentage={course.progress_percentage}
            height={10}
            color={course.is_completed ? Colors.success : theme.primary}
          />
        </View>

        <View style={styles.modulesHeaderRow}>
          <Text style={styles.modulesSectionTitle}>Learning Modules</Text>
          <Text style={styles.modulesTotalCount}>{modules.length} total</Text>
        </View>
      </View>
    );
  };

  const renderModuleItem = ({ item, index }: { item: Module; index: number }) => {
    const isCompleted = item.is_completed;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigate('ModuleDetails', { courseId, moduleId: item.id })}
        style={[styles.moduleCard, isCompleted && styles.moduleCardCompleted]}
      >
        <TouchableOpacity
          onPress={() => handleToggleModuleDirect(item)}
          style={styles.checkboxButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
            size={26}
            color={isCompleted ? Colors.success : Colors.textTertiary}
          />
        </TouchableOpacity>

        <View style={styles.moduleTextContainer}>
          <View style={styles.moduleTopRow}>
            <Text style={styles.moduleOrderTag}>Module {item.order}</Text>
            {item.topic_count !== undefined && item.topic_count > 0 && (
              <View style={styles.topicCountBadge}>
                <Ionicons name="document-text-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.topicCountText}>
                  {item.completed_topic_count || 0}/{item.topic_count} topics
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[styles.moduleTitle, isCompleted && styles.moduleTitleCompleted]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.moduleDescription} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>

        <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title={course ? course.name : 'Course Roadmap'}
        subtitle="Grand Line Learning Path"
        showBack
        onBackPress={goBack}
      />

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading Roadmap Modules...</Text>
        </View>
      ) : (
        <FlatList
          data={modules}
          keyExtractor={(item) => item.id}
          renderItem={renderModuleItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
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
  centerContainer: {
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
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  courseHeaderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  courseDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceHover,
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modulesCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modulesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  modulesSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modulesTotalCount: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  moduleCardCompleted: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  checkboxButton: {
    marginRight: 12,
    padding: 2,
  },
  moduleTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  moduleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  moduleOrderTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topicCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceHover,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  topicCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  moduleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  moduleTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  moduleDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
});
