import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Topic } from '../../models/Topic';
import { Colors } from '../../theme/colors';

interface TopicNavigationProps {
  topics: Topic[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  themeColor?: string;
}

export const TopicNavigation: React.FC<TopicNavigationProps> = ({
  topics,
  currentIndex,
  onSelectIndex,
  themeColor = Colors.primary,
}) => {
  if (topics.length === 0) return null;

  const currentTopic = topics[currentIndex] || topics[0];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < topics.length - 1;

  const handlePrev = () => {
    if (canGoPrev) {
      onSelectIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      onSelectIndex(currentIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsScroll}
      >
        {topics.map((t, idx) => {
          const isSelected = idx === currentIndex;
          const isCompleted = t.is_completed;

          return (
            <TouchableOpacity
              key={t.id}
              onPress={() => onSelectIndex(idx)}
              style={[
                styles.topicPill,
                isSelected && [styles.topicPillActive, { borderColor: themeColor }],
                isCompleted && !isSelected && styles.topicPillCompleted,
              ]}
              activeOpacity={0.7}
            >
              {isCompleted ? (
                <Ionicons name="checkmark-circle" size={13} color={Colors.success} />
              ) : (
                <View style={[styles.dotInactive, isSelected && { backgroundColor: themeColor }]} />
              )}
              <Text
                style={[
                  styles.pillText,
                  isSelected && [styles.pillTextActive, { color: themeColor }],
                  isCompleted && !isSelected && styles.pillTextCompleted,
                ]}
                numberOfLines={1}
              >
                {idx + 1}. {t.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.stepperBar}>
        <TouchableOpacity
          onPress={handlePrev}
          disabled={!canGoPrev}
          style={[styles.stepBtn, !canGoPrev && styles.stepBtnDisabled]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={16}
            color={canGoPrev ? '#1E293B' : '#CBD5E1'}
          />
          <Text style={[styles.stepBtnText, !canGoPrev && styles.stepBtnTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <View style={styles.stepInfoContainer}>
          <Text style={styles.stepCountText}>
            Topic {currentIndex + 1} of {topics.length}
          </Text>
          <Text style={styles.stepTopicTitle} numberOfLines={1}>
            {currentTopic.title}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleNext}
          disabled={!canGoNext}
          style={[styles.stepBtn, !canGoNext && styles.stepBtnDisabled]}
          activeOpacity={0.7}
        >
          <Text style={[styles.stepBtnText, !canGoNext && styles.stepBtnTextDisabled]}>
            Next
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={canGoNext ? '#1E293B' : '#CBD5E1'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  pillsScroll: {
    paddingVertical: 6,
    gap: 8,
  },
  topicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    maxWidth: 220,
  },
  topicPillActive: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
  },
  topicPillCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  dotInactive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  pillTextActive: {
    fontWeight: '800',
  },
  pillTextCompleted: {
    color: '#065F46',
  },
  stepperBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stepBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  stepBtnDisabled: {
    backgroundColor: '#F8FAFC',
  },
  stepBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  stepBtnTextDisabled: {
    color: '#CBD5E1',
  },
  stepInfoContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  stepCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  stepTopicTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
});
