import { useState } from "react";
import { TrendingUp, Target, Flame } from "lucide-react";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import ProgressRing from "@/components/ProgressRing";
import HabitCard from "@/components/HabitCard";
import { HabitIconType } from "@/components/HabitIcon";

interface Habit {
  id: string;
  name: string;
  icon: HabitIconType;
  streak: number;
  completed: boolean;
}

const Index = () => {
  const [habits, setHabits] = useState<Habit[]>([
    { id: "1", name: "Boire deux litres d'eau", icon: "hydratation", streak: 0, completed: false },
  ]);

  const totalHabits = habits.length;
  const completedToday = habits.filter((h) => h.completed).length;
  const progressPercentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;
  const averageStreak = habits.reduce((sum, h) => sum + h.streak, 0) / totalHabits;

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-6 pt-8 pb-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-5xl font-bold text-foreground mb-3 tracking-tight leading-tight">
            Habit<span className="bg-gradient-primary bg-clip-text text-transparent">Flow</span>
          </h1>
          <p className="text-muted-foreground text-base font-medium">Ta constance forge ton succès.</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-6 max-w-2xl mx-auto">
        {/* Progress Ring */}
        <section className="flex flex-col items-center py-6 glass rounded-xl shadow-elevation border border-white/5">
          <ProgressRing progress={progressPercentage} size={140} strokeWidth={10} />
          <div className="mt-4 text-center space-y-0.5">
            <p className="text-muted-foreground font-semibold text-[10px] tracking-wide uppercase">Performance Aujourd'hui</p>
            <p className="text-foreground text-sm font-bold">
              {completedToday}/{totalHabits} complétées
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-3">
          <StatsCard
            icon={Target}
            label="Habitudes actives"
            value={totalHabits}
          />
          <StatsCard
            icon={Flame}
            label="Moyenne streak"
            value={Math.round(averageStreak)}
          />
          <StatsCard
            icon={TrendingUp}
            label="Complétées aujourd'hui"
            value={completedToday}
          />
          <StatsCard
            icon={Target}
            label="Taux de succès"
            value={`${Math.round(progressPercentage)}%`}
          />
        </section>

        {/* Today's Habits */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight mb-0.5">Aujourd'hui</h2>
              <p className="text-muted-foreground text-xs">Tes habitudes du jour</p>
            </div>
          </div>
          <div className="space-y-3">
            {habits.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-muted-foreground text-sm mb-3">
                  Tu n'as pas encore d'habitudes
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Clique sur "Ajouter" pour créer ta première habitude
                </p>
              </div>
            ) : (
              habits.map((habit) => (
                <HabitCard key={habit.id} {...habit} onToggle={toggleHabit} />
              ))
            )}
          </div>
        </section>

        {/* Welcome Message */}
        {habits.length <= 1 && (
          <section className="glass rounded-xl p-6 text-center shadow-elevation border border-primary/20 mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary shadow-glow mb-4">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-2">Bienvenue sur HabitFlow</h3>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              Commence par ajouter tes premières habitudes. Chaque action répétée devient une seconde nature.
            </p>
          </section>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default Index;
