import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { Article } from '@/types/article';
import { styles } from './styles';

interface ArticleItemProps {
  article: Article;
  onPress: (article: Article) => void;
  onFavorite?: (article: Article) => void;
  isFavorited?: boolean;
}

export const ArticleItem: React.FC<ArticleItemProps> = ({ 
  article, 
  onPress, 
  onFavorite,
  isFavorited = false,
}) => {
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
      {onFavorite && (
        <Pressable 
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            onFavorite(article);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons 
            name={isFavorited ? 'heart' : 'heart-outline'} 
            size={24} 
            color={isFavorited ? '#FF3B30' : '#666'} 
          />
        </Pressable>
      )}
    </Pressable>
  );
};
