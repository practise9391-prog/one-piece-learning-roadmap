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
import { RevisionItem, WeakTopicItem } from '../../models/SmartLearning';

type RevisionTab = 'DUE_TODAY' | 'COMING_SOON' | 'RECENTLY_REVISED' | 'NEEDS_PRACTICE';

export const SmartRevisionScreen: React.FC = () => {
  const { goBack, navigate } = useAppNavigation();

  const [activeTab, setActiveTab] = useState<RevisionTab>('DUE_TODAY');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const [dueItems, setDueItems] = useState<RevisionItem[]>([]);
  const [upcomingItems, setUpcomingItems] = useState<RevisionItem[]>([]);
  const [recentItems, setRecentItems] = useState<RevisionItem[]>([]);
  const [weakItems, setWeakItems] = useState<WeakTopicItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [due, upcoming, recent, weak] = await Promise.all([
        smartLearningService.getDueRevisions(),
        smartLearningService.getUpcomingRevisions(),
        smartLearningService.getRecentlyRevised(),
        smartLearningService.getWeakTopics(),
      ]);

      setDueItems(due);
      setUpcomingItems(upcoming);
      setRecentItems(recent);
      setWeakItems(weak);
    } catch (err) {
      console.warn('Failed to load revisions:', err);
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

  const handleStartRevision = async (item: RevisionItem) => {
    Alert.alert(
      'Start Spaced Revision',
      `Begin quick revision for "${item.topic_title || 'concept'}"? Completing this review reinforces memory and awards +15 XP!`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Practice Now',
          onPress: () => {
            navigate('CodingProblem', {
              topicId: item.topic_id,
              courseId: item.course_id,
            });
          },
        },
        {
          text: 'Mark Reviewed (+15 XP)',
          onPress: async () => {
            try {
              const res = await smartLearningService.completeTopicRevision(item.id, 85);
              Alert.alert(
                'Revision Complete! 🌟',
                `Awarded +${res.xpAwarded} XP and +${res.pointsAwarded} Points. Next review scheduled for ${res.nextRevisionDate}.`
              );
              loadData();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Could not complete revision');
            }
          },
        },
      ]
    );
  };

  return (
    <AppShell title="Revision Center" showBackButton onBackPress={goBack}>
      <View style={styles.container}>
        {/* Tabs Bar */}
        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
            {[
              { id: 'DUE_TODAY', label: `Due Today (${dueItems.length})`, icon: 'time-outline' },
              { id: 'COMING_SOON', label: `Coming Soon (${upcomingItems.length})`, icon: 'calendar-outline' },
              { id: 'RECENTLY_REVISED', label: `Recently Revised (${recentItems.length})`, icon: 'checkmark-done-outline' },
              { id: 'NEEDS_PRACTICE', label: `Needs Practice (${weakItems.length})`, icon: 'barbell-outline' },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                  onPress={() => setActiveTab(tab.id as RevisionTab)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={14}
                    color={active ? '#38BDF8' : '#94A3B8'}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* List Content */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
          }
        >
          {loading ? (
            <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 40 }} />
          ) : activeTab === 'DUE_TODAY' ? (
            dueItems.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="checkmark-circle-outline" size={40} color="#10B981" />
                <Text style={styles.emptyTitle}>No Revisions Due Today!</Text>
                <Text style={styles.emptySubtitle}>
                  Great job keeping up with your learning schedule. Continue with your new course topics.
                </Text>
              </View>
            ) : (
              dueItems.map((item) => (
                <View key={item.id} style={styles.revisionCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.courseName}>{item.course_name}</Text>
                    <View style={styles.priorityTag}>
                      <Text style={styles.priorityTagText}>{item.priority}</Text>
                    </View>
                  </View>

                  <Text style={styles.topicTitle}>{item.topic_title}</Text>
                  <Text style={styles.reasonText}>{item.reason}</Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.intervalInfo}>
                      <Ionicons name="repeat" size={14} color="#94A3B8" />
                      <Text style={styles.intervalText}>
                        Interval: {item.interval_days}d (Round {item.repetition_count + 1})
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.startBtn}
                      onPress={() => handleStartRevision(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.startBtnText}>Start Revision</Text>
                      <Ionicons name="arrow-forward" size={14} color="#0F172A" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )
          ) : activeTab === 'COMING_SOON' ? (
            upcomingItems.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="calendar-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Upcoming Revisions</Text>
                <Text style={styles.emptySubtitle}>
                  As you complete topics in your curriculum, spaced repetition checkpoints will appear here.
                </Text>
              </View>
            ) : (
              upcomingItems.map((item) => (
                <View key={item.id} style={styles.revisionCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.courseName}>{item.course_name}</Text>
                    <Text style={styles.dueInText}>Due on {item.scheduled_date}</Text>
                  </View>

                  <Text style={styles.topicTitle}>{item.topic_title}</Text>
                  <Text style={styles.reasonText}>{item.reason}</Text>
                </View>
              ))
            )
          ) : activeTab === 'RECENTLY_REVISED' ? (
            recentItems.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="time-outline" size={40} color="#94A3B8" />
                <Text style={styles.emptyTitle}>No Recent Revisions</Text>
                <Text style={styles.emptySubtitle}>Completed revisions will be logged here with interval updates.</Text>
              </View>
            ) : (
              recentItems.map((item) => (
                <View key={item.id} style={styles.revisionCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.courseName}>{item.course_name}</Text>
                    <View style={styles.reviewedTag}>
                      <Text style={styles.reviewedText}>✓ Revised</Text>
                    </View>
                  </View>

                  <Text style={styles.topicTitle}>{item.topic_title}</Text>
                  <Text style={styles.reasonText}>
                    Last reviewed on {item.last_revision_date}. Next review scheduled for {item.next_revision_date}.
                  </Text>
                </View>
              ))
            )
          ) : (
            // NEEDS PRACTICE
            weakItems.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="shield-checkmark-outline" size={40} color="#10B981" />
                <Text style={styles.emptyTitle}>All Concepts Strong</Text>
                <Text style={styles.emptySubtitle}>No topics are currently lagging in practice accuracy.</Text>
              </View>
            ) : (
              weakItems.map((item) => (
                <View key={item.topic_id} style={styles.revisionCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.courseName}>{item.course_name}</Text>
                    <Text style={[styles.dueInText, { color: '#EF4444' }]}>Accuracy: {item.accuracy}%</Text>
                  </View>

                  <Text style={styles.topicTitle}>{item.topic_title}</Text>
                  <Text style={styles.reasonText}>{item.reason}</Text>

                  <TouchableOpacity
                    style={[styles.startBtn, { marginTop: 12 }]}
                    onPress={() => navigate('CodingProblem', { topicId: item.topic_id, courseId: item.course_id })}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="barbell-outline" size={14} color="#0F172A" />
                    <Text style={styles.startBtnText}>Practice Now</Text>
                  </TouchableOpacity>
                </View>
              ))
            )
          )}
        </ScrollView>
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  tabsContainer: {
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingVertical: 10,
  },
  tabsRow: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tabButtonActive: {
    backgroundColor: '#38BDF820',
    borderColor: '#38BDF8',
  },
  tabText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  revisionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  courseName: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  priorityTag: {
    backgroundColor: '#EF444420',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  priorityTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
  },
  reviewedTag: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  reviewedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#10B981',
  },
  dueInText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  reasonText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  intervalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  intervalText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    gap: 6,
  },
  startBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
