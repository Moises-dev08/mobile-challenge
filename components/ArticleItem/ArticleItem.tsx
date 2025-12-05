import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Article } from '@/types/article';
import { styles } from './styles';

interface ArticleItemProps {
  article: Article;
  onPress: (article: Article) => void;
}

export const ArticleItem: React.FC<ArticleItemProps> = ({ article, onPress }) => {
  const timeAgo = formatDistanceToNow(new Date(article.created_at), { addSuffix: true });

  return (
    <Pressable style={styles.container} onPress={() => onPress(article)}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {article.story_title || article.title}
        </Text>
        <Text style={styles.meta}>
          {article.author} - {timeAgo}
        </Text>
      </View>
    </Pressable>
  );
};
