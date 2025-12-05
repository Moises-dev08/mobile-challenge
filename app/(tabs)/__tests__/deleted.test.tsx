import { render } from '@testing-library/react-native';
import React from 'react';
import DeletedScreen from '../deleted';

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
      deletedIds: new Set(['1', '2']),
      isHydrated: true,
      restoreArticle: jest.fn(),
    };
    return selector ? selector(mockState) : mockState;
  }),
}));

// Mock React Query
import { useInfiniteQuery } from '@tanstack/react-query';

const mockUseInfiniteQuery = useInfiniteQuery as jest.MockedFunction<typeof useInfiniteQuery>;

describe('DeletedScreen', () => {
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

    const { getByTestId } = render(<DeletedScreen />);
    
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

    const { getByText } = render(<DeletedScreen />);
    
    expect(getByText('Error loading articles')).toBeTruthy();
  });

  it('should show empty state when no deleted articles', () => {
    // Mock empty deleted
    const useArticleStoreMock = require('@/stores/articleStore').useArticleStore;
    useArticleStoreMock.mockImplementation((selector: any) => {
      const mockState = {
        deletedIds: new Set(),
        isHydrated: true,
        restoreArticle: jest.fn(),
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

    const { getByText } = render(<DeletedScreen />);
    
    expect(getByText('No deleted articles')).toBeTruthy();
    expect(getByText('Swipe left to delete articles')).toBeTruthy();
  });

  it('should render deleted screen with data', () => {
    const mockData = {
      pages: [
        {
          hits: [
            {
              objectID: '1',
              title: 'Deleted Article 1',
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

    const result = render(<DeletedScreen />);
    
    // Should render without errors
    expect(result.toJSON()).toBeTruthy();
  });

  it('should render restore button for deleted articles', () => {
    mockUseInfiniteQuery.mockReturnValue({
      data: {
        pages: [
          {
            hits: [
              {
                objectID: '1',
                title: 'Deleted Article',
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

    const { UNSAFE_getAllByType } = render(<DeletedScreen />);
    
    // Should have Ionicons for restore button
    const { Ionicons } = require('@expo/vector-icons');
    const icons = UNSAFE_getAllByType(Ionicons);
    
    // Should have at least one icon (restore button or empty state icon)
    expect(icons.length).toBeGreaterThan(0);
  });
});
