import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { aiService } from '../../services/ai/AIService';
import { aiRepository } from '../../repositories/AIRepository';
import {
  AISettings,
  ExplanationLevel,
  AILearningPreferences,
  AIProviderType,
  AIExecutionMode,
  AIExplanationStyle,
  AITeachingStyle,
} from '../../models/AIAssistant';

export const AIDataSettingsScreen: React.FC = () => {
  const { goBack } = useAppNavigation();
  const [settings, setSettings] = useState<AISettings>(aiService.getSettings());
  const [preferences, setPreferences] = useState<AILearningPreferences>({
    id: 'default',
    provider: 'AUTOMATIC',
    model: 'AUTOMATIC',
    mode: 'BALANCED',
    explanation_style: 'SIMPLE',
    teaching_style: 'GUIDE_ME',
    save_conversations: true,
    save_voice_transcripts: true,
    save_code_snapshots: true,
    send_code_to_ai: true,
    updated_at: new Date().toISOString(),
  });
  const [usage, setUsage] = useState<{ messageCount: number; speakingCount: number }>({
    messageCount: 0,
    speakingCount: 0,
  });

  const loadData = useCallback(async () => {
    try {
      const [currentUsage, currentPrefs] = await Promise.all([
        aiRepository.getTodayUsage(),
        aiRepository.getLearningPreferences(),
      ]);
      setUsage(currentUsage);
      setPreferences(currentPrefs);
      setSettings(aiService.getSettings());
    } catch (err) {
      console.warn('Failed to load AI settings data:', err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateSetting = (key: keyof AISettings, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    aiService.updateSettings({ [key]: value });
  };

  const updatePreference = async (key: keyof AILearningPreferences, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    await aiRepository.updateLearningPreferences({ [key]: value });
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear AI History',
      'This will delete all saved AI conversations, messages, and speaking records. Your courses and progress will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All History',
          style: 'destructive',
          onPress: async () => {
            await aiRepository.clearAllConversations();
            Alert.alert('History Cleared', 'All AI conversations have been removed.');
          },
        },
      ]
    );
  };

  return (
    <AppShell title="AI & Privacy Settings">
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Top Header Row with Back Button */}
        <View style={styles.headerBar}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={20} color="#94A3B8" />
          </TouchableOpacity>
          <Text style={styles.headerBarTitle}>AI Preferences & Privacy</Text>
        </View>

        {/* Daily Quota / Usage Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="speedometer-outline" size={18} color="#0284C7" />
            <Text style={styles.cardTitle}>Daily AI Usage Limit</Text>
          </View>
          <Text style={styles.cardDesc}>
            Protects against accidental excessive usage and maintains local responsiveness.
          </Text>

          <View style={styles.usageBarTrack}>
            <View
              style={[
                styles.usageBarFill,
                {
                  width: `${Math.min(
                    100,
                    (usage.messageCount / settings.daily_message_limit) * 100
                  )}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.usageText}>
            {usage.messageCount} / {settings.daily_message_limit} messages used today
          </Text>
        </View>

        {/* Master AI Toggle */}
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>AI Learning Assistant</Text>
              <Text style={styles.settingDesc}>
                Enable AI explanations, code help, and speaking partner.
              </Text>
            </View>
            <Switch
              value={settings.ai_enabled}
              onValueChange={(val) => updateSetting('ai_enabled', val)}
              trackColor={{ false: '#334155', true: '#0284C7' }}
              thumbColor={settings.ai_enabled ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* AI Provider & Architecture (Rules 25, 26, 27) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="hardware-chip-outline" size={18} color="#6366F1" />
            <Text style={styles.cardTitle}>AI Provider & Model Architecture</Text>
          </View>
          <Text style={styles.cardDesc}>
            Select your preferred AI routing. When set to Automatic, the backend dynamically routes queries to the optimal provider.
          </Text>

          <Text style={styles.subSectionTitle}>Provider Engine</Text>
          <View style={styles.pillRow}>
            {(['AUTOMATIC', 'OPENAI', 'GEMINI', 'LOCAL_OFFLINE'] as AIProviderType[]).map((prov) => (
              <TouchableOpacity
                key={prov}
                onPress={() => updatePreference('provider', prov)}
                style={[
                  styles.pillBtn,
                  preferences.provider === prov && styles.pillBtnActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillBtnText,
                    preferences.provider === prov && styles.pillBtnTextActive,
                  ]}
                >
                  {prov === 'AUTOMATIC' ? 'Automatic' : prov === 'LOCAL_OFFLINE' ? 'Local / Offline' : prov}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.subSectionTitle, { marginTop: 12 }]}>Execution Profile</Text>
          <View style={styles.pillRow}>
            {(['FAST', 'BALANCED', 'DEEP'] as AIExecutionMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => updatePreference('mode', m)}
                style={[
                  styles.pillBtn,
                  preferences.mode === m && styles.pillBtnActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillBtnText,
                    preferences.mode === m && styles.pillBtnTextActive,
                  ]}
                >
                  {m.charAt(0) + m.slice(1).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Personalized Teaching Style (Rules 66, 67) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="school-outline" size={18} color="#EC4899" />
            <Text style={styles.cardTitle}>Teaching & Explanation Style</Text>
          </View>
          <Text style={styles.cardDesc}>
            Customize how your AI Personal Teacher formats answers and guides problem solving.
          </Text>

          <Text style={styles.subSectionTitle}>Explanation Depth</Text>
          <View style={styles.pillRow}>
            {(['SIMPLE', 'NORMAL', 'TECHNICAL'] as AIExplanationStyle[]).map((style) => (
              <TouchableOpacity
                key={style}
                onPress={() => updatePreference('explanation_style', style)}
                style={[
                  styles.pillBtn,
                  preferences.explanation_style === style && styles.pillBtnActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillBtnText,
                    preferences.explanation_style === style && styles.pillBtnTextActive,
                  ]}
                >
                  {style === 'SIMPLE' ? 'Simple Analogy' : style === 'TECHNICAL' ? 'In-depth Technical' : 'Standard'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.subSectionTitle, { marginTop: 12 }]}>Pedagogical Guidance</Text>
          <View style={styles.pillRow}>
            {(['GUIDE_ME', 'DIRECT', 'INTERVIEW'] as AITeachingStyle[]).map((tStyle) => (
              <TouchableOpacity
                key={tStyle}
                onPress={() => updatePreference('teaching_style', tStyle)}
                style={[
                  styles.pillBtn,
                  preferences.teaching_style === tStyle && styles.pillBtnActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillBtnText,
                    preferences.teaching_style === tStyle && styles.pillBtnTextActive,
                  ]}
                >
                  {tStyle === 'GUIDE_ME' ? 'Guide Me (Hints)' : tStyle === 'DIRECT' ? 'Direct Solution' : 'Mock Interview'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Privacy & Context Section (Rules 32, 36) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
            <Text style={styles.cardTitle}>Context & Code Privacy Controls</Text>
          </View>
          <Text style={styles.cardDesc}>
            Granular controls over what data is shared or persisted locally. When Send Code is OFF, AI analyzes questions conceptually without receiving your code.
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Send Code to AI</Text>
              <Text style={styles.settingDesc}>
                Allows AI to inspect editor code, line numbers, and errors.
              </Text>
            </View>
            <Switch
              value={preferences.send_code_to_ai}
              onValueChange={(val) => updatePreference('send_code_to_ai', val)}
              trackColor={{ false: '#334155', true: '#10B981' }}
              thumbColor={preferences.send_code_to_ai ? '#FFFFFF' : '#94A3B8'}
            />
          </View>

          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 12 }]}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Save AI Conversations</Text>
              <Text style={styles.settingDesc}>
                Preserves chat session history in your local device SQLite vault.
              </Text>
            </View>
            <Switch
              value={preferences.save_conversations}
              onValueChange={(val) => updatePreference('save_conversations', val)}
              trackColor={{ false: '#334155', true: '#10B981' }}
              thumbColor={preferences.save_conversations ? '#FFFFFF' : '#94A3B8'}
            />
          </View>

          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 12 }]}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Save Code Snapshots</Text>
              <Text style={styles.settingDesc}>
                Saves a snapshot of active code alongside your debug conversations.
              </Text>
            </View>
            <Switch
              value={preferences.save_code_snapshots}
              onValueChange={(val) => updatePreference('save_code_snapshots', val)}
              trackColor={{ false: '#334155', true: '#10B981' }}
              thumbColor={preferences.save_code_snapshots ? '#FFFFFF' : '#94A3B8'}
            />
          </View>

          <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 12 }]}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Share Current Topic Context</Text>
              <Text style={styles.settingDesc}>
                Allows AI to know which course and topic you are viewing.
              </Text>
            </View>
            <Switch
              value={settings.share_course_context}
              onValueChange={(val) => updateSetting('share_course_context', val)}
              trackColor={{ false: '#334155', true: '#10B981' }}
              thumbColor={settings.share_course_context ? '#FFFFFF' : '#94A3B8'}
            />
          </View>
        </View>

        {/* Clear Data & History */}
        <View style={[styles.card, { borderColor: 'rgba(239, 68, 68, 0.25)' }]}>
          <View style={styles.cardHeaderRow}>
            <Ionicons name="trash-bin-outline" size={18} color="#EF4444" />
            <Text style={[styles.cardTitle, { color: '#EF4444' }]}>Clear AI Conversations</Text>
          </View>
          <Text style={styles.cardDesc}>
            Permanently wipe all stored AI messages, conversation logs, and speaking records.
          </Text>

          <TouchableOpacity style={styles.clearBtn} onPress={handleClearHistory}>
            <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
            <Text style={styles.clearBtnText}>Clear All AI Conversations</Text>
          </TouchableOpacity>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  backBtn: {
    padding: 6,
  },
  headerBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
    marginBottom: 12,
  },
  usageBarTrack: {
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  usageBarFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 4,
  },
  usageText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingTextCol: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 11,
    borderRadius: 8,
    marginTop: 6,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillBtnActive: {
    borderColor: '#0284C7',
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
  },
  pillBtnText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontWeight: '600',
  },
  pillBtnTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
});
