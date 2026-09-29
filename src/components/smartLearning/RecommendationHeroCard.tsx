import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SmartRecommendation } from '../../models/SmartLearning';
import { MasteryBadge } from './MasteryBadge';
import { WhyThisModal } from './WhyThisModal';

interface RecommendationHeroCardProps {
  recommendation: SmartRecommendation | null;
  onStartLearning: (rec: SmartRecommendation) => void;
}

export const RecommendationHeroCard: React.FC<RecommendationHeroCardProps> = ({
  recommendation,
  onStartLearning,
}) => {
  const [whyModalVisible, setWhyModalVisible] = useState(false);

  if (!recommendation) {
    return (
      <View style={styles.emptyCard}>
        <Ionicons name="sparkles-outline" size={32} color="#94A3B8" />
        <Text style={styles.emptyTitle}>All Caught Up!</Text>
        <Text style={styles.emptySubtitle}>
          Complete your next topic or practice question to unlock customized learning recommendations.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Top Banner Tag */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <View style={styles.recommendedBadge}>
            <Ionicons name="compass" size={13} color="#0284C7" />
            <Text style={styles.recommendedText}>RECOMMENDED NEXT</Text>
          </View>
          {recommendation.is_revision_due && (
            <View style={styles.revisionDueBadge}>
              <Text style={styles.revisionDueText}>REVISION DUE</Text>
            </View>
          )}
        </View>

        <MasteryBadge level={recommendation.mastery_level} />
      </View>

      {/* Course & Module breadcrumbs */}
      <Text style={styles.breadcrumbs}>
        {recommendation.course_name} • {recommendation.module_title}
      </Text>

      {/* Topic Title */}
      <Text style={styles.topicTitle}>{recommendation.topic_title}</Text>

      {/* Meta Chips */}
      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <Ionicons name="time-outline" size={14} color="#94A3B8" />
          <Text style={styles.chipText}>{recommendation.estimated_minutes} min</Text>
        </View>
        <View style={styles.chip}>
          <Ionicons name="speedometer-outline" size={14} color="#94A3B8" />
          <Text style={styles.chipText}>{recommendation.difficulty}</Text>
        </View>
      </View>

      {/* Primary reason quote */}
      <View style={styles.reasonBox}>
        <Ionicons name="information-circle-outline" size={16} color="#38BDF8" style={{ marginTop: 1 }} />
        <Text style={styles.reasonText} numberOfLines={2}>
          {recommendation.primary_reason}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.whyButton}
          onPress={() => setWhyModalVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle-outline" size={16} color="#94A3B8" />
          <Text style={styles.whyButtonText}>Why this?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => onStartLearning(recommendation)}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>
            {recommendation.is_revision_due ? 'Start Revision' : 'Start Learning'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <WhyThisModal
        visible={whyModalVisible}
        recommendation={recommendation}
        onClose={() => setWhyModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#38BDF840',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C720',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  revisionDueBadge: {
    backgroundColor: '#EF444420',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  revisionDueText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  breadcrumbs: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 4,
  },
  topicTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    lineHeight: 26,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  reasonBox: {
    flexDirection: 'row',
    backgroundColor: '#0F172A80',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginBottom: 16,
  },
  reasonText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 18,
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  whyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#334155',
    gap: 6,
  },
  whyButtonText: {
    fontSize: 13,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#38BDF8',
    gap: 8,
  },
  startButtonText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '800',
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginTop: 10,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
