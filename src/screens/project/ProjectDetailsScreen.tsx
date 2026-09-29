import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import {
  UserProject,
  ProjectMilestone,
  ProjectTask,
  ProjectLearningLink,
  ProjectFeature,
  ProjectBug,
  ProjectTestCase,
  ProjectDocumentation,
  ProjectHealthStatus,
  TaskPriority,
  TaskType,
  BugSeverity,
  TestCaseType,
} from '../../models/Project';
import { projectService } from '../../services/ProjectService';
import { projectRepository } from '../../repositories/ProjectRepository';
import { ProjectHealthCard } from '../../components/project/ProjectHealthCard';
import { LearningLinksList } from '../../components/project/LearningLinksList';

type DetailTab = 'overview' | 'roadmap' | 'tasks' | 'features' | 'bugs' | 'testing' | 'curriculum' | 'docs';

export const ProjectDetailsScreen: React.FC = () => {
  const { params, navigate, goBack } = useAppNavigation();
  const { colors, isDark } = useTheme();

  const projectId = params?.projectId as string | undefined;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<UserProject | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [learningLinks, setLearningLinks] = useState<ProjectLearningLink[]>([]);
  const [features, setFeatures] = useState<ProjectFeature[]>([]);
  const [bugs, setBugs] = useState<ProjectBug[]>([]);
  const [testCases, setTestCases] = useState<ProjectTestCase[]>([]);
  const [documentation, setDocumentation] = useState<ProjectDocumentation | null>(null);
  const [healthStatus, setHealthStatus] = useState<ProjectHealthStatus | null>(null);

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [newTaskType, setNewTaskType] = useState<TaskType>('FEATURE');

  const [showFeatureModal, setShowFeatureModal] = useState(false);
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');
  const [newFeaturePriority, setNewFeaturePriority] = useState<TaskPriority>('MEDIUM');

  const [showBugModal, setShowBugModal] = useState(false);
  const [newBugTitle, setNewBugTitle] = useState('');
  const [newBugDesc, setNewBugDesc] = useState('');
  const [newBugSteps, setNewBugSteps] = useState('');
  const [newBugSeverity, setNewBugSeverity] = useState<BugSeverity>('MEDIUM');

  const [showTestCaseModal, setShowTestCaseModal] = useState(false);
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestDesc, setNewTestDesc] = useState('');
  const [newTestExpected, setNewTestExpected] = useState('');
  const [newTestType, setNewTestType] = useState<TestCaseType>('MANUAL');

  const [showLinksModal, setShowLinksModal] = useState(false);
  const [editGithubUrl, setEditGithubUrl] = useState('');
  const [editLiveUrl, setEditLiveUrl] = useState('');
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [
        proj,
        mStones,
        tList,
        lLinks,
        fList,
        bList,
        tcList,
        doc,
        hStatus,
      ] = await Promise.all([
        projectRepository.getUserProjectById(projectId),
        projectRepository.getProjectMilestones(projectId),
        projectRepository.getProjectTasks(projectId),
        projectRepository.getProjectLearningLinks(projectId),
        projectRepository.getProjectFeatures(projectId),
        projectRepository.getProjectBugs(projectId),
        projectRepository.getProjectTestCases(projectId),
        projectRepository.getProjectDocumentation(projectId),
        projectRepository.getProjectHealthStatus(projectId),
      ]);

      setProject(proj);
      setMilestones(mStones);
      setTasks(tList);
      setLearningLinks(lLinks);
      setFeatures(fList);
      setBugs(bList);
      setTestCases(tcList);
      setDocumentation(doc);
      setHealthStatus(hStatus);

      if (proj) {
        setEditGithubUrl(proj.github_url || '');
        setEditLiveUrl(proj.live_url || '');
      }
    } catch (err) {
      console.error('[ProjectDetailsScreen] Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading project workspace...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Ionicons name="folder-open-outline" size={64} color={colors.textSecondary} />
        <Text style={[styles.errorTitle, { color: colors.text }]}>Project Not Found</Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={goBack}>
          <Text style={styles.primaryBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Action handlers
  const handleMarkComplete = async () => {
    Alert.alert(
      'Complete Project',
      'Are you sure you want to mark this project completed? This awards 100 XP, 50 Points, and automatically adds it to your Career Portfolio for interviews and resume generation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete & Graduate',
          onPress: async () => {
            try {
              await projectService.completeProject(project.id);
              Alert.alert('🎉 Congratulations!', 'Project completed! +100 XP and +50 Points awarded. Synced to your Career Portfolio.');
              loadData();
            } catch (err) {
              Alert.alert('Error', 'Failed to complete project.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Project',
      `Permanently delete "${project.name}" and all associated milestones, tasks, features, and test cases?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await projectRepository.deleteUserProject(project.id);
            navigate('Projects');
          },
        },
      ]
    );
  };

  const handleToggleMilestone = async (m: ProjectMilestone) => {
    const nextStatus = m.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    await projectService.updateMilestoneStatus(m.id, nextStatus);
    loadData();
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;
    await projectRepository.createProjectTask({
      project_id: project.id,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim(),
      priority: newTaskPriority,
      task_type: newTaskType,
      status: 'TODO',
      estimated_minutes: 60,
    });
    setNewTaskTitle('');
    setNewTaskDesc('');
    setShowTaskModal(false);
    loadData();
  };

  const handleAdvanceTask = async (task: ProjectTask) => {
    const nextStatus = task.status === 'TODO' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'COMPLETED' : 'TODO';
    await projectRepository.updateProjectTask(task.id, {
      status: nextStatus,
      completed_at: nextStatus === 'COMPLETED' ? new Date().toISOString() : null,
    });
    loadData();
  };

  const handleCreateFeature = async () => {
    if (!newFeatureTitle.trim()) return;
    await projectRepository.createProjectFeature({
      project_id: project.id,
      title: newFeatureTitle.trim(),
      description: newFeatureDesc.trim(),
      priority: newFeaturePriority,
      status: 'PLANNED',
    });
    setNewFeatureTitle('');
    setNewFeatureDesc('');
    setShowFeatureModal(false);
    loadData();
  };

  const handleCompleteFeature = async (featureId: string) => {
    await projectService.completeFeature(featureId);
    Alert.alert('Feature Complete', '+10 XP earned!');
    loadData();
  };

  const handleCreateBug = async () => {
    if (!newBugTitle.trim()) return;
    await projectRepository.createProjectBug({
      project_id: project.id,
      title: newBugTitle.trim(),
      description: newBugDesc.trim(),
      reproduction_steps: newBugSteps.trim(),
      severity: newBugSeverity,
      status: 'OPEN',
    });
    setNewBugTitle('');
    setNewBugDesc('');
    setNewBugSteps('');
    setShowBugModal(false);
    loadData();
  };

  const handleResolveBug = async (bugId: string) => {
    await projectService.resolveBug(bugId, 'Fixed and verified');
    Alert.alert('Bug Resolved', '+15 XP awarded! (Bug Hunter)');
    loadData();
  };

  const handleCreateTestCase = async () => {
    if (!newTestTitle.trim()) return;
    await projectRepository.createProjectTestCase({
      project_id: project.id,
      title: newTestTitle.trim(),
      description: newTestDesc.trim(),
      expected_output: newTestExpected.trim(),
      test_type: newTestType,
      status: 'NOT_RUN',
    });
    setNewTestTitle('');
    setNewTestDesc('');
    setNewTestExpected('');
    setShowTestCaseModal(false);
    loadData();
  };

  const handleUpdateTestStatus = async (tcId: string, status: ProjectTestCase['status']) => {
    await projectRepository.updateProjectTestCase(tcId, { status });
    loadData();
  };

  const handleSaveUrls = async () => {
    await projectRepository.updateUserProject(project.id, {
      github_url: editGithubUrl.trim(),
      live_url: editLiveUrl.trim(),
    });
    setShowEditProjectModal(false);
    loadData();
  };

  const tabs: Array<{ id: DetailTab; label: string; icon: any; count?: number }> = [
    { id: 'overview', label: 'Overview', icon: 'grid-outline' },
    { id: 'roadmap', label: 'Roadmap', icon: 'git-merge-outline', count: milestones.length },
    { id: 'tasks', label: 'Tasks', icon: 'checkbox-outline', count: tasks.length },
    { id: 'features', label: 'Features', icon: 'star-outline', count: features.length },
    { id: 'bugs', label: 'Bugs', icon: 'bug-outline', count: bugs.filter((b) => b.status === 'OPEN').length },
    { id: 'testing', label: 'Testing', icon: 'flask-outline', count: testCases.length },
    { id: 'curriculum', label: 'Curriculum', icon: 'school-outline', count: learningLinks.length },
    { id: 'docs', label: 'Docs', icon: 'document-text-outline' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {project.name}
          </Text>
          <View style={styles.headerMetaRow}>
            <View style={[styles.catBadge, { backgroundColor: colors.primary + '1A' }]}>
              <Text style={[styles.catBadgeText, { color: colors.primary }]}>{project.category}</Text>
            </View>
            <Text style={[styles.headerDiff, { color: colors.textSecondary }]}>• {project.difficulty}</Text>
            <Text style={[styles.headerProgress, { color: colors.primary }]}>• {Math.round(project.progress)}% Complete</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.menuBtn} onPress={() => setShowEditProjectModal(true)}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Tabs Horizontal Scroll */}
      <View style={[styles.tabBar, { borderBottomColor: colors.border, backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContent}>
          {tabs.map((t) => {
            const isSelected = activeTab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.tabItem,
                  isSelected && [styles.tabItemActive, { borderBottomColor: colors.primary }],
                ]}
                onPress={() => setActiveTab(t.id)}
              >
                <Ionicons
                  name={t.icon}
                  size={16}
                  color={isSelected ? colors.primary : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.tabLabel,
                    { color: isSelected ? colors.primary : colors.textSecondary, fontWeight: isSelected ? '700' : '500' },
                  ]}
                >
                  {t.label}
                </Text>
                {t.count !== undefined && t.count > 0 && (
                  <View style={[styles.tabBadge, { backgroundColor: isSelected ? colors.primary : colors.border }]}>
                    <Text style={[styles.tabBadgeText, { color: isSelected ? '#FFFFFF' : colors.textSecondary }]}>
                      {t.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Content Body */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <View style={styles.tabSection}>
            {/* Health Card */}
            {healthStatus && <ProjectHealthCard health={healthStatus} />}

            {/* Problem & Goal */}
            <View style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
              <Text style={[styles.cardSectionTitle, { color: colors.text }]}>Problem & Objective</Text>
              <Text style={[styles.cardBodyText, { color: colors.textSecondary }]}>
                {project.problem_statement || project.description || 'No problem statement provided.'}
              </Text>
              {project.goal ? (
                <View style={styles.goalBox}>
                  <Text style={styles.goalLabel}>Target Goal:</Text>
                  <Text style={styles.goalValue}>{project.goal}</Text>
                </View>
              ) : null}
            </View>

            {/* Technical Stack */}
            <View style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
              <Text style={[styles.cardSectionTitle, { color: colors.text }]}>Tech Stack</Text>
              <View style={styles.techWrap}>
                {project.technologies.map((t, idx) => (
                  <View key={idx} style={[styles.techChip, { backgroundColor: isDark ? '#374151' : '#E5E7EB' }]}>
                    <Text style={[styles.techChipText, { color: colors.text }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Repository & Demo Links */}
            <View style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
              <View style={styles.cardHeaderRow}>
                <Text style={[styles.cardSectionTitle, { color: colors.text }]}>Links & Artifacts</Text>
                <TouchableOpacity onPress={() => setShowEditProjectModal(true)}>
                  <Ionicons name="pencil" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.linkRow}>
                <Ionicons name="logo-github" size={20} color={colors.textSecondary} />
                <Text style={[styles.linkValue, { color: project.github_url ? colors.primary : colors.textSecondary }]}>
                  {project.github_url || 'No GitHub link added yet'}
                </Text>
              </View>

              <View style={styles.linkRow}>
                <Ionicons name="globe-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.linkValue, { color: project.live_url ? colors.primary : colors.textSecondary }]}>
                  {project.live_url || 'No live demo URL configured'}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.overviewActionsRow}>
              {project.status !== 'COMPLETED' ? (
                <TouchableOpacity style={[styles.completeBtn, { backgroundColor: '#10B981' }]} onPress={handleMarkComplete}>
                  <Ionicons name="trophy-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.btnTextWhite}>Complete Project & Add to Portfolio</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.completedBanner}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.completedBannerText}>This project is fully verified and completed!</Text>
                </View>
              )}

              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.deleteBtnText}>Delete Project</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ROADMAP / MILESTONES TAB */}
        {activeTab === 'roadmap' && (
          <View style={styles.tabSection}>
            <View style={styles.tabActionHeader}>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {milestones.filter((m) => m.status === 'COMPLETED').length} of {milestones.length} Milestones Completed
              </Text>
            </View>

            {milestones.map((m, idx) => {
              const isDone = m.status === 'COMPLETED';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.milestoneCard,
                    { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: isDone ? '#10B981' : colors.border },
                  ]}
                >
                  <TouchableOpacity
                    style={[styles.checkbox, isDone && { backgroundColor: '#10B981', borderColor: '#10B981' }]}
                    onPress={() => handleToggleMilestone(m)}
                  >
                    {isDone && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </TouchableOpacity>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.milestoneTopRow}>
                      <Text style={[styles.milestoneStage, { color: colors.primary }]}>Stage {idx + 1}</Text>
                      <Text style={[styles.milestoneStatus, { color: isDone ? '#10B981' : '#F59E0B' }]}>
                        {m.status}
                      </Text>
                    </View>
                    <Text style={[styles.milestoneTitle, { color: colors.text, textDecorationLine: isDone ? 'line-through' : 'none' }]}>
                      {m.title}
                    </Text>
                    {m.description ? (
                      <Text style={[styles.milestoneDesc, { color: colors.textSecondary }]}>{m.description}</Text>
                    ) : null}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <View style={styles.tabSection}>
            <View style={styles.tabActionHeader}>
              <TouchableOpacity
                style={[styles.primarySmallBtn, { backgroundColor: colors.primary }]}
                onPress={() => navigate('ProjectTasks', { projectId: project.id })}
              >
                <Ionicons name="albums-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.btnTextWhite}>Open Kanban Board</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.secondarySmallBtn, { borderColor: colors.primary }]}
                onPress={() => setShowTaskModal(true)}
              >
                <Ionicons name="add" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={[styles.btnTextPrimary, { color: colors.primary }]}>Add Task</Text>
              </TouchableOpacity>
            </View>

            {tasks.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No tasks yet. Create one or open the Kanban board.</Text>
              </View>
            ) : (
              tasks.map((t) => {
                const isCompleted = t.status === 'COMPLETED';
                return (
                  <View
                    key={t.id}
                    style={[
                      styles.taskCard,
                      { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border },
                    ]}
                  >
                    <TouchableOpacity
                      style={[styles.checkbox, isCompleted && { backgroundColor: '#10B981', borderColor: '#10B981' }]}
                      onPress={() => handleAdvanceTask(t)}
                    >
                      {isCompleted && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </TouchableOpacity>

                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.taskTitle, { color: colors.text, textDecorationLine: isCompleted ? 'line-through' : 'none' }]}>
                        {t.title}
                      </Text>
                      {t.description ? (
                        <Text style={[styles.taskDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                          {t.description}
                        </Text>
                      ) : null}

                      <View style={styles.taskMetaRow}>
                        <View style={[styles.tag, { backgroundColor: colors.border }]}>
                          <Text style={[styles.tagText, { color: colors.textSecondary }]}>{t.task_type}</Text>
                        </View>
                        <View style={[styles.tag, { backgroundColor: t.priority === 'HIGH' ? '#FEE2E2' : '#EFF6FF' }]}>
                          <Text style={[styles.tagText, { color: t.priority === 'HIGH' ? '#DC2626' : '#2563EB' }]}>
                            {t.priority}
                          </Text>
                        </View>
                        <Text style={[styles.taskStatusText, { color: isCompleted ? '#10B981' : '#F59E0B' }]}>
                          {t.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* FEATURES TAB */}
        {activeTab === 'features' && (
          <View style={styles.tabSection}>
            <View style={styles.tabActionHeader}>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {features.filter((f) => f.status === 'COMPLETED').length} of {features.length} Features Completed
              </Text>
              <TouchableOpacity
                style={[styles.primarySmallBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowFeatureModal(true)}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.btnTextWhite}>Add Feature</Text>
              </TouchableOpacity>
            </View>

            {features.map((f) => {
              const isDone = f.status === 'COMPLETED';
              return (
                <View
                  key={f.id}
                  style={[
                    styles.featureCard,
                    { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: isDone ? '#10B981' : colors.border },
                  ]}
                >
                  <View style={styles.featureTopRow}>
                    <Text style={[styles.featureTitle, { color: colors.text }]}>{f.title}</Text>
                    <View style={[styles.tag, { backgroundColor: isDone ? '#D1FAE5' : '#EFF6FF' }]}>
                      <Text style={[styles.tagText, { color: isDone ? '#059669' : '#2563EB' }]}>{f.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{f.description}</Text>

                  {!isDone && (
                    <TouchableOpacity
                      style={[styles.completeFeatureBtn, { backgroundColor: '#10B981' }]}
                      onPress={() => handleCompleteFeature(f.id)}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.btnTextWhite}>Mark Complete (+10 XP)</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* BUGS TAB */}
        {activeTab === 'bugs' && (
          <View style={styles.tabSection}>
            <View style={styles.tabActionHeader}>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {bugs.filter((b) => b.status === 'OPEN').length} Open Bugs
              </Text>
              <TouchableOpacity
                style={[styles.primarySmallBtn, { backgroundColor: '#EF4444' }]}
                onPress={() => setShowBugModal(true)}
              >
                <Ionicons name="bug-outline" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.btnTextWhite}>Report Bug</Text>
              </TouchableOpacity>
            </View>

            {bugs.map((b) => {
              const isOpen = b.status === 'OPEN';
              return (
                <View
                  key={b.id}
                  style={[
                    styles.bugCard,
                    { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: isOpen ? '#FCA5A5' : colors.border },
                  ]}
                >
                  <View style={styles.bugTopRow}>
                    <Text style={[styles.bugTitle, { color: colors.text }]}>{b.title}</Text>
                    <View style={[styles.tag, { backgroundColor: isOpen ? '#FEE2E2' : '#D1FAE5' }]}>
                      <Text style={[styles.tagText, { color: isOpen ? '#DC2626' : '#059669' }]}>{b.severity}</Text>
                    </View>
                  </View>

                  <Text style={[styles.bugDesc, { color: colors.textSecondary }]}>{b.description}</Text>
                  {b.reproduction_steps ? (
                    <Text style={[styles.bugSteps, { color: colors.textSecondary }]}>
                      Steps: {b.reproduction_steps}
                    </Text>
                  ) : null}

                  {isOpen && (
                    <TouchableOpacity
                      style={[styles.resolveBugBtn, { backgroundColor: '#10B981' }]}
                      onPress={() => handleResolveBug(b.id)}
                    >
                      <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                      <Text style={styles.btnTextWhite}>Mark Resolved (+15 XP)</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* TESTING TAB */}
        {activeTab === 'testing' && (
          <View style={styles.tabSection}>
            <View style={styles.tabActionHeader}>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                {testCases.filter((tc) => tc.status === 'PASSED').length} of {testCases.length} Passed
              </Text>
              <TouchableOpacity
                style={[styles.primarySmallBtn, { backgroundColor: colors.primary }]}
                onPress={() => setShowTestCaseModal(true)}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.btnTextWhite}>Add Test Case</Text>
              </TouchableOpacity>
            </View>

            {testCases.map((tc) => {
              const statusColor = tc.status === 'PASSED' ? '#10B981' : tc.status === 'FAILED' ? '#EF4444' : '#F59E0B';
              return (
                <View
                  key={tc.id}
                  style={[
                    styles.testCard,
                    { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border },
                  ]}
                >
                  <View style={styles.testTopRow}>
                    <Text style={[styles.testTitle, { color: colors.text }]}>{tc.title}</Text>
                    <View style={[styles.tag, { backgroundColor: statusColor + '20' }]}>
                      <Text style={[styles.tagText, { color: statusColor }]}>{tc.status}</Text>
                    </View>
                  </View>

                  <Text style={[styles.testDesc, { color: colors.textSecondary }]}>{tc.description}</Text>
                  {tc.expected_output ? (
                    <Text style={[styles.testExpect, { color: colors.textSecondary }]}>
                      Expected: {tc.expected_output}
                    </Text>
                  ) : null}

                  <View style={styles.testButtonsRow}>
                    <TouchableOpacity
                      style={[styles.testActionBtn, { backgroundColor: '#10B981' }]}
                      onPress={() => handleUpdateTestStatus(tc.id, 'PASSED')}
                    >
                      <Text style={styles.btnTextWhite}>Pass</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.testActionBtn, { backgroundColor: '#EF4444' }]}
                      onPress={() => handleUpdateTestStatus(tc.id, 'FAILED')}
                    >
                      <Text style={styles.btnTextWhite}>Fail</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.testActionBtn, { backgroundColor: '#6B7280' }]}
                      onPress={() => handleUpdateTestStatus(tc.id, 'BLOCKED')}
                    >
                      <Text style={styles.btnTextWhite}>Block</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* CURRICULUM LINKS TAB */}
        {activeTab === 'curriculum' && (
          <View style={styles.tabSection}>
            <LearningLinksList
              links={learningLinks}
              onLearnTopic={(courseId, moduleId, topicId) => {
                navigate('CourseRoadmap', { courseId, moduleId: moduleId || undefined, topicId: topicId || undefined });
              }}
            />
          </View>
        )}

        {/* DOCUMENTATION TAB */}
        {activeTab === 'docs' && (
          <View style={styles.tabSection}>
            <View style={[styles.card, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
              <Text style={[styles.cardSectionTitle, { color: colors.text }]}>14-Section Engineering Documentation</Text>
              <Text style={[styles.cardBodyText, { color: colors.textSecondary }]}>
                Complete professional documentation including architecture, database schemas, APIs, challenges, and tradeoffs.
              </Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
                onPress={() => navigate('ProjectDocumentation', { projectId: project.id })}
              >
                <Ionicons name="document-text-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Open Documentation Studio</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* CREATE TASK MODAL */}
      <Modal visible={showTaskModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Project Task</Text>

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Task Title (e.g. Set up JWT Auth)"
              placeholderTextColor={colors.textSecondary}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.modalArea, { color: colors.text, borderColor: colors.border }]}
              placeholder="Description & acceptance criteria"
              placeholderTextColor={colors.textSecondary}
              value={newTaskDesc}
              onChangeText={setNewTaskDesc}
              multiline
            />

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowTaskModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={handleCreateTask}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Create Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CREATE FEATURE MODAL */}
      <Modal visible={showFeatureModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Feature</Text>

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Feature Title (e.g. Realtime WebSocket Alerts)"
              placeholderTextColor={colors.textSecondary}
              value={newFeatureTitle}
              onChangeText={setNewFeatureTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.modalArea, { color: colors.text, borderColor: colors.border }]}
              placeholder="User story & requirement"
              placeholderTextColor={colors.textSecondary}
              value={newFeatureDesc}
              onChangeText={setNewFeatureDesc}
              multiline
            />

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowFeatureModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={handleCreateFeature}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Add Feature</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* REPORT BUG MODAL */}
      <Modal visible={showBugModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Report Project Bug</Text>

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Bug Summary"
              placeholderTextColor={colors.textSecondary}
              value={newBugTitle}
              onChangeText={setNewBugTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.modalArea, { color: colors.text, borderColor: colors.border }]}
              placeholder="Observed defect and expected behavior"
              placeholderTextColor={colors.textSecondary}
              value={newBugDesc}
              onChangeText={setNewBugDesc}
              multiline
            />

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Steps to reproduce"
              placeholderTextColor={colors.textSecondary}
              value={newBugSteps}
              onChangeText={setNewBugSteps}
            />

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowBugModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: '#EF4444' }]} onPress={handleCreateBug}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save Bug</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CREATE TEST CASE MODAL */}
      <Modal visible={showTestCaseModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Test Case</Text>

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Test Case Name"
              placeholderTextColor={colors.textSecondary}
              value={newTestTitle}
              onChangeText={setNewTestTitle}
            />

            <TextInput
              style={[styles.modalInput, styles.modalArea, { color: colors.text, borderColor: colors.border }]}
              placeholder="Scenario & input conditions"
              placeholderTextColor={colors.textSecondary}
              value={newTestDesc}
              onChangeText={setNewTestDesc}
              multiline
            />

            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Expected Outcome"
              placeholderTextColor={colors.textSecondary}
              value={newTestExpected}
              onChangeText={setNewTestExpected}
            />

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowTestCaseModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={handleCreateTestCase}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Add Test Case</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT URLS / PROJECT MODAL */}
      <Modal visible={showEditProjectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Project Links</Text>

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>GitHub Repository URL</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="https://github.com/username/project"
              placeholderTextColor={colors.textSecondary}
              value={editGithubUrl}
              onChangeText={setEditGithubUrl}
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Live Demo URL</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="https://my-app.up.railway.app"
              placeholderTextColor={colors.textSecondary}
              value={editLiveUrl}
              onChangeText={setEditLiveUrl}
              autoCapitalize="none"
            />

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowEditProjectModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveUrls}>
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save Links</Text>
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
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  catBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginRight: 6 },
  catBadgeText: { fontSize: 11, fontWeight: '700' },
  headerDiff: { fontSize: 12, marginRight: 6 },
  headerProgress: { fontSize: 12, fontWeight: '600' },
  menuBtn: { padding: 4 },
  tabBar: { borderBottomWidth: 1 },
  tabScrollContent: { paddingHorizontal: 12 },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {},
  tabLabel: { fontSize: 13 },
  tabBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabBadgeText: { fontSize: 10, fontWeight: '700' },
  scrollContent: { padding: 16 },
  tabSection: {},
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  cardSectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  cardBodyText: { fontSize: 14, lineHeight: 20 },
  goalBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  goalLabel: { fontSize: 11, fontWeight: '700', color: '#1E40AF', textTransform: 'uppercase' },
  goalValue: { fontSize: 13, color: '#1E3A8A', marginTop: 2 },
  techWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  techChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  techChipText: { fontSize: 12, fontWeight: '600' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  linkValue: { fontSize: 13, marginLeft: 10, flex: 1 },
  overviewActionsRow: { marginTop: 8 },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
  },
  completedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  completedBannerText: { color: '#065F46', fontWeight: '700', fontSize: 13, marginLeft: 8 },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  deleteBtnText: { color: '#EF4444', fontSize: 13, fontWeight: '600' },
  btnTextWhite: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  btnTextPrimary: { fontWeight: '700', fontSize: 13 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  tabActionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionSubtitle: { fontSize: 13, fontWeight: '600' },
  primarySmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondarySmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 8,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  milestoneTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  milestoneStage: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  milestoneStatus: { fontSize: 11, fontWeight: '700' },
  milestoneTitle: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  milestoneDesc: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  taskTitle: { fontSize: 14, fontWeight: '600' },
  taskDesc: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  taskMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 6 },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tagText: { fontSize: 10, fontWeight: '700' },
  taskStatusText: { fontSize: 11, fontWeight: '700', marginLeft: 'auto' },
  emptyCard: { padding: 24, alignItems: 'center' },
  emptyText: { fontSize: 13 },
  featureCard: { padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  featureTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  featureTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  featureDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  completeFeatureBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 10,
  },
  bugCard: { padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  bugTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bugTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  bugDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  bugSteps: { fontSize: 12, fontStyle: 'italic', marginTop: 6 },
  resolveBugBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 10,
  },
  testCard: { padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 10 },
  testTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  testTitle: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  testDesc: { fontSize: 13, marginTop: 6, lineHeight: 18 },
  testExpect: { fontSize: 12, marginTop: 6, fontWeight: '600' },
  testButtonsRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  testActionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
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
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
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
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  modalBtnsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  modalCancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  modalSaveBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
});
