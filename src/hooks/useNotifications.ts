import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { getRandomQuotes } from '@/data/quotes';

interface QuoteSettings {
  enabled: boolean;
  mode: 'range' | 'specific' | 'random';
  quotesPerDay: number;
  startTime: string;
  endTime: string;
  specificTimes: string[];
}

const getQuoteSettings = (): QuoteSettings => {
  const saved = localStorage.getItem("quote_notification_settings");
  if (saved) {
    return JSON.parse(saved);
  }
  return {
    enabled: false,
    mode: 'range',
    quotesPerDay: 3,
    startTime: "08:00",
    endTime: "21:00",
    specificTimes: ["09:00", "14:00", "19:00"],
  };
};

const parseTime = (timeStr: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return { hours, minutes };
};

export const useNotifications = () => {
  const scheduleQuoteNotifications = async () => {
    try {
      const isNative = Capacitor.isNativePlatform();

      // Check permissions
      if (isNative) {
        const pushStatus = await PushNotifications.checkPermissions();
        if (pushStatus.receive !== 'granted') {
          console.warn('⚠️ Push notifications not authorized');
          throw new Error('Les notifications ne sont pas autorisées. Active-les dans les paramètres iOS.');
        }
      }

      const localStatus = await LocalNotifications.checkPermissions();
      if (localStatus.display !== 'granted') {
        const result = await LocalNotifications.requestPermissions();
        if (result.display !== 'granted') {
          throw new Error('Les notifications ne sont pas autorisées. Active-les dans les paramètres.');
        }
      }

      // Clear existing quote notifications
      const pending = await LocalNotifications.getPending();
      const quoteNotifications = pending.notifications.filter(n => n.id < 900); // Keep habit/agenda notifications
      if (quoteNotifications.length > 0) {
        await LocalNotifications.cancel({ notifications: quoteNotifications });
      }

      // Get settings
      const settings = getQuoteSettings();
      if (!settings.enabled) {
        console.log('Quote notifications are disabled');
        return;
      }

      const totalDays = 14; // Schedule for 2 weeks
      const quotesPerDay = settings.quotesPerDay;
      const totalNotifications = Math.min(totalDays * quotesPerDay, 60);
      
      const randomQuotes = getRandomQuotes(totalNotifications);
      const notifications: any[] = [];
      let notificationId = 1;

      for (let day = 0; day < totalDays && notifications.length < totalNotifications; day++) {
        const timesForDay = getNotificationTimes(settings, quotesPerDay, day);
        
        for (let i = 0; i < timesForDay.length && notifications.length < totalNotifications; i++) {
          const { hours, minutes } = timesForDay[i];
          
          const date = new Date();
          date.setDate(date.getDate() + day);
          date.setHours(hours, minutes, 0, 0);

          // Skip if the time has already passed today
          if (date.getTime() <= Date.now()) {
            continue;
          }

          const quoteIndex = notifications.length;
          if (quoteIndex >= randomQuotes.length) break;
          
          const quote = randomQuotes[quoteIndex];

          notifications.push({
            id: notificationId++,
            title: '💪 Citation inspirante',
            body: `"${quote.text}" - ${quote.author}`,
            schedule: { at: date },
          });
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`✅ ${notifications.length} quote notifications scheduled`);
      }
    } catch (error) {
      console.error('❌ Error scheduling quote notifications:', error);
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
      console.log('✅ Instant quote notification sent');
    } catch (error) {
      console.error('❌ Error sending instant quote:', error);
      throw error;
    }
  };

  return { scheduleQuoteNotifications, sendInstantQuote };
};

function getNotificationTimes(
  settings: QuoteSettings, 
  quotesPerDay: number,
  dayOffset: number
): { hours: number; minutes: number }[] {
  const times: { hours: number; minutes: number }[] = [];

  switch (settings.mode) {
    case 'specific':
      // Use specific times defined by user
      for (let i = 0; i < Math.min(quotesPerDay, settings.specificTimes.length); i++) {
        times.push(parseTime(settings.specificTimes[i]));
      }
      break;

    case 'random':
      // Random times between 8:00 and 22:00
      for (let i = 0; i < quotesPerDay; i++) {
        const randomHour = 8 + Math.floor(Math.random() * 14);
        const randomMinute = Math.floor(Math.random() * 60);
        times.push({ hours: randomHour, minutes: randomMinute });
      }
      // Sort by time
      times.sort((a, b) => a.hours * 60 + a.minutes - (b.hours * 60 + b.minutes));
      break;

    case 'range':
    default:
      // Distribute evenly between start and end time
      const start = parseTime(settings.startTime);
      const end = parseTime(settings.endTime);
      
      const startMinutes = start.hours * 60 + start.minutes;
      const endMinutes = end.hours * 60 + end.minutes;
      const totalRange = endMinutes - startMinutes;
      
      if (quotesPerDay === 1) {
        // Single notification in the middle of the range
        const midMinutes = startMinutes + Math.floor(totalRange / 2);
        times.push({
          hours: Math.floor(midMinutes / 60),
          minutes: midMinutes % 60
        });
      } else {
        const interval = totalRange / (quotesPerDay - 1);
        
        for (let i = 0; i < quotesPerDay; i++) {
          const currentMinutes = startMinutes + Math.floor(i * interval);
          // Add some randomness (±15 minutes)
          const randomOffset = Math.floor(Math.random() * 30) - 15;
          const finalMinutes = Math.max(startMinutes, Math.min(endMinutes, currentMinutes + randomOffset));
          
          times.push({
            hours: Math.floor(finalMinutes / 60),
            minutes: finalMinutes % 60
          });
        }
      }
      break;
  }

  return times;
}
