import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { topicRepository } from '../../repositories/TopicRepository';
import { roadmapService } from '../../services/RoadmapService';
import { Course } from '../../models/Course';
import { RoadmapSearchResult, TopicStatusFilter } from '../../models/Search';
import { CourseIcon } from '../../components/roadmap/CourseIcon';
import { Colors } from '../../theme/colors';

export const TopicSearchScreen: React.FC = () => {
  const { goBack, navigate, params } = useAppNavigation();
  const initialQuery = params?.query || '';
  const initialCourseId = params?.courseId || 'ALL';

  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId);
  const [selectedStatus, setSelectedStatus] = useState<TopicStatusFilter>('ALL');
  const [courses, setCourses] = useState<Course[]>([]);
  const [results, setResults] = useState<RoadmapSearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load courses for filter pills
  useEffect(() => {
    roadmapService.getCourses().then(setCourses).catch(() => {});
  }, []);

  // Perform search
  const performSearch = useCallback(
    async (query: string, courseId: string, status: TopicStatusFilter) => {
      setLoading(true);
      try {
        const data = await topicRepository.searchTopics({
          query: query.trim(),
          courseId: courseId === 'ALL' ? undefined : courseId,
          status: status === 'ALL' ? undefined : status,
        });
        setResults(data);
      } catch (err) {
        console.error('Topic search failed:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Debounced input change
  const handleQueryChange = (text: string) => {
    setSearchQuery(text);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      performSearch(text, selectedCourseId, selectedStatus);
    }, 200);
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    performSearch(searchQuery, courseId, selectedStatus);
  };

  const handleSelectStatus = (status: TopicStatusFilter) => {
    setSelectedStatus(status);
    performSearch(searchQuery, selectedCourseId, status);
  };

  const clearSearch = () => {
    setSearchQuery('');
    performSearch('', selectedCourseId, selectedStatus);
  };

  // Initial load
  useEffect(() => {
    performSearch(initialQuery, selectedCourseId, selectedStatus);
  }, []);

  const handleOpenTopic = (result: RoadmapSearchResult) => {
    Keyboard.dismiss();
    navigate('ModuleDetails', {
      courseId: result.courseId,
      moduleId: result.moduleId,
    });
  };

  const renderItem = ({ item }: { item: RoadmapSearchResult }) => {
    const themeMeta = (item.courseTheme ? Colors.courseThemes[item.courseTheme] : undefined) || {
      primary: Colors.primary,
      secondary: Colors.secondary,
      bg: '#EFF6FF',
    };

    return (
      <TouchableOpacity
        style={styles.resultCard}
        onPress={() => handleOpenTopic(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.courseBadge, { backgroundColor: themeMeta.bg, borderColor: themeMeta.primary }]}>
            <CourseIcon courseId={item.courseId} size={14} color={themeMeta.primary} />
            <Text style={[styles.courseBadgeText, { color: themeMeta.primary }]}>
              {item.courseName}
            </Text>
          </View>
          <View style={[styles.statusBadge, item.isCompleted ? styles.completedBadge : styles.remainingBadge]}>
            <Ionicons
              name={item.isCompleted ? 'checkmark-circle' : 'radio-button-off'}
              size={12}
              color={item.isCompleted ? '#059669' : '#64748B'}
            />
            <Text style={[styles.statusText, item.isCompleted ? styles.completedText : styles.remainingText]}>
              {item.isCompleted ? 'Completed' : 'Available'}
            </Text>
          </View>
        </View>

        <Text style={styles.topicTitle}>{item.topicTitle}</Text>
        <Text style={styles.moduleBreadcrumb}>
          <Ionicons name="folder-outline" size={12} color="#64748B" /> Module: {item.moduleTitle}
        </Text>

        {item.topicDescription ? (
          <Text style={styles.topicDesc} numberOfLines={2}>
            {item.topicDescription}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Search Bar */}
      <View style={styles.searchBarContainer}>
        <TouchableOpacity style={styles.backButton} onPress={goBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Search topics, modules, concepts..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={handleQueryChange}
            autoFocus={true}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Row 1: Course Filter Chips */}
      <View style={styles.filterSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'ALL', name: 'All Courses' } as Course, ...courses]}
          keyExtractor={(c) => c.id}
          contentContainerStyle={styles.chipsScrollContent}
          renderItem={({ item }) => {
            const isSelected = selectedCourseId === item.id;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => handleSelectCourse(item.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Filter Row 2: Status Chips */}
      <View style={styles.statusFilterRow}>
        {(['ALL', 'COMPLETED', 'REMAINING'] as TopicStatusFilter[]).map((st) => {
          const isSel = selectedStatus === st;
          return (
            <TouchableOpacity
              key={st}
              style={[styles.statusChip, isSel && styles.statusChipSelected]}
              onPress={() => handleSelectStatus(st)}
              activeOpacity={0.7}
            >
              <Text style={[styles.statusChipText, isSel && styles.statusChipTextSelected]}>
                {st === 'ALL' ? 'All Status' : st === 'COMPLETED' ? 'Completed Only' : 'Remaining Only'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Results Header */}
      <View style={styles.resultsMetaRow}>
        <Text style={styles.resultsCountText}>
          {loading ? 'Searching roadmap...' : `${results.length} topics found`}
        </Text>
        {loading && <ActivityIndicator size="small" color={Colors.primary} />}
      </View>

      {/* Results List */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.topicId}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>No matching topics found</Text>
              <Text style={styles.emptySub}>
                Try searching for concepts like "Percentage", "Blood Relations", "Tenses", or "Self Introduction".
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchBarContainer: {
    backgroundColor: Colors.oceanDepths,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  chipsScrollContent: {
    paddingHorizontal: 12,
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipSelected: {
    backgroundColor: Colors.oceanDepths,
    borderColor: Colors.oceanDepths,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
  },
  statusFilterRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  statusChipTextSelected: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  resultsMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  resultsCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  listContent: {
    padding: 16,
    paddingTop: 4,
    gap: 12,
    paddingBottom: 40,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  courseBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  completedBadge: {
    backgroundColor: '#ECFDF5',
  },
  remainingBadge: {
    backgroundColor: '#F1F5F9',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  completedText: {
    color: '#059669',
  },
  remainingText: {
    color: '#64748B',
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  moduleBreadcrumb: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  topicDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#334155',
    marginTop: 14,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
});
