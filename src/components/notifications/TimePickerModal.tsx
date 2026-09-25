import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeContext';

interface TimePickerModalProps {
  visible: boolean;
  initialTime: string; // "HH:mm" (e.g. "19:00")
  title: string;
  onSave: (time24: string) => void;
  onClose: () => void;
}

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  initialTime,
  title,
  onSave,
  onClose,
}) => {
  const { theme } = useTheme();

  const [selectedHour12, setSelectedHour12] = useState<number>(7);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('PM');

  useEffect(() => {
    if (visible && initialTime) {
      try {
        const [hStr, mStr] = initialTime.split(':');
        const h24 = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);

        if (!isNaN(h24) && !isNaN(m)) {
          const period = h24 >= 12 ? 'PM' : 'AM';
          let h12 = h24 % 12;
          if (h12 === 0) h12 = 12;

          setSelectedHour12(h12);
          setSelectedMinute(m);
          setSelectedPeriod(period);
        }
      } catch {}
    }
  }, [visible, initialTime]);

  const handleSave = () => {
    let h24 = selectedHour12;
    if (selectedPeriod === 'PM' && h24 < 12) {
      h24 += 12;
    } else if (selectedPeriod === 'AM' && h24 === 12) {
      h24 = 0;
    }

    const hStr = h24.toString().padStart(2, '0');
    const mStr = selectedMinute.toString().padStart(2, '0');
    onSave(`${hStr}:${mStr}`);
    onClose();
  };

  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Text style={[styles.headerTitle, { color: theme.colors.textPrimary }]}>
                    Set Reminder Time
                  </Text>
                  <Text style={[styles.headerSub, { color: theme.colors.textSecondary }]}>
                    {title}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Big Time Display */}
              <View
                style={[
                  styles.displayContainer,
                  { backgroundColor: `${theme.colors.primary}12`, borderColor: theme.colors.primary },
                ]}
              >
                <Text style={[styles.displayTime, { color: theme.colors.primary }]}>
                  {selectedHour12.toString().padStart(2, '0')}:
                  {selectedMinute.toString().padStart(2, '0')}
                </Text>
                <Text style={[styles.displayPeriod, { color: theme.colors.secondary }]}>
                  {selectedPeriod}
                </Text>
              </View>

              {/* AM / PM Toggle */}
              <View style={styles.periodRow}>
                <TouchableOpacity
                  style={[
                    styles.periodBtn,
                    selectedPeriod === 'AM' && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setSelectedPeriod('AM')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.periodBtnText,
                      { color: selectedPeriod === 'AM' ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    AM (Morning)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.periodBtn,
                    selectedPeriod === 'PM' && { backgroundColor: theme.colors.primary },
                  ]}
                  onPress={() => setSelectedPeriod('PM')}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.periodBtnText,
                      { color: selectedPeriod === 'PM' ? '#FFFFFF' : theme.colors.textSecondary },
                    ]}
                  >
                    PM (Evening)
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Hour & Minute Selectors */}
              <View style={styles.selectorGrid}>
                {/* Hours column */}
                <View style={styles.selectorCol}>
                  <Text style={[styles.colHeader, { color: theme.colors.textSecondary }]}>
                    HOUR
                  </Text>
                  <ScrollView style={styles.colScroll} showsVerticalScrollIndicator={false}>
                    {hours.map((h) => {
                      const isSelected = h === selectedHour12;
                      return (
                        <TouchableOpacity
                          key={h}
                          style={[
                            styles.chip,
                            isSelected && { backgroundColor: theme.colors.primary },
                          ]}
                          onPress={() => setSelectedHour12(h)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary },
                              isSelected && { fontWeight: '800' },
                            ]}
                          >
                            {h}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Divider */}
                <View style={[styles.colDivider, { backgroundColor: theme.colors.divider }]} />

                {/* Minutes column */}
                <View style={styles.selectorCol}>
                  <Text style={[styles.colHeader, { color: theme.colors.textSecondary }]}>
                    MINUTE
                  </Text>
                  <ScrollView style={styles.colScroll} showsVerticalScrollIndicator={false}>
                    {minutes.map((m) => {
                      const isSelected = m === selectedMinute;
                      return (
                        <TouchableOpacity
                          key={m}
                          style={[
                            styles.chip,
                            isSelected && { backgroundColor: theme.colors.primary },
                          ]}
                          onPress={() => setSelectedMinute(m)}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              { color: isSelected ? '#FFFFFF' : theme.colors.textPrimary },
                              isSelected && { fontWeight: '800' },
                            ]}
                          >
                            {m.toString().padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleSave}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>CONFIRM TIME</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  displayTime: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  displayPeriod: {
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 10,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  periodBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  periodBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  selectorGrid: {
    flexDirection: 'row',
    height: 180,
    marginBottom: 16,
  },
  selectorCol: {
    flex: 1,
    alignItems: 'center',
  },
  colHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  colScroll: {
    width: '100%',
  },
  colDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: 8,
  },
  chip: {
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  chipText: {
    fontSize: 14,
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
