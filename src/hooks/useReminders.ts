import { useState, useEffect } from 'react';
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
      const { error } = await supabase
        .from('reminders')
        .insert({
          ...reminder,
          user_id: user.id,
          completed: false,
        });

      if (error) throw error;

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
