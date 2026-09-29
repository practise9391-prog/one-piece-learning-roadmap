import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../theme/ThemeContext';
import { useAppNavigation } from '../../navigation/NavigationContext';

interface CodeBlockProps {
  code: string;
  language?: string;
  output?: string;
  enableReveal?: boolean;
  enableTryExample?: boolean;
  topicTitle?: string;
  courseId?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'python',
  output,
  enableReveal = false,
  enableTryExample = true,
  topicTitle,
  courseId,
}) => {
  const { navigate } = useAppNavigation();
  const { reducedMotion } = useTheme();
  const [copied, setCopied] = useState<boolean>(false);
  const lines = code.trim().split('\n');

  // If reveal mode is on and not reduced motion, start revealing lines
  const [revealedCount, setRevealedCount] = useState<number>(
    enableReveal && !reducedMotion ? 1 : lines.length
  );
  const [isRevealing, setIsRevealing] = useState<boolean>(
    enableReveal && !reducedMotion && lines.length > 1
  );

  useEffect(() => {
    if (isRevealing && revealedCount < lines.length) {
      const timer = setTimeout(() => {
        setRevealedCount((prev) => prev + 1);
      }, 120);
      return () => clearTimeout(timer);
    } else if (revealedCount >= lines.length) {
      setIsRevealing(false);
    }
  }, [isRevealing, lines.length, revealedCount]);

  const handleShowAll = () => {
    setIsRevealing(false);
    setRevealedCount(lines.length);
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.langBadge}>
          <Text style={styles.langText}>{language.toUpperCase()}</Text>
        </View>

        <View style={styles.actionsRow}>
          {isRevealing && (
            <TouchableOpacity
              onPress={handleShowAll}
              style={styles.revealButton}
              activeOpacity={0.7}
              accessibilityLabel="Show all code lines"
            >
              <Ionicons name="eye-outline" size={13} color="#38BDF8" />
              <Text style={styles.revealText}>Show All</Text>
            </TouchableOpacity>
          )}

          {enableTryExample && (
            <TouchableOpacity
              onPress={() =>
                navigate('CodeWorkspace', {
                  code,
                  language,
                  title: topicTitle || `${language.toUpperCase()} Example`,
                  mode: 'LEARNING',
                  courseId,
                })
              }
              style={styles.tryBtn}
              activeOpacity={0.7}
              accessibilityLabel="Try This Example in Code Workspace"
            >
              <Ionicons name="terminal-outline" size={13} color="#10B981" />
              <Text style={styles.tryBtnText}>Try in Debugger</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleCopy}
            style={[styles.copyButton, copied && styles.copyButtonSuccess]}
            activeOpacity={0.7}
            accessibilityLabel="Copy code to clipboard"
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
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.codeScroll}>
        <View style={styles.codeContent}>
          {lines.slice(0, revealedCount).map((line, idx) => (
            <View key={`line-${idx}`} style={styles.lineRow}>
              <Text style={styles.lineNumber}>{idx + 1}</Text>
              <Text style={styles.codeLine} selectable>
                {line}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {output && (
        <View style={styles.outputBox}>
          <View style={styles.outputHeader}>
            <Ionicons name="terminal-outline" size={14} color="#64748B" />
            <Text style={styles.outputTitle}>Output</Text>
          </View>
          <Text style={styles.outputText} selectable>
            {output}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  langBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  langText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  revealText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  tryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  tryBtnText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  copyButtonSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  copyText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  copyTextSuccess: {
    color: '#10B981',
  },
  codeScroll: {
    padding: 12,
  },
  codeContent: {
    minWidth: '100%',
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  lineNumber: {
    color: '#475569',
    fontSize: 12,
    fontFamily: 'monospace',
    width: 28,
    textAlign: 'right',
    marginRight: 12,
  },
  codeLine: {
    color: '#F8FAFC',
    fontSize: 12.5,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  outputBox: {
    backgroundColor: '#080E21',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    padding: 10,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  outputTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  outputText: {
    color: '#34D399',
    fontSize: 11.5,
    fontFamily: 'monospace',
  },
});
