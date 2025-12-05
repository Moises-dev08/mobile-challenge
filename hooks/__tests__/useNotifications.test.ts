import { renderHook, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { useNotifications } from '../useNotifications';

// Mock expo-device
let mockIsDevice = true;
jest.mock('expo-device', () => ({
  get isDevice() {
    return mockIsDevice;
  },
}));

// Mock expo-notifications
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { MAX: 4 },
  SchedulableTriggerInputTypes: { TIME_INTERVAL: 'timeInterval' },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

describe('useNotifications', () => {
  const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset Device.isDevice to true
    mockIsDevice = true;
    
    // Setup default mocks
    mockNotifications.getPermissionsAsync.mockResolvedValue({
      status: 'granted',
      expires: 'never',
      canAskAgain: true,
      granted: true,
    } as any);
    
    mockNotifications.addNotificationReceivedListener.mockReturnValue({
      remove: jest.fn(),
    } as any);
    
    mockNotifications.addNotificationResponseReceivedListener.mockReturnValue({
      remove: jest.fn(),
    } as any);
  });

  describe('initialization', () => {
    it('should initialize with undetermined permission status', () => {
      const { result } = renderHook(() => useNotifications());
      expect(result.current.permissionStatus).toBe('undetermined');
    });

    it('should request permissions on mount', async () => {
      renderHook(() => useNotifications());
      
      await waitFor(() => {
        expect(mockNotifications.getPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('should set up notification listeners', () => {
      renderHook(() => useNotifications());
      
      expect(mockNotifications.addNotificationReceivedListener).toHaveBeenCalled();
      expect(mockNotifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    });
  });

  describe('requestPermissions', () => {
    it('should update permission status when granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        canAskAgain: true,
        granted: true,
      } as any);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('granted');
      });
    });

    it('should request permissions if not granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'undetermined',
        expires: 'never',
        canAskAgain: true,
        granted: false,
      } as any);

      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        canAskAgain: true,
        granted: true,
      } as any);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
        expect(result.current.permissionStatus).toBe('granted');
      });
    });

    it('should handle denied permissions', async () => {
      // Clear all mocks and reset state
      jest.clearAllMocks();
      
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'denied',
        expires: 'never',
        canAskAgain: false,
        granted: false,
      } as any);

      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
        expires: 'never',
        canAskAgain: false,
        granted: false,
      } as any);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('denied');
      });
    });

    it('should set denied status on non-device', async () => {
      // Clear all mocks and reset state
      jest.clearAllMocks();
      
      mockIsDevice = false;

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('denied');
      });
    });

    it('should handle permission request errors', async () => {
      mockNotifications.getPermissionsAsync.mockRejectedValue(
        new Error('Permission error')
      );
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('denied');
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('scheduleArticleNotification', () => {
    const mockArticle = {
      objectID: '12345',
      title: 'Test Article',
      url: 'https://example.com',
      author: 'testauthor',
      points: 100,
      num_comments: 20,
      created_at: '2024-01-01T00:00:00.000Z',
      created_at_i: 1704067200,
    };

    it('should schedule notification for article', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        canAskAgain: true,
        granted: true,
      } as any);

      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('granted');
      });

      await result.current.scheduleArticleNotification(mockArticle);

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '📰 New Article',
          body: mockArticle.title,
          data: {
            articleId: mockArticle.objectID,
            articleUrl: mockArticle.url,
            articleTitle: mockArticle.title,
          },
        },
        trigger: null,
      });
    });

    it('should not schedule notification when permissions not granted', async () => {
      // Clear all mocks and reset state
      jest.clearAllMocks();
      
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'denied',
        expires: 'never',
        canAskAgain: false,
        granted: false,
      } as any);

      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'denied',
        expires: 'never',
        canAskAgain: false,
        granted: false,
      } as any);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('denied');
      });

      await result.current.scheduleArticleNotification(mockArticle);

      expect(mockNotifications.scheduleNotificationAsync).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Cannot schedule notification: permissions not granted'
      );

      consoleSpy.mockRestore();
    });

    it('should handle scheduling errors gracefully', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        canAskAgain: true,
        granted: true,
      } as any);

      mockNotifications.scheduleNotificationAsync.mockRejectedValue(
        new Error('Schedule error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('granted');
      });

      await result.current.scheduleArticleNotification(mockArticle);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('sendTestNotification', () => {
    it('should send test notification when permissions granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        canAskAgain: true,
        granted: true,
      } as any);

      mockNotifications.scheduleNotificationAsync.mockResolvedValue('test-notification-id');

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('granted');
      });

      await result.current.sendTestNotification();

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '🧪 Test Notification',
          body: 'This is a test notification from your settings',
          data: { test: true },
        },
        trigger: { type: 'timeInterval', seconds: 1 },
      });
    });

    it('should request permissions when not granted', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'undetermined',
        expires: 'never',
        canAskAgain: true,
        granted: false,
      } as any);

      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('undetermined');
      });

      await result.current.sendTestNotification();

      // Should call requestPermissions
      await waitFor(() => {
        expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
      });
    });

    it('should handle test notification errors', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        expires: 'never',
        canAskAgain: true,
        granted: true,
      } as any);

      mockNotifications.scheduleNotificationAsync.mockRejectedValue(
        new Error('Test error')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const { result } = renderHook(() => useNotifications());

      await waitFor(() => {
        expect(result.current.permissionStatus).toBe('granted');
      });

      await result.current.sendTestNotification();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error sending test notification:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('cleanup', () => {
    it('should remove listeners on unmount', () => {
      const mockRemove1 = jest.fn();
      const mockRemove2 = jest.fn();

      mockNotifications.addNotificationReceivedListener.mockReturnValue({
        remove: mockRemove1,
      } as any);

      mockNotifications.addNotificationResponseReceivedListener.mockReturnValue({
        remove: mockRemove2,
      } as any);

      const { unmount } = renderHook(() => useNotifications());

      unmount();

      expect(mockRemove1).toHaveBeenCalled();
      expect(mockRemove2).toHaveBeenCalled();
    });
  });
});
