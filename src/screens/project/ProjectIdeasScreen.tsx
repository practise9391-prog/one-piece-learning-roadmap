import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { projectService } from '../../services/ProjectService';
import {
  ProjectTemplate,
  ProjectCategory,
  ProjectDifficulty,
} from '../../models/Project';
import { ProjectIdeaCard } from '../../components/project/ProjectIdeaCard';

const CATEGORIES = [
  'ALL',
  'PYTHON',
  'DSA',
  'WEB',
  'DJANGO',
  'SQL',
  'JAVASCRIPT',
  'FRAPPE',
  'ML',
] as const;

export const ProjectIdeasScreen: React.FC = () => {
  const { navigate, goBack } = useAppNavigation();

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Template Detail Modal
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectTemplates();
      setTemplates(data);
    } catch {
      Alert.alert('Error', 'Failed to load project templates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const filteredTemplates = templates.filter((t) => {
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      const matchSkill = t.required_skills.some((s) => s.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchSkill) return false;
    }
    return true;
  });

  const handleStartProject = async (template: ProjectTemplate) => {
    try {
      setLoading(true);
      const newProj = await projectService.createUserProject({
        template_id: template.id,
        name: template.title,
        description: template.description,
        category: template.category,
        difficulty: template.difficulty,
        estimated_hours: template.estimated_hours,
        technologies: template.required_skills,
        goal: template.learning_outcomes.join('; '),
      });

      setSelectedTemplate(null);
      navigate('ProjectDetails', { projectId: newProj.id });
    } catch {
      Alert.alert('Error', 'Failed to initialize project from idea.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && templates.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Loading Project Ideas Library...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => goBack()}>
          <Ionicons name="arrow-back" size={22} color="#F1F5F9" />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.headerTitle}>Project Ideas Library</Text>
          <Text style={styles.headerSubtitle}>Curated Real-World Application Blueprints</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search-outline" size={18} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by topic, skill, or keyword..."
          placeholderTextColor="#64748B"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color="#64748B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills Filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterPill,
                selectedCategory === cat && styles.filterPillActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedCategory === cat && styles.filterPillTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Templates List */}
      <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultsCount}>
          Showing {filteredTemplates.length} blueprint ideas
        </Text>

        {filteredTemplates.map((t) => (
          <ProjectIdeaCard
            key={t.id}
            template={t}
            onStartProject={handleStartProject}
            onViewDetails={(tmpl) => setSelectedTemplate(tmpl)}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Idea Blueprint Details Modal */}
      <Modal visible={!!selectedTemplate} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTag}>{selectedTemplate?.category}</Text>
                <Text style={styles.modalTitle}>{selectedTemplate?.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTemplate(null)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.modalDesc}>{selectedTemplate?.description}</Text>

              {/* Recommended Courses */}
              {selectedTemplate?.recommended_courses && (
                <View style={styles.detailBlock}>
                  <Text style={styles.blockTitle}>Recommended Courses</Text>
                  <View style={styles.pillRow}>
                    {selectedTemplate.recommended_courses.map((crs, i) => (
                      <View key={i} style={styles.coursePill}>
                        <Text style={styles.coursePillText}>{crs}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Learning Outcomes */}
              {selectedTemplate?.learning_outcomes && (
                <View style={styles.detailBlock}>
                  <Text style={styles.blockTitle}>What You Will Learn & Build</Text>
                  {selectedTemplate.learning_outcomes.map((lo, i) => (
                    <Text key={i} style={styles.bulletItem}>
                      ✓ {lo}
                    </Text>
                  ))}
                </View>
              )}

              {/* Suggested Features */}
              {selectedTemplate?.suggested_features && (
                <View style={styles.detailBlock}>
                  <Text style={styles.blockTitle}>Suggested Core Features</Text>
                  {selectedTemplate.suggested_features.map((feat, i) => (
                    <Text key={i} style={styles.bulletItem}>
                      • {feat}
                    </Text>
                  ))}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalStartBtn}
              onPress={() => selectedTemplate && handleStartProject(selectedTemplate)}
            >
              <Ionicons name="rocket-outline" size={16} color="#FFFFFF" />
              <Text style={styles.modalStartBtnText}>Start This Project Now</Text>
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 8,
    color: '#F1F5F9',
    fontSize: 12,
  },
  filterContainer: {
    paddingVertical: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterPillActive: {
    backgroundColor: '#38BDF820',
    borderColor: '#38BDF8',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  filterPillTextActive: {
    color: '#38BDF8',
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsCount: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modalTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  modalDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 12,
  },
  detailBlock: {
    marginBottom: 12,
  },
  blockTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  coursePill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  coursePillText: {
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: '700',
  },
  bulletItem: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 17,
  },
  modalStartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 14,
  },
  modalStartBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
