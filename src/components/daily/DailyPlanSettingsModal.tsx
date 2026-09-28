import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { DailyLearningSettings, PreferredStudyTime } from '../../models/DailyLearning';
import { dailyLearningRepository } from '../../repositories/DailyLearningRepository';

interface DailyPlanSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onSettingsSaved: () => void;
}

export const DailyPlanSettingsModal: React.FC<DailyPlanSettingsModalProps> = ({
  visible,
  onClose,
  onSettingsSaved,
}) => {
  const [settings, setSettings] = useState<DailyLearningSettings | null>(null);
  const [targetMins, setTargetMins] = useState<number>(120);
  const [aptQuestions, setAptQuestions] = useState<number>(10);
  const [reasQuestions, setReasQuestions] = useState<number>(10);
  const [engQuestions, setEngQuestions] = useState<number>(10);
  const [speakingMins, setSpeakingMins] = useState<number>(15);
  const [preferredTime, setPreferredTime] = useState<PreferredStudyTime>('Evening');
  const [activeCourses, setActiveCourses] = useState<string[]>([]);

  const allAvailableCourses = [
    { id: 'python', label: 'Python' },
    { id: 'django', label: 'Django' },
    { id: 'sql', label: 'SQL' },
    { id: 'dsa', label: 'DSA' },
    { id: 'git', label: 'Git' },
    { id: 'linux', label: 'Linux' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'aptitude', label: 'Aptitude' },
    { id: 'reasoning', label: 'Reasoning' },
    { id: 'verbal_english', label: 'Verbal English' },
    { id: 'english_speaking', label: 'English Speaking' },
  ];

  useEffect(() => {
    if (visible) {
      dailyLearningRepository.getDailySettings().then((s) => {
        setSettings(s);
        setTargetMins(s.targetMinutes);
        setAptQuestions(s.aptitudeQuestions);
        setReasQuestions(s.reasoningQuestions);
        setEngQuestions(s.englishQuestions);
        setSpeakingMins(s.speakingMinutes);
        setPreferredTime(s.preferredTime);
        setActiveCourses(s.activeCourses);
      });
    }
  }, [visible]);

  const toggleCourse = (cId: string) => {
    if (activeCourses.includes(cId)) {
      if (activeCourses.length <= 1) {
        Alert.alert('Notice', 'Please keep at least one active course in your daily rotation.');
        return;
      }
      setActiveCourses(activeCourses.filter((id) => id !== cId));
    } else {
      setActiveCourses([...activeCourses, cId]);
    }
  };

  const handleSave = async () => {
    await dailyLearningRepository.updateDailySettings({
      targetMinutes: targetMins,
      aptitudeQuestions: aptQuestions,
      reasoningQuestions: reasQuestions,
      englishQuestions: engQuestions,
      speakingMinutes: speakingMins,
      preferredTime,
      activeCourses,
    });
    onSettingsSaved();
    onClose();
  };

  const timeOptions = [
    { label: '30 min', val: 30 },
    { label: '1 hour', val: 60 },
    { label: '1.5 hours', val: 90 },
    { label: '2 hours', val: 120 },
    { label: '3 hours', val: 180 },
    { label: '4 hours', val: 240 },
    { label: '5+ hours', val: 300 },
  ];

  const preferredOptions: PreferredStudyTime[] = ['Morning', 'Afternoon', 'Evening', 'Night'];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Learning Preferences</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
          {/* SECTION 1: DAILY STUDY TARGET */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="timer-outline" size={20} color="#0284C7" />
              <Text style={styles.sectionTitle}>Daily Study Time Target</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Target allocated across technical, aptitude, reasoning, and speaking tasks.
            </Text>

            <View style={styles.chipsWrap}>
              {timeOptions.map((opt) => {
                const isSelected = targetMins === opt.val;
                return (
                  <TouchableOpacity
                    key={opt.val}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setTargetMins(opt.val)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SECTION 2: PREFERRED STUDY TIME */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sunny-outline" size={20} color="#D97706" />
              <Text style={styles.sectionTitle}>Preferred Study Routine</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              When during the day you prefer to tackle your main focus sessions.
            </Text>

            <View style={styles.chipsWrap}>
              {preferredOptions.map((opt) => {
                const isSelected = preferredTime === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    onPress={() => setPreferredTime(opt)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SECTION 3: DAILY QUESTION LIMITS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="help-buoy-outline" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Daily Question Limits</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Avoid burnout by calibrating daily practice drill sizes.
            </Text>

            {/* Aptitude Limit */}
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Aptitude Questions / Day:</Text>
              <View style={styles.numberStepper}>
                {[5, 10, 15, 20].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.stepperBtn, aptQuestions === num && styles.stepperBtnActive]}
                    onPress={() => setAptQuestions(num)}
                  >
                    <Text style={[styles.stepperText, aptQuestions === num && styles.stepperTextActive]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reasoning Limit */}
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>Reasoning Questions / Day:</Text>
              <View style={styles.numberStepper}>
                {[5, 10, 15, 20].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.stepperBtn, reasQuestions === num && styles.stepperBtnActive]}
                    onPress={() => setReasQuestions(num)}
                  >
                    <Text style={[styles.stepperText, reasQuestions === num && styles.stepperTextActive]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Verbal English Limit */}
            <View style={styles.sliderRow}>
              <Text style={styles.sliderLabel}>English Questions / Day:</Text>
              <View style={styles.numberStepper}>
                {[5, 10, 15, 20].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.stepperBtn, engQuestions === num && styles.stepperBtnActive]}
                    onPress={() => setEngQuestions(num)}
                  >
                    <Text style={[styles.stepperText, engQuestions === num && styles.stepperTextActive]}>
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* SECTION 4: ACTIVE COURSES ROTATION */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="apps-outline" size={20} color="#7C3AED" />
              <Text style={styles.sectionTitle}>Active Courses in Daily Rotation</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Tap to include or exclude courses from automatic daily plan generation.
            </Text>

            <View style={styles.chipsWrap}>
              {allAvailableCourses.map((c) => {
                const isActive = activeCourses.includes(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.courseChip, isActive && styles.courseChipActive]}
                    onPress={() => toggleCourse(c.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isActive ? 'checkbox' : 'square-outline'}
                      size={16}
                      color={isActive ? '#FFFFFF' : '#64748B'}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={[styles.courseChipText, isActive && styles.courseChipTextActive]}>
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>SAVE DAILY PREFERENCES</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  closeBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 18,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: {
    backgroundColor: '#0284C7',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sliderRow: {
    marginBottom: 14,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  numberStepper: {
    flexDirection: 'row',
  },
  stepperBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 6,
  },
  stepperBtnActive: {
    backgroundColor: Colors.primary,
  },
  stepperText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#475569',
  },
  stepperTextActive: {
    color: '#FFFFFF',
  },
  courseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  courseChipActive: {
    backgroundColor: '#7C3AED',
  },
  courseChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  courseChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
