import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export async function initPushNotifications() {
  try {
    const isNative = Capacitor.isNativePlatform();
    console.log('🔔 Initialisation des notifications - Platform:', isNative ? 'Native' : 'Web');
    
    if (isNative) {
      // Sur iOS/Android, on utilise PushNotifications et LocalNotifications
      try {
        // D'abord les push notifications (iOS nécessite ça)
        const pushCheckStatus = await PushNotifications.checkPermissions();
        console.log('📋 Push notification status:', pushCheckStatus);

        let pushPermStatus = pushCheckStatus;
        if (pushCheckStatus.receive !== 'granted') {
          console.log('🔔 Demande de permissions notifications...');
          pushPermStatus = await PushNotifications.requestPermissions();
          console.log('✅ Résultat permissions:', pushPermStatus);
        }

        // Enregistrer l'appareil si autorisé
        if (pushPermStatus.receive === 'granted') {
          await PushNotifications.register();
          console.log('📱 Appareil enregistré pour les notifications');
          
          // Maintenant qu'on a les permissions push, essayer les notifications locales
          try {
            const localPermStatus = await LocalNotifications.requestPermissions();
            console.log('✅ Permissions locales:', localPermStatus);
            
            // Setup listeners locaux
            LocalNotifications.addListener('localNotificationReceived', (notification) => {
              console.log('📩 Notification locale reçue:', notification);
            });

            LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
              console.log('👆 Notification locale cliquée:', notification);
            });
          } catch (localError) {
            console.log('ℹ️ Local notifications not available:', localError);
          }
        } else {
          console.warn('⚠️ Notifications non autorisées');
        }

        // Setup push listeners
        PushNotifications.addListener('registration', (token) => {
          console.log('🔑 Device token:', token.value);
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('❌ Erreur registration:', err);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('📩 Notification reçue:', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('👆 Notification cliquée:', notification);
        });

      } catch (error) {
        console.error('❌ Erreur notifications native:', error);
      }
    } else {
      // Sur web, uniquement les notifications locales
      try {
        const localPermStatus = await LocalNotifications.requestPermissions();
        console.log('✅ Permissions web:', localPermStatus);
        
        LocalNotifications.addListener('localNotificationReceived', (notification) => {
          console.log('📩 Notification locale reçue:', notification);
        });

        LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
          console.log('👆 Notification locale cliquée:', notification);
        });
      } catch (error) {
        console.log('ℹ️ Notifications web non disponibles:', error);
      }
    }

    console.log('✅ Initialisation terminée');

  } catch (error) {
    console.error('❌ Erreur critique:', error);
  }
}
