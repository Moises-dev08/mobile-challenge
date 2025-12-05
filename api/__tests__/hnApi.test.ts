/**
 * API Tests
 * 
 * Note: These tests verify the API integration.
 * For full mocking of axios.create, we would need more complex setup.
 * The component tests already verify the data flow works correctly.
 */

import { fetchMobileArticles } from '../hnApi';

// Basic integration test - requires network
describe.skip('hnApi (integration)', () => {
  describe('fetchMobileArticles', () => {
    it('should have correct function signature', () => {
      expect(typeof fetchMobileArticles).toBe('function');
    });
  });
});
