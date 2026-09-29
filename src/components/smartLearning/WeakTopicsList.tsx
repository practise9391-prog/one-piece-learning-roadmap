import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WeakTopicItem } from '../../models/SmartLearning';
import { MasteryBadge } from './MasteryBadge';

interface WeakTopicsListProps {
  topics: WeakTopicItem[];
  onPracticeTopic: (item: WeakTopicItem) => void;
}

export const WeakTopicsList: React.FC<WeakTopicsListProps> = ({
  topics,
  onPracticeTopic,
}) => {
  if (topics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="shield-checkmark" size={28} color="#10B981" />
        <Text style={styles.emptyTitle}>No weak topics detected</Text>
        <Text style={styles.emptySubtitle}>
          Your practice accuracy is solid across all attempted concepts!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {topics.map((item) => (
        <View key={item.topic_id} style={styles.itemCard}>
          <View style={styles.headerRow}>
            <Text style={styles.courseTag}>{item.course_name}</Text>
            <MasteryBadge weakLabel={item.label} />
          </View>

          <Text style={styles.topicTitle}>{item.topic_title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statLabel}>Accuracy:</Text>
              <Text style={[styles.statValue, { color: item.accuracy < 50 ? '#EF4444' : '#F59E0B' }]}>
                {item.accuracy}%
              </Text>
            </View>

            <View style={styles.statChip}>
              <Text style={styles.statLabel}>Failed:</Text>
              <Text style={styles.statValue}>{item.failed_attempts} attempts</Text>
            </View>
          </View>

          <Text style={styles.reasonText}>{item.reason}</Text>

          <TouchableOpacity
            style={styles.practiceButton}
            onPress={() => onPracticeTopic(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="barbell-outline" size={15} color="#38BDF8" />
            <Text style={styles.practiceButtonText}>Practice This Topic</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseTag: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  statValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  reasonText: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 14,
  },
  practiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#38BDF850',
    gap: 6,
  },
  practiceButtonText: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
  },
});
