import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../theme/colors';
import { CalendarDayStatus } from '../../models/DailyLearning';
import { dailyLearningRepository } from '../../repositories/DailyLearningRepository';

interface DailyCalendarModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
}

export const DailyCalendarModal: React.FC<DailyCalendarModalProps> = ({
  visible,
  onClose,
  onSelectDate,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth() + 1); // 1-12
  const [calendarDays, setCalendarDays] = useState<CalendarDayStatus[]>([]);
  const [selectedDay, setSelectedDay] = useState<CalendarDayStatus | null>(null);

  useEffect(() => {
    if (visible) {
      loadMonthData(currentYear, currentMonth);
    }
  }, [visible, currentYear, currentMonth]);

  const loadMonthData = async (year: number, month: number) => {
    const data = await dailyLearningRepository.getCalendarHistory(year, month);
    setCalendarDays(data);

    // Default select today if in current month
    const todayStr = today.toISOString().split('T')[0];
    const match = data.find((d) => d.date === todayStr);
    setSelectedDay(match || data[0] || null);
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

  // Calculate starting empty slots for day-of-week alignment (Mon=0, Sun=6)
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  // In JS getDay(): Sunday=0, Monday=1, ..., Saturday=6
  const leadingBlanks = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeContainer}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Learning Calendar</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView style={styles.scrollBody} contentContainerStyle={styles.scrollContent}>
          {/* MONTH NAVIGATION ROW */}
          <View style={styles.monthNavRow}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-back" size={20} color="#0F172A" />
            </TouchableOpacity>

            <Text style={styles.monthTitle}>
              {monthNames[currentMonth - 1]} {currentYear}
            </Text>

            <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn} activeOpacity={0.7}>
              <Ionicons name="chevron-forward" size={20} color="#0F172A" />
            </TouchableOpacity>
          </View>

          {/* DAY NAMES HEADER */}
          <View style={styles.dayNamesRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dn, idx) => (
              <View key={idx} style={styles.dayNameCol}>
                <Text style={styles.dayNameText}>{dn}</Text>
              </View>
            ))}
          </View>

          {/* CALENDAR DAYS GRID */}
          <View style={styles.gridWrap}>
            {Array.from({ length: leadingBlanks }).map((_, idx) => (
              <View key={`blank_${idx}`} style={styles.dayCellBlank} />
            ))}

            {calendarDays.map((d) => {
              const isSelected = selectedDay?.date === d.date;
              const isToday = d.date === today.toISOString().split('T')[0];

              return (
                <TouchableOpacity
                  key={d.date}
                  style={[
                    styles.dayCell,
                    isSelected && styles.dayCellSelected,
                    isToday && !isSelected && styles.dayCellToday,
                  ]}
                  onPress={() => setSelectedDay(d)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dayNumberText,
                      isSelected && styles.dayNumberSelected,
                      isToday && !isSelected && styles.dayNumberToday,
                    ]}
                  >
                    {d.dayNumber}
                  </Text>

                  {d.hasPlan && d.status === 'COMPLETED' ? (
                    <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                  ) : d.hasPlan && d.completedMinutes > 0 ? (
                    <View style={styles.progressDot} />
                  ) : d.hasPlan ? (
                    <View style={styles.plannedDot} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* SELECTED DAY CARD */}
          {selectedDay && (
            <View style={styles.selectedDayCard}>
              <View style={styles.selectedDayHeader}>
                <View>
                  <Text style={styles.selectedDayDate}>{selectedDay.date}</Text>
                  <Text style={styles.selectedDayStatus}>
                    {selectedDay.hasPlan
                      ? selectedDay.status === 'COMPLETED'
                        ? '✅ Full Plan Completed'
                        : selectedDay.completedMinutes > 0
                        ? '⚡ In Progress'
                        : '📋 Planned'
                      : 'Rest Day (No scheduled plan)'}
                  </Text>
                </View>

                {selectedDay.completedMinutes > 0 && (
                  <View style={styles.timeBadge}>
                    <Text style={styles.timeBadgeVal}>
                      {Math.floor(selectedDay.completedMinutes / 60)}h {selectedDay.completedMinutes % 60}m
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.loadDayBtn}
                onPress={() => {
                  onSelectDate(selectedDay.date);
                  onClose();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.loadDayBtnText}>View This Day's Plan ›</Text>
              </TouchableOpacity>
            </View>
          )}
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
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  monthNavBtn: {
    padding: 6,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCol: {
    flex: 1,
    alignItems: 'center',
  },
  dayNameText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  dayCellBlank: {
    width: '14.28%',
    height: 48,
  },
  dayCell: {
    width: '14.28%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  dayCellSelected: {
    backgroundColor: '#0284C7',
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  dayNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  dayNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  dayNumberToday: {
    color: Colors.primary,
    fontWeight: '800',
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0284C7',
  },
  plannedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
  },
  selectedDayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  selectedDayDate: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  selectedDayStatus: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  timeBadge: {
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  timeBadgeVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284C7',
  },
  loadDayBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loadDayBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
