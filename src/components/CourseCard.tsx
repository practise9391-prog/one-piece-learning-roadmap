import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../models/Course';
import { Colors } from '../theme/colors';
import { ProgressBar } from './ProgressBar';
import { OnePieceBadge } from './OnePieceBadge';

interface CourseCardProps {
  course: Course;
  onPress?: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  const theme = Colors.courseThemes[course.id] || {
    primary: Colors.accent,
    secondary: Colors.accentLight,
    bg: Colors.surfaceHover,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress?.(course)}
      style={styles.card}
    >
      <View style={styles.headerRow}>
        <View style={styles.leftInfo}>
          <View style={[styles.iconBox, { backgroundColor: theme.bg }]}>
            <Ionicons
              name={(course.icon as keyof typeof Ionicons.glyphMap) || 'book-outline'}
              size={24}
              color={theme.primary}
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
            <Text style={styles.islandTag}>Island #{course.order}</Text>
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

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.modulesText}>
            {course.completed_modules} / {course.total_modules} Modules Completed
          </Text>
          <Text style={styles.percentageText}>
            {course.progress_percentage.toFixed(0)}%
          </Text>
        </View>
        <ProgressBar
          percentage={course.progress_percentage}
          color={course.is_completed ? Colors.success : theme.primary}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
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
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    marginRight: 6,
  },
  completedIconBadge: {
    marginLeft: 2,
  },
  islandTag: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modulesText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});

