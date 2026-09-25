import { DatabaseManager } from '../database/DatabaseManager';
import { NewsArticle, NewsArticleRow, NewsCategory, NewsStats, mapRowToNewsArticle } from '../models/News';

export interface GetNewsOptions {
  category?: NewsCategory;
  bookmarkedOnly?: boolean;
  unreadOnly?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

export class NewsRepository {
  private db = DatabaseManager.getInstance();

  async getArticles(options: GetNewsOptions = {}): Promise<NewsArticle[]> {
    const database = await this.db.getDatabase();
    const { category, bookmarkedOnly, unreadOnly, search, limit = 50, offset = 0 } = options;

    const conditions: string[] = [];
    const params: any[] = [];

    if (category && category !== 'ALL') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (bookmarkedOnly) {
      conditions.push('is_bookmarked = 1');
    }

    if (unreadOnly) {
      conditions.push('is_read = 0');
    }

    if (search && search.trim().length > 0) {
      const term = `%${search.trim()}%`;
      conditions.push('(title LIKE ? OR description LIKE ? OR source_name LIKE ? OR category LIKE ?)');
      params.push(term, term, term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `
      SELECT * FROM news_articles
      ${whereClause}
      ORDER BY published_at DESC
      LIMIT ? OFFSET ?;
    `;
    params.push(limit, offset);

    const rows = await database.getAllAsync<NewsArticleRow>(query, params);
    return rows.map(mapRowToNewsArticle);
  }

  async getArticleById(id: string): Promise<NewsArticle | null> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<NewsArticleRow>(
      'SELECT * FROM news_articles WHERE id = ?;',
      [id]
    );
    return row ? mapRowToNewsArticle(row) : null;
  }

  async saveArticles(articles: Partial<NewsArticle>[]): Promise<{ inserted: number }> {
    const database = await this.db.getDatabase();
    const now = new Date().toISOString();
    let inserted = 0;

    for (const a of articles) {
      if (!a.id || !a.title || !a.article_url) continue;

      const result = await database.runAsync(
        `INSERT OR IGNORE INTO news_articles (
          id, title, description, content, image_url,
          source_name, source_url, article_url, category,
          author, published_at, fetched_at, is_read, is_bookmarked
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0);`,
        [
          a.id,
          a.title,
          a.description || null,
          a.content || null,
          a.image_url || null,
          a.source_name || 'Tech Web',
          a.source_url || null,
          a.article_url,
          a.category || 'TECH',
          a.author || null,
          a.published_at || now,
          now,
        ]
      );

      if (result.changes > 0) {
        inserted++;
      }
    }

    return { inserted };
  }

  async markAsRead(id: string): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync(
      'UPDATE news_articles SET is_read = 1 WHERE id = ?;',
      [id]
    );
  }

  async markAllAsRead(): Promise<void> {
    const database = await this.db.getDatabase();
    await database.runAsync('UPDATE news_articles SET is_read = 1 WHERE is_read = 0;');
  }

  async toggleBookmark(id: string): Promise<boolean> {
    const database = await this.db.getDatabase();
    const current = await this.getArticleById(id);
    if (!current) return false;

    const nextState = current.is_bookmarked ? 0 : 1;
    await database.runAsync(
      'UPDATE news_articles SET is_bookmarked = ? WHERE id = ?;',
      [nextState, id]
    );
    return nextState === 1;
  }

  async getStats(): Promise<NewsStats> {
    const database = await this.db.getDatabase();
    const row = await database.getFirstAsync<{
      total: number;
      unread: number;
      bookmarked: number;
    }>(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
        SUM(CASE WHEN is_bookmarked = 1 THEN 1 ELSE 0 END) as bookmarked
      FROM news_articles;
    `);

    return {
      total: row?.total || 0,
      unread: row?.unread || 0,
      bookmarked: row?.bookmarked || 0,
    };
  }

  async getRecentPreview(limit: number = 3): Promise<NewsArticle[]> {
    const database = await this.db.getDatabase();
    const rows = await database.getAllAsync<NewsArticleRow>(
      'SELECT * FROM news_articles ORDER BY published_at DESC LIMIT ?;',
      [limit]
    );
    return rows.map(mapRowToNewsArticle);
  }

  async deleteExpiredArticles(retentionDays: number = 14): Promise<number> {
    const database = await this.db.getDatabase();
    // Do NOT delete bookmarked articles!
    const cutoffDate = new Date(Date.now() - retentionDays * 86400000).toISOString();
    const result = await database.runAsync(
      'DELETE FROM news_articles WHERE is_bookmarked = 0 AND published_at < ?;',
      [cutoffDate]
    );
    return result.changes;
  }
}

export const newsRepository = new NewsRepository();
