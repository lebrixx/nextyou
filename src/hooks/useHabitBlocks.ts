import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type HabitBlock = Database['public']['Tables']['habit_blocks']['Row'];
type HabitBlockInsert = Database['public']['Tables']['habit_blocks']['Insert'];

export const useHabitBlocks = (userId: string | undefined, selectedDate: Date) => {
  const [blocks, setBlocks] = useState<HabitBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBlocks = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      const { data, error: fetchError } = await supabase
        .from('habit_blocks')
        .select('*')
        .eq('user_id', userId)
        .eq('date', dateString)
        .order('start_time');

      if (fetchError) throw fetchError;
      
      setBlocks(data || []);
    } catch (err) {
      console.error('Error loading blocks:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlocks();
  }, [userId, selectedDate]);

  const addBlock = async (habitId: string, startTime: string, endTime: string) => {
    if (!userId) throw new Error('User not authenticated');
    
    const dateString = selectedDate.toISOString().split('T')[0];
    
    const newBlock: HabitBlockInsert = {
      user_id: userId,
      habit_id: habitId,
      date: dateString,
      start_time: startTime,
      end_time: endTime
    };

    const { data, error } = await supabase
      .from('habit_blocks')
      .insert(newBlock)
      .select()
      .single();

    if (error) throw error;
    
    await loadBlocks();
    return data;
  };

  const updateBlock = async (blockId: string, startTime: string, endTime: string) => {
    const { error } = await supabase
      .from('habit_blocks')
      .update({ start_time: startTime, end_time: endTime })
      .eq('id', blockId);

    if (error) throw error;
    
    await loadBlocks();
  };

  const deleteBlock = async (blockId: string) => {
    const { error } = await supabase
      .from('habit_blocks')
      .delete()
      .eq('id', blockId);

    if (error) throw error;
    
    await loadBlocks();
  };

  return {
    blocks,
    loading,
    error,
    loadBlocks,
    addBlock,
    updateBlock,
    deleteBlock
  };
};
