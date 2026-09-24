import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../components/navigation/AppShell';
import { useAppNavigation } from '../navigation/NavigationContext';
import { dashboardService, NoteItemWithContext } from '../services/DashboardService';
import { formatDate } from '../utils/dateUtils';
import { Colors } from '../theme/colors';

export const NotesScreen: React.FC = () => {
  const { navigate } = useAppNavigation();

  const [notes, setNotes] = useState<NoteItemWithContext[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNotes = useCallback(async (query?: string) => {
    try {
      const data = await dashboardService.searchNotes(query);
      setNotes(data);
    } catch (err) {
      console.error('Failed to query notes from SQLite:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes(searchQuery);
  }, [fetchNotes, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotes(searchQuery);
  };

  const handleNotePress = (note: NoteItemWithContext) => {
    if (note.module_id) {
      navigate('ModuleDetails', {
        courseId: note.course_id,
        moduleId: note.module_id,
      });
    } else {
      navigate('CourseRoadmap', {
        courseId: note.course_id,
      });
    }
  };

  return (
    <AppShell title="MY NOTES">
      <View style={styles.container}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes, course, module..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Searching SQLite Study Journal...</Text>
          </View>
        ) : (
          <FlatList
            data={notes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.noteCard}
                activeOpacity={0.8}
                onPress={() => handleNotePress(item)}
              >
                <View style={styles.noteTopRow}>
                  <View style={styles.courseChip}>
                    <Ionicons name="boat-outline" size={12} color={Colors.primary} />
                    <Text style={styles.courseChipText}>{item.course_name}</Text>
                  </View>
                  <Text style={styles.noteDateText}>
                    {formatDate(item.updated_at || item.created_at)}
                  </Text>
                </View>

                <Text style={styles.moduleTitleText}>{item.module_title}</Text>

                <Text style={styles.noteExcerptText} numberOfLines={3}>
                  {item.note_text}
                </Text>

                <View style={styles.noteCardFooter}>
                  <Text style={styles.jumpHint}>Tap to open learning workspace</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="journal-outline" size={40} color={Colors.secondary} />
                </View>
                <Text style={styles.emptyTitle}>
                  {searchQuery.trim().length > 0 ? 'No Matching Notes' : 'No Notes Yet'}
                </Text>
                <Text style={styles.emptySub}>
                  {searchQuery.trim().length > 0
                    ? `No study notes matched "${searchQuery}".`
                    : 'Write notes during module learning to log key insights and code snippets.'}
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => navigate('Courses')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.exploreButtonText}>Explore Courses</Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
  noteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noteTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  courseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  courseChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
    marginLeft: 4,
  },
  noteDateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  moduleTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  noteExcerptText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  noteCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  jumpHint: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 54,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
