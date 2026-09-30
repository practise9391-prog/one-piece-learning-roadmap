import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import { Colors } from '../../theme/colors';
import { ProgressBar } from '../../components/ProgressBar';
import { StaggeredFadeIn } from '../../components/common/StaggeredFadeIn';
import { careerGoalService } from '../../services/CareerGoalService';
import { CareerGoalSummary } from '../../models/CareerGoal';
import { GlobalAITeacherModal } from '../../components/ai/GlobalAITeacherModal';
import { aiContextManager } from '../../services/ai/AIContextManager';

export const MyGoalScreen: React.FC = () => {
  const { navigate, goBack } = useAppNavigation();
  const { isDark } = useTheme();

  const [summary, setSummary] = useState<CareerGoalSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [aiModalVisible, setAiModalVisible] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const data = await careerGoalService.getCareerGoalSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load career goal data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleLaunchAICoach = () => {
    aiContextManager.setTopicContext({
      courseId: 'career_goal',
      topicTitle: '₹30 LPA Career Readiness Coaching',
      currentSection: `Stage ${summary?.currentStageNumber || 1} Readiness Assessment`,
      explanationText: `Target Compensation: ₹30 LPA+. Current readiness: ${summary?.overallReadinessPercentage || 0}%. Focus: DSA mastery, system design, and clean architecture.`,
    });
    setAiModalVisible(true);
  };

  return (
    <AppShell title="🎯 ₹30 LPA CAREER MISSION" showBackButton onBackPress={goBack}>
      {loading || !summary ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Calculating Career Readiness Metrics...</Text>
        </View>
      ) : (
        <ScrollView
          style={[styles.container, isDark && styles.darkContainer]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {/* 1. HERO TARGET CARD */}
          <StaggeredFadeIn index={0}>
            <View style={styles.heroCard}>
              <View style={styles.heroTopRow}>
                <View style={styles.targetBadge}>
                  <Ionicons name="trophy" size={14} color="#F59E0B" />
                  <Text style={styles.targetBadgeText}>CAREER TARGET</Text>
                </View>
                <View style={styles.compBadge}>
                  <Text style={styles.compBadgeText}>{summary.targetCompensation}</Text>
                </View>
              </View>

              <Text style={styles.heroRole}>{summary.targetRole}</Text>
              <Text style={styles.heroSub}>
                Comprehensive engineering readiness evaluated across DSA, System Design, Full-Stack & Core CS.
              </Text>

              {/* Readiness Gauge */}
              <View style={styles.gaugeContainer}>
                <View style={styles.gaugeHeader}>
                  <Text style={styles.gaugeTitle}>Overall Readiness Score</Text>
                  <Text style={styles.gaugePercent}>{summary.overallReadinessPercentage}%</Text>
                </View>
                <ProgressBar
                  percentage={summary.overallReadinessPercentage}
                  height={10}
                  color="#10B981"
                />
              </View>

              {/* Quick Stat Highlights */}
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatNum}>{summary.streakDays}d</Text>
                  <Text style={styles.heroStatLabel}>Streak</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatNum}>{summary.solvedProblemsCount}</Text>
                  <Text style={styles.heroStatLabel}>Solved</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatNum}>{summary.completedTopicsCount}</Text>
                  <Text style={styles.heroStatLabel}>Topics</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.heroStatNum}>{summary.totalXp}</Text>
                  <Text style={styles.heroStatLabel}>XP</Text>
                </View>
              </View>

              {/* AI Career Coach Banner Button */}
              <TouchableOpacity
                style={styles.coachBtn}
                onPress={handleLaunchAICoach}
                activeOpacity={0.85}
              >
                <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                <Text style={styles.coachBtnText}>Ask AI Career Coach For Next Action</Text>
              </TouchableOpacity>
            </View>
          </StaggeredFadeIn>

          {/* 2. TODAY'S MISSIONS */}
          <StaggeredFadeIn index={1}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>⚡ TODAY'S CAREER MISSIONS</Text>
              <Text style={styles.missionCountText}>{summary.todayMissions.length} Missions</Text>
            </View>

            {summary.todayMissions.map((mission) => (
              <TouchableOpacity
                key={mission.id}
                style={styles.missionCard}
                activeOpacity={0.8}
                onPress={() => {
                  navigate(mission.targetScreen as any, mission.params);
                }}
              >
                <View style={styles.missionLeft}>
                  <View style={styles.missionCategoryPill}>
                    <Text style={styles.missionCategoryText}>{mission.category}</Text>
                  </View>
                  <Text style={styles.missionTitle}>{mission.title}</Text>
                  <View style={styles.missionMetaRow}>
                    <Ionicons name="time-outline" size={12} color="#64748B" />
                    <Text style={styles.missionMetaText}>{mission.estimatedMinutes} mins</Text>
                    <Ionicons name="flash-outline" size={12} color="#F59E0B" style={{ marginLeft: 8 }} />
                    <Text style={styles.missionMetaText}>+{mission.xpReward} XP</Text>
                  </View>
                </View>

                <View style={styles.startActionBtn}>
                  <Text style={styles.startActionText}>START</Text>
                  <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))}
          </StaggeredFadeIn>

          {/* 3. SIX PILLARS READINESS METRICS */}
          <StaggeredFadeIn index={2}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>📊 EVALUATION PILLARS (WEIGHTED)</Text>
            </View>

            <View style={styles.pillarsGrid}>
              {summary.pillars.map((pillar) => (
                <View key={pillar.id} style={styles.pillarCard}>
                  <View style={styles.pillarHeader}>
                    <View style={[styles.pillarIconBox, { backgroundColor: `${pillar.color}20` }]}>
                      <Ionicons name={pillar.icon as any} size={18} color={pillar.color} />
                    </View>
                    <View style={styles.pillarTitleCol}>
                      <Text style={styles.pillarName}>{pillar.name}</Text>
                      <Text style={styles.pillarWeight}>Weight: {pillar.weight}%</Text>
                    </View>
                    <Text style={[styles.pillarPct, { color: pillar.color }]}>{pillar.percentage}%</Text>
                  </View>
                  <ProgressBar
                    percentage={pillar.percentage}
                    height={6}
                    color={pillar.color}
                  />
                </View>
              ))}
            </View>
          </StaggeredFadeIn>

          {/* 4. 9-STAGE CAREER JOURNEY */}
          <StaggeredFadeIn index={3}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeaderTitle}>🗺️ 9-STAGE CAREER JOURNEY</Text>
              <Text style={styles.stageProgressLabel}>
                Stage {summary.currentStageNumber} of {summary.totalStages}
              </Text>
            </View>

            {summary.stages.map((stage) => {
              const statusBg = stage.isCompleted
                ? '#DCFCE7'
                : stage.isCurrent
                ? '#FEF3C7'
                : '#F1F5F9';
              const statusColor = stage.isCompleted
                ? '#15803D'
                : stage.isCurrent
                ? '#B45309'
                : '#64748B';

              return (
                <View
                  key={stage.stageNumber}
                  style={[
                    styles.stageCard,
                    stage.isCurrent && styles.stageCardCurrent,
                  ]}
                >
                  <View style={styles.stageTopRow}>
                    <View style={styles.stageNumCircle}>
                      <Text style={styles.stageNumText}>{stage.stageNumber}</Text>
                    </View>
                    <View style={styles.stageTitleCol}>
                      <Text style={styles.stageTitle}>{stage.title}</Text>
                      <Text style={styles.stageRole}>{stage.targetRole}</Text>
                    </View>
                    <View style={[styles.stageBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.stageBadgeText, { color: statusColor }]}>
                        {stage.isCompleted ? 'PASSED ✓' : stage.isCurrent ? 'ACTIVE' : 'LOCKED'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.stageDesc}>{stage.description}</Text>

                  <View style={styles.skillsRow}>
                    {stage.requiredSkills.map((sk, sIdx) => (
                      <View key={sIdx} style={styles.skillPill}>
                        <Text style={styles.skillPillText}>{sk}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.stageFooter}>
                    <Text style={styles.stageFootProgress}>Progress: {stage.completionPercentage}%</Text>
                    <TouchableOpacity
                      style={styles.stageActionBtn}
                      onPress={() => {
                        if (stage.courseIds.length > 0) {
                          navigate('CourseRoadmap', { courseId: stage.courseIds[0] });
                        } else {
                          navigate('Courses');
                        }
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.stageActionBtnText}>
                        {stage.isCompleted ? 'Review Stage' : 'Continue Stage'}
                      </Text>
                      <Ionicons name="arrow-forward" size={12} color="#0284C7" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </StaggeredFadeIn>
        </ScrollView>
      )}

      {/* Global AI Career Teacher Modal */}
      <GlobalAITeacherModal
        visible={aiModalVisible}
        onClose={() => setAiModalVisible(false)}
      />
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  darkContainer: {
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  targetBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 0.8,
  },
  compBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  compBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroRole: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  heroSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  gaugeContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  gaugeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  gaugePercent: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10B981',
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  heroStatItem: {
    alignItems: 'center',
  },
  heroStatNum: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  heroStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  coachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  coachBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.8,
  },
  missionCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
  },
  missionLeft: {
    flex: 1,
    marginRight: 10,
  },
  missionCategoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  missionCategoryText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  missionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  missionMetaText: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 3,
    fontWeight: '600',
  },
  startActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  startActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  pillarsGrid: {
    gap: 10,
    marginBottom: 16,
  },
  pillarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pillarIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pillarTitleCol: {
    flex: 1,
  },
  pillarName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  pillarWeight: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  pillarPct: {
    fontSize: 14,
    fontWeight: '900',
  },
  stageProgressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stageCardCurrent: {
    borderColor: '#6366F1',
    borderWidth: 2,
  },
  stageTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageNumCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stageNumText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  stageTitleCol: {
    flex: 1,
  },
  stageTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  stageRole: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    marginTop: 1,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stageBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  stageDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 10,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  skillPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  stageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  stageFootProgress: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  stageActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stageActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
  },
});

