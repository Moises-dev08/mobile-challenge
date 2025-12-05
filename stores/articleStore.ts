import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ArticleStore {
  deletedIds: Set<string>;
  favoriteIds: Set<string>;
  isHydrated: boolean;
  
  // Actions
  deleteArticle: (id: string) => void;
  restoreArticle: (id: string) => void;
  toggleFavorite: (id: string) => void;
  
  // Selectors
  isDeleted: (id: string) => boolean;
  isFavorited: (id: string) => boolean;
  
  setHydrated: () => void;
}

// Debounce helper for AsyncStorage writes
let persistTimeout: NodeJS.Timeout | null = null;
const debouncedPersist = (key: string, value: string) => {
  if (persistTimeout) {
    clearTimeout(persistTimeout);
  }
  persistTimeout = setTimeout(async () => {
    await AsyncStorage.setItem(key, value);
  }, 300); // Wait 300ms before persisting
};

// Custom storage with debounced writes
const storage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await AsyncStorage.getItem(name);
    return value;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // Debounce writes to improve performance
    debouncedPersist(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await AsyncStorage.removeItem(name);
  },
};

export const useArticleStore = create<ArticleStore>()(
  persist(
    (set, get) => ({
      deletedIds: new Set<string>(),
      favoriteIds: new Set<string>(),
      isHydrated: false,
      
      deleteArticle: (id: string) => {
        set((state) => {
          const newDeletedIds = new Set(state.deletedIds);
          newDeletedIds.add(id);
          
          // Auto-remove from favorites when deleted
          const newFavoriteIds = new Set(state.favoriteIds);
          newFavoriteIds.delete(id);
          
          return {
            deletedIds: newDeletedIds,
            favoriteIds: newFavoriteIds,
          };
        });
      },
      
      restoreArticle: (id: string) => {
        set((state) => {
          const newDeletedIds = new Set(state.deletedIds);
          newDeletedIds.delete(id);
          
          return { deletedIds: newDeletedIds };
        });
      },
      
      toggleFavorite: (id: string) => {
        set((state) => {
          const newFavoriteIds = new Set(state.favoriteIds);
          
          if (newFavoriteIds.has(id)) {
            newFavoriteIds.delete(id);
          } else {
            newFavoriteIds.add(id);
          }
          
          return { favoriteIds: newFavoriteIds };
        });
      },
      
      isDeleted: (id: string) => get().deletedIds.has(id),
      isFavorited: (id: string) => get().favoriteIds.has(id),
      
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'article-storage',
      storage: createJSONStorage(() => storage),
      // Custom serialization for Sets
      partialize: (state) => ({
        deletedIds: Array.from(state.deletedIds),
        favoriteIds: Array.from(state.favoriteIds),
      }),
      // Custom deserialization for Sets
      merge: (persistedState: any, currentState) => {
        return {
          ...currentState,
          ...persistedState,
          deletedIds: new Set(persistedState?.deletedIds || []),
          favoriteIds: new Set(persistedState?.favoriteIds || []),
        };
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
