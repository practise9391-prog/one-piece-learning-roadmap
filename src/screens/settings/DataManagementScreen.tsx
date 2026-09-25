import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { useSettingsViewModel } from '../../hooks/useSettingsViewModel';
import {
  SettingsSection,
  SettingsInfoRow,
  SettingsDangerRow,
} from '../../components/settings';
import { useTheme } from '../../theme/ThemeContext';
import { BackupValidationResult } from '../../models/Settings';

export const DataManagementScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const {
    dbStats,
    exportBackupJson,
    shareBackup,
    copyBackupToClipboard,
    validateBackupString,
    importBackupData,
    resetAllProgress,
    deleteAllLocalData,
  } = useSettingsViewModel();
  const { theme } = useTheme();

  // Export Modal state
  const [exportModalVisible, setExportModalVisible] = useState<boolean>(false);
  const [exportJson, setExportJson] = useState<string>('');
  const [exporting, setExporting] = useState<boolean>(false);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);

  // Import Modal state
  const [importModalVisible, setImportModalVisible] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [importing, setImporting] = useState<boolean>(false);

  // Danger Dialogs
  const [resetConfirmVisible, setResetConfirmVisible] = useState<boolean>(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState<boolean>(false);
  const [deleteStep, setDeleteStep] = useState<number>(1);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Handle Export flow
  const handleOpenExport = async () => {
    try {
      setExporting(true);
      const json = await exportBackupJson();
      setExportJson(json);
      setExportModalVisible(true);
    } catch (err: any) {
      Alert.alert('Export Failed', 'The backup could not be created. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleShareExport = async () => {
    await shareBackup();
  };

  const handleCopyExport = async () => {
    await copyBackupToClipboard();
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  // Handle Import flow
  const handlePasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setImportText(text);
        const res = validateBackupString(text);
        setValidationResult(res);
      } else {
        Alert.alert('Clipboard Empty', 'No text found on clipboard to paste.');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not read from clipboard.');
    }
  };

  const handleImportTextChange = (text: string) => {
    setImportText(text);
    if (text.trim().length > 10) {
      const res = validateBackupString(text);
      setValidationResult(res);
    } else {
      setValidationResult(null);
    }
  };

  const handleExecuteImport = async () => {
    if (!validationResult || !validationResult.valid || !validationResult.backup) {
      Alert.alert('Invalid Backup', 'Unable to import backup. The selected file is invalid or incompatible.');
      return;
    }

    if (importMode === 'replace') {
      Alert.alert(
        'Confirm Replace Mode',
        'Replacing local data will overwrite current learning progress with the backup. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Yes, Replace',
            style: 'destructive',
            onPress: () => performImport(validationResult.backup!, 'replace'),
          },
        ]
      );
    } else {
      await performImport(validationResult.backup, 'merge');
    }
  };

  const performImport = async (backup: any, mode: 'merge' | 'replace') => {
    try {
      setImporting(true);
      const result = await importBackupData(backup, mode);
      if (result.success) {
        setImportModalVisible(false);
        setImportText('');
        setValidationResult(null);
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Import Failed', result.message);
      }
    } catch (err: any) {
      Alert.alert('Import Failed', err?.message || 'Transaction error during import.');
    } finally {
      setImporting(false);
    }
  };

  // Handle Reset Progress
  const handleExecuteResetProgress = async () => {
    try {
      setActionLoading(true);
      const res = await resetAllProgress();
      setResetConfirmVisible(false);
      Alert.alert('Progress Reset', res.message);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not reset progress.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete All Data
  const handleExecuteDeleteAll = async () => {
    try {
      setActionLoading(true);
      const res = await deleteAllLocalData();
      setDeleteConfirmVisible(false);
      setDeleteStep(1);
      Alert.alert('Vault Reset', res.message);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not delete data.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AppShell title="DATA & STORAGE">
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation back bar */}
        <TouchableOpacity
          style={styles.backRow}
          onPress={() => navigate('Settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
          <Text style={[styles.backText, { color: theme.colors.primary }]}>
            Back to Settings
          </Text>
        </TouchableOpacity>

        {/* Section 1: Live Database Statistics */}
        <SettingsSection title="Vault Statistics (Local SQLite)" icon="server-outline">
          <SettingsInfoRow
            icon="school-outline"
            label="Courses"
            value={dbStats?.courses_count ?? 14}
          />
          <SettingsInfoRow
            icon="albums-outline"
            label="Modules"
            value={dbStats?.modules_count ?? 0}
          />
          <SettingsInfoRow
            icon="book-outline"
            label="Topics"
            value={dbStats?.topics_count ?? 0}
          />
          <SettingsInfoRow
            icon="create-outline"
            label="Notes Written"
            value={dbStats?.notes_count ?? 0}
          />
          <SettingsInfoRow
            icon="code-slash-outline"
            label="Practice Questions"
            value={dbStats?.practice_questions_count ?? 0}
          />
          <SettingsInfoRow
            icon="newspaper-outline"
            label="News Articles Cached"
            value={dbStats?.news_articles_count ?? 0}
          />
          <SettingsInfoRow
            icon="flame-outline"
            label="Learning Activity Records"
            value={dbStats?.learning_activities_count ?? 0}
          />
          <SettingsInfoRow
            icon="hardware-chip-outline"
            label="Estimated Database Storage"
            value={dbStats?.database_size_desc ?? 'Local SQLite storage'}
            isLast={true}
          />
        </SettingsSection>

        {/* Local Storage Statement */}
        <View style={styles.storageNote}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={[styles.storageNoteText, { color: theme.colors.textSecondary }]}>
            Local data is stored on this device. Everything functions completely offline.
          </Text>
        </View>

        {/* Section 2: Backup & Restore */}
        <SettingsSection title="Backup & Portability" icon="cloud-upload-outline">
          <View style={styles.backupActions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
              onPress={handleOpenExport}
              disabled={exporting}
              activeOpacity={0.8}
            >
              {exporting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="share-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.actionBtnText}>EXPORT MY DATA</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, borderWidth: 1.5 }]}
              onPress={() => setImportModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="download-outline" size={18} color={theme.colors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.actionBtnText, { color: theme.colors.primary }]}>IMPORT BACKUP</Text>
            </TouchableOpacity>
          </View>
        </SettingsSection>

        {/* Section 3: Reset & Danger Zone */}
        <SettingsSection title="Danger Zone" icon="warning-outline">
          <SettingsDangerRow
            icon="refresh-outline"
            title="Reset Learning Progress"
            subtitle="Resets topic/module completion, streak logs, and practice attempts. Notes and course outlines remain safe."
            actionText="RESET"
            onPress={() => setResetConfirmVisible(true)}
          />

          <SettingsDangerRow
            icon="trash-outline"
            title="Delete All Local Data"
            subtitle="Permanently wipes notes, progress, history, and preferences. Returns app to first-launch state."
            actionText="DELETE ALL"
            onPress={() => {
              setDeleteStep(1);
              setDeleteConfirmVisible(true);
            }}
            isLast={true}
          />
        </SettingsSection>
      </ScrollView>

      {/* EXPORT MODAL */}
      <Modal
        visible={exportModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="archive-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                  Backup Ready (JSON)
                </Text>
              </View>
              <TouchableOpacity onPress={() => setExportModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: theme.colors.textSecondary }]}>
              Contains your profile, learning progress, notes, bookmarks, daily goals, and achievements. No credentials or secrets are exported.
            </Text>

            <View style={[styles.jsonPreviewBox, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <ScrollView nestedScrollEnabled={true} style={{ maxHeight: 180 }}>
                <Text style={[styles.jsonCode, { color: theme.colors.textPrimary }]}>
                  {exportJson.substring(0, 1200)}...
                </Text>
              </ScrollView>
            </View>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: theme.colors.primary }]}
                onPress={handleShareExport}
                activeOpacity={0.8}
              >
                <Ionicons name="share-social-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.modalActionText}>Share / Save File</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: theme.colors.surfaceHover, borderColor: theme.colors.border, borderWidth: 1 }]}
                onPress={handleCopyExport}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={copiedExport ? 'checkmark-circle' : 'copy-outline'}
                  size={18}
                  color={copiedExport ? '#10B981' : theme.colors.textPrimary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.modalActionText, { color: theme.colors.textPrimary }]}>
                  {copiedExport ? 'Copied!' : 'Copy to Clipboard'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* IMPORT MODAL */}
      <Modal
        visible={importModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="cloud-download-outline" size={20} color={theme.colors.primary} style={{ marginRight: 8 }} />
                <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>
                  Import Local Backup
                </Text>
              </View>
              <TouchableOpacity onPress={() => setImportModalVisible(false)}>
                <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalDesc, { color: theme.colors.textSecondary }]}>
              Paste your exported JSON backup text or paste directly from clipboard.
            </Text>

            <View style={[styles.inputBoxContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.importTextInput, { color: theme.colors.textPrimary }]}
                placeholder="Paste backup JSON here..."
                placeholderTextColor={theme.colors.textTertiary}
                multiline={true}
                value={importText}
                onChangeText={handleImportTextChange}
              />
            </View>

            <TouchableOpacity
              style={styles.pasteClipboardBtn}
              onPress={handlePasteFromClipboard}
              activeOpacity={0.7}
            >
              <Ionicons name="clipboard-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.pasteClipboardText, { color: theme.colors.primary }]}>
                Paste from Clipboard
              </Text>
            </TouchableOpacity>

            {/* Validation Feedback */}
            {validationResult && (
              <View
                style={[
                  styles.validationBox,
                  {
                    backgroundColor: validationResult.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderColor: validationResult.valid ? '#10B981' : '#EF4444',
                  },
                ]}
              >
                <Ionicons
                  name={validationResult.valid ? 'checkmark-circle' : 'alert-circle'}
                  size={18}
                  color={validationResult.valid ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={[
                    styles.validationText,
                    { color: validationResult.valid ? '#10B981' : '#EF4444' },
                  ]}
                >
                  {validationResult.valid
                    ? `Valid v${validationResult.backup?.metadata.backup_version} backup (${validationResult.stats?.notes_count} notes, ${validationResult.stats?.completed_topics} completed topics)`
                    : validationResult.error}
                </Text>
              </View>
            )}

            {/* Mode selection */}
            {validationResult?.valid && (
              <View style={styles.modeRow}>
                <TouchableOpacity
                  style={[
                    styles.modeChoice,
                    importMode === 'merge' && { backgroundColor: `${theme.colors.primary}18`, borderColor: theme.colors.primary },
                  ]}
                  onPress={() => setImportMode('merge')}
                >
                  <Text style={[styles.modeTitle, { color: theme.colors.textPrimary }]}>Merge (Default)</Text>
                  <Text style={[styles.modeSub, { color: theme.colors.textSecondary }]}>Add to existing progress</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modeChoice,
                    importMode === 'replace' && { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: '#EF4444' },
                  ]}
                  onPress={() => setImportMode('replace')}
                >
                  <Text style={[styles.modeTitle, { color: importMode === 'replace' ? '#EF4444' : theme.colors.textPrimary }]}>Replace</Text>
                  <Text style={[styles.modeSub, { color: theme.colors.textSecondary }]}>Overwrite all local data</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.executeImportBtn,
                { backgroundColor: validationResult?.valid ? theme.colors.primary : theme.colors.divider },
              ]}
              disabled={!validationResult?.valid || importing}
              onPress={handleExecuteImport}
              activeOpacity={0.8}
            >
              {importing ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.executeImportText}>CONFIRM & IMPORT</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* RESET PROGRESS CONFIRMATION MODAL */}
      <Modal
        visible={resetConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setResetConfirmVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={styles.dangerHeader}>
              <Ionicons name="refresh-circle" size={36} color="#F59E0B" />
              <Text style={[styles.dangerTitle, { color: theme.colors.textPrimary }]}>
                Reset Learning Progress?
              </Text>
            </View>

            <Text style={[styles.dangerMessage, { color: theme.colors.textSecondary }]}>
              This will reset:
            </Text>
            <View style={styles.bulletList}>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>• Topic completion</Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>• Module completion</Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>• Course progress percentages</Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>• Practice question attempts</Text>
              <Text style={[styles.bulletItem, { color: theme.colors.textSecondary }]}>• Learning streak & daily activity logs</Text>
            </View>

            <View style={styles.safeHighlight}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.safeHighlightText}>
                Your course structures, notes, and custom settings will remain safe.
              </Text>
            </View>

            <View style={styles.dangerBtnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
                onPress={() => setResetConfirmVisible(false)}
              >
                <Text style={[styles.cancelBtnText, { color: theme.colors.textPrimary }]}>CANCEL</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: '#F59E0B' }]}
                onPress={handleExecuteResetProgress}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.confirmBtnText}>RESET PROGRESS</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DELETE ALL DATA DOUBLE-CONFIRMATION MODAL */}
      <Modal
        visible={deleteConfirmVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteConfirmVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.colors.surface, borderColor: '#EF4444' }]}>
            <View style={styles.dangerHeader}>
              <Ionicons name="alert-circle" size={42} color="#EF4444" />
              <Text style={[styles.dangerTitle, { color: '#EF4444' }]}>
                {deleteStep === 1 ? 'DELETE ALL DATA?' : 'FINAL WARNING'}
              </Text>
            </View>

            {deleteStep === 1 ? (
              <>
                <Text style={[styles.dangerMessage, { color: theme.colors.textSecondary }]}>
                  This permanently removes local learning data, including notes, progress, practice history, preferences, and achievements.
                </Text>
                <Text style={[styles.dangerMessage, { color: '#EF4444', fontWeight: '700', marginTop: 8 }]}>
                  This action cannot be undone.
                </Text>

                <View style={styles.dangerBtnRow}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
                    onPress={() => setDeleteConfirmVisible(false)}
                  >
                    <Text style={[styles.cancelBtnText, { color: theme.colors.textPrimary }]}>CANCEL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: '#EF4444' }]}
                    onPress={() => setDeleteStep(2)}
                  >
                    <Text style={styles.confirmBtnText}>CONTINUE...</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.dangerMessage, { color: theme.colors.textSecondary }]}>
                  Are you absolutely certain? All your written notes and achievements will be destroyed. The application will return to its clean first-launch state.
                </Text>

                <View style={styles.dangerBtnRow}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: theme.colors.border }]}
                    onPress={() => setDeleteConfirmVisible(false)}
                  >
                    <Text style={[styles.cancelBtnText, { color: theme.colors.textPrimary }]}>CANCEL</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: '#B71C1C' }]}
                    onPress={handleExecuteDeleteAll}
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.confirmBtnText}>DELETE EVERYTHING</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 6,
  },
  storageNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    marginBottom: 18,
  },
  storageNoteText: {
    fontSize: 11,
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  backupActions: {
    padding: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
    marginBottom: 10,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  jsonPreviewBox: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 14,
  },
  jsonCode: {
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  modalBtnRow: {
    flexDirection: 'column',
    gap: 8,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 10,
  },
  modalActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputBoxContainer: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    height: 120,
    marginBottom: 8,
  },
  importTextInput: {
    fontSize: 12,
    fontFamily: 'monospace',
    height: '100%',
    textAlignVertical: 'top',
  },
  pasteClipboardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 4,
  },
  pasteClipboardText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  validationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  validationText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  modeChoice: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  modeSub: {
    fontSize: 10,
    marginTop: 2,
  },
  executeImportBtn: {
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  executeImportText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  dangerHeader: {
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  dangerMessage: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  bulletList: {
    marginVertical: 10,
    paddingLeft: 12,
  },
  bulletItem: {
    fontSize: 12,
    lineHeight: 20,
  },
  safeHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 16,
  },
  safeHighlightText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
    flex: 1,
  },
  dangerBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 1.3,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
