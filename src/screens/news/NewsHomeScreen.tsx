import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppShell } from '../../components/navigation/AppShell';
import { NewsCategoryTabs } from '../../components/news/NewsCategoryTabs';
import { NewsArticleCard } from '../../components/news/NewsArticleCard';
import { NewsSearchBar } from '../../components/news/NewsSearchBar';
import { NewsOfflineBanner } from '../../components/news/NewsOfflineBanner';
import { useNewsViewModel } from '../../hooks/useNewsViewModel';
import { useAppNavigation } from '../../navigation/NavigationContext';
import { NewsArticle } from '../../models/News';
import { Colors } from '../../theme/colors';

export const NewsHomeScreen: React.FC = () => {
  const { navigate } = useAppNavigation();
  const {
    articles,
    selectedCategory,
    searchQuery,
    bookmarkedOnly,
    loading,
    refreshing,
    isOffline,
    stats,
    error,
    refresh,
    setCategory,
    setSearchQuery,
    toggleBookmarkedOnly,
    toggleBookmark,
    markAsRead,
    markAllAsRead,
  } = useNewsViewModel();

  const handleOpenArticle = (article: NewsArticle) => {
    markAsRead(article.id);
    navigate('NewsArticle', { articleId: article.id });
  };

  const renderEmptyState = () => {
    if (loading) return null;

    if (searchQuery.trim().length > 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No Articles Found</Text>
          <Text style={styles.emptySubtitle}>
            No updates matched "{searchQuery}". Try different keywords.
          </Text>
        </View>
      );
    }

    if (bookmarkedOnly) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={48} color="#FFB300" />
          <Text style={styles.emptyTitle}>No Saved Articles</Text>
          <Text style={styles.emptySubtitle}>
            Tap the star or bookmark icon on any article to save it for offline reading.
          </Text>
        </View>
      );
    }

    if (articles.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No News Available</Text>
          <Text style={styles.emptySubtitle}>
            {isOffline
              ? 'No news has been cached yet. Connect to the internet to load the latest updates.'
              : 'Pull down to refresh and fetch the latest technology updates.'}
          </Text>
          <TouchableOpacity
            style={styles.emptyRefreshButton}
            onPress={refresh}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.emptyRefreshText}>Refresh Updates</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <AppShell title="NEWS & UPDATES">
      <View style={styles.container}>
        {/* Top Adventure Banner */}
        <View style={styles.topBar}>
          <View style={styles.headlineRow}>
            <View>
              <Text style={styles.topPreTitle}>GRAND LINE GAZETTE</Text>
              <Text style={styles.topTitle}>Daily Tech & AI Updates</Text>
            </View>

            <View style={styles.topActions}>
              {stats.unread > 0 && (
                <TouchableOpacity
                  style={styles.markReadButton}
                  onPress={markAllAsRead}
                  activeOpacity={0.7}
                >
                  <Text style={styles.markReadText}>Mark read</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.refreshIconBtn}
                onPress={refresh}
                disabled={refreshing}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="refresh"
                  size={18}
                  color={refreshing ? '#94A3B8' : Colors.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats Pill Strip */}
          <View style={styles.statStrip}>
            <View style={styles.statChip}>
              <Ionicons name="newspaper-outline" size={12} color="#94A3B8" />
              <Text style={styles.statChipText}>{stats.total} Cached</Text>
            </View>
            <View style={styles.statChip}>
              <View style={[styles.statDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.statChipText}>{stats.unread} Unread</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="bookmark" size={12} color="#FFB300" />
              <Text style={styles.statChipText}>{stats.bookmarked} Saved</Text>
            </View>
          </View>
        </View>

        {/* Offline Banner */}
        <NewsOfflineBanner isOffline={isOffline} cachedCount={articles.length} />

        {/* Search Bar */}
        <NewsSearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* Category Tabs */}
        <NewsCategoryTabs
          selectedCategory={selectedCategory}
          bookmarkedOnly={bookmarkedOnly}
          onSelectCategory={setCategory}
          onToggleBookmarked={toggleBookmarkedOnly}
          bookmarkedCount={stats.bookmarked}
        />

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Reading Gazette Archives...</Text>
          </View>
        ) : (
          <FlatList
            data={articles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <NewsArticleCard
                article={item}
                onPress={() => handleOpenArticle(item)}
                onToggleBookmark={() => toggleBookmark(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refresh}
                colors={[Colors.primary, Colors.secondary]}
                tintColor={Colors.primary}
              />
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
  topBar: {
    backgroundColor: Colors.oceanDepths,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 179, 0, 0.2)',
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  topPreTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.secondary,
    letterSpacing: 1.2,
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  markReadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  refreshIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 179, 0, 0.3)',
  },
  statStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#CBD5E1',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  listContent: {
    paddingVertical: 12,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 6,
    maxWidth: 280,
  },
  emptyRefreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    marginTop: 18,
  },
  emptyRefreshText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
