import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

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
  
  const [unreadCount, setUnreadCount] = useState(0);

  // Save preferences to localStorage
  const updatePreferences = (newPrefs: Partial<SocialNotificationPreferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    localStorage.setItem('social_notification_preferences', JSON.stringify(updated));
  };

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    if (!userId) return;
    
    const { count } = await supabase
      .from('social_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);
    
    setUnreadCount(count || 0);
  }, [userId]);

  // Subscribe to realtime notifications
  useEffect(() => {
    if (!userId) return;

    // Load initial unread count
    loadUnreadCount();

    const channel = supabase
      .channel(`social-notifications-${userId}`)
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
          
          // Update unread count
          setUnreadCount(prev => prev + 1);
          
          // Check preferences before showing toast
          if (notification.type === 'friend_request' && !preferences.friendRequests) return;
          if (notification.type === 'challenge' && !preferences.challenges) return;
          if (notification.type === 'motivation' && !preferences.motivations) return;
          if (notification.type.includes('group') && !preferences.groupActivity) return;
          
          let title = '📬 Nouvelle notification';
          let description = notification.message || '';

          switch (notification.type) {
            case 'friend_request':
              title = '👋 Demande d\'ami';
              description = notification.message || 'Quelqu\'un veut être ton ami !';
              break;
            case 'challenge':
              title = '⚔️ Défi reçu !';
              description = notification.message || 'Tu as reçu un nouveau défi !';
              break;
            case 'motivation':
              title = '💪 Encouragement reçu !';
              description = notification.message || 'Quelqu\'un t\'encourage !';
              break;
            case 'duel_update':
              title = '⚔️ Mise à jour du duel';
              description = notification.message || 'Ton duel a été mis à jour';
              break;
            case 'group_invite':
              title = '👥 Invitation groupe';
              description = notification.message || 'Tu as été invité à rejoindre un groupe';
              break;
          }

          toast({
            title,
            description,
          });

          // Send native notification
          if (Capacitor.isNativePlatform()) {
            try {
              const permStatus = await LocalNotifications.checkPermissions();
              if (permStatus.display === 'granted') {
                await LocalNotifications.schedule({
                  notifications: [{
                    title,
                    body: description,
                    id: Math.floor(Math.random() * 100000),
                    schedule: { at: new Date(Date.now() + 500) },
                    sound: undefined,
                    smallIcon: 'ic_stat_icon_config_sample',
                  }]
                });
              }
            } catch (e) {
              console.log('Native notification error:', e);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, preferences, loadUnreadCount]);

  return { preferences, updatePreferences, unreadCount, loadUnreadCount };
};
