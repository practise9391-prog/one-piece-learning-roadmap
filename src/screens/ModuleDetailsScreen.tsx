import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { ProgressBar } from '../components/ProgressBar';
import { OnePieceBadge } from '../components/OnePieceBadge';
import { useAppNavigation } from '../navigation/NavigationContext';
import { roadmapService } from '../services/RoadmapService';
import { progressService } from '../services/ProgressService';
import { topicRepository } from '../repositories/TopicRepository';
import { Course } from '../models/Course';
import { Module } from '../models/Module';
import { Topic } from '../models/Topic';
import { Colors } from '../theme/colors';

export const ModuleDetailsScreen: React.FC = () => {
  const { params, goBack, navigate } = useAppNavigation();
  const courseId = params?.courseId || 'python';
  const moduleId = params?.moduleId;

  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [previousModule, setPreviousModule] = useState<Module | null>(null);
  const [nextModule, setNextModule] = useState<Module | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [congratulationsVisible, setCongratulationsVisible] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!moduleId) return;
    try {
      setLoading(true);
      const data = await roadmapService.getCourseWithModules(courseId);
      setCourse(data.course);

      const allMods = data.modules;
      const currentIndex = allMods.findIndex((m) => m.id === moduleId);

      if (currentIndex !== -1) {
        const currentMod = allMods[currentIndex];
        setModule(currentMod);

        const prevMod = currentIndex > 0 ? allMods[currentIndex - 1] : null;
        setPreviousModule(prevMod);

        const nextMod = currentIndex < allMods.length - 1 ? allMods[currentIndex + 1] : null;
        setNextModule(nextMod);

        // Check locked state: if previous module exists and is not completed
        const locked = prevMod !== null && !prevMod.is_completed;
        setIsLocked(locked);
      }

      // Fetch topics
      const moduleTopics = await topicRepository.getByModuleId(moduleId);
      setTopics(moduleTopics);
    } catch (err) {
      console.error('Failed to load module details from SQLite:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, moduleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle single topic completion in SQLite
  const handleToggleTopic = async (topic: Topic) => {
    if (isLocked) {
      Alert.alert(
        'Island Locked',
        `You must complete "${previousModule?.title}" first before marking topics in this island.`
      );
      return;
    }

    try {
      const result = await progressService.toggleTopicCompletion(courseId, moduleId!, topic.id);
      setTopics((prev) =>
        prev.map((t) => (t.id === topic.id ? result.topic : t))
      );
      setModule(result.module);
      setCourse(result.course);

      if (result.module.is_completed) {
        setCongratulationsVisible(true);
      }
    } catch (err) {
      console.error('Failed to toggle topic completion:', err);
      Alert.alert('Database Error', 'Could not update topic in SQLite.');
    }
  };

  // Toggle entire module completion
  const handleToggleModuleCompletion = async () => {
    if (!module) return;

    if (isLocked && !module.is_completed) {
      Alert.alert(
        'Island Locked',
        `Conquer "${previousModule?.title || 'the previous module'}" first to unlock this island.`
      );
      return;
    }

    try {
      setActionLoading(true);
      if (module.is_completed) {
        const updatedCourse = await progressService.uncompleteModule(courseId, module.id);
        setCourse(updatedCourse);
        setModule((prev) => (prev ? { ...prev, is_completed: false, completed_at: null } : null));
        setTopics((prev) => prev.map((t) => ({ ...t, is_completed: false, completed_at: null })));
        setCongratulationsVisible(false);
      } else {
        const updatedCourse = await progressService.completeModule(courseId, module.id);
        setCourse(updatedCourse);
        setModule((prev) => (prev ? { ...prev, is_completed: true } : null));
        setTopics((prev) => prev.map((t) => ({ ...t, is_completed: true })));
        setCongratulationsVisible(true);
      }
    } catch (err) {
      console.error('Failed to toggle module completion:', err);
      Alert.alert('Database Error', 'Could not update module completion status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleProceedNext = () => {
    if (nextModule) {
      navigate('ModuleDetails', { courseId, moduleId: nextModule.id });
    } else {
      goBack();
    }
  };

  if (loading && !module) {
    return (
      <View style={styles.container}>
        <Header title="Module Details" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching Island Scrolls from SQLite...</Text>
        </View>
      </View>
    );
  }

  if (!module) {
    return (
      <View style={styles.container}>
        <Header title="Module Not Found" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>This module could not be found in local storage.</Text>
        </View>
      </View>
    );
  }

  const completedTopicsCount = topics.filter((t) => t.is_completed).length;
  const topicProgressPercentage =
    topics.length > 0 ? (completedTopicsCount / topics.length) * 100 : 0;

  return (
    <View style={styles.container}>
      <Header
        title={`Module ${module.order}`}
        subtitle={course?.name || 'Roadmap'}
        showBack
        onBackPress={goBack}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* LOCKED BANNER IF LOCKED */}
        {isLocked && (
          <View style={styles.lockedBanner}>
            <Ionicons name="lock-closed" size={24} color="#DC2626" />
            <View style={styles.lockedBannerText}>
              <Text style={styles.lockedBannerTitle}>Island Currently Locked</Text>
              <Text style={styles.lockedBannerSubtitle}>
                Complete previous module {previousModule ? `"${previousModule.title}"` : ''} to
                unlock full access and earn completion credit.
              </Text>
            </View>
          </View>
        )}

        {/* CONGRATULATIONS CELEBRATION CARD */}
        {congratulationsVisible && (
          <View style={styles.congratsCard}>
            <View style={styles.congratsHeader}>
              <Ionicons name="trophy" size={26} color="#F59E0B" />
              <Text style={styles.congratsTitle}>Island Conquered!</Text>
            </View>
            <Text style={styles.congratsSubtitle}>
              You have completed Module {module.order}. The road ahead is now illuminated!
            </Text>
            {nextModule && (
              <TouchableOpacity
                style={styles.nextModuleBtn}
                onPress={handleProceedNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextModuleBtnText}>
                  Sail to Module {nextModule.order}: {nextModule.title}
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* MODULE HERO CARD */}
        <View
          style={[
            styles.moduleHeroCard,
            module.is_completed && styles.moduleHeroCardCompleted,
            isLocked && styles.moduleHeroCardLocked,
          ]}
        >
          <View style={styles.heroTopRow}>
            <View
              style={[
                styles.moduleBadge,
                module.is_completed && styles.moduleBadgeCompleted,
                isLocked && styles.moduleBadgeLocked,
              ]}
            >
              <Text style={styles.moduleBadgeText}>MODULE {module.order}</Text>
            </View>

            {module.is_completed ? (
              <View style={styles.statusPillCompleted}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Text style={styles.statusPillCompletedText}>COMPLETED</Text>
              </View>
            ) : isLocked ? (
              <View style={styles.statusPillLocked}>
                <Ionicons name="lock-closed" size={14} color="#94A3B8" />
                <Text style={styles.statusPillLockedText}>LOCKED</Text>
              </View>
            ) : (
              <View style={styles.statusPillAvailable}>
                <Ionicons name="compass" size={14} color={Colors.primary} />
                <Text style={styles.statusPillAvailableText}>ACTIVE JOURNEY</Text>
              </View>
            )}
          </View>

          <Text style={styles.moduleTitleText}>{module.title}</Text>
          {module.description ? (
            <Text style={styles.moduleDescText}>{module.description}</Text>
          ) : null}

          {/* Module Topics Progress Bar */}
          {topics.length > 0 && (
            <View style={styles.topicProgressSection}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Topics Mastered</Text>
                <Text style={styles.progressValue}>
                  {completedTopicsCount} / {topics.length} (
                  {Math.round(topicProgressPercentage)}%)
                </Text>
              </View>
              <ProgressBar
                percentage={topicProgressPercentage}
                color={module.is_completed ? Colors.success : Colors.primary}
                height={8}
              />
            </View>
          )}

          {/* Complete Module Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              module.is_completed && styles.actionButtonCompleted,
              isLocked && styles.actionButtonLocked,
            ]}
            onPress={handleToggleModuleCompletion}
            disabled={actionLoading || isLocked}
            activeOpacity={0.85}
          >
            {actionLoading ? (
              <ActivityIndicator
                size="small"
                color={module.is_completed ? Colors.textPrimary : '#FFFFFF'}
              />
            ) : (
              <>
                <Ionicons
                  name={
                    module.is_completed
                      ? 'checkmark-done-circle'
                      : isLocked
                      ? 'lock-closed'
                      : 'checkmark-circle-outline'
                  }
                  size={20}
                  color={
                    module.is_completed
                      ? Colors.textSecondary
                      : isLocked
                      ? '#94A3B8'
                      : '#FFFFFF'
                  }
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    module.is_completed && styles.actionButtonTextCompleted,
                    isLocked && styles.actionButtonTextLocked,
                  ]}
                >
                  {module.is_completed
                    ? 'Mark Module Incomplete'
                    : isLocked
                    ? 'Island Locked (Complete Previous)'
                    : 'Mark Module As Completed'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* TOPICS LIST */}
        <View style={styles.topicsSection}>
          <View style={styles.topicsHeaderRow}>
            <Text style={styles.sectionTitle}>Curriculum Topics</Text>
            <Text style={styles.topicsSubtitle}>
              {topics.length} topics in this island
            </Text>
          </View>

          {topics.length === 0 ? (
            <View style={styles.emptyTopicsCard}>
              <Text style={styles.emptyTopicsText}>
                No specific topics listed for this module.
              </Text>
            </View>
          ) : (
            topics.map((t, idx) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.topicRowCard,
                  t.is_completed && styles.topicRowCompleted,
                  isLocked && styles.topicRowLocked,
                ]}
                onPress={() => handleToggleTopic(t)}
                activeOpacity={0.75}
                disabled={isLocked}
              >
                <View style={styles.topicCheckboxContainer}>
                  <Ionicons
                    name={t.is_completed ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={
                      t.is_completed
                        ? Colors.success
                        : isLocked
                        ? '#CBD5E1'
                        : Colors.textSecondary
                    }
                  />
                </View>

                <View style={styles.topicTextContainer}>
                  <Text
                    style={[
                      styles.topicTitle,
                      t.is_completed && styles.topicTitleCompleted,
                      isLocked && styles.topicTitleLocked,
                    ]}
                  >
                    {idx + 1}. {t.title}
                  </Text>
                  {t.description ? (
                    <Text
                      style={[
                        styles.topicDesc,
                        t.is_completed && styles.topicDescCompleted,
                      ]}
                      numberOfLines={2}
                    >
                      {t.description}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          )}
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
    marginTop: 12,
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
    padding: 16,
    paddingBottom: 40,
  },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  lockedBannerText: {
    flex: 1,
  },
  lockedBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  lockedBannerSubtitle: {
    fontSize: 12,
    color: '#B91C1C',
    lineHeight: 16,
  },
  congratsCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  congratsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  congratsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#92400E',
  },
  congratsSubtitle: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
    marginBottom: 12,
  },
  nextModuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 8,
  },
  nextModuleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  moduleHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  moduleHeroCardCompleted: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  moduleHeroCardLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.85,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  moduleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  moduleBadgeCompleted: {
    backgroundColor: '#10B981',
  },
  moduleBadgeLocked: {
    backgroundColor: '#CBD5E1',
  },
  moduleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statusPillCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillCompletedText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.success,
  },
  statusPillLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillLockedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  statusPillAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusPillAvailableText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  moduleTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 26,
    marginBottom: 6,
  },
  moduleDescText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  topicProgressSection: {
    marginVertical: 12,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  actionButtonCompleted: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  actionButtonLocked: {
    backgroundColor: '#E2E8F0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionButtonTextCompleted: {
    color: Colors.textSecondary,
  },
  actionButtonTextLocked: {
    color: '#94A3B8',
  },
  topicsSection: {
    marginTop: 4,
  },
  topicsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  topicsSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  emptyTopicsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  emptyTopicsText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  topicRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  topicRowCompleted: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  topicRowLocked: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.7,
  },
  topicCheckboxContainer: {
    marginRight: 12,
  },
  topicTextContainer: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 18,
  },
  topicTitleCompleted: {
    color: '#065F46',
  },
  topicTitleLocked: {
    color: '#94A3B8',
  },
  topicDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  topicDescCompleted: {
    color: '#047857',
  },
});
