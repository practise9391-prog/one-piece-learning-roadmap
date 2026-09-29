import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { aiService } from '../../services/ai/AIService';
import { aiRepository } from '../../repositories/AIRepository';
import { noteRepository } from '../../repositories/NoteRepository';
import { generateId } from '../../utils/idGenerator';
import { MessageBubble } from '../../components/ai/MessageBubble';
import { QuickPromptsBar } from '../../components/ai/QuickPromptsBar';
import {
  AIConversation,
  AIMessage,
  AITutorContext,
  ExplanationLevel,
} from '../../models/AIAssistant';

export const AIChatScreen: React.FC = () => {
  const { params, goBack, navigate } = useAppNavigation();
  const conversationId = params?.conversationId;
  const contextParam: AITutorContext | undefined = params?.context;

  const [conversation, setConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>('BEGINNER');
  const [levelModalVisible, setLevelModalVisible] = useState<boolean>(false);

  // Note saving state
  const [noteModalVisible, setNoteModalVisible] = useState<boolean>(false);
  const [noteContentToSave, setNoteContentToSave] = useState<string>('');

  const flatListRef = useRef<FlatList>(null);

  const loadConversationData = useCallback(async () => {
    if (!conversationId) return;
    try {
      const [conv, msgList] = await Promise.all([
        aiRepository.getConversationById(conversationId),
        aiRepository.getMessages(conversationId, 60),
      ]);
      setConversation(conv);
      if (conv) {
        setExplanationLevel(conv.explanation_level);
      }
      setMessages(msgList);
    } catch (err) {
      console.warn('Failed to load conversation:', err);
    }
  }, [conversationId]);

  useEffect(() => {
    loadConversationData();
  }, [loadConversationData]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !conversationId || isGenerating) return;

    setInputText('');
    setIsGenerating(true);

    try {
      const result = await aiService.sendMessage({
        conversationId,
        content: text,
        context: contextParam,
        explanationLevel,
      });

      setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch {
      Alert.alert('Message Error', 'Unable to receive response from AI Tutor.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleSaveToNotes = (content: string) => {
    setNoteContentToSave(content);
    setNoteModalVisible(true);
  };

  const confirmSaveNote = async () => {
    if (!noteContentToSave.trim()) return;
    try {
      await noteRepository.create({
        id: generateId('note'),
        course_id: contextParam?.course_id || conversation?.course_id || 'python',
        module_id: contextParam?.module_id || conversation?.module_id || undefined,
        note_text: `[AI Note: ${conversation?.title || 'Tutor'}]\n\n${noteContentToSave}`,
      });
      setNoteModalVisible(false);
      setNoteContentToSave('');
      Alert.alert('Saved to Notes', 'Note successfully stored in your course vault.');
    } catch {
      Alert.alert('Error', 'Failed to save note.');
    }
  };

  const handleRunCode = (code: string) => {
    // Navigate to coding challenge screen or practice
    navigate('CodingChallenge', {
      taskId: 'task_py_reverse_string',
      starterCode: code,
    });
  };

  const handleClearChat = () => {
    Alert.alert(
      'Clear Conversation',
      'Remove all messages in this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            if (conversationId) {
              await aiRepository.deleteConversation(conversationId);
              goBack();
            }
          },
        },
      ]
    );
  };

  const levels: { key: ExplanationLevel; label: string; desc: string }[] = [
    { key: 'CHILD_FRIENDLY', label: 'Child Friendly', desc: 'Simple analogies, story-like explanations' },
    { key: 'BEGINNER', label: 'Beginner', desc: 'Plain language, fundamental concepts & examples' },
    { key: 'INTERMEDIATE', label: 'Intermediate', desc: 'Technical depth with code & architecture' },
    { key: 'ADVANCED', label: 'Advanced', desc: 'Algorithmic rigor, internals & edge-case math' },
    { key: 'INTERVIEW', label: 'Interview Ready', desc: 'STAR structure, complexity analysis, trade-offs' },
  ];

  return (
    <AppShell title={conversation?.title || 'AI Tutor'}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Context & Settings Ribbon */}
        <View style={styles.topRibbon}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={goBack}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={20} color="#94A3B8" />
          </TouchableOpacity>

          <View style={styles.ribbonCenter}>
            {contextParam?.topic_title && (
              <View style={styles.contextBadge}>
                <Ionicons name="bookmark" size={11} color="#0284C7" />
                <Text style={styles.contextBadgeText} numberOfLines={1}>
                  {contextParam.topic_title}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.ribbonActions}>
            <TouchableOpacity
              style={styles.levelSelectorBtn}
              onPress={() => setLevelModalVisible(true)}
            >
              <Text style={styles.levelSelectorText}>{explanationLevel}</Text>
              <Ionicons name="chevron-down" size={12} color="#F59E0B" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearBtn} onPress={handleClearChat}>
              <Ionicons name="ellipsis-vertical" size={18} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Message List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              onSaveToNotes={handleSaveToNotes}
              onQuickAction={handleQuickAction}
              onRunCode={handleRunCode}
            />
          )}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="sparkles" size={40} color="#0284C7" />
              <Text style={styles.emptyTitle}>AI Tutor Ready</Text>
              <Text style={styles.emptyDesc}>
                Ask any question about programming, algorithms, debugging, or concepts.
              </Text>
            </View>
          }
        />

        {/* Loading Indicator */}
        {isGenerating && (
          <View style={styles.generatingBar}>
            <ActivityIndicator size="small" color="#F59E0B" />
            <Text style={styles.generatingText}>AI is formulating response...</Text>
          </View>
        )}

        {/* Quick Prompts Bar */}
        <QuickPromptsBar
          mode={conversation?.mode || 'TUTOR'}
          courseId={contextParam?.course_id || conversation?.course_id}
          onSelectPrompt={(p) => handleSendMessage(p)}
        />

        {/* Bottom Input Row */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask your AI tutor anything..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isGenerating}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!inputText.trim() || isGenerating) && styles.sendBtnDisabled,
            ]}
            onPress={() => handleSendMessage()}
            disabled={!inputText.trim() || isGenerating}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={17} color="#0A1128" />
          </TouchableOpacity>
        </View>

        {/* Explanation Level Modal (Section 13) */}
        <Modal
          visible={levelModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setLevelModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setLevelModalVisible(false)}
          >
            <View style={styles.levelModalBox}>
              <Text style={styles.levelModalTitle}>Explanation Level</Text>
              <Text style={styles.levelModalDesc}>
                Choose how deep or accessible you want the AI explanations to be:
              </Text>

              {levels.map((lvl) => {
                const isSelected = explanationLevel === lvl.key;
                return (
                  <TouchableOpacity
                    key={lvl.key}
                    style={[styles.levelOption, isSelected && styles.levelOptionSelected]}
                    onPress={() => {
                      setExplanationLevel(lvl.key);
                      setLevelModalVisible(false);
                    }}
                  >
                    <View style={styles.levelOptionTextCol}>
                      <Text style={[styles.levelOptionLabel, isSelected && styles.levelLabelActive]}>
                        {lvl.label}
                      </Text>
                      <Text style={styles.levelOptionDesc}>{lvl.desc}</Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={18} color="#F59E0B" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Save to Notes Modal (Section 36) */}
        <Modal
          visible={noteModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setNoteModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setNoteModalVisible(false)}
          >
            <View style={styles.noteModalBox}>
              <Text style={styles.levelModalTitle}>Save AI Response to Notes</Text>
              <TextInput
                style={styles.noteInput}
                multiline
                value={noteContentToSave}
                onChangeText={setNoteContentToSave}
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setNoteModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalSaveBtn} onPress={confirmSaveNote}>
                  <Text style={styles.modalSaveText}>Save Note</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1128',
  },
  topRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backBtn: {
    padding: 6,
  },
  ribbonCenter: {
    flex: 1,
    marginHorizontal: 8,
  },
  contextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  contextBadgeText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
  },
  ribbonActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelSelectorText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#F59E0B',
  },
  clearBtn: {
    padding: 6,
  },
  listContent: {
    paddingVertical: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
  generatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  generatingText: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#475569',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  levelModalBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  levelModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  levelModalDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 14,
  },
  levelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    marginBottom: 8,
  },
  levelOptionSelected: {
    borderWidth: 1,
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  levelOptionTextCol: {
    flex: 1,
    marginRight: 8,
  },
  levelOptionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  levelLabelActive: {
    color: '#F59E0B',
  },
  levelOptionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  noteModalBox: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  noteInput: {
    height: 140,
    backgroundColor: '#0F172A',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    textAlignVertical: 'top',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  modalCancelText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
  },
  modalSaveText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
