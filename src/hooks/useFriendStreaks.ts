import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FriendStreak {
  id: string;
  friendId: string;
  friendName: string;
  friendAvatar: string | null;
  currentStreak: number;
  bestStreak: number;
  lastMutualDate: string | null;
}

export const useFriendStreaks = (userId: string | undefined, friendIds: string[]) => {
  const [streaks, setStreaks] = useState<FriendStreak[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStreaks = useCallback(async () => {
    if (!userId || friendIds.length === 0) {
      setStreaks([]);
      setLoading(false);
      return;
    }

    try {
      // Get today's date
      const today = new Date().toISOString().split('T')[0];
      
      // Get yesterday's date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if current user completed at least 1 habit today
      const { data: myCompletionsToday } = await supabase
        .from('habit_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('completed_at', today)
        .limit(1);

      const iCompletedToday = (myCompletionsToday?.length || 0) > 0;

      // Load existing streaks from database
      const { data: existingStreaks } = await supabase
        .from('friend_streaks')
        .select('*')
        .eq('user_id', userId);

      const streakMap = new Map(existingStreaks?.map(s => [s.friend_id, s]) || []);

      const updatedStreaks: FriendStreak[] = [];

      for (const friendId of friendIds) {
        // Get friend's profile
        const { data: friendProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', friendId)
          .single();

        // Check if friend completed at least 1 habit today
        const { data: friendCompletionsToday } = await supabase
          .from('habit_completions')
          .select('id')
          .eq('user_id', friendId)
          .eq('completed_at', today)
          .limit(1);

        const friendCompletedToday = (friendCompletionsToday?.length || 0) > 0;
        const bothCompletedToday = iCompletedToday && friendCompletedToday;

        // Get or create streak record
        let existingStreak = streakMap.get(friendId);
        let currentStreak = existingStreak?.current_streak || 0;
        let bestStreak = existingStreak?.best_streak || 0;
        let lastMutualDate = existingStreak?.last_mutual_date;

        // Update streak logic
        if (bothCompletedToday && lastMutualDate !== today) {
          // Both completed today and it wasn't already counted
          if (lastMutualDate === yesterdayStr) {
            // Consecutive day - increment streak
            currentStreak += 1;
          } else {
            // Not consecutive - restart streak
            currentStreak = 1;
          }
          lastMutualDate = today;
          bestStreak = Math.max(bestStreak, currentStreak);

          // Upsert the streak record
          await supabase
            .from('friend_streaks')
            .upsert({
              user_id: userId,
              friend_id: friendId,
              current_streak: currentStreak,
              best_streak: bestStreak,
              last_mutual_date: lastMutualDate,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,friend_id'
            });
        } else if (lastMutualDate && lastMutualDate !== today && lastMutualDate !== yesterdayStr) {
          // Streak broken - reset
          currentStreak = 0;
          
          await supabase
            .from('friend_streaks')
            .upsert({
              user_id: userId,
              friend_id: friendId,
              current_streak: 0,
              best_streak: bestStreak,
              last_mutual_date: lastMutualDate,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,friend_id'
            });
        }

        updatedStreaks.push({
          id: existingStreak?.id || `${userId}-${friendId}`,
          friendId,
          friendName: friendProfile?.full_name || 'Ami',
          friendAvatar: friendProfile?.avatar_url,
          currentStreak,
          bestStreak,
          lastMutualDate
        });
      }

      // Sort by current streak (descending)
      updatedStreaks.sort((a, b) => b.currentStreak - a.currentStreak);
      setStreaks(updatedStreaks);
    } catch (error) {
      console.error('Error loading friend streaks:', error);
    } finally {
      setLoading(false);
    }
  }, [userId, friendIds]);

  useEffect(() => {
    loadStreaks();
  }, [loadStreaks]);

  // Subscribe to realtime updates on habit_completions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`friend-streaks-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'habit_completions',
        },
        () => {
          // Reload streaks when any habit completion happens
          loadStreaks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, loadStreaks]);

  return { streaks, loading, refresh: loadStreaks };
};
