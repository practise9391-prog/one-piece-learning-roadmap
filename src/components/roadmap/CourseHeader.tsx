import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Course } from '../../models/Course';
import { Module } from '../../models/Module';
import { CourseIcon } from './CourseIcon';
import { Colors } from '../../theme/colors';

interface CourseHeaderProps {
  course: Course;
  completedModulesCount: number;
  totalModulesCount: number;
  activeModule?: Module | null;
  onContinueJourney?: (module: Module) => void;
  onViewCelebration?: () => void;
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({
  course,
  completedModulesCount,
  totalModulesCount,
  activeModule,
  onContinueJourney,
  onViewCelebration,
}) => {
  const percentage =
    totalModulesCount > 0
      ? Math.round((completedModulesCount / totalModulesCount) * 100)
      : 0;

  const isCourseFullyCompleted = course.is_completed || (totalModulesCount > 0 && completedModulesCount === totalModulesCount);

  const themeMeta = Colors.courseThemes[course.theme || course.id] || {
    primary: Colors.primary,
    secondary: Colors.secondary,
    bg: '#EFF6FF',
  };

  return (
    <View style={styles.container}>
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

      {course.description ? (
        <Text style={styles.courseDescription}>{course.description}</Text>
      ) : null}

      {/* Voyage Progress Gauge */}
      <View style={styles.progressCard}>
        <View style={styles.progressMetaRow}>
          <Text style={styles.progressLabel}>VOYAGE PROGRESS</Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>

        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                backgroundColor: isCourseFullyCompleted ? Colors.success : themeMeta.primary,
              },
            ]}
          />
        </View>

        <View style={styles.statsFooter}>
          <Text style={styles.statsCount}>
            {completedModulesCount} of {totalModulesCount} Modules Conquered
          </Text>
          {isCourseFullyCompleted ? (
            <Text style={styles.completeBadgeText}>🏆 COURSE COMPLETED</Text>
          ) : (
            <Text style={styles.remainingText}>
              {totalModulesCount - completedModulesCount} Remaining
            </Text>
          )}
        </View>
      </View>

      {/* CONTINUE YOUR JOURNEY / VIEW COMPLETION ACTION BANNER */}
      {isCourseFullyCompleted ? (
        <TouchableOpacity
          style={styles.celebrationBanner}
          onPress={onViewCelebration}
          activeOpacity={0.85}
        >
          <View style={styles.celebrationBannerLeft}>
            <View style={styles.celebrationTrophyCircle}>
              <Ionicons name="trophy" size={20} color="#D97706" />
            </View>
            <View>
              <Text style={styles.celebrationBannerTitle}>COURSE COMPLETED ✓</Text>
              <Text style={styles.celebrationBannerSub}>Grand Line Summit Conquered!</Text>
            </View>
          </View>
          <View style={styles.celebrationButtonPill}>
            <Text style={styles.celebrationButtonText}>View Celebration 🎉</Text>
          </View>
        </TouchableOpacity>
      ) : activeModule ? (
        <TouchableOpacity
          style={styles.continueJourneyCard}
          onPress={() => onContinueJourney?.(activeModule)}
          activeOpacity={0.85}
        >
          <View style={styles.continueJourneyHeader}>
            <View style={styles.continueBadge}>
              <Ionicons name="compass" size={13} color={themeMeta.primary} />
              <Text style={[styles.continueBadgeText, { color: themeMeta.primary }]}>
                CONTINUE YOUR JOURNEY
              </Text>
            </View>
            <Text style={styles.continueModuleNumber}>Module {activeModule.order}</Text>
          </View>

          <View style={styles.continueTitleRow}>
            <Text style={styles.continueModuleTitle} numberOfLines={1}>
              {activeModule.title}
            </Text>
            <View style={[styles.continueArrowBtn, { backgroundColor: themeMeta.primary }]}>
              <Text style={styles.continueArrowBtnText}>CONTINUE</Text>
              <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
      ) : null}
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
    paddingBottom: 16,
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
    marginTop: 6,
    lineHeight: 18,
  },
  progressCard: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
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
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
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
  celebrationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    marginTop: 12,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  celebrationBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  celebrationTrophyCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  celebrationBannerSub: {
    fontSize: 11,
    color: '#B45309',
  },
  celebrationButtonPill: {
    backgroundColor: '#D97706',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  celebrationButtonText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  continueJourneyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  continueJourneyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  continueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  continueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  continueModuleNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  continueTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  continueModuleTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  continueArrowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  continueArrowBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
