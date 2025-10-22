import { useState, useEffect } from "react";
import { Bell, Palette, User, Info, LogOut, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { applyTheme, getTheme, Theme } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    daily: true,
    motivational: true,
    sounds: true,
  });
  const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme());
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    applyTheme(currentTheme);
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name || "");
      }
    }
  };

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

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Tes informations ont été sauvegardées.",
      });
      loadUserData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion",
      description: "À bientôt sur HabitFlow !",
    });
    navigate("/auth");
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
        {/* Account */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <User className="w-4 h-4 text-primary-foreground" />
            </div>
            Compte
          </h2>
          {user ? (
            <div className="glass rounded-xl p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="glass border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-foreground text-sm">
                  Nom complet
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass border-white/10 focus:border-primary/50"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={loading}
                  className="flex-1 bg-gradient-primary text-primary-foreground shadow-glow"
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="glass border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  Déconnexion
                </Button>
              </div>
            </div>
          ) : (
            <div className="glass rounded-xl p-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-foreground font-semibold mb-1">Non connecté</p>
                <p className="text-muted-foreground text-sm mb-4">
                  Connecte-toi pour synchroniser tes données sur tous tes appareils
                </p>
              </div>
              <Button
                onClick={() => navigate("/auth")}
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Se connecter
              </Button>
              <p className="text-xs text-muted-foreground">
                💡 Tu peux utiliser l&apos;app sans compte, mais tes données seront uniquement sur cet appareil
              </p>
            </div>
          )}
        </section>

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
