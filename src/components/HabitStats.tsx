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
    const perfectDays = habits.filter(h => h.streak > 0).length; // Nombre d'habitudes avec au moins 1 jour de série

    return { total, completed, completionRate, avgStreak, bestStreak, totalStreakDays, perfectDays };
  }, [habits]);

  // Prepare chart data
  const chartData = habits.map(habit => ({
    name: habit.name.length > 15 ? habit.name.substring(0, 15) + '...' : habit.name,
    streak: habit.streak,
  }));

  // Generate analysis
  const getAnalysis = () => {
    const { completionRate, avgStreak, bestStreak, total, totalStreakDays, perfectDays } = stats;
    
    if (total === 0) {
      return "Commence par créer des habitudes pour voir ton analyse.";
    }

    const consistency = perfectDays / total;
    
    if (completionRate >= 80 && avgStreak >= 5) {
      return `Extraordinaire ! Tu as complété ${completionRate}% de tes habitudes avec une moyenne de ${avgStreak} jours de série. Tu accumules déjà ${totalStreakDays} jours au total. Ta discipline est exemplaire et te rapproche chaque jour de tes objectifs. Continue sur cette lancée !`;
    } else if (completionRate >= 80) {
      return `Excellent travail ! Tu as complété ${completionRate}% de tes habitudes aujourd'hui. Ta discipline est impressionnante. Pour maximiser ton impact, concentre-toi sur maintenir ces habitudes plusieurs jours d'affilée.`;
    } else if (completionRate >= 50 && avgStreak >= 3) {
      return `Bien joué ! Tu as complété ${completionRate}% de tes habitudes avec ${totalStreakDays} jours cumulés. Tu prouves ta constance avec une série moyenne de ${avgStreak} jours. Continue ainsi et tu atteindras des résultats extraordinaires.`;
    } else if (completionRate >= 50) {
      return `Bien joué ! Tu as complété ${completionRate}% de tes habitudes. Tu es sur la bonne voie. Pour progresser, essaie de ne pas rompre tes séries - chaque jour consécutif renforce ta volonté.`;
    } else if (completionRate > 0) {
      return `Tu as complété ${completionRate}% de tes habitudes aujourd'hui. Chaque petit pas compte. ${perfectDays > 0 ? `Tu as ${perfectDays} habitude(s) active(s) - concentre-toi sur elles pour construire un momentum positif.` : 'Commence par une seule habitude pour créer un effet d\'entraînement.'}`;
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
          <DialogTitle className="text-lg sm:text-xl">
            Tes <span className="bg-gradient-primary bg-clip-text text-transparent">Statistiques</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2">
            <StatsCard
              icon={Calendar}
              label="Aujourd'hui"
              value={`${stats.completed}/${stats.total}`}
            />
            <StatsCard
              icon={TrendingUp}
              label="Taux"
              value={`${stats.completionRate}%`}
              trend={stats.completionRate >= 50 ? "+5%" : "-2%"}
              trendUp={stats.completionRate >= 50}
            />
            <StatsCard
              icon={Award}
              label="Série moy."
              value={stats.avgStreak}
            />
            <StatsCard
              icon={TrendingUp}
              label="Meilleure"
              value={stats.bestStreak}
            />
            <StatsCard
              icon={Calendar}
              label="Total jours"
              value={stats.totalStreakDays}
            />
            <StatsCard
              icon={Award}
              label="Actives"
              value={`${stats.perfectDays}/${stats.total}`}
            />
          </div>

          {/* Chart */}
          {habits.length > 0 && (
            <div className="glass rounded-xl p-2 sm:p-3 shadow-elevation">
              <h3 className="text-xs sm:text-sm font-bold text-foreground mb-2">Séries par habitude</h3>
              <ChartContainer config={chartConfig} className="h-[160px] sm:h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 2, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={8}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={8}
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
          <div className="glass rounded-xl p-2 sm:p-3 shadow-elevation border border-primary/10">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1">Analyse</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
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
