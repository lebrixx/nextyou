import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { quotes, getRandomQuotes } from '@/data/quotes';

export const useNotifications = () => {
  const scheduleQuoteNotifications = async () => {
    try {
      const isNative = Capacitor.isNativePlatform();

      // Vérifier les permissions avant de programmer
      if (isNative) {
        const pushStatus = await PushNotifications.checkPermissions();
        if (pushStatus.receive !== 'granted') {
          console.warn('⚠️ Push notifications non autorisées');
          throw new Error('Les notifications ne sont pas autorisées. Active-les dans les paramètres iOS.');
        }
      }

      const localStatus = await LocalNotifications.checkPermissions();
      if (localStatus.display !== 'granted') {
        console.warn('⚠️ Notifications locales non autorisées');
        
        // Essayer de demander les permissions
        const result = await LocalNotifications.requestPermissions();
        if (result.display !== 'granted') {
          throw new Error('Les notifications ne sont pas autorisées. Active-les dans les paramètres.');
        }
      }

      // Clear existing notifications
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }

      // Get quotes per day from localStorage
      const quotesPerDay = parseInt(localStorage.getItem("quotes_per_day") || "3");
      const totalDays = Math.min(20, 30);
      const totalNotifications = Math.min(totalDays * quotesPerDay, 64);
      
      const randomQuotes = getRandomQuotes(totalNotifications);
      
      const notifications = [];
      let notificationId = 1;

      for (let day = 0; day < totalDays; day++) {
        const hoursInDay = 14;
        const intervalHours = hoursInDay / quotesPerDay;
        
        for (let i = 0; i < quotesPerDay; i++) {
          const baseHour = 9 + Math.floor(i * intervalHours);
          const randomMinute = Math.floor(Math.random() * 60);
          
          const date = new Date();
          date.setDate(date.getDate() + day);
          date.setHours(baseHour, randomMinute, 0, 0);

          const quote = randomQuotes[(day * quotesPerDay) + i];

          notifications.push({
            id: notificationId++,
            title: '💪 Citation inspirante',
            body: `"${quote.text}" - ${quote.author}`,
            schedule: { at: date },
          });
        }
      }

      await LocalNotifications.schedule({ notifications });
      console.log(`✅ ${notifications.length} notifications programmées`);
    } catch (error) {
      console.error('❌ Erreur programmation notifications:', error);
      throw error;
    }
  };

  const sendInstantQuote = async () => {
    try {
      const localStatus = await LocalNotifications.checkPermissions();
      if (localStatus.display !== 'granted') {
        const result = await LocalNotifications.requestPermissions();
        if (result.display !== 'granted') {
          throw new Error('Notifications non autorisées');
        }
      }

      const quote = getRandomQuotes(1)[0];
      await LocalNotifications.schedule({
        notifications: [
          {
            id: 999,
            title: '✨ Citation inspirante',
            body: `"${quote.text}" - ${quote.author}`,
            schedule: { at: new Date(Date.now() + 1000) },
          },
        ],
      });
      console.log('✅ Notification instantanée envoyée');
    } catch (error) {
      console.error('❌ Erreur notification instantanée:', error);
      throw error;
    }
  };

  return { scheduleQuoteNotifications, sendInstantQuote };
};
