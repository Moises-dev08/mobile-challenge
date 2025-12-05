import { useInfiniteQuery } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { ArticleList } from '../ArticleList';

jest.mock('@tanstack/react-query');
const mockedUseInfiniteQuery = useInfiniteQuery as jest.MockedFunction<typeof useInfiniteQuery>;

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock the Zustand store
let mockDeletedIds = new Set<string>();

jest.mock('@/stores/articleStore', () => ({
  useArticleStore: jest.fn((selector?: any) => {
    const mockState: any = {
      deletedIds: mockDeletedIds,
      favoriteIds: new Set<string>(),
      isHydrated: true,
      deleteArticle: jest.fn((id: string) => {
        mockDeletedIds.add(id);
      }),
      restoreArticle: jest.fn(),
      toggleFavorite: jest.fn(),
      isFavorited: jest.fn(),
      isDeleted: jest.fn((id: string) => mockDeletedIds.has(id)),
      setHydrated: jest.fn(),
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

// Mock SwipeableArticleItem to simplify testing
jest.mock('../../ArticleItem/SwipeableArticleItem', () => ({
  SwipeableArticleItem: ({ article, onPress, onDelete }: any) => {
    const { View, Text, Pressable } = require('react-native');
    return (
      <View>
        <Pressable onPress={() => onPress(article)}>
          <Text>{article.title}</Text>
        </Pressable>
        <Pressable testID={`delete-${article.objectID}`} onPress={() => onDelete(article)}>
          <Text>Delete</Text>
        </Pressable>
      </View>
    );
  },
}));

describe('ArticleList', () => {
  const mockArticles = [
    {
      objectID: '1',
      title: 'Article 1',
      author: 'user1',
      created_at: '2024-01-01T00:00:00.000Z',
      url: 'https://example.com/1',
    },
    {
      objectID: '2',
      title: 'Article 2',
      author: 'user2',
      created_at: '2024-01-02T00:00:00.000Z',
      url: 'https://example.com/2',
    },
  ];

  const mockQueryResult = {
    data: {
      pages: [
        {
          hits: mockArticles,
          page: 0,
          nbPages: 5,
          hitsPerPage: 20,
          nbHits: 100,
        },
      ],
      pageParams: [0],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
    fetchNextPage: jest.fn(),
    hasNextPage: true,
    isFetchingNextPage: false,
    status: 'success' as const,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock deleted IDs between tests
    mockDeletedIds.clear();
  });

  it('should show loading indicator when loading', () => {
    mockedUseInfiniteQuery.mockReturnValue({
      ...mockQueryResult,
      isLoading: true,
      data: undefined,
    } as any);

    const { UNSAFE_queryByType } = render(<ArticleList />);
    
    // Look for ActivityIndicator
    const activityIndicators = UNSAFE_queryByType('ActivityIndicator' as any);
    expect(activityIndicators).toBeTruthy();
  });

  it('should render articles when data is loaded', async () => {
    mockedUseInfiniteQuery.mockReturnValue(mockQueryResult as any);

    const { getByText } = render(<ArticleList />);

    await waitFor(() => {
      expect(getByText('Article 1')).toBeTruthy();
      expect(getByText('Article 2')).toBeTruthy();
    });
  });

  it('should navigate to WebView when article is pressed', async () => {
    mockedUseInfiniteQuery.mockReturnValue(mockQueryResult as any);

    const { getByText } = render(<ArticleList />);

    await waitFor(() => {
      expect(getByText('Article 1')).toBeTruthy();
    });

    fireEvent.press(getByText('Article 1'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/article-webview',
      params: {
        url: 'https://example.com/1',
        title: 'Article 1',
      },
    });
  });

  it('should show error message when there is an error', () => {
    mockedUseInfiniteQuery.mockReturnValue({
      ...mockQueryResult,
      isError: true,
      data: undefined,
    } as any);

    const { getByText } = render(<ArticleList />);

    expect(getByText('Error fetching articles')).toBeTruthy();
  });

  it('should display multiple pages of articles', async () => {
    const multiPageData = {
      pages: [
        {
          hits: mockArticles,
          page: 0,
          nbPages: 5,
          hitsPerPage: 20,
          nbHits: 100,
        },
        {
          hits: [
            {
              objectID: '3',
              title: 'Article 3',
              author: 'user3',
              created_at: '2024-01-03T00:00:00.000Z',
              url: 'https://example.com/3',
            },
          ],
          page: 1,
          nbPages: 5,
          hitsPerPage: 20,
          nbHits: 100,
        },
      ],
      pageParams: [0, 1],
    };

    mockedUseInfiniteQuery.mockReturnValue({
      ...mockQueryResult,
      data: multiPageData,
    } as any);

    const { getByText } = render(<ArticleList />);

    // Should render articles from both pages
    await waitFor(() => {
      expect(getByText('Article 2')).toBeTruthy();
      expect(getByText('Article 3')).toBeTruthy();
    });
  });

  it('should show footer loading indicator when fetching next page', () => {
    mockedUseInfiniteQuery.mockReturnValue({
      ...mockQueryResult,
      isFetchingNextPage: true,
    } as any);

    const { UNSAFE_getAllByType } = render(<ArticleList />);

    // Should have multiple ActivityIndicators (one in footer)
    const activityIndicators = UNSAFE_getAllByType('ActivityIndicator' as any);
    expect(activityIndicators.length).toBeGreaterThan(0);
  });
});
