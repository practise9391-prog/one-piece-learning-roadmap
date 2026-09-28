import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyLearningTask } from '../../models/DailyLearning';
import { Colors } from '../../theme/colors';

interface MissedTasksBannerProps {
  tasks: DailyLearningTask[];
  onAddToToday: () => void;
  onDismiss: () => void;
}

export const MissedTasksBanner: React.FC<MissedTasksBannerProps> = ({
  tasks,
  onAddToToday,
  onDismiss,
}) => {
  if (tasks.length === 0) return null;

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.topRow}>
        <Ionicons name="time" size={20} color="#D97706" style={{ marginRight: 8 }} />
        <View style={styles.textCol}>
          <Text style={styles.bannerTitle}>Yesterday's Incomplete Tasks</Text>
          <Text style={styles.bannerSubtitle}>
            You have {tasks.length} unfinished {tasks.length === 1 ? 'task' : 'tasks'} from yesterday.
            Add them to today's voyage or dismiss them safely.
          </Text>
        </View>
      </View>

      <View style={styles.tasksList}>
        {tasks.slice(0, 3).map((t, idx) => (
          <View key={idx} style={styles.taskMiniRow}>
            <View style={styles.dot} />
            <Text style={styles.taskMiniTitle} numberOfLines={1}>
              {t.title}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={onAddToToday}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={styles.addBtnText}>Add to Today</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={onDismiss}
          activeOpacity={0.8}
        >
          <Text style={styles.dismissBtnText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  textCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
    lineHeight: 16,
  },
  tasksList: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  taskMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D97706',
    marginRight: 8,
  },
  taskMiniTitle: {
    fontSize: 12,
    color: '#78350F',
    fontWeight: '600',
    flex: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    marginRight: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  dismissBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#FDE68A',
  },
  dismissBtnText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },
});
