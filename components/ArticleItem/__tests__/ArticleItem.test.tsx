import { Article } from '@/types/article';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { ArticleItem } from '../ArticleItem';

describe('ArticleItem', () => {
  const mockArticle: Article = {
    objectID: '1',
    title: 'Test Article Title',
    author: 'testuser',
    created_at: '2024-01-01T00:00:00.000Z',
    url: 'https://example.com',
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render article title', () => {
    const { getByText } = render(
      <ArticleItem article={mockArticle} onPress={mockOnPress} />
    );

    expect(getByText('Test Article Title')).toBeTruthy();
  });

  it('should render author name', () => {
    const { getByText } = render(
      <ArticleItem article={mockArticle} onPress={mockOnPress} />
    );

    expect(getByText(/testuser/)).toBeTruthy();
  });

  it('should render story title when available', () => {
    const articleWithStoryTitle = {
      ...mockArticle,
      story_title: 'Story Title Here',
    };

    const { getByText } = render(
      <ArticleItem article={articleWithStoryTitle} onPress={mockOnPress} />
    );

    expect(getByText('Story Title Here')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = render(
      <ArticleItem article={mockArticle} onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Test Article Title'));

    expect(mockOnPress).toHaveBeenCalledWith(mockArticle);
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should display relative time', () => {
    const { getByText } = render(
      <ArticleItem article={mockArticle} onPress={mockOnPress} />
    );

    // Should contain "ago" from formatDistanceToNow
    expect(getByText(/ago/)).toBeTruthy();
  });
});
