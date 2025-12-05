import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMobileArticles } from '@/api/hnApi';
import { ArticleItem } from '@/components/ArticleItem/ArticleItem';
import { useArticleStore } from '@/stores/articleStore';
import { Article } from '@/types/article';

export default function DeletedScreen() {
  const { deletedIds, isHydrated, restoreArticle } = useArticleStore();

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
  const deletedArticles = useMemo(() => {
    const allArticles = data?.pages.flatMap((page) => page.hits) ?? [];
    return allArticles.filter((article) => deletedIds.has(article.objectID));
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

  const handleRestore = (article: Article) => {
    restoreArticle(article.objectID);
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

  if (deletedArticles.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Ionicons name="trash-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No deleted articles</Text>
          <Text style={styles.emptySubtext}>Swipe left to delete articles</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={deletedArticles}
        keyExtractor={(item, index) => `${item.objectID}-${index}`}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.articleWrapper}>
              <ArticleItem article={item} onPress={handlePress} />
            </View>
            <Pressable 
              style={styles.restoreButton}
              onPress={() => handleRestore(item)}>
              <Ionicons name="arrow-undo-outline" size={24} color="#007AFF" />
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
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  articleWrapper: {
    flex: 1,
  },
  restoreButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginRight: 8,
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
