import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CourseProgressSummary } from '../../models/Analytics';
import { useTheme } from '../../theme/ThemeContext';

interface CourseProgressCardProps {
  course: CourseProgressSummary;
  onPress: () => void;
  formatMinutes: (min: number) => string;
}

export const CourseProgressCard: React.FC<CourseProgressCardProps> = ({
  course,
  onPress,
  formatMinutes,
}) => {
  const { theme } = useTheme();

  const getStatusBadge = () => {
    switch (course.status) {
      case 'COMPLETED':
        return { text: 'COMPLETED', bg: '#D1FAE5', color: '#065F46', icon: 'checkmark-circle' };
      case 'IN_PROGRESS':
        return { text: 'IN PROGRESS', bg: `${theme.colors.primary}20`, color: theme.colors.primary, icon: 'time' };
      default:
        return { text: 'NOT STARTED', bg: '#E2E8F0', color: '#64748B', icon: 'ellipse-outline' };
    }
  };

  const badge = getStatusBadge();

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.topRow}>
        <View style={styles.courseIdentity}>
          <View style={[styles.iconWrap, { backgroundColor: `${theme.colors.primary}15` }]}>
            <Text style={styles.iconText}>{course.icon || '📖'}</Text>
          </View>
          <View style={styles.nameWrap}>
            <Text style={[styles.courseName, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {course.courseName}
            </Text>
            {course.currentModuleName && (
              <Text style={[styles.currentModule, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                Current: {course.currentModuleName}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
        </View>
      </View>

      {/* Progress track */}
      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={[styles.ratioText, { color: theme.colors.textSecondary }]}>
            {course.completedTopics} / {course.totalTopics} Topics
          </Text>
          <Text style={[styles.percentText, { color: theme.colors.primary }]}>
            {course.progressPercentage}%
          </Text>
        </View>
        <View style={[styles.progressBarTrack, { backgroundColor: `${theme.colors.primary}20` }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: course.status === 'COMPLETED' ? '#10B981' : theme.colors.primary,
                width: `${course.progressPercentage}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Footer Details */}
      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <View style={styles.footerItem}>
          <Ionicons name="folder-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            {course.completedModules}/{course.totalModules} Modules
          </Text>
        </View>

        <View style={styles.footerItem}>
          <Ionicons name="timer-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            {formatMinutes(course.studyMinutes)}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  courseIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 20,
  },
  nameWrap: {
    flex: 1,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '700',
  },
  currentModule: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ratioText: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
