import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee, Settings, TrendingUp, Volume2, VolumeX, Sparkles, Target, Clock, Flame, BellOff, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { NativeSettings, IOSSettings, AndroidSettings } from 'capacitor-native-settings';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PomodoroTimerProps {
  userId?: string;
  onOpenFocusMode?: (duration: number) => void;
}

// Duration presets
const DURATION_PRESETS = [
  { label: "15", value: 15 },
  { label: "25", value: 25 },
  { label: "45", value: 45 },
  { label: "60", value: 60 },
  { label: "90", value: 90 },
];

const PomodoroTimer = ({ userId, onOpenFocusMode }: PomodoroTimerProps) => {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [seconds, setSeconds] = useState(workDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [todaySessions, setTodaySessions] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(4);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
    loadDailyGoal();
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

  const loadDailyGoal = () => {
    const saved = localStorage.getItem('pomodoro_daily_goal');
    if (saved) setDailyGoal(parseInt(saved) || 4);
  };

  const saveDailyGoal = (goal: number) => {
    setDailyGoal(goal);
    localStorage.setItem('pomodoro_daily_goal', goal.toString());
  };

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
      
      // Calculate today's minutes
      const todayMins = todayData.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
      setTodayMinutes(todayMins);
      
      // Calculate weekly minutes
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekData = data.filter(s => s.completed_at && new Date(s.completed_at) >= weekAgo);
      const weekMins = weekData.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
      setWeeklyMinutes(weekMins);
      
      // Calculate streak (consecutive days with at least 1 session)
      const dates = [...new Set(data.map(s => s.completed_at?.split('T')[0]).filter(Boolean))].sort().reverse();
      let streak = 0;
      const checkDate = new Date();
      for (const date of dates) {
        const expected = checkDate.toISOString().split('T')[0];
        if (date === expected) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      setCurrentStreak(streak);
    }
  };

  const openDoNotDisturbSettings = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast({
        title: "Fonctionnalité native",
        description: "Ouvre les paramètres de ton téléphone pour activer Ne pas déranger.",
      });
      return;
    }

    try {
      if (Capacitor.getPlatform() === 'ios') {
        await NativeSettings.openIOS({
          option: IOSSettings.DoNotDisturb,
        });
      } else {
        // Android uses ZenMode for Do Not Disturb
        await NativeSettings.openAndroid({
          option: AndroidSettings.ZenMode,
        });
      }
    } catch (error) {
      // Fallback to general settings
      try {
        if (Capacitor.getPlatform() === 'ios') {
          await NativeSettings.openIOS({
            option: IOSSettings.App,
          });
        } else {
          await NativeSettings.openAndroid({
            option: AndroidSettings.ApplicationDetails,
          });
        }
      } catch (e) {
        console.error('Cannot open settings:', e);
      }
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
      {/* Main Timer - FIRST for immediate visibility */}
      <div className="glass rounded-xl p-5 border border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-foreground">
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
              className="h-8 w-8"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Settings className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="glass max-h-[70vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Paramètres Pomodoro</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label className="mb-2 block">Durée rapide</Label>
                    <div className="flex flex-wrap gap-2">
                      {DURATION_PRESETS.map((preset) => (
                        <Button
                          key={preset.value}
                          variant={workDuration === preset.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setWorkDuration(preset.value)}
                          className={workDuration === preset.value ? "bg-gradient-primary" : ""}
                        >
                          {preset.label}min
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="work">Durée personnalisée (minutes)</Label>
                    <Input
                      id="work"
                      type="number"
                      min="1"
                      max="120"
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
                  <div>
                    <Label htmlFor="goal">Objectif journalier (sessions)</Label>
                    <Input
                      id="goal"
                      type="number"
                      min="1"
                      max="20"
                      value={dailyGoal}
                      onChange={(e) => saveDailyGoal(parseInt(e.target.value) || 4)}
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

        {/* Progress Ring - Compact */}
        <div className="relative mb-4 mx-auto w-40 h-40">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="72"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className="text-primary/10"
            />
            <circle
              cx="80"
              cy="80"
              r="72"
              stroke="url(#gradient)"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 72}`}
              strokeDashoffset={`${2 * Math.PI * 72 * (1 - progress / 100)}`}
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
            <div className={`text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent ${isActive ? 'animate-pulse' : ''}`}>
              {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Quick Duration Selection when not active */}
        {!isActive && !isBreak && (
          <div className="flex justify-center gap-2 mb-3">
            {DURATION_PRESETS.slice(0, 4).map((preset) => (
              <Button
                key={preset.value}
                variant={workDuration === preset.value ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setWorkDuration(preset.value);
                  setSeconds(preset.value * 60);
                }}
                className={`text-xs px-2 h-7 ${workDuration === preset.value ? "bg-gradient-primary" : "text-muted-foreground"}`}
              >
                {preset.label}min
              </Button>
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="bg-gradient-primary hover:opacity-90 col-span-2 h-11"
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
          
          <Button onClick={resetTimer} size="sm" variant="outline" className="h-9">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          <Button onClick={startBreak} size="sm" variant="outline" disabled={isBreak} className="h-9">
            <Coffee className="w-4 h-4 mr-2" />
            Pause
          </Button>
        </div>

        {/* Focus Mode Link */}
        {onOpenFocusMode && !isActive && (
          <Button
            onClick={() => onOpenFocusMode(workDuration)}
            variant="outline"
            className="w-full mt-2 h-9 border-primary/50 text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Mode Focus Total
          </Button>
        )}
      </div>

      {/* Compact Stats Row */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="glass p-2 border-primary/20 text-center">
          <Target className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">{todaySessions}/{dailyGoal}</p>
          <p className="text-[9px] text-muted-foreground">Objectif</p>
        </Card>
        <Card className="glass p-2 border-primary/20 text-center">
          <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">{currentStreak}</p>
          <p className="text-[9px] text-muted-foreground">Série</p>
        </Card>
        <Card className="glass p-2 border-primary/20 text-center">
          <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">{todayMinutes}m</p>
          <p className="text-[9px] text-muted-foreground">Aujourd'hui</p>
        </Card>
        <Card className="glass p-2 border-primary/20 text-center">
          <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <p className="text-sm font-bold text-foreground">{Math.round(weeklyMinutes / 60)}h</p>
          <p className="text-[9px] text-muted-foreground">Semaine</p>
        </Card>
      </div>

      {/* Daily Goal Progress - Compact */}
      {todaySessions > 0 && (
        <Card className="glass p-3 border-primary/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-foreground">Objectif du jour</span>
            <span className="text-xs text-primary font-semibold">{todaySessions}/{dailyGoal}</span>
          </div>
          <Progress value={Math.min((todaySessions / dailyGoal) * 100, 100)} className="h-1.5" />
          {todaySessions >= dailyGoal && (
            <p className="text-[10px] text-green-500 mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Objectif atteint ! 🎉
            </p>
          )}
        </Card>
      )}

      {/* Do Not Disturb & Total Sessions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={openDoNotDisturbSettings}
          variant="outline"
          className="glass border-orange-500/30 hover:bg-orange-500/10 text-orange-400 h-12"
        >
          <BellOff className="w-4 h-4 mr-2" />
          Ne pas déranger
        </Button>
        <Card className="glass p-2 border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total</span>
          </div>
          <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">{completedSessions}</span>
        </Card>
      </div>
    </div>
  );
};

export default PomodoroTimer;