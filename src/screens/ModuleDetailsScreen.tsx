import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { OnePieceBadge } from '../components/OnePieceBadge';
import { ProgressBar } from '../components/ProgressBar';
import { ActionButton } from '../components/ActionButton';
import { useAppNavigation } from '../navigation/NavigationContext';
import { roadmapService } from '../services/RoadmapService';
import { progressService } from '../services/ProgressService';
import { notesService } from '../services/NotesService';
import { Module } from '../models/Module';
import { Topic } from '../models/Topic';
import { Note } from '../models/Note';
import { Colors } from '../theme/colors';
import { formatDateTime } from '../utils/dateUtils';

export const ModuleDetailsScreen: React.FC = () => {
  const { params, goBack } = useAppNavigation();
  const courseId = params?.courseId || 'python';
  const moduleId = params?.moduleId || '';

  const [module, setModule] = useState<Module | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [newNoteText, setNewNoteText] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      const [moduleData, moduleNotes] = await Promise.all([
        roadmapService.getModuleWithTopics(moduleId),
        notesService.getNotesForModule(moduleId),
      ]);
      setModule(moduleData.module);
      setTopics(moduleData.topics);
      setNotes(moduleNotes);
    } catch (err) {
      console.error('Failed to load module details from SQLite:', err);
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleTopic = async (topic: Topic) => {
    try {
      const result = await progressService.toggleTopicCompletion(
        courseId,
        moduleId,
        topic.id
      );
      setModule(result.module);
      setTopics((prev) =>
        prev.map((t) => (t.id === topic.id ? result.topic : t))
      );
    } catch (err) {
      console.error('Failed to toggle topic completion:', err);
    }
  };

  const handleToggleModuleComplete = async () => {
    if (!module) return;
    setActionLoading(true);
    try {
      if (module.is_completed) {
        await progressService.uncompleteModule(courseId, module.id);
      } else {
        await progressService.completeModule(courseId, module.id);
      }
      await loadData();
    } catch (err) {
      console.error('Failed to update module completion:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteText.trim()) return;
    setActionLoading(true);
    try {
      await notesService.addNote({
        courseId,
        moduleId,
        noteText: newNoteText.trim(),
      });
      setNewNoteText('');
      const updatedNotes = await notesService.getNotesForModule(moduleId);
      setNotes(updatedNotes);
      Alert.alert('Note Saved', 'Your note has been saved to the local SQLite database.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to save note');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Module Details" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading Topics from SQLite...</Text>
        </View>
      </View>
    );
  }

  if (!module) {
    return (
      <View style={styles.container}>
        <Header title="Module Details" showBack onBackPress={goBack} />
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Module not found in local database.</Text>
        </View>
      </View>
    );
  }

  const completedTopicsCount = topics.filter((t) => t.is_completed).length;
  const progressPercent =
    topics.length > 0
      ? Math.round((completedTopicsCount / topics.length) * 100)
      : module.is_completed
      ? 100
      : 0;

  return (
    <View style={styles.container}>
      <Header
        title={module.title}
        subtitle={`Module ${module.order}`}
        showBack
        onBackPress={goBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Module Header Card */}
        <View style={styles.moduleHeaderCard}>
          <View style={styles.badgeRow}>
            <OnePieceBadge label={`Module #${module.order}`} variant="gold" />
            <OnePieceBadge
              label={module.is_completed ? 'Completed' : `${completedTopicsCount}/${topics.length} Topics Done`}
              variant={module.is_completed ? 'success' : 'ocean'}
            />
          </View>

          <Text style={styles.moduleTitle}>{module.title}</Text>
          {module.description ? (
            <Text style={styles.moduleDescription}>{module.description}</Text>
          ) : null}

          {topics.length > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressStatsRow}>
                <Text style={styles.progressText}>
                  {completedTopicsCount} of {topics.length} Topics Mastered
                </Text>
                <Text style={styles.progressPercentText}>{progressPercent}%</Text>
              </View>
              <ProgressBar
                percentage={progressPercent}
                height={8}
                color={module.is_completed ? Colors.success : Colors.accent}
              />
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.completeModuleBtn,
              module.is_completed && styles.completeModuleBtnActive,
            ]}
            onPress={handleToggleModuleComplete}
            disabled={actionLoading}
            activeOpacity={0.8}
          >
            <Ionicons
              name={module.is_completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={20}
              color={module.is_completed ? '#FFFFFF' : Colors.primary}
            />
            <Text
              style={[
                styles.completeModuleBtnText,
                module.is_completed && styles.completeModuleBtnTextActive,
              ]}
            >
              {module.is_completed ? 'Mark as Incomplete' : 'Mark Entire Module Complete'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Topics Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Topics in this Module</Text>
          <Text style={styles.sectionBadge}>{topics.length} topics</Text>
        </View>

        {topics.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No individual topics listed for this module.</Text>
          </View>
        ) : (
          topics.map((t, index) => {
            const isDone = t.is_completed;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => handleToggleTopic(t)}
                activeOpacity={0.8}
                style={[styles.topicItem, isDone && styles.topicItemCompleted]}
              >
                <View style={styles.checkboxContainer}>
                  <Ionicons
                    name={isDone ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isDone ? Colors.success : Colors.textTertiary}
                  />
                </View>
                <View style={styles.topicTextContainer}>
                  <View style={styles.topicTopRow}>
                    <Text style={styles.topicIndexTag}>Topic {index + 1}</Text>
                    {isDone && t.completed_at && (
                      <Text style={styles.topicDoneTag}>Mastered</Text>
                    )}
                  </View>
                  <Text
                    style={[styles.topicTitle, isDone && styles.topicTitleCompleted]}
                  >
                    {t.title}
                  </Text>
                  {t.description ? (
                    <Text style={styles.topicDescription}>{t.description}</Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Notes Area Placeholder & Input */}
        <View style={styles.notesSection}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.notesHeaderLeft}>
              <Ionicons name="journal-outline" size={20} color={Colors.primary} />
              <Text style={[styles.sectionTitle, { marginLeft: 8 }]}>Module Notes</Text>
            </View>
            <Text style={styles.sectionBadge}>{notes.length} saved</Text>
          </View>

          {/* Add Note Input */}
          <View style={styles.addNoteCard}>
            <TextInput
              style={styles.noteInput}
              placeholder="Jot down notes or key takeaways for this module..."
              placeholderTextColor={Colors.textTertiary}
              value={newNoteText}
              onChangeText={setNewNoteText}
              multiline
              numberOfLines={3}
            />
            <ActionButton
              title="Save Note to SQLite"
              icon="save-outline"
              size="small"
              onPress={handleAddNote}
              loading={actionLoading}
              disabled={!newNoteText.trim()}
              style={styles.saveNoteBtn}
            />
          </View>

          {/* Notes List */}
          {notes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No notes written yet for this module.</Text>
            </View>
          ) : (
            notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <Ionicons name="document-text" size={18} color={Colors.secondaryDark} />
                <View style={styles.noteContent}>
                  <Text style={styles.noteText}>{note.note_text}</Text>
                  <Text style={styles.noteTime}>{formatDateTime(note.created_at)}</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  moduleHeaderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 26,
  },
  moduleDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  progressContainer: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceHover,
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  completeModuleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginTop: 16,
    gap: 8,
  },
  completeModuleBtnActive: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  completeModuleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  completeModuleBtnTextActive: {
    color: '#FFFFFF',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sectionBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  topicItemCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 1,
  },
  topicTextContainer: {
    flex: 1,
  },
  topicTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  topicIndexTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  topicDoneTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
    textTransform: 'uppercase',
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  topicTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  topicDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  notesSection: {
    marginTop: 24,
  },
  notesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addNoteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  noteInput: {
    backgroundColor: Colors.surfaceHover,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 70,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveNoteBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 12,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noteContent: {
    flex: 1,
    marginLeft: 10,
  },
  noteText: {
    fontSize: 13,
    color: '#78350F',
    fontWeight: '500',
    lineHeight: 18,
  },
  noteTime: {
    fontSize: 10,
    color: '#92400E',
    marginTop: 4,
  },
  emptyCard: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.textTertiary,
  },
});
