import AsyncStorage from '@react-native-async-storage/async-storage';

const DELETED_ARTICLES_KEY = '@deleted_articles';

/**
 * Get the set of deleted article IDs from AsyncStorage
 */
export const getDeletedArticleIds = async (): Promise<Set<string>> => {
  try {
    const jsonValue = await AsyncStorage.getItem(DELETED_ARTICLES_KEY);
    if (jsonValue) {
      const ids = JSON.parse(jsonValue) as string[];
      return new Set(ids);
    }
    return new Set();
  } catch (error) {
    console.error('Error loading deleted article IDs:', error);
    return new Set();
  }
};

/**
 * Save the set of deleted article IDs to AsyncStorage
 */
export const saveDeletedArticleIds = async (ids: Set<string>): Promise<void> => {
  try {
    const idsArray = Array.from(ids);
    const jsonValue = JSON.stringify(idsArray);
    await AsyncStorage.setItem(DELETED_ARTICLES_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving deleted article IDs:', error);
  }
};

/**
 * Clear all deleted article IDs from AsyncStorage
 */
export const clearDeletedArticleIds = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(DELETED_ARTICLES_KEY);
  } catch (error) {
    console.error('Error clearing deleted article IDs:', error);
  }
};

// Favorites storage
const FAVORITE_ARTICLES_KEY = '@favorite_articles';

/**
 * Get the set of favorite article IDs from AsyncStorage
 */
export const getFavoriteArticleIds = async (): Promise<Set<string>> => {
  try {
    const jsonValue = await AsyncStorage.getItem(FAVORITE_ARTICLES_KEY);
    if (jsonValue) {
      const ids = JSON.parse(jsonValue) as string[];
      return new Set(ids);
    }
    return new Set();
  } catch (error) {
    console.error('Error loading favorite article IDs:', error);
    return new Set();
  }
};

/**
 * Save the set of favorite article IDs to AsyncStorage
 */
export const saveFavoriteArticleIds = async (ids: Set<string>): Promise<void> => {
  try {
    const idsArray = Array.from(ids);
    const jsonValue = JSON.stringify(idsArray);
    await AsyncStorage.setItem(FAVORITE_ARTICLES_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving favorite article IDs:', error);
  }
};

/**
 * Clear all favorite article IDs from AsyncStorage
 */
export const clearFavoriteArticleIds = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FAVORITE_ARTICLES_KEY);
  } catch (error) {
    console.error('Error clearing favorite article IDs:', error);
  }
};
