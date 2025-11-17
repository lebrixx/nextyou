import { useState, useEffect } from 'react';

interface OverloadDetection {
  overloadDetected: boolean;
  overloadLevel: 'low' | 'medium' | 'high';
  suggestions: string[];
}

export const useAntiOverload = (habits: any[], completions: any[]) => {
  const [detection, setDetection] = useState<OverloadDetection>({
    overloadDetected: false,
    overloadLevel: 'low',
    suggestions: []
  });

  useEffect(() => {
    if (!habits.length) return;

    const analyzeOverload = () => {
      const today = new Date();
      const last7Days = completions.filter(c => {
        const completedDate = new Date(c.completed_at);
        const daysDiff = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 7;
      });

      // Calculate metrics
      const totalHabits = habits.length;
      const activeHabits = habits.filter(h => !h.is_archived).length;
      const completionRate = (last7Days.length / (activeHabits * 7)) * 100;
      const avgStreak = habits.reduce((sum, h) => sum + h.streak, 0) / totalHabits;

      // Detect overload conditions
      const tooManyHabits = activeHabits > 10;
      const lowCompletionRate = completionRate < 50;
      const decliningStreak = avgStreak < 3;
      const recentCreations = habits.filter(h => {
        const createdDate = new Date(h.created_at);
        const daysDiff = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 14;
      }).length > 5;

      const suggestions: string[] = [];
      let overloadLevel: 'low' | 'medium' | 'high' = 'low';

      if (tooManyHabits) {
        suggestions.push('Tu as trop d\'habitudes actives. Archive celles qui sont moins importantes.');
        overloadLevel = 'medium';
      }

      if (lowCompletionRate) {
        suggestions.push('Ton taux de complétion est faible. Réduis le nombre d\'habitudes ou simplifie-les.');
        overloadLevel = 'medium';
      }

      if (decliningStreak) {
        suggestions.push('Tes séries sont en baisse. Concentre-toi sur 3-5 habitudes essentielles.');
        overloadLevel = 'high';
      }

      if (recentCreations) {
        suggestions.push('Tu as créé trop d\'habitudes récemment. Laisse-toi le temps de les ancrer.');
        overloadLevel = 'high';
      }

      if (tooManyHabits && lowCompletionRate && decliningStreak) {
        overloadLevel = 'high';
        suggestions.unshift('⚠️ SURCHARGE DÉTECTÉE : Ton rythme n\'est pas soutenable. Pause recommandée.');
      }

      const overloadDetected = suggestions.length > 0;

      setDetection({
        overloadDetected,
        overloadLevel,
        suggestions
      });
    };

    analyzeOverload();
  }, [habits, completions]);

  return detection;
};
