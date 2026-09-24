import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

interface CodeBlockProps {
  code: string;
  language?: string;
  output?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'python',
  output,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const lines = code.trim().split('\n');

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.langBadge}>
          <Text style={styles.langText}>{language.toUpperCase()}</Text>
        </View>

        <TouchableOpacity
          onPress={handleCopy}
          style={[styles.copyButton, copied && styles.copyButtonSuccess]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={copied ? 'checkmark' : 'copy-outline'}
            size={14}
            color={copied ? '#10B981' : '#94A3B8'}
          />
          <Text style={[styles.copyText, copied && styles.copyTextSuccess]}>
            {copied ? 'Copied!' : 'Copy'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.codeContainer}>
          <View style={styles.lineNumbers}>
            {lines.map((_, idx) => (
              <Text key={`line-${idx}`} style={styles.lineNumberText}>
                {idx + 1}
              </Text>
            ))}
          </View>

          <View style={styles.codeLines}>
            {lines.map((line, idx) => (
              <Text key={`code-${idx}`} style={styles.codeLineText}>
                {line || ' '}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      {output ? (
        <View style={styles.outputContainer}>
          <View style={styles.outputHeader}>
            <Ionicons name="terminal-outline" size={13} color="#94A3B8" />
            <Text style={styles.outputHeaderText}>TERMINAL OUTPUT</Text>
          </View>
          <Text style={styles.outputText}>{output}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    overflow: 'hidden',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  langBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
    backgroundColor: '#334155',
  },
  copyButtonSuccess: {
    backgroundColor: '#064E3B',
  },
  copyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  copyTextSuccess: {
    color: '#10B981',
  },
  scrollContent: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  codeContainer: {
    flexDirection: 'row',
  },
  lineNumbers: {
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
    marginRight: 14,
    alignItems: 'flex-end',
  },
  lineNumberText: {
    fontSize: 12,
    lineHeight: 20,
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeLines: {
    paddingRight: 20,
  },
  codeLineText: {
    fontSize: 12.5,
    lineHeight: 20,
    color: '#E2E8F0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  outputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#090D16',
    padding: 10,
    paddingHorizontal: 14,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  outputHeaderText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  outputText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#34D399',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
