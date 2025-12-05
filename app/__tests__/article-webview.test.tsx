import { render } from '@testing-library/react-native';
import React from 'react';
import ArticleWebViewScreen from '../article-webview';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
  },
  useLocalSearchParams: jest.fn(),
}));

// Mock react-native-webview
jest.mock('react-native-webview', () => ({
  WebView: 'WebView',
}));

import { useLocalSearchParams } from 'expo-router';

describe('ArticleWebViewScreen', () => {
  const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
    typeof useLocalSearchParams
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render WebView with valid URL', () => {
    mockUseLocalSearchParams.mockReturnValue({
      url: 'https://example.com',
      title: 'Test Article',
    });

    const { getByText } = render(<ArticleWebViewScreen />);

    expect(getByText('Test Article')).toBeTruthy();
  });

  it('should show error when no URL is provided', () => {
    mockUseLocalSearchParams.mockReturnValue({});

    const { getByText } = render(<ArticleWebViewScreen />);

    expect(getByText('No URL provided')).toBeTruthy();
    expect(getByText('Go Back')).toBeTruthy();
  });

  it('should show loading text initially', () => {
    mockUseLocalSearchParams.mockReturnValue({
      url: 'https://example.com',
      title: 'Test Article',
    });

    const { getByText } = render(<ArticleWebViewScreen />);

    expect(getByText('Loading article...')).toBeTruthy();
  });
});
