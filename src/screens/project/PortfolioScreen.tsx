import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useTheme } from '../../theme/ThemeContext';
import { PortfolioProfile, UserProject } from '../../models/Project';
import { projectRepository } from '../../repositories/ProjectRepository';
import { PortfolioCard } from '../../components/project/PortfolioCard';

export const PortfolioScreen: React.FC = () => {
  const { navigate, goBack } = useAppNavigation();
  const { colors, isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<PortfolioProfile | null>(null);
  const [projects, setProjects] = useState<UserProject[]>([]);

  // Profile Edit Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Export Modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTitle, setExportTitle] = useState('');
  const [exportContent, setExportContent] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prof, projs] = await Promise.all([
        projectRepository.getPortfolioProfile(),
        projectRepository.getPortfolioProjects(),
      ]);

      setProfile(prof);
      setProjects(projs);

      if (prof) {
        setName(prof.name);
        setHeadline(prof.headline);
        setBio(prof.bio);
        setSkillsText(prof.skills.join(', '));
        setGithubUrl(prof.github_url);
        setLinkedinUrl(prof.linkedin_url);
      }
    } catch (err) {
      console.error('[PortfolioScreen] load error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveProfile = async () => {
    const skillsArray = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await projectRepository.updatePortfolioProfile({
      name: name.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      skills: skillsArray,
      github_url: githubUrl.trim(),
      linkedin_url: linkedinUrl.trim(),
    });

    setShowProfileModal(false);
    loadData();
  };

  const handleTogglePin = async (id: string, currentlyPinned: boolean) => {
    await projectRepository.toggleProjectPinned(id, !currentlyPinned);
    loadData();
  };

  const handleHideProject = async (id: string) => {
    await projectRepository.toggleProjectHidden(id, true);
    Alert.alert('Project Hidden', 'Project hidden from your public portfolio.');
    loadData();
  };

  const handleInterviewDefense = (proj: UserProject) => {
    navigate('AIInterview', {
      topic: `${proj.name} Engineering Architecture & Technical Defense`,
      projectTitle: proj.name,
    });
  };

  const handleExportMarkdown = async () => {
    const md = await projectRepository.exportPortfolioMarkdown();
    setExportTitle('Portfolio Markdown (GitHub README format)');
    setExportContent(md);
    setShowExportModal(true);
  };

  const handleExportJSON = async () => {
    const json = await projectRepository.exportPortfolioJSON();
    setExportTitle('Portfolio JSON (Data Export)');
    setExportContent(json);
    setShowExportModal(true);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading developer portfolio...</Text>
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Developer Portfolio</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Verified Projects & Technical Defense
          </Text>
        </View>

        <TouchableOpacity style={styles.editProfileBtn} onPress={() => setShowProfileModal(true)}>
          <Ionicons name="create-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        {profile && (
          <View style={[styles.profileCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
            <View style={styles.profileTopRow}>
              <View style={[styles.avatarBox, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'D'}
                </Text>
              </View>
              <View style={styles.profileTextInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>{profile.name || 'Developer Name'}</Text>
                <Text style={[styles.profileHeadline, { color: colors.primary }]}>
                  {profile.headline || 'Full Stack & Systems Engineer'}
                </Text>
              </View>
            </View>

            {profile.bio ? (
              <Text style={[styles.profileBio, { color: colors.textSecondary }]}>{profile.bio}</Text>
            ) : null}

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <View style={styles.skillsWrap}>
                {profile.skills.map((s, idx) => (
                  <View key={idx} style={[styles.skillChip, { backgroundColor: isDark ? '#374151' : '#EFF6FF' }]}>
                    <Text style={[styles.skillChipText, { color: colors.primary }]}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Links Row */}
            <View style={styles.profileLinksRow}>
              {profile.github_url ? (
                <View style={styles.socialPill}>
                  <Ionicons name="logo-github" size={14} color={colors.textSecondary} />
                  <Text style={[styles.socialPillText, { color: colors.textSecondary }]}>GitHub</Text>
                </View>
              ) : null}
              {profile.linkedin_url ? (
                <View style={styles.socialPill}>
                  <Ionicons name="logo-linkedin" size={14} color="#0284C7" />
                  <Text style={[styles.socialPillText, { color: colors.textSecondary }]}>LinkedIn</Text>
                </View>
              ) : null}
            </View>
          </View>
        )}

        {/* Portfolio Projects Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Projects ({projects.length})</Text>
          <View style={styles.exportActionsRow}>
            <TouchableOpacity style={styles.exportIconBtn} onPress={handleExportMarkdown}>
              <Ionicons name="logo-markdown" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportIconBtn} onPress={handleExportJSON}>
              <Ionicons name="code-download-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {projects.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF', borderColor: colors.border }]}>
            <Ionicons name="construct-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Projects in Portfolio Yet</Text>
            <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
              Build and complete projects from the Project Blueprint library to showcase your work here.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigate('ProjectIdeas')}
            >
              <Text style={styles.primaryBtnText}>Browse Project Ideas</Text>
            </TouchableOpacity>
          </View>
        ) : (
          projects.map((proj) => (
            <PortfolioCard
              key={proj.id}
              project={proj}
              onTogglePin={handleTogglePin}
              onHideProject={handleHideProject}
              onInterviewPrep={handleInterviewDefense}
            />
          ))
        )}
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={showProfileModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={[styles.modalCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Portfolio Profile</Text>

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Your Full Name</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Alex Chen"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Headline / Title</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="e.g. Backend & Systems Engineer"
                placeholderTextColor={colors.textSecondary}
                value={headline}
                onChangeText={setHeadline}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Engineering Bio</Text>
              <TextInput
                style={[styles.modalInput, styles.modalArea, { color: colors.text, borderColor: colors.border }]}
                placeholder="Brief summary of your background and key technical domains"
                placeholderTextColor={colors.textSecondary}
                value={bio}
                onChangeText={setBio}
                multiline
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Core Skills (comma separated)</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="Python, React Native, SQL, Docker, FastAPI"
                placeholderTextColor={colors.textSecondary}
                value={skillsText}
                onChangeText={setSkillsText}
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>GitHub Profile URL</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="https://github.com/alexchen"
                placeholderTextColor={colors.textSecondary}
                value={githubUrl}
                onChangeText={setGithubUrl}
                autoCapitalize="none"
              />

              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>LinkedIn Profile URL</Text>
              <TextInput
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
                placeholder="https://linkedin.com/in/alexchen"
                placeholderTextColor={colors.textSecondary}
                value={linkedinUrl}
                onChangeText={setLinkedinUrl}
                autoCapitalize="none"
              />

              <View style={styles.modalBtnsRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowProfileModal(false)}>
                  <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: colors.primary }]} onPress={handleSaveProfile}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save Profile</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* EXPORT CONTENT MODAL */}
      <Modal visible={showExportModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.exportCard, { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }]}>
            <View style={styles.exportHeader}>
              <Text style={[styles.modalTitle, { color: colors.text, flex: 1 }]}>{exportTitle}</Text>
              <TouchableOpacity onPress={() => setShowExportModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.exportScrollBox}>
              <Text style={[styles.exportCodeText, { color: isDark ? '#93C5FD' : '#1E3A8A' }]}>
                {exportContent}
              </Text>
            </ScrollView>

            <View style={styles.modalBtnsRow}>
              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: colors.primary, width: '100%', alignItems: 'center' }]}
                onPress={() => {
                  Alert.alert('Export Ready', 'Export text loaded. You can select and copy the text directly.');
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Done</Text>
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
  editProfileBtn: { padding: 6 },
  scrollContent: { padding: 16 },
  profileCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  profileTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  profileTextInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700' },
  profileHeadline: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  profileBio: { fontSize: 13, lineHeight: 19, marginBottom: 12 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  skillChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  skillChipText: { fontSize: 11, fontWeight: '600' },
  profileLinksRow: { flexDirection: 'row', gap: 8 },
  socialPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
    gap: 4,
  },
  socialPillText: { fontSize: 11, fontWeight: '600' },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  exportActionsRow: { flexDirection: 'row', gap: 12 },
  exportIconBtn: { padding: 4 },
  emptyCard: {
    padding: 30,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyDesc: { fontSize: 13, textAlign: 'center', marginTop: 6, marginBottom: 16, lineHeight: 18 },
  primaryBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalScroll: { flexGrow: 1, justifyContent: 'center' },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  modalArea: { height: 70, textAlignVertical: 'top' },
  modalBtnsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
  modalCancelBtn: { paddingHorizontal: 14, paddingVertical: 10 },
  modalSaveBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  exportCard: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  exportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  exportScrollBox: {
    maxHeight: 400,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  exportCodeText: { fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
});
