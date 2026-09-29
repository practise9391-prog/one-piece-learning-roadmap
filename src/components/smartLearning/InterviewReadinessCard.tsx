import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { InterviewReadinessDomain } from '../../models/SmartLearning';

interface InterviewReadinessCardProps {
  domains: InterviewReadinessDomain[];
  onOpenDetails: () => void;
}

export const InterviewReadinessCard: React.FC<InterviewReadinessCardProps> = ({
  domains,
  onOpenDetails,
}) => {
  // Compute overall readiness average
  const totalPct = domains.reduce((acc, d) => acc + d.readiness_percentage, 0);
  const avgReadiness = domains.length > 0 ? Math.round(totalPct / domains.length) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="briefcase-outline" size={18} color="#38BDF8" />
          </View>
          <View>
            <Text style={styles.title}>Interview Readiness</Text>
            <Text style={styles.subtitle}>Across 10 Technical & Verbal Domains</Text>
          </View>
        </View>

        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{avgReadiness}%</Text>
        </View>
      </View>

      {/* Top 3 Domain Previews */}
      <View style={styles.domainList}>
        {domains.slice(0, 3).map((d) => {
          let statusColor = '#EF4444';
          let statusBg = '#EF444420';

          if (d.status === 'READY') {
            statusColor = '#10B981';
            statusBg = '#10B98120';
          } else if (d.status === 'DEVELOPING') {
            statusColor = '#F59E0B';
            statusBg = '#F59E0B20';
          }

          return (
            <View key={d.category} style={styles.domainItem}>
              <View style={styles.domainInfoRow}>
                <Text style={styles.domainName}>{d.category}</Text>
                <View style={[styles.statusTag, { backgroundColor: statusBg }]}>
                  <Text style={[styles.statusText, { color: statusColor }]}>{d.status}</Text>
                </View>
              </View>

              <View style={styles.barContainer}>
                <View style={[styles.barFill, { width: `${d.readiness_percentage}%`, backgroundColor: statusColor }]} />
              </View>

              <View style={styles.domainMetaRow}>
                <Text style={styles.domainMetaText}>
                  {d.completed_topics} / {d.total_topics} topics covered
                </Text>
                <Text style={styles.domainMetaText}>Accuracy: {d.practice_accuracy}%</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* View All Button */}
      <TouchableOpacity style={styles.viewAllBtn} onPress={onOpenDetails} activeOpacity={0.8}>
        <Text style={styles.viewAllText}>View All 10 Domains & Gap Analysis</Text>
        <Ionicons name="chevron-forward" size={16} color="#38BDF8" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0284C720',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#0284C720',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38BDF8',
  },
  domainList: {
    gap: 12,
    marginBottom: 14,
  },
  domainItem: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  domainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  domainName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  barContainer: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  domainMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  domainMetaText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#0F172A',
    gap: 6,
  },
  viewAllText: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '700',
  },
});
