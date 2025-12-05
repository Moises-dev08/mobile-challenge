import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { fetchMobileArticles } from '@/api/hnApi';
import { ArticleItem } from '@/components/ArticleItem/ArticleItem';
import { Article } from '@/types/article';
import { getDeletedArticleIds, saveDeletedArticleIds } from '@/utils/storage';

export default function DeletedScreen() {
  const [deletedArticleIds, setDeletedArticleIds] = useState<Set<string>>(new Set());
  const [isLoadingDeleted, setIsLoadingDeleted] = useState(true);

  // Load deleted IDs from storage
  useEffect(() => {
    const loadDeleted = async () => {
      const ids = await getDeletedArticleIds();
      setDeletedArticleIds(ids);
      setIsLoadingDeleted(false);
    };
    loadDeleted();
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

  // Filter only deleted articles
  const deletedArticles = React.useMemo(() => {
    const allArticles = data?.pages.flatMap((page) => page.hits) ?? [];
    return allArticles.filter((article) => deletedArticleIds.has(article.objectID));
  }, [data, deletedArticleIds]);

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

  const handleRestore = async (article: Article) => {
    const newDeletedIds = new Set(deletedArticleIds);
    newDeletedIds.delete(article.objectID);
    
    setDeletedArticleIds(newDeletedIds);

    try {
      await saveDeletedArticleIds(newDeletedIds);
    } catch (error) {
      console.error('Failed to restore article:', error);
      // Revert on error
      setDeletedArticleIds(deletedArticleIds);
    }
  };

  const onRefresh = async () => {
    await refetch();
  };

  if (isLoading || isLoadingDeleted) {
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

  if (deletedArticles.length === 0) {
    return (
      <View style={styles.center}>
        <Ionicons name="trash-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No deleted articles</Text>
        <Text style={styles.emptySubtext}>Swipe left to delete articles</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={deletedArticles}
      keyExtractor={(item) => item.objectID.toString()}
      renderItem={({ item }) => (
        <View style={styles.itemContainer}>
          <ArticleItem article={item} onPress={handlePress} />
          <Pressable 
            style={styles.restoreButton}
            onPress={() => handleRestore(item)}>
            <Ionicons name="arrow-undo-outline" size={20} color="#007AFF" />
            <Text style={styles.restoreText}>Restore</Text>
          </Pressable>
        </View>
      )}
      refreshControl={
        <RefreshControl 
          refreshing={isRefetching} 
          onRefresh={onRefresh}
          tintColor="#007AFF"
          colors={['#007AFF']}
        />
      }
      contentContainerStyle={deletedArticles.length === 0 ? styles.center : styles.list}
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  restoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  restoreText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
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
