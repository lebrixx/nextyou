import { useState, useEffect } from "react";
import { Sparkles, Bell, BellRing } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { quotes, getRandomQuotes } from "@/data/quotes";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

const Plan = () => {
  const [displayedQuotes, setDisplayedQuotes] = useState(() => getRandomQuotes(10));
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { scheduleQuoteNotifications, sendInstantQuote } = useNotifications();
  const { toast } = useToast();

  const refreshQuotes = () => {
    setDisplayedQuotes(getRandomQuotes(10));
  };

  const handleEnableNotifications = async () => {
    try {
      await scheduleQuoteNotifications();
      setNotificationsEnabled(true);
      toast({
        title: "Notifications activées",
        description: "Tu recevras une citation chaque jour à 9h",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'activer les notifications",
        variant: "destructive",
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendInstantQuote();
      toast({
        title: "Notification envoyée",
        description: "Vérifie tes notifications !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          <span className="bg-gradient-primary bg-clip-text text-transparent">Citations</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Plus de 100 citations pour t'inspirer chaque jour
        </p>
      </header>

      <main className="px-6 pt-4 space-y-6 max-w-2xl mx-auto">
        {/* Notifications Control */}
        <section className="glass rounded-xl p-5 shadow-elevation border border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">Notifications quotidiennes</h2>
              <p className="text-xs text-muted-foreground">Reçois une citation inspirante chaque jour</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleEnableNotifications}
              className="flex-1"
              disabled={notificationsEnabled}
            >
              <BellRing className="w-4 h-4 mr-2" />
              {notificationsEnabled ? "Activées" : "Activer"}
            </Button>
            <Button
              onClick={handleTestNotification}
              variant="outline"
              className="flex-1"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Test
            </Button>
          </div>
        </section>

        {/* Widget Instructions */}
        <section className="glass rounded-xl p-5 shadow-elevation border border-white/5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-2">Widget de citations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Ajoute les citations sur ton écran d'accueil pour une dose quotidienne de motivation. 
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>iOS:</strong> Maintiens appui sur l'écran d'accueil → "+" → Recherche "HabitFlow"</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Android:</strong> Maintiens appui sur l'icône → "Widgets" → Sélectionne le widget</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quotes Display */}
        <section className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-foreground">Citations inspirantes</h2>
            <Button
              onClick={refreshQuotes}
              size="sm"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Nouvelles
            </Button>
          </div>
          {displayedQuotes.map((quote, index) => (
            <div
              key={index}
              className="glass rounded-xl p-5 shadow-elevation border border-white/5 animate-fade-in hover-scale"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">
                  {quote.category === "motivation" && "🔥"}
                  {quote.category === "discipline" && "💪"}
                  {quote.category === "success" && "🎯"}
                  {quote.category === "perseverance" && "⚡"}
                  {quote.category === "mindset" && "🧠"}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground font-medium italic leading-relaxed mb-2">
                    "{quote.text}"
                  </p>
                  <p className="text-xs text-muted-foreground">— {quote.author}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Info Section */}
        <section className="glass rounded-xl p-5 shadow-elevation border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-2">À propos des citations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Découvre plus de 100 citations inspirantes dans 5 catégories différentes. Utilise les filtres pour explorer les thèmes qui résonnent avec toi, ou clique sur "Nouvelles" pour découvrir 10 nouvelles citations aléatoires.
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
