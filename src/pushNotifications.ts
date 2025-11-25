import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export async function initPushNotifications() {
  try {
    const isNative = Capacitor.isNativePlatform();
    
    // Demander la permission pour les notifications locales
    const localPermStatus = await LocalNotifications.requestPermissions();
    console.log('Local notifications permission:', localPermStatus);

    // Only try push notifications on native platforms (iOS/Android)
    if (isNative) {
      try {
        const permStatus = await PushNotifications.requestPermissions();

        if (permStatus.receive === 'granted') {
          await PushNotifications.register();
          console.log('Push notifications registration lancée');
        } else {
          console.log('Push notifications refusées:', permStatus);
        }

        // Listeners pour push notifications
        PushNotifications.addListener('registration', (token) => {
          console.log('Device token:', token.value);
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('Erreur registration push:', err);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Notification reçue:', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Notification cliquée:', notification);
        });
      } catch (error) {
        console.log('Push notifications not available (native):', error);
      }
    } else {
      console.log('Push notifications not available on web - using local notifications only');
    }

    // Listener pour les notifications locales (web et mobile)
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('Local notification reçue:', notification);
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Local notification cliquée:', notification);
    });

  } catch (error) {
    console.error('Erreur initialisation notifications:', error);
  }
}
