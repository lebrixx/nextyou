import { useState, useEffect } from "react";
import { Clock, Bell, Settings2, Shuffle, Crown, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import TimePickerWheel from "@/components/TimePickerWheel";
import { toast } from "@/hooks/use-toast";
import { quotes } from "@/data/quotes";
import { useNotifications } from "@/hooks/useNotifications";
import { LocalNotifications } from "@capacitor/local-notifications";

type NotificationMode = "range" | "specific" | "random";

interface QuoteSettings {
  enabled: boolean;
  mode: NotificationMode;
  quotesPerDay: number;
  startTime: string;
  endTime: string;
  specificTimes: string[];
}

const Quotes = () => {
  const navigate = useNavigate();
  const { scheduleQuoteNotifications, sendInstantQuote } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  
  const [settings, setSettings] = useState<QuoteSettings>(() => {
    const saved = localStorage.getItem("quote_notification_settings");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      enabled: false,
      mode: "range" as NotificationMode,
      quotesPerDay: 3,
      startTime: "08:00",
      endTime: "21:00",
      specificTimes: ["09:00", "14:00", "19:00"],
    };
  });

  useEffect(() => {
    localStorage.setItem("quote_notification_settings", JSON.stringify(settings));
    localStorage.setItem("quotes_per_day", settings.quotesPerDay.toString());
  }, [settings]);

  const handleSendTestNotification = async () => {
    setIsSendingTest(true);
    try {
      await sendInstantQuote();
      toast({
        title: "Notification envoyée",
        description: "Tu devrais recevoir une citation dans quelques secondes",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification test",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      try {
        setIsLoading(true);
        
        // Check permissions first
        const status = await LocalNotifications.checkPermissions();
        if (status.display !== 'granted') {
          const result = await LocalNotifications.requestPermissions();
          if (result.display !== 'granted') {
            toast({
              title: "Permissions requises",
              description: "Active les notifications dans les paramètres de ton téléphone",
              variant: "destructive",
            });
            return;
          }
        }

        // Clear existing notifications before scheduling new ones
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }

        setSettings(prev => ({ ...prev, enabled: true }));
        
        // Schedule with a small delay to ensure settings are saved
        setTimeout(async () => {
          try {
            await scheduleQuoteNotifications();
            toast({
              title: "Notifications activées",
              description: `Tu recevras ${settings.quotesPerDay} citation(s) par jour`,
            });
          } catch (error) {
            console.error('Error scheduling:', error);
            toast({
              title: "Erreur",
              description: "Impossible de programmer les notifications",
              variant: "destructive",
            });
          }
        }, 500);
      } catch (error) {
        console.error('Error enabling notifications:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'activer les notifications",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Disable notifications
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }
        setSettings(prev => ({ ...prev, enabled: false }));
        toast({
          title: "Notifications désactivées",
          description: "Tu ne recevras plus de citations",
        });
      } catch (error) {
        console.error('Error disabling notifications:', error);
      }
    }
  };

  const handleSaveSettings = async () => {
    if (settings.enabled) {
      setIsLoading(true);
      try {
        // Clear and reschedule
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }
        await scheduleQuoteNotifications();
        toast({
          title: "Paramètres sauvegardés",
          description: "Les notifications ont été reprogrammées",
        });
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour les notifications",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Paramètres sauvegardés",
        description: "Active les notifications pour les appliquer",
      });
    }
  };

  const addSpecificTime = () => {
    if (settings.specificTimes.length < 5) {
      setSettings(prev => ({
        ...prev,
        specificTimes: [...prev.specificTimes, "12:00"],
      }));
    }
  };

  const removeSpecificTime = (index: number) => {
    setSettings(prev => ({
      ...prev,
      specificTimes: prev.specificTimes.filter((_, i) => i !== index),
    }));
  };

  const updateSpecificTime = (index: number, value: string) => {
    setSettings(prev => ({
      ...prev,
      specificTimes: prev.specificTimes.map((t, i) => i === index ? value : t),
    }));
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-6 relative">
        <Button
          onClick={() => navigate("/premium")}
          variant="ghost"
          size="sm"
          className="absolute top-8 right-6 w-10 h-10 p-0 rounded-full bg-gradient-primary shadow-glow hover:opacity-90"
        >
          <Crown className="w-5 h-5 text-primary-foreground" />
        </Button>
        
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Citations
        </h1>
        <p className="text-muted-foreground text-sm">
          {quotes.length} citations inspirantes
        </p>
      </header>

      <main className="px-6 space-y-5 max-w-2xl mx-auto">
        {/* Notification Settings */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Bell className="w-4 h-4 text-primary-foreground" />
            </div>
            Notifications
          </h2>

          <div className="glass rounded-xl overflow-hidden">
            {/* Enable/Disable */}
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <div>
                <p className="font-semibold text-foreground text-sm">Activer les notifications</p>
                <p className="text-xs text-muted-foreground">
                  Reçois des citations inspirantes
                </p>
              </div>
              <Switch
                checked={settings.enabled}
                onCheckedChange={handleToggleNotifications}
                disabled={isLoading}
              />
            </div>

            {/* Quotes per day */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-foreground text-sm">Citations par jour</p>
                <span className="text-lg font-bold text-primary">{settings.quotesPerDay}</span>
              </div>
              <Slider
                value={[settings.quotesPerDay]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, quotesPerDay: value }))}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            {/* Notification Mode */}
            <div className="p-4 border-b border-white/5">
              <p className="font-semibold text-foreground text-sm mb-3">Mode d'envoi</p>
              <RadioGroup
                value={settings.mode}
                onValueChange={(value) => setSettings(prev => ({ ...prev, mode: value as NotificationMode }))}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 glass rounded-lg p-3">
                  <RadioGroupItem value="range" id="range" />
                  <Label htmlFor="range" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Plage horaire</p>
                      <p className="text-xs text-muted-foreground">Entre deux heures choisies</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 glass rounded-lg p-3">
                  <RadioGroupItem value="specific" id="specific" />
                  <Label htmlFor="specific" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Settings2 className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Heures précises</p>
                      <p className="text-xs text-muted-foreground">À des heures définies</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 glass rounded-lg p-3">
                  <RadioGroupItem value="random" id="random" />
                  <Label htmlFor="random" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Shuffle className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium text-sm">Aléatoire</p>
                      <p className="text-xs text-muted-foreground">Moments surprises dans la journée</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Time Range Settings */}
            {settings.mode === "range" && (
              <div className="p-4 space-y-4 border-b border-white/5">
                <p className="font-semibold text-foreground text-sm">Plage horaire</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">De</Label>
                    <TimePickerWheel
                      value={settings.startTime}
                      onChange={(value) => setSettings(prev => ({ ...prev, startTime: value }))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">À</Label>
                    <TimePickerWheel
                      value={settings.endTime}
                      onChange={(value) => setSettings(prev => ({ ...prev, endTime: value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Specific Times Settings */}
            {settings.mode === "specific" && (
              <div className="p-4 space-y-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground text-sm">Heures précises</p>
                  {settings.specificTimes.length < 5 && (
                    <Button
                      onClick={addSpecificTime}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      + Ajouter
                    </Button>
                  )}
                </div>
                <div className="space-y-3">
                  {settings.specificTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="flex-1">
                        <TimePickerWheel
                          value={time}
                          onChange={(value) => updateSpecificTime(index, value)}
                        />
                      </div>
                      {settings.specificTimes.length > 1 && (
                        <Button
                          onClick={() => removeSpecificTime(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 px-2"
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Random Mode Info */}
            {settings.mode === "random" && (
              <div className="p-4 border-b border-white/5">
                <div className="glass rounded-lg p-3 bg-primary/5 border border-primary/20">
                  <p className="text-sm text-foreground">
                    💡 Les citations seront envoyées à des moments aléatoires entre 8h et 22h pour te surprendre positivement !
                  </p>
                </div>
              </div>
            )}

            {/* Test & Save Buttons */}
            <div className="p-4 space-y-3">
              <Button
                onClick={handleSendTestNotification}
                disabled={isSendingTest}
                variant="outline"
                className="w-full glass border-primary/30 text-primary hover:bg-primary/10"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSendingTest ? "Envoi en cours..." : "Envoyer une notification test"}
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
              >
                {isLoading ? "Enregistrement..." : "Sauvegarder les paramètres"}
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="glass rounded-xl p-4 border border-white/5">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{quotes.length}</p>
              <p className="text-xs text-muted-foreground">Citations disponibles</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">5</p>
              <p className="text-xs text-muted-foreground">Catégories</p>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Quotes;
