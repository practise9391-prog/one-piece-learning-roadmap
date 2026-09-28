import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { StudyPlanItem } from '../../models/StudyPlan';
import { studyPlanRepository } from '../../repositories/StudyPlanRepository';

interface RescheduleTopicModalProps {
  visible: boolean;
  item: StudyPlanItem | null;
  onClose: () => void;
  onRescheduled: () => void;
}

export const RescheduleTopicModal: React.FC<RescheduleTopicModalProps> = ({
  visible,
  item,
  onClose,
  onRescheduled,
}) => {
  if (!item) return null;

  const [customDate, setCustomDate] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  const handleAction = async (target: 'TODAY' | 'TOMORROW' | 'THIS_WEEK' | 'CUSTOM_DATE' | 'CANCEL') => {
    if (target === 'CUSTOM_DATE') {
      if (!customDate || !/^\d{4}-\d{2}-\d{2}$/.test(customDate.trim())) {
        Alert.alert('Invalid Format', 'Please enter date formatted as YYYY-MM-DD (e.g. 2026-10-05).');
        return;
      }
    }

    try {
      await studyPlanRepository.rescheduleItem(item.id, target, customDate.trim());
      onRescheduled();
      onClose();
    } catch (err) {
      Alert.alert('Error', 'Failed to reschedule topic.');
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.badgeText}>RESCHEDULE MISSION</Text>
              <Text style={styles.titleText}>{item.topicTitle}</Text>
              <Text style={styles.courseSubtext}>{item.courseName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <Text style={styles.promptText}>
            Where would you like to move this study task?
          </Text>

          {/* Action options */}
          <View style={styles.optionsList}>
            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => handleAction('TODAY')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="today-outline" size={20} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Continue Today</Text>
                <Text style={styles.optionSub}>Keep active in today's mission list</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => handleAction('TOMORROW')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="arrow-forward-outline" size={20} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Move to Tomorrow</Text>
                <Text style={styles.optionSub}>Add as planned task for tomorrow</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => handleAction('THIS_WEEK')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FAF5FF' }]}>
                <Ionicons name="calendar-outline" size={20} color="#9333EA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Move to This Week</Text>
                <Text style={styles.optionSub}>Schedule for weekend wrap-up</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionRow}
              onPress={() => setShowCustomInput(!showCustomInput)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="alarm-outline" size={20} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionTitle}>Choose Custom Date</Text>
                <Text style={styles.optionSub}>Set a specific calendar date</Text>
              </View>
              <Ionicons name={showCustomInput ? 'chevron-up' : 'chevron-down'} size={18} color="#94A3B8" />
            </TouchableOpacity>

            {showCustomInput && (
              <View style={styles.customDateBox}>
                <TextInput
                  style={styles.dateInput}
                  placeholder="YYYY-MM-DD (e.g. 2026-10-02)"
                  value={customDate}
                  onChangeText={setCustomDate}
                />
                <TouchableOpacity
                  style={styles.applyDateBtn}
                  onPress={() => handleAction('CUSTOM_DATE')}
                >
                  <Text style={styles.applyDateText}>Move</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[styles.optionRow, { borderBottomWidth: 0, marginTop: 4 }]}
              onPress={() => handleAction('CANCEL')}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.optionTitle, { color: '#EF4444' }]}>Cancel Topic for Now</Text>
                <Text style={styles.optionSub}>Skip from today's study plan</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.8,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
    maxWidth: 240,
  },
  courseSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  promptText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 14,
  },
  optionsList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  customDateBox: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  dateInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#0F172A',
  },
  applyDateBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 8,
  },
  applyDateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
