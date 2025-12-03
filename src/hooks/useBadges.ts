import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface BadgeRule {
  type: string;
  name: string;
  description: string;
  condition: (stats: any) => boolean;
}

export const badgeRules: BadgeRule[] = [
  // Badges simples (faciles à obtenir)
  {
    type: 'first_day',
    name: 'Premier Jour',
    description: 'Complète ta première habitude',
    condition: (stats) => stats.totalCompletions >= 1,
  },
  {
    type: 'getting_started',
    name: 'Démarrage',
    description: '5 habitudes complétées au total',
    condition: (stats) => stats.totalCompletions >= 5,
  },
  {
    type: 'habit_creator',
    name: 'Créateur',
    description: 'Crée 3 habitudes différentes',
    condition: (stats) => stats.totalHabits >= 3,
  },
  {
    type: 'three_day_streak',
    name: 'Trio Gagnant',
    description: 'Série de 3 jours',
    condition: (stats) => stats.bestStreak >= 3,
  },
  {
    type: 'first_week',
    name: 'Première Semaine',
    description: '7 jours d\'utilisation',
    condition: (stats) => stats.daysActive >= 7,
  },
  
  // Badges intermédiaires
  {
    type: 'week_streak',
    name: '7 Jours',
    description: 'Série de 7 jours consécutifs',
    condition: (stats) => stats.bestStreak >= 7,
  },
  {
    type: 'two_weeks',
    name: 'Deux Semaines',
    description: 'Série de 14 jours',
    condition: (stats) => stats.bestStreak >= 14,
  },
  {
    type: 'three_weeks',
    name: 'Trois Semaines',
    description: 'Série de 21 jours',
    condition: (stats) => stats.bestStreak >= 21,
  },
  {
    type: 'month_streak',
    name: '30 Jours',
    description: 'Série de 30 jours',
    condition: (stats) => stats.bestStreak >= 30,
  },
  {
    type: 'fifty_completions',
    name: 'Régulier',
    description: '50 habitudes complétées',
    condition: (stats) => stats.totalCompletions >= 50,
  },
  {
    type: 'dedication',
    name: 'Dévouement',
    description: '10 habitudes différentes créées',
    condition: (stats) => stats.totalHabits >= 10,
  },
  {
    type: 'perfect_week',
    name: 'Semaine Parfaite',
    description: 'Toutes les habitudes pendant 7 jours',
    condition: (stats) => stats.perfectWeek === true,
  },
  
  // Badges difficiles
  {
    type: 'hundred_completions',
    name: 'Centurion',
    description: '100 habitudes complétées',
    condition: (stats) => stats.totalCompletions >= 100,
  },
  {
    type: 'sixty_days',
    name: 'Deux Mois',
    description: 'Série de 60 jours',
    condition: (stats) => stats.bestStreak >= 60,
  },
  {
    type: 'hundred_days',
    name: '100 Jours',
    description: 'Série de 100 jours consécutifs',
    condition: (stats) => stats.bestStreak >= 100,
  },
  {
    type: 'five_hundred_completions',
    name: 'Expert',
    description: '500 habitudes complétées',
    condition: (stats) => stats.totalCompletions >= 500,
  },
  {
    type: 'year_streak',
    name: 'Inarrêtable',
    description: 'Série de 365 jours',
    condition: (stats) => stats.bestStreak >= 365,
  },
  {
    type: 'thousand_completions',
    name: 'Légende',
    description: '1000 habitudes complétées',
    condition: (stats) => stats.totalCompletions >= 1000,
  },
  
  // Badges émotionnels / spéciaux
  {
    type: 'resilience_return',
    name: 'Résilience',
    description: 'Retour après une pause de 7+ jours',
    condition: (stats) => stats.returnAfterBreak === true,
  },
  {
    type: 'resilience_after_break',
    name: 'Phoenix',
    description: 'Reprise immédiate après rechute',
    condition: (stats) => stats.immediateReturn === true,
  },
  {
    type: 'hard_week_survivor',
    name: 'Survivant',
    description: 'Persévérance malgré une semaine difficile',
    condition: (stats) => stats.hardWeekSurvivor === true,
  },
  {
    type: 'low_energy_push',
    name: 'Guerrier',
    description: 'Continué malgré faible énergie',
    condition: (stats) => stats.lowEnergyPush === true,
  },
  {
    type: 'comeback_king',
    name: 'Roi du Comeback',
    description: 'Retour après 14+ jours d\'absence',
    condition: (stats) => stats.longAbsenceReturn === true,
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
            });
          }
        }
      }
    };

    checkBadges();
  }, [userId, stats, toast]);
};

export default useBadges;
