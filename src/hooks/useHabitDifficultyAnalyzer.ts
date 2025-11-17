import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HabitAnalysis {
  habit_id: string;
  difficulty_score: number;
  category: 'too_hard' | 'too_easy' | 'perfect' | 'redundant' | 'energy_draining';
  recommendation_type: string;
  reason: string;
  two_minute_version: string;
  suggested_new_habits: string[];
}

export interface AnalysisResult {
  analysis: HabitAnalysis[];
}

export const useHabitDifficultyAnalyzer = () => {
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (habits: any[], stats: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        'habit-difficulty-analyzer',
        {
          body: { habits, stats }
        }
      );

      if (functionError) {
        throw functionError;
      }

      setResults(data as AnalysisResult);
    } catch (err) {
      console.error('Error analyzing habits:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return {
    analyze,
    results,
    loading,
    error
  };
};
