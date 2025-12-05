import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import { fetchMobileArticles } from '@/api/hnApi';
import { useArticleStore } from '@/stores/articleStore';
import { Article, HNResponse } from '@/types/article';
import { SwipeableArticleItem } from '../ArticleItem/SwipeableArticleItem';
import { styles } from './styles';

export const ArticleList = () => {
  // Subscribe to specific state slices for proper re-rendering
  const deletedIds = useArticleStore((state) => state.deletedIds);
  const favoriteIds = useArticleStore((state) => state.favoriteIds);
  const isHydrated = useArticleStore((state) => state.isHydrated);
  const deleteArticle = useArticleStore((state) => state.deleteArticle);
  const toggleFavorite = useArticleStore((state) => state.toggleFavorite);
  const isFavorited = useArticleStore((state) => state.isFavorited);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<HNResponse>({
    queryKey: ['articles'],
    queryFn: ({ pageParam = 0 }) => fetchMobileArticles(pageParam as number),
    getNextPageParam: (lastPage) => {
      // Check if there are more pages available
      if (lastPage.page + 1 < lastPage.nbPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 0,
  });

  // Flatten all pages into a single array of articles and filter out deleted ones
  const articles = useMemo(() => {
    const allArticles = data?.pages.flatMap((page) => page.hits) ?? [];
    return allArticles.filter((article) => !deletedIds.has(article.objectID));
  }, [data, deletedIds]);

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

  const handleDelete = (article: Article) => {
    deleteArticle(article.objectID);
  };

  const handleFavorite = (article: Article) => {
    toggleFavorite(article.objectID);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  if (isLoading || !isHydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text>Error fetching articles</Text>
      </View>
    );
  }

  const onRefresh = async () => {
    await refetch();
  };

  return (
    <FlatList
      data={articles}
      keyExtractor={(item, index) => `${item.objectID}-${index}`}
      renderItem={({ item }) => (
        <SwipeableArticleItem
          article={item}
          onPress={handlePress}
          onDelete={handleDelete}
          onFavorite={handleFavorite}
          isFavorited={favoriteIds.has(item.objectID)}
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
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      contentContainerStyle={styles.list}
    />
  );
};
