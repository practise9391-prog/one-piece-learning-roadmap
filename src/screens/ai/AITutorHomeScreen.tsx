import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { aiRepository } from '../../repositories/AIRepository';
import {
  AIConversation,
  AIMode,
  AIStudySuggestion,
  AITutorContext,
} from '../../models/AIAssistant';
import { Colors } from '../../theme/colors';

export const AITutorHomeScreen: React.FC = () => {
  const { params, navigate, goBack } = useAppNavigation();
  const contextParam: AITutorContext | undefined = params?.context;

  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<AIMode | 'ALL'>('ALL');
  const [suggestions, setSuggestions] = useState<AIStudySuggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [convList, suggList] = await Promise.all([
        aiRepository.getConversations({ mode: selectedFilter, limit: 15 }),
        aiRepository.getPersonalizedStudySuggestions(),
      ]);
      setConversations(convList);
      setSuggestions(suggList);
    } catch (err) {
      console.warn('Failed to load AI Tutor home data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartNewChat = async (mode: AIMode, defaultTitle?: string) => {
    try {
      const topicTitle = contextParam?.topic_title || '';
      const title =
        defaultTitle ||
        (topicTitle ? `${topicTitle} (${mode})` : `New ${mode} Session`);

      const newConv = await aiRepository.createConversation({
        mode,
        title,
        course_id: contextParam?.course_id,
        module_id: contextParam?.module_id,
        topic_id: contextParam?.topic_id,
      });

      if (mode === 'SPEAKING') {
        navigate('AISpeaking', { conversationId: newConv.id, context: contextParam });
      } else if (mode === 'INTERVIEW') {
        navigate('AIInterview', { conversationId: newConv.id, context: contextParam });
      } else {
        navigate('AIChat', { conversationId: newConv.id, context: contextParam });
      }
    } catch {
      Alert.alert('Error', 'Unable to initiate new AI session.');
    }
  };

  const handleOpenConversation = (conv: AIConversation) => {
    if (conv.mode === 'SPEAKING') {
      navigate('AISpeaking', { conversationId: conv.id });
    } else if (conv.mode === 'INTERVIEW') {
      navigate('AIInterview', { conversationId: conv.id });
    } else {
      navigate('AIChat', { conversationId: conv.id });
    }
  };

  const handleDeleteConversation = (id: string, e: any) => {
    e.stopPropagation();
    Alert.alert(
      'Delete Conversation',
      'Are you sure you want to remove this conversation and its messages?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await aiRepository.deleteConversation(id);
            loadData();
          },
        },
      ]
    );
  };

  const formatDateLabel = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  return (
    <AppShell title="AI Learning Assistant">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Banner with Current Context if available */}
        {contextParam?.topic_title && (
          <View style={styles.contextBanner}>
            <View style={styles.contextTextCol}>
              <Text style={styles.contextTag}>CURRENT TOPIC CONTEXT</Text>
              <Text style={styles.contextTitle}>{contextParam.topic_title}</Text>
            </View>
            <TouchableOpacity
              style={styles.contextAskBtn}
              onPress={() => handleStartNewChat('TUTOR', `Explain ${contextParam.topic_title}`)}
            >
              <Text style={styles.contextAskBtnText}>Ask AI</Text>
              <Ionicons name="arrow-forward" size={14} color="#0A1128" />
            </TouchableOpacity>
          </View>
        )}

        {/* AI Modes Grid (Section 2 & 57) */}
        <Text style={styles.sectionHeader}>WHAT DO YOU WANT HELP WITH?</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={[styles.modeCard, { borderColor: '#38BDF8' }]}
            onPress={() => handleStartNewChat('TUTOR')}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Ionicons name="school-outline" size={24} color="#38BDF8" />
            </View>
            <Text style={styles.modeTitle}>Explain a Topic</Text>
            <Text style={styles.modeDesc}>Concepts, intuition & real-life examples</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, { borderColor: '#F59E0B' }]}
            onPress={() => handleStartNewChat('CODE')}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="code-slash-outline" size={24} color="#F59E0B" />
            </View>
            <Text style={styles.modeTitle}>Debug My Code</Text>
            <Text style={styles.modeDesc}>Error diagnostics, fixes & code advice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, { borderColor: '#10B981' }]}
            onPress={() => handleStartNewChat('SPEAKING')}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="chatbubbles-outline" size={24} color="#10B981" />
            </View>
            <Text style={styles.modeTitle}>Speak English</Text>
            <Text style={styles.modeDesc}>Fear-free dialogue & friendly feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeCard, { borderColor: '#8B5CF6' }]}
            onPress={() => handleStartNewChat('INTERVIEW')}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Ionicons name="briefcase-outline" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.modeTitle}>AI Interviewer</Text>
            <Text style={styles.modeDesc}>Technical & HR interview practice</Text>
          </TouchableOpacity>
        </View>

        {/* Personalized AI Study Suggestions (Section 62) */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="compass-outline" size={16} color="#F59E0B" />
              <Text style={styles.sectionHeader}>PERSONALIZED STUDY SUGGESTIONS</Text>
            </View>
            {suggestions.map((sugg) => (
              <View key={sugg.id} style={styles.suggCard}>
                <View style={styles.suggHeaderRow}>
                  <Text style={styles.suggHeadline}>{sugg.headline}</Text>
                  <View style={styles.suggTypeBadge}>
                    <Text style={styles.suggTypeText}>{sugg.suggested_focus}</Text>
                  </View>
                </View>
                <Text style={styles.suggReason}>{sugg.reason}</Text>
                <TouchableOpacity
                  style={styles.suggActionBtn}
                  onPress={() => {
                    if (sugg.action_type === 'PRACTICE_TASK') {
                      navigate('PracticeLinks');
                    } else if (sugg.action_type === 'STUDY_TOPIC' && sugg.course_id) {
                      navigate('CourseRoadmap', { courseId: sugg.course_id });
                    } else {
                      handleStartNewChat('SPEAKING');
                    }
                  }}
                >
                  <Text style={styles.suggActionBtnText}>{sugg.action_label}</Text>
                  <Ionicons name="arrow-forward" size={13} color="#0284C7" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Conversation History Section (Sections 11 & 42) */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="time-outline" size={16} color="#94A3B8" />
            <Text style={styles.sectionHeader}>SAVED CONVERSATIONS</Text>
          </View>

          {/* Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
            contentContainerStyle={styles.filterContainer}
          >
            {(['ALL', 'TUTOR', 'CODE', 'SPEAKING', 'INTERVIEW'] as (AIMode | 'ALL')[]).map((f) => {
              const active = selectedFilter === f;
              return (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setSelectedFilter(f)}
                >
                  <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                    {f}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {loading ? (
            <ActivityIndicator size="small" color="#0284C7" style={{ marginTop: 20 }} />
          ) : conversations.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={36} color="#475569" />
              <Text style={styles.emptyStateTitle}>No Conversations Yet</Text>
              <Text style={styles.emptyStateDesc}>
                Choose any mode above to start learning with your personalized AI tutor.
              </Text>
            </View>
          ) : (
            conversations.map((conv) => (
              <TouchableOpacity
                key={conv.id}
                style={styles.convCard}
                onPress={() => handleOpenConversation(conv)}
                activeOpacity={0.7}
              >
                <View style={styles.convLeft}>
                  <View style={styles.convModeBadge}>
                    <Text style={styles.convModeText}>{conv.mode}</Text>
                  </View>
                  <Text style={styles.convTitle} numberOfLines={1}>
                    {conv.title}
                  </Text>
                  <Text style={styles.convDate}>{formatDateLabel(conv.updated_at)}</Text>
                </View>

                <TouchableOpacity
                  style={styles.trashBtn}
                  onPress={(e) => handleDeleteConversation(conv.id, e)}
                  accessibilityLabel="Delete Conversation"
                >
                  <Ionicons name="trash-outline" size={16} color="#64748B" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1128',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    borderWidth: 1,
    borderColor: '#0284C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  contextTextCol: {
    flex: 1,
    marginRight: 10,
  },
  contextTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.6,
  },
  contextTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  contextAskBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  contextAskBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0A1128',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  modeCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  modeDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 10,
  },
  suggHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  suggHeadline: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 8,
  },
  suggTypeBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  suggTypeText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '700',
  },
  suggReason: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    marginBottom: 10,
  },
  suggActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  suggActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#38BDF8',
  },
  historySection: {
    marginTop: 8,
  },
  filterScroll: {
    marginBottom: 12,
  },
  filterContainer: {
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#0284C7',
  },
  filterChipText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    backgroundColor: '#1E293B',
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 10,
  },
  emptyStateDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
    marginBottom: 8,
  },
  convLeft: {
    flex: 1,
    marginRight: 10,
  },
  convModeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginBottom: 4,
  },
  convModeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#CBD5E1',
  },
  convTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  convDate: {
    fontSize: 11,
    color: '#64748B',
  },
  trashBtn: {
    padding: 6,
  },
});
