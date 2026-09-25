export interface NewsConfiguration {
  apiKey?: string;
  baseUrl?: string;
  refreshIntervalMs: number;
  cacheRetentionDays: number;
  requestTimeoutMs: number;
  devToApiBase: string;
  hackerNewsApiBase: string;
}

export const NewsConfig: NewsConfiguration = {
  apiKey: process.env.EXPO_PUBLIC_NEWS_API_KEY || undefined,
  baseUrl: process.env.EXPO_PUBLIC_NEWS_BASE_URL || undefined,
  refreshIntervalMs: 30 * 60 * 1000, // 30 mins
  cacheRetentionDays: 14,
  requestTimeoutMs: 7000, // 7 seconds timeout
  devToApiBase: 'https://dev.to/api/articles',
  hackerNewsApiBase: 'https://hacker-news.firebaseio.com/v0',
};
