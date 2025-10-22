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

    return { total, completed, completionRate, avgStreak, bestStreak };
  }, [habits]);

  // Prepare chart data
  const chartData = habits.map(habit => ({
    name: habit.name.length > 15 ? habit.name.substring(0, 15) + '...' : habit.name,
    streak: habit.streak,
  }));

  // Generate analysis
  const getAnalysis = () => {
    const { completionRate, avgStreak, bestStreak, total } = stats;
    
    if (total === 0) {
      return "Commence par créer des habitudes pour voir ton analyse.";
    }

    if (completionRate >= 80) {
      return `Excellent travail ! Tu as complété ${completionRate}% de tes habitudes aujourd'hui. Ta discipline est impressionnante. Continue ainsi pour atteindre tes objectifs.`;
    } else if (completionRate >= 50) {
      return `Bien joué ! Tu as complété ${completionRate}% de tes habitudes. Tu es sur la bonne voie. Reste constant et tu verras des résultats extraordinaires.`;
    } else if (completionRate > 0) {
      return `Tu as complété ${completionRate}% de tes habitudes aujourd'hui. Chaque petit pas compte. Concentre-toi sur une habitude à la fois pour construire un momentum positif.`;
    } else {
      return "Aujourd'hui est une nouvelle opportunité. Commence par une seule habitude, la plus facile, et construis ta série de victoires à partir de là.";
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
      <DialogContent className="glass max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl sm:text-2xl">
            Tes <span className="bg-gradient-primary bg-clip-text text-transparent">Statistiques</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
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
          </div>

          {/* Chart */}
          {habits.length > 0 && (
            <div className="glass rounded-xl p-3 sm:p-4 shadow-elevation">
              <h3 className="text-sm sm:text-base font-bold text-foreground mb-3">Séries par habitude</h3>
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="streak" 
                      fill="var(--color-streak)" 
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}

          {/* Analysis */}
          <div className="glass rounded-xl p-3 sm:p-4 shadow-elevation border border-primary/10">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-1 sm:mb-2">Analyse</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
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
