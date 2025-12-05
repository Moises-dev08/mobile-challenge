import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import { fetchMobileArticles } from '@/api/hnApi';
import { Article, HNResponse } from '@/types/article';
import {
  getDeletedArticleIds,
  getFavoriteArticleIds,
  saveDeletedArticleIds,
  saveFavoriteArticleIds,
} from '@/utils/storage';
import { SwipeableArticleItem } from '../ArticleItem/SwipeableArticleItem';
import { styles } from './styles';

export const ArticleList = () => {
  const [deletedArticleIds, setDeletedArticleIds] = useState<Set<string>>(new Set());
  const [favoriteArticleIds, setFavoriteArticleIds] = useState<Set<string>>(new Set());
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(true);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  // Load deleted and favorite article IDs from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      const [deletedIds, favoriteIds] = await Promise.all([
        getDeletedArticleIds(),
        getFavoriteArticleIds(),
      ]);
      setDeletedArticleIds(deletedIds);
      setFavoriteArticleIds(favoriteIds);
      setIsLoadingDeleted(false);
      setIsLoadingFavorites(false);
    };
    loadData();
  }, []);

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
    return allArticles.filter((article) => !deletedArticleIds.has(article.objectID));
  }, [data, deletedArticleIds]);

  const onRefresh = async () => {
    await refetch();
  };

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

  const handleDelete = async (article: Article) => {
    // Optimistic update: immediately update UI
    const newDeletedIds = new Set(deletedArticleIds).add(article.objectID);
    setDeletedArticleIds(newDeletedIds);

    // Persist to AsyncStorage in background
    try {
      await saveDeletedArticleIds(newDeletedIds);
    } catch (error) {
      console.error('Failed to save deleted article:', error);
      // Revert optimistic update on error
      setDeletedArticleIds(deletedArticleIds);
    }
  };

  const handleFavorite = async (article: Article) => {
    // Toggle favorite status
    const newFavoriteIds = new Set(favoriteArticleIds);
    if (newFavoriteIds.has(article.objectID)) {
      newFavoriteIds.delete(article.objectID);
    } else {
      newFavoriteIds.add(article.objectID);
    }
    
    // Optimistic update
    setFavoriteArticleIds(newFavoriteIds);

    // Persist to AsyncStorage
    try {
      await saveFavoriteArticleIds(newFavoriteIds);
    } catch (error) {
      console.error('Failed to save favorite article:', error);
      // Revert on error
      setFavoriteArticleIds(favoriteArticleIds);
    }
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

  if (isLoading || isLoadingDeleted || isLoadingFavorites) {
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

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.objectID.toString()}
      renderItem={({ item }) => (
        <SwipeableArticleItem
          article={item}
          onPress={handlePress}
          onDelete={handleDelete}
          onFavorite={handleFavorite}
          isFavorited={favoriteArticleIds.has(item.objectID)}
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
