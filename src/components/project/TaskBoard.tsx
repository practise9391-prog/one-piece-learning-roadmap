import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProjectTask, TaskStatus, TaskPriority } from '../../models/Project';

interface TaskBoardProps {
  tasks: ProjectTask[];
  onTaskPress?: (task: ProjectTask) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
  onOpenCodePractice?: (practiceTaskId: string) => void;
}

const COLUMNS: { status: TaskStatus; label: string; color: string; bg: string }[] = [
  { status: 'TODO', label: 'To Do', color: '#94A3B8', bg: '#1E293B' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: '#38BDF8', bg: '#0284C720' },
  { status: 'BLOCKED', label: 'Blocked', color: '#EF4444', bg: '#EF444420' },
  { status: 'COMPLETED', label: 'Done', color: '#10B981', bg: '#10B98120' },
];

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onTaskPress,
  onStatusChange,
  onOpenCodePractice,
}) => {
  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case 'CRITICAL':
        return '#EF4444';
      case 'HIGH':
        return '#F59E0B';
      case 'MEDIUM':
        return '#38BDF8';
      case 'LOW':
      default:
        return '#94A3B8';
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus => {
    switch (current) {
      case 'TODO':
        return 'IN_PROGRESS';
      case 'IN_PROGRESS':
        return 'COMPLETED';
      case 'BLOCKED':
        return 'IN_PROGRESS';
      case 'COMPLETED':
      default:
        return 'TODO';
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.boardScroll}
    >
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.status);

        return (
          <View key={col.status} style={styles.columnContainer}>
            {/* Column Header */}
            <View style={styles.columnHeader}>
              <View style={[styles.columnPill, { backgroundColor: col.bg }]}>
                <Text style={[styles.columnTitle, { color: col.color }]}>
                  {col.label}
                </Text>
              </View>
              <Text style={styles.taskCount}>{colTasks.length}</Text>
            </View>

            {/* Task Cards Column */}
            <ScrollView
              style={styles.cardsScroll}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
            >
              {colTasks.length === 0 ? (
                <View style={styles.emptyColBox}>
                  <Text style={styles.emptyColText}>No tasks</Text>
                </View>
              ) : (
                colTasks.map((t) => (
                  <View key={t.id} style={styles.taskCard}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => onTaskPress?.(t)}
                    >
                      <View style={styles.cardTopRow}>
                        <View
                          style={[
                            styles.priorityTag,
                            { borderColor: getPriorityColor(t.priority) },
                          ]}
                        >
                          <Text
                            style={[
                              styles.priorityText,
                              { color: getPriorityColor(t.priority) },
                            ]}
                          >
                            {t.priority}
                          </Text>
                        </View>
                        <Text style={styles.typeText}>{t.task_type}</Text>
                      </View>

                      <Text style={styles.taskTitle}>{t.title}</Text>
                      {t.description ? (
                        <Text style={styles.taskDesc} numberOfLines={2}>
                          {t.description}
                        </Text>
                      ) : null}
                    </TouchableOpacity>

                    {/* Footer Actions */}
                    <View style={styles.cardFooter}>
                      {t.practice_task_id && onOpenCodePractice ? (
                        <TouchableOpacity
                          style={styles.codePracticeBtn}
                          onPress={() => onOpenCodePractice(t.practice_task_id!)}
                        >
                          <Ionicons name="code-slash" size={12} color="#38BDF8" />
                          <Text style={styles.codePracticeText}>Code</Text>
                        </TouchableOpacity>
                      ) : (
                        <View />
                      )}

                      {/* Advance Status Button */}
                      <TouchableOpacity
                        style={styles.moveStatusBtn}
                        onPress={() =>
                          onStatusChange?.(t.id, getNextStatus(t.status))
                        }
                      >
                        <Text style={styles.moveStatusText}>
                          {t.status === 'COMPLETED' ? 'Reopen' : 'Advance'}
                        </Text>
                        <Ionicons
                          name={
                            t.status === 'COMPLETED'
                              ? 'refresh-outline'
                              : 'arrow-forward-outline'
                          }
                          size={12}
                          color="#94A3B8"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  boardScroll: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  columnContainer: {
    width: 220,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: 460,
  },
  columnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  columnPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  columnTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  taskCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  cardsScroll: {
    flex: 1,
  },
  emptyColBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyColText: {
    fontSize: 11,
    color: '#64748B',
    fontStyle: 'italic',
  },
  taskCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  priorityTag: {
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: '800',
  },
  typeText: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  taskDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 6,
  },
  codePracticeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#0284C720',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codePracticeText: {
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: '700',
  },
  moveStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  moveStatusText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
