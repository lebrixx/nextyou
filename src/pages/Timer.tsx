import { useState, useEffect } from "react";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
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
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Chrono<span className="bg-gradient-primary bg-clip-text text-transparent">mètres</span>
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          Chaque seconde compte. Chaque chronomètre représente un <span className="text-primary font-semibold">engagement envers toi-même</span>. Marque le début de ta transformation, célèbre ta liberté retrouvée, ou mesure le chemin parcouru vers la meilleure version de toi. Ce n'est pas qu'un compteur — c'est le témoignage vivant de ta <span className="text-primary font-semibold">détermination</span>.
        </p>
        <Button
          onClick={() => setDialogOpen(true)}
          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow font-semibold h-9 text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Créer un nouveau compteur
        </Button>
      </header>

      <main className="px-6 pt-4 space-y-4 max-w-2xl mx-auto">
        {timers.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center mb-2">
              <Plus className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Aucun compteur</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Lance ton premier chronomètre aujourd'hui. Que ce soit pour célébrer le début d'une nouvelle habitude, marquer ta victoire sur une addiction, ou simplement mesurer ton évolution — <span className="text-primary font-semibold">chaque moment compte</span>.
            </p>
          </div>
        ) : (
          timers.map((timer) => {
          const { months, days, hours, minutes, seconds } = formatDuration(timer.startDate);

            return (
              <div
                key={timer.id}
                className="glass rounded-xl p-5 hover:shadow-elevation transition-all duration-300"
              >
              <h3 className="text-base font-semibold text-foreground mb-4 text-center">
                {timer.name}
              </h3>

              {/* Timer Display */}
              <div className="grid grid-cols-5 gap-2 mb-4">
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
              <div className="text-center mb-4 glass-strong rounded-lg p-3">
                <p className="text-[10px] text-muted-foreground">
                  💡 Ajoute ce compteur en widget sur ton écran d&apos;accueil pour le voir en permanence
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => confirmReset(timer.id)}
                  variant="outline"
                  className="flex-1 border-muted text-muted-foreground hover:bg-muted/10 h-9 text-sm"
                >
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Réinitialiser
                </Button>
                <Button
                  onClick={() => confirmDelete(timer.id)}
                  variant="outline"
                  className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10 h-9 text-sm"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" />
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
