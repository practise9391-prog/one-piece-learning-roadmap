import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { PracticeCategoryCard } from '../../components/practice/PracticeCategoryCard';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { practiceRepository, PracticeStatistics } from '../../repositories/PracticeRepository';
import { PracticeCategory, PracticeQuestion } from '../../models/Practice';
import { formatDate } from '../../utils/dateUtils';
import { Colors } from '../../theme/colors';

export const PracticeHomeScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  const [categories, setCategories] = useState<PracticeCategory[]>([]);
  const [stats, setStats] = useState<PracticeStatistics | null>(null);
  const [continueItem, setContinueItem] = useState<{
    question: PracticeQuestion;
    category: PracticeCategory;
    currentIndex: number;
    totalInCategory: number;
  } | null>(null);
  const [recentPractice, setRecentPractice] = useState<{
    question: PracticeQuestion;
    categoryName: string;
    categoryIcon: string;
    lastActionAt: string;
    isCompleted: boolean;
  }[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<PracticeQuestion[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      const [cats, st, cont, rec] = await Promise.all([
        practiceRepository.getCategories(),
        practiceRepository.getPracticeStatistics(),
        practiceRepository.getContinuePracticeQuestion(),
        practiceRepository.getRecentPractice(5),
      ]);
      setCategories(cats);
      setStats(st);
      setContinueItem(cont);
      setRecentPractice(rec);
    } catch (err) {
      console.error('Failed to load practice data from SQLite:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Search & Filter
  useEffect(() => {
    if (searchQuery.trim().length > 0 || selectedDifficulty !== 'ALL' || bookmarkedOnly) {
      practiceRepository
        .getQuestions({
          searchQuery,
          difficulty: selectedDifficulty,
          isBookmarked: bookmarkedOnly,
        })
        .then(setSearchResults)
        .catch(() => {});
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedDifficulty, bookmarkedOnly]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenCategory = (categoryId: string) => {
    navigate('PracticeCategory', { categoryId });
  };

  const handleOpenQuestion = (questionId: string, categoryId: string) => {
    navigate('PracticeQuestion', { questionId, categoryId });
  };

  const isSearching = searchQuery.trim().length > 0 || selectedDifficulty !== 'ALL' || bookmarkedOnly;

  return (
    <AppShell title="PRACTICE HUB">
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Opening Grand Line Training Deck...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        >
          {/* 1. HERO BANNER */}
          <View style={styles.heroBanner}>
            <View style={styles.heroTopRow}>
              <View style={styles.swordCircle}>
                <Ionicons name="flash" size={24} color={Colors.secondary} />
              </View>
              <View style={styles.heroTextCol}>
                <Text style={styles.heroPreTitle}>TRAINING DECK</Text>
                <Text style={styles.heroTitle}>PRACTICE HUB</Text>
              </View>
            </View>
            <Text style={styles.heroQuote}>
              "Sharpen your skills. Solve coding, DSA, SQL, and aptitude challenges."
            </Text>

            {/* Quick Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{stats?.totalSolved || 0}</Text>
                <Text style={styles.statLbl}>QUESTIONS SOLVED</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: Colors.secondary }]}>
                  {stats?.accuracy || 100}%
                </Text>
                <Text style={styles.statLbl}>ACCURACY</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statVal}>
                  {stats?.totalSolved || 0} / {stats?.totalQuestions || 0}
                </Text>
                <Text style={styles.statLbl}>COMPLETED</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: '#F97316' }]}>
                  {stats?.practiceStreak || 0}d
                </Text>
                <Text style={styles.statLbl}>STREAK</Text>
              </View>
            </View>
          </View>

          {/* 2. CONTINUE PRACTICE CARD */}
          {continueItem && !isSearching && (
            <TouchableOpacity
              style={styles.continueCard}
              activeOpacity={0.85}
              onPress={() =>
                handleOpenQuestion(continueItem.question.id, continueItem.category.id)
              }
            >
              <View style={styles.continueHeader}>
                <View style={styles.flameCircle}>
                  <Ionicons name="flame" size={22} color="#EA580C" />
                </View>
                <View style={styles.continueTextCol}>
                  <Text style={styles.continuePre}>CONTINUE PRACTICE</Text>
                  <Text style={styles.continueTitle}>{continueItem.question.title}</Text>
                  <Text style={styles.continueSub}>
                    {continueItem.category.name} • {continueItem.question.topic} (Q {continueItem.currentIndex} of {continueItem.totalInCategory})
                  </Text>
                </View>
                <View style={styles.continueBtn}>
                  <Text style={styles.continueBtnText}>RESUME</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 4 }} />
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* 3. SEARCH & FILTERS */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search practice questions, topics, code..."
                placeholderTextColor="#94A3B8"
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Chips */}
            <View style={styles.filterRow}>
              {['ALL', 'EASY', 'MEDIUM', 'HARD'].map((diff) => (
                <TouchableOpacity
                  key={diff}
                  style={[styles.filterChip, selectedDifficulty === diff && styles.filterChipActive]}
                  onPress={() => setSelectedDifficulty(diff)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedDifficulty === diff && styles.filterChipTextActive,
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
          </View>

          {/* 4. SEARCH RESULTS (IF SEARCHING) */}
          {isSearching ? (
            <View style={styles.resultsContainer}>
              <Text style={styles.sectionTitle}>
                SEARCH RESULTS ({searchResults.length})
              </Text>

              {searchResults.length > 0 ? (
                searchResults.map((q, idx) => (
                  <TouchableOpacity
                    key={q.id}
                    style={styles.resultItem}
                    activeOpacity={0.8}
                    onPress={() => handleOpenQuestion(q.id, q.category_id)}
                  >
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultCat}>{q.category_id.toUpperCase()}</Text>
                      <View style={styles.resultDiff}>
                        <Text style={styles.resultDiffText}>{q.difficulty}</Text>
                      </View>
                    </View>
                    <Text style={styles.resultTitle}>{q.title}</Text>
                    <Text style={styles.resultTopic}>Topic: {q.topic}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyBox}>
                  <Ionicons name="search-outline" size={36} color="#94A3B8" />
                  <Text style={styles.emptyTitle}>No Matching Challenges</Text>
                  <Text style={styles.emptySub}>Try adjusting your search query or filter tags.</Text>
                </View>
              )}
            </View>
          ) : (
            <>
              {/* 5. TRAINING CATEGORIES */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>CHOOSE YOUR TRAINING</Text>
                <Text style={styles.sectionSubtitle}>10 Core Disciplines</Text>
              </View>

              {categories.map((cat) => (
                <PracticeCategoryCard
                  key={cat.id}
                  category={cat}
                  onPress={() => handleOpenCategory(cat.id)}
                />
              ))}

              {/* 6. RECENT PRACTICE */}
              {recentPractice.length > 0 && (
                <View style={styles.recentSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>RECENT PRACTICE</Text>
                  </View>

                  {recentPractice.map((item) => (
                    <TouchableOpacity
                      key={item.question.id}
                      style={styles.recentItem}
                      activeOpacity={0.8}
                      onPress={() =>
                        handleOpenQuestion(item.question.id, item.question.category_id)
                      }
                    >
                      <View style={styles.recentIconBox}>
                        <Ionicons
                          name={item.isCompleted ? 'checkmark-circle' : 'time-outline'}
                          size={20}
                          color={item.isCompleted ? Colors.success : Colors.primary}
                        />
                      </View>
                      <View style={styles.recentTextCol}>
                        <Text style={styles.recentCatText}>
                          {item.categoryName} • {item.question.topic}
                        </Text>
                        <Text style={styles.recentTitleText}>{item.question.title}</Text>
                      </View>
                      <Text style={styles.recentDateText}>{formatDate(item.lastActionAt)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 36,
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
  heroBanner: {
    backgroundColor: Colors.oceanDepths,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.25)',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  swordCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 179, 0, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.4)',
  },
  heroTextCol: {
    flex: 1,
  },
  heroPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  heroQuote: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
    marginBottom: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statLbl: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  continueCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.3)',
  },
  continueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flameCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(234, 88, 12, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  continueTextCol: {
    flex: 1,
  },
  continuePre: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F97316',
    letterSpacing: 0.8,
  },
  continueTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  continueSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EA580C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  searchSection: {
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 4,
  },
  resultItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  resultCat: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  resultDiff: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  resultDiffText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  resultTopic: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
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
    marginTop: 4,
  },
  recentSection: {
    marginTop: 16,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recentIconBox: {
    marginRight: 10,
  },
  recentTextCol: {
    flex: 1,
  },
  recentCatText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
    textTransform: 'uppercase',
  },
  recentTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  recentDateText: {
    fontSize: 10,
    color: '#94A3B8',
  },
});
