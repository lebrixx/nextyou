import { useState, useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_date: string;
  reminder_time?: string;
  notification_enabled: boolean;
  notification_delay: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadReminders();
    }
  }, [user]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const loadReminders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .gte('reminder_date', new Date().toISOString().split('T')[0])
        .order('reminder_date', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error: any) {
      console.error('Error loading reminders:', error);
    }
  };

  const scheduleNotificationForReminder = async (reminder: Reminder) => {
    try {
      if (!reminder.notification_enabled) return;

      const date = new Date(reminder.reminder_date);
      
      if (reminder.reminder_time) {
        const [hours, minutes] = reminder.reminder_time.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
      } else {
        date.setHours(9, 0, 0, 0);
      }

      const delayMinutes = reminder.notification_delay || 0;
      date.setMinutes(date.getMinutes() - delayMinutes);

      if (date.getTime() > Date.now()) {
        const notificationId = parseInt(reminder.id.replace(/-/g, '').substring(0, 8), 16);
        
        await LocalNotifications.schedule({
          notifications: [{
            id: notificationId,
            title: `📅 Rappel: ${reminder.title}`,
            body: reminder.description || 'Tu as un rappel',
            schedule: { at: date },
          }]
        });
      }
    } catch (error) {
      console.error('Error scheduling reminder notification:', error);
    }
  };

  const addReminder = async (reminder: Omit<Reminder, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'completed'>) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Connecte-toi pour ajouter des rappels",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          ...reminder,
          user_id: user.id,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Schedule notification for the new reminder
      if (data) {
        await scheduleNotificationForReminder(data);
      }

      toast({
        title: "Rappel ajouté",
        description: "Ton rappel a été enregistré avec succès",
      });

      loadReminders();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const completeReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ completed: true })
        .eq('id', id);

      if (error) throw error;

      // Cancel notification for completed reminder
      try {
        const notificationId = parseInt(id.replace(/-/g, '').substring(0, 8), 16);
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      } catch (e) {
        console.log('Could not cancel notification:', e);
      }

      toast({
        title: "Rappel complété",
        description: "Le rappel a été marqué comme terminé",
      });

      loadReminders();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Cancel notification for deleted reminder
      try {
        const notificationId = parseInt(id.replace(/-/g, '').substring(0, 8), 16);
        await LocalNotifications.cancel({ notifications: [{ id: notificationId }] });
      } catch (e) {
        console.log('Could not cancel notification:', e);
      }

      toast({
        title: "Rappel supprimé",
        description: "Le rappel a été supprimé",
      });

      loadReminders();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    reminders,
    loading,
    addReminder,
    completeReminder,
    deleteReminder,
    refreshReminders: loadReminders,
  };
};
