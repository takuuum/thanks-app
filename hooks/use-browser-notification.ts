import { useEffect, useState } from 'react';

export function useBrowserNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // ブラウザが通知をサポートしているかチェック
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('[v0] Notification permission error:', error);
      return false;
    }
  };

  const showNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') {
      return;
    }

    try {
      new Notification(title, {
        icon: '/icon.svg',
        badge: '/icon.svg',
        ...options,
      });
    } catch (error) {
      console.error('[v0] Show notification error:', error);
    }
  };

  const hasPermission = () => permission === 'granted';

  return {
    permission,
    isSupported,
    hasPermission,
    requestPermission,
    showNotification,
  };
}
