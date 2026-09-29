import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../theme/ThemeContext';

interface CodeEditorProps {
  code: string;
  onChangeCode: (code: string) => void;
  language: string;
  starterCode?: string;
  readOnly?: boolean;
  minHeight?: number;
  maxHeight?: number;
  activeLineNumber?: number;
  errorLineNumber?: number;
  breakpoints?: number[];
  onToggleBreakpoint?: (line: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChangeCode,
  language,
  starterCode,
  readOnly = false,
  minHeight = 240,
  maxHeight = 420,
  activeLineNumber,
  errorLineNumber,
  breakpoints = [],
  onToggleBreakpoint,
}) => {
  const { theme } = useTheme();
  const [fontSize, setFontSize] = useState<number>(13.5);
  const [copied, setCopied] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);

  // Line numbers calculation
  const lines = code.split('\n');
  const lineCount = Math.max(lines.length, 1);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (!starterCode) return;
    Alert.alert(
      'Reset Code',
      'Are you sure you want to discard changes and reset to the original starter code?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => onChangeCode(starterCode),
        },
      ]
    );
  };

  const handleClear = () => {
    Alert.alert('Clear Code', 'Clear all code in editor?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => onChangeCode('') },
    ]);
  };

  const handleInsertSnippet = (snippet: string) => {
    if (readOnly) return;
    onChangeCode(code + snippet);
  };

  const handleIndent = () => {
    if (readOnly) return;
    onChangeCode(code + '    ');
  };

  const toggleFontSize = () => {
    setFontSize((prev) => (prev === 13.5 ? 15 : prev === 15 ? 12 : 13.5));
  };

  // Keyboard shortcut pills for mobile coding
  const shortcuts =
    language.toLowerCase() === 'python'
      ? ['Tab', ':', '()', '[]', '{}', '"', "'", '=', '==', 'def ', 'return ', 'if ', 'else:', 'for ', 'in ']
      : language.toLowerCase() === 'sql'
      ? ['SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'DESC', 'AND', '=', '>=', '<=', ';']
      : ['Tab', '()', '[]', '{}', '=>', ';', '"', "'", '=', '==', 'const ', 'let ', 'return ', 'function '];

  return (
    <View style={styles.container}>
      {/* Editor Toolbar */}
      <View style={styles.toolbar}>
        <View style={styles.langBadge}>
          <View style={styles.langDot} />
          <Text style={styles.langText}>{language.toUpperCase()}</Text>
          <Text style={styles.lineCountText}>({lineCount} lines)</Text>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={toggleFontSize}
            activeOpacity={0.7}
            accessibilityLabel="Adjust Font Size"
          >
            <Text style={styles.toolBtnText}>
              A<Text style={{ fontSize: 10 }}>{fontSize === 15 ? '+' : fontSize === 12 ? '-' : '•'}</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolBtn}
            onPress={handleCopy}
            activeOpacity={0.7}
            accessibilityLabel="Copy Code"
          >
            <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color="#94A3B8" />
          </TouchableOpacity>

          {starterCode && !readOnly ? (
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={handleReset}
              activeOpacity={0.7}
              accessibilityLabel="Reset Starter Code"
            >
              <Ionicons name="refresh-outline" size={14} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}

          {!readOnly ? (
            <TouchableOpacity
              style={styles.toolBtn}
              onPress={handleClear}
              activeOpacity={0.7}
              accessibilityLabel="Clear Code"
            >
              <Ionicons name="trash-outline" size={14} color="#EF4444" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Code Editor Body */}
      <ScrollView
        style={[styles.editorScroll, { minHeight, maxHeight }]}
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator>
          <View style={styles.editorContentRow}>
            {/* Line Numbers Gutter */}
            <View style={styles.gutter}>
              {lineNumbers.map((num) => {
                const isActive = num === activeLineNumber;
                const isError = num === errorLineNumber;
                const isBp = breakpoints.includes(num);

                return (
                  <TouchableOpacity
                    key={num}
                    style={[
                      styles.gutterRow,
                      isActive && styles.activeGutterRow,
                      isError && styles.errorGutterRow,
                    ]}
                    onPress={() => onToggleBreakpoint?.(num)}
                    activeOpacity={onToggleBreakpoint ? 0.6 : 1}
                  >
                    {isBp ? (
                      <View style={styles.bpDot} />
                    ) : isActive ? (
                      <Text style={[styles.activePointerGutter, { fontSize: fontSize * 0.75 }]}>▶</Text>
                    ) : isError ? (
                      <Text style={[styles.errorPointerGutter, { fontSize: fontSize * 0.75 }]}>▲</Text>
                    ) : (
                      <View style={{ width: 10 }} />
                    )}
                    <Text
                      style={[
                        styles.lineNumber,
                        { fontSize, lineHeight: fontSize * 1.55 },
                        isActive && styles.activeLineNumber,
                        isError && styles.errorLineNumber,
                      ]}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Code Input Area */}
            <TextInput
              ref={inputRef}
              style={[
                styles.codeTextInput,
                {
                  fontSize,
                  lineHeight: fontSize * 1.55,
                },
              ]}
              value={code}
              onChangeText={onChangeCode}
              placeholder={readOnly ? '' : '# Write your solution here...'}
              placeholderTextColor="#64748B"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              editable={!readOnly}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </ScrollView>

      {/* Mobile Accessory / Shortcut Keyboard Bar */}
      {!readOnly && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.shortcutBar}
          contentContainerStyle={styles.shortcutContent}
        >
          {shortcuts.map((sc, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.shortcutKey, sc === 'Tab' && styles.tabKey]}
              onPress={() => (sc === 'Tab' ? handleIndent() : handleInsertSnippet(sc))}
              activeOpacity={0.7}
            >
              <Text style={[styles.shortcutKeyText, sc === 'Tab' && styles.tabKeyText]}>
                {sc}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    marginVertical: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
  },
  langText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  lineCountText: {
    color: '#64748B',
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  editorScroll: {
    backgroundColor: '#0F172A',
  },
  editorContentRow: {
    flexDirection: 'row',
    minWidth: '100%',
    paddingVertical: 10,
  },
  gutter: {
    paddingLeft: 6,
    paddingRight: 8,
    borderRightWidth: 1,
    borderRightColor: '#1E293B',
    alignItems: 'flex-end',
    backgroundColor: '#0F172A',
  },
  gutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeGutterRow: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 4,
  },
  errorGutterRow: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 4,
  },
  bpDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  activePointerGutter: {
    color: '#10B981',
    fontWeight: '800',
  },
  errorPointerGutter: {
    color: '#EF4444',
    fontWeight: '800',
  },
  lineNumber: {
    color: '#475569',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  activeLineNumber: {
    color: '#10B981',
    fontWeight: '700',
  },
  errorLineNumber: {
    color: '#EF4444',
    fontWeight: '700',
  },
  codeTextInput: {
    flex: 1,
    minWidth: 500,
    paddingHorizontal: 12,
    paddingVertical: 0,
    color: '#E2E8F0',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  shortcutBar: {
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingVertical: 6,
  },
  shortcutContent: {
    paddingHorizontal: 8,
    gap: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shortcutKey: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  shortcutKeyText: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  tabKey: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  tabKeyText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
