import { useState, useEffect } from "react";
import { TrendingUp, Target, Flame, Clock, Award, Calendar } from "lucide-react";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
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
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem("habitflow_habits");
    return saved ? JSON.parse(saved) : [
      { id: "1", name: "Boire deux litres d'eau", icon: "hydratation", streak: 0, completed: false }
    ];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("habitflow_habits");
      if (saved) {
        setHabits(JSON.parse(saved));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Check for changes when returning to the page
    const interval = setInterval(() => {
      const saved = localStorage.getItem("habitflow_habits");
      if (saved) {
        const parsedHabits = JSON.parse(saved);
        if (JSON.stringify(parsedHabits) !== JSON.stringify(habits)) {
          setHabits(parsedHabits);
        }
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [habits]);

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
  const longestStreak = habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0;
  const totalStreakDays = habits.reduce((sum, h) => sum + h.streak, 0);
  
  // Calculate days active this week (mock for now, will be real once we track history)
  const daysActiveThisWeek = completedToday > 0 ? Math.min(7, totalStreakDays) : 0;

  const toggleHabit = (id: string) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    );
    setHabits(updatedHabits);
    localStorage.setItem("habitflow_habits", JSON.stringify(updatedHabits));
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
        {/* Performance Quotidienne */}
        <section className="glass rounded-xl p-5 shadow-elevation border border-white/5 text-center">
          <p className="text-muted-foreground font-semibold text-[9px] tracking-wide uppercase mb-2">
            Performance Aujourd&apos;hui
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {completedToday}
            </span>
            <span className="text-2xl font-semibold text-muted-foreground">/</span>
            <span className="text-2xl font-semibold text-foreground">{totalHabits}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">habitudes complétées</p>
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

        {/* Inspirational Message */}
        <section className="glass rounded-xl p-6 shadow-elevation border border-primary/20">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary shadow-glow mb-4">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-3">Ta transformation commence aujourd&apos;hui</h3>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Chaque grande réussite commence par une simple décision : celle de devenir meilleur, 
              jour après jour. HabitFlow n&apos;est pas qu&apos;une application, c&apos;est ton partenaire 
              dans cette quête vers l&apos;excellence personnelle.
            </p>
            <p>
              Imagine-toi dans six mois : plus discipliné, plus confiant, fier de la personne que 
              tu vois dans le miroir. Cette version de toi existe déjà, elle attend juste que tu 
              fasses le premier pas. Chaque habitude que tu cultives est une pierre que tu poses 
              pour construire la vie dont tu rêves.
            </p>
            <p className="font-semibold text-foreground">
              Le secret ? La constance. Pas la perfection, mais la présence. Chaque jour compte, 
              chaque petit effort s&apos;additionne. Et avant même que tu ne t&apos;en rendes compte, 
              tu seras devenu cette personne extraordinaire que tu as toujours voulu être.
            </p>
            <p className="text-xs italic text-primary">
              Commence maintenant. Ton futur toi te remerciera.
            </p>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Index;
