import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import { useSettingsStore } from '../settingsStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('settingsStore', () => {
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    // Reset store state between tests
    useSettingsStore.setState({
      notificationsEnabled: true,
      platformFilters: new Set(),
      categoryFilters: new Set(),
      customKeywords: [],
      keywordMatchMode: 'any',
      minScore: 0,
      allowedDomains: [],
      quietHoursEnabled: false,
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      lastBackgroundFetch: 0,
    });
  });

  describe('initial state', () => {
    it('should have correct default values', () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(result.current.notificationsEnabled).toBe(true);
      expect(result.current.platformFilters.size).toBe(0);
      expect(result.current.categoryFilters.size).toBe(0);
      expect(result.current.customKeywords).toEqual([]);
      expect(result.current.keywordMatchMode).toBe('any');
      expect(result.current.minScore).toBe(0);
      expect(result.current.allowedDomains).toEqual([]);
      expect(result.current.quietHoursEnabled).toBe(false);
      expect(result.current.quietHoursStart).toBe('22:00');
      expect(result.current.quietHoursEnd).toBe('08:00');
      expect(result.current.lastBackgroundFetch).toBe(0);
    });
  });

  describe('toggleNotifications', () => {
    it('should toggle notifications enabled state', () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(result.current.notificationsEnabled).toBe(true);

      act(() => {
        result.current.toggleNotifications();
      });

      expect(result.current.notificationsEnabled).toBe(false);

      act(() => {
        result.current.toggleNotifications();
      });

      expect(result.current.notificationsEnabled).toBe(true);
    });
  });

  describe('togglePlatformFilter', () => {
    it('should add platform to filters when not present', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.togglePlatformFilter('android');
      });

      expect(result.current.platformFilters.has('android')).toBe(true);
    });

    it('should remove platform from filters when already present', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.togglePlatformFilter('android');
      });

      expect(result.current.platformFilters.has('android')).toBe(true);

      act(() => {
        result.current.togglePlatformFilter('android');
      });

      expect(result.current.platformFilters.has('android')).toBe(false);
    });

    it('should handle multiple platforms', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.togglePlatformFilter('android');
        result.current.togglePlatformFilter('ios');
      });

      expect(result.current.platformFilters.size).toBe(2);
      expect(result.current.platformFilters.has('android')).toBe(true);
      expect(result.current.platformFilters.has('ios')).toBe(true);
    });
  });

  describe('toggleCategoryFilter', () => {
    it('should add category to filters when not present', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.toggleCategoryFilter('web');
      });

      expect(result.current.categoryFilters.has('web')).toBe(true);
    });

    it('should remove category from filters when already present', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.toggleCategoryFilter('web');
      });

      expect(result.current.categoryFilters.has('web')).toBe(true);

      act(() => {
        result.current.toggleCategoryFilter('web');
      });

      expect(result.current.categoryFilters.has('web')).toBe(false);
    });

    it('should handle multiple categories', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.toggleCategoryFilter('web');
        result.current.toggleCategoryFilter('mobile');
        result.current.toggleCategoryFilter('backend');
      });

      expect(result.current.categoryFilters.size).toBe(3);
    });
  });

  describe('custom keywords', () => {
    it('should add custom keyword', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addCustomKeyword('react');
      });

      expect(result.current.customKeywords).toContain('react');
    });

    it('should not add duplicate keywords', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addCustomKeyword('react');
        result.current.addCustomKeyword('react');
      });

      expect(result.current.customKeywords).toEqual(['react']);
    });

    it('should remove custom keyword', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addCustomKeyword('react');
        result.current.addCustomKeyword('typescript');
      });

      expect(result.current.customKeywords).toEqual(['react', 'typescript']);

      act(() => {
        result.current.removeCustomKeyword('react');
      });

      expect(result.current.customKeywords).toEqual(['typescript']);
    });

    it('should handle multiple keywords', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addCustomKeyword('react');
        result.current.addCustomKeyword('typescript');
        result.current.addCustomKeyword('nextjs');
      });

      expect(result.current.customKeywords.length).toBe(3);
    });
  });

  describe('keyword match mode', () => {
    it('should set keyword match mode to "any"', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setKeywordMatchMode('all');
      });

      expect(result.current.keywordMatchMode).toBe('all');

      act(() => {
        result.current.setKeywordMatchMode('any');
      });

      expect(result.current.keywordMatchMode).toBe('any');
    });
  });

  describe('minimum score', () => {
    it('should set minimum score', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setMinScore(100);
      });

      expect(result.current.minScore).toBe(100);
    });

    it('should handle zero score', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setMinScore(0);
      });

      expect(result.current.minScore).toBe(0);
    });
  });

  describe('allowed domains', () => {
    it('should add allowed domain', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addAllowedDomain('github.com');
      });

      expect(result.current.allowedDomains).toContain('github.com');
    });

    it('should not add duplicate domains', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addAllowedDomain('github.com');
        result.current.addAllowedDomain('github.com');
      });

      expect(result.current.allowedDomains).toEqual(['github.com']);
    });

    it('should remove allowed domain', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.addAllowedDomain('github.com');
        result.current.addAllowedDomain('stackoverflow.com');
      });

      expect(result.current.allowedDomains.length).toBe(2);

      act(() => {
        result.current.removeAllowedDomain('github.com');
      });

      expect(result.current.allowedDomains).toEqual(['stackoverflow.com']);
    });
  });

  describe('quiet hours', () => {
    it('should toggle quiet hours', () => {
      const { result } = renderHook(() => useSettingsStore());

      expect(result.current.quietHoursEnabled).toBe(false);

      act(() => {
        result.current.toggleQuietHours();
      });

      expect(result.current.quietHoursEnabled).toBe(true);
    });

    it('should set quiet hours start time', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setQuietHoursStart('23:00');
      });

      expect(result.current.quietHoursStart).toBe('23:00');
    });

    it('should set quiet hours end time', () => {
      const { result } = renderHook(() => useSettingsStore());

      act(() => {
        result.current.setQuietHoursEnd('07:00');
      });

      expect(result.current.quietHoursEnd).toBe('07:00');
    });
  });

  describe('background fetch', () => {
    it('should update last background fetch timestamp', () => {
      const { result } = renderHook(() => useSettingsStore());
      const timestamp = Date.now();

      act(() => {
        result.current.setLastBackgroundFetch(timestamp);
      });

      expect(result.current.lastBackgroundFetch).toBe(timestamp);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all settings to default values', () => {
      const { result } = renderHook(() => useSettingsStore());

      // Modify all settings
      act(() => {
        result.current.toggleNotifications();
        result.current.togglePlatformFilter('android');
        result.current.toggleCategoryFilter('web');
        result.current.addCustomKeyword('react');
        result.current.setKeywordMatchMode('all');
        result.current.setMinScore(50);
        result.current.addAllowedDomain('github.com');
        result.current.toggleQuietHours();
        result.current.setQuietHoursStart('23:00');
        result.current.setQuietHoursEnd('07:00');
        result.current.setLastBackgroundFetch(12345);
      });

      // Verify settings were changed
      expect(result.current.notificationsEnabled).toBe(false);
      expect(result.current.platformFilters.size).toBeGreaterThan(0);
      expect(result.current.customKeywords.length).toBeGreaterThan(0);

      // Reset to defaults
      act(() => {
        result.current.resetToDefaults();
      });

      // Verify all settings are back to defaults
      expect(result.current.notificationsEnabled).toBe(true);
      expect(result.current.platformFilters.size).toBe(0);
      expect(result.current.categoryFilters.size).toBe(0);
      expect(result.current.customKeywords).toEqual([]);
      expect(result.current.keywordMatchMode).toBe('any');
      expect(result.current.minScore).toBe(0);
      expect(result.current.allowedDomains).toEqual([]);
      expect(result.current.quietHoursEnabled).toBe(false);
      expect(result.current.quietHoursStart).toBe('22:00');
      expect(result.current.quietHoursEnd).toBe('08:00');
      expect(result.current.lastBackgroundFetch).toBe(0);
    });
  });
});
