import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { studyPlanRepository } from '../../repositories/StudyPlanRepository';

interface StudyCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate?: (dateStr: string) => void;
}

export const StudyCalendarModal: React.FC<StudyCalendarModalProps> = ({
  visible,
  onClose,
  onSelectDate,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [calendarDays, setCalendarDays] = useState<any[]>([]);
  const [selectedDay, setSelectedDay] = useState<any | null>(null);

  useEffect(() => {
    if (visible) {
      loadCalendarData(currentYear, currentMonth);
    }
  }, [visible, currentYear, currentMonth]);

  const loadCalendarData = async (year: number, month: number) => {
    const data = await studyPlanRepository.getCalendarHistory(year, month);
    setCalendarDays(data);

    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayMatch = data.find((d) => d.dateStr === todayStr);
    setSelectedDay(todayMatch || data[0] || null);
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((prev) => prev - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((prev) => prev + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  // Calculate day-of-week offset for first day of month (0 = Sun, 1 = Mon...)
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.modalTitle}>Study Plan Calendar</Text>
              <Text style={styles.modalSub}>Historical voyage logs and plans</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNavRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-back" size={20} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.monthNavTitle}>
              {monthNames[currentMonth - 1]} {currentYear}
            </Text>

            <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn}>
              <Ionicons name="chevron-forward" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* Weekday headers */}
          <View style={styles.weekHeaderRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
              <Text key={idx} style={styles.weekHeaderText}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {/* Blank leading slots */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <View key={`blank-${i}`} style={styles.dayCellBlank} />
            ))}

            {calendarDays.map((day) => {
              const isSelected = selectedDay?.dateStr === day.dateStr;
              let indicatorColor = '#E2E8F0';

              if (day.isRestDay) {
                indicatorColor = '#C084FC'; // purple for rest day
              } else if (day.status === 'COMPLETED') {
                indicatorColor = '#10B981'; // green
              } else if (day.status === 'IN_PROGRESS' || day.completedMinutes > 0) {
                indicatorColor = '#3B82F6'; // blue
              } else if (day.status === 'MISSED') {
                indicatorColor = '#EF4444'; // red
              } else if (day.plannedMinutes > 0) {
                indicatorColor = '#F59E0B'; // amber planned
              }

              return (
                <TouchableOpacity
                  key={day.dateStr}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {day.dayNumber}
                  </Text>
                  <View style={[styles.dayDot, { backgroundColor: indicatorColor }]} />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Day Summary Card */}
          {selectedDay && (
            <View style={styles.selectedCard}>
              <View style={styles.selectedCardHeader}>
                <View>
                  <Text style={styles.selectedDateText}>{selectedDay.dateStr}</Text>
                  <Text style={styles.selectedStatusText}>
                    {selectedDay.isRestDay
                      ? '🏖️ Rest Day'
                      : selectedDay.status === 'COMPLETED'
                      ? '✓ Fully Completed'
                      : selectedDay.status === 'IN_PROGRESS'
                      ? '⚡ In Progress'
                      : selectedDay.plannedMinutes > 0
                      ? '📝 Planned'
                      : '💤 No Target Set'}
                  </Text>
                </View>

                {onSelectDate && (
                  <TouchableOpacity
                    style={styles.openDayBtn}
                    onPress={() => {
                      onSelectDate(selectedDay.dateStr);
                      onClose();
                    }}
                  >
                    <Text style={styles.openDayBtnText}>Open Plan ›</Text>
                  </TouchableOpacity>
                )}
              </View>

              {!selectedDay.isRestDay && (
                <View style={styles.statsRow}>
                  <View style={styles.statCol}>
                    <Text style={styles.statVal}>
                      {Math.round(selectedDay.completedMinutes / 60)}h {selectedDay.completedMinutes % 60}m
                    </Text>
                    <Text style={styles.statLbl}>COMPLETED</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCol}>
                    <Text style={styles.statVal}>
                      {Math.round(selectedDay.plannedMinutes / 60)}h {selectedDay.plannedMinutes % 60}m
                    </Text>
                    <Text style={styles.statLbl}>PLANNED</Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statCol}>
                    <Text style={styles.statVal}>
                      {selectedDay.completedTopics} / {selectedDay.plannedTopics}
                    </Text>
                    <Text style={styles.statLbl}>TOPICS</Text>
                  </View>
                </View>
              )}
            </View>
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
  monthNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  monthNavBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  monthNavTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  weekHeaderRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 6,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dayCellBlank: {
    width: '14.28%',
    height: 44,
  },
  dayCell: {
    width: '14.28%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  dayTextSelected: {
    color: Colors.primary,
    fontWeight: '900',
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 3,
  },
  selectedCard: {
    marginHorizontal: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedDateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  selectedStatusText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  openDayBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  openDayBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  statLbl: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 2,
    letterSpacing: 0.4,
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E2E8F0',
  },
});
