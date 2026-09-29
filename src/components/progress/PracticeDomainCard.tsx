import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DomainProgressMetrics } from '../../models/Analytics';
import { useTheme } from '../../theme/ThemeContext';

interface PracticeDomainCardProps {
  activeDomain: 'aptitude' | 'reasoning' | 'verbal_english' | 'english_speaking';
  domainData: DomainProgressMetrics | null;
  onSelectDomain: (domain: 'aptitude' | 'reasoning' | 'verbal_english' | 'english_speaking') => void;
}

export const PracticeDomainCard: React.FC<PracticeDomainCardProps> = ({
  activeDomain,
  domainData,
  onSelectDomain,
}) => {
  const { theme } = useTheme();

  const tabs: Array<{ id: 'aptitude' | 'reasoning' | 'verbal_english' | 'english_speaking'; label: string; icon: string }> = [
    { id: 'aptitude', label: 'Aptitude', icon: 'calculator-outline' },
    { id: 'reasoning', label: 'Reasoning', icon: 'bulb-outline' },
    { id: 'verbal_english', label: 'Verbal Eng', icon: 'book-outline' },
    { id: 'english_speaking', label: 'Speaking', icon: 'mic-outline' },
  ];

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceCard, borderColor: theme.colors.border }]}>
      {/* Domain Selection Tabs */}
      <View style={styles.tabsRow}>
        {tabs.map((t) => {
          const isSelected = activeDomain === t.id;
          return (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.tabBtn,
                {
                  backgroundColor: isSelected ? theme.colors.primary : `${theme.colors.surface}90`,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                },
              ]}
              onPress={() => onSelectDomain(t.id)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary },
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {domainData ? (
        <View style={styles.content}>
          {/* Header Stats */}
          <View style={styles.metricsRow}>
            <View style={[styles.metricBox, { backgroundColor: `${theme.colors.surface}80`, borderColor: theme.colors.border }]}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Curriculum Progress</Text>
              <Text style={[styles.metricVal, { color: theme.colors.textPrimary }]}>
                {domainData.topicsCompleted} <Text style={[styles.metricSub, { color: theme.colors.textSecondary }]}>/ {domainData.topicsTotal}</Text>
              </Text>
              <Text style={[styles.percentBadge, { color: theme.colors.primary }]}>{domainData.completionPercentage}%</Text>
            </View>

            <View style={[styles.metricBox, { backgroundColor: `${theme.colors.surface}80`, borderColor: theme.colors.border }]}>
              <Text style={[styles.metricLabel, { color: theme.colors.textSecondary }]}>Practice Accuracy</Text>
              <Text style={[styles.metricVal, { color: '#10B981' }]}>
                {domainData.accuracyPercentage}%
              </Text>
              <Text style={[styles.metricSub, { color: theme.colors.textSecondary }]}>
                {domainData.questionsCorrect} / {domainData.questionsAttempted} correct
              </Text>
            </View>
          </View>

          {/* English Speaking specific metrics if applicable */}
          {activeDomain === 'english_speaking' && (
            <View style={[styles.speakingBox, { backgroundColor: `${theme.colors.primary}10`, borderColor: theme.colors.primary }]}>
              <View style={styles.speakingStat}>
                <Ionicons name="mic-circle-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.speakingText, { color: theme.colors.textPrimary }]}>
                  {domainData.speakingSessionsCount || 0} Sessions
                </Text>
              </View>
              <View style={styles.speakingStat}>
                <Ionicons name="chatbubbles-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.speakingText, { color: theme.colors.textPrimary }]}>
                  {domainData.speakingScenariosCount || 0} Scenarios
                </Text>
              </View>
              <View style={styles.speakingStat}>
                <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                <Text style={[styles.speakingText, { color: theme.colors.textPrimary }]}>
                  {domainData.speakingMinutes || 0} mins spoken
                </Text>
              </View>
            </View>
          )}

          {/* Difficulty Breakdown */}
          <View style={styles.difficultySection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>PRACTICE DIFFICULTY BREAKDOWN</Text>
            <View style={styles.diffRow}>
              <View style={styles.diffItem}>
                <Text style={[styles.diffLabel, { color: '#10B981' }]}>Easy</Text>
                <Text style={[styles.diffVal, { color: theme.colors.textPrimary }]}>
                  {domainData.difficultyBreakdown.easy.accuracy}%
                </Text>
                <Text style={[styles.diffAtt, { color: theme.colors.textSecondary }]}>
                  {domainData.difficultyBreakdown.easy.attempted} attempts
                </Text>
              </View>
              <View style={styles.diffItem}>
                <Text style={[styles.diffLabel, { color: '#F59E0B' }]}>Medium</Text>
                <Text style={[styles.diffVal, { color: theme.colors.textPrimary }]}>
                  {domainData.difficultyBreakdown.medium.accuracy}%
                </Text>
                <Text style={[styles.diffAtt, { color: theme.colors.textSecondary }]}>
                  {domainData.difficultyBreakdown.medium.attempted} attempts
                </Text>
              </View>
              <View style={styles.diffItem}>
                <Text style={[styles.diffLabel, { color: '#EF4444' }]}>Hard</Text>
                <Text style={[styles.diffVal, { color: theme.colors.textPrimary }]}>
                  {domainData.difficultyBreakdown.hard.accuracy}%
                </Text>
                <Text style={[styles.diffAtt, { color: theme.colors.textSecondary }]}>
                  {domainData.difficultyBreakdown.hard.attempted} attempts
                </Text>
              </View>
            </View>
          </View>

          {/* Weak Topics (Section 29) */}
          {domainData.weakTopics.length > 0 && (
            <View style={styles.topicListSection}>
              <View style={styles.topicListHeader}>
                <Ionicons name="warning-outline" size={16} color="#EF4444" />
                <Text style={[styles.topicListTitle, { color: '#EF4444' }]}>Topics Needing Practice (&lt;60% accuracy)</Text>
              </View>
              {domainData.weakTopics.slice(0, 3).map((w, idx) => (
                <View key={idx} style={[styles.topicRow, { borderBottomColor: theme.colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.topicName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{w.topicTitle}</Text>
                    <Text style={[styles.topicSub, { color: theme.colors.textSecondary }]}>{w.courseName} • {w.attempts} attempts</Text>
                  </View>
                  <View style={[styles.accuracyTag, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={[styles.accuracyTagText, { color: '#DC2626' }]}>{w.accuracy}%</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Strong Topics (Section 30) */}
          {domainData.strongTopics.length > 0 && (
            <View style={styles.topicListSection}>
              <View style={styles.topicListHeader}>
                <Ionicons name="sparkles-outline" size={16} color="#10B981" />
                <Text style={[styles.topicListTitle, { color: '#10B981' }]}>Strong Topics (≥80% accuracy)</Text>
              </View>
              {domainData.strongTopics.slice(0, 3).map((s, idx) => (
                <View key={idx} style={[styles.topicRow, { borderBottomColor: theme.colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.topicName, { color: theme.colors.textPrimary }]} numberOfLines={1}>{s.topicTitle}</Text>
                    <Text style={[styles.topicSub, { color: theme.colors.textSecondary }]}>{s.courseName} • {s.attempts} attempts</Text>
                  </View>
                  <View style={[styles.accuracyTag, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.accuracyTagText, { color: '#059669' }]}>{s.accuracy}%</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    gap: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  metricBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  percentBadge: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  speakingBox: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  speakingStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speakingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  difficultySection: {
    paddingTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8,
  },
  diffItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  diffLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  diffVal: {
    fontSize: 14,
    fontWeight: '800',
    marginVertical: 2,
  },
  diffAtt: {
    fontSize: 10,
  },
  topicListSection: {
    marginTop: 4,
  },
  topicListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  topicListTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  topicName: {
    fontSize: 13,
    fontWeight: '600',
  },
  topicSub: {
    fontSize: 11,
    marginTop: 2,
  },
  accuracyTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  accuracyTagText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
