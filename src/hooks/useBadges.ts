import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BadgeRule {
  type: string;
  name: string;
  description: string;
  condition: (stats: any) => boolean;
}

const badgeRules: BadgeRule[] = [
  {
    type: 'first_day',
    name: 'Premier Jour',
    description: 'Complète ta première habitude',
    condition: (stats) => stats.totalCompletions >= 1,
  },
  {
    type: 'week_streak',
    name: '7 Jours',
    description: 'Série de 7 jours',
    condition: (stats) => stats.bestStreak >= 7,
  },
  {
    type: 'month_streak',
    name: '30 Jours',
    description: 'Série de 30 jours',
    condition: (stats) => stats.bestStreak >= 30,
  },
  {
    type: 'perfect_week',
    name: 'Semaine Parfaite',
    description: 'Toutes les habitudes pendant 7 jours',
    condition: (stats) => stats.perfectWeek === true,
  },
  {
    type: 'hundred_days',
    name: '100 Jours',
    description: 'Série de 100 jours',
    condition: (stats) => stats.bestStreak >= 100,
  },
  {
    type: 'dedication',
    name: 'Dévouement',
    description: '10 habitudes différentes complétées',
    condition: (stats) => stats.totalHabits >= 10,
  },
];

export const useBadges = (userId: string | undefined, stats: any) => {
  const { toast } = useToast();

  useEffect(() => {
    if (!userId || !stats) return;

    const checkBadges = async () => {
      // Fetch existing badges
      const { data: existingBadges } = await supabase
        .from('badges')
        .select('badge_type')
        .eq('user_id', userId);

      const unlockedTypes = new Set(existingBadges?.map(b => b.badge_type) || []);

      // Check each badge rule
      for (const rule of badgeRules) {
        if (!unlockedTypes.has(rule.type) && rule.condition(stats)) {
          // Unlock new badge
          const { error } = await supabase
            .from('badges')
            .insert({
              user_id: userId,
              badge_type: rule.type,
              badge_name: rule.name,
              badge_description: rule.description,
            });

          if (!error) {
            toast({
              title: "🏆 Nouveau Badge !",
              description: `Tu as débloqué : ${rule.name}`,
              duration: 5000,
            });
          }
        }
      }
    };

    checkBadges();
  }, [userId, stats, toast]);
};

export default useBadges;