import { useState, useEffect } from "react";
import { Bell, Palette, User, Info } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { applyTheme, getTheme, Theme } from "@/lib/theme";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    daily: true,
    motivational: true,
    sounds: true,
  });
  const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme());

  useEffect(() => {
    applyTheme(currentTheme);
  }, []);

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    toast({
      title: "Thème changé",
      description: `Le thème ${theme === "purple" ? "violet" : theme === "blue" ? "bleu" : "vert"} a été appliqué.`,
    });
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Paramètre modifié",
      description: "Tes préférences ont été enregistrées.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Réglages
        </h1>
        <p className="text-muted-foreground text-sm">Personnalise ton expérience</p>
      </header>

      <main className="px-6 pt-4 space-y-4 max-w-2xl mx-auto">
        {/* Notifications */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Bell className="w-4 h-4 text-primary-foreground" />
            </div>
            Notifications
          </h2>
          <div className="glass rounded-xl divide-y divide-white/5">
            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <p className="font-semibold text-foreground text-sm mb-0.5">Rappels quotidiens</p>
                <p className="text-xs text-muted-foreground">
                  Reçois des rappels pour tes habitudes
                </p>
              </div>
              <Switch 
                checked={notifications.daily} 
                onCheckedChange={() => handleNotificationChange("daily")}
              />
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <p className="font-semibold text-foreground text-sm mb-0.5">Messages motivants</p>
                <p className="text-xs text-muted-foreground">
                  Citations inspirantes quotidiennes
                </p>
              </div>
              <Switch 
                checked={notifications.motivational}
                onCheckedChange={() => handleNotificationChange("motivational")}
              />
            </div>
            <div className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <p className="font-semibold text-foreground text-sm mb-0.5">Sons</p>
                <p className="text-xs text-muted-foreground">
                  Sons de validation et alertes
                </p>
              </div>
              <Switch 
                checked={notifications.sounds}
                onCheckedChange={() => handleNotificationChange("sounds")}
              />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Palette className="w-4 h-4 text-primary-foreground" />
            </div>
            Apparence
          </h2>
          <div className="glass rounded-xl p-4">
            <div className="mb-3">
              <p className="font-semibold text-foreground text-sm mb-2">Thème de couleur</p>
              <p className="text-xs text-muted-foreground mb-3">
                Choisis ton thème préféré
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleThemeChange("purple")}
                className={`flex-1 h-16 rounded-lg bg-gradient-to-br from-purple-600 to-purple-400 transition-all hover:scale-105 ${
                  currentTheme === "purple" ? "border-2 border-white shadow-glow" : "opacity-70"
                }`}
              />
              <button 
                onClick={() => handleThemeChange("blue")}
                className={`flex-1 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 transition-all hover:scale-105 ${
                  currentTheme === "blue" ? "border-2 border-white shadow-glow" : "opacity-70"
                }`}
              />
              <button 
                onClick={() => handleThemeChange("green")}
                className={`flex-1 h-16 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 transition-all hover:scale-105 ${
                  currentTheme === "green" ? "border-2 border-white shadow-glow" : "opacity-70"
                }`}
              />
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            Compte
          </h2>
          <div className="glass rounded-xl divide-y divide-white/5">
            <button 
              onClick={() => toast({ title: "Profil", description: "Fonctionnalité à venir" })}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <p className="font-semibold text-foreground text-sm">Profil</p>
            </button>
            <button 
              onClick={() => toast({ title: "Premium", description: "Fonctionnalité à venir" })}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <p className="font-semibold text-foreground text-sm">Passer à Premium</p>
              <span className="px-3 py-1 rounded-full bg-gradient-primary text-primary-foreground text-[10px] font-bold shadow-glow">
                PRO
              </span>
            </button>
            <button 
              onClick={() => toast({ title: "Export", description: "Fonctionnalité à venir" })}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <p className="font-semibold text-foreground text-sm">Exporter mes données</p>
            </button>
          </div>
        </section>

        {/* About */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Info className="w-4 h-4 text-primary-foreground" />
            </div>
            À propos
          </h2>
          <div className="glass rounded-xl divide-y divide-white/5">
            <button 
              onClick={() => toast({ title: "Support", description: "Contactez-nous à support@habitflow.app" })}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <p className="font-semibold text-foreground text-sm">Aide & Support</p>
            </button>
            <button 
              onClick={() => toast({ title: "Confidentialité", description: "Tes données sont sécurisées et privées" })}
              className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <p className="font-semibold text-foreground text-sm">Politique de confidentialité</p>
            </button>
            <div className="p-4">
              <p className="text-xs text-muted-foreground font-medium">Version 1.0.0</p>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Settings;
