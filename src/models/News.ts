export type NewsCategory =
  | 'ALL'
  | 'TECH'
  | 'AI'
  | 'DEVELOPER'
  | 'STOCKS'
  | 'EDUCATION'
  | 'TRENDS';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  image_url?: string | null;
  source_name: string;
  source_url?: string | null;
  article_url: string;
  category: NewsCategory;
  author?: string | null;
  published_at: string;
  fetched_at: string;
  is_read: boolean;
  is_bookmarked: boolean;
}

export interface NewsArticleRow {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  image_url: string | null;
  source_name: string;
  source_url: string | null;
  article_url: string;
  category: string;
  author: string | null;
  published_at: string;
  fetched_at: string;
  is_read: number;
  is_bookmarked: number;
}

export function mapRowToNewsArticle(row: NewsArticleRow): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    content: row.content || undefined,
    image_url: row.image_url,
    source_name: row.source_name,
    source_url: row.source_url,
    article_url: row.article_url,
    category: (row.category as NewsCategory) || 'TECH',
    author: row.author,
    published_at: row.published_at,
    fetched_at: row.fetched_at,
    is_read: row.is_read === 1,
    is_bookmarked: row.is_bookmarked === 1,
  };
}

export interface NewsPreferences {
  categories: Record<NewsCategory, boolean>;
}

export interface NewsStats {
  total: number;
  unread: number;
  bookmarked: number;
}

export function formatRelativeTime(dateString: string): string {
  try {
    const now = Date.now();
    const then = new Date(dateString).getTime();
    if (isNaN(then)) return 'Recently';
    const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));
    if (diffSeconds < 60) return 'Just now';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return 'Recently';
  }
}
