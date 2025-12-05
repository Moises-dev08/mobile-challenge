import type { Article } from '@/types/article';
import type { CategoryFilter, KeywordMatchMode, PlatformFilter } from '@/types/notifications';

// Category keyword mappings for smart filtering
export const CATEGORY_KEYWORDS: Record<CategoryFilter, string[]> = {
  web: ['javascript', 'react', 'vue', 'angular', 'web', 'frontend', 'css', 'html', 'browser', 'dom'],
  mobile: ['android', 'ios', 'swift', 'kotlin', 'react-native', 'flutter', 'mobile', 'app'],
  backend: ['node', 'python', 'java', 'go', 'rust', 'backend', 'api', 'server', 'express', 'django'],
  frontend: ['react', 'vue', 'angular', 'svelte', 'ui', 'ux', 'css', 'tailwind', 'component'],
  devops: ['docker', 'kubernetes', 'aws', 'cloud', 'ci/cd', 'devops', 'deployment', 'infrastructure', 'terraform'],
  ai: ['ai', 'machine learning', 'deep learning', 'neural', 'tensorflow', 'pytorch', 'llm', 'gpt', 'ml'],
  security: ['security', 'vulnerability', 'encryption', 'auth', 'oauth', 'cybersecurity', 'hack', 'exploit'],
  database: ['database', 'sql', 'postgres', 'mongodb', 'redis', 'db', 'query', 'mysql', 'nosql'],
};

// Platform keyword mappings
export const PLATFORM_KEYWORDS: Record<PlatformFilter, string[]> = {
  android: ['android', 'kotlin', 'jetpack', 'google play'],
  ios: ['ios', 'swift', 'apple', 'iphone', 'ipad', 'xcode', 'app store'],
};

/**
 * Check if article matches platform filter
 */
export function matchesPlatformFilter(
  article: Article,
  platforms: Set<PlatformFilter>
): boolean {
  if (platforms.size === 0) return true; // No filter = pass all
  
  const searchText = `${article.title} ${article.url || ''}`.toLowerCase();
  
  for (const platform of platforms) {
    const keywords = PLATFORM_KEYWORDS[platform];
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if article matches category filter
 */
export function matchesCategoryFilter(
  article: Article,
  categories: Set<CategoryFilter>
): boolean {
  if (categories.size === 0) return true; // No filter = pass all
  
  const searchText = `${article.title} ${article.url || ''}`.toLowerCase();
  
  for (const category of categories) {
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords.some(keyword => searchText.includes(keyword))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if article matches custom keywords with AND/OR logic
 */
export function matchesCustomKeywords(
  article: Article,
  keywords: string[],
  mode: KeywordMatchMode
): boolean {
  if (keywords.length === 0) return true; // No keywords = pass all
  
  const searchText = `${article.title} ${article.url || ''}`.toLowerCase();
  
  if (mode === 'any') {
    // OR logic: match if ANY keyword is found
    return keywords.some(keyword => searchText.includes(keyword.toLowerCase()));
  } else {
    // AND logic: match only if ALL keywords are found
    return keywords.every(keyword => searchText.includes(keyword.toLowerCase()));
  }
}

/**
 * Check if article meets minimum score threshold
 */
export function meetsScoreThreshold(article: Article, minScore: number): boolean {
  if (minScore === 0) return true; // Disabled
  return (article.points || 0) >= minScore;
}

/**
 * Extract domain from URL
 */
export function extractDomainFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return '';
  }
}

/**
 * Check if article matches domain filter (whitelist)
 */
export function matchesDomainFilter(article: Article, allowedDomains: string[]): boolean {
  if (allowedDomains.length === 0) return true; // Empty whitelist = allow all
  
  if (!article.url) return false;
  
  const domain = extractDomainFromUrl(article.url);
  return allowedDomains.some(allowed => domain.includes(allowed.toLowerCase()));
}

/**
 * Check if current time is within quiet hours
 * Supports overnight ranges (e.g., 22:00 to 08:00)
 */
export function isWithinQuietHours(startTime: string, endTime: string): boolean {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  if (startMinutes <= endMinutes) {
    // Normal range (e.g., 08:00 to 22:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight range (e.g., 22:00 to 08:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

/**
 * Master function: Check if article passes ALL enabled filters
 */
export function isArticleOfInterest(
  article: Article,
  settings: {
    notificationsEnabled: boolean;
    platformFilters: Set<PlatformFilter>;
    categoryFilters: Set<CategoryFilter>;
    customKeywords: string[];
    keywordMatchMode: KeywordMatchMode;
    minScore: number;
    allowedDomains: string[];
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
  }
): boolean {
  // Check master toggle
  if (!settings.notificationsEnabled) return false;
  
  // Check quiet hours
  if (settings.quietHoursEnabled && isWithinQuietHours(settings.quietHoursStart, settings.quietHoursEnd)) {
    return false;
  }
  
  // All filters must pass (AND logic)
  return (
    matchesPlatformFilter(article, settings.platformFilters) &&
    matchesCategoryFilter(article, settings.categoryFilters) &&
    matchesCustomKeywords(article, settings.customKeywords, settings.keywordMatchMode) &&
    meetsScoreThreshold(article, settings.minScore) &&
    matchesDomainFilter(article, settings.allowedDomains)
  );
}

/**
 * Extract article ID from deep link URL
 */
export function extractArticleIdFromUrl(url: string): string | null {
  try {
    // Format: mobilechallenge://article/{id}
    const match = url.match(/article\/(\d+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Create notification content for an article
 */
export function createArticleNotification(article: Article) {
  return {
    title: '📰 New Article',
    body: article.title,
    data: {
      articleId: article.objectID,
      articleUrl: article.url || `https://news.ycombinator.com/item?id=${article.objectID}`,
      articleTitle: article.title,
    },
  };
}

/**
 * Get notification permission status
 */
export async function getNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  try {
    const Notifications = (await import('expo-notifications')).default;
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'undetermined';
  } catch (error) {
    console.error('Error getting notification permissions:', error);
    return 'undetermined';
  }
}
