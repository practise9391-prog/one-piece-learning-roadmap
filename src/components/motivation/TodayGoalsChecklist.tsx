import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DailyGoal } from '../../models/Motivation';
import { Colors } from '../../theme/colors';

interface TodayGoalsChecklistProps {
  goals: DailyGoal[];
}

export const TodayGoalsChecklist: React.FC<TodayGoalsChecklistProps> = ({ goals }) => {
  const getGoalIcon = (type: string) => {
    switch (type) {
      case 'COMPLETE_TOPIC':
        return 'school-outline';
      case 'PRACTICE_QUESTIONS':
        return 'code-slash-outline';
      case 'COMPLETE_MODULE':
        return 'boat-outline';
      case 'WRITE_NOTE':
        return 'journal-outline';
      default:
        return 'checkbox-outline';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="list-outline" size={18} color="#D97706" />
        <Text style={styles.headerTitle}>TODAY'S CHECKLIST</Text>
      </View>

      {goals.map((g) => {
        const isDone = g.is_completed;
        return (
          <View key={g.id} style={[styles.goalItem, isDone && styles.goalItemDone]}>
            <View style={[styles.checkbox, isDone && styles.checkboxDone]}>
              <Ionicons
                name={isDone ? 'checkmark' : 'ellipse-outline'}
                size={isDone ? 14 : 16}
                color={isDone ? '#FFFFFF' : '#94A3B8'}
              />
            </View>

            <View style={styles.goalInfoCol}>
              <Text style={[styles.goalTitle, isDone && styles.goalTitleDone]}>
                {g.title}
              </Text>
              <Text style={styles.goalProgressText}>
                {g.current} of {g.target} completed {isDone ? '✓' : ''}
              </Text>
            </View>

            <View style={[styles.iconWrap, isDone && styles.iconWrapDone]}>
              <Ionicons
                name={getGoalIcon(g.goal_type) as any}
                size={16}
                color={isDone ? '#059669' : '#64748B'}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.6,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  goalItemDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  checkboxDone: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  goalInfoCol: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  goalTitleDone: {
    color: '#065F46',
  },
  goalProgressText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDone: {
    backgroundColor: '#DCFCE7',
  },
});
