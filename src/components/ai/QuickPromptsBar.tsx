import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { AIMode } from '../../models/AIAssistant';

interface QuickPromptsBarProps {
  mode: AIMode;
  courseId?: string | null;
  onSelectPrompt: (prompt: string) => void;
}

export const QuickPromptsBar: React.FC<QuickPromptsBarProps> = ({
  mode,
  courseId,
  onSelectPrompt,
}) => {
  const getPrompts = (): string[] => {
    if (mode === 'SPEAKING') {
      return [
        'Correct my sentence',
        'Make it more natural',
        'Give me better vocabulary',
        'Ask me a follow-up question',
        'How would a native speaker say this?',
      ];
    }

    if (mode === 'INTERVIEW') {
      return [
        'Ask me a technical question',
        'Critique my answer',
        'How can I structure this with STAR?',
        'Give me an improved sample response',
        'What follow-up would an interviewer ask?',
      ];
    }

    if (mode === 'CODE') {
      return [
        'Explain this code line by line',
        'Find any potential bugs or edge cases',
        'Optimize time and space complexity',
        'Add clean comments and docstrings',
        'Show an alternative approach',
      ];
    }

    if (courseId === 'dsa') {
      return [
        'Explain the intuition simply',
        'Show the brute-force approach',
        'Explain the optimal approach',
        'Give me a progressive hint',
        'Analyze Big-O time and space',
      ];
    }

    if (courseId === 'sql') {
      return [
        'Explain this query with an example table',
        'Difference between WHERE and HAVING',
        'How does INNER vs LEFT JOIN work here?',
        'Give me a practice SQL task',
      ];
    }

    // Default Tutor Prompts
    return [
      'Explain this simply',
      'Give me a real-life example',
      'Show a code example',
      'What common mistakes should I avoid?',
      'Give me a practice challenge',
    ];
  };

  const prompts = getPrompts();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {prompts.map((prompt, idx) => (
        <TouchableOpacity
          key={`qp_${idx}`}
          style={styles.chip}
          onPress={() => onSelectPrompt(prompt)}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText}>{prompt}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 40,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  contentContainer: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
});
