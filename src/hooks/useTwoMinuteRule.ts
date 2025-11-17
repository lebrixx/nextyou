import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HabitWithBlockage {
  id: string;
  name: string;
  streak: number;
  completionRate: number;
  daysSinceLastCompletion: number;
  isBlocked: boolean;
  two_minute_version?: string;
  is_two_minute_active: boolean;
}

export const useTwoMinuteRule = (habits: any[], completions: any[]) => {
  const [blockedHabits, setBlockedHabits] = useState<HabitWithBlockage[]>([]);

  useEffect(() => {
    if (!habits.length) return;

    const detectBlockage = () => {
      const today = new Date();
      
      const analyzed = habits.map(habit => {
        const habitCompletions = completions.filter(c => c.habit_id === habit.id);
        
        // Calculate completion rate (last 10 days)
        const last10Days = habitCompletions.filter(c => {
          const completedDate = new Date(c.completed_at);
          const daysDiff = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 10;
        });
        
        const completionRate = (last10Days.length / 10) * 100;
        
        // Days since last completion
        const lastCompletion = habitCompletions[habitCompletions.length - 1];
        const daysSinceLastCompletion = lastCompletion 
          ? Math.floor((today.getTime() - new Date(lastCompletion.completed_at).getTime()) / (1000 * 60 * 60 * 24))
          : 999;
        
        // Detect blockage
        const isBlocked = completionRate < 40 || daysSinceLastCompletion > 5;
        
        return {
          id: habit.id,
          name: habit.name,
          streak: habit.streak,
          completionRate,
          daysSinceLastCompletion,
          isBlocked,
          two_minute_version: habit.two_minute_version,
          is_two_minute_active: habit.is_two_minute_active
        };
      });
      
      setBlockedHabits(analyzed.filter(h => h.isBlocked));
    };

    detectBlockage();
  }, [habits, completions]);

  const activateTwoMinuteVersion = async (habitId: string) => {
    const { error } = await supabase
      .from('habits')
      .update({ is_two_minute_active: true })
      .eq('id', habitId);

    if (error) {
      console.error('Error activating 2-minute version:', error);
      throw error;
    }
  };

  const deactivateTwoMinuteVersion = async (habitId: string) => {
    const { error } = await supabase
      .from('habits')
      .update({ is_two_minute_active: false })
      .eq('id', habitId);

    if (error) {
      console.error('Error deactivating 2-minute version:', error);
      throw error;
    }
  };

  return {
    blockedHabits,
    activateTwoMinuteVersion,
    deactivateTwoMinuteVersion
  };
};
