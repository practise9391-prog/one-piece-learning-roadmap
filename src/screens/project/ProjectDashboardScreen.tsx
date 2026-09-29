import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { projectService } from '../../services/ProjectService';
import {
  ProjectDashboardStats,
  UserProject,
  ProjectCategory,
  ProjectDifficulty,
} from '../../models/Project';

const CATEGORIES: ProjectCategory[] = [
  'PYTHON',
  'DSA',
  'WEB',
  'DJANGO',
  'SQL',
  'JAVASCRIPT',
  'FRAPPE',
  'ML',
  'CUSTOM',
];

export const ProjectDashboardScreen: React.FC = () => {
  const { navigate, goBack } = useAppNavigation();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProjectDashboardStats | null>(null);
  const [projects, setProjects] = useState<UserProject[]>([]);

  // Create Custom Project Modal
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customCategory, setCustomCategory] = useState<ProjectCategory>('CUSTOM');
  const [customDifficulty, setCustomDifficulty] = useState<ProjectDifficulty>('INTERMEDIATE');
  const [customTechs, setCustomTechs] = useState('');
  const [customProblem, setCustomProblem] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [customHours, setCustomHours] = useState('20');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashStats, allProjects] = await Promise.all([
        projectService.getProjectDashboardStats(),
        projectService.getUserProjects(),
      ]);
      setStats(dashStats);
      setProjects(allProjects);
    } catch {
      Alert.alert('Error', 'Failed to load project dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateCustomProject = async () => {
    if (!customName.trim()) {
      Alert.alert('Required', 'Please enter a project name.');
      return;
    }

    try {
      const techs = customTechs
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const created = await projectService.createUserProject({
        name: customName.trim(),
        description: customDesc.trim() || 'Custom engineered real-world application.',
        category: customCategory,
        difficulty: customDifficulty,
        technologies: techs.length > 0 ? techs : ['Python', 'SQL'],
        problem_statement: customProblem.trim() || undefined,
        goal: customGoal.trim() || undefined,
        estimated_hours: parseInt(customHours, 10) || 20,
      });

      setCustomModalVisible(false);
      // Reset fields
      setCustomName('');
      setCustomDesc('');
      setCustomTechs('');
      setCustomProblem('');
      setCustomGoal('');

      loadData();
      navigate('ProjectDetails', { projectId: created.id });
    } catch {
      Alert.alert('Error', 'Failed to create custom project.');
    }
  };

  if (loading || !stats) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Loading Project Journey...</Text>
      </View>
    );
  }

  const current = stats.current_project;

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => goBack()}>
          <Ionicons name="arrow-back" size={22} color="#F1F5F9" />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Build Something Real</Text>
          <Text style={styles.headerSubtitle}>Real-World Project Builder & Portfolio Hub</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setCustomModalVisible(true)}
        >
          <Ionicons name="add-circle-outline" size={22} color="#38BDF8" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        {/* Journey Stats Hero Banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.rocketBadge}>
              <Ionicons name="rocket" size={16} color="#38BDF8" />
              <Text style={styles.rocketText}>YOUR PROJECT JOURNEY</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stats.active_projects_count}</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stats.completed_projects_count}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{stats.tasks_completed_count}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, stats.open_bugs_count > 0 && { color: '#EF4444' }]}>
                {stats.open_bugs_count}
              </Text>
              <Text style={styles.statLabel}>Open Bugs</Text>
            </View>
          </View>

          {/* Tech stack badges */}
          {stats.technologies_used.length > 0 && (
            <View style={styles.techPillRow}>
              {stats.technologies_used.slice(0, 6).map((t, idx) => (
                <View key={idx} style={styles.techPill}>
                  <Text style={styles.techPillText}>{t}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Current Active Project Card */}
        {current && (
          <View style={styles.currentCard}>
            <View style={styles.currentTop}>
              <View>
                <Text style={styles.currentTag}>CURRENT ACTIVE PROJECT</Text>
                <Text style={styles.currentTitle}>{current.name}</Text>
              </View>
              <View style={styles.currentScoreBadge}>
                <Text style={styles.currentScoreText}>{current.progress}%</Text>
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${current.progress}%` }]} />
            </View>

            <View style={styles.currentBottom}>
              <View style={styles.milestoneInfo}>
                <Ionicons name="flag-outline" size={12} color="#94A3B8" />
                <Text style={styles.milestoneText}>
                  Milestone: {stats.current_milestone?.title || 'Active Development'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.continueBtn}
                onPress={() => navigate('ProjectDetails', { projectId: current.id })}
              >
                <Text style={styles.continueBtnText}>Continue Project</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Hub Tiles */}
        <View style={styles.hubSection}>
          <Text style={styles.sectionHeader}>Project Areas</Text>

          <View style={styles.hubGrid}>
            <TouchableOpacity
              style={styles.hubTile}
              onPress={() => navigate('ProjectIdeas')}
            >
              <View style={[styles.tileIcon, { backgroundColor: '#38BDF820' }]}>
                <Ionicons name="bulb-outline" size={22} color="#38BDF8" />
              </View>
              <Text style={styles.tileTitle}>Project Ideas</Text>
              <Text style={styles.tileSubtitle}>{stats.total_ideas_count} curated ideas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hubTile}
              onPress={() =>
                current
                  ? navigate('ProjectTasks', { projectId: current.id })
                  : navigate('ProjectIdeas')
              }
            >
              <View style={[styles.tileIcon, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="grid-outline" size={22} color="#10B981" />
              </View>
              <Text style={styles.tileTitle}>Task Board</Text>
              <Text style={styles.tileSubtitle}>{stats.tasks_remaining_count} tasks left</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hubTile}
              onPress={() => navigate('Portfolio')}
            >
              <View style={[styles.tileIcon, { backgroundColor: '#A855F720' }]}>
                <Ionicons name="briefcase-outline" size={22} color="#A855F7" />
              </View>
              <Text style={styles.tileTitle}>My Portfolio</Text>
              <Text style={styles.tileSubtitle}>{stats.portfolio_projects_count} showcase items</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hubTile}
              onPress={() => setCustomModalVisible(true)}
            >
              <View style={[styles.tileIcon, { backgroundColor: '#F59E0B20' }]}>
                <Ionicons name="construct-outline" size={22} color="#F59E0B" />
              </View>
              <Text style={styles.tileTitle}>Custom Project</Text>
              <Text style={styles.tileSubtitle}>Build your own idea</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Projects List */}
        <View style={styles.projectsSection}>
          <Text style={styles.sectionHeader}>My Projects ({projects.length})</Text>

          {projects.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="code-slash-outline" size={36} color="#64748B" />
              <Text style={styles.emptyTitle}>No Projects Started</Text>
              <Text style={styles.emptySubtitle}>
                Pick an idea from our curated library or build a custom project.
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigate('ProjectIdeas')}
              >
                <Text style={styles.exploreBtnText}>Browse Project Ideas</Text>
              </TouchableOpacity>
            </View>
          ) : (
            projects.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.projectListItem}
                activeOpacity={0.75}
                onPress={() => navigate('ProjectDetails', { projectId: p.id })}
              >
                <View style={styles.projectListTop}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{p.category}</Text>
                  </View>
                  <Text style={styles.projectDifficulty}>{p.difficulty}</Text>
                </View>

                <Text style={styles.projectListName}>{p.name}</Text>
                <Text style={styles.projectListDesc} numberOfLines={2}>
                  {p.description}
                </Text>

                <View style={styles.projectListBottom}>
                  <View style={styles.barBox}>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { width: `${p.progress}%` }]} />
                    </View>
                    <Text style={styles.barText}>{p.progress}%</Text>
                  </View>

                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{p.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Custom Project Modal */}
      <Modal visible={customModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Custom Project</Text>
              <TouchableOpacity onPress={() => setCustomModalVisible(false)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Project Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Distributed Task Queue"
                placeholderTextColor="#64748B"
                value={customName}
                onChangeText={setCustomName}
              />

              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.catChoice,
                      customCategory === c && styles.catChoiceSelected,
                    ]}
                    onPress={() => setCustomCategory(c)}
                  >
                    <Text
                      style={[
                        styles.catChoiceText,
                        customCategory === c && styles.catChoiceTextSelected,
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Technologies (comma separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="Python, Django, PostgreSQL, Redis"
                placeholderTextColor="#64748B"
                value={customTechs}
                onChangeText={setCustomTechs}
              />

              <Text style={styles.label}>Problem Statement</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What real problem does this project solve?"
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={2}
                value={customProblem}
                onChangeText={setCustomProblem}
              />

              <Text style={styles.label}>Project Goal / Scope</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What is the expected result or deliverable?"
                placeholderTextColor="#64748B"
                multiline
                numberOfLines={2}
                value={customGoal}
                onChangeText={setCustomGoal}
              />

              <Text style={styles.label}>Estimated Hours</Text>
              <TextInput
                style={styles.input}
                placeholder="20"
                placeholderTextColor="#64748B"
                keyboardType="numeric"
                value={customHours}
                onChangeText={setCustomHours}
              />
            </ScrollView>

            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateCustomProject}>
              <Text style={styles.submitBtnText}>Initialize Custom Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#94A3B8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
  },
  addBtn: {
    padding: 6,
  },
  contentScroll: {
    flex: 1,
    padding: 16,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  heroTop: {
    marginBottom: 12,
  },
  rocketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rocketText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F1F5F9',
  },
  statLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  techPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  techPill: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  techPillText: {
    fontSize: 10,
    color: '#93C5FD',
    fontWeight: '600',
  },
  currentCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#38BDF850',
    marginBottom: 16,
  },
  currentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  currentTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },
  currentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
    marginTop: 2,
  },
  currentScoreBadge: {
    backgroundColor: '#0284C720',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  currentScoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 3,
  },
  currentBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  milestoneInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    marginRight: 8,
  },
  milestoneText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  continueBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hubSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 10,
  },
  hubGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hubTile: {
    width: '48.5%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 2,
  },
  tileSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
  },
  projectsSection: {
    marginBottom: 20,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    marginTop: 8,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 14,
  },
  exploreBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  exploreBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  projectListItem: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  projectListTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#38BDF8',
  },
  projectDifficulty: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  projectListName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  projectListDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
    marginBottom: 10,
  },
  projectListBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  barBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  barText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  statusPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34D399',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#F1F5F9',
    fontSize: 12,
  },
  textArea: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  catScroll: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  catChoice: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 6,
  },
  catChoiceSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#38BDF820',
  },
  catChoiceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  catChoiceTextSelected: {
    color: '#38BDF8',
  },
  submitBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
