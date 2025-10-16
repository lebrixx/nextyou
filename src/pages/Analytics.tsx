import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Award, Calendar, Target } from "lucide-react";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import HabitIcon from "@/components/HabitIcon";

interface Habit {
  id: string;
  name: string;
  icon: string;
  streak: number;
  completed: boolean;
}

const Analytics = () => {
  const [habits, setHabits] = useState<Habit[]>([]);

  useEffect(() => {
    const loadHabits = () => {
      const saved = localStorage.getItem("habitflow_habits");
      if (saved) {
        setHabits(JSON.parse(saved));
      }
    };

    loadHabits();
    
    // Refresh when returning to page
    const interval = setInterval(loadHabits, 500);
    return () => clearInterval(interval);
  }, []);

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.completed).length;
  const successRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const totalStreakDays = habits.reduce((sum, h) => sum + h.streak, 0);
  const avgStreak = totalHabits > 0 ? Math.round(totalStreakDays / totalHabits) : 0;

  // Calculate individual habit success rates (based on streak as proxy)
  const habitPerformances = habits.map(habit => ({
    ...habit,
    performance: Math.min(100, habit.streak * 10), // Simple calculation: 10 days = 100%
  })).sort((a, b) => b.performance - a.performance);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Ana<span className="bg-gradient-primary bg-clip-text text-transparent">lyse</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Comprends tes habitudes, améliore ta constance
        </p>
      </header>

      <main className="px-6 pt-4 space-y-4 max-w-2xl mx-auto">
        {habits.length === 0 ? (
          <section className="glass rounded-xl p-8 text-center shadow-elevation space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center mb-2">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Commence à suivre tes habitudes</h2>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cette section te permettra de visualiser tes progrès et de comprendre tes habitudes :
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Suivre ton taux de réussite au fil du temps</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Identifier tes meilleurs moments de la semaine</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Analyser la performance de chaque habitude</span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground/70 pt-2 italic">
                Les statistiques apparaîtront automatiquement une fois que tu auras commencé à suivre tes habitudes quotidiennes.
              </p>
            </div>
          </section>
        ) : (
          <>
            {/* Stats Overview */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground tracking-tight">Vue d&apos;ensemble</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatsCard
                  icon={TrendingUp}
                  label="Taux de réussite"
                  value={`${successRate}%`}
                />
                <StatsCard
                  icon={Award}
                  label="Meilleur streak"
                  value={`${longestStreak}j`}
                />
                <StatsCard
                  icon={Calendar}
                  label="Moyenne streak"
                  value={`${avgStreak}j`}
                />
                <StatsCard
                  icon={Target}
                  label="Total habitudes"
                  value={totalHabits}
                />
              </div>
            </section>

            {/* Habits Performance */}
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                Performance par habitude
              </h2>
              {habitPerformances.length > 0 ? (
                <div className="space-y-3">
                  {habitPerformances.map((habit) => (
                    <div
                      key={habit.id}
                      className="glass rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
                            <HabitIcon type={habit.icon as any} className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div>
                            <span className="font-bold text-base text-foreground block">
                              {habit.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {habit.streak} jours de suite
                            </span>
                          </div>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                          {habit.performance}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-primary transition-all duration-500"
                          style={{ width: `${habit.performance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-xl p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Commence à compléter tes habitudes pour voir tes statistiques
                  </p>
                </div>
              )}
            </section>

            {/* Insights */}
            <section className="glass rounded-xl p-5 shadow-elevation border border-primary/20">
              <h3 className="font-bold text-base text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Insights
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                {successRate === 100 && (
                  <p className="text-success font-semibold">
                    🎉 Parfait ! Tu as complété toutes tes habitudes aujourd&apos;hui !
                  </p>
                )}
                {successRate >= 75 && successRate < 100 && (
                  <p className="text-primary font-semibold">
                    💪 Excellent travail ! Tu es sur la bonne voie.
                  </p>
                )}
                {successRate > 0 && successRate < 75 && (
                  <p>
                    Continue tes efforts ! Chaque jour compte dans ta progression.
                  </p>
                )}
                {longestStreak > 0 && (
                  <p>
                    Ton meilleur streak est de <span className="text-foreground font-semibold">{longestStreak} jours</span> - c&apos;est impressionnant !
                  </p>
                )}
                {totalHabits > 0 && successRate === 0 && (
                  <p>
                    N&apos;oublie pas de valider tes habitudes aujourd&apos;hui pour maintenir ta constance.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default Analytics;
