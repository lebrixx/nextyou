import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SocialNotificationPreferences {
  friendRequests: boolean;
  challenges: boolean;
  motivations: boolean;
  groupActivity: boolean;
}

export const useSocialNotifications = (userId: string | undefined) => {
  const [preferences, setPreferences] = useState<SocialNotificationPreferences>(() => {
    const saved = localStorage.getItem('social_notification_preferences');
    if (saved) return JSON.parse(saved);
    return {
      friendRequests: true,
      challenges: true,
      motivations: true,
      groupActivity: true,
    };
  });

  // Save preferences to localStorage
  const updatePreferences = (newPrefs: Partial<SocialNotificationPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem('social_notification_preferences', JSON.stringify(updated));
  };

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('social-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        async (payload) => {
          const notification = payload.new as any;
          
          // Check preferences before showing toast
          if (notification.type === 'friend_request' && !preferences.friendRequests) return;
          if (notification.type === 'challenge' && !preferences.challenges) return;
          if (notification.type === 'motivation' && !preferences.motivations) return;
          if (notification.type.includes('group') && !preferences.groupActivity) return;

          // Get sender name
          const { data: sender } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', notification.sender_id)
            .single();

          const senderName = sender?.full_name || 'Quelqu\'un';
          
          let title = '📬 Nouvelle notification';
          let description = notification.message || '';

          switch (notification.type) {
            case 'friend_request':
              title = '👋 Demande d\'ami';
              description = `${senderName} veut être ton ami !`;
              break;
            case 'challenge':
              title = '⚔️ Nouveau défi';
              description = `${senderName} te défie !`;
              break;
            case 'motivation':
              title = '💪 Encouragement';
              description = `${senderName} t'encourage !`;
              break;
            case 'group_invite':
              title = '👥 Invitation groupe';
              description = `${senderName} t'invite à rejoindre un groupe`;
              break;
          }

          toast({
            title,
            description: description || notification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, preferences]);

  return { preferences, updatePreferences };
};
