import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from '@/integrations/supabase/client';
import { getRandomQuotes } from '@/data/quotes';

export const useNotificationScheduler = () => {
  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Check permissions first
      const hasPermission = await checkNotificationPermissions();
      if (!hasPermission) {
        console.log('Notifications not permitted');
        return;
      }

      // Schedule all notifications
      await scheduleAllNotifications();
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };

  const checkNotificationPermissions = async (): Promise<boolean> => {
    try {
      // Check Local Notifications
      const localStatus = await LocalNotifications.checkPermissions();
      if (localStatus.display === 'granted') {
        return true;
      }

      // Check Push Notifications (iOS)
      try {
        const pushStatus = await PushNotifications.checkPermissions();
        if (pushStatus.receive === 'granted') {
          return true;
        }
      } catch (e) {
        // Push notifications not available on web
      }

      return false;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  const scheduleAllNotifications = async () => {
    // Clear all existing notifications first
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }

    // Schedule all types of notifications
    await Promise.all([
      scheduleQuoteNotifications(),
      scheduleHabitReminders(),
      scheduleAgendaReminders(),
    ]);
  };

  const scheduleQuoteNotifications = async () => {
    try {
      const quotesPerDay = parseInt(localStorage.getItem("quotes_per_day") || "3");
      const totalDays = 14; // 14 days of quotes
      const totalNotifications = Math.min(totalDays * quotesPerDay, 60);
      
      const randomQuotes = getRandomQuotes(totalNotifications);
      if (!randomQuotes || randomQuotes.length === 0) {
        console.log('No quotes available');
        return;
      }
      
      const notifications = [];
      let notificationId = 1000; // Start from 1000 for quotes
      let quoteIndex = 0;

      for (let day = 0; day < totalDays && quoteIndex < randomQuotes.length; day++) {
        const hoursInDay = 14; // Between 8 AM and 10 PM
        const intervalHours = hoursInDay / quotesPerDay;
        
        for (let i = 0; i < quotesPerDay && quoteIndex < randomQuotes.length; i++) {
          const baseHour = 8 + Math.floor(i * intervalHours);
          const randomMinute = Math.floor(Math.random() * 60);
          
          const date = new Date();
          date.setDate(date.getDate() + day);
          date.setHours(baseHour, randomMinute, 0, 0);

          // Only schedule future notifications
          if (date.getTime() > Date.now()) {
            const quote = randomQuotes[quoteIndex];
            if (quote && quote.text) {
              notifications.push({
                id: notificationId++,
                title: '💪 Citation inspirante',
                body: `"${quote.text}" - ${quote.author}`,
                schedule: { at: date },
              });
            }
            quoteIndex++;
          }
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled ${notifications.length} quote notifications`);
      }
    } catch (error) {
      console.error('Error scheduling quote notifications:', error);
    }
  };

  const scheduleHabitReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: habits } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .not('reminder_time', 'is', null);

      if (!habits || habits.length === 0) return;

      const notifications = [];
      let notificationId = 2000; // Start from 2000 for habits

      for (const habit of habits) {
        if (!habit.reminder_time) continue;

        // Schedule for the next 7 days
        for (let day = 0; day < 7; day++) {
          const [hours, minutes] = habit.reminder_time.split(':').map(Number);
          const date = new Date();
          date.setDate(date.getDate() + day);
          date.setHours(hours, minutes, 0, 0);

          // Only schedule future notifications
          if (date.getTime() > Date.now()) {
            notifications.push({
              id: notificationId++,
              title: `🎯 Rappel: ${habit.name}`,
              body: `N'oublie pas de compléter ton habitude aujourd'hui !`,
              schedule: { at: date },
              extra: {
                habitId: habit.id,
              },
            });
          }
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled ${notifications.length} habit reminders`);
      }
    } catch (error) {
      console.error('Error scheduling habit reminders:', error);
    }
  };

  const scheduleAgendaReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: reminders } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .eq('notification_enabled', true)
        .gte('reminder_date', new Date().toISOString().split('T')[0]);

      if (!reminders || reminders.length === 0) return;

      const notifications = [];
      let notificationId = 3000; // Start from 3000 for agenda

      for (const reminder of reminders) {
        const date = new Date(reminder.reminder_date);
        
        if (reminder.reminder_time) {
          const [hours, minutes] = reminder.reminder_time.split(':').map(Number);
          date.setHours(hours, minutes, 0, 0);
        } else {
          // Default to 9 AM if no time specified
          date.setHours(9, 0, 0, 0);
        }

        // Apply notification delay (in minutes)
        const delayMinutes = reminder.notification_delay || 0;
        date.setMinutes(date.getMinutes() - delayMinutes);

        // Only schedule future notifications
        if (date.getTime() > Date.now()) {
          notifications.push({
            id: notificationId++,
            title: `📅 Rappel: ${reminder.title}`,
            body: reminder.description || 'Tu as un rappel',
            schedule: { at: date },
            extra: {
              reminderId: reminder.id,
            },
          });
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled ${notifications.length} agenda reminders`);
      }
    } catch (error) {
      console.error('Error scheduling agenda reminders:', error);
    }
  };

  // Function to manually refresh all notifications
  const refreshNotifications = async () => {
    await scheduleAllNotifications();
  };

  return { refreshNotifications };
};
