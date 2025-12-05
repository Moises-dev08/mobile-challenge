import { render } from '@testing-library/react-native';
import React from 'react';
import HomeScreen from '../index';

// Mock the ArticleList component
jest.mock('@/components/ArticleList/ArticleList', () => ({
  ArticleList: () => {
    const React = require('react');
    const { Text, View } = require('react-native');
    return (
      <View testID="article-list">
        <Text>Article List</Text>
      </View>
    );
  },
}));

describe('HomeScreen (index)', () => {
  it('should render ArticleList component', () => {
    const { getByTestId } = render(<HomeScreen />);
    
    expect(getByTestId('article-list')).toBeTruthy();
  });

  it('should display article list content', () => {
    const { getByText } = render(<HomeScreen />);
    
    expect(getByText('Article List')).toBeTruthy();
  });
});
