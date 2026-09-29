import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import { UserProject, ProjectTask, TaskStatus, TaskPriority, TaskType } from '../../models/Project';
import { projectRepository } from '../../repositories/ProjectRepository';
import { TaskBoard } from '../../components/project/TaskBoard';

export const ProjectTasksScreen: React.FC = () => {
  const { params, navigate, goBack } = useAppNavigation();
  const { colors, isDark } = useTheme();

  const projectId = params?.projectId as string | undefined;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<UserProject | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);

  // Add Task Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [taskType, setTaskType] = useState<TaskType>('FEATURE');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      if (projectId) {
        const [p, tList] = await Promise.all([
          projectRepository.getUserProjectById(projectId),
          projectRepository.getProjectTasks(projectId),
        ]);
        setProject(p);
        setTasks(tList);
      } else {
        const active = await projectRepository.getActiveUserProjects();
        if (active.length > 0) {
          const first = active[0];
          const tList = await projectRepository.getProjectTasks(first.id);
          setProject(first);
          setTasks(tList);
        }
      }
    } catch (err) {
      console.error('[ProjectTasksScreen] load error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await projectRepository.updateProjectTask(taskId, {
      status: newStatus,
      completed_at: newStatus === 'COMPLETED' ? new Date().toISOString() : null,
    });
    loadData();
  };

  const handleCreateTask = async () => {
    if (!title.trim() || !project) return;
    await projectRepository.createProjectTask({
      project_id: project.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      task_type: taskType,
      status: 'TODO',
      estimated_minutes: 60,
    });
    setTitle('');
    setDescription('');
    setShowModal(false);
    loadData();
  };

  const handleOpenPractice = (practiceTaskId: string) => {
    navigate('CodingProblem', { problemId: practiceTaskId });
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading tasks board...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="folder-open-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>No Active Project Selected</Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => navigate('Projects')}>
          <Text style={styles.primaryBtnText}>Go to Projects</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {project.name} • Task Board
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {tasks.filter((t) => t.status === 'COMPLETED').length} of {tasks.length} Completed
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => setShowModal(true)}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Kanban Board Container */}
      <View style={styles.boardWrap}>
        <TaskBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onOpenCodePractice={handleOpenPractice}
        />
      </View>

      {/* Create Task Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Task</Text>

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Task Title (e.g. Implement schema migration)"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.modalArea, { color: colors.text, borderColor: colors.border }]}
              placeholder="Detailed description or requirements"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
            />

            {/* Priority Selector */}
            <Text style={[styles.selectorLabel, { color: colors.textSecondary }]}>Priority:</Text>
            <View style={styles.priorityRow}>
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TaskPriority[]).map((p) => {
                const isSelected = priority === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityOption,
                      isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.priorityOptionText, isSelected && { color: '#FFFFFF', fontWeight: '700' }]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={handleCreateTask}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorTitle: { fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 10 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  addBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  boardWrap: { flex: 1 },
  primaryBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  modalArea: { height: 80, textAlignVertical: 'top' },
  selectorLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6 },
  priorityRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  priorityOption: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    alignItems: 'center',
  },
  priorityOptionText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  modalBtnsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  modalSaveBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
});
