import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PomodoroTimerProps {
  userId?: string;
}

const PomodoroTimer = ({ userId }: PomodoroTimerProps) => {
  const [seconds, setSeconds] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleSessionComplete = async () => {
    setIsActive(false);
    
    if (userId && sessionId) {
      await supabase
        .from('pomodoro_sessions')
        .update({ 
          completed: true, 
          completed_at: new Date().toISOString() 
        })
        .eq('id', sessionId);
    }

    if (isBreak) {
      toast({
        title: "☕ Pause terminée !",
        description: "C'est reparti pour une session de travail.",
      });
      setIsBreak(false);
      setSeconds(25 * 60);
    } else {
      toast({
        title: "🎉 Session terminée !",
        description: "Prends une pause bien méritée.",
      });
      setIsBreak(true);
      setSeconds(5 * 60);
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
    setSeconds(25 * 60);
    setSessionId(null);
  };

  const startBreak = () => {
    setIsActive(false);
    setIsBreak(true);
    setSeconds(5 * 60);
    setSessionId(null);
  };

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="glass rounded-xl p-8 flex flex-col items-center">
      <h3 className="text-2xl font-bold text-foreground mb-2">
        {isBreak ? "☕ Pause" : "🎯 Focus"}
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        {isBreak ? "Temps de repos" : "Mode Pomodoro"}
      </p>

      <div className="relative mb-8">
        <div className="w-48 h-48 rounded-full border-8 border-primary/20 flex items-center justify-center">
          <div className={`text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent ${isActive ? 'animate-pulse' : ''}`}>
            {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={toggleTimer}
          size="lg"
          className="gap-2"
        >
          {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isActive ? 'Pause' : 'Start'}
        </Button>
        
        <Button
          onClick={resetTimer}
          size="lg"
          variant="outline"
          className="gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Reset
        </Button>

        {!isBreak && !isActive && (
          <Button
            onClick={startBreak}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <Coffee className="w-5 h-5" />
            Pause
          </Button>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          {isBreak ? "5 minutes de pause" : "25 minutes de travail concentré"}
        </p>
      </div>
    </div>
  );
};

export default PomodoroTimer;