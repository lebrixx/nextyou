import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Calendar, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
}

interface HabitStatsProps {
  habits: Habit[];
}

const HabitStats = ({ habits }: HabitStatsProps) => {
  const [open, setOpen] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = habits.length;
    const completed = habits.filter(h => h.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgStreak = total > 0 ? Math.round(habits.reduce((sum, h) => sum + h.streak, 0) / total) : 0;
    const bestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
    const totalStreakDays = habits.reduce((sum, h) => sum + h.streak, 0);
    const activeHabits = habits.filter(h => h.streak > 0).length;
    const inactiveHabits = habits.filter(h => h.streak === 0).length;
    const completedToday = completed;
    const remainingToday = total - completed;

    return { total, completed, completionRate, avgStreak, bestStreak, totalStreakDays, activeHabits, inactiveHabits, completedToday, remainingToday };
  }, [habits]);

  // Prepare chart data
  const chartData = habits.map(habit => ({
    name: habit.name.length > 15 ? habit.name.substring(0, 15) + '...' : habit.name,
    streak: habit.streak,
  }));

  // Generate analysis
  const getAnalysis = () => {
    const { completionRate, avgStreak, bestStreak, total, totalStreakDays, activeHabits } = stats;
    
    if (total === 0) {
      return "Commence par créer des habitudes pour voir ton analyse.";
    }

    const consistency = activeHabits / total;
    
    if (completionRate >= 80 && avgStreak >= 5) {
      return `Extraordinaire ! Tu as complété ${completionRate}% de tes habitudes avec une moyenne de ${avgStreak} jours de série. Tu accumules déjà ${totalStreakDays} jours au total. Ta discipline est exemplaire et te rapproche chaque jour de tes objectifs. Continue sur cette lancée !`;
    } else if (completionRate >= 80) {
      return `Excellent travail ! Tu as complété ${completionRate}% de tes habitudes aujourd'hui. Ta discipline est impressionnante. Pour maximiser ton impact, concentre-toi sur maintenir ces habitudes plusieurs jours d'affilée.`;
    } else if (completionRate >= 50 && avgStreak >= 3) {
      return `Bien joué ! Tu as complété ${completionRate}% de tes habitudes avec ${totalStreakDays} jours cumulés. Tu prouves ta constance avec une série moyenne de ${avgStreak} jours. Continue ainsi et tu atteindras des résultats extraordinaires.`;
    } else if (completionRate >= 50) {
      return `Bien joué ! Tu as complété ${completionRate}% de tes habitudes. Tu es sur la bonne voie. Pour progresser, essaie de ne pas rompre tes séries - chaque jour consécutif renforce ta volonté.`;
    } else if (completionRate > 0) {
      return `Tu as complété ${completionRate}% de tes habitudes aujourd'hui. Chaque petit pas compte. ${activeHabits > 0 ? `Tu as ${activeHabits} habitude(s) active(s) - concentre-toi sur elles pour construire un momentum positif.` : 'Commence par une seule habitude pour créer un effet d\'entraînement.'}`;
    } else {
      return "Aujourd'hui est une nouvelle opportunité. Commence par une seule habitude, la plus facile, et construis ta série de victoires à partir de là. Le premier jour est toujours le plus important.";
    }
  };

  const chartConfig = {
    streak: {
      label: "Série",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="w-full border-primary/50 text-primary hover:bg-primary/10 h-9 text-sm font-semibold"
        >
          <BarChart3 className="w-4 h-4 mr-1" />
          Statistiques
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto p-3 sm:p-5">
        <DialogHeader className="mb-3">
          <DialogTitle className="text-lg sm:text-xl font-bold">
            Tes <span className="bg-gradient-primary bg-clip-text text-transparent">Statistiques</span>
          </DialogTitle>
          <p className="text-xs text-muted-foreground">Vue détaillée de ta progression</p>
        </DialogHeader>

        <div className="space-y-3">
          {/* Main Stats - Large Display */}
          <div className="glass rounded-xl p-4 text-center border border-primary/20">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Progression du jour</p>
            <div className="flex items-baseline justify-center gap-2 mb-1">
              <span className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {stats.completionRate}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completedToday} complétée{stats.completedToday > 1 ? 's' : ''} • {stats.remainingToday} restante{stats.remainingToday > 1 ? 's' : ''}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass rounded-lg p-3 text-center">
              <Award className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{stats.bestStreak}</p>
              <p className="text-[9px] text-muted-foreground">Meilleure série</p>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{stats.avgStreak}</p>
              <p className="text-[9px] text-muted-foreground">Série moyenne</p>
            </div>
            <div className="glass rounded-lg p-3 text-center">
              <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xl font-bold text-foreground">{stats.totalStreakDays}</p>
              <p className="text-[9px] text-muted-foreground">Total jours</p>
            </div>
          </div>

          {/* Activity Status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="glass rounded-lg p-3 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-[9px] text-muted-foreground uppercase">Actives</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.activeHabits}</p>
              <p className="text-[9px] text-muted-foreground">avec série en cours</p>
            </div>
            <div className="glass rounded-lg p-3 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <p className="text-[9px] text-muted-foreground uppercase">Inactives</p>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.inactiveHabits}</p>
              <p className="text-[9px] text-muted-foreground">à relancer</p>
            </div>
          </div>

          {/* Chart */}
          {habits.length > 0 && (
            <div className="glass rounded-xl p-3 shadow-elevation">
              <h3 className="text-xs font-bold text-foreground mb-2">Séries par habitude</h3>
              <ChartContainer config={chartConfig} className="h-[140px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={7}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={7}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="streak" 
                      fill="var(--color-streak)" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}

          {/* Analysis */}
          <div className="glass rounded-xl p-3 shadow-elevation border border-primary/10">
            <div className="flex items-start gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-foreground mb-1.5">💡 Analyse personnalisée</h3>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  {getAnalysis()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HabitStats;
