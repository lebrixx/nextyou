import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, Calendar, Award, ArrowLeft, Crown, Sparkles, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAdvancedStats } from "@/hooks/useAdvancedStats";
import WeeklyChart from "@/components/stats/WeeklyChart";
import DayOfWeekChart from "@/components/stats/DayOfWeekChart";
import PredictionsCard from "@/components/stats/PredictionsCard";
import TrendIndicator from "@/components/stats/TrendIndicator";
import MonthlyHeatmap from "@/components/stats/MonthlyHeatmap";
import { format } from "date-fns";

interface Habit {
  id: string;
  name: string;
  streak: number;
  best_streak: number;
  completed: boolean;
  created_at: string;
}

const Stats = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoadingHabits(false);
          return;
        }

        // Fetch habits
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_archived', false);

        if (habitsError) throw habitsError;

        // Fetch today's completions
        const { data: completionsData } = await supabase
          .from('habit_completions')
          .select('habit_id')
          .eq('user_id', user.id)
          .eq('completed_at', today);

        const completedIds = new Set(completionsData?.map(c => c.habit_id) || []);

        const enrichedHabits = (habitsData || []).map(h => ({
          ...h,
          completed: completedIds.has(h.id)
        }));

        setHabits(enrichedHabits);
      } catch (err) {
        console.error('Error fetching habits:', err);
      } finally {
        setLoadingHabits(false);
      }
    };

    fetchHabits();
  }, [today]);

  const { 
    loading: loadingStats, 
    last7Days, 
    last30Days,
    weeklyComparison,
    dayOfWeekStats,
    bestDay,
    worstDay,
    predictions,
    trend,
    totalStats
  } = useAdvancedStats(habits);

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

  const chartConfig = {
    streak: {
      label: "Série",
      color: "hsl(var(--primary))",
    },
  };

  const isLoading = loadingHabits || loadingStats;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-4 relative">
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary shadow-glow mb-3">
            <BarChart3 className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            Tes <span className="bg-gradient-primary bg-clip-text text-transparent">Statistiques</span>
          </h1>
          <p className="text-muted-foreground text-xs">
            Analyse complète de ta progression
          </p>
        </div>
      </header>

      <main className="px-4 space-y-3 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : habits.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center border border-primary/20">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">Pas encore de données</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crée des habitudes et complète-les pour voir tes statistiques détaillées !
            </p>
            <Button onClick={() => navigate('/habits')} className="bg-gradient-primary">
              Créer une habitude
            </Button>
          </div>
        ) : (
          <>
            {/* Main Stats */}
            <div className="glass rounded-2xl p-4 text-center border border-primary/20">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Progression du jour</p>
              <div className="flex items-baseline justify-center gap-2 mb-1">
                <span className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {stats.completionRate}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.completedToday} complétée{stats.completedToday > 1 ? 's' : ''} • {stats.remainingToday} restante{stats.remainingToday > 1 ? 's' : ''}
              </p>
            </div>

            {/* Trend Indicator */}
            <TrendIndicator 
              direction={trend.direction as 'up' | 'down' | 'stable'} 
              percentChange={trend.percentChange} 
              diff={trend.diff} 
            />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
              <div className="glass rounded-xl p-2.5 text-center border border-white/10">
                <Award className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{stats.bestStreak}</p>
                <p className="text-[8px] text-muted-foreground">Meilleure</p>
              </div>
              <div className="glass rounded-xl p-2.5 text-center border border-white/10">
                <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{stats.avgStreak}</p>
                <p className="text-[8px] text-muted-foreground">Moyenne</p>
              </div>
              <div className="glass rounded-xl p-2.5 text-center border border-white/10">
                <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{totalStats.perfectDays}</p>
                <p className="text-[8px] text-muted-foreground">Jrs parfaits</p>
              </div>
              <div className="glass rounded-xl p-2.5 text-center border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold text-foreground">{totalStats.consistencyScore}%</p>
                <p className="text-[8px] text-muted-foreground">Constance</p>
              </div>
            </div>

            {/* Weekly Chart */}
            <WeeklyChart data={last7Days} />

            {/* Monthly Heatmap */}
            <MonthlyHeatmap data={last30Days} />

            {/* Day of Week Stats */}
            <DayOfWeekChart 
              data={dayOfWeekStats} 
              bestDay={bestDay} 
              worstDay={worstDay} 
            />

            {/* Predictions & Goals */}
            <PredictionsCard predictions={predictions} />

            {/* Weekly Comparison */}
            <div className="glass rounded-xl p-3 border border-primary/10">
              <h3 className="text-xs font-bold text-foreground mb-2">Évolution hebdomadaire</h3>
              <div className="grid grid-cols-4 gap-2">
                {weeklyComparison.map((week, index) => (
                  <div key={week.week} className="text-center">
                    <div 
                      className="h-16 rounded-lg mb-1 flex items-end justify-center overflow-hidden"
                      style={{ background: 'hsl(var(--muted)/0.3)' }}
                    >
                      <div 
                        className="w-full bg-gradient-primary rounded-t-sm transition-all duration-500"
                        style={{ height: `${week.rate}%` }}
                      />
                    </div>
                    <p className="text-lg font-bold text-foreground">{week.rate}%</p>
                    <p className="text-[8px] text-muted-foreground">{week.week}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Status */}
            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-xl p-3 border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <p className="text-[9px] text-muted-foreground uppercase">Actives</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.activeHabits}</p>
                <p className="text-[9px] text-muted-foreground">avec série en cours</p>
              </div>
              <div className="glass rounded-xl p-3 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <p className="text-[9px] text-muted-foreground uppercase">Inactives</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{stats.inactiveHabits}</p>
                <p className="text-[9px] text-muted-foreground">à relancer</p>
              </div>
            </div>

            {/* Streak Chart */}
            {habits.length > 0 && (
              <div className="glass rounded-xl p-3 border border-white/10">
                <h3 className="text-xs font-bold text-foreground mb-2">Séries par habitude</h3>
                <ChartContainer config={chartConfig} className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.2} />
                      <XAxis 
                        dataKey="name" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={8}
                        tickLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={45}
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
          </>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default Stats;
