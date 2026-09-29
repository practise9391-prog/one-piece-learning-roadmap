import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { Spacing, Radius } from '../../../theme/tokens';
import { ProgressBar } from '../../ProgressBar';

interface TopicLearningHeaderProps {
  courseName: string;
  moduleName: string;
  moduleOrder: number;
  topicTitle: string;
  topicIndex: number;
  totalTopics: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes?: number;
  progressPercentage: number;
  isCompleted: boolean;
  lastSection?: string;
  onContinueSection?: (section: string) => void;
  onRestartTopic?: () => void;
  onPrevTopic?: () => void;
  onNextTopic?: () => void;
  hasPrevTopic: boolean;
  hasNextTopic: boolean;
  onSearchPress?: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

export const TopicLearningHeader: React.FC<TopicLearningHeaderProps> = ({
  courseName,
  moduleName,
  moduleOrder,
  topicTitle,
  topicIndex,
  totalTopics,
  difficulty = 'Beginner',
  estimatedMinutes = 20,
  progressPercentage,
  isCompleted,
  lastSection,
  onContinueSection,
  onRestartTopic,
  onPrevTopic,
  onNextTopic,
  hasPrevTopic,
  hasNextTopic,
  onSearchPress,
  isBookmarked,
  onToggleBookmark,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceCard, borderColor: colors.border }]}>
      {/* Top Metadata Navigation Bar */}
      <View style={styles.topMetaBar}>
        <View style={styles.courseTag}>
          <Ionicons name="school-outline" size={13} color={colors.primary} />
          <Text style={[styles.courseTagText, { color: colors.primary }]}>
            {courseName.toUpperCase()} • MOD {moduleOrder}
          </Text>
        </View>

        <View style={styles.topActionsRow}>
          {onSearchPress && (
            <TouchableOpacity
              onPress={onSearchPress}
              style={[styles.iconBtn, { borderColor: colors.border }]}
              accessibilityLabel="Search topic"
              activeOpacity={0.7}
            >
              <Ionicons name="search-outline" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}

          {onToggleBookmark && (
            <TouchableOpacity
              onPress={onToggleBookmark}
              style={[styles.iconBtn, { borderColor: colors.border }]}
              accessibilityLabel="Bookmark topic"
              activeOpacity={0.7}
            >
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={16}
                color={isBookmarked ? '#F59E0B' : colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Topic Title & Badges */}
      <Text style={[styles.topicTitle, { color: colors.textPrimary }]}>{topicTitle}</Text>
      <Text style={[styles.moduleSubtitle, { color: colors.textSecondary }]}>
        Part of: {moduleName}
      </Text>

      {/* Meta Row (Difficulty, Time, Topic Counter) */}
      <View style={styles.metaPillsRow}>
        <View style={[styles.metaPill, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <Ionicons name="speedometer-outline" size={13} color="#3B82F6" />
          <Text style={[styles.metaPillText, { color: colors.textPrimary }]}>{difficulty}</Text>
        </View>

        <View style={[styles.metaPill, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <Ionicons name="time-outline" size={13} color="#10B981" />
          <Text style={[styles.metaPillText, { color: colors.textPrimary }]}>
            {estimatedMinutes} mins
          </Text>
        </View>

        <View style={[styles.metaPill, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
          <Ionicons name="layers-outline" size={13} color="#8B5CF6" />
          <Text style={[styles.metaPillText, { color: colors.textPrimary }]}>
            Topic {topicIndex + 1} of {totalTopics}
          </Text>
        </View>

        {isCompleted && (
          <View style={[styles.metaPill, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
            <Text style={[styles.metaPillText, { color: '#16A34A', fontWeight: '800' }]}>
              COMPLETED
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeaderRow}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Topic Progress</Text>
          <Text style={[styles.progressValue, { color: isCompleted ? colors.success : colors.primary }]}>
            {progressPercentage}%
          </Text>
        </View>
        <ProgressBar
          percentage={progressPercentage}
          color={isCompleted ? colors.success : colors.primary}
          height={7}
        />
      </View>

      {/* Resume Halfway Learning Banner */}
      {lastSection && lastSection !== 'introduction' && !isCompleted && onContinueSection && (
        <View style={[styles.resumeBanner, { backgroundColor: isDark ? '#172554' : '#EFF6FF', borderColor: '#93C5FD' }]}>
          <Ionicons name="refresh-circle" size={20} color="#2563EB" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.resumeBannerTitle, { color: '#1E40AF' }]}>
              Welcome back! You paused at:
            </Text>
            <Text style={[styles.resumeBannerSection, { color: '#1D4ED8' }]}>
              {lastSection.replace(/_/g, ' ').toUpperCase()}
            </Text>
          </View>
          <View style={styles.resumeActions}>
            <TouchableOpacity
              onPress={() => onContinueSection(lastSection)}
              style={styles.continueBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.continueBtnText}>Continue</Text>
            </TouchableOpacity>
            {onRestartTopic && (
              <TouchableOpacity
                onPress={onRestartTopic}
                style={styles.restartBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.restartBtnText}>Restart</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Previous / Next Topic Navigation Buttons */}
      <View style={[styles.navRow, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPress={onPrevTopic}
          disabled={!hasPrevTopic}
          style={[styles.navBtn, !hasPrevTopic && styles.navBtnDisabled]}
          activeOpacity={0.75}
        >
          <Ionicons
            name="arrow-back"
            size={16}
            color={hasPrevTopic ? colors.primary : colors.textTertiary}
          />
          <Text style={[styles.navBtnText, { color: hasPrevTopic ? colors.primary : colors.textTertiary }]}>
            Previous Topic
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNextTopic}
          disabled={!hasNextTopic}
          style={[styles.navBtn, !hasNextTopic && styles.navBtnDisabled]}
          activeOpacity={0.75}
        >
          <Text style={[styles.navBtnText, { color: hasNextTopic ? colors.primary : colors.textTertiary }]}>
            Next Topic
          </Text>
          <Ionicons
            name="arrow-forward"
            size={16}
            color={hasNextTopic ? colors.primary : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  topMetaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  courseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  courseTagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  topActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: Spacing.xs,
    marginBottom: 4,
    lineHeight: 28,
  },
  moduleSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  metaPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  resumeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    gap: 10,
    marginBottom: Spacing.md,
  },
  resumeBannerTitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  resumeBannerSection: {
    fontSize: 12,
    fontWeight: '800',
  },
  resumeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  restartBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  restartBtnText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
