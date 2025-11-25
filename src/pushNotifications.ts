import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export async function initPushNotifications() {
  try {
    const isNative = Capacitor.isNativePlatform();
    console.log('🔔 Initialisation des notifications - Platform:', isNative ? 'Native' : 'Web');
    
    // ÉTAPE 1: Vérifier les permissions locales actuelles
    const localCheckStatus = await LocalNotifications.checkPermissions();
    console.log('📋 Statut actuel des permissions locales:', localCheckStatus);

    // ÉTAPE 2: Demander les permissions si nécessaire
    let localPermStatus = localCheckStatus;
    if (localCheckStatus.display !== 'granted') {
      console.log('🔔 Demande de permission pour les notifications locales...');
      localPermStatus = await LocalNotifications.requestPermissions();
      console.log('✅ Résultat permission locale:', localPermStatus);
    } else {
      console.log('✅ Permissions locales déjà accordées');
    }

    // ÉTAPE 3: Configuration spécifique iOS/Android
    if (isNative) {
      try {
        // Vérifier d'abord les permissions push
        const pushCheckStatus = await PushNotifications.checkPermissions();
        console.log('📋 Statut actuel des push notifications:', pushCheckStatus);

        // Demander si nécessaire
        let pushPermStatus = pushCheckStatus;
        if (pushCheckStatus.receive !== 'granted') {
          console.log('🔔 Demande de permission pour les push notifications...');
          pushPermStatus = await PushNotifications.requestPermissions();
          console.log('✅ Résultat permission push:', pushPermStatus);
        } else {
          console.log('✅ Push notifications déjà accordées');
        }

        // Enregistrer l'appareil si autorisé
        if (pushPermStatus.receive === 'granted') {
          await PushNotifications.register();
          console.log('📱 Appareil enregistré pour les push notifications');
        } else {
          console.warn('⚠️ Push notifications non autorisées:', pushPermStatus);
        }

        // Setup listeners (une seule fois)
        PushNotifications.addListener('registration', (token) => {
          console.log('🔑 Device token reçu:', token.value);
        });

        PushNotifications.addListener('registrationError', (err) => {
          console.error('❌ Erreur registration push:', err);
        });

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('📩 Push notification reçue:', notification);
        });

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('👆 Push notification cliquée:', notification);
        });
      } catch (error) {
        console.error('❌ Erreur push notifications:', error);
      }
    } else {
      console.log('ℹ️ Mode web - push notifications non disponibles');
    }

    // Setup listeners locaux (web et mobile)
    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('📩 Notification locale reçue:', notification);
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('👆 Notification locale cliquée:', notification);
    });

    console.log('✅ Initialisation des notifications terminée avec succès');

  } catch (error) {
    console.error('❌ Erreur critique lors de l\'initialisation des notifications:', error);
  }
}
