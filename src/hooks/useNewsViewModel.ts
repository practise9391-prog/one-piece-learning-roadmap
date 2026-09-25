import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsArticle, NewsCategory, NewsStats } from '../models/News';
import { newsRepository } from '../repositories/NewsRepository';
import { newsService } from '../services/news/NewsService';

export interface UseNewsViewModelReturn {
  articles: NewsArticle[];
  selectedCategory: NewsCategory;
  searchQuery: string;
  bookmarkedOnly: boolean;
  loading: boolean;
  refreshing: boolean;
  isOffline: boolean;
  stats: NewsStats;
  error: string | null;
  refresh: () => Promise<void>;
  setCategory: (category: NewsCategory) => void;
  setSearchQuery: (query: string) => void;
  toggleBookmarkedOnly: () => void;
  toggleBookmark: (id: string) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useNewsViewModel(): UseNewsViewModelReturn {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [stats, setStats] = useState<NewsStats>({ total: 0, unread: 0, bookmarked: 0 });
  const [error, setError] = useState<string | null>(null);

  const isRefreshingRef = useRef<boolean>(false);

  // Load articles from local SQLite cache
  const loadCachedArticles = useCallback(async () => {
    try {
      const [fetchedArticles, fetchedStats] = await Promise.all([
        newsRepository.getArticles({
          category: selectedCategory,
          bookmarkedOnly,
          search: searchQuery,
          limit: 100,
        }),
        newsRepository.getStats(),
      ]);

      setArticles(fetchedArticles);
      setStats(fetchedStats);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load news from SQLite:', err);
      setError('Could not access local news storage.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, bookmarkedOnly, searchQuery]);

  // Online refresh orchestrator
  const refresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setRefreshing(true);
    setError(null);

    try {
      const { articles: remoteArticles, errorCount } = await newsService.fetchAllSources();

      if (remoteArticles.length > 0) {
        await newsRepository.saveArticles(remoteArticles);
        setIsOffline(false);
      } else if (errorCount > 0) {
        setIsOffline(true);
      }
    } catch (netErr) {
      console.log('Network unreachable, falling back to local SQLite cache:', netErr);
      setIsOffline(true);
    } finally {
      await loadCachedArticles();
      isRefreshingRef.current = false;
    }
  }, [loadCachedArticles]);

  useEffect(() => {
    loadCachedArticles();
  }, [loadCachedArticles]);

  const handleCategoryChange = (category: NewsCategory) => {
    setSelectedCategory(category);
    if (bookmarkedOnly) {
      setBookmarkedOnly(false);
    }
  };

  const handleToggleBookmarkedOnly = () => {
    setBookmarkedOnly((prev) => !prev);
  };

  const handleToggleBookmark = async (id: string) => {
    const isBookmarked = await newsRepository.toggleBookmark(id);
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_bookmarked: isBookmarked } : a))
    );
    setStats((prev) => ({
      ...prev,
      bookmarked: isBookmarked ? prev.bookmarked + 1 : Math.max(0, prev.bookmarked - 1),
    }));
  };

  const handleMarkAsRead = async (id: string) => {
    await newsRepository.markAsRead(id);
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
    );
    setStats((prev) => ({
      ...prev,
      unread: Math.max(0, prev.unread - 1),
    }));
  };

  const handleMarkAllAsRead = async () => {
    await newsRepository.markAllAsRead();
    setArticles((prev) => prev.map((a) => ({ ...a, is_read: true })));
    setStats((prev) => ({ ...prev, unread: 0 }));
  };

  return {
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
    setCategory: handleCategoryChange,
    setSearchQuery,
    toggleBookmarkedOnly: handleToggleBookmarkedOnly,
    toggleBookmark: handleToggleBookmark,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  };
}
