import { useState, useEffect } from "react";
import { TrendingUp, Target, Flame, Clock } from "lucide-react";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import ProgressRing from "@/components/ProgressRing";
import HabitCard from "@/components/HabitCard";
import { HabitIconType } from "@/components/HabitIcon";

interface TimerData {
  id: string;
  name: string;
  startDate: Date;
}

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

  const [timers, setTimers] = useState<TimerData[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const saved = localStorage.getItem("habitflow_timers");
    if (saved) {
      setTimers(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimerCompact = (startDate: Date | string) => {
    const startTime = typeof startDate === 'string' ? new Date(startDate).getTime() : startDate.getTime();
    const diff = currentTime - startTime;
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const parts = [];
    if (months > 0) parts.push(`${months}mo`);
    if (days > 0) parts.push(`${days}j`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
    
    return parts.slice(0, 3).join(' ');
  };

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
      {/* Header with Daily Quote */}
      <header className="px-6 pt-8 pb-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
            Habit<span className="bg-gradient-primary bg-clip-text text-transparent">Flow</span>
          </h1>
          <div className="glass rounded-xl p-4 mb-3 border border-primary/20">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 text-center">
              Citation du jour
            </p>
            <p className="text-sm font-bold bg-gradient-primary bg-clip-text text-transparent text-center leading-relaxed">
              "Le succès, c&apos;est la somme de petits efforts répétés jour après jour."
            </p>
          </div>
          <p className="text-muted-foreground text-sm font-medium">
            Comment rendre fier tes proches si tu n&apos;es pas d&apos;abord fier de toi
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-6 max-w-2xl mx-auto">
        {/* Progress Ring */}
        <section className="flex flex-col items-center py-4 glass rounded-xl shadow-elevation border border-white/5">
          <ProgressRing progress={progressPercentage} size={100} strokeWidth={8} />
          <div className="mt-2 text-center space-y-0.5">
            <p className="text-muted-foreground font-semibold text-[9px] tracking-wide uppercase">Performance Aujourd&apos;hui</p>
            <p className="text-foreground text-xs font-bold">
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

        {/* Timers Section */}
        {timers.length > 0 ? (
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Mes compteurs
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {timers.map((timer) => (
                <div key={timer.id} className="glass rounded-lg p-3 border border-white/5">
                  <p className="text-xs text-muted-foreground mb-1 truncate">{timer.name}</p>
                  <p className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {formatTimerCompact(timer.startDate)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="glass rounded-xl p-5 text-center border border-white/5">
            <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-foreground font-semibold mb-1">Aucun compteur actif</p>
            <p className="text-xs text-muted-foreground">
              Crée un compteur dans la section Chronomètres pour suivre ton progrès
            </p>
          </section>
        )}

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
