import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const AMBIENT_SOUNDS = [
  { id: "rain", name: "Pluie", emoji: "🌧️", url: "https://cdn.pixabay.com/audio/2022/03/10/audio_2c0c1e7c3c.mp3" },
  { id: "cafe", name: "Café", emoji: "☕", url: "https://cdn.pixabay.com/audio/2022/03/10/audio_50a4cde8bb.mp3" },
  { id: "forest", name: "Forêt", emoji: "🌲", url: "https://cdn.pixabay.com/audio/2022/05/27/audio_be11ce5395.mp3" },
  { id: "ocean", name: "Océan", emoji: "🌊", url: "https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3" },
];

const Focus = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(25 * 60); // 25 minutes
  const [duration, setDuration] = useState(25);
  const [selectedSound, setSelectedSound] = useState<string | null>(null);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedTime = localStorage.getItem("total_focus_time");
    if (savedTime) setTotalFocusTime(parseInt(savedTime));
  }, []);

  useEffect(() => {
    if (isPlaying && currentTime > 0) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentTime]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      audioRef.current.loop = true;
    }
  }, [volume, isMuted]);

  const handleComplete = () => {
    setIsPlaying(false);
    const newTotal = totalFocusTime + (duration * 60);
    setTotalFocusTime(newTotal);
    localStorage.setItem("total_focus_time", newTotal.toString());
    toast.success("🎉 Session terminée ! Bravo !", {
      description: `${duration} minutes de focus intense`
    });
  };

  const handleSoundSelect = (soundId: string) => {
    if (selectedSound === soundId) {
      setSelectedSound(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    } else {
      setSelectedSound(soundId);
      const sound = AMBIENT_SOUNDS.find(s => s.id === soundId);
      if (sound) {
        if (audioRef.current) audioRef.current.pause();
        audioRef.current = new Audio(sound.url);
        audioRef.current.volume = isMuted ? 0 : volume / 100;
        audioRef.current.loop = true;
        audioRef.current.play().catch(e => {
          console.error("Erreur lecture audio:", e);
          toast.error("Impossible de lire le son");
        });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTotalTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(duration * 60);
  };

  const presets = [15, 25, 45, 60];

  return (
    <div className="min-h-screen bg-background mb-safe-nav">
      <header className="px-6 pt-8 pb-6 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Mode <span className="bg-gradient-primary bg-clip-text text-transparent">Focus</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Concentration maximale avec sons ambients
        </p>
      </header>

      <main className="px-6 space-y-6 max-w-2xl mx-auto pb-8">
        {/* Stats */}
        <Card className="glass border-primary/20 p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Temps de focus total</p>
          <p className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {formatTotalTime(totalFocusTime)}
          </p>
        </Card>

        {/* Timer */}
        <div className="glass rounded-2xl p-8 text-center border border-white/10">
          <div className="text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-6">
            {formatTime(currentTime)}
          </div>
          
          <div className="flex gap-3 justify-center mb-6">
            <Button
              size="lg"
              onClick={() => setIsPlaying(!isPlaying)}
              className="rounded-xl"
              disabled={currentTime === 0}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleReset}
              className="rounded-xl"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>

          {/* Presets */}
          {!isPlaying && (
            <div className="flex gap-2 justify-center flex-wrap">
              {presets.map(time => (
                <Button
                  key={time}
                  variant={duration === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setDuration(time);
                    setCurrentTime(time * 60);
                  }}
                  className="rounded-lg"
                >
                  {time}min
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Ambient Sounds */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground">Sons ambients</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {AMBIENT_SOUNDS.map(sound => (
              <button
                key={sound.id}
                onClick={() => handleSoundSelect(sound.id)}
                className={`glass rounded-xl p-4 text-center transition-all border ${
                  selectedSound === sound.id
                    ? "border-primary/50 bg-primary/10"
                    : "border-white/5 hover:bg-white/5"
                }`}
              >
                <div className="text-3xl mb-2">{sound.emoji}</div>
                <p className="text-sm font-semibold">{sound.name}</p>
              </button>
            ))}
          </div>

          {/* Volume Control */}
          {selectedSound && (
            <Card className="glass border-white/10 p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMuted(!isMuted)}
                  className="shrink-0"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Slider
                  value={[volume]}
                  onValueChange={([v]) => setVolume(v)}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8">{volume}%</span>
              </div>
            </Card>
          )}
        </div>

        {/* Tips */}
        <Card className="glass border-primary/20 p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            💡 <strong>Astuce:</strong> Les sons ambients aident à la concentration en masquant les distractions. 
            Choisis ton ambiance préférée et reste focus !
          </p>
        </Card>
      </main>

      <Navigation />
    </div>
  );
};

export default Focus;