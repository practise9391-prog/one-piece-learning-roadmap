import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { smartLearningService } from '../../services/SmartLearningService';
import { InterviewReadinessDomain } from '../../models/SmartLearning';

export const InterviewPrepScreen: React.FC = () => {
  const { goBack, navigate } = useAppNavigation();

  const [domains, setDomains] = useState<InterviewReadinessDomain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const data = await smartLearningService.getInterviewReadiness();
      setDomains(data);
    } catch (err) {
      console.warn('Failed to load interview readiness:', err);
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

  const totalTopics = domains.reduce((acc, d) => acc + d.total_topics, 0);
  const completedTopics = domains.reduce((acc, d) => acc + d.completed_topics, 0);
  const overallReadiness = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <AppShell title="Interview Preparation" showBackButton onBackPress={goBack}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#38BDF8" />
        }
      >
        {/* Readiness Summary Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.heroPre}>Technical & Professional Audit</Text>
          <Text style={styles.heroTitle}>Comprehensive Interview Readiness</Text>
          <Text style={styles.heroDesc}>
            Evaluated across 10 curriculum tracks using your real completion and test runs.
          </Text>

          <View style={styles.overallRow}>
            <View style={styles.overallStat}>
              <Text style={styles.overallValue}>{overallReadiness}%</Text>
              <Text style={styles.overallLabel}>Overall Readiness</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.overallStat}>
              <Text style={styles.overallValue}>
                {completedTopics} / {totalTopics}
              </Text>
              <Text style={styles.overallLabel}>Curriculum Topics</Text>
            </View>
          </View>
        </View>

        {/* AI Interview Coach Prompt Banner */}
        <TouchableOpacity
          style={styles.coachBanner}
          onPress={() => navigate('AIInterview')}
          activeOpacity={0.85}
        >
          <View style={styles.coachIconCircle}>
            <Ionicons name="chatbubbles" size={20} color="#38BDF8" />
          </View>
          <View style={styles.coachTextCol}>
            <Text style={styles.coachTitle}>Mock Interview with AI Coach</Text>
            <Text style={styles.coachDesc}>
              Practice Technical, HR, and Behavioral rounds with instant evaluation
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#38BDF8" />
        </TouchableOpacity>

        {/* Domain Breakdown Cards */}
        <Text style={styles.sectionTitle}>Domain-by-Domain Readiness</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#38BDF8" style={{ marginTop: 30 }} />
        ) : (
          domains.map((d) => {
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
              <View key={d.category} style={styles.domainCard}>
                <View style={styles.domainHeader}>
                  <Text style={styles.domainTitle}>{d.category}</Text>
                  <View style={[styles.statusTag, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{d.status}</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${d.readiness_percentage}%`, backgroundColor: statusColor },
                    ]}
                  />
                </View>

                {/* Metrics */}
                <View style={styles.domainFooter}>
                  <Text style={styles.footerText}>
                    Progress: {d.completed_topics} / {d.total_topics} ({d.readiness_percentage}%)
                  </Text>
                  <Text style={styles.footerText}>Practice Accuracy: {d.practice_accuracy}%</Text>
                </View>
              </View>
            );
          })
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
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#38BDF830',
    marginBottom: 16,
  },
  heroPre: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  heroDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 18,
  },
  overallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
  },
  overallStat: {
    alignItems: 'center',
  },
  overallValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#38BDF8',
  },
  overallLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#334155',
  },
  coachBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#38BDF850',
    marginBottom: 20,
  },
  coachIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#38BDF820',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coachTextCol: {
    flex: 1,
  },
  coachTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  coachDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  domainCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  domainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  domainTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  barBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    marginBottom: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  domainFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#94A3B8',
  },
});
