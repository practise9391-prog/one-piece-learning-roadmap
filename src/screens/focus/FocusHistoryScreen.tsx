import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { studySessionRepository } from '../../repositories/StudySessionRepository';
import { StudySession } from '../../models/Focus';
import { formatMinutesOrHours } from '../../hooks/useFocusTimer';
import { formatDate } from '../../utils/dateUtils';
import { Colors } from '../../theme/colors';

type FilterType = 'today' | 'week' | 'month' | 'all';

export const FocusHistoryScreen: React.FC = () => {
  const { navigate, goBack } = useAppNavigation();

  const [filter, setFilter] = useState<FilterType>('all');
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);

  const loadHistory = useCallback(async (currentFilter: FilterType) => {
    try {
      const data = await studySessionRepository.getStudyTimeHistory(currentFilter);
      setSessions(data);
    } catch (err) {
      console.warn('Failed to load focus history:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadHistory(filter);
  }, [filter, loadHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory(filter);
  };

  const getStatusBadge = (status: StudySession['status']) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'COMPLETED', bg: '#DCFCE7', text: '#15803D' };
      case 'CANCELLED':
        return { label: 'DISCARDED', bg: '#FEE2E2', text: '#B91C1C' };
      case 'PAUSED':
        return { label: 'PAUSED', bg: '#FEF3C7', text: '#B45309' };
      case 'RUNNING':
        return { label: 'ACTIVE', bg: '#E0F2FE', text: '#0369A1' };
    }
  };

  return (
    <AppShell title="FOCUS HISTORY">
      <View style={styles.container}>
        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['today', 'week', 'month', 'all'] as FilterType[]).map((f) => {
            const isSelected = filter === f;
            const labelMap: Record<FilterType, string> = {
              today: 'Today',
              week: 'This Week',
              month: 'This Month',
              all: 'All Time',
            };
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                onPress={() => setFilter(f)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isSelected && styles.filterPillTextActive,
                  ]}
                >
                  {labelMap[f]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading Study History...</Text>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyCrest}>
              <Ionicons name="timer-outline" size={48} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Study Sessions Found</Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'today'
                ? "You haven't logged any focus study sessions today."
                : 'Start your first focus session to build your study voyage log.'}
            </Text>
            <TouchableOpacity
              style={styles.startFocusBtn}
              onPress={() => navigate('FocusMode')}
              activeOpacity={0.85}
            >
              <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.startFocusBtnText}>Start Focus Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.listContent}
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
            {sessions.map((s) => {
              const badge = getStatusBadge(s.status);
              const durationFormatted = formatMinutesOrHours(s.duration_seconds);
              const plannedFormatted = formatMinutesOrHours(s.planned_duration_seconds);
              const dateDisplay = formatDate(s.started_at);

              return (
                <TouchableOpacity
                  key={s.id}
                  style={styles.historyCard}
                  activeOpacity={0.88}
                  onPress={() => setSelectedSession(s)}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.courseRow}>
                      <View style={styles.courseIconBox}>
                        <Ionicons name="compass" size={18} color="#0284C7" />
                      </View>
                      <Text style={styles.courseName} numberOfLines={1}>
                        {s.course_name || 'Technical Island'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                        {badge.label}
                      </Text>
                    </View>
                  </View>

                  {s.module_title ? (
                    <Text style={styles.moduleTitle} numberOfLines={1}>
                      Module: {s.module_title}
                    </Text>
                  ) : null}

                  {s.topic_title ? (
                    <Text style={styles.topicTitle} numberOfLines={1}>
                      Topic: {s.topic_title}
                    </Text>
                  ) : null}

                  <View style={styles.cardFooter}>
                    <View style={styles.durationPill}>
                      <Ionicons name="time-outline" size={14} color="#0284C7" />
                      <Text style={styles.durationText}>
                        Studied: <Text style={{ fontWeight: '800' }}>{durationFormatted}</Text> (Plan: {plannedFormatted})
                      </Text>
                    </View>
                    <Text style={styles.dateText}>{dateDisplay}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Session Detail Modal */}
        <Modal
          visible={!!selectedSession}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedSession(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Session Details</Text>
                <TouchableOpacity
                  onPress={() => setSelectedSession(null)}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              {selectedSession ? (
                <View style={styles.modalBody}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Course Island</Text>
                    <Text style={styles.detailValue}>
                      {selectedSession.course_name || 'General Study'}
                    </Text>
                  </View>

                  {selectedSession.module_title ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Module</Text>
                      <Text style={styles.detailValue}>
                        {selectedSession.module_title}
                      </Text>
                    </View>
                  ) : null}

                  {selectedSession.topic_title ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Topic</Text>
                      <Text style={styles.detailValue}>
                        {selectedSession.topic_title}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.detailDivider} />

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Planned Duration</Text>
                    <Text style={styles.detailValue}>
                      {formatMinutesOrHours(selectedSession.planned_duration_seconds)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Actual Study Time</Text>
                    <Text style={[styles.detailValue, { color: '#0284C7', fontWeight: '800' }]}>
                      {formatMinutesOrHours(selectedSession.duration_seconds)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={styles.detailValue}>
                      {selectedSession.status}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Started</Text>
                    <Text style={styles.detailValue}>
                      {new Date(selectedSession.started_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>

                  {selectedSession.ended_at ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Ended</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedSession.ended_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  ) : null}

                  <View style={styles.noticeBox}>
                    <Ionicons name="information-circle-outline" size={16} color="#0284C7" />
                    <Text style={styles.noticeText}>
                      Session duration records are strictly verified by timestamps to maintain audit integrity.
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        </Modal>
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: '#0284C7',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
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
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyCrest: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  startFocusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  startFocusBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  courseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  courseIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  moduleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 2,
  },
  topicTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 11,
    color: '#334155',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    maxWidth: '65%',
    textAlign: 'right',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  noticeText: {
    fontSize: 11,
    color: '#0369A1',
    marginLeft: 6,
    flex: 1,
    lineHeight: 15,
  },
});
