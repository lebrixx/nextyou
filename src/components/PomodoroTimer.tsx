import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee, Settings, TrendingUp, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

interface PomodoroTimerProps {
  userId?: string;
  onOpenFocusMode?: (duration: number) => void;
}

const PomodoroTimer = ({ userId, onOpenFocusMode }: PomodoroTimerProps) => {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [seconds, setSeconds] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, [userId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
    } else if (seconds === 0) {
      handleSessionComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds]);

  const loadStats = async () => {
    if (!userId) return;
    
    const { data } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true);
    
    if (data) {
      setCompletedSessions(data.length);
      
      const today = new Date().toISOString().split('T')[0];
      const todayData = data.filter(s => s.completed_at?.startsWith(today));
      setTodaySessions(todayData.length);
    }
  };

  const playNotificationSound = async () => {
    if (!soundEnabled) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.log('Haptics not available');
    }
  };

  const scheduleNotification = async (title: string, body: string) => {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Math.floor(Math.random() * 1000000),
          schedule: { at: new Date(Date.now() + 1000) },
          sound: soundEnabled ? 'default' : undefined,
        }]
      });
    } catch (error) {
      console.log('Notifications not available');
    }
  };

  const handleSessionComplete = async () => {
    setIsActive(false);
    
    await playNotificationSound();
    
    if (userId && sessionId) {
      await supabase
        .from('pomodoro_sessions')
        .update({ 
          completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', sessionId);
      
      loadStats();
    }

    if (isBreak) {
      await scheduleNotification(
        "☕ Pause terminée !",
        "C'est reparti pour une session de travail."
      );
      toast({
        title: "☕ Pause terminée !",
        description: "C'est reparti pour une session de travail.",
      });
      setIsBreak(false);
      setSeconds(workDuration * 60);
    } else {
      await scheduleNotification(
        "🎉 Session terminée !",
        "Prends une pause bien méritée."
      );
      toast({
        title: "🎉 Session terminée !",
        description: "Prends une pause bien méritée.",
      });
      setCompletedSessions(prev => prev + 1);
      setTodaySessions(prev => prev + 1);
      setIsBreak(true);
      setSeconds(breakDuration * 60);
    }
    setSessionId(null);
  };

  const toggleTimer = async () => {
    if (!isActive && userId && !sessionId) {
      // Start new session
      const { data } = await supabase
        .from('pomodoro_sessions')
        .insert({
          user_id: userId,
          session_type: isBreak ? 'break' : 'work',
          duration_minutes: isBreak ? 5 : 25,
        })
        .select()
        .single();
      
      if (data) setSessionId(data.id);
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setSeconds(workDuration * 60);
    setSessionId(null);
  };

  const startBreak = () => {
    setIsActive(false);
    setIsBreak(true);
    setSeconds(breakDuration * 60);
    setSessionId(null);
  };

  const updateSettings = () => {
    if (!isActive) {
      setSeconds(isBreak ? breakDuration * 60 : workDuration * 60);
    }
    setSettingsOpen(false);
    toast({
      title: "⚙️ Paramètres sauvegardés",
      description: "Tes nouvelles durées sont appliquées.",
    });
  };

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const progress = isBreak 
    ? ((breakDuration * 60 - seconds) / (breakDuration * 60)) * 100
    : ((workDuration * 60 - seconds) / (workDuration * 60)) * 100;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="glass p-4 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Aujourd'hui</p>
              <p className="text-xl font-bold text-foreground">{todaySessions}</p>
            </div>
          </div>
        </Card>
        <Card className="glass p-4 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold text-foreground">{completedSessions}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Timer */}
      <div className="glass rounded-xl p-6 border border-primary/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-foreground">
              {isBreak ? "☕ Pause" : "🎯 Focus"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isBreak ? `${breakDuration} min de repos` : `${workDuration} min de travail`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="h-9 w-9"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-9 w-9">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glass">
                <DialogHeader>
                  <DialogTitle>Paramètres Pomodoro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="work">Durée de travail (minutes)</Label>
                    <Input
                      id="work"
                      type="number"
                      min="1"
                      max="60"
                      value={workDuration}
                      onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="break">Durée de pause (minutes)</Label>
                    <Input
                      id="break"
                      type="number"
                      min="1"
                      max="30"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)}
                    />
                  </div>
                  <Button onClick={updateSettings} className="w-full bg-gradient-primary">
                    Sauvegarder
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative mb-6 mx-auto w-48 h-48">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-primary/10"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-primary" stopColor="currentColor" />
                <stop offset="100%" className="text-primary/50" stopColor="currentColor" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent ${isActive ? 'animate-pulse' : ''}`}>
              {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 col-span-2"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Démarrer
              </>
            )}
          </Button>
          
          <Button
            onClick={resetTimer}
            size="sm"
            variant="outline"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <Button
            onClick={startBreak}
            size="sm"
            variant="outline"
            disabled={isBreak}
          >
            <Coffee className="w-4 h-4 mr-2" />
            Pause
          </Button>
        </div>

        {/* Focus Mode Link */}
        {onOpenFocusMode && !isActive && (
          <Button
            onClick={() => onOpenFocusMode(workDuration)}
            variant="outline"
            className="w-full mt-3 border-primary/50 text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Mode Focus Total
          </Button>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;