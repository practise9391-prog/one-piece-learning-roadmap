import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { CourseIcon } from '../components/roadmap/CourseIcon';
import { useAppNavigation } from '../navigation/NavigationContext';
import { courseRepository } from '../repositories/CourseRepository';
import { Course } from '../models/Course';
import { Colors } from '../theme/colors';

export const CourseCompletionScreen: React.FC = () => {
  const { params, goBack, navigate } = useAppNavigation();
  const courseId = params?.courseId || 'python';

  const [course, setCourse] = useState<Course | null>(null);
  const [stats, setStats] = useState<{
    totalTopics: number;
    completedTopics: number;
    totalNotes: number;
  }>({ totalTopics: 0, completedTopics: 0, totalNotes: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.4)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const trophyBounceAnim = useRef(new Animated.Value(0)).current;
  const starsRotateAnim = useRef(new Animated.Value(0)).current;

  const triggerCelebrationAnimation = useCallback(() => {
    scaleAnim.setValue(0.4);
    fadeAnim.setValue(0);
    trophyBounceAnim.setValue(0);
    starsRotateAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(trophyBounceAnim, {
            toValue: -8,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(trophyBounceAnim, {
            toValue: 0,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ),
      Animated.loop(
        Animated.timing(starsRotateAnim, {
          toValue: 1,
          duration: 6000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
    ]).start();
  }, [scaleAnim, fadeAnim, trophyBounceAnim, starsRotateAnim]);

  useEffect(() => {
    let isMounted = true;
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await courseRepository.getCompletionStats(courseId);
        if (isMounted) {
          setCourse(data.course);
          setStats({
            totalTopics: data.totalTopics,
            completedTopics: data.completedTopics,
            totalNotes: data.totalNotes,
          });
        }
      } catch (err) {
        console.error('Failed to load course completion stats:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          triggerCelebrationAnimation();
        }
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, [courseId, triggerCelebrationAnimation]);

  const getCourseMotivationalQuote = (id: string): string => {
    const key = id.toLowerCase().replace(/-/g, '_');
    switch (key) {
      case 'python':
        return 'Your Python journey is complete. Keep building the future with code.';
      case 'dsa':
        return 'Your problem-solving journey has reached an elite milestone. The algorithmic realm is yours.';
      case 'git':
        return 'Your version-control journey is complete. You command every branch of your destiny.';
      case 'sql':
        return 'Your relational database mastery is established. The world of structured data bows to you.';
      case 'django':
        return 'Your full-stack web backend journey is complete. Deploy with fearless confidence.';
      case 'ml_developer':
      case 'ml':
        return 'Your machine learning & AI journey is complete. Build intelligence that changes the world.';
      case 'linux':
        return 'Your command line and systems mastery is complete. The kernel answers to your command.';
      case 'javascript':
      case 'js':
        return 'Your frontend interactive development journey is complete. Bring the web to life.';
      case 'html':
        return 'Your web structure and semantic markup journey is complete. Built on rock-solid foundations.';
      case 'css':
        return 'Your responsive design and styling journey is complete. Craft beauty on any canvas.';
      case 'aptitude_reasoning':
      case 'aptitude':
        return 'Your analytical thinking and problem solving is razor-sharp.';
      case 'english':
        return 'Your communication and professional language mastery is complete. Speak with authority.';
      case 'hindi':
        return 'Your language comprehension and fluency journey is complete.';
      case 'frappe':
        return 'Your enterprise framework development journey is complete. Engineer systems that scale.';
      default:
        return 'You have conquered the Grand Line. A Master Developer is born!';
    }
  };

  const spin = starsRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (loading && !course) {
    return (
      <View style={styles.container}>
        <Header title="Celebration" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Unfurling Grand Line Victory Banner...</Text>
        </View>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.container}>
        <Header title="Course Not Found" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Could not load course completion details.</Text>
        </View>
      </View>
    );
  }

  const themeMeta = Colors.courseThemes[course.theme || course.id] || {
    primary: Colors.primary,
    secondary: Colors.secondary,
    bg: '#EFF6FF',
  };

  return (
    <View style={styles.container}>
      <Header
        title="Grand Line Summit"
        subtitle={`${course.name} Mastered`}
        showBack
        onBackPress={goBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Animated Celebration Card */}
        <Animated.View
          style={[
            styles.heroCard,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Rotating Celestial Halo */}
          <Animated.View style={[styles.haloContainer, { transform: [{ rotate: spin }] }]}>
            <View style={styles.starDotTop} />
            <View style={styles.starDotBottom} />
            <View style={styles.starDotLeft} />
            <View style={styles.starDotRight} />
          </Animated.View>

          {/* Bouncing Victory Trophy Crest */}
          <Animated.View
            style={[
              styles.trophyWrapper,
              { transform: [{ translateY: trophyBounceAnim }] },
            ]}
          >
            <View style={styles.trophyCircle}>
              <CourseIcon
                courseId={course.id}
                size={52}
                showBackground
                containerStyle={styles.crestCourseIcon}
              />
            </View>
            <View style={styles.goldenLaurelBadge}>
              <Ionicons name="trophy" size={18} color="#D97706" />
            </View>
          </Animated.View>

          {/* Victory Headlines */}
          <View style={styles.partyBannerPill}>
            <Ionicons name="sparkles" size={14} color="#D97706" />
            <Text style={styles.partyBannerText}>EXPEDITION COMPLETE</Text>
            <Ionicons name="sparkles" size={14} color="#D97706" />
          </View>

          <Text style={styles.celebrationHeroTitle}>
            {course.name.toUpperCase()} MASTERED!
          </Text>

          <Text style={styles.motivationalQuote}>
            "{getCourseMotivationalQuote(course.id)}"
          </Text>

          {/* 100% Mastery Gauge */}
          <View style={styles.masteryPill}>
            <Ionicons name="checkmark-done-circle" size={20} color="#10B981" />
            <Text style={styles.masteryPillText}>100% ALL MODULES CONQUERED</Text>
          </View>
        </Animated.View>

        {/* Completion Statistics Card */}
        <View style={styles.statsSectionCard}>
          <View style={styles.statsSectionHeader}>
            <Ionicons name="stats-chart" size={16} color={Colors.primary} />
            <Text style={styles.statsSectionTitle}>EXPEDITION LOGBOOK METRICS</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statBoxNum}>
                {course.completed_modules} / {course.total_modules}
              </Text>
              <Text style={styles.statBoxLabel}>Modules Finished</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statBoxNum}>
                {stats.completedTopics} / {stats.totalTopics || stats.completedTopics}
              </Text>
              <Text style={styles.statBoxLabel}>Topics Mastered</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statBoxNum}>{stats.totalNotes}</Text>
              <Text style={styles.statBoxLabel}>Notes Recorded</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statBoxNum}>100%</Text>
              <Text style={styles.statBoxLabel}>Mastery Level</Text>
            </View>
          </View>

          {/* Timeline Dates */}
          <View style={styles.timelineRow}>
            <View style={styles.timelineItem}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.timelineText}>
                Started: <Text style={styles.timelineBold}>
                  {course.started_at ? course.started_at.split('T')[0] : 'Inception'}
                </Text>
              </Text>
            </View>
            <View style={styles.timelineItem}>
              <Ionicons name="flag-outline" size={14} color="#059669" />
              <Text style={styles.timelineText}>
                Conquered: <Text style={styles.timelineBold}>
                  {course.completed_at ? course.completed_at.split('T')[0] : 'Today'}
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.timeSpentNotice}>
            <Ionicons name="time-outline" size={13} color="#94A3B8" />
            <Text style={styles.timeSpentNoticeText}>
              Time tracking metrics coming in future updates.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {/* Celebrate Again */}
          <TouchableOpacity
            style={styles.replayButton}
            onPress={triggerCelebrationAnimation}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={18} color="#D97706" />
            <Text style={styles.replayButtonText}>🎉 Celebrate Again</Text>
          </TouchableOpacity>

          {/* View Roadmap */}
          <TouchableOpacity
            style={[styles.primaryActionBtn, { backgroundColor: themeMeta.primary }]}
            onPress={() => navigate('CourseRoadmap', { courseId: course.id })}
            activeOpacity={0.85}
          >
            <Ionicons name="map" size={18} color="#FFFFFF" />
            <Text style={styles.primaryActionBtnText}>View Conquered Roadmap</Text>
          </TouchableOpacity>

          {/* Back to All Courses */}
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => navigate('Home')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={16} color="#475569" />
            <Text style={styles.secondaryActionBtnText}>Back to All Courses</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  heroCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FDE68A',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  haloContainer: {
    position: 'absolute',
    top: 20,
    width: 170,
    height: 170,
  },
  starDotTop: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  starDotBottom: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  starDotLeft: {
    position: 'absolute',
    left: 0,
    top: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  starDotRight: {
    position: 'absolute',
    right: 0,
    top: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  trophyWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  trophyCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  crestCourseIcon: {
    shadowOpacity: 0,
    elevation: 0,
  },
  goldenLaurelBadge: {
    position: 'absolute',
    bottom: -6,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  partyBannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 6,
    marginBottom: 8,
  },
  partyBannerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 1,
  },
  celebrationHeroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 10,
  },
  motivationalQuote: {
    fontSize: 13,
    lineHeight: 20,
    color: '#475569',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  masteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    gap: 6,
  },
  masteryPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  statsSectionCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  statsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  statsSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBoxNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  statBoxLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timelineText: {
    fontSize: 11,
    color: '#64748B',
  },
  timelineBold: {
    fontWeight: '700',
    color: '#1E293B',
  },
  timeSpentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  timeSpentNoticeText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  actionsContainer: {
    width: '100%',
    gap: 10,
  },
  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    gap: 8,
  },
  replayButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#B45309',
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  secondaryActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});
