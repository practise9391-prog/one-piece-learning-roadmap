import { NewsArticle, NewsCategory } from '../../models/News';
import { NewsConfig } from './NewsConfig';

export interface NewsSource {
  readonly name: string;
  readonly category: NewsCategory;
  fetchArticles(): Promise<Partial<NewsArticle>[]>;
}

// Helper to fetch with timeout
async function fetchWithTimeout(url: string, timeoutMs: number = NewsConfig.requestTimeoutMs): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OnePieceLearningRoadmap/1.0',
      },
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

// Simple deterministic hash
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

// 1. Developer News Source (Dev.to programming/dev articles)
export class DeveloperNewsSource implements NewsSource {
  readonly name = 'Dev.to Developer Feed';
  readonly category: NewsCategory = 'DEVELOPER';

  async fetchArticles(): Promise<Partial<NewsArticle>[]> {
    try {
      const url = `${NewsConfig.devToApiBase}?tag=programming&per_page=8`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any) => ({
        id: `devto_${item.id || hashString(item.url || item.title)}`,
        title: item.title || 'Developer Update',
        description: item.description || (item.title ? `${item.title} on ${this.name}` : ''),
        content: item.body_markdown || item.description || undefined,
        image_url: item.cover_image || item.social_image || null,
        source_name: 'Dev Community',
        source_url: 'https://dev.to',
        article_url: item.url,
        category: 'DEVELOPER' as NewsCategory,
        author: item.user?.name || item.user?.username || null,
        published_at: item.published_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }
}

// 2. AI News Source (Dev.to AI & ML articles)
export class AINewsSource implements NewsSource {
  readonly name = 'AI Insights';
  readonly category: NewsCategory = 'AI';

  async fetchArticles(): Promise<Partial<NewsArticle>[]> {
    try {
      const url = `${NewsConfig.devToApiBase}?tag=ai&per_page=8`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any) => ({
        id: `ai_${item.id || hashString(item.url || item.title)}`,
        title: item.title || 'AI Development Announcement',
        description: item.description || 'Breakthrough in machine learning and generative artificial intelligence.',
        content: item.body_markdown || item.description || undefined,
        image_url: item.cover_image || item.social_image || null,
        source_name: 'AI & Data Dispatch',
        source_url: 'https://dev.to/t/ai',
        article_url: item.url,
        category: 'AI' as NewsCategory,
        author: item.user?.name || 'AI Research Group',
        published_at: item.published_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }
}

// 3. Technology News Source (Hacker News Top Stories)
export class TechnologyNewsSource implements NewsSource {
  readonly name = 'Hacker News Technology';
  readonly category: NewsCategory = 'TECH';

  async fetchArticles(): Promise<Partial<NewsArticle>[]> {
    try {
      const topIdsRes = await fetchWithTimeout(
        `${NewsConfig.hackerNewsApiBase}/topstories.json?limitToFirst=6`
      );
      if (!topIdsRes.ok) return [];
      const topIds: number[] = await topIdsRes.json();
      if (!Array.isArray(topIds)) return [];

      const articlePromises = topIds.slice(0, 6).map(async (id) => {
        try {
          const itemRes = await fetchWithTimeout(
            `${NewsConfig.hackerNewsApiBase}/item/${id}.json`,
            4000
          );
          if (!itemRes.ok) return null;
          const item = await itemRes.json();
          if (!item || !item.title || !item.url) return null;

          return {
            id: `hn_${item.id}`,
            title: item.title,
            description: `Discussed on Hacker News with ${item.score || 0} points and ${item.descendants || 0} comments.`,
            source_name: 'Hacker News',
            source_url: 'https://news.ycombinator.com',
            article_url: item.url,
            category: 'TECH' as NewsCategory,
            author: item.by || null,
            published_at: item.time ? new Date(item.time * 1000).toISOString() : new Date().toISOString(),
          };
        } catch {
          return null;
        }
      });

      const results = await Promise.all(articlePromises);
      return results.filter((item): item is NonNullable<typeof item> => item !== null);
    } catch {
      return [];
    }
  }
}

// 4. Education News Source (Dev.to Beginners & Learning)
export class EducationNewsSource implements NewsSource {
  readonly name = 'Tech Education & Career';
  readonly category: NewsCategory = 'EDUCATION';

  async fetchArticles(): Promise<Partial<NewsArticle>[]> {
    try {
      const url = `${NewsConfig.devToApiBase}?tag=beginners&per_page=6`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any) => ({
        id: `edu_${item.id || hashString(item.url || item.title)}`,
        title: item.title || 'Engineering Learning Guide',
        description: item.description || 'Core study tips and roadmap strategies for engineering students.',
        content: item.body_markdown || item.description || undefined,
        image_url: item.cover_image || item.social_image || null,
        source_name: 'Dev Beginners',
        source_url: 'https://dev.to/t/beginners',
        article_url: item.url,
        category: 'EDUCATION' as NewsCategory,
        author: item.user?.name || 'Educator',
        published_at: item.published_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }
}

// 5. Finance & Market News Source (Tech Markets & Startups)
export class FinanceNewsSource implements NewsSource {
  readonly name = 'Technology Markets & Finance';
  readonly category: NewsCategory = 'STOCKS';

  async fetchArticles(): Promise<Partial<NewsArticle>[]> {
    try {
      const url = `${NewsConfig.devToApiBase}?tag=productivity&per_page=6`;
      const res = await fetchWithTimeout(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      return data.map((item: any) => ({
        id: `fin_${item.id || hashString(item.url || item.title)}`,
        title: item.title || 'Tech Industry Productivity & Economics',
        description: item.description || 'Industry developments and economic trends shaping the technology sector.',
        content: item.body_markdown || item.description || undefined,
        image_url: item.cover_image || item.social_image || null,
        source_name: 'Tech Markets & Work',
        source_url: 'https://dev.to',
        article_url: item.url,
        category: 'STOCKS' as NewsCategory,
        author: item.user?.name || 'Market Analyst',
        published_at: item.published_at || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  }
}
