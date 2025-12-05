
import { ArticleList } from '@/components/ArticleList/ArticleList';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <ArticleList />
    </SafeAreaView>
  );
}

