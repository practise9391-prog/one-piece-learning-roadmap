import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { StudyPreferences } from '../../models/StudyPlan';
import { studyPlanRepository } from '../../repositories/StudyPlanRepository';
import { roadmapService } from '../../services/RoadmapService';
import { Course } from '../../models/Course';

interface StudyPreferencesModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const StudyPreferencesModal: React.FC<StudyPreferencesModalProps> = ({
  visible,
  onClose,
  onSaved,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [dailyMinutes, setDailyMinutes] = useState<string>('120');
  const [weeklyMinutes, setWeeklyMinutes] = useState<string>('600');
  const [monthlyMinutes, setMonthlyMinutes] = useState<string>('2400');
  const [sessionMinutes, setSessionMinutes] = useState<string>('25');
  const [preferredCourses, setPreferredCourses] = useState<string[]>([]);
  const [restDays, setRestDays] = useState<string[]>(['Sunday']);
  const [automaticPlanEnabled, setAutomaticPlanEnabled] = useState<boolean>(true);
  const [carryForwardEnabled, setCarryForwardEnabled] = useState<boolean>(true);

  useEffect(() => {
    if (visible) {
      loadPrefs();
    }
  }, [visible]);

  const loadPrefs = async () => {
    const fetchedCourses = await roadmapService.getCourses();
    setCourses(fetchedCourses);

    const prefs = await studyPlanRepository.getStudyPreferences();
    setDailyMinutes(String(prefs.dailyMinutes));
    setWeeklyMinutes(String(prefs.weeklyMinutes));
    setMonthlyMinutes(String(prefs.monthlyMinutes));
    setSessionMinutes(String(prefs.preferredSessionMinutes));
    setPreferredCourses(prefs.preferredCourses);
    setRestDays(prefs.restDays);
    setAutomaticPlanEnabled(prefs.automaticPlanEnabled);
    setCarryForwardEnabled(prefs.carryForwardEnabled);
  };

  const toggleCourse = (courseId: string) => {
    setPreferredCourses((prev) => {
      if (prev.includes(courseId)) {
        return prev.length > 1 ? prev.filter((id) => id !== courseId) : prev;
      }
      return [...prev, courseId];
    });
  };

  const toggleRestDay = (dayName: string) => {
    setRestDays((prev) => {
      if (prev.includes(dayName)) {
        return prev.filter((d) => d !== dayName);
      }
      return [...prev, dayName];
    });
  };

  const handleSave = async () => {
    const dMin = parseInt(dailyMinutes, 10) || 120;
    const wMin = parseInt(weeklyMinutes, 10) || 600;
    const mMin = parseInt(monthlyMinutes, 10) || 2400;
    const sMin = parseInt(sessionMinutes, 10) || 25;

    await studyPlanRepository.updateStudyPreferences({
      dailyMinutes: dMin,
      weeklyMinutes: wMin,
      monthlyMinutes: mMin,
      preferredSessionMinutes: sMin,
      preferredCourses,
      restDays,
      automaticPlanEnabled,
      carryForwardEnabled,
    });

    onSaved();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.modalTitle}>Study Plan Preferences</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Targets Section */}
            <Text style={styles.sectionLabel}>STUDY TARGET DURATIONS</Text>

            <View style={styles.inputGrid}>
              <View style={styles.inputBox}>
                <Text style={styles.inputTitle}>Daily Target</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={dailyMinutes}
                  onChangeText={setDailyMinutes}
                />
                <Text style={styles.inputUnit}>Minutes ({Math.round(parseInt(dailyMinutes || '0', 10) / 60)}h)</Text>
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputTitle}>Weekly Target</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={weeklyMinutes}
                  onChangeText={setWeeklyMinutes}
                />
                <Text style={styles.inputUnit}>Minutes ({Math.round(parseInt(weeklyMinutes || '0', 10) / 60)}h)</Text>
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputTitle}>Monthly Target</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={monthlyMinutes}
                  onChangeText={setMonthlyMinutes}
                />
                <Text style={styles.inputUnit}>Minutes ({Math.round(parseInt(monthlyMinutes || '0', 10) / 60)}h)</Text>
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputTitle}>Default Session</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={sessionMinutes}
                  onChangeText={setSessionMinutes}
                />
                <Text style={styles.inputUnit}>Minutes / Round</Text>
              </View>
            </View>

            {/* Rest Days */}
            <Text style={styles.sectionLabel}>REGULAR REST DAYS (NO TARGETS)</Text>
            <View style={styles.daysRow}>
              {ALL_DAYS.map((day) => {
                const isRest = restDays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayChip, isRest && styles.dayChipRest]}
                    onPress={() => toggleRestDay(day)}
                  >
                    <Text style={[styles.dayChipText, isRest && styles.dayChipTextRest]}>
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Priority Courses */}
            <Text style={styles.sectionLabel}>PRIORITY COURSES FOR BALANCED ROTATION</Text>
            <View style={styles.coursesGrid}>
              {courses.map((c) => {
                const isSelected = preferredCourses.includes(c.id);
                return (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.courseItem, isSelected && styles.courseItemSelected]}
                    onPress={() => toggleCourse(c.id)}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={isSelected ? Colors.primary : '#94A3B8'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[styles.courseItemText, isSelected && styles.courseItemTextSelected]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Automation Toggles */}
            <Text style={styles.sectionLabel}>AUTOMATION & CONTINUITY</Text>
            <View style={styles.toggleCard}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.toggleTitle}>Automatic Plan Generation</Text>
                <Text style={styles.toggleSub}>
                  Calculate realistic daily plans from uncompleted topics automatically.
                </Text>
              </View>
              <Switch
                value={automaticPlanEnabled}
                onValueChange={setAutomaticPlanEnabled}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={automaticPlanEnabled ? Colors.primary : '#F1F5F9'}
              />
            </View>

            <View style={styles.toggleCard}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={styles.toggleTitle}>Carry Forward Unfinished Topics</Text>
                <Text style={styles.toggleSub}>
                  Prompt to continue incomplete missions on the next study day.
                </Text>
              </View>
              <Switch
                value={carryForwardEnabled}
                onValueChange={setCarryForwardEnabled}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={carryForwardEnabled ? Colors.primary : '#F1F5F9'}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save Preferences</Text>
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
    maxHeight: '88%',
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
    marginTop: 10,
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  inputBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inputTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  inputUnit: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 4,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dayChipRest: {
    backgroundColor: '#FAF5FF',
    borderColor: '#C084FC',
  },
  dayChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  dayChipTextRest: {
    color: '#9333EA',
    fontWeight: '800',
  },
  coursesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  courseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  courseItemSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  courseItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  courseItemTextSelected: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
});
