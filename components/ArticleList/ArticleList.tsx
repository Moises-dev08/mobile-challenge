import { useInfiniteQuery } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import { fetchMobileArticles } from '@/api/hnApi';
import { Article, HNResponse } from '@/types/article';
import { ArticleItem } from '../ArticleItem/ArticleItem';
import { styles } from './styles';

export const ArticleList = () => {
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

  // Flatten all pages into a single array of articles
  const articles = useMemo(() => {
    return data?.pages.flatMap((page) => page.hits) ?? [];
  }, [data]);

  const onRefresh = async () => {
    await refetch();
  };

  const handlePress = (article: Article) => {
    // Navigate to article detail
    console.log('Pressed article:', article.objectID);
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

  if (isLoading) {
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
      renderItem={({ item }) => <ArticleItem article={item} onPress={handlePress} />}
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
