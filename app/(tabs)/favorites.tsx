import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMobileArticles } from '@/api/hnApi';
import { SwipeableArticleItem } from '@/components/ArticleItem/SwipeableArticleItem';
import { useArticleStore } from '@/stores/articleStore';
import { Article } from '@/types/article';

export default function FavoritesScreen() {
  const { favoriteIds, isHydrated, toggleFavorite, isFavorited } = useArticleStore();

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
  const favoriteArticles = useMemo(() => {
    const allArticles = data?.pages.flatMap((page) => page.hits) ?? [];
    return allArticles.filter((article) => favoriteIds.has(article.objectID));
  }, [data, favoriteIds]);

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

  const handleUnfavorite = (article: Article) => {
    toggleFavorite(article.objectID);
  };

  const onRefresh = async () => {
    await refetch();
  };

  if (isLoading || !isHydrated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Error loading articles</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (favoriteArticles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="heart-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No favorite articles yet</Text>
          <Text style={styles.emptySubtext}>Tap the heart icon to save your favorites</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={favoriteArticles}
        keyExtractor={(item, index) => `${item.objectID}-${index}`}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
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
