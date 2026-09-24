import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Header } from '../components/Header';
import { CourseRoadmap } from '../components/roadmap';
import { CourseWelcomeView } from '../components/welcome';
import { useAppNavigation } from '../navigation/NavigationContext';
import { roadmapService } from '../services/RoadmapService';
import { courseRepository } from '../repositories/CourseRepository';
import { Course } from '../models/Course';
import { Module } from '../models/Module';
import { Colors } from '../theme/colors';

export const CourseDetailsScreen: React.FC = () => {
  const { currentScreen, params, goBack, navigate } = useAppNavigation();
  const courseId = params?.courseId || 'python';

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStartingJourney, setIsStartingJourney] = useState<boolean>(false);

  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await roadmapService.getCourseWithModules(courseId);
      setCourse(data.course);
      setModules(data.modules);
    } catch (err) {
      console.error('Failed to load course details from SQLite:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (currentScreen === 'CourseRoadmap') {
      loadCourseData();
    }
  }, [currentScreen, loadCourseData]);

  const handleSelectModule = (mod: Module) => {
    navigate('ModuleDetails', { courseId, moduleId: mod.id });
  };

  const handleStartJourney = async () => {
    if (!course) return;
    try {
      setIsStartingJourney(true);
      const updated = await courseRepository.startJourney(course.id);
      setCourse(updated);
    } catch (err) {
      console.error('Failed to start journey in SQLite:', err);
    } finally {
      setIsStartingJourney(false);
    }
  };

  const handleViewCelebration = () => {
    navigate('CourseCompletion', { courseId });
  };

  if (loading && !course) {
    return (
      <View style={styles.container}>
        <Header title="Adventure Roadmap" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Charting Grand Line Coordinates...</Text>
        </View>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.container}>
        <Header title="Course Not Found" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>This course island could not be located in SQLite.</Text>
        </View>
      </View>
    );
  }

  // 1. First-time vs Returning User Check:
  // If not started yet and introduction not completed, show Welcome Experience
  const isFirstTime = !course.started_at && !course.introduction_completed && course.completed_modules === 0;

  if (isFirstTime) {
    return (
      <View style={styles.container}>
        <Header
          title={course.name}
          subtitle="New Territory Discovered"
          showBack
          onBackPress={goBack}
        />
        {isStartingJourney ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Setting Sail on the Grand Line...</Text>
          </View>
        ) : (
          <CourseWelcomeView
            course={course}
            onStartJourney={handleStartJourney}
            onSkip={handleStartJourney}
          />
        )}
      </View>
    );
  }

  // 2. Returning User: Show Roadmap directly
  return (
    <View style={styles.container}>
      <Header
        title={course.name}
        subtitle={`Island #${course.order} Roadmap`}
        showBack
        onBackPress={goBack}
      />
      <CourseRoadmap
        course={course}
        modules={modules}
        onSelectModule={handleSelectModule}
        onViewCelebration={handleViewCelebration}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
});
