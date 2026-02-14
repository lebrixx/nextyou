import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
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
      // On web, we can't really check push notifications properly
      if (!Capacitor.isNativePlatform()) {
        // Try to check if browser notifications are available
        if ('Notification' in window) {
          return Notification.permission === 'granted';
        }
        return false;
      }

      // Check Local Notifications
      const localStatus = await LocalNotifications.checkPermissions();
      if (localStatus.display === 'granted') {
        return true;
      }

      // Request permissions if not granted
      if (localStatus.display === 'prompt' || localStatus.display === 'prompt-with-rationale') {
        const result = await LocalNotifications.requestPermissions();
        return result.display === 'granted';
      }

      return false;
    } catch (error) {
      console.error('Error checking permissions:', error);
      return false;
    }
  };

  const scheduleAllNotifications = async () => {
    // Only run on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log('Notifications only work on native platforms');
      return;
    }

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
      scheduleSmartReminders(),
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

        const [hours, minutes] = habit.reminder_time.split(':').map(Number);
        
        // Schedule for the next 7 days
        for (let day = 0; day < 7; day++) {
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

      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      const { data: reminders } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .eq('notification_enabled', true)
        .gte('reminder_date', todayStr);

      if (!reminders || reminders.length === 0) return;

      const notifications = [];
      let notificationId = 3000; // Start from 3000 for agenda

      for (const reminder of reminders) {
        // Parse the date properly (YYYY-MM-DD format)
        const [year, month, day] = reminder.reminder_date.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed
        
        if (reminder.reminder_time) {
          const [hours, minutes] = reminder.reminder_time.split(':').map(Number);
          date.setHours(hours, minutes, 0, 0);
        } else {
          // Default to 9 AM if no time specified
          date.setHours(9, 0, 0, 0);
        }

        // Apply notification delay (in minutes before)
        const delayMinutes = reminder.notification_delay || 0;
        date.setMinutes(date.getMinutes() - delayMinutes);

        // Only schedule future notifications
        if (date.getTime() > Date.now()) {
          // Generate a stable notification ID from the reminder ID
          const notifId = notificationId++;
          
          notifications.push({
            id: notifId,
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

  const scheduleSmartReminders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if smart reminders are enabled (default: true)
      const smartEnabled = localStorage.getItem('smart_reminders_enabled') !== 'false';
      if (!smartEnabled) return;

      const notifications: any[] = [];
      let notificationId = 5000; // Start from 5000 for smart reminders

      // Get user's habits
      const { data: habits } = await supabase
        .from('habits')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_archived', false);

      if (!habits || habits.length === 0) return;

      // Get today's completions
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      const { data: todayCompletions } = await supabase
        .from('habit_completions')
        .select('habit_id')
        .eq('user_id', user.id)
        .gte('completed_at', `${todayStr}T00:00:00`)
        .lte('completed_at', `${todayStr}T23:59:59`);

      const completedToday = todayCompletions?.length || 0;
      const totalHabits = habits.length;
      const missingCount = totalHabits - completedToday;

      // --- NOTIFICATION 1: Evening reminder if habits are missing (20h) ---
      if (missingCount > 0) {
        const eveningDate = new Date();
        eveningDate.setHours(20, 0, 0, 0);

        if (eveningDate.getTime() > Date.now()) {
          const messages = missingCount === totalHabits
            ? [
                "Tu n'as rien validé aujourd'hui — même 2 minutes suffisent pour avancer 💪",
                "Ta journée n'est pas finie ! Un petit geste peut tout changer 🌟",
                "Prends 2 minutes pour toi avant de finir la journée ✨",
              ]
            : [
                `Il te reste ${missingCount} habitude${missingCount > 1 ? 's' : ''} — tu peux encore les valider ce soir 💪`,
                `Plus que ${missingCount} ! Tu es si proche d'une journée parfaite 🔥`,
                `${completedToday}/${totalHabits} validées — finis en beauté ce soir ✨`,
              ];

          const message = messages[Math.floor(Math.random() * messages.length)];

          notifications.push({
            id: notificationId++,
            title: missingCount === totalHabits ? '🌙 Petit rappel du soir' : `🌙 Il reste ${missingCount} habitude${missingCount > 1 ? 's' : ''}`,
            body: message,
            schedule: { at: eveningDate },
          });
        }
      }

      // --- NOTIFICATION 2: Inactivity nudge (check last 2 days) ---
      const lastSmartNudge = localStorage.getItem('last_smart_nudge_date');
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`;

      const { count: recentCompletions } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('completed_at', `${twoDaysAgoStr}T00:00:00`);

      if ((recentCompletions || 0) === 0) {
        // Anti-spam: check cooldown (48h since last nudge)
        const canSendNudge = !lastSmartNudge || 
          (Date.now() - new Date(lastSmartNudge).getTime()) > 48 * 60 * 60 * 1000;

        if (canSendNudge) {
          const nudgeDate = new Date();
          nudgeDate.setHours(10, 30, 0, 0);

          // If 10:30 already passed, schedule for tomorrow
          if (nudgeDate.getTime() <= Date.now()) {
            nudgeDate.setDate(nudgeDate.getDate() + 1);
          }

          const nudgeMessages = [
            "Ça fait quelques jours — un petit pas aujourd'hui et tu relances tout 🚀",
            "Tu nous manques ! Reviens valider une seule habitude, c'est tout ce qu'il faut 💜",
            "Chaque reprise est une victoire. Aujourd'hui peut être ce jour 🌱",
          ];

          notifications.push({
            id: notificationId++,
            title: '👋 On pense à toi',
            body: nudgeMessages[Math.floor(Math.random() * nudgeMessages.length)],
            schedule: { at: nudgeDate },
          });

          // Save nudge date for anti-spam
          localStorage.setItem('last_smart_nudge_date', new Date().toISOString());
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled ${notifications.length} smart reminders`);
      }
    } catch (error) {
      console.error('Error scheduling smart reminders:', error);
    }
  };

  // Function to manually refresh all notifications
  const refreshNotifications = async () => {
    const hasPermission = await checkNotificationPermissions();
    if (!hasPermission) {
      console.log('No notification permissions');
      return;
    }
    await scheduleAllNotifications();
  };

  return { refreshNotifications };
};
