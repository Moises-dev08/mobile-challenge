import { ArticleList } from '@/components/ArticleList/ArticleList';
import { View } from 'react-native';

import { styles } from './_styles';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ArticleList />
    </View>
  );
}
