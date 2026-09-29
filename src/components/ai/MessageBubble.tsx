import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { AIMessage } from '../../models/AIAssistant';
import { CorrectionCard } from './CorrectionCard';

interface MessageBubbleProps {
  message: AIMessage;
  onSaveToNotes?: (content: string) => void;
  onQuickAction?: (actionPrompt: string) => void;
  onRunCode?: (codeSnippet: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSaveToNotes,
  onQuickAction,
  onRunCode,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const isUser = message.role === 'USER';

  const handleCopy = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      Alert.alert('Copy Failed', 'Unable to copy text to clipboard.');
    }
  };

  const codeBlocks: string[] = [];
  const textWithoutCode = message.content.replace(/```(?:[a-zA-Z]*\n)?([\s\S]*?)```/g, (_, code) => {
    codeBlocks.push(code.trim());
    return `__CODE_BLOCK_${codeBlocks.length - 1}__`;
  });

  const correction = message.metadata?.correction;
  const errorDetails = message.metadata?.error_details;
  const hintLevel = message.metadata?.hint_level;

  return (
    <View style={[styles.bubbleWrapper, isUser ? styles.userWrapper : styles.assistantWrapper]}>
      {/* Sender Avatar & Label */}
      <View style={[styles.headerRow, isUser && styles.userHeaderRow]}>
        <View style={[styles.avatarBadge, isUser ? styles.userAvatar : styles.aiAvatar]}>
          <Ionicons
            name={isUser ? 'person' : 'sparkles'}
            size={13}
            color={isUser ? '#0284C7' : '#F59E0B'}
          />
        </View>
        <Text style={styles.senderName}>{isUser ? 'You' : 'AI Learning Assistant'}</Text>
        {hintLevel && (
          <View style={styles.hintBadge}>
            <Text style={styles.hintBadgeText}>HINT {hintLevel}</Text>
          </View>
        )}
      </View>

      {/* Main Message Container */}
      <View style={[styles.container, isUser ? styles.userBubble : styles.assistantBubble]}>
        {/* Debugging / Error Breakdown Card (Section 16) */}
        {errorDetails && (
          <View style={styles.errorDetailsCard}>
            <View style={styles.errorHeader}>
              <Ionicons name="bug" size={16} color="#EF4444" />
              <Text style={styles.errorHeaderTitle}>Error Analysis</Text>
            </View>
            <Text style={styles.errorSectionTitle}>What Happened:</Text>
            <Text style={styles.errorBodyText}>{errorDetails.what_happened}</Text>

            <Text style={styles.errorSectionTitle}>Where & Why:</Text>
            <Text style={styles.errorBodyText}>{errorDetails.where} — {errorDetails.why}</Text>

            <Text style={styles.errorSectionTitle}>How to Fix:</Text>
            <Text style={styles.errorBodyText}>{errorDetails.how_to_fix}</Text>

            {errorDetails.corrected_code && (
              <View style={styles.suggestedCodeBox}>
                <Text style={styles.suggestedCodeHeader}>AI Suggested Fix:</Text>
                <Text style={styles.codeText}>{errorDetails.corrected_code}</Text>
              </View>
            )}

            <Text style={styles.errorSectionTitle}>Prevention Tip:</Text>
            <Text style={styles.errorBodyText}>{errorDetails.prevention}</Text>
          </View>
        )}

        {/* Structured English Correction Card (Section 25) */}
        {correction && <CorrectionCard correction={correction} />}

        {/* Main Text Content */}
        {textWithoutCode.split(/(__CODE_BLOCK_\d+__)/).map((segment, idx) => {
          const match = segment.match(/__CODE_BLOCK_(\d+)__/);
          if (match) {
            const blockIdx = parseInt(match[1], 10);
            const code = codeBlocks[blockIdx];
            return (
              <View key={`code_${idx}`} style={styles.codeContainer}>
                <View style={styles.codeTopBar}>
                  <Text style={styles.codeLangText}>Code Snippet</Text>
                  <View style={styles.codeActions}>
                    <TouchableOpacity
                      style={styles.codeActionBtn}
                      onPress={() => handleCopy(code)}
                    >
                      <Ionicons name="copy-outline" size={13} color="#CBD5E1" />
                      <Text style={styles.codeActionText}>Copy</Text>
                    </TouchableOpacity>
                    {onRunCode && (
                      <TouchableOpacity
                        style={[styles.codeActionBtn, styles.runCodeBtn]}
                        onPress={() => onRunCode(code)}
                      >
                        <Ionicons name="play" size={13} color="#10B981" />
                        <Text style={[styles.codeActionText, { color: '#10B981' }]}>Run Code</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
                <Text style={styles.codeText}>{code}</Text>
              </View>
            );
          }

          if (!segment.trim()) return null;

          return (
            <Text
              key={`text_${idx}`}
              style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}
            >
              {segment}
            </Text>
          );
        })}

        {/* AI Action Toolbar (Section 37) */}
        {!isUser && (
          <View style={styles.actionToolbar}>
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={() => handleCopy(message.content)}
              accessibilityLabel="Copy response"
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={14}
                color={copied ? '#10B981' : '#94A3B8'}
              />
              <Text style={[styles.toolBtnText, copied && { color: '#10B981' }]}>
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>

            {onSaveToNotes && (
              <TouchableOpacity
                style={styles.toolBtn}
                onPress={() => onSaveToNotes(message.content)}
                accessibilityLabel="Save to Notes"
              >
                <Ionicons name="bookmark-outline" size={14} color="#94A3B8" />
                <Text style={styles.toolBtnText}>Save to Notes</Text>
              </TouchableOpacity>
            )}

            {onQuickAction && (
              <>
                <TouchableOpacity
                  style={styles.toolBtn}
                  onPress={() => onQuickAction('Can you explain this with a real-life example?')}
                >
                  <Ionicons name="bulb-outline" size={14} color="#F59E0B" />
                  <Text style={styles.toolBtnText}>Example</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toolBtn}
                  onPress={() => onQuickAction('Can you simplify this explanation further?')}
                >
                  <Ionicons name="arrow-down-circle-outline" size={14} color="#0284C7" />
                  <Text style={styles.toolBtnText}>Simplify</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.toolBtn}
                  onPress={() => onQuickAction('Give me a practice question on this topic.')}
                >
                  <Ionicons name="help-circle-outline" size={14} color="#8B5CF6" />
                  <Text style={styles.toolBtnText}>Practice</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleWrapper: {
    marginVertical: 7,
    paddingHorizontal: 12,
  },
  userWrapper: {
    alignItems: 'flex-end',
  },
  assistantWrapper: {
    alignItems: 'flex-start',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  userHeaderRow: {
    flexDirection: 'row-reverse',
  },
  avatarBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  aiAvatar: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  senderName: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  hintBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  hintBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  container: {
    maxWidth: '92%',
    borderRadius: 14,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#0284C7',
    borderBottomRightRadius: 3,
  },
  assistantBubble: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomLeftRadius: 3,
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#E2E8F0',
  },
  codeContainer: {
    marginVertical: 8,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  codeTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  codeLangText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  codeActions: {
    flexDirection: 'row',
    gap: 10,
  },
  codeActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  runCodeBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeActionText: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 12.5,
    color: '#38BDF8',
    padding: 10,
    lineHeight: 18,
  },
  errorDetailsCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  errorHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EF4444',
  },
  errorSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F87171',
    marginTop: 4,
  },
  errorBodyText: {
    fontSize: 12.5,
    color: '#E2E8F0',
    lineHeight: 17,
  },
  suggestedCodeBox: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    padding: 6,
    marginVertical: 4,
  },
  suggestedCodeHeader: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700',
    marginBottom: 2,
  },
  actionToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  toolBtnText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
