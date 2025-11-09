import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { quotes, getRandomQuotes } from '@/data/quotes';

export const useNotifications = () => {
  // Removed auto-triggering useEffect to prevent unwanted notifications

  const scheduleQuoteNotifications = async () => {
    // Clear existing notifications
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    // Get quotes per day from localStorage
    const quotesPerDay = parseInt(localStorage.getItem("quotes_per_day") || "3");
    const totalDays = 30;
    const totalNotifications = totalDays * quotesPerDay;
    
    const randomQuotes = getRandomQuotes(totalNotifications);
    
    const notifications = [];
    let notificationId = 1;

    for (let day = 0; day < totalDays; day++) {
      // Distribute notifications evenly throughout the day
      const hoursInDay = 14; // Between 9 AM and 11 PM
      const intervalHours = hoursInDay / quotesPerDay;
      
      for (let i = 0; i < quotesPerDay; i++) {
        // Calculate time slot for this notification
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
