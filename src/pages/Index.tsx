import { useState } from "react";
import { Plus, TrendingUp, Target, Flame } from "lucide-react";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import ProgressRing from "@/components/ProgressRing";
import HabitCard from "@/components/HabitCard";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [habits, setHabits] = useState([
    { id: "1", name: "Sport matinal", emoji: "💪", streak: 7, completed: true },
    { id: "2", name: "Lecture", emoji: "📚", streak: 12, completed: true },
    { id: "3", name: "Méditation", emoji: "🧘", streak: 5, completed: false },
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
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="px-6 pt-10 pb-8">
        <h1 className="text-5xl font-bold text-foreground mb-3 tracking-tight">
          Habit<span className="bg-gradient-primary bg-clip-text text-transparent">Flow</span>
        </h1>
        <p className="text-muted-foreground text-lg font-medium">Ta constance te construit. 💜</p>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-8 max-w-2xl mx-auto">
        {/* Progress Ring */}
        <section className="flex flex-col items-center py-12 glass rounded-3xl shadow-elevation">
          <ProgressRing progress={progressPercentage} />
          <p className="text-center text-muted-foreground mt-8 max-w-xs font-medium text-base">
            Tu tiens bon ! +3% de constance cette semaine.
          </p>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4">
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
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Aujourd'hui</h2>
            <Button
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow font-semibold"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle habitude
            </Button>
          </div>
          <div className="space-y-4">
            {habits.map((habit) => (
              <HabitCard key={habit.id} {...habit} onToggle={toggleHabit} />
            ))}
          </div>
        </section>

        {/* Motivational Quote */}
        <section className="glass rounded-3xl p-8 text-center shadow-elevation border border-primary/20">
          <p className="text-xl text-primary-glow font-semibold italic tracking-wide">
            "Un jour de plus, une victoire de plus."
          </p>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Index;
