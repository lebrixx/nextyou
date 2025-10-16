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
  const [timers, setTimers] = useState<TimerData[]>([
    {
      id: "1",
      name: "Sans cigarette",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      name: "Vie saine",
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  ]);

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
      <header className="px-6 pt-8 pb-6 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground mb-2">Chronomètres</h1>
        <p className="text-muted-foreground">
          Mesure le temps de tes accomplissements
        </p>
        <Button
          className="w-full mt-4 bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-elevation"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau compteur
        </Button>
      </header>

      <main className="px-6 pt-6 space-y-6 max-w-2xl mx-auto">
        {timers.map((timer) => {
          const { days, hours, minutes, seconds } = formatDuration(timer.startDate);

          return (
            <div
              key={timer.id}
              className="bg-card border border-border rounded-3xl p-8 hover:shadow-elevation transition-all"
            >
              <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                {timer.name}
              </h3>

              {/* Timer Display */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-glow border border-primary/20 rounded-2xl p-4 w-full">
                    <p className="text-4xl font-bold text-primary-glow text-center">
                      {days}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    Jours
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-glow border border-primary/20 rounded-2xl p-4 w-full">
                    <p className="text-4xl font-bold text-primary-glow text-center">
                      {hours}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    Heures
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-glow border border-primary/20 rounded-2xl p-4 w-full">
                    <p className="text-4xl font-bold text-primary-glow text-center">
                      {minutes}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
                    Min
                  </p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-glow border border-primary/20 rounded-2xl p-4 w-full">
                    <p className="text-4xl font-bold text-primary-glow text-center">
                      {seconds}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-medium">
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
        })}
      </main>

      <Navigation />
    </div>
  );
};

export default Timer;
