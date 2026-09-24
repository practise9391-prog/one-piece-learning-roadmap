import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Course } from '../../models/Course';
import { CourseIcon } from './CourseIcon';
import { Colors } from '../../theme/colors';

interface CourseHeaderProps {
  course: Course;
  completedModulesCount: number;
  totalModulesCount: number;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  completedModulesCount,
  totalModulesCount,
}) => {
  const percentage =
    totalModulesCount > 0
      ? Math.round((completedModulesCount / totalModulesCount) * 100)
      : 0;

  const themeMeta = Colors.courseThemes[course.theme || course.id] || {
    primary: Colors.primary,
    secondary: Colors.secondary,
    bg: '#EFF6FF',
  };

  return (
    <View style={styles.container}>
      {/* Top Banner with Icon & Island Number */}
      <View style={styles.topRow}>
        <CourseIcon
          courseId={course.id}
          size={36}
          showBackground
          containerStyle={styles.iconStyle}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.islandTag}>GRAND LINE EXPEDITION</Text>
          <Text style={styles.courseTitle}>{course.name}</Text>
        </View>
      </View>

      {/* Description */}
      {course.description ? (
        <Text style={styles.courseDescription}>{course.description}</Text>
      ) : null}

      {/* Voyage Progress Card */}
      <View style={styles.progressCard}>
        <View style={styles.progressMetaRow}>
          <Text style={styles.progressLabel}>VOYAGE PROGRESS</Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>

        {/* Progress Bar Track */}
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                backgroundColor: percentage === 100 ? Colors.success : themeMeta.primary,
              },
            ]}
          />
        </View>

        <View style={styles.statsFooter}>
          <Text style={styles.statsCount}>
            {completedModulesCount} of {totalModulesCount} Modules Conquered
          </Text>
          {percentage === 100 ? (
            <Text style={styles.completeBadgeText}>🏆 COURSE COMPLETED</Text>
          ) : (
            <Text style={styles.remainingText}>
              {totalModulesCount - completedModulesCount} Remaining
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    zIndex: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconStyle: {
    marginRight: 2,
  },
  headerInfo: {
    flex: 1,
  },
  islandTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  courseTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
  },
  courseDescription: {
    fontSize: 13,
    color: '#475569',
    marginTop: 8,
    lineHeight: 18,
  },
  progressCard: {
    marginTop: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  statsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  completeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.success,
  },
  remainingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
