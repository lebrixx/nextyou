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
  // ========== BADGES FACILES (10) ==========
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
  {
    type: 'ten_completions',
    name: 'Bon Début',
    description: '10 habitudes complétées',
    condition: (stats) => stats.totalCompletions >= 10,
  },
  {
    type: 'early_bird',
    name: 'Lève-tôt',
    description: 'Complète une habitude avant 8h',
    condition: (stats) => stats.earlyBird === true,
  },
  {
    type: 'night_owl',
    name: 'Couche-tard',
    description: 'Complète une habitude après 22h',
    condition: (stats) => stats.nightOwl === true,
  },
  {
    type: 'five_habits',
    name: 'Ambitieux',
    description: 'Crée 5 habitudes différentes',
    condition: (stats) => stats.totalHabits >= 5,
  },
  {
    type: 'weekend_warrior',
    name: 'Guerrier du Weekend',
    description: 'Complète toutes tes habitudes un weekend',
    condition: (stats) => stats.weekendWarrior === true,
  },

  // ========== BADGES MOYENS (15) ==========
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
  {
    type: 'twenty_five_completions',
    name: 'Quart de Siècle',
    description: '25 habitudes complétées',
    condition: (stats) => stats.totalCompletions >= 25,
  },
  {
    type: 'morning_routine',
    name: 'Routine Matinale',
    description: '5 habitudes complétées le matin',
    condition: (stats) => stats.morningRoutine >= 5,
  },
  {
    type: 'consistency_king',
    name: 'Roi de la Constance',
    description: 'Même heure pendant 5 jours',
    condition: (stats) => stats.consistencyKing === true,
  },
  {
    type: 'multi_tasker',
    name: 'Multi-tâches',
    description: '5 habitudes complétées en un jour',
    condition: (stats) => stats.maxDailyCompletions >= 5,
  },
  {
    type: 'forty_five_days',
    name: '45 Jours',
    description: 'Série de 45 jours',
    condition: (stats) => stats.bestStreak >= 45,
  },
  {
    type: 'category_master',
    name: 'Maître des Catégories',
    description: 'Habitudes dans 3 catégories différentes',
    condition: (stats) => stats.categoriesUsed >= 3,
  },
  {
    type: 'streak_saver',
    name: 'Sauveur de Série',
    description: 'Complète in extremis avant minuit',
    condition: (stats) => stats.streakSaver === true,
  },
  {
    type: 'two_hundred_completions',
    name: 'Bicentenaire',
    description: '200 habitudes complétées',
    condition: (stats) => stats.totalCompletions >= 200,
  },

  // ========== BADGES DIFFICILES (10) ==========
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
    type: 'ninety_days',
    name: 'Trimestre',
    description: 'Série de 90 jours',
    condition: (stats) => stats.bestStreak >= 90,
  },
  {
    type: 'hundred_days',
    name: '100 Jours',
    description: 'Série de 100 jours consécutifs',
    condition: (stats) => stats.bestStreak >= 100,
  },
  {
    type: 'three_hundred_completions',
    name: 'Spartiate',
    description: '300 habitudes complétées',
    condition: (stats) => stats.totalCompletions >= 300,
  },
  {
    type: 'perfect_month',
    name: 'Mois Parfait',
    description: 'Toutes les habitudes pendant 30 jours',
    condition: (stats) => stats.perfectMonth === true,
  },
  {
    type: 'fifteen_habits',
    name: 'Collectionneur',
    description: '15 habitudes différentes créées',
    condition: (stats) => stats.totalHabits >= 15,
  },
  {
    type: 'four_months',
    name: 'Quatre Mois',
    description: 'Série de 120 jours',
    condition: (stats) => stats.bestStreak >= 120,
  },
  {
    type: 'six_months',
    name: 'Semestre',
    description: 'Série de 180 jours',
    condition: (stats) => stats.bestStreak >= 180,
  },
  {
    type: 'daily_champion',
    name: 'Champion Quotidien',
    description: '10 habitudes complétées en un jour',
    condition: (stats) => stats.maxDailyCompletions >= 10,
  },

  // ========== BADGES TRÈS DIFFICILES (5) ==========
  {
    type: 'five_hundred_completions',
    name: 'Expert',
    description: '500 habitudes complétées',
    condition: (stats) => stats.totalCompletions >= 500,
  },
  {
    type: 'nine_months',
    name: 'Neuf Mois',
    description: 'Série de 270 jours',
    condition: (stats) => stats.bestStreak >= 270,
  },
  {
    type: 'seven_hundred_completions',
    name: 'Élite',
    description: '700 habitudes complétées',
    condition: (stats) => stats.totalCompletions >= 700,
  },
  {
    type: 'twenty_habits',
    name: 'Architecte',
    description: '20 habitudes différentes créées',
    condition: (stats) => stats.totalHabits >= 20,
  },
  {
    type: 'perfect_quarter',
    name: 'Trimestre Parfait',
    description: 'Toutes les habitudes pendant 90 jours',
    condition: (stats) => stats.perfectQuarter === true,
  },

  // ========== BADGES LÉGENDAIRES (5) ==========
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
  {
    type: 'two_thousand_completions',
    name: 'Immortel',
    description: '2000 habitudes complétées',
    condition: (stats) => stats.totalCompletions >= 2000,
  },
  {
    type: 'five_hundred_days',
    name: 'Demi-Millénaire',
    description: 'Série de 500 jours',
    condition: (stats) => stats.bestStreak >= 500,
  },
  {
    type: 'ultimate_master',
    name: 'Maître Ultime',
    description: '30 habitudes créées + 1000 complétées',
    condition: (stats) => stats.totalHabits >= 30 && stats.totalCompletions >= 1000,
  },

  // ========== BADGES SPÉCIAUX (5) ==========
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

  // ========== BADGES STREAK MUTUEL (4) ==========
  {
    type: 'friend_streak_7',
    name: 'Duo en Feu',
    description: 'Streak mutuel de 7 jours avec un ami',
    condition: (stats) => stats.bestFriendStreak >= 7,
  },
  {
    type: 'friend_streak_14',
    name: 'Partenaires',
    description: 'Streak mutuel de 14 jours avec un ami',
    condition: (stats) => stats.bestFriendStreak >= 14,
  },
  {
    type: 'friend_streak_30',
    name: 'Inséparables',
    description: 'Streak mutuel de 30 jours avec un ami',
    condition: (stats) => stats.bestFriendStreak >= 30,
  },
  {
    type: 'friend_streak_100',
    name: 'Âmes Sœurs',
    description: 'Streak mutuel de 100 jours avec un ami',
    condition: (stats) => stats.bestFriendStreak >= 100,
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