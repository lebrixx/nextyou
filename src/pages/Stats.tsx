import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Calendar, Award, ArrowLeft, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import Navigation from "@/components/Navigation";

interface Habit {
  id: string;
  name: string;
  streak: number;
  completed: boolean;
}

const Stats = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("habitflow_habits");
    setHabits(saved ? JSON.parse(saved) : []);

    const handleStorage = () => {
      const saved = localStorage.getItem("habitflow_habits");
      setHabits(saved ? JSON.parse(saved) : []);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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

  const chartData = habits.map(habit => ({
    name: habit.name.length > 12 ? habit.name.substring(0, 12) + '...' : habit.name,
    streak: habit.streak,
  }));

  const getAnalysis = () => {
    const { completionRate, avgStreak, total, totalStreakDays, activeHabits } = stats;
    
    if (total === 0) {
      return "Commence par créer des habitudes pour voir ton analyse.";
    }

    if (completionRate >= 80 && avgStreak >= 5) {
      return `Extraordinaire ! Tu as complété ${completionRate}% de tes habitudes avec une moyenne de ${avgStreak} jours de série. Tu accumules déjà ${totalStreakDays} jours au total. Ta discipline est exemplaire !`;
    } else if (completionRate >= 80) {
      return `Excellent travail ! Tu as complété ${completionRate}% de tes habitudes aujourd'hui. Pour maximiser ton impact, concentre-toi sur maintenir ces habitudes plusieurs jours d'affilée.`;
    } else if (completionRate >= 50 && avgStreak >= 3) {
      return `Bien joué ! Tu as complété ${completionRate}% de tes habitudes avec ${totalStreakDays} jours cumulés. Continue ainsi et tu atteindras des résultats extraordinaires.`;
    } else if (completionRate >= 50) {
      return `Bien joué ! Tu as complété ${completionRate}% de tes habitudes. Pour progresser, essaie de ne pas rompre tes séries.`;
    } else if (completionRate > 0) {
      return `Tu as complété ${completionRate}% de tes habitudes aujourd'hui. Chaque petit pas compte. ${activeHabits > 0 ? `Concentre-toi sur tes ${activeHabits} habitude(s) active(s).` : ''}`;
    } else {
      return "Aujourd'hui est une nouvelle opportunité. Commence par une seule habitude et construis ta série de victoires.";
    }
  };

  const chartConfig = {
    streak: {
      label: "Série",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-6 relative">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="sm"
          className="absolute top-8 left-6 w-10 h-10 p-0 rounded-full glass"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Button>
        
        <Button
          onClick={() => navigate("/premium")}
          variant="ghost"
          size="sm"
          className="absolute top-8 right-6 w-10 h-10 p-0 rounded-full bg-gradient-primary shadow-glow hover:opacity-90"
        >
          <Crown className="w-5 h-5 text-primary-foreground" />
        </Button>

        <div className="text-center pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <BarChart3 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Tes <span className="bg-gradient-primary bg-clip-text text-transparent">Statistiques</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Vue détaillée de ta progression
          </p>
        </div>
      </header>

      <main className="px-6 space-y-4 max-w-2xl mx-auto">
        {/* Main Stats */}
        <div className="glass rounded-2xl p-5 text-center border border-primary/20">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Progression du jour</p>
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {stats.completionRate}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {stats.completedToday} complétée{stats.completedToday > 1 ? 's' : ''} • {stats.remainingToday} restante{stats.remainingToday > 1 ? 's' : ''}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass rounded-xl p-4 text-center border border-white/10">
            <Award className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.bestStreak}</p>
            <p className="text-xs text-muted-foreground">Meilleure série</p>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-white/10">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.avgStreak}</p>
            <p className="text-xs text-muted-foreground">Série moyenne</p>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-white/10">
            <Calendar className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{stats.totalStreakDays}</p>
            <p className="text-xs text-muted-foreground">Total jours</p>
          </div>
        </div>

        {/* Activity Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-xl p-4 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p className="text-xs text-muted-foreground uppercase">Actives</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.activeHabits}</p>
            <p className="text-xs text-muted-foreground">avec série en cours</p>
          </div>
          <div className="glass rounded-xl p-4 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <p className="text-xs text-muted-foreground uppercase">Inactives</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.inactiveHabits}</p>
            <p className="text-xs text-muted-foreground">à relancer</p>
          </div>
        </div>

        {/* Chart */}
        {habits.length > 0 && (
          <div className="glass rounded-2xl p-4 border border-white/10">
            <h3 className="text-sm font-bold text-foreground mb-3">Séries par habitude</h3>
            <ChartContainer config={chartConfig} className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={9}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={9}
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
        <div className="glass rounded-2xl p-4 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground mb-2">💡 Analyse personnalisée</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getAnalysis()}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  );
};

export default Stats;
