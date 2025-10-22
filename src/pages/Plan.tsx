import { useState, useEffect } from "react";
import { Sparkles, Bell, Smartphone } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "@/hooks/use-toast";

const Plan = () => {
  const [quotesPerDay, setQuotesPerDay] = useState(() => {
    const saved = localStorage.getItem("quotes_per_day");
    return saved ? parseInt(saved) : 3;
  });
  const { scheduleQuoteNotifications, sendInstantQuote } = useNotifications();

  useEffect(() => {
    localStorage.setItem("quotes_per_day", quotesPerDay.toString());
  }, [quotesPerDay]);

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
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Cita<span className="bg-gradient-primary bg-clip-text text-transparent">tions</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Configure tes notifications quotidiennes de motivation
        </p>
      </header>

      <main className="px-6 pt-4 space-y-6 max-w-2xl mx-auto">
        {/* Notification Frequency */}
        <section className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Fréquence des notifications</h2>
              <p className="text-xs text-muted-foreground">Citations envoyées entre 9h et 22h</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm text-foreground">
              Nombre de citations par jour : <span className="text-primary font-bold">{quotesPerDay}</span>
            </Label>
            <input
              type="range"
              min="1"
              max="4"
              value={quotesPerDay}
              onChange={(e) => setQuotesPerDay(parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 citation</span>
              <span>4 citations</span>
            </div>
          </div>

          <Button
            onClick={handleActivateNotifications}
            className="w-full bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-opacity font-semibold"
          >
            <Bell className="w-4 h-4 mr-2" />
            💾 Enregistrer et activer les notifications
          </Button>

          <Button
            onClick={handleTestNotification}
            variant="outline"
            size="sm"
            className="w-full glass border-primary/30 text-xs"
          >
            ✨ Tester (envoie une notification maintenant)
          </Button>
        </section>

        {/* Widget Instructions */}
        <section className="glass rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Widget Citations</h2>
              <p className="text-xs text-muted-foreground">Affiche les citations sur ton écran d&apos;accueil</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="glass-strong rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2">📱 Sur iOS (iPhone/iPad)</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs">
                <li>Reste appuyé sur l&apos;écran d&apos;accueil</li>
                <li>Touche le bouton + en haut à gauche</li>
                <li>Recherche "Next You 2.0"</li>
                <li>Sélectionne le widget Citations</li>
                <li>Choisis la taille et place-le</li>
              </ol>
            </div>

            <div className="glass-strong rounded-lg p-4">
              <p className="font-semibold text-foreground mb-2">🤖 Sur Android</p>
              <ol className="list-decimal list-inside space-y-1.5 text-xs">
                <li>Reste appuyé sur l&apos;écran d&apos;accueil</li>
                <li>Touche "Widgets"</li>
                <li>Cherche "Next You 2.0"</li>
                <li>Fais glisser le widget Citations</li>
                <li>Ajuste la taille selon tes besoins</li>
              </ol>
            </div>

            <div className="text-center pt-2">
              <p className="text-xs text-primary">
                💡 Le widget affiche une nouvelle citation toutes les 30 minutes parmi plus de 160 messages inspirants
              </p>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="glass rounded-xl p-5">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💪</div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-2">Plus de 160 citations inspirantes</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Notre collection comprend des messages de motivation, discipline, succès, persévérance et mindset. 
                Les notifications sont envoyées à des heures aléatoires entre 9h et 22h pour te surprendre et te motiver 
                tout au long de la journée.
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
