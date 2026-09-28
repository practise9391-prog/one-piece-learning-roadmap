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
import { studyPlanRepository, getTodayDateString } from '../../repositories/StudyPlanRepository';
import { roadmapService } from '../../services/RoadmapService';
import { Course } from '../../models/Course';

interface CreateDailyPlanModalProps {
  visible: boolean;
  onClose: () => void;
  onPlanCreated: () => void;
  initialDateStr?: string;
}

const DURATION_PRESETS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hours', minutes: 90 },
  { label: '2 hours', minutes: 120 },
  { label: '3 hours', minutes: 180 },
  { label: '4 hours', minutes: 240 },
  { label: '5 hours', minutes: 300 },
];

export const CreateDailyPlanModal: React.FC<CreateDailyPlanModalProps> = ({
  visible,
  onClose,
  onPlanCreated,
  initialDateStr,
}) => {
  const targetDate = initialDateStr || getTodayDateString();

  const [mode, setMode] = useState<'TIME' | 'TOPIC'>('TIME');
  const [selectedMinutes, setSelectedMinutes] = useState<number>(120);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('');
  const [isCustomDuration, setIsCustomDuration] = useState<boolean>(false);
  const [targetTopicCount, setTargetTopicCount] = useState<number>(4);

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [isRestDay, setIsRestDay] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');

  const [suggestedTopics, setSuggestedTopics] = useState<any[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      loadInitialData();
    }
  }, [visible]);

  const loadInitialData = async () => {
    const fetchedCourses = await roadmapService.getCourses();
    setCourses(fetchedCourses);

    const prefs = await studyPlanRepository.getStudyPreferences();
    setSelectedCourseIds(prefs.preferredCourses);
    setSelectedMinutes(prefs.dailyMinutes);

    // Check if plan already exists for this date
    const existingPlan = await studyPlanRepository.getDailyPlan(targetDate);
    if (existingPlan) {
      setIsRestDay(existingPlan.isRestDay);
      setNotes(existingPlan.notes || '');
      if (existingPlan.items && existingPlan.items.length > 0) {
        setSuggestedTopics(
          existingPlan.items.map((i) => ({
            topic_id: i.topicId,
            topic_title: i.topicTitle,
            course_id: i.courseId,
            course_name: i.courseName,
            module_id: i.moduleId,
            estimated_minutes: i.plannedMinutes,
          }))
        );
        setSelectedTopicIds(new Set(existingPlan.items.map((i) => i.topicId)));
      }
    }
  };

  const toggleCourseSelection = (courseId: string) => {
    if (selectedCourseIds.includes(courseId)) {
      if (selectedCourseIds.length > 1) {
        setSelectedCourseIds((prev) => prev.filter((id) => id !== courseId));
      }
    } else {
      setSelectedCourseIds((prev) => [...prev, courseId]);
    }
  };

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const minutesToUse = isCustomDuration
        ? parseInt(customMinutesInput, 10) || 120
        : selectedMinutes;

      const plan = await studyPlanRepository.generateAutomaticDailyPlan(
        targetDate,
        minutesToUse,
        selectedCourseIds
      );

      if (plan.items) {
        const topics = plan.items.map((i) => ({
          topic_id: i.topicId,
          topic_title: i.topicTitle,
          course_id: i.courseId,
          course_name: i.courseName,
          module_id: i.moduleId,
          estimated_minutes: i.plannedMinutes,
        }));
        setSuggestedTopics(topics);
        setSelectedTopicIds(new Set(topics.map((t) => t.topic_id)));
      }
    } catch (err) {
      Alert.alert('Notice', 'Could not generate suggested topics automatically.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTopicCheck = (topicId: string) => {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const handleSavePlan = async () => {
    if (isRestDay) {
      await studyPlanRepository.setRestDay(targetDate, true);
      onPlanCreated();
      onClose();
      return;
    }

    const minutesToUse = isCustomDuration
      ? parseInt(customMinutesInput, 10) || 120
      : selectedMinutes;

    const topicsToSave = suggestedTopics
      .filter((t) => selectedTopicIds.has(t.topic_id))
      .map((t) => ({
        courseId: t.course_id,
        moduleId: t.module_id,
        topicId: t.topic_id,
        plannedMinutes: t.estimated_minutes || 25,
      }));

    if (topicsToSave.length === 0) {
      Alert.alert('No Topics Selected', 'Please generate or select at least one topic to study.');
      return;
    }

    await studyPlanRepository.createOrUpdateDailyPlan({
      dateStr: targetDate,
      plannedMinutes: minutesToUse,
      isRestDay: false,
      topics: topicsToSave,
      notes: notes.trim() || undefined,
    });

    onPlanCreated();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Set Today's Study Plan</Text>
              <Text style={styles.modalDate}>{targetDate}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Rest Day Toggle */}
            <View style={styles.restDayCard}>
              <View style={styles.restDayTextCol}>
                <Text style={styles.restDayTitle}>Mark as Rest Day 🏖️</Text>
                <Text style={styles.restDaySubtitle}>
                  No targets required. Will not count as a missed study day.
                </Text>
              </View>
              <Switch
                value={isRestDay}
                onValueChange={setIsRestDay}
                trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
                thumbColor={isRestDay ? Colors.primary : '#F1F5F9'}
              />
            </View>

            {!isRestDay && (
              <>
                {/* Goal Mode Selector */}
                <View style={styles.segmentedContainer}>
                  <TouchableOpacity
                    style={[styles.segmentBtn, mode === 'TIME' && styles.segmentBtnActive]}
                    onPress={() => setMode('TIME')}
                  >
                    <Ionicons
                      name="timer-outline"
                      size={16}
                      color={mode === 'TIME' ? '#FFFFFF' : '#64748B'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[styles.segmentBtnText, mode === 'TIME' && styles.segmentBtnTextActive]}
                    >
                      Time-Based Goal
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.segmentBtn, mode === 'TOPIC' && styles.segmentBtnActive]}
                    onPress={() => setMode('TOPIC')}
                  >
                    <Ionicons
                      name="list-outline"
                      size={16}
                      color={mode === 'TOPIC' ? '#FFFFFF' : '#64748B'}
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      style={[styles.segmentBtnText, mode === 'TOPIC' && styles.segmentBtnTextActive]}
                    >
                      Topic-Based Goal
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Duration Presets */}
                {mode === 'TIME' && (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionLabel}>STUDY DURATION</Text>
                    <View style={styles.chipsRow}>
                      {DURATION_PRESETS.map((preset) => {
                        const isSelected = !isCustomDuration && selectedMinutes === preset.minutes;
                        return (
                          <TouchableOpacity
                            key={preset.minutes}
                            style={[styles.presetChip, isSelected && styles.presetChipActive]}
                            onPress={() => {
                              setSelectedMinutes(preset.minutes);
                              setIsCustomDuration(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.presetChipText,
                                isSelected && styles.presetChipTextActive,
                              ]}
                            >
                              {preset.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                      <TouchableOpacity
                        style={[styles.presetChip, isCustomDuration && styles.presetChipActive]}
                        onPress={() => setIsCustomDuration(true)}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            isCustomDuration && styles.presetChipTextActive,
                          ]}
                        >
                          Custom
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {isCustomDuration && (
                      <View style={styles.customInputRow}>
                        <TextInput
                          style={styles.customInput}
                          keyboardType="numeric"
                          placeholder="e.g. 75"
                          value={customMinutesInput}
                          onChangeText={setCustomMinutesInput}
                        />
                        <Text style={styles.customInputLabel}>Minutes</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Topic Count Presets */}
                {mode === 'TOPIC' && (
                  <View style={styles.sectionBlock}>
                    <Text style={styles.sectionLabel}>TOPICS TO COMPLETE TODAY</Text>
                    <View style={styles.chipsRow}>
                      {[2, 3, 4, 5, 6, 8, 10].map((count) => {
                        const isSelected = targetTopicCount === count;
                        return (
                          <TouchableOpacity
                            key={count}
                            style={[styles.presetChip, isSelected && styles.presetChipActive]}
                            onPress={() => {
                              setTargetTopicCount(count);
                              setSelectedMinutes(count * 25);
                            }}
                          >
                            <Text
                              style={[
                                styles.presetChipText,
                                isSelected && styles.presetChipTextActive,
                              ]}
                            >
                              {count} Topics
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Priority Courses Selector */}
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionLabel}>PRIORITY COURSES TO INCLUDE</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseScroll}>
                    {courses.map((c) => {
                      const isSelected = selectedCourseIds.includes(c.id);
                      return (
                        <TouchableOpacity
                          key={c.id}
                          style={[styles.coursePill, isSelected && styles.coursePillSelected]}
                          onPress={() => toggleCourseSelection(c.id)}
                        >
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'add-circle-outline'}
                            size={16}
                            color={isSelected ? '#1D4ED8' : '#64748B'}
                            style={{ marginRight: 6 }}
                          />
                          <Text
                            style={[
                              styles.coursePillText,
                              isSelected && styles.coursePillTextSelected,
                            ]}
                          >
                            {c.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Generate / Suggest Topics Button */}
                <TouchableOpacity
                  style={styles.generateBtn}
                  onPress={handleGenerateSuggestions}
                  disabled={isGenerating}
                >
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.generateBtnText}>
                    {isGenerating ? 'Calculating Optimal Plan...' : 'Generate Today\'s Suggested Plan'}
                  </Text>
                </TouchableOpacity>

                {/* Suggested Topics List */}
                {suggestedTopics.length > 0 && (
                  <View style={styles.sectionBlock}>
                    <View style={styles.topicsHeaderRow}>
                      <Text style={styles.sectionLabel}>SUGGESTED TOPICS FOR TODAY</Text>
                      <Text style={styles.topicsSelectedCount}>
                        {selectedTopicIds.size} / {suggestedTopics.length} selected
                      </Text>
                    </View>

                    {suggestedTopics.map((item, idx) => {
                      const isChecked = selectedTopicIds.has(item.topic_id);
                      return (
                        <TouchableOpacity
                          key={item.topic_id || idx}
                          style={[styles.topicCard, isChecked && styles.topicCardChecked]}
                          onPress={() => toggleTopicCheck(item.topic_id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons
                            name={isChecked ? 'checkbox' : 'square-outline'}
                            size={22}
                            color={isChecked ? Colors.primary : '#94A3B8'}
                            style={{ marginRight: 10 }}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.topicCourseTag}>{item.course_name || item.course_id}</Text>
                            <Text style={styles.topicTitleText}>{item.topic_title}</Text>
                          </View>
                          <View style={styles.timeTag}>
                            <Text style={styles.timeTagText}>{item.estimated_minutes || 25}m</Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Personal Notes */}
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionLabel}>MISSION NOTES (OPTIONAL)</Text>
                  <TextInput
                    style={styles.notesInput}
                    placeholder="e.g. Focus deeply on percentage formulas and tree diagrams"
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSavePlan}>
              <Text style={styles.saveBtnText}>
                {isRestDay ? 'Confirm Rest Day' : 'Save Today\'s Plan'}
              </Text>
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
    maxHeight: '90%',
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
  modalDate: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  restDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  restDayTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  restDayTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  restDaySubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
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
  sectionBlock: {
    marginBottom: 18,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: Colors.primary,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  presetChipTextActive: {
    color: Colors.primary,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  customInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  customInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  courseScroll: {
    flexDirection: 'row',
  },
  coursePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  coursePillSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#93C5FD',
  },
  coursePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  coursePillTextSelected: {
    color: '#1D4ED8',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 18,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  topicsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicsSelectedCount: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  topicCardChecked: {
    backgroundColor: '#F8FAFC',
    borderColor: Colors.primary,
  },
  topicCourseTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  topicTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  timeTag: {
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  timeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    textAlignVertical: 'top',
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
