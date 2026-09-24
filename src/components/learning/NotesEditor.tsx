import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { noteRepository } from '../../repositories/NoteRepository';
import { Colors } from '../../theme/colors';

interface NotesEditorProps {
  courseId: string;
  moduleId: string;
  moduleTitle: string;
}

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

export const NotesEditor: React.FC<NotesEditorProps> = ({
  courseId,
  moduleId,
  moduleTitle,
}) => {
  const [noteText, setNoteText] = useState<string>('');
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedTextRef = useRef<string>('');

  useEffect(() => {
    let isMounted = true;
    const loadNote = async () => {
      try {
        setLoadingInitial(true);
        const existingNote = await noteRepository.getModuleNote(courseId, moduleId);
        if (isMounted) {
          const initialText = existingNote ? existingNote.note_text : '';
          setNoteText(initialText);
          lastSavedTextRef.current = initialText;
          setStatus('saved');
        }
      } catch (err) {
        console.error('Failed to load note from SQLite:', err);
      } finally {
        if (isMounted) {
          setLoadingInitial(false);
        }
      }
    };

    loadNote();

    return () => {
      isMounted = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [courseId, moduleId]);

  const saveNoteToDb = useCallback(
    async (textToSave: string) => {
      if (textToSave === lastSavedTextRef.current) {
        setStatus('saved');
        return;
      }

      try {
        setStatus('saving');
        await noteRepository.saveModuleNote(courseId, moduleId, textToSave);
        lastSavedTextRef.current = textToSave;
        setStatus('saved');
      } catch (err) {
        console.error('Failed to save note to SQLite:', err);
        setStatus('unsaved');
      }
    },
    [courseId, moduleId]
  );

  const handleChangeText = (text: string) => {
    setNoteText(text);
    if (text !== lastSavedTextRef.current) {
      setStatus('unsaved');
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      saveNoteToDb(text);
    }, 1500);
  };

  const handleManualSave = async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    await saveNoteToDb(noteText);
  };

  const handleClearNote = () => {
    if (!noteText.trim()) return;
    Alert.alert(
      'Clear Notes',
      'Are you sure you want to delete these notes for this module?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setNoteText('');
            await saveNoteToDb('');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <Ionicons name="journal-outline" size={18} color="#D97706" />
          <Text style={styles.sectionTitle}>MY MODULE NOTES</Text>
        </View>

        <View style={styles.statusBadge}>
          {status === 'saving' && (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color="#D97706" />
              <Text style={styles.statusTextSaving}>Saving...</Text>
            </View>
          )}
          {status === 'saved' && (
            <View style={styles.statusRow}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.statusTextSaved}>Saved</Text>
            </View>
          )}
          {status === 'unsaved' && (
            <View style={styles.statusRow}>
              <View style={styles.unsavedDot} />
              <Text style={styles.statusTextUnsaved}>Unsaved changes</Text>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.moduleSubtext}>
        Personal notes isolated to: <Text style={styles.bold}>{moduleTitle}</Text>
      </Text>

      {loadingInitial ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Reading notes from local database...</Text>
        </View>
      ) : (
        <View style={styles.editorCard}>
          <TextInput
            style={styles.textInput}
            value={noteText}
            onChangeText={handleChangeText}
            placeholder="Write your study notes, insights, code takeaways, or questions here..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <View style={styles.actionRow}>
            {noteText.trim().length > 0 && (
              <TouchableOpacity
                onPress={handleClearNote}
                style={styles.clearBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={15} color="#EF4444" />
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleManualSave}
              style={[
                styles.saveButton,
                status === 'saved' && styles.saveButtonSaved,
              ]}
              disabled={status === 'saving'}
              activeOpacity={0.8}
            >
              <Ionicons
                name={status === 'saved' ? 'checkmark' : 'save-outline'}
                size={16}
                color="#FFFFFF"
              />
              <Text style={styles.saveButtonText}>
                {status === 'saved' ? 'Saved to SQLite' : 'Save Notes'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.6,
  },
  statusBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusTextSaving: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  statusTextSaved: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  unsavedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  statusTextUnsaved: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  moduleSubtext: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
    color: '#334155',
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },
  editorCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
  },
  textInput: {
    minHeight: 110,
    maxHeight: 220,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    color: '#0F172A',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  saveButtonSaved: {
    backgroundColor: '#059669',
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
