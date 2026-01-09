import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function usePushNotifications() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      checkPermission();
    }
  }, []);

  const checkPermission = async () => {
    const status = await navigator.permissions.query({ name: 'notifications' });
    setPermission(status.state);
  };

  const requestPermission = async () => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribe = async () => {
    if (!isSupported || !user) {
      return false;
    }

    try {
      // Registrar o service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Solicitar permissão se ainda não tiver
      if (permission === 'default') {
        const granted = await requestPermission();
        if (!granted) {
          return false;
        }
      }

      // Subscrever para push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.VAPID_PUBLIC_KEY || '')
      });

      setSubscription(subscription);

      // Enviar subscription para o servidor
      const token = localStorage.getItem('@droneApp:token');
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subscription })
      });

      if (response.ok) {
        console.log('Successfully subscribed to push notifications');
        return true;
      } else {
        console.error('Failed to save subscription');
        return false;
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return false;
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      
      // Remover do servidor
      const token = localStorage.getItem('@droneApp:token');
      await fetch('/api/notifications/subscribe', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe
  };
}

// Função auxiliar para converter chave VAPID
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}