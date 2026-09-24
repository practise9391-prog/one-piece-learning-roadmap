import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../../models/Course';
import { CourseIcon } from '../roadmap/CourseIcon';
import { Colors } from '../../theme/colors';

interface CourseWelcomeViewProps {
  course: Course;
  onStartJourney: () => void;
  onSkip?: () => void;
}

export const CourseWelcomeView: React.FC<CourseWelcomeViewProps> = ({
  course,
  onStartJourney,
  onSkip,
}) => {
  const iconScaleAnim = useRef(new Animated.Value(0.4)).current;
  const contentFadeAnim = useRef(new Animated.Value(0)).current;
  const buttonSlideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(iconScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentFadeAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(buttonSlideAnim, {
          toValue: 0,
          friction: 6,
          tension: 70,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [iconScaleAnim, contentFadeAnim, buttonSlideAnim, pulseAnim]);

  const themeMeta = Colors.courseThemes[course.theme || course.id] || {
    primary: Colors.primary,
    secondary: Colors.secondary,
    bg: '#EFF6FF',
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Nautical Compass Watermark Header */}
      <View style={styles.topBar}>
        <View style={styles.islandTagContainer}>
          <Ionicons name="compass" size={14} color={themeMeta.primary} />
          <Text style={[styles.islandTag, { color: themeMeta.primary }]}>
            GRAND LINE ISLAND #{course.order}
          </Text>
        </View>

        {onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton} activeOpacity={0.7}>
            <Text style={styles.skipText}>Skip</Text>
            <Ionicons name="arrow-forward" size={12} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Hero Animated Course Icon */}
      <View style={styles.iconContainer}>
        <Animated.View
          style={[
            styles.animatedIconWrapper,
            { transform: [{ scale: iconScaleAnim }] },
          ]}
        >
          <View style={[styles.iconHalo, { backgroundColor: `${themeMeta.primary}20` }]}>
            <CourseIcon
              courseId={course.id}
              size={64}
              showBackground
              containerStyle={styles.courseIconPill}
            />
          </View>
        </Animated.View>
      </View>

      {/* Main Content Fade In */}
      <Animated.View style={[styles.contentCard, { opacity: contentFadeAnim }]}>
        <Text style={styles.welcomeSubtitle}>WELCOME TO THE EXPEDITION</Text>
        <Text style={styles.courseTitle}>{course.name.toUpperCase()}</Text>

        <Text style={styles.courseDescription}>
          {course.description || `Your journey from beginner to ${course.name} mastery begins here.`}
        </Text>

        {/* Stats Grid */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Ionicons name="map-outline" size={20} color={themeMeta.primary} />
            <Text style={styles.statNumber}>{course.total_modules || 20}</Text>
            <Text style={styles.statLabel}>Island Modules</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="book-outline" size={20} color="#059669" />
            <Text style={styles.statNumber}>{course.total_modules * 7}+</Text>
            <Text style={styles.statLabel}>Core Topics</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="trophy-outline" size={20} color="#D97706" />
            <Text style={styles.statNumber}>100%</Text>
            <Text style={styles.statLabel}>Mastery Goal</Text>
          </View>
        </View>

        {/* Adventure Manifesto Banner */}
        <View style={styles.manifestoBanner}>
          <Ionicons name="sparkles" size={18} color="#D97706" />
          <Text style={styles.manifestoText}>
            Conquer modules sequentially. Unravel code scrolls, write notes, and conquer the Grand Line.
          </Text>
        </View>
      </Animated.View>

      {/* Animated Action Button */}
      <Animated.View
        style={[
          styles.actionButtonContainer,
          {
            transform: [
              { translateY: buttonSlideAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: themeMeta.primary }]}
          onPress={onStartJourney}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>START JOURNEY</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  islandTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  islandTag: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    gap: 4,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  iconContainer: {
    marginVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHalo: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseIconPill: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  contentCard: {
    width: '100%',
    alignItems: 'center',
  },
  welcomeSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  courseTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  courseDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  statsCard: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  manifestoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
    marginBottom: 24,
  },
  manifestoText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
    lineHeight: 16,
    fontWeight: '500',
  },
  actionButtonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});
