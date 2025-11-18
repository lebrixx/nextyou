import { PushNotifications } from '@capacitor/push-notifications';

export async function initPushNotifications() {
  try {
    // Demander la permission de notifications
    const permStatus = await PushNotifications.requestPermissions();

    if (permStatus.receive === 'granted') {
      // Enregistrer l'appareil pour recevoir les notifications push
      await PushNotifications.register();
      console.log('Push notifications registration lancée');
    } else {
      console.log('Notifications refusées :', permStatus);
      return;
    }

    // Listener : token reçu avec succès
    PushNotifications.addListener('registration', (token) => {
      console.log('Device token :', token.value);
      // TODO: envoyer ce token au backend pour l'associer à l'utilisateur
    });

    // Listener : erreur lors de l'enregistrement
    PushNotifications.addListener('registrationError', (err) => {
      console.error('Erreur registration push :', err);
    });

    // Listener : notification reçue pendant que l'app est au premier plan
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Notification reçue :', notification);
      // TODO: afficher la notification dans l'app si nécessaire
    });

    // Listener : notification cliquée (app ouverte via notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Notification cliquée :', notification);
      // TODO: naviguer vers la bonne section de l'app
    });

  } catch (error) {
    console.error('Erreur initialisation push notifications :', error);
  }
}
