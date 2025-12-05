import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import { useArticleStore } from '../articleStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('articleStore', () => {
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    // Reset store state between tests
    useArticleStore.setState({
      deletedIds: new Set<string>(),
      favoriteIds: new Set<string>(),
      isHydrated: true,
    });
  });

  describe('initial state', () => {
    it('should have empty deletedIds and favoriteIds sets', () => {
      const { result } = renderHook(() => useArticleStore());

      expect(result.current.deletedIds.size).toBe(0);
      expect(result.current.favoriteIds.size).toBe(0);
    });

    it('should have isHydrated flag', () => {
      const { result } = renderHook(() => useArticleStore());

      expect(result.current.isHydrated).toBe(true);
    });
  });

  describe('deleteArticle', () => {
    it('should add article ID to deletedIds', () => {
      const { result } = renderHook(() => useArticleStore());

      act(() => {
        result.current.deleteArticle('article-1');
      });

      expect(result.current.deletedIds.has('article-1')).toBe(true);
    });

    it('should remove article from favorites when deleted', () => {
      const { result } = renderHook(() => useArticleStore());

      // First, favorite the article
      act(() => {
        result.current.toggleFavorite('article-1');
      });

      expect(result.current.favoriteIds.has('article-1')).toBe(true);

      // Then delete it
      act(() => {
        result.current.deleteArticle('article-1');
      });

      expect(result.current.deletedIds.has('article-1')).toBe(true);
      expect(result.current.favoriteIds.has('article-1')).toBe(false);
    });

    it('should handle multiple deletions', () => {
      const { result } = renderHook(() => useArticleStore());

      act(() => {
        result.current.deleteArticle('article-1');
        result.current.deleteArticle('article-2');
        result.current.deleteArticle('article-3');
      });

      expect(result.current.deletedIds.size).toBe(3);
      expect(result.current.deletedIds.has('article-1')).toBe(true);
      expect(result.current.deletedIds.has('article-2')).toBe(true);
      expect(result.current.deletedIds.has('article-3')).toBe(true);
    });
  });

  describe('restoreArticle', () => {
    it('should remove article ID from deletedIds', () => {
      const { result } = renderHook(() => useArticleStore());

      // First delete the article
      act(() => {
        result.current.deleteArticle('article-1');
      });

      expect(result.current.deletedIds.has('article-1')).toBe(true);

      // Then restore it
      act(() => {
        result.current.restoreArticle('article-1');
      });

      expect(result.current.deletedIds.has('article-1')).toBe(false);
    });

    it('should handle restoring non-deleted article gracefully', () => {
      const { result } = renderHook(() => useArticleStore());

      act(() => {
        result.current.restoreArticle('non-existent');
      });

      expect(result.current.deletedIds.size).toBe(0);
    });
  });

  describe('toggleFavorite', () => {
    it('should add article to favoriteIds when not favorited', () => {
      const { result } = renderHook(() => useArticleStore());

      act(() => {
        result.current.toggleFavorite('article-1');
      });

      expect(result.current.favoriteIds.has('article-1')).toBe(true);
    });

    it('should remove article from favoriteIds when already favorited', () => {
      const { result } = renderHook(() => useArticleStore());

      // First, favorite it
      act(() => {
        result.current.toggleFavorite('article-1');
      });

      expect(result.current.favoriteIds.has('article-1')).toBe(true);

      // Then unfavorite it
      act(() => {
        result.current.toggleFavorite('article-1');
      });

      expect(result.current.favoriteIds.has('article-1')).toBe(false);
    });

    it('should handle multiple favorites', () => {
      const { result } = renderHook(() => useArticleStore());

      act(() => {
        result.current.toggleFavorite('article-1');
        result.current.toggleFavorite('article-2');
        result.current.toggleFavorite('article-3');
      });

      expect(result.current.favoriteIds.size).toBe(3);
    });
  });

  describe('selectors', () => {
    it('isDeleted should return true for deleted articles', () => {
      const { result } = renderHook(() => useArticleStore());

      act(() => {
        result.current.deleteArticle('article-1');
      });

      expect(result.current.isDeleted('article-1')).toBe(true);
      expect(result.current.isDeleted('article-2')).toBe(false);
    });

    it('isFavorited should return true for favorited articles', () => {
      const { result } = renderHook(() => useArticleStore());

      act(() => {
        result.current.toggleFavorite('article-1');
      });

      expect(result.current.isFavorited('article-1')).toBe(true);
      expect(result.current.isFavorited('article-2')).toBe(false);
    });
  });

  describe('setHydrated', () => {
    it('should set isHydrated to true', () => {
      const { result } = renderHook(() => useArticleStore());
      
      // Set it to false first
      act(() => {
        useArticleStore.setState({ isHydrated: false });
      });

      expect(result.current.isHydrated).toBe(false);

      // Then set it to true using setHydrated
      act(() => {
        result.current.setHydrated();
      });

      expect(result.current.isHydrated).toBe(true);
    });
  });
});
