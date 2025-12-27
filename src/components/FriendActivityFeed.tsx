import { useState, useEffect } from "react";
import { Activity, Target, Flame, Clock, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface FriendActivity {
  id: string;
  friendName: string;
  friendAvatar: string | null;
  friendId: string;
  habitName: string;
  habitIcon: string;
  habitColor: string;
  completedAt: string;
  timeAgo: string;
}

interface FriendActivityFeedProps {
  userId: string;
  friendIds: string[];
}

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "À l'instant";
  if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `Il y a ${Math.floor(seconds / 86400)}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const habitIcons: Record<string, string> = {
  target: '🎯',
  heart: '❤️',
  book: '📚',
  dumbbell: '💪',
  moon: '🌙',
  sun: '☀️',
  coffee: '☕',
  music: '🎵',
  palette: '🎨',
  briefcase: '💼',
  home: '🏠',
  star: '⭐',
  zap: '⚡',
  smile: '😊',
  brain: '🧠',
  flame: '🔥',
  leaf: '🌿',
  water: '💧',
};

export const FriendActivityFeed = ({ userId, friendIds }: FriendActivityFeedProps) => {
  const [activities, setActivities] = useState<FriendActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivities = async () => {
    if (friendIds.length === 0) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      // Get completions from friends in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: completions, error } = await supabase
        .from('habit_completions')
        .select('id, habit_id, user_id, completed_at, created_at')
        .in('user_id', friendIds)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error loading activities:', error);
        setLoading(false);
        return;
      }

      if (!completions || completions.length === 0) {
        setActivities([]);
        setLoading(false);
        return;
      }

      // Get unique habit IDs and user IDs
      const habitIds = [...new Set(completions.map(c => c.habit_id).filter(Boolean))] as string[];
      const userIds = [...new Set(completions.map(c => c.user_id))];

      // Fetch habits and profiles in parallel
      const [habitsResult, profilesResult] = await Promise.all([
        habitIds.length > 0 
          ? supabase.from('habits').select('id, name, icon, color').in('id', habitIds)
          : Promise.resolve({ data: [] }),
        supabase.from('profiles').select('id, full_name, avatar_url').in('id', userIds)
      ]);

      const habitsMap = new Map((habitsResult.data || []).map(h => [h.id, h]));
      const profilesMap = new Map((profilesResult.data || []).map(p => [p.id, p]));

      const formattedActivities: FriendActivity[] = completions
        .filter(c => c.habit_id && habitsMap.has(c.habit_id) && profilesMap.has(c.user_id))
        .map(completion => {
          const habit = habitsMap.get(completion.habit_id!);
          const profile = profilesMap.get(completion.user_id);
          
          return {
            id: completion.id,
            friendName: profile?.full_name || 'Ami',
            friendAvatar: profile?.avatar_url || null,
            friendId: completion.user_id,
            habitName: habit?.name || 'Habitude',
            habitIcon: habit?.icon || 'target',
            habitColor: habit?.color || '#8B5CF6',
            completedAt: completion.completed_at,
            timeAgo: getTimeAgo(completion.created_at || completion.completed_at)
          };
        });

      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };

  useEffect(() => {
    loadActivities();
  }, [friendIds]);

  // Set up realtime subscription for new completions
  useEffect(() => {
    if (friendIds.length === 0) return;

    const channel = supabase
      .channel('friend-activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'habit_completions'
        },
        (payload) => {
          const newCompletion = payload.new as { user_id: string };
          if (friendIds.includes(newCompletion.user_id)) {
            // Reload activities when a friend completes a habit
            loadActivities();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [friendIds]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground mt-3">Chargement...</p>
      </div>
    );
  }

  if (friendIds.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Ajoute des amis pour voir leur activité</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p className="text-sm">Aucune activité récente</p>
        <p className="text-xs mt-1">Tes amis n'ont pas encore complété d'habitudes cette semaine</p>
      </div>
    );
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = activity.completedAt;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    let label: string;
    if (date === today) {
      label = "Aujourd'hui";
    } else if (date === yesterday) {
      label = "Hier";
    } else {
      label = new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
    }
    
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(activity);
    return groups;
  }, {} as Record<string, FriendActivity[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Activité des amis
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="h-8"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {Object.entries(groupedActivities).map(([dateLabel, dateActivities]) => (
        <div key={dateLabel} className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
            {dateLabel}
          </p>
          {dateActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="glass rounded-xl p-3 border border-white/5 hover:border-primary/20 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-white/10">
                  <AvatarImage src={activity.friendAvatar || undefined} />
                  <AvatarFallback 
                    className="text-primary-foreground font-bold"
                    style={{ background: `linear-gradient(135deg, ${activity.habitColor}, ${activity.habitColor}99)` }}
                  >
                    {activity.friendName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    <span className="font-semibold">{activity.friendName}</span>
                    <span className="text-muted-foreground"> a complété</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-base">
                      {habitIcons[activity.habitIcon] || '🎯'}
                    </span>
                    <span 
                      className="text-sm font-medium truncate"
                      style={{ color: activity.habitColor }}
                    >
                      {activity.habitName}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.timeAgo}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
