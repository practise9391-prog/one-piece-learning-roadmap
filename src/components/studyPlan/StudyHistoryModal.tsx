import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { StudySessionHistoryItem } from '../../models/StudyPlan';
import { studyPlanRepository } from '../../repositories/StudyPlanRepository';

interface StudyHistoryModalProps {
  visible: boolean;
  onClose: () => void;
}

export const StudyHistoryModal: React.FC<StudyHistoryModalProps> = ({ visible, onClose }) => {
  const [history, setHistory] = useState<StudySessionHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (visible) {
      loadHistory();
    }
  }, [visible]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await studyPlanRepository.getStudyHistory(40);
      setHistory(data);
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  };

  const totalMinutes = history.reduce((sum, item) => sum + item.durationMinutes, 0);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Study Session History</Text>
              <Text style={styles.modalSub}>
                {history.length} completed voyages • {Math.round(totalMinutes / 60)}h {totalMinutes % 60}m studied
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : history.length === 0 ? (
            <View style={styles.centerContainer}>
              <Ionicons name="hourglass-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Study Sessions Yet</Text>
              <Text style={styles.emptySub}>
                Start your first study session from today's plan to build your logbook.
              </Text>
            </View>
          ) : (
            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.historyCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardDate}>{item.date}</Text>
                    <View style={styles.statusBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#10B981" style={{ marginRight: 3 }} />
                      <Text style={styles.statusText}>Completed</Text>
                    </View>
                  </View>

                  <Text style={styles.courseText}>{item.courseName}</Text>
                  {item.moduleTitle ? <Text style={styles.moduleText}>{item.moduleTitle}</Text> : null}
                  <Text style={styles.topicText}>{item.topicTitle}</Text>

                  <View style={styles.footerRow}>
                    <View style={styles.durationTag}>
                      <Ionicons name="timer-outline" size={14} color="#0284C7" style={{ marginRight: 4 }} />
                      <Text style={styles.durationText}>{item.durationMinutes} min</Text>
                    </View>
                    <Text style={styles.sessionTypeText}>{item.sessionType}</Text>
                  </View>
                </View>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  centerContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  listContent: {
    padding: 20,
  },
  historyCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  courseText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  moduleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  topicText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  durationTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
  },
  sessionTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
});
