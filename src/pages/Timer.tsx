import { useState, useEffect } from "react";
import { Plus, RotateCcw } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

interface TimerData {
  id: string;
  name: string;
  startDate: Date;
}

const Timer = () => {
  const [timers, setTimers] = useState<TimerData[]>([]);

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (startDate: Date) => {
    const diff = currentTime - startDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Chrono<span className="bg-gradient-primary bg-clip-text text-transparent">mètres</span>
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          Mesure le temps écoulé depuis le début d'une nouvelle version de toi-même, ou le temps passé sans une addiction.
        </p>
        <Button
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
              Crée ton premier compteur pour suivre le temps passé depuis un changement important dans ta vie.
            </p>
          </div>
        ) : (
          timers.map((timer) => {
          const { days, hours, minutes, seconds } = formatDuration(timer.startDate);

            return (
              <div
                key={timer.id}
                className="glass rounded-xl p-5 hover:shadow-elevation transition-all duration-300"
              >
              <h3 className="text-base font-semibold text-foreground mb-4 text-center">
                {timer.name}
              </h3>

              {/* Timer Display */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-lg p-3 w-full shadow-elevation">
                    <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center">
                      {days}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
                    Jours
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-lg p-3 w-full shadow-elevation">
                    <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center">
                      {hours}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
                    Heures
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-lg p-3 w-full shadow-elevation">
                    <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center">
                      {minutes}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
                    Min
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-lg p-3 w-full shadow-elevation">
                    <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center">
                      {seconds}
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 font-semibold uppercase tracking-wider">
                    Sec
                  </p>
                </div>
              </div>

              {/* Total Time */}
              <div className="text-center mb-4">
                <p className="text-muted-foreground text-xs mb-0.5">Temps total</p>
                <p className="text-lg font-bold text-primary">
                  {days} jours, {hours}h {minutes}m
                </p>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10 h-9 text-sm"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Réinitialiser
              </Button>
              </div>
            );
          })
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default Timer;
