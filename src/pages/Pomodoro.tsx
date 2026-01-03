import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PomodoroTimer from "@/components/PomodoroTimer";
import { FocusMode } from "@/components/FocusMode";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const Pomodoro = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [focusDuration, setFocusDuration] = useState(25);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6 relative">
        <Button
          onClick={() => navigate("/timer")}
          variant="ghost"
          size="sm"
          className="absolute top-8 left-6 w-10 h-10 p-0 rounded-full glass hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Button>
        
        <Button
          onClick={() => navigate("/premium")}
          variant="ghost"
          size="sm"
          className="absolute top-8 right-6 w-10 h-10 p-0 rounded-full bg-gradient-primary shadow-glow hover:opacity-90"
        >
          <Crown className="w-5 h-5 text-primary-foreground" />
        </Button>
        
        <div className="text-center pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <Clock className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Pomodoro</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
            Concentre-toi intensément, repose-toi efficacement
          </p>
        </div>
      </header>

      <main className="px-6 pt-4 max-w-2xl mx-auto">
        <PomodoroTimer 
          userId={user?.id}
          onOpenFocusMode={(duration) => {
            setFocusDuration(duration);
            setFocusModeOpen(true);
          }}
        />
      </main>

      <FocusMode 
        open={focusModeOpen} 
        onOpenChange={setFocusModeOpen}
        duration={focusDuration}
        onComplete={() => {
          toast({ title: "Session terminée", description: `Tu as complété ${focusDuration} minutes de focus total!` });
        }}
      />
    </div>
  );
};

export default Pomodoro;
