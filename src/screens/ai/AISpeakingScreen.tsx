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
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { aiService } from '../../services/ai/AIService';
import { aiRepository } from '../../repositories/AIRepository';
import { speechService } from '../../services/ai/SpeechService';
import { MessageBubble } from '../../components/ai/MessageBubble';
import {
  AIMessage,
  AISpeakingSession,
  DailySpeakingTopic,
  CorrectionLevel,
  SpeakingFeedback,
  SpeakingMode,
} from '../../models/AIAssistant';

export const AISpeakingScreen: React.FC = () => {
  const { params, goBack } = useAppNavigation();
  const conversationId = params?.conversationId;

  const [session, setSession] = useState<AISpeakingSession | null>(null);
  const [dailyTopic, setDailyTopic] = useState<DailySpeakingTopic | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [correctionLevel, setCorrectionLevel] = useState<CorrectionLevel>('GENTLE');
  const [sessionStartTime] = useState<number>(Date.now());
  const [correctionsCount, setCorrectionsCount] = useState<number>(0);

  // Feedback Modal
  const [feedbackModalVisible, setFeedbackModalVisible] = useState<boolean>(false);
  const [sessionFeedback, setSessionFeedback] = useState<SpeakingFeedback | null>(null);
  const [xpEarned, setXpEarned] = useState<number>(0);
  const [pointsEarned, setPointsEarned] = useState<number>(0);

  const flatListRef = useRef<FlatList>(null);

  const initSession = useCallback(async () => {
    try {
      const topic = await aiRepository.getDailySpeakingTopic();
      setDailyTopic(topic);

      if (conversationId) {
        // Start or retrieve speaking session
        const newSession = await aiRepository.startSpeakingSession({
          conversation_id: conversationId,
          mode: 'DAILY_CONVERSATION',
          topic_id: topic.id,
          difficulty: topic.difficulty,
          correction_level: correctionLevel,
        });
        setSession(newSession);

        // Fetch existing messages
        const existingMessages = await aiRepository.getMessages(conversationId, 40);
        if (existingMessages.length > 0) {
          setMessages(existingMessages);
        } else {
          // Pre-seed opening greeting from daily topic
          const openingMsg = await aiRepository.addMessage({
            conversation_id: conversationId,
            role: 'ASSISTANT',
            content: topic.opening_question,
          });
          setMessages([openingMsg]);
        }
      }
    } catch (err) {
      console.warn('Failed to initialize speaking session:', err);
    }
  }, [conversationId, correctionLevel]);

  useEffect(() => {
    initSession();
  }, [initSession]);

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || !conversationId || !session || isGenerating) return;

    setInputText('');
    setIsGenerating(true);

    try {
      const result = await aiService.sendSpeakingMessage({
        sessionId: session.id,
        conversationId,
        userSpeech: text,
        correctionLevel,
      });

      if (result.assistantMessage.metadata?.correction) {
        setCorrectionsCount((prev) => prev + 1);
      }

      setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch {
      Alert.alert('Speaking Error', 'Could not send speaking message.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMicPress = () => {
    // Section 60 & 61: Speech service returns "Voice Mode Coming Soon"
    const res = speechService.speak('');
    Alert.alert('Voice Mode', 'Voice mode is coming soon in an upcoming update! You can practice full conversation and corrections with text right now.');
  };

  const handleFinishSession = async () => {
    if (!session) return;
    const durationSeconds = Math.max(30, Math.floor((Date.now() - sessionStartTime) / 1000));
    const msgCount = messages.filter((m) => m.role === 'USER').length;

    try {
      const result = await aiService.completeSpeakingSession({
        sessionId: session.id,
        durationSeconds,
        messageCount: msgCount,
        correctionsCount,
        topicId: dailyTopic?.id,
      });

      setSessionFeedback(result.feedback);
      setXpEarned(result.xpAwarded);
      setPointsEarned(result.pointsAwarded);
      setFeedbackModalVisible(true);
    } catch {
      Alert.alert('Error', 'Failed to generate session feedback.');
    }
  };

  return (
    <AppShell title="Speak With AI">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header Fear-Free Ribbon */}
        <View style={styles.ribbon}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.ribbonCenter}>
            <View style={styles.peaceBadge}>
              <Ionicons name="heart" size={12} color="#10B981" />
              <Text style={styles.peaceText}>Fear-Free Practice</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinishSession}>
            <Ionicons name="checkmark-done" size={15} color="#10B981" />
            <Text style={styles.finishBtnText}>Finish</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Speaking Topic Accordion/Card (Section 22) */}
        {dailyTopic && (
          <View style={styles.topicCard}>
            <View style={styles.topicHeaderRow}>
              <View style={styles.topicBadge}>
                <Text style={styles.topicBadgeText}>TODAY'S TOPIC</Text>
              </View>
              <Text style={styles.topicDiff}>{dailyTopic.difficulty}</Text>
            </View>
            <Text style={styles.topicTitle}>{dailyTopic.title}</Text>
            <Text style={styles.topicDesc}>{dailyTopic.description}</Text>

            <View style={styles.vocabRow}>
              <Text style={styles.vocabLabel}>Useful Words:</Text>
              {dailyTopic.vocabulary.slice(0, 4).map((w: string, idx: number) => (
                <View key={`v_${idx}`} style={styles.vocabChip}>
                  <Text style={styles.vocabText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Correction Level Selector Bar (Section 26) */}
        <View style={styles.correctionBar}>
          <Text style={styles.correctionLabel}>Feedback Level:</Text>
          {(['NO_CORRECTION', 'GENTLE', 'DETAILED'] as CorrectionLevel[]).map((lvl) => {
            const active = correctionLevel === lvl;
            const label = lvl === 'NO_CORRECTION' ? 'Off' : lvl === 'GENTLE' ? 'Gentle' : 'Detailed';
            return (
              <TouchableOpacity
                key={lvl}
                style={[styles.correctionChip, active && styles.correctionChipActive]}
                onPress={() => setCorrectionLevel(lvl)}
              >
                <Text style={[styles.correctionChipText, active && styles.correctionChipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Conversation List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Generating Indicator */}
        {isGenerating && (
          <View style={styles.generatingBar}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.generatingText}>Partner is thinking & listening...</Text>
          </View>
        )}

        {/* Speaking Input Bar */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.micBtn} onPress={handleMicPress}>
            <Ionicons name="mic-outline" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type your response in English..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            editable={!isGenerating}
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isGenerating) && styles.sendBtnDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isGenerating}
          >
            <Ionicons name="send" size={17} color="#0A1128" />
          </TouchableOpacity>
        </View>

        {/* Session Complete & Structured Feedback Modal (Sections 32 & 51) */}
        <Modal
          visible={feedbackModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setFeedbackModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.feedbackBox}>
              <View style={styles.feedbackHeader}>
                <Ionicons name="ribbon" size={24} color="#10B981" />
                <Text style={styles.feedbackTitle}>Session Complete!</Text>
              </View>

              {xpEarned > 0 && (
                <View style={styles.xpCard}>
                  <Text style={styles.xpText}>+{xpEarned} XP Earned</Text>
                  <Text style={styles.pointsText}>+{pointsEarned} Points</Text>
                </View>
              )}

              {sessionFeedback && (
                <ScrollView style={styles.feedbackScroll} showsVerticalScrollIndicator={false}>
                  {/* Rating Metrics */}
                  <View style={styles.metricsRow}>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Communication</Text>
                      <Text style={styles.metricVal}>{sessionFeedback.communication_rating}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Clarity</Text>
                      <Text style={styles.metricVal}>{sessionFeedback.clarity_rating}</Text>
                    </View>
                    <View style={styles.metricItem}>
                      <Text style={styles.metricLabel}>Completeness</Text>
                      <Text style={styles.metricVal}>{sessionFeedback.completeness_rating}</Text>
                    </View>
                  </View>

                  {/* Summary */}
                  <Text style={styles.fbSectionTitle}>Overall Observations</Text>
                  <Text style={styles.fbBodyText}>{sessionFeedback.overall_feedback}</Text>

                  {/* Improvement Tips */}
                  {sessionFeedback.sentence_improvements.length > 0 && (
                    <>
                      <Text style={styles.fbSectionTitle}>Growth Suggestions</Text>
                      {sessionFeedback.sentence_improvements.map((tip: string, idx: number) => (
                        <Text key={`tip_${idx}`} style={styles.bulletText}>
                          • {tip}
                        </Text>
                      ))}
                    </>
                  )}
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                  setFeedbackModalVisible(false);
                  goBack();
                }}
              >
                <Text style={styles.doneBtnText}>Return to Practice Hub</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  ribbon: {
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
    alignItems: 'center',
  },
  peaceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  peaceText: {
    fontSize: 11,
    color: '#34D399',
    fontWeight: '700',
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  finishBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },
  topicCard: {
    backgroundColor: '#1E293B',
    margin: 12,
    marginBottom: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
  },
  topicHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  topicBadge: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  topicBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#38BDF8',
  },
  topicDiff: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F59E0B',
  },
  topicTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  topicDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
    marginBottom: 8,
  },
  vocabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  vocabLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  vocabChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vocabText: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  correctionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  correctionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  correctionChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  correctionChipActive: {
    backgroundColor: '#0284C7',
  },
  correctionChipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  correctionChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 8,
  },
  generatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  generatingText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  micBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#475569',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  feedbackBox: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  xpCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#34D399',
  },
  pointsText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
  },
  feedbackScroll: {
    marginVertical: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 14,
  },
  metricItem: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#38BDF8',
  },
  fbSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    marginTop: 10,
    marginBottom: 4,
  },
  fbBodyText: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  bulletText: {
    fontSize: 12.5,
    color: '#E2E8F0',
    lineHeight: 18,
    marginTop: 2,
  },
  doneBtn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0A1128',
  },
});
