import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../theme/ThemeContext';
import { aiContextManager } from '../../services/ai/AIContextManager';
import { aiService } from '../../services/ai/AIService';
import { speechService } from '../../services/ai/SpeechService';
import { noteRepository } from '../../repositories/NoteRepository';
import { generateId } from '../../utils/idGenerator';
import { AILearningMode } from '../../models/AIAssistant';
import { Spacing, Radius } from '../../theme/tokens';

interface GlobalAITeacherModalProps {
  visible: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialMode?: AILearningMode;
}

interface TeacherMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  mode?: AILearningMode;
  bookmarked?: boolean;
}

export const GlobalAITeacherModal: React.FC<GlobalAITeacherModalProps> = ({
  visible,
  onClose,
  initialPrompt,
  initialMode = 'GUIDED',
}) => {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedMode, setSelectedMode] = useState<AILearningMode>(initialMode);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(1.0);

  const activeContext = aiContextManager.getContext();

  useEffect(() => {
    if (visible) {
      const topicName = activeContext.topicTitle || 'your active lesson';
      setMessages([
        {
          id: 'init_welcome',
          sender: 'assistant',
          text: `Hello! I am your AI Personal Teacher. I am aware of your current context: "${topicName}" (${activeContext.source}). How can I help you understand this concept?`,
        },
      ]);
      if (initialPrompt) {
        sendQuery(initialPrompt, initialMode);
      }
    }
  }, [visible, initialPrompt, initialMode]);

  const sendQuery = async (queryText: string, mode: AILearningMode = selectedMode) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg: TeacherMessage = {
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
      });

      const assistantMsg: TeacherMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: result.response.content,
        mode,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: `Analyzing "${activeContext.topicTitle || 'current topic'}": Focus on understanding core mechanisms and key invariants. Step through live practice to verify understanding.`,
        },
      ]);
    } finally {
      setIsLoading(false);
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
        course_id: activeContext.courseId || 'general',
        module_id: activeContext.moduleId,
        note_text: `[AI Personal Teacher: ${activeContext.topicTitle || 'Lesson'}]\n\n${text}`,
      });
      Alert.alert('Saved to Notes', 'Explanation saved into your course notes vault.');
    } catch {
      Alert.alert('Note Error', 'Could not save note to local vault.');
    }
  };

  const handleCopy = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Explanation copied to clipboard.');
  };

  const handleQuickAction = (mode: AILearningMode, label: string) => {
    setSelectedMode(mode);
    switch (mode) {
      case 'SIMPLE_EXPLANATION':
        sendQuery(`Explain "${activeContext.topicTitle || 'this topic'}" simply using a real-world analogy.`, mode);
        break;
      case 'TECHNICAL_EXPLANATION':
        sendQuery(`Give an in-depth technical explanation of "${activeContext.topicTitle || 'this topic'}" with internal mechanics.`, mode);
        break;
      case 'ALGORITHM_PATTERN':
        sendQuery(`What algorithm patterns apply to "${activeContext.topicTitle || 'this problem'}"?`, mode);
        break;
      case 'BRUTE_BETTER_OPTIMAL':
        sendQuery(`Show brute force vs better vs optimal approaches with complexity.`, mode);
        break;
      case 'SYSTEM_DESIGN_ARCH':
        sendQuery(`Explain the architectural flow, component roles, and trade-offs.`, mode);
        break;
      case 'QUIZ':
        sendQuery(`Quiz me on "${activeContext.topicTitle || 'this lesson'}" with a conceptual question.`, mode);
        break;
      default:
        sendQuery(`Help me understand "${activeContext.topicTitle || 'this topic'}" step by step.`, mode);
        break;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.modalSheet,
            { backgroundColor: isDark ? '#0B132B' : '#FFFFFF', borderColor: colors.border },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleCol}>
              <View style={styles.headerBadgeRow}>
                <Ionicons name="sparkles" size={16} color="#EC4899" />
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                  PERSONAL AI TEACHER
                </Text>
              </View>
              {activeContext.topicTitle && (
                <Text style={styles.contextSubText} numberOfLines={1}>
                  Context: {activeContext.topicTitle} ({activeContext.source})
                </Text>
              )}
            </View>

            <View style={styles.headerActions}>
              {/* Speed Button */}
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

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Mode Selector Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.modeChipsRow}
          >
            <TouchableOpacity
              onPress={() => handleQuickAction('SIMPLE_EXPLANATION', 'Explain Simply')}
              style={[styles.modeChip, selectedMode === 'SIMPLE_EXPLANATION' && styles.modeChipActive]}
              activeOpacity={0.7}
            >
              <Ionicons name="bulb-outline" size={13} color="#F59E0B" />
              <Text style={styles.modeChipText}>Explain Simply</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickAction('TECHNICAL_EXPLANATION', 'Technical Depth')}
              style={[styles.modeChip, selectedMode === 'TECHNICAL_EXPLANATION' && styles.modeChipActive]}
              activeOpacity={0.7}
            >
              <Ionicons name="code-slash-outline" size={13} color="#38BDF8" />
              <Text style={styles.modeChipText}>Technical</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickAction('BRUTE_BETTER_OPTIMAL', 'Optimal Approach')}
              style={[styles.modeChip, selectedMode === 'BRUTE_BETTER_OPTIMAL' && styles.modeChipActive]}
              activeOpacity={0.7}
            >
              <Ionicons name="trending-up-outline" size={13} color="#10B981" />
              <Text style={styles.modeChipText}>Brute → Optimal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickAction('ALGORITHM_PATTERN', 'Detect Pattern')}
              style={[styles.modeChip, selectedMode === 'ALGORITHM_PATTERN' && styles.modeChipActive]}
              activeOpacity={0.7}
            >
              <Ionicons name="git-network-outline" size={13} color="#A855F7" />
              <Text style={styles.modeChipText}>Detect Pattern</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickAction('SYSTEM_DESIGN_ARCH', 'Architecture')}
              style={[styles.modeChip, selectedMode === 'SYSTEM_DESIGN_ARCH' && styles.modeChipActive]}
              activeOpacity={0.7}
            >
              <Ionicons name="layers-outline" size={13} color="#EC4899" />
              <Text style={styles.modeChipText}>Architecture</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuickAction('QUIZ', 'Quiz Me')}
              style={[styles.modeChip, selectedMode === 'QUIZ' && styles.modeChipActive]}
              activeOpacity={0.7}
            >
              <Ionicons name="help-circle-outline" size={13} color="#06B6D4" />
              <Text style={styles.modeChipText}>Quiz Me</Text>
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
                      backgroundColor: isAi ? (isDark ? '#1E293B' : '#F1F5F9') : '#0284C7',
                      borderColor: isAi ? colors.border : '#0284C7',
                    },
                  ]}
                >
                  <View style={styles.senderRow}>
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

                  {/* Actions on Assistant Messages */}
                  {isAi && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        onPress={() => handleToggleSpeak(m.text)}
                        style={styles.actionBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="volume-medium-outline" size={13} color="#94A3B8" />
                        <Text style={styles.actionBtnText}>Listen</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleSaveToNotes(m.text)}
                        style={styles.actionBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="journal-outline" size={13} color="#94A3B8" />
                        <Text style={styles.actionBtnText}>Save Note</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleCopy(m.text)}
                        style={styles.actionBtn}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="copy-outline" size={13} color="#94A3B8" />
                        <Text style={styles.actionBtnText}>Copy</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}

            {isLoading && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#EC4899" />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Teacher is thinking and analyzing lesson context...
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Bottom Chat Input Bar with Voice */}
          <View style={[styles.inputRow, { borderColor: colors.border }]}>
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
              placeholder="Ask anything about this topic..."
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
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1.5,
    padding: Spacing.md,
    maxHeight: '85%',
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  contextSubText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedBtn: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  speedBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  modeChipsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 6,
    marginBottom: 8,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  modeChipActive: {
    borderColor: '#EC4899',
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
  },
  modeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  messagesScroll: {
    flex: 1,
    maxHeight: 380,
  },
  messagesContainer: {
    gap: 10,
    paddingVertical: 6,
  },
  messageBubble: {
    borderRadius: 12,
    padding: 12,
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
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  senderName: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 19,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionBtnText: {
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
    gap: 8,
    marginTop: 8,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
