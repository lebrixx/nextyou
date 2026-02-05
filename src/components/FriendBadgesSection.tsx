import { useState, useEffect } from "react";
import { Award, Star, Trophy, Flame, Target, Zap, Crown, Heart, Shield, Sparkles, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [isOpen, setIsOpen] = useState(false);

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
      <div className="glass rounded-xl p-3 border border-white/10">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Badges</span>
          <div className="ml-auto animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Aperçu compact : 4 premiers badges
  const previewBadges = badges.slice(0, 4);
  const remainingCount = badges.length - 4;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="glass rounded-xl border border-white/10 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full p-3 flex items-center gap-3 hover:bg-white/5 transition-colors touch-manipulation">
            <div className="flex items-center gap-2 shrink-0">
              <Award className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Badges</span>
              <span className="text-xs text-muted-foreground">({badges.length})</span>
            </div>
            
            {/* Aperçu compact des badges */}
            {badges.length > 0 && !isOpen && (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <div className="flex -space-x-1.5">
                  {previewBadges.map((badge) => {
                    const Icon = badgeIcons[badge.badge_type] || badgeIcons.default;
                    const colorClass = badgeColors[badge.badge_type] || badgeColors.default;
                    return (
                      <div 
                        key={badge.id}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${colorClass} border-2 border-background`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                    );
                  })}
                </div>
                {remainingCount > 0 && (
                  <span className="text-[10px] text-muted-foreground ml-1">+{remainingCount}</span>
                )}
              </div>
            )}
            
            <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-3 pb-3 border-t border-white/5">
            {badges.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Award className="w-8 h-8 mx-auto mb-1 opacity-30" />
                <p className="text-xs">Aucun badge pour l'instant</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 gap-2 pt-3">
                {badges.map((badge) => {
                  const Icon = badgeIcons[badge.badge_type] || badgeIcons.default;
                  const colorClass = badgeColors[badge.badge_type] || badgeColors.default;
                  
                  return (
                    <div 
                      key={badge.id} 
                      className="flex flex-col items-center gap-1 group"
                      title={`${badge.badge_name}: ${badge.badge_description || ''}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorClass} transition-transform group-active:scale-95`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] text-muted-foreground text-center line-clamp-1 max-w-full leading-tight">
                        {badge.badge_name}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default FriendBadgesSection;
