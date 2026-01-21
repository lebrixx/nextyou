import { useState } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface StreakReminderButtonProps {
  userId: string;
  friendId: string;
  friendName: string;
  currentStreak: number;
  friendCompletedToday: boolean;
}

export const StreakReminderButton = ({
  userId,
  friendId,
  friendName,
  currentStreak,
  friendCompletedToday
}: StreakReminderButtonProps) => {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendReminder = async () => {
    if (sending || sent) return;
    
    setSending(true);
    try {
      // Check if we already sent a reminder today
      const today = new Date().toISOString().split('T')[0];
      const { data: existingReminder } = await supabase
        .from('social_notifications')
        .select('id')
        .eq('sender_id', userId)
        .eq('recipient_id', friendId)
        .eq('type', 'streak_reminder')
        .gte('created_at', `${today}T00:00:00`)
        .limit(1);

      if (existingReminder && existingReminder.length > 0) {
        toast({
          title: "Déjà envoyé",
          description: "Tu as déjà envoyé un rappel aujourd'hui",
          variant: "destructive"
        });
        setSending(false);
        return;
      }

      // Get sender's name
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const senderName = senderProfile?.full_name || 'Ton ami';

      // Send the reminder notification
      const { error } = await supabase
        .from('social_notifications')
        .insert({
          sender_id: userId,
          recipient_id: friendId,
          type: 'streak_reminder',
          message: currentStreak > 0 
            ? `🔔 ${senderName} te rappelle de valider tes habitudes ! Votre streak de ${currentStreak} jour${currentStreak > 1 ? 's' : ''} est en jeu 🔥`
            : `🔔 ${senderName} t'invite à compléter une habitude aujourd'hui pour démarrer un streak ensemble ! 🔥`
        });

      if (error) throw error;

      setSent(true);
      toast({
        title: "Rappel envoyé ! 🔔",
        description: `${friendName} recevra une notification`,
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le rappel",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  // Don't show if friend already completed today
  if (friendCompletedToday) {
    return (
      <div className="flex items-center gap-1 text-green-500 text-xs">
        <Check className="w-3 h-3" />
        <span>A validé</span>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={sendReminder}
      disabled={sending || sent}
      className={`h-7 px-2 text-xs gap-1 ${sent ? 'text-green-500' : 'text-orange-500 hover:text-orange-400 hover:bg-orange-500/10'}`}
    >
      {sending ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : sent ? (
        <Check className="w-3 h-3" />
      ) : (
        <Bell className="w-3 h-3" />
      )}
      <span>{sent ? 'Envoyé' : 'Rappeler'}</span>
    </Button>
  );
};
