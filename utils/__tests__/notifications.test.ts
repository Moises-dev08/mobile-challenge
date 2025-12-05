import type { Article } from '@/types/article';
import type { CategoryFilter, PlatformFilter } from '@/types/notifications';
import {
  CATEGORY_KEYWORDS,
  createArticleNotification,
  extractArticleIdFromUrl,
  extractDomainFromUrl,
  isArticleOfInterest,
  isWithinQuietHours,
  matchesCategoryFilter,
  matchesCustomKeywords,
  matchesDomainFilter,
  matchesPlatformFilter,
  meetsScoreThreshold,
  PLATFORM_KEYWORDS,
} from '../notifications';

describe('notification utilities', () => {
  const mockArticle: Article = {
    objectID: '12345',
    title: 'Building a React Native App with TypeScript',
    url: 'https://github.com/example/react-native-app',
    author: 'testauthor',
    points: 100,
    num_comments: 20,
    created_at: '2024-01-01T00:00:00.000Z',
    created_at_i: 1704067200,
  };

  describe('PLATFORM_KEYWORDS and CATEGORY_KEYWORDS', () => {
    it('should have platform keywords defined', () => {
      expect(PLATFORM_KEYWORDS.android).toBeDefined();
      expect(PLATFORM_KEYWORDS.ios).toBeDefined();
      expect(PLATFORM_KEYWORDS.android.length).toBeGreaterThan(0);
      expect(PLATFORM_KEYWORDS.ios.length).toBeGreaterThan(0);
    });

    it('should have category keywords defined', () => {
      expect(CATEGORY_KEYWORDS.web).toBeDefined();
      expect(CATEGORY_KEYWORDS.mobile).toBeDefined();
      expect(CATEGORY_KEYWORDS.backend).toBeDefined();
      expect(Object.keys(CATEGORY_KEYWORDS).length).toBeGreaterThan(0);
    });
  });

  describe('matchesPlatformFilter', () => {
    it('should return true when no platform filters are set', () => {
      const result = matchesPlatformFilter(mockArticle, new Set());
      expect(result).toBe(true);
    });

    it('should match Android articles', () => {
      const article: Article = {
        ...mockArticle,
        title: 'Building an Android app with Kotlin',
      };
      const result = matchesPlatformFilter(article, new Set(['android']));
      expect(result).toBe(true);
    });

    it('should match iOS articles', () => {
      const article: Article = {
        ...mockArticle,
        title: 'Swift 5.0 new features for iOS development',
      };
      const result = matchesPlatformFilter(article, new Set(['ios']));
      expect(result).toBe(true);
    });

    it('should not match when platform is not found', () => {
      const article: Article = {
        ...mockArticle,
        title: 'Building a web application with React',
      };
      const result = matchesPlatformFilter(article, new Set(['android']));
      expect(result).toBe(false);
    });

    it('should match if any platform matches', () => {
      const article: Article = {
        ...mockArticle,
        title: 'Swift development',
      };
      const result = matchesPlatformFilter(article, new Set(['android', 'ios']));
      expect(result).toBe(true);
    });
  });

  describe('matchesCategoryFilter', () => {
    it('should return true when no category filters are set', () => {
      const result = matchesCategoryFilter(mockArticle, new Set());
      expect(result).toBe(true);
    });

    it('should match web development articles', () => {
      const article: Article = {
        ...mockArticle,
        title: 'Modern JavaScript frameworks comparison',
      };
      const result = matchesCategoryFilter(article, new Set(['web']));
      expect(result).toBe(true);
    });

    it('should match mobile development articles', () => {
      const result = matchesCategoryFilter(mockArticle, new Set(['mobile']));
      expect(result).toBe(true);
    });

    it('should match backend articles', () => {
      const article: Article = {
        ...mockArticle,
        title: 'Building REST APIs with Node.js',
      };
      const result = matchesCategoryFilter(article, new Set(['backend']));
      expect(result).toBe(true);
    });

    it('should not match when category is not found', () => {
      const article: Article = {
        ...mockArticle,
        title: 'Building a React Native App with TypeScript',
      };
      const result = matchesCategoryFilter(article, new Set(['database']));
      expect(result).toBe(false);
    });

    it('should match if any category matches', () => {
      const article: Article = {
        ...mockArticle,
        title: 'Docker containerization guide',
      };
      const result = matchesCategoryFilter(article, new Set(['devops', 'backend']));
      expect(result).toBe(true);
    });
  });

  describe('matchesCustomKeywords', () => {
    it('should return true when no keywords are provided', () => {
      const result = matchesCustomKeywords(mockArticle, [], 'any');
      expect(result).toBe(true);
    });

    it('should match with "any" mode when one keyword matches', () => {
      const result = matchesCustomKeywords(mockArticle, ['react', 'vue'], 'any');
      expect(result).toBe(true);
    });

    it('should match with "any" mode when multiple keywords match', () => {
      const result = matchesCustomKeywords(
        mockArticle,
        ['react', 'typescript'],
        'any'
      );
      expect(result).toBe(true);
    });

    it('should not match with "any" mode when no keywords match', () => {
      const result = matchesCustomKeywords(mockArticle, ['vue', 'angular'], 'any');
      expect(result).toBe(false);
    });

    it('should match with "all" mode when all keywords match', () => {
      const result = matchesCustomKeywords(
        mockArticle,
        ['react', 'typescript'],
        'all'
      );
      expect(result).toBe(true);
    });

    it('should not match with "all" mode when not all keywords match', () => {
      const result = matchesCustomKeywords(
        mockArticle,
        ['react', 'vue', 'angular'],
        'all'
      );
      expect(result).toBe(false);
    });

    it('should be case insensitive', () => {
      const result = matchesCustomKeywords(mockArticle, ['REACT', 'TYPESCRIPT'], 'all');
      expect(result).toBe(true);
    });
  });

  describe('meetsScoreThreshold', () => {
    it('should return true when minScore is 0', () => {
      const result = meetsScoreThreshold(mockArticle, 0);
      expect(result).toBe(true);
    });

    it('should return true when article points meet threshold', () => {
      const result = meetsScoreThreshold(mockArticle, 50);
      expect(result).toBe(true);
    });

    it('should return false when article points are below threshold', () => {
      const result = meetsScoreThreshold(mockArticle, 200);
      expect(result).toBe(false);
    });

    it('should handle articles with no points', () => {
      const article: Article = { ...mockArticle, points: undefined };
      const result = meetsScoreThreshold(article, 10);
      expect(result).toBe(false);
    });

    it('should return true when points exactly equal threshold', () => {
      const result = meetsScoreThreshold(mockArticle, 100);
      expect(result).toBe(true);
    });
  });

  describe('extractDomainFromUrl', () => {
    it('should extract domain from URL', () => {
      const result = extractDomainFromUrl('https://github.com/example/repo');
      expect(result).toBe('github.com');
    });

    it('should remove www prefix', () => {
      const result = extractDomainFromUrl('https://www.example.com/page');
      expect(result).toBe('example.com');
    });

    it('should handle invalid URLs', () => {
      const result = extractDomainFromUrl('not a url');
      expect(result).toBe('');
    });

    it('should handle URLs with ports', () => {
      const result = extractDomainFromUrl('https://example.com:8080/page');
      expect(result).toBe('example.com');
    });
  });

  describe('matchesDomainFilter', () => {
    it('should return true when domain list is empty', () => {
      const result = matchesDomainFilter(mockArticle, []);
      expect(result).toBe(true);
    });

    it('should match allowed domain', () => {
      const result = matchesDomainFilter(mockArticle, ['github.com']);
      expect(result).toBe(true);
    });

    it('should not match non-allowed domain', () => {
      const result = matchesDomainFilter(mockArticle, ['stackoverflow.com']);
      expect(result).toBe(false);
    });

    it('should return false for articles without URL', () => {
      const article: Article = { ...mockArticle, url: undefined };
      const result = matchesDomainFilter(article, ['github.com']);
      expect(result).toBe(false);
    });

    it('should match partial domain', () => {
      const result = matchesDomainFilter(mockArticle, ['github']);
      expect(result).toBe(true);
    });
  });

  describe('isWithinQuietHours', () => {
    it('should detect normal range quiet hours', () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMin = now.getMinutes();
      
      // Create a range that includes current time
      const startHour = currentHour === 0 ? 23 : currentHour - 1;
      const endHour = currentHour === 23 ? 0 : currentHour + 1;
      
      const start = `${String(startHour).padStart(2, '0')}:00`;
      const end = `${String(endHour).padStart(2, '0')}:00`;
      
      const result = isWithinQuietHours(start, end);
      expect(result).toBe(true);
    });

    it('should detect overnight quiet hours', () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Test overnight range
      const result = isWithinQuietHours('22:00', '08:00');
      
      // Should be true if current hour is >= 22 or < 8
      const expected = currentHour >= 22 || currentHour < 8;
      expect(result).toBe(expected);
    });

    it('should return false when outside quiet hours', () => {
      const now = new Date();
      const currentHour = now.getHours();
      
      // Create a range that definitely doesn't include current time
      let startHour = (currentHour + 5) % 24;
      let endHour = (currentHour + 6) % 24;
      
      const start = `${String(startHour).padStart(2, '0')}:00`;
      const end = `${String(endHour).padStart(2, '0')}:00`;
      
      const result = isWithinQuietHours(start, end);
      expect(result).toBe(false);
    });
  });

  describe('isArticleOfInterest', () => {
    const defaultSettings = {
      notificationsEnabled: true,
      platformFilters: new Set<PlatformFilter>(),
      categoryFilters: new Set<CategoryFilter>(),
      customKeywords: [],
      keywordMatchMode: 'any' as const,
      minScore: 0,
      allowedDomains: [],
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    };

    it('should return false when notifications are disabled', () => {
      const settings = { ...defaultSettings, notificationsEnabled: false };
      const result = isArticleOfInterest(mockArticle, settings);
      expect(result).toBe(false);
    });

    it('should return true when all filters pass', () => {
      const result = isArticleOfInterest(mockArticle, defaultSettings);
      expect(result).toBe(true);
    });

    it('should return false when platform filter does not match', () => {
      const settings = {
        ...defaultSettings,
        platformFilters: new Set<PlatformFilter>(['android']),
      };
      const article: Article = { ...mockArticle, title: 'Web development guide' };
      const result = isArticleOfInterest(article, settings);
      expect(result).toBe(false);
    });

    it('should return false when score is below threshold', () => {
      const settings = { ...defaultSettings, minScore: 200 };
      const result = isArticleOfInterest(mockArticle, settings);
      expect(result).toBe(false);
    });

    it('should return false when domain is not allowed', () => {
      const settings = { ...defaultSettings, allowedDomains: ['stackoverflow.com'] };
      const result = isArticleOfInterest(mockArticle, settings);
      expect(result).toBe(false);
    });

    it('should apply all filters with AND logic', () => {
      const settings = {
        ...defaultSettings,
        categoryFilters: new Set<CategoryFilter>(['mobile']),
        customKeywords: ['react'],
        minScore: 50,
      };
      const result = isArticleOfInterest(mockArticle, settings);
      expect(result).toBe(true);
    });
  });

  describe('extractArticleIdFromUrl', () => {
    it('should extract article ID from deep link', () => {
      const result = extractArticleIdFromUrl('mobilechallenge://article/12345');
      expect(result).toBe('12345');
    });

    it('should return null for invalid URLs', () => {
      const result = extractArticleIdFromUrl('invalid-url');
      expect(result).toBe(null);
    });

    it('should return null when no ID is present', () => {
      const result = extractArticleIdFromUrl('mobilechallenge://article/');
      expect(result).toBe(null);
    });
  });

  describe('createArticleNotification', () => {
    it('should create notification object with article data', () => {
      const result = createArticleNotification(mockArticle);
      
      expect(result.title).toBe('📰 New Article');
      expect(result.body).toBe(mockArticle.title);
      expect(result.data.articleId).toBe(mockArticle.objectID);
      expect(result.data.articleUrl).toBe(mockArticle.url);
      expect(result.data.articleTitle).toBe(mockArticle.title);
    });

    it('should use fallback URL when article has no URL', () => {
      const article: Article = { ...mockArticle, url: undefined };
      const result = createArticleNotification(article);
      
      expect(result.data.articleUrl).toBe(
        `https://news.ycombinator.com/item?id=${article.objectID}`
      );
    });
  });
});
