import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Brain, Loader2, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { useHabitDifficultyAnalyzer, type HabitAnalysis } from '@/hooks/useHabitDifficultyAnalyzer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface HabitDifficultyAnalyzerProps {
  habits: any[];
  stats: any;
  onHabitCreated?: () => void;
}

export const HabitDifficultyAnalyzer = ({ habits, stats, onHabitCreated }: HabitDifficultyAnalyzerProps) => {
  const { analyze, results, loading, error } = useHabitDifficultyAnalyzer();
  const [expandedHabit, setExpandedHabit] = useState<string | null>(null);

  const handleAnalyze = () => {
    analyze(habits, stats);
  };

  const handleApplyTwoMinuteVersion = async (habitId: string, twoMinuteVersion: string) => {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ 
          two_minute_version: twoMinuteVersion,
          is_two_minute_active: true
        })
        .eq('id', habitId);

      if (error) throw error;

      toast({
        title: 'Version 2 minutes activée',
        description: 'L\'habitude a été simplifiée avec succès.'
      });

      if (onHabitCreated) onHabitCreated();
    } catch (err) {
      console.error('Error applying 2-minute version:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'appliquer la version 2 minutes.',
        variant: 'destructive'
      });
    }
  };

  const handleCreateSuggestedHabit = async (habitName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: habitName,
          icon: 'target',
          frequency: 'daily',
          target: 1
        });

      if (error) throw error;

      toast({
        title: 'Habitude créée',
        description: `"${habitName}" a été ajoutée à tes habitudes.`
      });

      if (onHabitCreated) onHabitCreated();
    } catch (err) {
      console.error('Error creating suggested habit:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer l\'habitude.',
        variant: 'destructive'
      });
    }
  };

  const getCategoryBadge = (category: HabitAnalysis['category']) => {
    const variants = {
      too_hard: { label: 'Trop difficile', className: 'bg-red-500/20 text-red-300' },
      too_easy: { label: 'Trop facile', className: 'bg-blue-500/20 text-blue-300' },
      perfect: { label: 'Parfait', className: 'bg-green-500/20 text-green-300' },
      redundant: { label: 'Redondante', className: 'bg-yellow-500/20 text-yellow-300' },
      energy_draining: { label: 'Énergivore', className: 'bg-orange-500/20 text-orange-300' }
    };

    const variant = variants[category];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Analyse Intelligente de Tes Habitudes
          </CardTitle>
          <CardDescription>
            L'IA analyse tes habitudes et te propose des recommandations personnalisées
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleAnalyze} 
            disabled={loading || habits.length === 0}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Analyser mes habitudes
              </>
            )}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {results && results.analysis && results.analysis.length > 0 && (
        <div className="space-y-3">
          {results.analysis.map((analysis) => {
            const habit = habits.find(h => h.id === analysis.habit_id);
            if (!habit) return null;

            const isExpanded = expandedHabit === analysis.habit_id;

            return (
              <Card 
                key={analysis.habit_id}
                className="bg-background/50 backdrop-blur-sm border-primary/10 hover:border-primary/30 transition-colors cursor-pointer"
                onClick={() => setExpandedHabit(isExpanded ? null : analysis.habit_id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{habit.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {getCategoryBadge(analysis.category)}
                        <Badge variant="outline">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {analysis.difficulty_score}/10
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 animate-fade-in">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Analyse</h4>
                      <p className="text-sm text-muted-foreground">{analysis.reason}</p>
                    </div>

                    {analysis.two_minute_version && (
                      <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold text-sm">Version 2 Minutes</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {analysis.two_minute_version}
                        </p>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyTwoMinuteVersion(analysis.habit_id, analysis.two_minute_version);
                          }}
                        >
                          Activer cette version
                        </Button>
                      </div>
                    )}

                    {analysis.suggested_new_habits && analysis.suggested_new_habits.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Habitudes suggérées</h4>
                        <div className="space-y-2">
                          {analysis.suggested_new_habits.map((suggestion, idx) => (
                            <div 
                              key={idx}
                              className="flex items-center justify-between p-2 bg-secondary/50 rounded-lg"
                            >
                              <p className="text-sm">{suggestion}</p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCreateSuggestedHabit(suggestion);
                                }}
                              >
                                Ajouter
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
