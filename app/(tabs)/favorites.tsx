import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { fetchMobileArticles } from '@/api/hnApi';
import { SwipeableArticleItem } from '@/components/ArticleItem/SwipeableArticleItem';
import { Article } from '@/types/article';
import { getFavoriteArticleIds, saveFavoriteArticleIds } from '@/utils/storage';

export default function FavoritesScreen() {
  const [favoriteArticleIds, setFavoriteArticleIds] = useState<Set<string>>(new Set());
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  // Load favorite IDs from storage
  useEffect(() => {
    const loadFavorites = async () => {
      const ids = await getFavoriteArticleIds();
      setFavoriteArticleIds(ids);
      setIsLoadingFavorites(false);
    };
    loadFavorites();
  }, []);

  const { data, isLoading, isError, refetch, isRefetching } = useInfiniteQuery({
    queryKey: ['articles'],
    queryFn: ({ pageParam = 0 }) => fetchMobileArticles(pageParam as number),
    getNextPageParam: (lastPage) => {
      if (lastPage.page + 1 < lastPage.nbPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

  // Filter only favorited articles
  const favoriteArticles = React.useMemo(() => {
    const allArticles = data?.pages.flatMap((page) => page.hits) ?? [];
    return allArticles.filter((article) => favoriteArticleIds.has(article.objectID));
  }, [data, favoriteArticleIds]);

  const handlePress = (article: Article) => {
    const url = article.story_url || article.url;
    const title = article.story_title || article.title;
    
    if (url) {
      router.push({
        pathname: '/article-webview',
        params: { url, title },
      });
    }
  };

  const handleUnfavorite = async (article: Article) => {
    const newFavoriteIds = new Set(favoriteArticleIds);
    newFavoriteIds.delete(article.objectID);
    
    setFavoriteArticleIds(newFavoriteIds);

    try {
      await saveFavoriteArticleIds(newFavoriteIds);
    } catch (error) {
      console.error('Failed to save favorites:', error);
      // Revert on error
      setFavoriteArticleIds(favoriteArticleIds);
    }
  };

  const onRefresh = async () => {
    await refetch();
  };

  if (isLoading || isLoadingFavorites) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Error loading articles</Text>
      </View>
    );
  }

  if (favoriteArticles.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="heart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No favorite articles yet</Text>
        <Text style={styles.emptySubtext}>Tap the heart icon to save your favorites</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={favoriteArticles}
      keyExtractor={(item) => item.objectID.toString()}
      renderItem={({ item }) => (
        <SwipeableArticleItem
          article={item}
          onPress={handlePress}
          onDelete={handleUnfavorite}
          onFavorite={handleUnfavorite}
          isFavorited={true}
        />
      )}
      refreshControl={
        <RefreshControl 
          refreshing={isRefetching} 
          onRefresh={onRefresh}
          tintColor="#007AFF"
          colors={['#007AFF']}
        />
      }
      contentContainerStyle={favoriteArticles.length === 0 ? styles.center : styles.list}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  list: {
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
