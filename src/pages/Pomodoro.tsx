import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Crown, Timer as TimerIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import PomodoroTimer from "@/components/PomodoroTimer";
import { FocusMode } from "@/components/FocusMode";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      <header className="px-6 pt-8 pb-4" />

      <main className="px-6 max-w-2xl mx-auto">
        {/* Tabs Navigation */}
        <div className="grid w-full grid-cols-2 glass rounded-lg p-1 mb-4">
          <button
            onClick={() => navigate("/timer")}
            className="flex items-center justify-center py-2 px-4 rounded-md text-muted-foreground hover:text-foreground font-medium text-sm transition-colors"
          >
            Compteurs
          </button>
          <div className="flex items-center justify-center py-2 px-4 rounded-md bg-primary text-primary-foreground font-medium text-sm">
            Pomodoro
          </div>
        </div>

        <PomodoroTimer 
          userId={user?.id}
          onOpenFocusMode={(duration) => {
            setFocusDuration(duration);
            setFocusModeOpen(true);
          }}
        />
      </main>

      <Navigation />

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

