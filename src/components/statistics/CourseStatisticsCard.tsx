import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressBar } from '../ProgressBar';
import { CourseProgressStat } from '../../services/StatisticsService';
import { Colors } from '../../theme/colors';

interface CourseStatisticsCardProps {
  stat: CourseProgressStat;
  onPress: () => void;
}

export const CourseStatisticsCard: React.FC<CourseStatisticsCardProps> = ({
  stat,
  onPress,
}) => {
  const { course, completedModules, totalModules, completedTopics, totalTopics, progressPercentage, status } = stat;

  const getStatusStyles = () => {
    switch (status) {
      case 'COMPLETED':
        return { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' };
      case 'IN PROGRESS':
        return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
      default:
        return { bg: '#F1F5F9', text: '#64748B', border: '#E2E8F0' };
    }
  };

  const statusStyle = getStatusStyles();

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Ionicons name="boat-outline" size={20} color={Colors.primary} />
        </View>
        <View style={styles.titleCol}>
          <Text style={styles.courseName}>{course.name}</Text>
          <Text style={styles.moduleCountText}>
            {completedModules} / {totalModules} Modules • {completedTopics} / {totalTopics} Topics
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusStyle.bg, borderColor: statusStyle.border },
          ]}
        >
          <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
            {status}
          </Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.barWrap}>
          <ProgressBar
            percentage={progressPercentage}
            height={7}
            color={status === 'COMPLETED' ? Colors.success : Colors.primary}
          />
        </View>
        <Text style={styles.percentText}>{Math.round(progressPercentage)}%</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleCol: {
    flex: 1,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  moduleCountText: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barWrap: {
    flex: 1,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginLeft: 10,
    minWidth: 34,
    textAlign: 'right',
  },
});
