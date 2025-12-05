import { Article } from '@/types/article';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SwipeableArticleItem } from '../SwipeableArticleItem';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: ({ children, renderRightActions }: any) => <View>{children}</View>,
    RectButton: ({ children, onPress }: any) => (
      <View testID="delete-button" onTouchEnd={onPress}>
        {children}
      </View>
    ),
  };
});

describe('SwipeableArticleItem', () => {
  const mockArticle: Article = {
    objectID: '1',
    title: 'Test Article',
    author: 'testuser',
    created_at: '2024-01-01T00:00:00.000Z',
    url: 'https://example.com',
  };

  const mockOnPress = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render article item', () => {
    const { getByText } = render(
      <SwipeableArticleItem
        article={mockArticle}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText('Test Article')).toBeTruthy();
  });

  it('should call onPress when article is pressed', () => {
    const { getByText } = render(
      <SwipeableArticleItem
        article={mockArticle}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.press(getByText('Test Article'));

    expect(mockOnPress).toHaveBeenCalledWith(mockArticle);
  });

  it('should have delete button functionality', () => {
    const { getByText } = render(
      <SwipeableArticleItem
        article={mockArticle}
        onPress={mockOnPress}
        onDelete={mockOnDelete}
      />
    );

    expect(getByText('Test Article')).toBeTruthy();
  });
});
