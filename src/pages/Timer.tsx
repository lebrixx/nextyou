import { useState, useEffect, useRef } from "react";
import { Plus, RotateCcw, Trash2, Timer as TimerIcon, Smartphone, ChevronDown, Crown, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import AddTimerDialog from "@/components/AddTimerDialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TimerData {
  id: string;
  name: string;
  startDate: Date;
}

const Timer = () => {
  const navigate = useNavigate();
  const [timers, setTimers] = useState<TimerData[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [timerToDelete, setTimerToDelete] = useState<string | null>(null);
  const [timerToReset, setTimerToReset] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [widgetSectionOpen, setWidgetSectionOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [timersLoaded, setTimersLoaded] = useState(false);
  
  const widgetSectionRef = useRef<HTMLDivElement>(null);

  const handleWidgetToggle = () => {
    const willOpen = !widgetSectionOpen;
    setWidgetSectionOpen(willOpen);
    if (willOpen) {
      setTimeout(() => {
        widgetSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Additional slight scroll for better visibility
        setTimeout(() => {
          window.scrollBy({ top: 60, behavior: 'smooth' });
        }, 300);
      }, 100);
    }
  };

  useEffect(() => {
    const loadUserAndTimers = async (currentUser: any) => {
      if (currentUser) {
        // Load timers from Supabase
        const { data: timersData } = await supabase
          .from('timers')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: true });
        
        if (timersData && timersData.length > 0) {
          const loadedTimers: TimerData[] = timersData.map(t => ({
            id: t.id,
            name: t.name,
            startDate: new Date(t.created_at)
          }));
          setTimers(loadedTimers);
        } else {
          // Check localStorage as fallback and migrate
          const saved = localStorage.getItem("habitflow_timers");
          if (saved) {
            try {
              const localTimers = JSON.parse(saved);
              for (const timer of localTimers) {
                await supabase.from('timers').insert({
                  user_id: currentUser.id,
                  name: timer.name,
                  duration: 0,
                  created_at: timer.startDate
                });
              }
              // Clear localStorage after migration
              localStorage.removeItem("habitflow_timers");
              // Reload from Supabase
              const { data: migratedTimers } = await supabase
                .from('timers')
                .select('*')
                .eq('user_id', currentUser.id);
              
              if (migratedTimers) {
                const loaded: TimerData[] = migratedTimers.map(t => ({
                  id: t.id,
                  name: t.name,
                  startDate: new Date(t.created_at)
                }));
                setTimers(loaded);
              }
            } catch (e) {
              console.error('Error migrating timers:', e);
            }
          } else {
            setTimers([]);
          }
        }
      } else {
        // Not logged in, clear timers
        setTimers([]);
      }
      
      setTimersLoaded(true);
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(() => loadUserAndTimers(session.user), 0);
        } else {
          // User logged out, clear timers
          setTimers([]);
          setTimersLoaded(true);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadUserAndTimers(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // No localStorage caching for timers - they are only stored in Supabase

  const formatDuration = (startDate: Date) => {
    const startTime = typeof startDate === 'string' ? new Date(startDate).getTime() : startDate.getTime();
    const diff = currentTime - startTime;
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { months, days, hours, minutes, seconds };
  };

  const addTimer = async (name: string) => {
    const now = new Date();
    
    if (user) {
      const { data, error } = await supabase
        .from('timers')
        .insert({
          user_id: user.id,
          name,
          duration: 0,
          created_at: now.toISOString()
        })
        .select()
        .single();
      
      if (data && !error) {
        const newTimer: TimerData = {
          id: data.id,
          name: data.name,
          startDate: new Date(data.created_at),
        };
        setTimers((prev) => [...prev, newTimer]);
      }
    } else {
      const newTimer: TimerData = {
        id: Date.now().toString(),
        name,
        startDate: now,
      };
      setTimers((prev) => [...prev, newTimer]);
    }
    
    toast({
      title: "Compteur créé",
      description: `Le compteur "${name}" a commencé.`,
    });
  };

  const resetTimer = async (id: string) => {
    const now = new Date();
    
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id ? { ...timer, startDate: now } : timer
      )
    );
    
    if (user) {
      await supabase
        .from('timers')
        .update({ created_at: now.toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
    }
    
    toast({
      title: "Compteur réinitialisé",
      description: "Nouveau départ, nouvelle opportunité de réussir.",
    });
    setResetDialogOpen(false);
    setTimerToReset(null);
  };

  const confirmReset = (id: string) => {
    setTimerToReset(id);
    setResetDialogOpen(true);
  };

  const deleteTimer = async (id: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id));
    
    if (user) {
      await supabase.from('timers').delete().eq('id', id).eq('user_id', user.id);
    }
    
    toast({
      title: "Compteur supprimé",
      description: "Le compteur a été supprimé avec succès.",
    });
    setDeleteDialogOpen(false);
    setTimerToDelete(null);
  };

  const confirmDelete = (id: string) => {
    setTimerToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6 text-center relative">
        <Button
          onClick={() => navigate("/premium")}
          variant="ghost"
          size="sm"
          className="absolute top-8 right-6 w-10 h-10 p-0 rounded-full bg-gradient-primary shadow-glow hover:opacity-90"
        >
          <Crown className="w-5 h-5 text-primary-foreground" />
        </Button>
        
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
          <TimerIcon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Mes <span className="bg-gradient-primary bg-clip-text text-transparent">Compteurs</span>
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2 max-w-md mx-auto">
          Mesure tes progrès, célèbre chaque seconde de transformation
        </p>
        <p className="text-xs text-muted-foreground/70 mb-4 max-w-sm mx-auto">
          💪 Idéal aussi pour suivre ta libération d'une addiction
        </p>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow font-semibold h-11 px-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau compteur
        </Button>
      </header>

      <main className="px-6 pt-4 space-y-4 max-w-2xl mx-auto">
        {/* Tabs Navigation */}
        <div className="grid w-full grid-cols-2 glass rounded-lg p-1 mb-6">
          <div className="flex items-center justify-center py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium text-sm">
            Compteurs
          </div>
          <button
            onClick={() => navigate("/pomodoro")}
            className="flex items-center justify-center py-2 px-4 rounded-md text-muted-foreground hover:text-foreground font-medium text-sm transition-colors"
          >
            Pomodoro
          </button>
        </div>

        {/* Counters Content */}
        <div className="space-y-4">
        {timers.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center space-y-4 border border-primary/20">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center">
              <TimerIcon className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Commence ton parcours</h3>
              <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
                Crée ton premier compteur pour mesurer ta transformation. Chaque seconde compte dans ton évolution personnelle.
              </p>
            </div>
            <div className="pt-2">
              <Button
                onClick={() => setDialogOpen(true)}
                variant="outline"
                className="border-primary/40 hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer un compteur
              </Button>
            </div>
          </div>
        ) : (
          timers.map((timer) => {
          const { months, days, hours, minutes, seconds } = formatDuration(timer.startDate);

            return (
              <div
                key={timer.id}
                className="glass rounded-xl p-6 border border-primary/20 hover:border-primary/30 transition-all duration-300 shadow-elevation"
              >
              <div className="flex items-center justify-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center shrink-0">
                  <TimerIcon className="w-4 h-4 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  {timer.name}
                </h3>
              </div>

              {/* Timer Display */}
              <div className="grid grid-cols-5 gap-2 mb-5">
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-lg p-3 w-full shadow-elevation">
                    <p className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center tabular-nums">
                      {months.toString().padStart(2, '0')}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
                    Mois
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-lg p-3 w-full shadow-elevation">
                    <p className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center tabular-nums">
                      {days.toString().padStart(2, '0')}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
                    Jours
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-lg p-3 w-full shadow-elevation">
                    <p className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center tabular-nums">
                      {hours.toString().padStart(2, '0')}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
                    Heures
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-lg p-3 w-full shadow-elevation">
                    <p className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center tabular-nums">
                      {minutes.toString().padStart(2, '0')}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
                    Min
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-lg p-3 w-full shadow-elevation">
                    <p className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center tabular-nums">
                      {seconds.toString().padStart(2, '0')}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
                    Sec
                  </p>
                </div>
              </div>

              {/* Widget Info */}
              <div className="text-center mb-4 bg-primary/5 rounded-lg p-3 border border-primary/20">
                <p className="text-xs text-muted-foreground">
                  <span className="text-primary font-semibold">💡 Astuce :</span> Ajoute ce compteur en widget sur ton écran d&apos;accueil
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => confirmReset(timer.id)}
                  variant="outline"
                  className="flex-1 glass border-white/20 text-foreground hover:bg-white/5 h-10 text-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Réinitialiser
                </Button>
                <Button
                  onClick={() => confirmDelete(timer.id)}
                  variant="outline"
                  className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 h-10 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Supprimer
                </Button>
              </div>
              </div>
            );
          })
        )}

        {/* Widget Instructions Section */}
        <section className="space-y-3 mt-8" ref={widgetSectionRef}>
          <button
            onClick={handleWidgetToggle}
            className="w-full group"
          >
            <div className="glass rounded-xl p-4 border border-primary/30 hover:border-primary/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Smartphone className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      Widget Écran d&apos;Accueil
                    </h2>
                    <p className="text-xs text-muted-foreground">Affiche tes compteurs en permanence</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 ${widgetSectionOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {widgetSectionOpen && (
            <div className="glass rounded-xl p-5 space-y-4 border border-primary/20 animate-accordion-down">
              <div className="bg-gradient-primary/10 rounded-lg p-4 border border-primary/30">
                <p className="text-sm font-semibold text-primary mb-2">⏱️ Tes compteurs toujours visibles</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Place tes compteurs en widget pour voir ta progression en temps réel sans ouvrir l&apos;app. 
                  Parfait pour rester motivé et suivre tes engagements à tout moment !
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg p-4 bg-background/50 border border-white/10">
                  <p className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                    <span>📱</span> iPhone / iPad
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                    <li>Maintiens ton doigt sur l&apos;écran d&apos;accueil</li>
                    <li>Appuie sur le <span className="text-primary font-semibold">+</span> en haut à gauche</li>
                    <li>Cherche <span className="text-primary font-semibold">&quot;Next Me&quot;</span></li>
                    <li>Sélectionne le widget Compteur</li>
                    <li>Choisis quel compteur afficher et place-le</li>
                  </ol>
                </div>

                <div className="rounded-lg p-4 bg-background/50 border border-white/10">
                  <p className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                    <span>🤖</span> Android
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                    <li>Maintiens ton doigt sur l&apos;écran d&apos;accueil</li>
                    <li>Appuie sur <span className="text-primary font-semibold">&quot;Widgets&quot;</span></li>
                    <li>Trouve <span className="text-primary font-semibold">&quot;Next Me&quot;</span></li>
                    <li>Choisis le widget Compteur</li>
                    <li>Sélectionne quel compteur tu veux afficher</li>
                  </ol>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-primary font-medium">
                  ⚡ Mise à jour en temps réel de tes compteurs
                </p>
              </div>
            </div>
          )}
        </section>
        </div>
      </main>

      <Navigation />
      <AddTimerDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addTimer} />
      
      {/* Reset Confirmation Dialog */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent className="glass border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Réinitialiser ce compteur ?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground leading-relaxed">
              Je sais que c&apos;est difficile, mais c&apos;est la chose honnête à faire. 
              Se mentir à soi-même ne mène nulle part. Chaque nouveau départ est une opportunité 
              de devenir plus fort. Tu as le courage de recommencer, et c&apos;est déjà une victoire.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass border-white/10">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => timerToReset && resetTimer(timerToReset)}
              className="bg-gradient-primary text-primary-foreground shadow-glow"
            >
              Réinitialiser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="glass border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Supprimer ce compteur ?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Es-tu sûr de vouloir supprimer ce compteur ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass border-white/10">Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => timerToDelete && deleteTimer(timerToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Timer;
