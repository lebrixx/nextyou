import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface GroupStats {
  id: string;
  group_id: string;
  current_streak: number;
  best_streak: number;
  total_habits_completed: number;
  weekly_goal: number;
  weekly_progress: number;
}

interface GroupActivity {
  id: string;
  group_id: string;
  user_id: string;
  activity_type: string;
  habit_name: string | null;
  message: string | null;
  created_at: string;
  user_name?: string;
}

interface GroupMemberStats {
  user_id: string;
  user_name: string;
  streak: number;
  completions_today: number;
  completions_week: number;
}

export const useGroupFeatures = (groupId: string | null, userId: string | undefined) => {
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [memberStats, setMemberStats] = useState<GroupMemberStats[]>([]);
  const [loading, setLoading] = useState(false);

  // Load group stats
  const loadGroupStats = useCallback(async () => {
    if (!groupId) return;
    
    const { data } = await supabase
      .from('group_stats')
      .select('*')
      .eq('group_id', groupId)
      .maybeSingle();
    
    if (data) {
      setStats(data);
    } else {
      // Create initial stats for group
      const { data: newStats } = await supabase
        .from('group_stats')
        .insert({ group_id: groupId })
        .select()
        .single();
      if (newStats) setStats(newStats);
    }
  }, [groupId]);

  // Load group activity feed
  const loadActivities = useCallback(async () => {
    if (!groupId) return;
    
    const { data } = await supabase
      .from('group_activity')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (data) {
      // Get user names for activities
      const activitiesWithNames: GroupActivity[] = [];
      for (const activity of data) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', activity.user_id)
          .single();
        
        activitiesWithNames.push({
          ...activity,
          user_name: profile?.full_name || 'Membre'
        });
      }
      setActivities(activitiesWithNames);
    }
  }, [groupId]);

  // Load member rankings
  const loadMemberStats = useCallback(async () => {
    if (!groupId) return;
    
    // Get all members
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id')
      .eq('group_id', groupId);
    
    const { data: group } = await supabase
      .from('groups')
      .select('owner_id')
      .eq('id', groupId)
      .single();
    
    const allMemberIds = new Set<string>();
    if (members) members.forEach(m => allMemberIds.add(m.user_id));
    if (group) allMemberIds.add(group.owner_id);
    
    const stats: GroupMemberStats[] = [];
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    for (const memberId of allMemberIds) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', memberId)
        .single();
      
      // Get user's habit stats
      const { data: habits } = await supabase
        .from('habits')
        .select('id, streak')
        .eq('user_id', memberId)
        .eq('is_archived', false);
      
      // Get today's completions
      const { count: todayCount } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', memberId)
        .eq('completed_at', today);
      
      // Get week's completions
      const { count: weekCount } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', memberId)
        .gte('completed_at', weekStart.toISOString().split('T')[0]);
      
      const maxStreak = habits?.reduce((max, h) => Math.max(max, h.streak || 0), 0) || 0;
      
      stats.push({
        user_id: memberId,
        user_name: profile?.full_name || 'Membre',
        streak: maxStreak,
        completions_today: todayCount || 0,
        completions_week: weekCount || 0
      });
    }
    
    // Sort by streak then by weekly completions
    stats.sort((a, b) => b.streak - a.streak || b.completions_week - a.completions_week);
    setMemberStats(stats);
  }, [groupId]);

  // Post activity to group
  const postActivity = async (activityType: string, habitName?: string, message?: string) => {
    if (!groupId || !userId) return;
    
    await supabase
      .from('group_activity')
      .insert({
        group_id: groupId,
        user_id: userId,
        activity_type: activityType,
        habit_name: habitName || null,
        message: message || null
      });
  };

  // Subscribe to realtime activity updates
  useEffect(() => {
    if (!groupId) return;
    
    const channel = supabase
      .channel(`group-activity-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_activity',
          filter: `group_id=eq.${groupId}`
        },
        async (payload) => {
          const newActivity = payload.new as any;
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newActivity.user_id)
            .single();
          
          setActivities(prev => [{
            ...newActivity,
            user_name: profile?.full_name || 'Membre'
          }, ...prev].slice(0, 20));
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  // Initial load
  useEffect(() => {
    if (groupId) {
      setLoading(true);
      Promise.all([loadGroupStats(), loadActivities(), loadMemberStats()])
        .finally(() => setLoading(false));
    }
  }, [groupId, loadGroupStats, loadActivities, loadMemberStats]);

  return {
    stats,
    activities,
    memberStats,
    loading,
    postActivity,
    refresh: () => Promise.all([loadGroupStats(), loadActivities(), loadMemberStats()])
  };
};
