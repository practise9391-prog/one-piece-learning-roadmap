import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { GoalType, GoalPeriod } from '../../models/StudyPlan';
import { studyPlanRepository } from '../../repositories/StudyPlanRepository';

interface CreateGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
  defaultPeriod?: GoalPeriod;
}

const GOAL_TYPES: { type: GoalType; label: string; icon: string; defaultUnit: string }[] = [
  { type: 'TIME_GOAL', label: 'Study Time', icon: 'timer-outline', defaultUnit: 'minutes' },
  { type: 'TOPIC_GOAL', label: 'Topics Completed', icon: 'checkbox-outline', defaultUnit: 'topics' },
  { type: 'MODULE_GOAL', label: 'Module Mastery', icon: 'cube-outline', defaultUnit: 'modules' },
  { type: 'COURSE_GOAL', label: 'Course Progress', icon: 'school-outline', defaultUnit: 'courses' },
  { type: 'SESSION_GOAL', label: 'Study Sessions', icon: 'hourglass-outline', defaultUnit: 'sessions' },
  { type: 'STREAK_GOAL', label: 'Streak Target', icon: 'flame-outline', defaultUnit: 'days' },
];

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  visible,
  onClose,
  onGoalCreated,
  defaultPeriod = 'WEEKLY',
}) => {
  const [period, setPeriod] = useState<GoalPeriod>(defaultPeriod);
  const [goalType, setGoalType] = useState<GoalType>('TIME_GOAL');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [targetValue, setTargetValue] = useState<string>('600');
  const [unit, setUnit] = useState<string>('minutes');

  const handleSelectGoalType = (type: GoalType, defaultUnit: string) => {
    setGoalType(type);
    setUnit(defaultUnit);
    if (!title) {
      if (type === 'TIME_GOAL') {
        setTitle(period === 'WEEKLY' ? '10h Weekly Study Target' : '2h Study Goal');
        setTargetValue(period === 'WEEKLY' ? '600' : '120');
      } else if (type === 'TOPIC_GOAL') {
        setTitle(period === 'WEEKLY' ? 'Complete 15 Topics' : 'Complete 4 Topics');
        setTargetValue(period === 'WEEKLY' ? '15' : '4');
      } else if (type === 'STREAK_GOAL') {
        setTitle('7-Day Study Streak');
        setTargetValue('7');
      } else if (type === 'SESSION_GOAL') {
        setTitle('Complete 5 Focus Sessions');
        setTargetValue('5');
      }
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a goal title.');
      return;
    }

    const val = parseFloat(targetValue);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Invalid Target', 'Please enter a positive numeric target value.');
      return;
    }

    try {
      await studyPlanRepository.createGoal({
        goalType,
        period,
        title: title.trim(),
        description: description.trim() || undefined,
        targetValue: val,
        unit,
      });

      onGoalCreated();
      onClose();
      // Reset
      setTitle('');
      setDescription('');
    } catch (err) {
      Alert.alert('Error', 'Failed to save goal.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Create New Study Goal</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Period Segment */}
            <Text style={styles.sectionLabel}>TIME HORIZON</Text>
            <View style={styles.segmentedContainer}>
              {(['DAILY', 'WEEKLY', 'MONTHLY'] as GoalPeriod[]).map((p) => {
                const isActive = period === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                    onPress={() => setPeriod(p)}
                  >
                    <Text style={[styles.segmentBtnText, isActive && styles.segmentBtnTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Goal Type Cards */}
            <Text style={styles.sectionLabel}>GOAL TYPE</Text>
            <View style={styles.goalTypeGrid}>
              {GOAL_TYPES.map((gt) => {
                const isSelected = goalType === gt.type;
                return (
                  <TouchableOpacity
                    key={gt.type}
                    style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                    onPress={() => handleSelectGoalType(gt.type, gt.defaultUnit)}
                  >
                    <Ionicons
                      name={gt.icon as any}
                      size={20}
                      color={isSelected ? Colors.primary : '#64748B'}
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={[styles.typeCardText, isSelected && styles.typeCardTextSelected]}>
                      {gt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Title & Target */}
            <Text style={styles.sectionLabel}>GOAL TITLE</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Master Percentage Chapters"
              value={title}
              onChangeText={setTitle}
            />

            <View style={styles.targetRow}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.sectionLabel}>TARGET VALUE</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  placeholder="e.g. 600"
                  value={targetValue}
                  onChangeText={setTargetValue}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.sectionLabel}>UNIT</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="minutes, topics, days"
                  value={unit}
                  onChangeText={setUnit}
                />
              </View>
            </View>

            {/* Description */}
            <Text style={styles.sectionLabel}>DESCRIPTION (OPTIONAL)</Text>
            <TextInput
              style={[styles.textInput, { height: 60, textAlignVertical: 'top' }]}
              placeholder="e.g. Finish all aptitude module worked examples and exercises"
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </ScrollView>

          {/* Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Goal</Text>
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
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 6,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
  },
  segmentBtnActive: {
    backgroundColor: Colors.primary,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  segmentBtnTextActive: {
    color: '#FFFFFF',
  },
  goalTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeCard: {
    width: '31%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  typeCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary,
  },
  typeCardText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  typeCardTextSelected: {
    color: Colors.primary,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 12,
  },
  targetRow: {
    flexDirection: 'row',
  },
  footerRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    paddingTop: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  saveBtn: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});
