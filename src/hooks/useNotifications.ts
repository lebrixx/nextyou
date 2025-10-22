import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { quotes, getRandomQuotes } from '@/data/quotes';

export const useNotifications = () => {
  useEffect(() => {
    // Request notification permissions
    const requestPermissions = async () => {
      const result = await LocalNotifications.requestPermissions();
      if (result.display === 'granted') {
        await scheduleQuoteNotifications();
      }
    };

    requestPermissions();
  }, []);

  const scheduleQuoteNotifications = async () => {
    // Clear existing notifications
    await LocalNotifications.cancel({ notifications: [] });

    // Schedule daily quote notifications at 9 AM
    const randomQuotes = getRandomQuotes(30); // 30 days of quotes
    
    const notifications = randomQuotes.map((quote, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      date.setHours(9, 0, 0, 0);

      return {
        id: index + 1,
        title: '💪 Ta citation du jour',
        body: `"${quote.text}" - ${quote.author}`,
        schedule: { at: date },
      };
    });

    await LocalNotifications.schedule({ notifications });
  };

  const sendInstantQuote = async () => {
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
  };

  return { scheduleQuoteNotifications, sendInstantQuote };
};
