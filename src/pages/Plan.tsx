import { useState, useEffect } from "react";
import { Sparkles, Bell, Smartphone, ChevronDown, Calendar, Download } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "@/hooks/use-toast";
import HabitCalendar from "@/components/HabitCalendar";
import BadgeDisplay from "@/components/BadgeDisplay";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV, exportToJSON, generateExportFilename } from "@/utils/exportData";
import useBadges from "@/hooks/useBadges";

const Plan = () => {
  const [quotesPerDay, setQuotesPerDay] = useState(() => {
    const saved = localStorage.getItem("quotes_per_day");
    return saved ? parseInt(saved) : 3;
  });
  const [widgetSectionOpen, setWidgetSectionOpen] = useState(false);
  const { scheduleQuoteNotifications, sendInstantQuote } = useNotifications();
  const [user, setUser] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  const [habits, setHabits] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem("quotes_per_day", quotesPerDay.toString());
    loadUserData();
  }, [quotesPerDay]);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      
      const { data: badgesData } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id);
      setBadges(badgesData || []);

      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);
      setHabits(habitsData || []);

      const { data: completionsData } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id);
      setCompletions(completionsData || []);
    }
  };

  // Calculate stats for badges
  const stats = {
    totalCompletions: completions.length,
    bestStreak: Math.max(...habits.map(h => h.best_streak || 0), 0),
    totalHabits: habits.length,
    perfectWeek: false, // TODO: Calculate based on completions
  };

  // Auto-unlock badges
  useBadges(user?.id, stats);

  const handleExportCSV = () => {
    exportToCSV(
      habits.map(h => ({
        name: h.name,
        streak: h.streak,
        best_streak: h.best_streak,
        created_at: h.created_at,
      })),
      generateExportFilename('habits', 'csv')
    );
    toast({
      title: "Export réussi",
      description: "Tes données ont été exportées en CSV",
    });
  };

  const handleExportJSON = () => {
    exportToJSON(
      {
        habits,
        completions,
        badges,
        exported_at: new Date().toISOString(),
      },
      generateExportFilename('nextyou_data', 'json')
    );
    toast({
      title: "Export réussi",
      description: "Toutes tes données ont été exportées en JSON",
    });
  };

  const handleActivateNotifications = async () => {
    try {
      await scheduleQuoteNotifications();
      toast({
        title: "Notifications activées",
        description: `Tu recevras ${quotesPerDay} citation${quotesPerDay > 1 ? 's' : ''} par jour entre 9h et 22h.`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'activer les notifications.",
        variant: "destructive",
      });
    }
  };

  const handleTestNotification = async () => {
    await sendInstantQuote();
    toast({
      title: "Citation envoyée",
      description: "Tu devrais recevoir une notification dans quelques secondes.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Messages <span className="bg-gradient-primary bg-clip-text text-transparent">Inspirants</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Reçois des messages positifs et motivants pour booster ta journée
        </p>
      </header>

      <main className="px-6 pt-4 space-y-6 max-w-2xl mx-auto">
        {/* Calendar Heatmap */}
        {user && completions.length > 0 && (
          <HabitCalendar completions={completions} />
        )}

        {/* Export Data */}
        {user && habits.length > 0 && (
          <section className="glass rounded-xl p-6 space-y-4 border border-primary/20">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary shadow-glow mb-3">
                <Download className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">Exporter mes données</h2>
              <p className="text-xs text-muted-foreground">Sauvegarde et partage tes progrès</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleExportCSV}
                variant="outline"
                className="flex-1 glass border-primary/30"
              >
                CSV
              </Button>
              <Button
                onClick={handleExportJSON}
                variant="outline"
                className="flex-1 glass border-primary/30"
              >
                JSON
              </Button>
            </div>
          </section>
        )}

        {/* Notification Frequency */}
        <section className="glass rounded-xl p-6 space-y-5 border border-primary/20">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-primary shadow-glow mb-3">
              <Bell className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Notifications Quotidiennes</h2>
            <p className="text-xs text-muted-foreground">Messages envoyés entre 9h et 22h</p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <Label className="text-sm text-muted-foreground block mb-2">Messages par jour</Label>
              <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
                {quotesPerDay}
              </div>
            </div>
            
            <input
              type="range"
              min="1"
              max="4"
              value={quotesPerDay}
              onChange={(e) => setQuotesPerDay(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button
              onClick={handleActivateNotifications}
              className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity font-semibold h-12"
            >
              <Bell className="w-4 h-4 mr-2" />
              Activer
            </Button>

            <Button
              onClick={handleTestNotification}
              variant="outline"
              className="w-full glass border-primary/30 h-10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Tester
            </Button>
          </div>
        </section>

        {/* Widget Instructions */}
        <section className="space-y-3">
          <button
            onClick={() => setWidgetSectionOpen(!widgetSectionOpen)}
            className="w-full group"
          >
            <div className="glass rounded-xl p-4 border border-primary/30 hover:border-primary/50 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Smartphone className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      Widget Écran d&apos;Accueil
                    </h2>
                    <p className="text-xs text-muted-foreground">Messages toujours visibles</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-300 ${widgetSectionOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          {widgetSectionOpen && (
            <div className="glass rounded-xl p-5 space-y-4 border border-primary/20 animate-accordion-down">
              <div className="bg-gradient-primary/10 rounded-lg p-4 border border-primary/30">
                <p className="text-sm font-semibold text-primary mb-2">✨ Garde ta motivation visible</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Le widget affiche un message inspirant directement sur ton écran d&apos;accueil. 
                  Plus besoin d&apos;ouvrir l&apos;app pour voir ta dose de motivation !
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg p-4 bg-background/50 border border-white/10">
                  <p className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                    <span>📱</span> iPhone / iPad
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                    <li>Maintiens ton doigt sur l&apos;écran d&apos;accueil</li>
                    <li>Appuie sur le <span className="text-primary font-semibold">+</span> en haut à gauche</li>
                    <li>Cherche <span className="text-primary font-semibold">&quot;Next You 2.0&quot;</span></li>
                    <li>Choisis le widget et place-le</li>
                  </ol>
                </div>

                <div className="rounded-lg p-4 bg-background/50 border border-white/10">
                  <p className="font-semibold text-foreground mb-2 text-sm flex items-center gap-2">
                    <span>🤖</span> Android
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-muted-foreground">
                    <li>Maintiens ton doigt sur l&apos;écran d&apos;accueil</li>
                    <li>Appuie sur <span className="text-primary font-semibold">&quot;Widgets&quot;</span></li>
                    <li>Trouve <span className="text-primary font-semibold">&quot;Next You 2.0&quot;</span></li>
                    <li>Fais glisser le widget à l&apos;endroit voulu</li>
                  </ol>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-primary font-medium">
                  💫 Nouveau message toutes les 30 minutes
                </p>
              </div>
            </div>
          )}
        </section>

        {/* About Section */}
        <section className="glass rounded-xl p-5 border border-primary/20">
          <div className="text-center space-y-3">
            <div className="text-3xl">💪</div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">+250 Messages Inspirants</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Motivation · Discipline · Succès · Persévérance · Mindset positif
              </p>
            </div>
            <div className="pt-2 mt-3 border-t border-white/10">
              <p className="text-xs text-muted-foreground">
                Les messages arrivent à des moments aléatoires pour te surprendre et te booster tout au long de la journée
              </p>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Plan;
