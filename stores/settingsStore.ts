import type {
  CategoryFilter,
  KeywordMatchMode,
  NotificationSettingsPersisted,
  PlatformFilter
} from '@/types/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsStore {
  // State
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
  lastBackgroundFetch: number;
  isHydrated: boolean;
  
  // Actions
  toggleNotifications: () => void;
  togglePlatformFilter: (platform: PlatformFilter) => void;
  toggleCategoryFilter: (category: CategoryFilter) => void;
  addCustomKeyword: (keyword: string) => void;
  removeCustomKeyword: (keyword: string) => void;
  setKeywordMatchMode: (mode: KeywordMatchMode) => void;
  setMinScore: (score: number) => void;
  addAllowedDomain: (domain: string) => void;
  removeAllowedDomain: (domain: string) => void;
  toggleQuietHours: () => void;
  setQuietHoursStart: (time: string) => void;
  setQuietHoursEnd: (time: string) => void;
  setLastBackgroundFetch: (timestamp: number) => void;
  setHydrated: () => void;
  resetToDefaults: () => void;
}

// Debounce helper for AsyncStorage writes
let persistTimeout: NodeJS.Timeout | null = null;
const debouncedPersist = (key: string, value: string) => {
  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }
  persistTimeout = setTimeout(async () => {
    await AsyncStorage.setItem(key, value);
  }, 300);
};

// Custom storage with debounced writes
const storage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await AsyncStorage.getItem(name);
    return value;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    debouncedPersist(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};

// Default values
const defaultSettings = {
  notificationsEnabled: true,
  platformFilters: new Set<PlatformFilter>(),
  categoryFilters: new Set<CategoryFilter>(),
  customKeywords: [],
  keywordMatchMode: 'any' as KeywordMatchMode,
  minScore: 0,
  allowedDomains: [],
  quietHoursEnabled: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  lastBackgroundFetch: 0,
  isHydrated: false,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      
      toggleNotifications: () => {
        set((state) => ({ notificationsEnabled: !state.notificationsEnabled }));
      },
      
      togglePlatformFilter: (platform: PlatformFilter) => {
        set((state) => {
          const newFilters = new Set(state.platformFilters);
          if (newFilters.has(platform)) {
            newFilters.delete(platform);
          } else {
            newFilters.add(platform);
          }
          return { platformFilters: newFilters };
        });
      },
      
      toggleCategoryFilter: (category: CategoryFilter) => {
        set((state) => {
          const newFilters = new Set(state.categoryFilters);
          if (newFilters.has(category)) {
            newFilters.delete(category);
          } else {
            newFilters.add(category);
          }
          return { categoryFilters: newFilters };
        });
      },
      
      addCustomKeyword: (keyword: string) => {
        set((state) => {
          const trimmed = keyword.trim().toLowerCase();
          if (!trimmed || state.customKeywords.includes(trimmed)) {
            return state;
          }
          return { customKeywords: [...state.customKeywords, trimmed] };
        });
      },
      
      removeCustomKeyword: (keyword: string) => {
        set((state) => ({
          customKeywords: state.customKeywords.filter((k) => k !== keyword),
        }));
      },
      
      setKeywordMatchMode: (mode: KeywordMatchMode) => {
        set({ keywordMatchMode: mode });
      },
      
      setMinScore: (score: number) => {
        set({ minScore: Math.max(0, score) });
      },
      
      addAllowedDomain: (domain: string) => {
        set((state) => {
          const trimmed = domain.trim().toLowerCase();
          if (!trimmed || state.allowedDomains.includes(trimmed)) {
            return state;
          }
          return { allowedDomains: [...state.allowedDomains, trimmed] };
        });
      },
      
      removeAllowedDomain: (domain: string) => {
        set((state) => ({
          allowedDomains: state.allowedDomains.filter((d) => d !== domain),
        }));
      },
      
      toggleQuietHours: () => {
        set((state) => ({ quietHoursEnabled: !state.quietHoursEnabled }));
      },
      
      setQuietHoursStart: (time: string) => {
        set({ quietHoursStart: time });
      },
      
      setQuietHoursEnd: (time: string) => {
        set({ quietHoursEnd: time });
      },
      
      setLastBackgroundFetch: (timestamp: number) => {
        set({ lastBackgroundFetch: timestamp });
      },
      
      setHydrated: () => {
        set({ isHydrated: true });
      },
      
      resetToDefaults: () => {
        set({ ...defaultSettings, isHydrated: true });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => storage),
      // Custom serialization for Sets
      partialize: (state): NotificationSettingsPersisted => ({
        notificationsEnabled: state.notificationsEnabled,
        platformFilters: Array.from(state.platformFilters),
        categoryFilters: Array.from(state.categoryFilters),
        customKeywords: state.customKeywords,
        keywordMatchMode: state.keywordMatchMode,
        minScore: state.minScore,
        allowedDomains: state.allowedDomains,
        quietHoursEnabled: state.quietHoursEnabled,
        quietHoursStart: state.quietHoursStart,
        quietHoursEnd: state.quietHoursEnd,
        lastBackgroundFetch: state.lastBackgroundFetch,
      }),
      // Custom deserialization for Sets
      merge: (persistedState: any, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          platformFilters: new Set(persistedState?.platformFilters || []),
          categoryFilters: new Set(persistedState?.categoryFilters || []),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
