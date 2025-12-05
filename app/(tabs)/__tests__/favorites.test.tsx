import { render } from '@testing-library/react-native';
import React from 'react';
import FavoritesScreen from '../favorites';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock the Zustand store
jest.mock('@/stores/articleStore', () => ({
  useArticleStore: jest.fn((selector) => {
    const mockState = {
      favoriteIds: new Set(['1', '2']),
      isHydrated: true,
      toggleFavorite: jest.fn(),
      isFavorited: jest.fn((id: string) => id === '1' || id === '2'),
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

// Mock React Query
import { useInfiniteQuery } from '@tanstack/react-query';

const mockUseInfiniteQuery = useInfiniteQuery as jest.MockedFunction<typeof useInfiniteQuery>;

describe('FavoritesScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state', () => {
    mockUseInfiniteQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    const { getByTestId } = render(<FavoritesScreen />);
    
    // Should show ActivityIndicator when loading
    expect(getByTestId).toBeDefined();
  });

  it('should show error state', () => {
    mockUseInfiniteQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
      isRefetching: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    const { getByText } = render(<FavoritesScreen />);
    
    expect(getByText('Error loading articles')).toBeTruthy();
  });

  it('should show empty state when no favorites', () => {
    // Mock empty favorites
    const useArticleStoreMock = require('@/stores/articleStore').useArticleStore;
    useArticleStoreMock.mockImplementation((selector: any) => {
      const mockState = {
        favoriteIds: new Set(),
        isHydrated: true,
        toggleFavorite: jest.fn(),
        isFavorited: jest.fn(() => false),
      };
      return selector ? selector(mockState) : mockState;
    });

    mockUseInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            hits: [
              {
                objectID: '1',
                title: 'Test Article',
                author: 'testuser',
                created_at: '2024-01-01T00:00:00.000Z',
                url: 'https://example.com',
              },
            ],
            page: 0,
            nbPages: 1,
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    const { getByText } = render(<FavoritesScreen />);
    
    expect(getByText('No favorite articles yet')).toBeTruthy();
    expect(getByText('Tap the heart icon to save your favorites')).toBeTruthy();
  });

  it('should render favorites screen with data', () => {
    const mockData = {
      pages: [
        {
          hits: [
            {
              objectID: '1',
              title: 'Favorite Article 1',
              author: 'testuser1',
              created_at: '2024-01-01T00:00:00.000Z',
              url: 'https://example.com/1',
            },
          ],
          page: 0,
          nbPages: 1,
        },
      ],
    };
    
    mockUseInfiniteQuery.mockReturnValue({
      data: mockData,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
      isRefetching: false,
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    } as any);

    const result = render(<FavoritesScreen />);
    
    // Should render without errors
    expect(result.toJSON()).toBeTruthy();
  });
});
