import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { PracticeQuestionCard } from '../../components/practice/PracticeQuestionCard';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { practiceRepository } from '../../repositories/PracticeRepository';
import { PracticeCategory, PracticeQuestion } from '../../models/Practice';
import { Colors } from '../../theme/colors';

export const PracticeCategoryScreen: React.FC = () => {
  const { params, goBack, navigate } = useAppNavigation();
  const categoryId = params?.categoryId || 'python';
  const initialTopic = params?.topic;

  const [category, setCategory] = useState<PracticeCategory | null>(null);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic || 'ALL');
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [cat, topList, qs] = await Promise.all([
        practiceRepository.getCategoryById(categoryId),
        practiceRepository.getTopicsForCategory(categoryId),
        practiceRepository.getQuestions({
          categoryId,
          difficulty: selectedDifficulty,
          topic: selectedTopic,
          isBookmarked: bookmarkedOnly,
        }),
      ]);
      setCategory(cat);
      setTopics(topList);
      setQuestions(qs);
    } catch (err) {
      console.error('Failed to load category questions:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryId, selectedDifficulty, selectedTopic, bookmarkedOnly]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleToggleBookmark = async (qId: string) => {
    const nextState = await practiceRepository.toggleBookmark(qId);
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, is_bookmarked: nextState } : q))
    );
  };

  const handleOpenQuestion = (questionId: string) => {
    navigate('PracticeQuestion', { questionId, categoryId });
  };

  const renderHeader = () => {
    const isAllComplete =
      category &&
      category.total_questions! > 0 &&
      category.completed_questions === category.total_questions;

    return (
      <View style={styles.headerContainer}>
        {/* Back and category title row */}
        <View style={styles.topNavRow}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.catHeaderCol}>
            <Text style={styles.catHeaderTitle}>
              {category?.icon} {category?.name} Practice
            </Text>
            <Text style={styles.catHeaderSub}>
              {category?.completed_questions} / {category?.total_questions} Solved ({category?.progress_percentage || 0}%)
            </Text>
          </View>
        </View>

        {/* Category Complete Banner */}
        {isAllComplete && (
          <View style={styles.categoryCompleteBanner}>
            <Ionicons name="trophy" size={24} color={Colors.secondary} />
            <View style={styles.catCompleteTextCol}>
              <Text style={styles.catCompleteTitle}>🏆 CATEGORY COMPLETE</Text>
              <Text style={styles.catCompleteSub}>
                {category?.name} Practice: All {category?.total_questions} Questions Solved! Training Complete!
              </Text>
            </View>
          </View>
        )}

        {/* Filter Row 1: Difficulty */}
        <View style={styles.filterRow}>
          {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
            <TouchableOpacity
              key={diff}
              style={[
                styles.diffChip,
                selectedDifficulty === diff && styles.diffChipActive,
              ]}
              onPress={() => setSelectedDifficulty(diff)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.diffChipText,
                  selectedDifficulty === diff && styles.diffChipTextActive,
                ]}
              >
                {diff}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[styles.bookmarkChip, bookmarkedOnly && styles.bookmarkChipActive]}
            onPress={() => setBookmarkedOnly(!bookmarkedOnly)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={bookmarkedOnly ? 'star' : 'star-outline'}
              size={14}
              color={bookmarkedOnly ? '#FFFFFF' : '#D97706'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.bookmarkChipText,
                bookmarkedOnly && styles.bookmarkChipTextActive,
              ]}
            >
              Bookmarks
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filter Row 2: Topic Chips */}
        {topics.length > 0 && (
          <View style={styles.topicsScrollRow}>
            <TouchableOpacity
              style={[
                styles.topicChip,
                selectedTopic === 'ALL' && styles.topicChipActive,
              ]}
              onPress={() => setSelectedTopic('ALL')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.topicChipText,
                  selectedTopic === 'ALL' && styles.topicChipTextActive,
                ]}
              >
                All Topics
              </Text>
            </TouchableOpacity>

            {topics.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.topicChip, selectedTopic === t && styles.topicChipActive]}
                onPress={() => setSelectedTopic(t)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.topicChipText,
                    selectedTopic === t && styles.topicChipTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <AppShell title={`${category?.name || 'TRAINING'} PRACTICE`}>
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading challenges...</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          renderItem={({ item, index }) => (
            <PracticeQuestionCard
              question={item}
              index={index}
              onPress={() => handleOpenQuestion(item.id)}
              onToggleBookmark={() => handleToggleBookmark(item.id)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Questions Match Filter</Text>
              <Text style={styles.emptySub}>
                Try selecting "ALL" difficulty or clearing active topic filters.
              </Text>
            </View>
          }
        />
      )}
    </AppShell>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
    paddingBottom: 36,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  headerContainer: {
    marginBottom: 12,
  },
  topNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catHeaderCol: {
    flex: 1,
  },
  catHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  catHeaderSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  categoryCompleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  catCompleteTextCol: {
    flex: 1,
    marginLeft: 10,
  },
  catCompleteTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.secondary,
  },
  catCompleteSub: {
    fontSize: 11,
    color: '#E2E8F0',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  diffChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  diffChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  diffChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  diffChipTextActive: {
    color: '#FFFFFF',
  },
  bookmarkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginLeft: 'auto',
  },
  bookmarkChipActive: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  bookmarkChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
  },
  bookmarkChipTextActive: {
    color: '#FFFFFF',
  },
  topicsScrollRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  topicChip: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  topicChipActive: {
    backgroundColor: Colors.primary,
  },
  topicChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  topicChipTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
