import { useState, useEffect } from "react";
import { Plus, RotateCcw, Trash2, Timer as TimerIcon } from "lucide-react";
import Navigation from "@/components/Navigation";
import AddTimerDialog from "@/components/AddTimerDialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
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
  const [timers, setTimers] = useState<TimerData[]>(() => {
    const saved = localStorage.getItem("habitflow_timers");
    return saved ? JSON.parse(saved) : [];
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [timerToDelete, setTimerToDelete] = useState<string | null>(null);
  const [timerToReset, setTimerToReset] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("habitflow_timers", JSON.stringify(timers));
  }, [timers]);

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

  const addTimer = (name: string) => {
    const newTimer: TimerData = {
      id: Date.now().toString(),
      name,
      startDate: new Date(),
    };
    setTimers((prev) => [...prev, newTimer]);
    toast({
      title: "Compteur créé",
      description: `Le compteur "${name}" a commencé.`,
    });
  };

  const resetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((timer) =>
        timer.id === id ? { ...timer, startDate: new Date() } : timer
      )
    );
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

  const deleteTimer = (id: string) => {
    setTimers((prev) => prev.filter((timer) => timer.id !== id));
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
      <header className="px-6 pt-8 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
          <TimerIcon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Mes <span className="bg-gradient-primary bg-clip-text text-transparent">Compteurs</span>
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 max-w-md mx-auto">
          Mesure tes progrès, célèbre chaque seconde de transformation
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
                  className="flex-1 glass border-white/20 text-foreground hover:bg-white/5 h-10"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
                <Button
                  onClick={() => confirmDelete(timer.id)}
                  variant="outline"
                  className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 h-10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
              </div>
              </div>
            );
          })
        )}
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
