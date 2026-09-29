import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import { ProjectDocumentation, UserProject } from '../../models/Project';
import { projectRepository } from '../../repositories/ProjectRepository';
import { projectService } from '../../services/ProjectService';

export const ProjectDocumentationScreen: React.FC = () => {
  const { params, goBack } = useAppNavigation();
  const { colors, isDark } = useTheme();

  const projectId = params?.projectId as string | undefined;

  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<UserProject | null>(null);
  const [doc, setDoc] = useState<ProjectDocumentation | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');
  const [goal, setGoal] = useState('');
  const [features, setFeatures] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [architecture, setArchitecture] = useState('');
  const [database, setDatabase] = useState('');
  const [apis, setApis] = useState('');
  const [importantDecisions, setImportantDecisions] = useState('');
  const [challenges, setChallenges] = useState('');
  const [solutions, setSolutions] = useState('');
  const [testing, setTesting] = useState('');
  const [deployment, setDeployment] = useState('');
  const [futureImprovements, setFutureImprovements] = useState('');

  // AI README Modal
  const [generatingReadme, setGeneratingReadme] = useState(false);
  const [showReadmeModal, setShowReadmeModal] = useState(false);
  const [readmeDraft, setReadmeDraft] = useState('');

  const loadData = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [proj, document] = await Promise.all([
        projectRepository.getUserProjectById(projectId),
        projectRepository.getProjectDocumentation(projectId),
      ]);

      setProject(proj);
      if (document) {
        setDoc(document);
        setTitle(document.title || proj?.name || '');
        setProblem(document.problem || proj?.problem_statement || '');
        setGoal(document.goal || proj?.goal || '');
        setFeatures(document.features || '');
        setTechnologies(document.technologies || proj?.technologies.join(', ') || '');
        setArchitecture(document.architecture || '');
        setDatabase(document.database || '');
        setApis(document.apis || '');
        setImportantDecisions(document.important_decisions || '');
        setChallenges(document.challenges || '');
        setSolutions(document.solutions || '');
        setTesting(document.testing || '');
        setDeployment(document.deployment || '');
        setFutureImprovements(document.future_improvements || '');
      }
    } catch (err) {
      console.error('[ProjectDocumentationScreen] load error:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!projectId) return;
    try {
      await projectRepository.saveProjectDocumentation(projectId, {
        title,
        problem,
        goal,
        features,
        technologies,
        architecture,
        database,
        apis,
        important_decisions: importantDecisions,
        challenges,
        solutions,
        testing,
        deployment,
        future_improvements: futureImprovements,
      });
      Alert.alert('Saved', 'Project documentation updated successfully.');
    } catch (err) {
      Alert.alert('Error', 'Failed to save documentation.');
    }
  };

  const handleGenerateAIReadme = async () => {
    if (!projectId) return;
    try {
      setGeneratingReadme(true);
      const generated = await projectService.generateProjectReadme(projectId);
      setReadmeDraft(generated.markdown);
      setShowReadmeModal(true);
    } catch (err) {
      Alert.alert('AI Error', 'Could not generate README draft.');
    } finally {
      setGeneratingReadme(false);
    }
  };

  const handleApplyReadmeToDoc = () => {
    setShowReadmeModal(false);
    Alert.alert('README Accepted', 'The draft is ready for your repository.');
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading documentation studio...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {project?.name || 'Project'} • Docs
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            14-Section Engineering Documentation
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.aiBtn, { backgroundColor: '#8B5CF6' }]}
          onPress={handleGenerateAIReadme}
          disabled={generatingReadme}
        >
          {generatingReadme ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="sparkles" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.aiBtnText}>AI README</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section 1: Title */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>1. Project Title & Tagline</Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Official project title"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Section 2: Problem */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>2. Problem Statement</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={problem}
            onChangeText={setProblem}
            placeholder="What core business or technical pain point does this solve?"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 3: Goal */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>3. Objective & Measurable Goals</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={goal}
            onChangeText={setGoal}
            placeholder="Key target outcomes, SLA benchmarks, or functional goals"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 4: Features */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>4. Core Features List</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={features}
            onChangeText={setFeatures}
            placeholder="Bulleted list of key capabilities and user workflows"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 5: Technologies */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>5. Technology Stack & Rationale</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={technologies}
            onChangeText={setTechnologies}
            placeholder="e.g. FastAPI, PostgreSQL, Redis, React Native, Docker"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 6: Architecture */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>6. System Architecture & Component Diagram</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={architecture}
            onChangeText={setArchitecture}
            placeholder="High-level architecture, module breakdown, and data flow description"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 7: Database */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>7. Database Schema & Storage Decisions</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={database}
            onChangeText={setDatabase}
            placeholder="Key tables/collections, indexes, foreign keys, normalization/sharding"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 8: APIs */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>8. API Endpoints & Interfaces</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={apis}
            onChangeText={setApis}
            placeholder="REST / GraphQL / WebSocket endpoints, payload structures, auth"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 9: Decisions */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>9. Architectural Decisions & Trade-offs (ADRs)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={importantDecisions}
            onChangeText={setImportantDecisions}
            placeholder="Why X instead of Y? Trade-offs between latency, complexity, and storage."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 10: Challenges */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>10. Engineering Challenges Encountered</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={challenges}
            onChangeText={setChallenges}
            placeholder="Unexpected roadblocks, concurrency bottlenecks, or API limitations"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 11: Solutions */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>11. Technical Solutions & Resolutions</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={solutions}
            onChangeText={setSolutions}
            placeholder="How each challenge was solved or mitigated"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 12: Testing */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>12. Testing Strategy & Quality Assurance</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={testing}
            onChangeText={setTesting}
            placeholder="Unit tests, integration tests, mock data, and test coverage"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 13: Deployment */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>13. Deployment & CI/CD Pipeline</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={deployment}
            onChangeText={setDeployment}
            placeholder="Docker, GitHub Actions, environment variables, hosting platform"
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Section 14: Future Improvements */}
        <View style={[styles.sectionCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>14. Future Improvements & Scaling Roadmap</Text>
          <TextInput
            style={[styles.input, styles.textArea, { color: colors.text, borderColor: colors.border }]}
            value={futureImprovements}
            onChangeText={setFutureImprovements}
            placeholder="What would you add next? Distributed caching, microservices, etc."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>

        {/* Save Bar */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Ionicons name="save-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>Save All 14 Sections</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* AI README PREVIEW & APPROVAL MODAL */}
      <Modal visible={showReadmeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.readmeCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.readmeHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.readmeModalTitle, { color: colors.text }]}>AI Generated README</Text>
                <Text style={[styles.readmeNotice, { color: '#8B5CF6' }]}>
                  Generated from real project facts. Review before copying.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowReadmeModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.readmeScrollBox}>
              <Text style={[styles.readmeText, { color: colors.text }]}>{readmeDraft}</Text>
            </ScrollView>

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowReadmeModal(false)}>
                <Text style={{ color: colors.textSecondary }}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: '#8B5CF6' }]}
                onPress={handleApplyReadmeToDoc}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Approve & Use</Text>
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
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  aiBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  scrollContent: { padding: 16 },
  sectionCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  fieldLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  readmeCard: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  readmeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  readmeModalTitle: { fontSize: 18, fontWeight: '700' },
  readmeNotice: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  readmeScrollBox: {
    maxHeight: 400,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  readmeText: { fontSize: 13, lineHeight: 20, fontFamily: 'monospace' },
  modalBtnsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalCancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  modalSaveBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
});
