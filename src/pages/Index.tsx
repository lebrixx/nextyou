import { useState, useEffect } from "react";
import { TrendingUp, Target, Flame, Clock, Award, Calendar, ChevronRight, HelpCircle, ChevronDown, Sparkles } from "lucide-react";
import { LocalNotifications } from '@capacitor/local-notifications';
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import HabitCard from "@/components/HabitCard";
import { HabitIconType } from "@/components/HabitIcon";
import AppTour from "@/components/AppTour";
import AgendaWidget from "@/components/AgendaWidget";
import { Button } from "@/components/ui/button";
import { quotes } from "@/data/quotes";
import { useHabitReset } from "@/hooks/useHabitReset";
import { useTranslation } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";

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

interface Action {
  id: string;
  text: string;
}

interface Goal {
  id: string;
  title: string;
  actions: Action[];
}

const Index = () => {
  const { t } = useTranslation();
  useHabitReset(); // Reset habits at midnight
  
  // Request notification permissions on startup
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      try {
        // Check current permission status
        const permStatus = await LocalNotifications.checkPermissions();
        
        if (permStatus.display === 'granted') {
          console.log('Notifications already granted');
          return;
        }
        
        // Request permissions
        const result = await LocalNotifications.requestPermissions();
        console.log('Notification permissions result:', result);
        
        if (result.display === 'denied') {
          toast({
            title: "Notifications désactivées",
            description: "Va dans les paramètres pour activer les notifications",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        toast({
          title: "Impossible d'activer les notifications",
          description: "Vérifie les paramètres de l'application",
          variant: "destructive",
        });
      }
    };
    
    requestNotificationPermissions();
  }, []);
  
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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tourOpen, setTourOpen] = useState(false);
  const [philosophyOpen, setPhilosophyOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(() => {
    const allQuotes = Object.values(quotes).flat();
    return allQuotes[Math.floor(Math.random() * allQuotes.length)];
  });

  useEffect(() => {
    const saved = localStorage.getItem("habitflow_timers");
    if (saved) {
      setTimers(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const loadGoals = () => {
      const saved = localStorage.getItem("habitflow_goals");
      if (saved) {
        setGoals(JSON.parse(saved));
      }
    };
    
    loadGoals();
    
    // Listen for changes in goals
    const interval = setInterval(loadGoals, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Change quote every hour
  useEffect(() => {
    const changeQuote = () => {
      const allQuotes = Object.values(quotes).flat();
      setCurrentQuote(allQuotes[Math.floor(Math.random() * allQuotes.length)]);
    };

    const interval = setInterval(changeQuote, 60 * 60 * 1000); // Every hour
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
      <header className="px-6 pt-safe-offset-8 pb-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4 tracking-tight leading-tight">
            Next<span className="bg-gradient-primary bg-clip-text text-transparent"> You 2.0</span>
          </h1>
          <div className="glass rounded-xl p-4 mb-3 border border-primary/20">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-2 text-center">
              {t('todayQuote')}
            </p>
            <p className="text-sm font-bold bg-gradient-primary bg-clip-text text-transparent text-center leading-relaxed">
              "{currentQuote.text}"
            </p>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              — {currentQuote.author}
            </p>
          </div>
          <Button
            onClick={() => setTourOpen(true)}
            variant="outline"
            className="glass border-primary/30 text-foreground hover:bg-primary/10"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            {t('appPresentation')}
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 space-y-6 max-w-2xl mx-auto">
        {/* Agenda Widget */}
        <AgendaWidget />

        {/* Performance Quotidienne */}
        <section className="glass rounded-xl p-5 shadow-elevation border border-white/5 text-center">
          <p className="text-muted-foreground font-semibold text-[9px] tracking-wide uppercase mb-2">
            {t('performanceToday')}
          </p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {completedToday}
            </span>
            <span className="text-2xl font-semibold text-muted-foreground">/</span>
            <span className="text-2xl font-semibold text-foreground">{totalHabits}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t('completedHabits')}</p>
        </section>

        {/* Timers Section */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t('myTimers')}
          </h2>
          {timers.length > 0 ? (
            <div className="glass rounded-xl p-4 shadow-elevation border border-white/5">
              <div className="grid grid-cols-2 gap-3">
                {timers.map((timer) => (
                  <div key={timer.id} className="rounded-lg p-3 bg-background/50 border border-white/5">
                    <p className="text-xs text-muted-foreground mb-1 truncate">{timer.name}</p>
                    <p className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                      {formatTimerCompact(timer.startDate)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
              <p className="text-[10px] text-muted-foreground text-center">
                💡 {t('addTimerWidget')}
              </p>
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-6 text-center border border-white/5">
              <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">{t('noTimersConfigured')}</p>
              <p className="text-xs text-muted-foreground/70">
                {t('goToTimerTab')}
              </p>
            </div>
          )}
        </section>

        {/* Goals Section */}
        {goals.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                {t('myGoals')}
              </h2>
            </div>
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="glass rounded-xl p-4 shadow-elevation border border-white/5">
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                      <Target className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-foreground mb-1">{goal.title}</h3>
                      <p className="text-[10px] text-muted-foreground">
                        {goal.actions.length} {t('actionsPlanned')}
                      </p>
                    </div>
                  </div>
                  {goal.actions.length > 0 && (
                    <div className="space-y-1.5 ml-11 mt-2">
                      {goal.actions.slice(0, 2).map((action) => (
                        <div key={action.id} className="flex items-center gap-2">
                          <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                          <p className="text-xs text-muted-foreground truncate">{action.text}</p>
                        </div>
                      ))}
                      {goal.actions.length > 2 && (
                        <p className="text-[10px] text-primary ml-5">+{goal.actions.length - 2} {t('moreActions')}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}


        {/* Today's Habits */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight mb-0.5">{t('today')}</h2>
              <p className="text-muted-foreground text-xs">{t('todayHabits')}</p>
            </div>
          </div>
          <div className="space-y-3">
            {habits.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center">
                <p className="text-muted-foreground text-sm mb-3">
                  {t('noHabitsYet')}
                </p>
                <p className="text-xs text-muted-foreground/70">
                  {t('clickToAddHabit')}
                </p>
              </div>
            ) : (
              habits.map((habit) => (
                <HabitCard key={habit.id} {...habit} onToggle={toggleHabit} />
              ))
            )}
          </div>
        </section>


        {/* Inspirational Message */}
        <section className="space-y-3">
          <button
            onClick={() => setPhilosophyOpen(!philosophyOpen)}
            className="w-full group"
          >
            <div className="glass rounded-xl p-4 shadow-elevation border border-primary/30 hover:border-primary/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {t('appPhilosophy')}
                    </h3>
                    <p className="text-xs text-muted-foreground">{t('discoverVision')}</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 ${philosophyOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>
          
          {philosophyOpen && (
            <div className="glass rounded-xl p-5 space-y-3 text-sm text-muted-foreground leading-relaxed border border-primary/20 animate-accordion-down">
              <p>
                Chaque grande réussite commence par une simple décision : celle de devenir meilleur, 
                jour après jour. Next Me n&apos;est pas qu&apos;une application, c&apos;est ton partenaire 
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
          )}
        </section>
      </main>

      <Navigation />
      <AppTour open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
};

export default Index;
