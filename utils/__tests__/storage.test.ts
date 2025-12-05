import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearDeletedArticleIds,
  getDeletedArticleIds,
  saveDeletedArticleIds,
} from '../storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('storage utilities', () => {
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeletedArticleIds', () => {
    it('should return empty Set when no data exists', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await getDeletedArticleIds();

      expect(result).toEqual(new Set());
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@deleted_articles');
    });

    it('should return Set of article IDs when data exists', async () => {
      const mockIds = ['1', '2', '3'];
      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockIds));

      const result = await getDeletedArticleIds();

      expect(result).toEqual(new Set(mockIds));
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@deleted_articles');
    });

    it('should return empty Set on error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getDeletedArticleIds();

      expect(result).toEqual(new Set());
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle invalid JSON gracefully', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid json');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await getDeletedArticleIds();

      expect(result).toEqual(new Set());
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('saveDeletedArticleIds', () => {
    it('should save article IDs to AsyncStorage', async () => {
      const ids = new Set(['1', '2', '3']);
      mockAsyncStorage.setItem.mockResolvedValue();

      await saveDeletedArticleIds(ids);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@deleted_articles',
        JSON.stringify(['1', '2', '3'])
      );
    });

    it('should save empty Set as empty array', async () => {
      const ids = new Set<string>();
      mockAsyncStorage.setItem.mockResolvedValue();

      await saveDeletedArticleIds(ids);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        '@deleted_articles',
        JSON.stringify([])
      );
    });

    it('should handle save errors gracefully', async () => {
      const ids = new Set(['1']);
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Save error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await saveDeletedArticleIds(ids);

      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('clearDeletedArticleIds', () => {
    it('should remove deleted articles from storage', async () => {
      mockAsyncStorage.removeItem.mockResolvedValue();

      await clearDeletedArticleIds();

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@deleted_articles');
    });

    it('should handle clear errors gracefully', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Clear error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await clearDeletedArticleIds();

      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
});
