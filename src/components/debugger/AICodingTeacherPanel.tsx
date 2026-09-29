import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../theme/ThemeContext';
import { ExecutionStep } from '../../models/Debugger';
import { AILearningMode, AIProposedCodeEdit } from '../../models/AIAssistant';
import { aiService } from '../../services/ai/AIService';
import { speechService } from '../../services/ai/SpeechService';
import { noteRepository } from '../../repositories/NoteRepository';
import { generateId } from '../../utils/idGenerator';
import { Spacing, Radius } from '../../theme/tokens';

interface AICodingTeacherPanelProps {
  code: string;
  language: string;
  currentStep?: ExecutionStep;
  activeLineNumber?: number;
  error?: string;
  topicTitle?: string;
  questionTitle?: string;
  onApplyCodeFix?: (newCode: string) => void;
  onHighlightLine?: (lineNumber: number) => void;
  courseId?: string;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  mode?: AILearningMode;
  codeSuggestion?: AIProposedCodeEdit;
  bookmarked?: boolean;
}

export const AICodingTeacherPanel: React.FC<AICodingTeacherPanelProps> = ({
  code,
  language,
  currentStep,
  activeLineNumber,
  error,
  topicTitle,
  questionTitle,
  onApplyCodeFix,
  onHighlightLine,
  courseId,
}) => {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hello! I am your AI Coding Teacher. I am actively observing your ${language.toUpperCase()} workspace. Feel free to ask about any line, variable state, calculation, algorithm pattern, or error.`,
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);

  // Controlled Code Fix Proposal Modal
  const [previewProposal, setPreviewProposal] = useState<AIProposedCodeEdit | null>(null);

  const sendQuery = async (queryText: string, mode: AILearningMode = 'GUIDED') => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: MessageItem = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: queryText,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await aiService.queryPersonalTeacher({
        prompt: queryText,
        mode,
        contextOverride: {
          source: 'DEBUGGER',
          code,
          language,
          activeLineNumber: activeLineNumber || currentStep?.sourceLine || 1,
          variables: currentStep?.variables,
          currentStepOperation: currentStep?.operation,
          error,
          topicTitle: topicTitle || questionTitle || 'Code Workspace',
          courseId,
        },
      });

      // Check if query is asking to fix or improve code
      let codeSuggestion: AIProposedCodeEdit | undefined;
      const lowerQ = queryText.toLowerCase();
      if (lowerQ.includes('fix') || lowerQ.includes('repair') || lowerQ.includes('correct')) {
        codeSuggestion = aiService.generateCodeFixProposal({
          originalCode: code,
          query: queryText,
          language,
          line: activeLineNumber || 1,
        });
      }

      // Check if command is returned for debugger
      if (result.response.metadata?.debugger_command && onHighlightLine) {
        const line = result.response.metadata.debugger_command.payload?.line;
        if (typeof line === 'number') {
          onHighlightLine(line);
        }
      }

      const assistantMsg: MessageItem = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: result.response.content,
        mode,
        codeSuggestion,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `Observing Line ${activeLineNumber || 1}: ${currentStep?.operation || 'execution'}. ${
            currentStep?.explanation || 'Inspect live variable states above.'
          }`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'EXPLAIN_LINE':
        sendQuery(`Explain what line ${activeLineNumber || 1} does and why variables change.`, 'DEBUGGING');
        break;
      case 'WHY':
        sendQuery(`Why did line ${activeLineNumber || 1} execute and produce this state?`, 'DEBUGGING');
        break;
      case 'HINT':
        sendQuery('Give me a subtle hint to solve this problem.', 'GUIDED');
        break;
      case 'EXPLAIN_ERROR':
        sendQuery(`Explain this error and how to fix it: ${error || 'Runtime error'}`, 'DEBUGGING');
        break;
      case 'OPTIMAL_APPROACH':
        sendQuery('Show the brute force vs optimal approach with asymptotic complexity.', 'BRUTE_BETTER_OPTIMAL');
        break;
      case 'PATTERN':
        sendQuery('Detect algorithmic patterns that apply to this problem.', 'ALGORITHM_PATTERN');
        break;
      case 'REVIEW':
        sendQuery('Review my code for edge cases, bugs, complexity, and readability.', 'CODE_REVIEW');
        break;
      case 'SIMPLE':
        sendQuery('Explain this concept simply using a real-world analogy.', 'SIMPLE_EXPLANATION');
        break;
      default:
        break;
    }
  };

  const handleToggleSpeak = async (text: string) => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    if (!speechService.isVoiceOutputAvailable()) {
      Alert.alert('Speech Unavailable', 'Voice output is not supported on this device.');
      return;
    }

    setIsSpeaking(true);
    speechService.setSpeed(speechSpeed);
    const res = await speechService.speak(text, { speed: speechSpeed });
    if (!res.success) {
      Alert.alert('Speech Notice', res.message);
    }
    setIsSpeaking(false);
  };

  const handleToggleListen = async () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    if (!speechService.isVoiceInputAvailable()) {
      Alert.alert(
        'Voice Input Unavailable',
        'Voice recognition is unavailable on this device. You can type your question in the box below.'
      );
      return;
    }

    setIsListening(true);
    const res = await speechService.startListening(
      (result) => {
        setInputText(result.transcript);
        if (result.isFinal) {
          setIsListening(false);
          sendQuery(result.transcript);
        }
      },
      (err) => {
        setIsListening(false);
        Alert.alert('Voice Recognition', `Recognition error: ${err}`);
      }
    );

    if (!res.started) {
      setIsListening(false);
      Alert.alert('Voice Input', res.message);
    }
  };

  const handleSaveToNotes = async (text: string) => {
    try {
      await noteRepository.create({
        id: generateId('note'),
        course_id: courseId || 'general',
        note_text: `[AI Coding Teacher Note: ${topicTitle || questionTitle || 'Workspace'}]\n\n${text}`,
      });
      Alert.alert('Saved to Notes', 'Explanation successfully saved to your learning vault.');
    } catch {
      Alert.alert('Note Error', 'Could not save note to local vault.');
    }
  };

  const handleCopyMessage = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'AI response copied to clipboard.');
  };

  const handleToggleBookmark = (msgId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, bookmarked: !m.bookmarked } : m))
    );
  };

  const handleApplyProposedFix = (fix: AIProposedCodeEdit) => {
    if (onApplyCodeFix) {
      onApplyCodeFix(fix.proposedCode);
      setPreviewProposal(null);
      Alert.alert('Fix Applied', 'Updated code in your editor. Run or Debug to test changes.');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Ionicons name="sparkles" size={16} color="#EC4899" />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            AI CODING TEACHER
          </Text>
        </View>

        <View style={styles.headerRightActions}>
          {/* Speed Selector */}
          <TouchableOpacity
            onPress={() => {
              const speeds = [0.75, 1.0, 1.25, 1.5];
              const nextIdx = (speeds.indexOf(speechSpeed) + 1) % speeds.length;
              setSpeechSpeed(speeds[nextIdx]);
              speechService.setSpeed(speeds[nextIdx]);
            }}
            style={styles.speedBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.speedBtnText}>{speechSpeed}x</Text>
          </TouchableOpacity>

          {/* Voice Readout Toggle */}
          <TouchableOpacity
            onPress={() => {
              const lastAssistant = [...messages].reverse().find((m) => m.sender === 'assistant');
              if (lastAssistant) handleToggleSpeak(lastAssistant.text);
            }}
            style={styles.voiceBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSpeaking ? 'pause' : 'volume-medium-outline'}
              size={14}
              color="#EC4899"
            />
            <Text style={styles.voiceBtnText}>{isSpeaking ? 'Stop' : 'Listen'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Action Prompt Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickChipsRow}
      >
        <TouchableOpacity
          onPress={() => handleQuickAction('EXPLAIN_LINE')}
          style={[styles.quickChip, { borderColor: '#38BDF8' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="bulb-outline" size={12} color="#38BDF8" />
          <Text style={[styles.quickChipText, { color: '#38BDF8' }]}>
            Line {activeLineNumber || 1}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleQuickAction('WHY')}
          style={[styles.quickChip, { borderColor: '#10B981' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle-outline" size={12} color="#10B981" />
          <Text style={[styles.quickChipText, { color: '#10B981' }]}>Why?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleQuickAction('HINT')}
          style={[styles.quickChip, { borderColor: '#F59E0B' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="key-outline" size={12} color="#F59E0B" />
          <Text style={[styles.quickChipText, { color: '#F59E0B' }]}>Give Hint</Text>
        </TouchableOpacity>

        {error && (
          <TouchableOpacity
            onPress={() => handleQuickAction('EXPLAIN_ERROR')}
            style={[styles.quickChip, { borderColor: '#EF4444' }]}
            activeOpacity={0.7}
          >
            <Ionicons name="alert-circle-outline" size={12} color="#EF4444" />
            <Text style={[styles.quickChipText, { color: '#EF4444' }]}>Explain Error</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => handleQuickAction('OPTIMAL_APPROACH')}
          style={[styles.quickChip, { borderColor: '#8B5CF6' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="rocket-outline" size={12} color="#8B5CF6" />
          <Text style={[styles.quickChipText, { color: '#8B5CF6' }]}>Optimal Approach</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleQuickAction('PATTERN')}
          style={[styles.quickChip, { borderColor: '#06B6D4' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="git-network-outline" size={12} color="#06B6D4" />
          <Text style={[styles.quickChipText, { color: '#06B6D4' }]}>Detect Pattern</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleQuickAction('REVIEW')}
          style={[styles.quickChip, { borderColor: '#F43F5E' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="shield-checkmark-outline" size={12} color="#F43F5E" />
          <Text style={[styles.quickChipText, { color: '#F43F5E' }]}>Review Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleQuickAction('SIMPLE')}
          style={[styles.quickChip, { borderColor: '#A855F7' }]}
          activeOpacity={0.7}
        >
          <Ionicons name="sparkles-outline" size={12} color="#A855F7" />
          <Text style={[styles.quickChipText, { color: '#A855F7' }]}>Explain Simply</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Messages Scroll Area */}
      <ScrollView style={styles.messagesScroll} contentContainerStyle={styles.messagesContainer}>
        {messages.map((m) => {
          const isAi = m.sender === 'assistant';
          return (
            <View
              key={m.id}
              style={[
                styles.messageBubble,
                isAi ? styles.aiBubble : styles.userBubble,
                {
                  backgroundColor: isAi ? (isDark ? '#1E293B' : '#FFFFFF') : '#0284C7',
                  borderColor: isAi ? colors.border : '#0284C7',
                },
              ]}
            >
              <View style={styles.senderHeader}>
                <Ionicons
                  name={isAi ? 'sparkles' : 'person'}
                  size={12}
                  color={isAi ? '#EC4899' : '#FFFFFF'}
                />
                <Text style={[styles.senderName, { color: isAi ? '#EC4899' : '#FFFFFF' }]}>
                  {isAi ? 'Teacher' : 'You'}
                </Text>
              </View>

              <Text style={[styles.messageText, { color: isAi ? colors.textPrimary : '#FFFFFF' }]}>
                {m.text}
              </Text>

              {/* Action Toolbar on Assistant Messages */}
              {isAi && m.id !== 'welcome' && (
                <View style={styles.assistantActionsRow}>
                  <TouchableOpacity
                    onPress={() => handleToggleSpeak(m.text)}
                    style={styles.msgActionBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="volume-medium-outline" size={13} color="#94A3B8" />
                    <Text style={styles.msgActionText}>Listen</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleSaveToNotes(m.text)}
                    style={styles.msgActionBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="journal-outline" size={13} color="#94A3B8" />
                    <Text style={styles.msgActionText}>Note</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleToggleBookmark(m.id)}
                    style={styles.msgActionBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={m.bookmarked ? 'star' : 'star-outline'}
                      size={13}
                      color={m.bookmarked ? '#F59E0B' : '#94A3B8'}
                    />
                    <Text
                      style={[
                        styles.msgActionText,
                        m.bookmarked && { color: '#F59E0B', fontWeight: '700' },
                      ]}
                    >
                      {m.bookmarked ? 'Saved' : 'Save'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleCopyMessage(m.text)}
                    style={styles.msgActionBtn}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="copy-outline" size={13} color="#94A3B8" />
                    <Text style={styles.msgActionText}>Copy</Text>
                  </TouchableOpacity>

                  {m.codeSuggestion && (
                    <TouchableOpacity
                      onPress={() => setPreviewProposal(m.codeSuggestion!)}
                      style={[styles.msgActionBtn, { backgroundColor: '#312E81' }]}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="code-working" size={13} color="#A5B4FC" />
                      <Text style={[styles.msgActionText, { color: '#A5B4FC', fontWeight: '700' }]}>
                        Preview Fix
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {isLoading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#EC4899" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Teacher is analyzing real code and execution trace...
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Chat Input Bar */}
      <View style={[styles.inputRow, { borderColor: colors.border }]}>
        {/* Voice Input Mic Button */}
        <TouchableOpacity
          onPress={handleToggleListen}
          style={[styles.micBtn, isListening && styles.micBtnActive]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isListening ? 'mic' : 'mic-outline'}
            size={18}
            color={isListening ? '#FFFFFF' : '#EC4899'}
          />
        </TouchableOpacity>

        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholder="Ask a question about your code or trace..."
          placeholderTextColor="#64748B"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => sendQuery(inputText)}
        />

        <TouchableOpacity
          onPress={() => sendQuery(inputText)}
          disabled={!inputText.trim() || isLoading}
          style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Controlled Code Edit Preview Modal (Rule 56) */}
      <Modal visible={Boolean(previewProposal)} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? '#0B132B' : '#FFFFFF', borderColor: colors.border },
            ]}
          >
            <View style={styles.modalHeader}>
              <Ionicons name="shield-checkmark" size={18} color="#6366F1" />
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Controlled Code Edit Preview
              </Text>
            </View>

            <Text style={[styles.modalExplanation, { color: colors.textSecondary }]}>
              {previewProposal?.diffExplanation}
            </Text>

            <ScrollView style={styles.modalDiffScroll}>
              <Text style={styles.codeSnippetLabel}>Proposed Update:</Text>
              <Text style={[styles.codeSnippetText, { color: colors.textPrimary }]}>
                {previewProposal?.proposedCode}
              </Text>
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setPreviewProposal(null)}
                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => previewProposal && handleApplyProposedFix(previewProposal)}
                style={[styles.modalBtn, { backgroundColor: '#6366F1' }]}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle-outline" size={15} color="#FFFFFF" />
                <Text style={[styles.modalBtnText, { color: '#FFFFFF', fontWeight: '800' }]}>
                  Apply to Editor
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.sm + 4,
    marginVertical: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  speedBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  speedBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(236, 72, 153, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  voiceBtnText: {
    color: '#EC4899',
    fontSize: 11,
    fontWeight: '700',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 4,
    marginBottom: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  messagesScroll: {
    maxHeight: 240,
    minHeight: 100,
  },
  messagesContainer: {
    gap: 8,
    paddingVertical: 4,
  },
  messageBubble: {
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    maxWidth: '96%',
  },
  userBubble: {
    alignSelf: 'flex-end',
    maxWidth: '85%',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  senderName: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 18,
  },
  assistantActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  msgActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  msgActionText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  micBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnActive: {
    backgroundColor: '#EC4899',
  },
  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  sendBtn: {
    backgroundColor: '#0284C7',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    padding: Spacing.md,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  modalExplanation: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  modalDiffScroll: {
    backgroundColor: '#020617',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    maxHeight: 200,
  },
  codeSnippetLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  codeSnippetText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 17,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  modalBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
