import { useState, useEffect } from "react";
import { Activity, Clock, RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface DailyFriendActivity {
  id: string;
  friendName: string;
  friendAvatar: string | null;
  friendId: string;
  habitCount: number;
  date: string;
  timeAgo: string;
}

interface FriendActivityFeedProps {
  userId: string;
  friendIds: string[];
}

const getTimeAgo = (dateString: string): string => {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  if (dateString === today) return "Aujourd'hui";
  if (dateString === yesterday) return "Hier";
  return new Date(dateString).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
};

export const FriendActivityFeed = ({ userId, friendIds }: FriendActivityFeedProps) => {
  const [activities, setActivities] = useState<DailyFriendActivity[]>([]);
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
        .select('id, user_id, completed_at')
        .in('user_id', friendIds)
        .gte('completed_at', sevenDaysAgo.toISOString().split('T')[0])
        .order('completed_at', { ascending: false });

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

      // Get unique user IDs
      const userIds = [...new Set(completions.map(c => c.user_id))];

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      const profilesMap = new Map((profiles || []).map(p => [p.id, p]));

      // Group completions by friend and date
      const groupedByFriendAndDate = new Map<string, { count: number; date: string; userId: string }>();
      
      completions.forEach(completion => {
        const key = `${completion.user_id}-${completion.completed_at}`;
        const existing = groupedByFriendAndDate.get(key);
        
        if (existing) {
          existing.count++;
        } else {
          groupedByFriendAndDate.set(key, {
            count: 1,
            date: completion.completed_at,
            userId: completion.user_id
          });
        }
      });

      // Convert to array and format
      const formattedActivities: DailyFriendActivity[] = Array.from(groupedByFriendAndDate.entries())
        .map(([key, data]) => {
          const profile = profilesMap.get(data.userId);
          
          return {
            id: key,
            friendName: profile?.full_name || 'Ami',
            friendAvatar: profile?.avatar_url || null,
            friendId: data.userId,
            habitCount: data.count,
            date: data.date,
            timeAgo: getTimeAgo(data.date)
          };
        })
        .sort((a, b) => b.date.localeCompare(a.date));

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

  // Group activities by date label
  const groupedActivities = activities.reduce((groups, activity) => {
    const label = activity.timeAgo;
    
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(activity);
    return groups;
  }, {} as Record<string, DailyFriendActivity[]>);

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
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-bold">
                    {activity.friendName[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{activity.friendName}</span>
                    <span className="text-muted-foreground"> a complété </span>
                    <span className="font-semibold text-primary">
                      {activity.habitCount} habitude{activity.habitCount > 1 ? 's' : ''}
                    </span>
                  </p>
                </div>
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
