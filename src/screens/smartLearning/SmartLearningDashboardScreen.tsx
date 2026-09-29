import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { smartLearningService } from '../../services/SmartLearningService';
import {
  SmartRecommendation,
  WeakTopicItem,
  RevisionItem,
  InterviewReadinessDomain,
  StudyPriority,
} from '../../models/SmartLearning';
import { RecommendationHeroCard } from '../../components/smartLearning/RecommendationHeroCard';
import { WeakTopicsList } from '../../components/smartLearning/WeakTopicsList';
import { InterviewReadinessCard } from '../../components/smartLearning/InterviewReadinessCard';
import { AdaptivePlanModal } from '../../components/smartLearning/AdaptivePlanModal';

export const SmartLearningDashboardScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Data states
  const [recommendedTopic, setRecommendedTopic] = useState<SmartRecommendation | null>(null);
  const [weakTopics, setWeakTopics] = useState<WeakTopicItem[]>([]);
  const [dueRevisions, setDueRevisions] = useState<RevisionItem[]>([]);
  const [studyPriorities, setStudyPriorities] = useState<StudyPriority[]>([]);
  const [interviewDomains, setInterviewDomains] = useState<InterviewReadinessDomain[]>([]);

  // AI Assistant Query states
  const [aiQuery, setAiQuery] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Adaptive Plan Modal state
  const [adaptivePlanModalVisible, setAdaptivePlanModalVisible] = useState<boolean>(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [rec, weak, rev, pri, domains] = await Promise.all([
        smartLearningService.getRecommendedTopic(),
        smartLearningService.getWeakTopics(),
        smartLearningService.getDueRevisions(),
        smartLearningService.getStudyPriorities(),
        smartLearningService.getInterviewReadiness(),
      ]);

      setRecommendedTopic(rec);
      setWeakTopics(weak);
      setDueRevisions(rev);
      setStudyPriorities(pri);
      setInterviewDomains(domains);
    } catch (err) {
      console.warn('Failed to load Smart Learning dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleAskAI = async (query: string) => {
    setAiQuery(query);
    setAiLoading(true);
    setAiResponse(null);
    try {
      const answer = await smartLearningService.askAboutLearning(query);
      setAiResponse(answer);
    } catch {
      setAiResponse("Unable to connect to AI Tutor. Your local smart recommendations are still available.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleStartLearning = (rec: SmartRecommendation) => {
    if (rec.is_revision_due) {
      navigate('SmartRevision');
    } else {
      // Navigate to Module or Course details
      navigate('CourseRoadmap', { courseId: rec.course_id, topicId: rec.topic_id });
    }
  };

  const handlePracticeWeakTopic = (item: WeakTopicItem) => {
    // Open practice challenge
    navigate('CodingProblem', { topicId: item.topic_id, courseId: item.course_id });
  };

  const handleGeneratePracticeSet = async () => {
    try {
      const set = await smartLearningService.generatePracticeSet(30);
      if (set.items.length > 0) {
        navigate('CodingProblem', {
          taskId: set.items[0].task_id,
          topicId: set.items[0].topic_id,
          courseId: set.items[0].course_id,
        });
      } else {
        Alert.alert('Practice Set', 'No incomplete practice tasks found. Great job!');
      }
    } catch {
      Alert.alert('Notice', 'Practice engine ready. Explore courses to select a task.');
    }
  };

  return (
    <AppShell title="Smart Learning">
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
        }
      >
        {/* Header Greeting */}
        <View style={styles.headerBox}>
          <Text style={styles.greetingText}>Good Day, Explorer!</Text>
          <Text style={styles.headerTitle}>Your Smart Learning Engine</Text>
          <Text style={styles.headerSubtitle}>
            Continuous personalization based on your actual progress and practice accuracy
          </Text>

          {/* Quick Metrics Bar */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{dueRevisions.length}</Text>
              <Text style={styles.metricLabel}>Revisions Due</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>{weakTopics.length}</Text>
              <Text style={styles.metricLabel}>Needs Practice</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metricItem}>
              <Text style={styles.metricValue}>
                {recommendedTopic ? recommendedTopic.course_name.split(' ')[0] : 'Python'}
              </Text>
              <Text style={styles.metricLabel}>Active Focus</Text>
            </View>
          </View>
        </View>

        {/* Ask AI About My Learning Card */}
        <View style={styles.aiBox}>
          <View style={styles.aiHeader}>
            <View style={styles.aiIconBadge}>
              <Ionicons name="sparkles" size={16} color="#38BDF8" />
            </View>
            <Text style={styles.aiTitle}>Ask AI About My Learning</Text>
          </View>

          <Text style={styles.aiSubtitle}>
            Instant guidance tailored strictly to your real study history and weak topics
          </Text>

          {/* Quick Question Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {[
              'What should I study today?',
              'Which topics need revision?',
              'Why am I struggling with this topic?',
              'Help me prepare for interviews',
            ].map((q, idx) => (
              <TouchableOpacity
                key={`q_${idx}`}
                style={styles.questionChip}
                onPress={() => handleAskAI(q)}
                activeOpacity={0.7}
              >
                <Text style={styles.questionChipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* AI Response Bubble */}
          {aiLoading && (
            <View style={styles.aiLoadingBox}>
              <ActivityIndicator size="small" color="#38BDF8" />
              <Text style={styles.aiLoadingText}>Analyzing your progress records...</Text>
            </View>
          )}

          {aiResponse && !aiLoading && (
            <View style={styles.aiResponseCard}>
              <View style={styles.aiResponseHeader}>
                <Ionicons name="chatbubble-ellipses-outline" size={16} color="#38BDF8" />
                <Text style={styles.aiResponseQuery}>{aiQuery}</Text>
              </View>
              <Text style={styles.aiResponseText}>{aiResponse}</Text>
            </View>
          )}
        </View>

        {/* Featured: Recommended Next */}
        {loading ? (
          <ActivityIndicator size="large" color="#38BDF8" style={{ marginVertical: 30 }} />
        ) : (
          <RecommendationHeroCard
            recommendation={recommendedTopic}
            onStartLearning={handleStartLearning}
          />
        )}

        {/* Quick Hub Navigation Actions */}
        <View style={styles.quickGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => setAdaptivePlanModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#38BDF820' }]}>
              <Ionicons name="calendar-outline" size={20} color="#38BDF8" />
            </View>
            <Text style={styles.actionTitle}>Adaptive Plan</Text>
            <Text style={styles.actionSubtitle}>Synthesize custom schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigate('SmartRevision')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8B5CF620' }]}>
              <Ionicons name="repeat-outline" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.actionTitle}>Revision Center</Text>
            <Text style={styles.actionSubtitle}>{dueRevisions.length} checkpoints due</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleGeneratePracticeSet}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="barbell-outline" size={20} color="#10B981" />
            </View>
            <Text style={styles.actionTitle}>Targeted Practice</Text>
            <Text style={styles.actionSubtitle}>30-min custom session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigate('SmartInsights')}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#F59E0B20' }]}>
              <Ionicons name="analytics-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.actionTitle}>Learning Insights</Text>
            <Text style={styles.actionSubtitle}>Strengths & patterns</Text>
          </TouchableOpacity>
        </View>

        {/* Section: Weak Topics (Needs Practice) */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="fitness-outline" size={20} color="#F59E0B" />
            <Text style={styles.sectionTitle}>Concepts Needing Practice</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Topics with low practice accuracy or repeated failed tests
          </Text>
        </View>

        <WeakTopicsList
          topics={weakTopics}
          onPracticeTopic={handlePracticeWeakTopic}
        />

        {/* Section: Study Priority List */}
        {studyPriorities.length > 0 && (
          <View style={styles.prioritySection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="flag-outline" size={20} color="#38BDF8" />
                <Text style={styles.sectionTitle}>High Priority Study Queue</Text>
              </View>
              <Text style={styles.sectionSubtitle}>
                Ranked by curriculum sequence, revision urgency, and prerequisites
              </Text>
            </View>

            {studyPriorities.slice(0, 4).map((p) => {
              let priColor = '#3B82F6';
              if (p.priority_level === 'URGENT') priColor = '#EF4444';
              else if (p.priority_level === 'HIGH') priColor = '#F59E0B';

              return (
                <View key={p.topic_id} style={styles.priorityCard}>
                  <View style={styles.priorityTopRow}>
                    <Text style={styles.priorityCourse}>{p.course_name}</Text>
                    <View style={[styles.priorityBadge, { backgroundColor: `${priColor}20` }]}>
                      <Text style={[styles.priorityText, { color: priColor }]}>{p.priority_level}</Text>
                    </View>
                  </View>
                  <Text style={styles.priorityTopic}>{p.topic_title}</Text>
                  {p.reasons.length > 0 && (
                    <Text style={styles.priorityReason}>• {p.reasons[0]}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Section: Interview Readiness */}
        <InterviewReadinessCard
          domains={interviewDomains}
          onOpenDetails={() => navigate('InterviewPreparation')}
        />
      </ScrollView>

      {/* Adaptive Plan Modal */}
      <AdaptivePlanModal
        visible={adaptivePlanModalVisible}
        onClose={() => setAdaptivePlanModalVisible(false)}
        onPlanApplied={(count) => {
          Alert.alert('Study Plan Updated', `Added ${count} smart study blocks to today's study plan!`);
        }}
      />
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerBox: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  metricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  aiBox: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#38BDF840',
    marginBottom: 20,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiIconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#38BDF820',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  aiTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  aiSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },
  chipScroll: {
    marginBottom: 10,
  },
  questionChip: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  questionChipText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  aiLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  aiLoadingText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  aiResponseCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  aiResponseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiResponseQuery: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
  },
  aiResponseText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  prioritySection: {
    marginTop: 20,
    marginBottom: 20,
  },
  priorityCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  priorityTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  priorityCourse: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '800',
  },
  priorityTopic: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  priorityReason: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
});
