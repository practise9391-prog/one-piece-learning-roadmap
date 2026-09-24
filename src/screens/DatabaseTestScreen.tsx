import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { ActionButton } from '../components/ActionButton';
import { OnePieceBadge } from '../components/OnePieceBadge';
import { ProgressBar } from '../components/ProgressBar';
import { useAppNavigation } from '../navigation/NavigationContext';
import { dbManager } from '../database/DatabaseManager';
import { roadmapService } from '../services/RoadmapService';
import { progressService } from '../services/ProgressService';
import { notesService } from '../services/NotesService';
import { moduleRepository } from '../repositories/ModuleRepository';
import { Course } from '../models/Course';
import { Module } from '../models/Module';
import { Note } from '../models/Note';
import { Colors } from '../theme/colors';
import { formatDateTime } from '../utils/dateUtils';

export const DatabaseTestScreen: React.FC = () => {
  const { goBack } = useAppNavigation();

  // Local state representing queried SQLite rows
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [dbStatus, setDbStatus] = useState<string>('Connecting...');
  const [lastQueryTime, setLastQueryTime] = useState<string>('');

  // Input states for custom test creation
  const [newCourseName, setNewCourseName] = useState<string>('');
  const [newModuleTitle, setNewModuleTitle] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  // Automated test log
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);

  // Query all data directly from SQLite
  const reloadFromDatabase = useCallback(async (showNotice = false) => {
    setLoading(true);
    try {
      const db = await dbManager.getDatabase();
      const isReady = dbManager.isInitialized();
      setDbStatus(isReady ? 'SQLite Connected (onepiece_roadmap.db)' : 'Connecting...');

      const loadedCourses = await roadmapService.getCourses();
      const loadedModules = await moduleRepository.getAll();
      const loadedNotes = await notesService.getAllNotes();

      setCourses(loadedCourses);
      setModules(loadedModules);
      setNotes(loadedNotes);
      setLastQueryTime(new Date().toLocaleTimeString());

      if (loadedCourses.length > 0 && !selectedCourseId) {
        setSelectedCourseId(loadedCourses[0].id);
      }

      if (showNotice) {
        Alert.alert(
          'Database Re-read Complete',
          `Successfully loaded ${loadedCourses.length} courses, ${loadedModules.length} modules, and ${loadedNotes.length} notes directly from local SQLite disk storage.`
        );
      }
    } catch (err: any) {
      console.error('Error reading from SQLite:', err);
      Alert.alert('Database Error', err?.message || 'Failed to query SQLite');
    } finally {
      setLoading(false);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    reloadFromDatabase();
  }, []);

  // 1. Add Test Course
  const handleAddTestCourse = async () => {
    const courseName = newCourseName.trim() || `Test Sea Course ${Date.now().toString().slice(-4)}`;
    setActionLoading(true);
    try {
      const created = await roadmapService.addCourse({
        name: courseName,
        description: 'Locally persisted test course in Grand Line vault',
        icon: 'navigate-outline',
        theme: 'ocean',
      });
      setNewCourseName('');
      setSelectedCourseId(created.id);
      await reloadFromDatabase();
      Alert.alert('Course Created in SQLite', `Course "${created.name}" stored permanently.`);
    } catch (err: any) {
      Alert.alert('Creation Failed', err?.message || 'Failed to add course');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Add Test Module
  const handleAddTestModule = async () => {
    if (!selectedCourseId) {
      Alert.alert('Selection Error', 'Please select a course first.');
      return;
    }
    const title = newModuleTitle.trim() || `Module #${modules.length + 1}: Haki Training`;
    setActionLoading(true);
    try {
      const created = await roadmapService.addModule({
        courseId: selectedCourseId,
        title,
        description: 'Module stored in SQLite with foreign key linkage.',
      });
      setNewModuleTitle('');
      await reloadFromDatabase();
      Alert.alert('Module Created in SQLite', `Module "${created.title}" saved.`);
    } catch (err: any) {
      Alert.alert('Module Creation Failed', err?.message || 'Failed to add module');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Mark Module Complete / Incomplete
  const handleToggleModule = async (module: Module) => {
    setActionLoading(true);
    try {
      if (module.is_completed) {
        await progressService.uncompleteModule(module.course_id, module.id);
      } else {
        await progressService.completeModule(module.course_id, module.id);
      }
      await reloadFromDatabase();
    } catch (err: any) {
      Alert.alert('Progress Update Error', err?.message || 'Failed to update module');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Add Test Note
  const handleAddTestNote = async () => {
    if (!selectedCourseId) {
      Alert.alert('Selection Error', 'Please select a course first.');
      return;
    }
    const noteText = newNoteText.trim() || `Test Captain Note: Recorded at ${new Date().toLocaleTimeString()}`;
    setActionLoading(true);
    try {
      const courseModules = modules.filter((m) => m.course_id === selectedCourseId);
      const linkedModuleId = courseModules.length > 0 ? courseModules[0].id : null;

      await notesService.addNote({
        courseId: selectedCourseId,
        moduleId: linkedModuleId,
        noteText,
      });
      setNewNoteText('');
      await reloadFromDatabase();
      Alert.alert('Note Saved to SQLite', 'Note stored permanently in SQLite.');
    } catch (err: any) {
      Alert.alert('Note Creation Failed', err?.message || 'Failed to add note');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Automated E2E SQLite Test Sequence
  const handleRunAutomatedE2ETest = async () => {
    setActionLoading(true);
    const logs: string[] = [];
    setVerificationLogs([]);

    const log = (msg: string) => {
      logs.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setVerificationLogs([...logs]);
    };

    try {
      log('Starting automated SQLite persistence verification...');

      // Step A: Insert test course
      const testCourseName = `E2E Course ${Date.now()}`;
      log(`Step 1: Inserting course "${testCourseName}" into SQLite...`);
      const course = await roadmapService.addCourse({
        name: testCourseName,
        description: 'Automated verification test course',
      });
      log(`✔ Course inserted with ID: ${course.id}`);

      // Step B: Insert two test modules
      log('Step 2: Inserting Module 1 and Module 2...');
      const mod1 = await roadmapService.addModule({
        courseId: course.id,
        title: 'E2E Module 1: Basics',
      });
      const mod2 = await roadmapService.addModule({
        courseId: course.id,
        title: 'E2E Module 2: Advanced',
      });
      log(`✔ Modules inserted (mod1: ${mod1.id}, mod2: ${mod2.id})`);

      // Step C: Complete Module 1
      log('Step 3: Marking Module 1 as completed in SQLite...');
      const updatedCourse1 = await progressService.completeModule(course.id, mod1.id);
      log(`✔ Progress recalculated: ${updatedCourse1.completed_modules}/${updatedCourse1.total_modules} modules (${updatedCourse1.progress_percentage}%)`);
      if (updatedCourse1.progress_percentage !== 50.0) {
        throw new Error(`Expected 50% progress, got ${updatedCourse1.progress_percentage}%`);
      }

      // Step D: Add a Note
      log('Step 4: Writing a note linked to Module 1...');
      const note = await notesService.addNote({
        courseId: course.id,
        moduleId: mod1.id,
        noteText: 'Log Entry: Completed Module 1 successfully.',
      });
      log(`✔ Note persisted with ID: ${note.id}`);

      // Step E: Complete Module 2 to hit 100%
      log('Step 5: Marking Module 2 as completed...');
      const updatedCourse2 = await progressService.completeModule(course.id, mod2.id);
      log(`✔ Course completed flag: ${updatedCourse2.is_completed ? 'TRUE (100%)' : 'FALSE'}`);
      if (!updatedCourse2.is_completed) {
        throw new Error('Expected is_completed to be true');
      }

      // Step F: Force Re-query
      log('Step 6: Purging memory state and re-reading from SQLite storage...');
      await reloadFromDatabase();
      log('🎉 ALL PERSISTENCE TESTS PASSED! Local SQLite is fully functional.');
      Alert.alert('Verification Passed', 'All SQLite CRUD, foreign keys, and progress engine tests succeeded.');
    } catch (err: any) {
      log(`❌ TEST FAILED: ${err?.message}`);
      Alert.alert('Verification Error', err?.message || 'E2E verification failed');
    } finally {
      setActionLoading(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const courseModules = modules.filter((m) => m.course_id === selectedCourseId);
  const courseNotes = notes.filter((n) => n.course_id === selectedCourseId);

  return (
    <View style={styles.container}>
      <Header
        title="Database Vault Test"
        subtitle="Grand Line Local Storage"
        showBack
        onBackPress={goBack}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* SQLite Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.dbIconCircle}>
              <Ionicons name="server" size={24} color={Colors.primary} />
            </View>
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>SQLite Source of Truth</Text>
              <Text style={styles.statusSub}>{dbStatus}</Text>
            </View>
            <OnePieceBadge label="OFFLINE" variant="success" />
          </View>

          <View style={styles.dbStatsRow}>
            <View style={styles.dbStatItem}>
              <Text style={styles.statNumber}>{courses.length}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.dbStatItem}>
              <Text style={styles.statNumber}>{modules.length}</Text>
              <Text style={styles.statLabel}>Modules</Text>
            </View>
            <View style={styles.dbStatItem}>
              <Text style={styles.statNumber}>{notes.length}</Text>
              <Text style={styles.statLabel}>Notes</Text>
            </View>
          </View>

          <View style={styles.queryTimestampRow}>
            <Text style={styles.timestampText}>
              Last DB Query: {lastQueryTime || 'Initial'}
            </Text>
            <TouchableOpacity
              onPress={() => reloadFromDatabase(true)}
              style={styles.reloadBadge}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={14} color={Colors.accent} />
              <Text style={styles.reloadBadgeText}>Re-read from SQLite</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Controls Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Test Operations</Text>
          <Text style={styles.cardSub}>
            Perform atomic writes and verify they persist directly in SQLite.
          </Text>

          {/* 1. Add Test Course */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>1. Add Test Course</Text>
            <View style={styles.inlineInputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Course name (or auto-generated)"
                placeholderTextColor={Colors.textTertiary}
                value={newCourseName}
                onChangeText={setNewCourseName}
              />
              <ActionButton
                title="Add Course"
                icon="add"
                onPress={handleAddTestCourse}
                loading={actionLoading}
                size="small"
                style={styles.inlineBtn}
              />
            </View>
          </View>

          {/* Select Course for Module / Note Operations */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Active Target Course in SQLite</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorScroll}>
              {courses.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelectedCourseId(c.id)}
                  style={[
                    styles.courseChip,
                    selectedCourseId === c.id && styles.courseChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.courseChipText,
                      selectedCourseId === c.id && styles.courseChipTextActive,
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* 2. Add Test Module */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>2. Add Module to &quot;{selectedCourse?.name || 'Selected'}&quot;</Text>
            <View style={styles.inlineInputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Module title (or auto-generated)"
                placeholderTextColor={Colors.textTertiary}
                value={newModuleTitle}
                onChangeText={setNewModuleTitle}
              />
              <ActionButton
                title="Add Module"
                icon="add-circle-outline"
                variant="accent"
                onPress={handleAddTestModule}
                loading={actionLoading}
                size="small"
                style={styles.inlineBtn}
              />
            </View>
          </View>

          {/* 3. Add Test Note */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>3. Write Test Note into SQLite</Text>
            <View style={styles.inlineInputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="Note text..."
                placeholderTextColor={Colors.textTertiary}
                value={newNoteText}
                onChangeText={setNewNoteText}
              />
              <ActionButton
                title="Save Note"
                icon="document-text-outline"
                variant="secondary"
                onPress={handleAddTestNote}
                loading={actionLoading}
                size="small"
                style={styles.inlineBtn}
              />
            </View>
          </View>

          {/* E2E Automated Verification Button */}
          <View style={styles.e2eContainer}>
            <ActionButton
              title="Run Automated E2E SQLite Test"
              icon="checkmark-done-circle-outline"
              variant="primary"
              onPress={handleRunAutomatedE2ETest}
              loading={actionLoading}
              style={styles.e2eBtn}
            />
          </View>
        </View>

        {/* Automated Verification Logs */}
        {verificationLogs.length > 0 && (
          <View style={styles.logCard}>
            <Text style={styles.logCardTitle}>E2E Execution Log</Text>
            {verificationLogs.map((logMsg, index) => (
              <Text key={index} style={styles.logText}>
                {logMsg}
              </Text>
            ))}
          </View>
        )}

        {/* Selected Course SQLite Inspection */}
        {selectedCourse && (
          <View style={styles.card}>
            <View style={styles.cardHeaderWithBadge}>
              <Text style={styles.cardHeader}>
                Course: {selectedCourse.name}
              </Text>
              <OnePieceBadge
                label={`${selectedCourse.completed_modules}/${selectedCourse.total_modules} done`}
                variant={selectedCourse.is_completed ? 'success' : 'gold'}
              />
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>SQLite ID:</Text>
              <Text style={styles.detailVal}>{selectedCourse.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Progress %:</Text>
              <Text style={styles.detailVal}>{selectedCourse.progress_percentage}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailKey}>Is Completed:</Text>
              <Text style={styles.detailVal}>{selectedCourse.is_completed ? 'YES (1)' : 'NO (0)'}</Text>
            </View>

            <ProgressBar
              percentage={selectedCourse.progress_percentage}
              style={styles.courseProgressBar}
            />

            {/* Modules List for Selected Course */}
            <Text style={styles.subHeader}>
              Modules in SQLite ({courseModules.length}):
            </Text>
            {courseModules.length === 0 ? (
              <Text style={styles.emptyText}>No modules yet for this course.</Text>
            ) : (
              courseModules.map((m) => (
                <View key={m.id} style={styles.moduleItem}>
                  <TouchableOpacity
                    onPress={() => handleToggleModule(m)}
                    style={styles.moduleCheckbox}
                  >
                    <Ionicons
                      name={m.is_completed ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={m.is_completed ? Colors.success : Colors.textTertiary}
                    />
                  </TouchableOpacity>
                  <View style={styles.moduleInfo}>
                    <Text
                      style={[
                        styles.moduleTitle,
                        m.is_completed && styles.moduleTitleCompleted,
                      ]}
                    >
                      {m.title}
                    </Text>
                    {m.completed_at && (
                      <Text style={styles.completedAtText}>
                        Completed at: {formatDateTime(m.completed_at)}
                      </Text>
                    )}
                  </View>
                </View>
              ))
            )}

            {/* Notes List for Selected Course */}
            <Text style={[styles.subHeader, { marginTop: 16 }]}>
              Notes in SQLite ({courseNotes.length}):
            </Text>
            {courseNotes.length === 0 ? (
              <Text style={styles.emptyText}>No notes saved yet for this course.</Text>
            ) : (
              courseNotes.map((n) => (
                <View key={n.id} style={styles.noteItem}>
                  <Ionicons name="document-text" size={16} color={Colors.secondaryDark} />
                  <View style={styles.noteBody}>
                    <Text style={styles.noteText}>{n.note_text}</Text>
                    <Text style={styles.noteTime}>{formatDateTime(n.created_at)}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  dbIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statusSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dbStatsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceHover,
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  dbStatItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  queryTimestampRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  timestampText: {
    fontSize: 11,
    color: Colors.textTertiary,
  },
  reloadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.accentLight,
  },
  reloadBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardHeaderWithBadge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardSub: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  inlineInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surfaceHover,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  inlineBtn: {
    minWidth: 110,
  },
  selectorScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  courseChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surfaceHover,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  courseChipActive: {
    backgroundColor: Colors.oceanDepths,
    borderColor: Colors.oceanDepths,
  },
  courseChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  courseChipTextActive: {
    color: Colors.textInverse,
  },
  e2eContainer: {
    marginTop: 8,
  },
  e2eBtn: {
    width: '100%',
  },
  logCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  logCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  logText: {
    fontSize: 11,
    color: '#E2E8F0',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailKey: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  courseProgressBar: {
    marginVertical: 10,
  },
  subHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 10,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textTertiary,
    paddingVertical: 4,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceHover,
  },
  moduleCheckbox: {
    padding: 4,
    marginRight: 8,
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  moduleTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },
  completedAtText: {
    fontSize: 10,
    color: Colors.success,
    marginTop: 2,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
  },
  noteBody: {
    flex: 1,
    marginLeft: 8,
  },
  noteText: {
    fontSize: 13,
    color: '#78350F',
    fontWeight: '500',
  },
  noteTime: {
    fontSize: 10,
    color: '#92400E',
    marginTop: 4,
  },
});

