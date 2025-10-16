import { useState } from "react";
import { Plus, TrendingUp, Target, Flame } from "lucide-react";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import ProgressRing from "@/components/ProgressRing";
import HabitCard from "@/components/HabitCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [habits, setHabits] = useState([
    { id: "1", name: "Sport matinal", icon: "sport" as const, streak: 7, completed: true },
    { id: "2", name: "Lecture", icon: "lecture" as const, streak: 12, completed: true },
    { id: "3", name: "Méditation", icon: "meditation" as const, streak: 5, completed: false },
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
      <main className="px-6 space-y-8 max-w-2xl mx-auto">
        {/* Progress Ring */}
        <section className="flex flex-col items-center py-8 glass rounded-[24px] shadow-elevation border border-white/5">
          <ProgressRing progress={progressPercentage} size={160} strokeWidth={12} />
          <div className="mt-6 text-center space-y-1">
            <p className="text-muted-foreground font-semibold text-[10px] tracking-wide uppercase">Performance Hebdomadaire</p>
            <p className="text-foreground text-base font-bold">+3% de constance</p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-5">
          <StatsCard
            icon={Target}
            label="Habitudes actives"
            value={totalHabits}
          />
          <StatsCard
            icon={Flame}
            label="Moyenne streak"
            value={Math.round(averageStreak)}
            trend="+12%"
            trendUp
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
            trend="+5%"
            trendUp
          />
        </section>

        {/* Today's Habits */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-foreground tracking-tight mb-1">Aujourd'hui</h2>
              <p className="text-muted-foreground text-sm">Tes habitudes du jour</p>
            </div>
            <Button
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow font-bold h-11 px-5"
            >
              <Plus className="w-5 h-5 mr-2" />
              Ajouter
            </Button>
          </div>
          <div className="space-y-4">
            {habits.map((habit) => (
              <HabitCard key={habit.id} {...habit} onToggle={toggleHabit} />
            ))}
          </div>
        </section>

        {/* Motivational Quote */}
        <section className="glass rounded-[32px] p-10 text-center shadow-elevation border border-primary/20 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-6">
            <Target className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-tight leading-relaxed">
            Un jour de plus, une victoire de plus.
          </p>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Index;
