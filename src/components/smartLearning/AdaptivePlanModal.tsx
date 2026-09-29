import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdaptiveDailyPlan } from '../../models/SmartLearning';
import { smartLearningService } from '../../services/SmartLearningService';

interface AdaptivePlanModalProps {
  visible: boolean;
  onClose: () => void;
  onPlanApplied: (itemsCount: number) => void;
}

export const AdaptivePlanModal: React.FC<AdaptivePlanModalProps> = ({
  visible,
  onClose,
  onPlanApplied,
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(60);
  const [plan, setPlan] = useState<AdaptiveDailyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [applying, setApplying] = useState<boolean>(false);

  const durationOptions = [15, 30, 60, 120];

  useEffect(() => {
    if (visible) {
      loadPlan(selectedMinutes);
    }
  }, [visible, selectedMinutes]);

  const loadPlan = async (minutes: number) => {
    setLoading(true);
    try {
      const generated = await smartLearningService.generateAdaptivePlan(minutes);
      setPlan(generated);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!plan) return;
    setApplying(true);
    try {
      const res = await smartLearningService.applyAdaptivePlan(plan);
      if (res.success) {
        onPlanApplied(res.itemsAdded);
        onClose();
      }
    } catch {
      // Handled gracefully
    } finally {
      setApplying(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Adaptive Daily Study Plan</Text>
              <Text style={styles.subtitle}>Optimized study sequence for your available time</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Time Picker Chips */}
          <Text style={styles.sectionLabel}>Select Time Available Today:</Text>
          <View style={styles.durationRow}>
            {durationOptions.map((mins) => {
              const active = selectedMinutes === mins;
              return (
                <TouchableOpacity
                  key={`dur_${mins}`}
                  style={[styles.durationChip, active && styles.durationChipActive]}
                  onPress={() => setSelectedMinutes(mins)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.durationText, active && styles.durationTextActive]}>
                    {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Conflict Warning if manual plan exists */}
          {plan?.conflict_with_manual_plan && (
            <View style={styles.conflictBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#F59E0B" />
              <Text style={styles.conflictText}>{plan.conflict_message}</Text>
            </View>
          )}

          {/* Plan Breakdown Items */}
          <Text style={styles.sectionLabel}>Recommended Learning Sequence:</Text>

          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color="#38BDF8" />
              <Text style={styles.loadingText}>Synthesizing optimal schedule...</Text>
            </View>
          ) : (
            <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
              {plan?.items.map((item, index) => {
                let iconName: keyof typeof Ionicons.glyphMap = 'book-outline';
                let tagBg = '#3B82F620';
                let tagColor = '#3B82F6';

                if (item.type === 'REVISION') {
                  iconName = 'repeat-outline';
                  tagBg = '#8B5CF620';
                  tagColor = '#8B5CF6';
                } else if (item.type === 'PRACTICE') {
                  iconName = 'code-slash-outline';
                  tagBg = '#10B98120';
                  tagColor = '#10B981';
                } else if (item.type === 'WEAK_TOPIC') {
                  iconName = 'fitness-outline';
                  tagBg = '#F59E0B20';
                  tagColor = '#F59E0B';
                }

                return (
                  <View key={item.id} style={styles.planItem}>
                    <View style={styles.itemOrderCol}>
                      <Text style={styles.orderNumber}>#{index + 1}</Text>
                      <View style={styles.orderIconBox}>
                        <Ionicons name={iconName} size={16} color={tagColor} />
                      </View>
                    </View>

                    <View style={styles.itemContentCol}>
                      <View style={styles.itemHeaderRow}>
                        <View style={[styles.typeBadge, { backgroundColor: tagBg }]}>
                          <Text style={[styles.typeText, { color: tagColor }]}>{item.type}</Text>
                        </View>
                        <Text style={styles.allocatedTime}>{item.allocated_minutes} min</Text>
                      </View>

                      <Text style={styles.itemTitle}>{item.topic_title}</Text>
                      <Text style={styles.itemReason}>{item.reason}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.applyButton, applying && { opacity: 0.7 }]}
            onPress={handleApply}
            disabled={applying || loading}
            activeOpacity={0.85}
          >
            {applying ? (
              <ActivityIndicator size="small" color="#0F172A" />
            ) : (
              <>
                <Ionicons name="calendar-outline" size={18} color="#0F172A" />
                <Text style={styles.applyButtonText}>Add to Today's Study Plan</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  durationChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  durationChipActive: {
    backgroundColor: '#38BDF820',
    borderColor: '#38BDF8',
  },
  durationText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#94A3B8',
  },
  durationTextActive: {
    color: '#38BDF8',
  },
  conflictBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F59E0B15',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
    gap: 8,
  },
  conflictText: {
    fontSize: 12,
    color: '#FBBF24',
    flex: 1,
    lineHeight: 16,
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  itemsList: {
    maxHeight: 280,
    marginBottom: 16,
  },
  planItem: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemOrderCol: {
    alignItems: 'center',
    marginRight: 12,
    width: 34,
  },
  orderNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  orderIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContentCol: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  allocatedTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 3,
  },
  itemReason: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
});
