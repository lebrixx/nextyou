import { Target, Flame, TrendingUp, Trophy, Zap, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SectionHeader from "./SectionHeader";

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

  const healthExplanations = {
    excellent: "Tu as complété plus de 80% de tes habitudes ces 3 derniers jours. Continue !",
    good: "Tu es entre 60% et 80% de complétion. Tu es sur la bonne voie !",
    warning: "Tu es entre 40% et 60%. Essaie de te concentrer sur tes habitudes les plus importantes.",
    danger: "Tu es en dessous de 40%. Recommence doucement avec une seule habitude facile."
  };

  const colors = healthColors[predictions.streakHealth];

  return (
    <div className="glass rounded-xl p-3 border border-primary/10">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-gradient-primary flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <SectionHeader 
            title="Prédictions & Objectifs" 
            tooltip={{
              title: "Prédictions intelligentes",
              description: "Ces prédictions sont calculées à partir de ton historique des 30 derniers jours. Elles t'aident à visualiser ta progression et à rester motivé !",
              period: "Basé sur 30 jours"
            }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {/* Streak Health */}
        <div className={`rounded-lg p-2.5 ${colors.bg} border ${colors.border}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className={`w-4 h-4 ${colors.text}`} />
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-medium text-foreground">Santé de ta série</span>
                <span className="text-[7px] text-muted-foreground/70 italic hidden sm:inline">clique →</span>
                <span className="text-[7px] text-muted-foreground/70 italic sm:hidden">tap →</span>
                <Popover>
                  <PopoverTrigger asChild>
                    <button 
                      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted/50 hover:bg-muted active:bg-muted/70 transition-colors touch-manipulation"
                      aria-label="Info santé série"
                    >
                      <Info className="w-2 h-2 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    side="top" 
                    align="start"
                    className="w-[220px] p-2.5 bg-popover border border-border shadow-lg z-50"
                    sideOffset={8}
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-[10px] text-foreground">Que signifie "{healthLabels[predictions.streakHealth]}" ?</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {healthExplanations[predictions.streakHealth]}
                      </p>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
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
              <span className="text-[7px] text-muted-foreground/70 italic hidden sm:inline">clique →</span>
              <span className="text-[7px] text-muted-foreground/70 italic sm:hidden">tap →</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted/50 hover:bg-muted active:bg-muted/70 transition-colors touch-manipulation"
                    aria-label="Info objectif hebdo"
                  >
                    <Info className="w-2 h-2 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  side="top" 
                  align="start"
                  className="w-[200px] p-2.5 bg-popover border border-border shadow-lg z-50"
                  sideOffset={8}
                >
                  <p className="text-[10px] text-muted-foreground">
                    L'objectif est de compléter toutes tes habitudes chaque jour de la semaine. {predictions.weeklyTarget} = {Math.round(predictions.weeklyTarget / 7)} habitudes × 7 jours.
                  </p>
                </PopoverContent>
              </Popover>
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
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-primary" />
              <span className="text-[6px] text-muted-foreground/70 italic hidden sm:inline">clique →</span>
              <span className="text-[6px] text-muted-foreground/70 italic sm:hidden">tap →</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-muted/50 hover:bg-muted active:bg-muted/70 transition-colors touch-manipulation"
                    aria-label="Info série projetée"
                  >
                    <Info className="w-2 h-2 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  side="top"
                  className="w-[180px] p-2 text-[10px] bg-popover border border-border shadow-lg z-50"
                  sideOffset={8}
                >
                  Estimation de ta série dans 7 jours si tu maintiens ton rythme actuel.
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-lg font-bold text-foreground">{predictions.projectedStreak}j</p>
            <p className="text-[9px] text-muted-foreground">Série projetée</p>
          </div>
          <div className="glass rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-3.5 h-3.5 text-yellow-500" />
              <span className="text-[6px] text-muted-foreground/70 italic hidden sm:inline">clique →</span>
              <span className="text-[6px] text-muted-foreground/70 italic sm:hidden">tap →</span>
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-muted/50 hover:bg-muted active:bg-muted/70 transition-colors touch-manipulation"
                    aria-label="Info prochain palier"
                  >
                    <Info className="w-2 h-2 text-muted-foreground" />
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  side="top"
                  className="w-[180px] p-2 text-[10px] bg-popover border border-border shadow-lg z-50"
                  sideOffset={8}
                >
                  Le prochain palier à atteindre ! Les paliers sont: 7, 14, 21, 30, 50, 75, 100, 150, 200 et 365 jours.
                </PopoverContent>
              </Popover>
            </div>
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
