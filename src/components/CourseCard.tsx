import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../models/Course';
import { Colors } from '../theme/colors';
import { ProgressBar } from './ProgressBar';
import { OnePieceBadge } from './OnePieceBadge';
import { getCourseIdentity } from '../theme/courseIdentities';
import { useTheme } from '../theme/ThemeContext';

interface CourseCardProps {
  course: Course;
  onPress?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  const { reducedMotion } = useTheme();
  const identity = getCourseIdentity(course.id);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (reducedMotion) return;
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (reducedMotion) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress?.(course)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.card,
          { borderColor: course.is_completed ? '#10B981' : '#E2E8F0' },
        ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.leftInfo}>
            <View style={[styles.iconBox, { backgroundColor: identity.bgTint }]}>
              <Ionicons
                name={(course.icon as keyof typeof Ionicons.glyphMap) || 'book-outline'}
                size={24}
                color={identity.primaryColor}
              />
            </View>
            <View style={styles.nameContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.courseName}>{course.name}</Text>
                {course.is_completed && (
                  <View style={styles.completedIconBadge}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                  </View>
                )}
              </View>
              <View style={styles.tagRow}>
                <Text style={styles.islandTag}>Island #{course.order}</Text>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={[styles.motifBadge, { color: identity.primaryColor }]}>
                  {identity.badge}
                </Text>
              </View>
            </View>
          </View>

          <OnePieceBadge
            label={course.is_completed ? 'Mastered' : `${Math.round(course.progress_percentage)}%`}
            variant={course.is_completed ? 'success' : course.progress_percentage > 0 ? 'ocean' : 'gold'}
          />
        </View>

        {course.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {course.description}
          </Text>
        ) : null}

        <View style={styles.footer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Curriculum Progress</Text>
            <Text style={styles.progressText}>
              {course.completed_modules} / {course.total_modules} Modules
            </Text>
          </View>

          <ProgressBar
            percentage={course.progress_percentage}
            height={6}
            color={course.is_completed ? Colors.success : identity.primaryColor}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  completedIconBadge: {
    marginLeft: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  islandTag: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  bulletDot: {
    fontSize: 10,
    color: '#94A3B8',
  },
  motifBadge: {
    fontSize: 11,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 14,
  },
  footer: {
    marginTop: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 11,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
});
