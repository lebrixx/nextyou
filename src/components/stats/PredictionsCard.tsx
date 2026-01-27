import { Target, Flame, TrendingUp, Trophy, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Prediction {
  daysToGoal: number;
  projectedStreak: number;
  weeklyTarget: number;
  currentWeekProgress: number;
  streakHealth: 'excellent' | 'good' | 'warning' | 'danger';
  nextMilestone: number;
  daysToMilestone: number;
}

interface PredictionsCardProps {
  predictions: Prediction;
}

const PredictionsCard = ({ predictions }: PredictionsCardProps) => {
  const healthColors = {
    excellent: { bg: 'bg-green-500/20', text: 'text-green-500', border: 'border-green-500/30' },
    good: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/30' },
    warning: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/30' },
    danger: { bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/30' }
  };

  const healthLabels = {
    excellent: 'Excellente',
    good: 'Bonne',
    warning: 'Attention',
    danger: 'En danger'
  };

  const colors = healthColors[predictions.streakHealth];

  return (
    <div className="glass rounded-xl p-3 border border-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-foreground">Prédictions & Objectifs</h3>
          <p className="text-[9px] text-muted-foreground">Basées sur tes 30 derniers jours</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Streak Health */}
        <div className={`rounded-lg p-2.5 ${colors.bg} border ${colors.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${colors.text}`} />
              <span className="text-[10px] font-medium text-foreground">Santé de ta série</span>
            </div>
            <span className={`text-xs font-bold ${colors.text}`}>{healthLabels[predictions.streakHealth]}</span>
          </div>
        </div>

        {/* Weekly Progress */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] text-foreground">Objectif hebdo</span>
            </div>
            <span className="text-[10px] font-bold text-foreground">{predictions.currentWeekProgress}%</span>
          </div>
          <Progress value={predictions.currentWeekProgress} className="h-2" />
          <p className="text-[9px] text-muted-foreground mt-1">
            Objectif: {predictions.weeklyTarget} complétions cette semaine
          </p>
        </div>

        {/* Projections */}
        <div className="grid grid-cols-2 gap-2">
          <div className="glass rounded-lg p-2 text-center">
            <TrendingUp className="w-3.5 h-3.5 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{predictions.projectedStreak}j</p>
            <p className="text-[9px] text-muted-foreground">Série projetée</p>
          </div>
          <div className="glass rounded-lg p-2 text-center">
            <Trophy className="w-3.5 h-3.5 text-yellow-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-foreground">{predictions.nextMilestone}j</p>
            <p className="text-[9px] text-muted-foreground">Prochain palier</p>
          </div>
        </div>

        {predictions.daysToMilestone > 0 && (
          <div className="text-center pt-1 border-t border-border/30">
            <p className="text-[10px] text-muted-foreground">
              Plus que <span className="font-bold text-primary">{predictions.daysToMilestone} jours</span> pour atteindre {predictions.nextMilestone} jours !
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionsCard;
