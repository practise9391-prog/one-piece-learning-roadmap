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
import { MessageBubble } from '../../components/ai/MessageBubble';
import {
  AIMessage,
  InterviewMode,
  InterviewFeedback,
} from '../../models/AIAssistant';

export const AIInterviewScreen: React.FC = () => {
  const { params, goBack } = useAppNavigation();
  const conversationId = params?.conversationId;

  const [selectedMode, setSelectedMode] = useState<InterviewMode>('TECHNICAL');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Final evaluation modal
  const [feedbackModalVisible, setFeedbackModalVisible] = useState<boolean>(false);
  const [interviewFeedback, setInterviewFeedback] = useState<InterviewFeedback | null>(null);

  const flatListRef = useRef<FlatList>(null);

  const initInterview = useCallback(async () => {
    if (!conversationId) return;
    try {
      const existing = await aiRepository.getMessages(conversationId, 30);
      if (existing.length > 0) {
        setMessages(existing);
      } else {
        // Opening question based on mode
        const greeting =
          selectedMode === 'HR'
            ? 'Hello! Welcome to our interview. To get started, could you please tell me about yourself and your professional journey?'
            : selectedMode === 'DSA'
            ? 'Welcome to your technical DSA round. Could you explain the trade-offs between an Array and a Linked List, and when you would choose one over the other?'
            : selectedMode === 'SQL'
            ? 'Hello! In SQL, could you explain how a GROUP BY query works with aggregate functions, and how HAVING differs from WHERE?'
            : 'Welcome to your technical developer interview. Could you explain how you structure a software project from architecture to error handling?';

        const openingMsg = await aiRepository.addMessage({
          conversation_id: conversationId,
          role: 'ASSISTANT',
          content: greeting,
        });
        setMessages([openingMsg]);
      }
    } catch (err) {
      console.warn('Failed to initialize interview:', err);
    }
  }, [conversationId, selectedMode]);

  useEffect(() => {
    initInterview();
  }, [initInterview]);

  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || !conversationId || isGenerating) return;

    setInputText('');
    setIsGenerating(true);

    try {
      const result = await aiService.sendMessage({
        conversationId,
        content: text,
        explanationLevel: 'INTERVIEW',
      });

      setMessages((prev) => [...prev, result.userMessage, result.assistantMessage]);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch {
      Alert.alert('Error', 'Unable to receive interview response.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFinishInterview = async () => {
    if (!conversationId) return;
    try {
      setIsGenerating(true);
      const feedback = await aiService.generateInterviewFeedback(conversationId, selectedMode);
      setInterviewFeedback(feedback);
      setFeedbackModalVisible(true);
    } catch {
      Alert.alert('Error', 'Failed to generate interview assessment.');
    } finally {
      setIsGenerating(false);
    }
  };

  const modes: { key: InterviewMode; label: string }[] = [
    { key: 'TECHNICAL', label: 'Technical' },
    { key: 'HR', label: 'HR Round' },
    { key: 'DSA', label: 'DSA' },
    { key: 'SQL', label: 'SQL' },
    { key: 'BEHAVIORAL', label: 'Behavioral' },
  ];

  return (
    <AppShell title="AI Interview Coach">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Ribbon Bar */}
        <View style={styles.topRibbon}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.interviewBadge}>
            <Ionicons name="briefcase" size={13} color="#8B5CF6" />
            <Text style={styles.interviewBadgeText}>{selectedMode} INTERVIEW</Text>
          </View>
          <TouchableOpacity style={styles.evaluateBtn} onPress={handleFinishInterview}>
            <Ionicons name="stats-chart" size={14} color="#8B5CF6" />
            <Text style={styles.evaluateBtnText}>Assess</Text>
          </TouchableOpacity>
        </View>

        {/* Mode Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.modesScroll}
          contentContainerStyle={styles.modesContainer}
        >
          {modes.map((m) => {
            const active = selectedMode === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[styles.modeChip, active && styles.modeChipActive]}
                onPress={() => setSelectedMode(m.key)}
              >
                <Text style={[styles.modeChipText, active && styles.modeChipTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Conversation Message List */}
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
            <ActivityIndicator size="small" color="#8B5CF6" />
            <Text style={styles.generatingText}>Interviewer is evaluating answer...</Text>
          </View>
        )}

        {/* Answer Input Row */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your structured answer..."
            placeholderTextColor="#64748B"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1500}
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

        {/* Observable Interview Assessment Modal (Section 32) */}
        <Modal
          visible={feedbackModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setFeedbackModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.feedbackBox}>
              <View style={styles.feedbackHeader}>
                <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                <Text style={styles.feedbackTitle}>Interview Performance Assessment</Text>
              </View>

              {interviewFeedback && (
                <ScrollView style={styles.feedbackScroll} showsVerticalScrollIndicator={false}>
                  {/* Observable Metric Cards */}
                  <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Communication</Text>
                      <Text style={styles.metricVal}>{interviewFeedback.communication}</Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Clarity</Text>
                      <Text style={styles.metricVal}>{interviewFeedback.clarity}</Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Technical</Text>
                      <Text style={styles.metricVal}>{interviewFeedback.technical_explanation}</Text>
                    </View>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Grammar</Text>
                      <Text style={styles.metricVal}>{interviewFeedback.grammar}</Text>
                    </View>
                  </View>

                  {/* Observable Strengths */}
                  <Text style={styles.secTitle}>Observable Strengths</Text>
                  {interviewFeedback.observable_strengths.map((str, idx) => (
                    <Text key={`str_${idx}`} style={styles.bulletText}>
                      ✓ {str}
                    </Text>
                  ))}

                  {/* Areas to Improve */}
                  <Text style={styles.secTitle}>Areas to Improve</Text>
                  {interviewFeedback.areas_to_improve.map((area, idx) => (
                    <Text key={`area_${idx}`} style={styles.bulletText}>
                      • {area}
                    </Text>
                  ))}

                  {/* Sample Improved Answer */}
                  <Text style={styles.secTitle}>Improved Answer Model</Text>
                  <View style={styles.improvedAnswerBox}>
                    <Text style={styles.improvedAnswerText}>
                      {interviewFeedback.sample_improved_answer}
                    </Text>
                  </View>

                  {/* Summary */}
                  <Text style={styles.secTitle}>Overall Summary</Text>
                  <Text style={styles.bodyText}>{interviewFeedback.overall_summary}</Text>
                </ScrollView>
              )}

              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => {
                  setFeedbackModalVisible(false);
                  goBack();
                }}
              >
                <Text style={styles.doneBtnText}>Close Assessment</Text>
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
  interviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  interviewBadgeText: {
    fontSize: 11,
    color: '#A78BFA',
    fontWeight: '800',
  },
  evaluateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  evaluateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A78BFA',
  },
  modesScroll: {
    backgroundColor: '#0F172A',
    paddingVertical: 6,
    maxHeight: 44,
  },
  modesContainer: {
    paddingHorizontal: 12,
    gap: 8,
    alignItems: 'center',
  },
  modeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
  },
  modeChipActive: {
    backgroundColor: '#8B5CF6',
  },
  modeChipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  modeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 10,
  },
  generatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  generatingText: {
    fontSize: 11,
    color: '#A78BFA',
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
    maxHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#475569',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  feedbackScroll: {
    marginVertical: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#0F172A',
    padding: 10,
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
    fontSize: 13,
    fontWeight: '800',
    color: '#A78BFA',
  },
  secTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F59E0B',
    marginTop: 10,
    marginBottom: 4,
  },
  bulletText: {
    fontSize: 12.5,
    color: '#CBD5E1',
    lineHeight: 18,
    marginTop: 2,
  },
  improvedAnswerBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
    marginVertical: 4,
  },
  improvedAnswerText: {
    fontSize: 12.5,
    color: '#E2E8F0',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  bodyText: {
    fontSize: 12.5,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  doneBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
