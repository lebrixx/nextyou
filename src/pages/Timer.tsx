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
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-10 pb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
          Chrono<span className="bg-gradient-primary bg-clip-text text-transparent">mètres</span>
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed mb-6">
          Mesure le temps écoulé depuis le début d'une nouvelle version de toi-même, ou le temps passé sans une addiction.
        </p>
        <Button
          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow font-semibold h-12"
        >
          <Plus className="w-5 h-5 mr-2" />
          Créer un nouveau compteur
        </Button>
      </header>

      <main className="px-6 pt-6 space-y-6 max-w-2xl mx-auto">
        {timers.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center mb-4">
              <Plus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Aucun compteur pour le moment</h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              Crée ton premier compteur pour suivre le temps passé depuis un changement important dans ta vie.
            </p>
          </div>
        ) : (
          timers.map((timer) => {
          const { days, hours, minutes, seconds } = formatDuration(timer.startDate);

            return (
              <div
                key={timer.id}
                className="glass rounded-3xl p-8 hover:shadow-elevation transition-all duration-300"
              >
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                {timer.name}
              </h3>

              {/* Timer Display */}
              <div className="grid grid-cols-4 gap-3 mb-8">
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-2xl p-5 w-full shadow-elevation">
                    <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center drop-shadow-lg">
                      {days}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 font-semibold uppercase tracking-wider">
                    Jours
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-2xl p-5 w-full shadow-elevation">
                    <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center drop-shadow-lg">
                      {hours}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 font-semibold uppercase tracking-wider">
                    Heures
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-2xl p-5 w-full shadow-elevation">
                    <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center drop-shadow-lg">
                      {minutes}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 font-semibold uppercase tracking-wider">
                    Min
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="glass-strong rounded-2xl p-5 w-full shadow-elevation">
                    <p className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent text-center drop-shadow-lg">
                      {seconds}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 font-semibold uppercase tracking-wider">
                    Sec
                  </p>
                </div>
              </div>

              {/* Total Time */}
              <div className="text-center mb-6">
                <p className="text-muted-foreground text-sm mb-1">Temps total</p>
                <p className="text-2xl font-bold text-primary">
                  {days} jours, {hours}h {minutes}m
                </p>
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
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
