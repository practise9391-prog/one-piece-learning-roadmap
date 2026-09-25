import { NewsArticle } from '../../models/News';
import {
  NewsSource,
  DeveloperNewsSource,
  AINewsSource,
  TechnologyNewsSource,
  EducationNewsSource,
  FinanceNewsSource,
} from './NewsSources';

export class NewsService {
  private sources: NewsSource[] = [
    new DeveloperNewsSource(),
    new AINewsSource(),
    new TechnologyNewsSource(),
    new EducationNewsSource(),
    new FinanceNewsSource(),
  ];

  private lastFetchTime: number = 0;

  async fetchAllSources(): Promise<{ articles: Partial<NewsArticle>[]; errorCount: number }> {
    const results = await Promise.allSettled(
      this.sources.map((source) => source.fetchArticles())
    );

    const aggregated: Partial<NewsArticle>[] = [];
    let errorCount = 0;

    for (const res of results) {
      if (res.status === 'fulfilled') {
        aggregated.push(...res.value);
      } else {
        errorCount++;
      }
    }

    // Deduplicate in memory by article_url or id
    const seenUrls = new Set<string>();
    const uniqueArticles: Partial<NewsArticle>[] = [];

    for (const art of aggregated) {
      const key = art.article_url || art.id || art.title;
      if (key && !seenUrls.has(key)) {
        seenUrls.add(key);
        uniqueArticles.push(art);
      }
    }

    this.lastFetchTime = Date.now();
    return { articles: uniqueArticles, errorCount };
  }

  getLastFetchTime(): number {
    return this.lastFetchTime;
  }
}

export const newsService = new NewsService();
