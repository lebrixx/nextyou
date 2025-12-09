import { useState, useEffect } from "react";
import { Award, Star, Trophy, Flame, Target, Zap, Crown, Heart, Shield, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string | null;
  unlocked_at: string | null;
}

interface FriendBadgesSectionProps {
  friendId: string | undefined;
}

const badgeIcons: Record<string, any> = {
  first_habit: Target,
  week_streak: Flame,
  month_streak: Crown,
  habit_creator: Star,
  perfect_week: Trophy,
  early_bird: Zap,
  night_owl: Shield,
  consistency: Heart,
  milestone_10: Award,
  milestone_50: Award,
  milestone_100: Crown,
  duel_winner: Sparkles,
  duel_master: Trophy,
  social_butterfly: Heart,
  default: Award
};

const badgeColors: Record<string, string> = {
  first_habit: "text-green-500 bg-green-500/20",
  week_streak: "text-orange-500 bg-orange-500/20",
  month_streak: "text-yellow-500 bg-yellow-500/20",
  habit_creator: "text-blue-500 bg-blue-500/20",
  perfect_week: "text-purple-500 bg-purple-500/20",
  early_bird: "text-amber-500 bg-amber-500/20",
  night_owl: "text-indigo-500 bg-indigo-500/20",
  consistency: "text-pink-500 bg-pink-500/20",
  milestone_10: "text-cyan-500 bg-cyan-500/20",
  milestone_50: "text-emerald-500 bg-emerald-500/20",
  milestone_100: "text-yellow-400 bg-yellow-400/20",
  duel_winner: "text-red-500 bg-red-500/20",
  duel_master: "text-yellow-500 bg-yellow-500/20",
  social_butterfly: "text-pink-400 bg-pink-400/20",
  default: "text-primary bg-primary/20"
};

export const FriendBadgesSection = ({ friendId }: FriendBadgesSectionProps) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBadges = async () => {
      if (!friendId) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('badges')
          .select('*')
          .eq('user_id', friendId)
          .order('unlocked_at', { ascending: false });
        
        setBadges(data || []);
      } catch (error) {
        console.error('Error loading friend badges:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBadges();
  }, [friendId]);

  if (loading) {
    return (
      <div className="glass rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Badges</span>
        </div>
        <div className="flex justify-center py-3">
          <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Badges</span>
        </div>
        <span className="text-xs text-muted-foreground">{badges.length} débloqués</span>
      </div>
      
      {badges.length === 0 ? (
        <div className="text-center py-3 text-muted-foreground">
          <Award className="w-8 h-8 mx-auto mb-1 opacity-30" />
          <p className="text-xs">Aucun badge pour l'instant</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {badges.slice(0, 8).map((badge) => {
            const Icon = badgeIcons[badge.badge_type] || badgeIcons.default;
            const colorClass = badgeColors[badge.badge_type] || badgeColors.default;
            
            return (
              <div 
                key={badge.id} 
                className="flex flex-col items-center gap-1 group relative"
                title={`${badge.badge_name}: ${badge.badge_description || ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass} transition-transform group-hover:scale-110`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] text-muted-foreground text-center line-clamp-1 max-w-full">
                  {badge.badge_name}
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      {badges.length > 8 && (
        <p className="text-[10px] text-center text-muted-foreground mt-2">
          +{badges.length - 8} autres badges
        </p>
      )}
    </div>
  );
};

export default FriendBadgesSection;
