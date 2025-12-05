import type { Article } from '@/types/article';
import { createArticleNotification } from '@/utils/notifications';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const notificationListener = useRef<Notifications.EventSubscription | undefined>(undefined);
  const responseListener = useRef<Notifications.EventSubscription | undefined>(undefined);

  useEffect(() => {
    // Request permissions on mount
    requestPermissions();

    // Set up notification listener (when notification is received while app is running)
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('📬 Notification received:', notification);
    });

    // Set up response listener (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('👆 Notification tapped:', response);
      handleNotificationResponse(response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  /**
   * Request notification permissions
   */
  const requestPermissions = async () => {
    try {
      // Set up notification channel for Android 13+
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      // Check if using physical device
      if (!Device.isDevice) {
        console.warn('Notifications require a physical device');
        setPermissionStatus('denied');
        return;
      }

      // Get current permission status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus === 'granted' ? 'granted' : 'denied');
      
      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      setPermissionStatus('denied');
    }
  };

  /**
   * Handle notification tap - navigate to article
   */
  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    if (data.articleUrl && data.articleId) {
      // Navigate to article webview
      router.push({
        pathname: '/article-webview',
        params: {
          url: data.articleUrl as string,
          title: data.articleTitle as string,
        },
      });
    }
  };

  /**
   * Schedule a local notification for an article
   */
  const scheduleArticleNotification = async (article: Article) => {
    try {
      if (permissionStatus !== 'granted') {
        console.warn('Cannot schedule notification: permissions not granted');
        return;
      }

      const notification = createArticleNotification(article);
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data,
        },
        trigger: null, // Immediate notification
      });

      console.log('✅ Notification scheduled for article:', article.title);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  /**
   * Send a test notification
   */
  const sendTestNotification = async () => {
    try {
      if (permissionStatus !== 'granted') {
        await requestPermissions();
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Notification',
          body: 'This is a test notification from your settings',
          data: { test: true },
        },
        trigger: {  type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 1 },
      });

      console.log('✅ Test notification sent');
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  return {
    permissionStatus,
    requestPermissions,
    scheduleArticleNotification,
    sendTestNotification,
  };
}
