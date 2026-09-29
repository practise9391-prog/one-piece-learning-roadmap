import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { smartLearningService } from '../../services/SmartLearningService';
import { LearningInsights } from '../../models/SmartLearning';

export const SmartLearningInsightsScreen: React.FC = () => {
  const { goBack } = useAppNavigation();

  const [insights, setInsights] = useState<LearningInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadInsights = useCallback(async () => {
    try {
      const data = await smartLearningService.getLearningInsights();
      setInsights(data);
    } catch (err) {
      console.warn('Failed to load learning insights:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInsights();
  };

  return (
    <AppShell title="Learning Insights" showBackButton onBackPress={goBack}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
        }
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <Text style={styles.headerPre}>Analytical Digest</Text>
          <Text style={styles.headerTitle}>Objective Learning Patterns</Text>
          <Text style={styles.headerDesc}>
            Factual observations extracted from your persistent local SQLite records.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40 }} />
        ) : !insights ? (
          <Text style={styles.emptyText}>No learning insights available yet.</Text>
        ) : (
          <>
            {/* Pattern Metrics Grid */}
            <Text style={styles.sectionTitle}>Curriculum Activity Signals</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Ionicons name="book-outline" size={20} color="#38BDF8" />
                <Text style={styles.metricVal}>{insights.patterns.most_studied_course}</Text>
                <Text style={styles.metricLbl}>Primary Course</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#10B981" />
                <Text style={styles.metricVal}>{insights.patterns.average_accuracy}%</Text>
                <Text style={styles.metricLbl}>Avg Practice Accuracy</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="time-outline" size={20} color="#F59E0B" />
                <Text style={styles.metricVal}>{insights.patterns.avg_session_duration_mins} min</Text>
                <Text style={styles.metricLbl}>Avg Session Length</Text>
              </View>

              <View style={styles.metricCard}>
                <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
                <Text style={styles.metricVal}>{insights.patterns.completed_topics_this_week}</Text>
                <Text style={styles.metricLbl}>Completed This Week</Text>
              </View>
            </View>

            {/* Strong Areas */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#10B98120' }]}>
                  <Ionicons name="checkmark-done" size={18} color="#10B981" />
                </View>
                <Text style={styles.cardSectionTitle}>Demonstrated Strengths</Text>
              </View>
              <Text style={styles.cardSectionDesc}>
                Concepts where you have achieved consistently high test accuracy (≥ 75%)
              </Text>

              {insights.strong_areas.length === 0 ? (
                <Text style={styles.noneNotice}>Complete more practice challenges to uncover verified strengths.</Text>
              ) : (
                insights.strong_areas.map((it) => (
                  <View key={it.topic_id} style={styles.topicRow}>
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicName}>{it.title}</Text>
                      <Text style={styles.topicMeta}>{it.course}</Text>
                    </View>
                    <View style={styles.accBadge}>
                      <Text style={styles.accText}>{it.accuracy}% accuracy</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Developing Areas */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#F59E0B20' }]}>
                  <Ionicons name="trending-up" size={18} color="#F59E0B" />
                </View>
                <Text style={styles.cardSectionTitle}>Developing Concepts</Text>
              </View>
              <Text style={styles.cardSectionDesc}>
                Topics with moderate comprehension where additional test runs will build confidence
              </Text>

              {insights.developing_areas.length === 0 ? (
                <Text style={styles.noneNotice}>No concepts currently in developing status.</Text>
              ) : (
                insights.developing_areas.map((it) => (
                  <View key={it.topic_id} style={styles.topicRow}>
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicName}>{it.title}</Text>
                      <Text style={styles.topicMeta}>{it.course}</Text>
                    </View>
                    <View style={[styles.accBadge, { backgroundColor: '#F59E0B20' }]}>
                      <Text style={[styles.accText, { color: '#F59E0B' }]}>{it.accuracy}% accuracy</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Revision Required */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.iconCircle, { backgroundColor: '#8B5CF620' }]}>
                  <Ionicons name="repeat" size={18} color="#8B5CF6" />
                </View>
                <Text style={styles.cardSectionTitle}>Spaced Revision Candidates</Text>
              </View>
              <Text style={styles.cardSectionDesc}>
                Topics completed earlier that are approaching memory decay thresholds
              </Text>

              {insights.revision_required.length === 0 ? (
                <Text style={styles.noneNotice}>No topics overdue for spaced repetition.</Text>
              ) : (
                insights.revision_required.map((it) => (
                  <View key={it.topic_id} style={styles.topicRow}>
                    <View style={styles.topicInfo}>
                      <Text style={styles.topicName}>{it.title}</Text>
                      <Text style={styles.topicMeta}>{it.course}</Text>
                    </View>
                    <View style={[styles.accBadge, { backgroundColor: '#8B5CF620' }]}>
                      <Text style={[styles.accText, { color: '#8B5CF6' }]}>{it.days_ago} days ago</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  headerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  headerPre: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  headerDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 8,
    marginBottom: 2,
  },
  metricLbl: {
    fontSize: 11,
    color: '#94A3B8',
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  cardSectionDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 14,
    lineHeight: 16,
  },
  topicRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  topicInfo: {
    flex: 1,
    marginRight: 10,
  },
  topicName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  topicMeta: {
    fontSize: 11,
    color: '#94A3B8',
  },
  accBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  accText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  noneNotice: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 40,
  },
});
