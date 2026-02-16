import { useState, useEffect } from "react";
import { Bell, Palette, User, Info, LogOut, LogIn, Download, Globe, Crown, ChevronDown, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { applyTheme, getTheme, Theme, applyAppearance, getAppearance, AppearanceMode } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import { exportToCSV, exportToJSON, generateExportFilename } from "@/utils/exportData";
import { useTranslation, Language } from "@/lib/i18n";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotificationScheduler } from "@/hooks/useNotificationScheduler";
import { Capacitor } from "@capacitor/core";
import { NativeSettings, AndroidSettings, IOSSettings } from "capacitor-native-settings";

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useTranslation();
  const { refreshNotifications } = useNotificationScheduler();
  const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme());
  const [currentAppearance, setCurrentAppearance] = useState<AppearanceMode>(getAppearance());
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [profileExpanded, setProfileExpanded] = useState(false);

  useEffect(() => {
    applyTheme(currentTheme);
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        
        // Defer profile loading to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            loadUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
          setFullName("");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (profileData) {
      setProfile(profileData);
      setFullName(profileData.full_name || "");
    }
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    toast({
      title: t('themeChanged'),
      description: t('themeApplied'),
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
      if (user) loadUserProfile(user.id);
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
    // Clear all local data on sign out
    localStorage.removeItem("habitflow_timers");
    localStorage.removeItem("timeritual_habits");
    localStorage.removeItem("timeritual_completions");
    localStorage.removeItem("quotes_notification_settings");
    localStorage.removeItem("muted_friends");
    localStorage.removeItem("muted_groups");
    
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion",
      description: "À bientôt sur Time Ritual !",
    });
    navigate("/");
  };

  const handleExportAll = async () => {
    if (!user) return;

    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id);

    const { data: completions } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id);

    const { data: badges } = await supabase
      .from('badges')
      .select('*')
      .eq('user_id', user.id);

    const { data: pomodoro } = await supabase
      .from('pomodoro_sessions')
      .select('*')
      .eq('user_id', user.id);

    exportToJSON(
      {
        habits: habits || [],
        completions: completions || [],
        badges: badges || [],
        pomodoro_sessions: pomodoro || [],
        profile,
        exported_at: new Date().toISOString(),
      },
      generateExportFilename('timeritual_complete', 'json')
    );

    toast({
      title: "Export réussi",
      description: "Toutes tes données ont été exportées",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
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
          {t('settings')}
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
            <div className="glass rounded-xl overflow-hidden">
              {/* Compact view */}
              <button 
                onClick={() => setProfileExpanded(!profileExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-bold">
                      {(profile?.full_name || user.email)?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {profile?.full_name || 'Mon compte'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Connecté avec {user.email}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${profileExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Expanded view */}
              {profileExpanded && (
                <div className="p-4 pt-0 space-y-4 border-t border-border">
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
                      className="glass border-border focus:border-primary/50"
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
              )}
            </div>
          ) : (
            <div className="glass rounded-xl overflow-hidden">
              {/* Compact view */}
              <button 
                onClick={() => setProfileExpanded(!profileExpanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Non connecté</p>
                    <p className="text-xs text-muted-foreground">
                      Mode local uniquement
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${profileExpanded ? 'rotate-180' : ''}`} />
              </button>

              {/* Expanded view */}
              {profileExpanded && (
                <div className="p-4 pt-0 space-y-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Connecte-toi pour synchroniser tes données sur tous tes appareils et accéder aux fonctionnalités sociales.
                  </p>
                  <Button
                    onClick={() => navigate("/auth")}
                    className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Se connecter / Créer un compte
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    💡 Tes données restent sur cet appareil sans compte
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Premium Section */}
        <section className="space-y-3">
          <div className="glass rounded-xl p-6 relative overflow-hidden border border-primary/30 shadow-glow">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center animate-pulse-glow">
                    <Crown className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                      Passer Pro
                    </h3>
                    <p className="text-xs text-muted-foreground">Débloque toutes les fonctionnalités</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Statistiques avancées illimitées</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Synchronisation multi-appareils</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Thèmes premium exclusifs</span>
                </div>
              </div>
              <Button
                disabled
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow cursor-not-allowed opacity-70"
              >
                Bientôt disponible ✨
              </Button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Les notifications sont <span className="text-primary font-medium">indispensables</span> pour Time Ritual. 
            Elles te rappellent tes habitudes et t'envoient des citations motivantes.
          </p>
          <Button
            onClick={async () => {
              try {
                if (Capacitor.isNativePlatform()) {
                  // Open THIS app's settings page directly
                  await NativeSettings.open({
                    optionAndroid: AndroidSettings.ApplicationDetails,
                    optionIOS: IOSSettings.App,
                  });
                } else {
                  // Web: show instructions
                  toast({
                    title: "💡 Paramètres du navigateur",
                    description: "Clique sur l'icône de cadenas dans la barre d'adresse pour gérer les notifications",
                  });
                }
              } catch (error) {
                console.error('Error opening notification settings:', error);
                toast({
                  title: "Erreur",
                  description: "Impossible d'ouvrir les paramètres",
                  variant: "destructive",
                });
              }
            }}
            className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
          >
            <Bell className="w-4 h-4 mr-2" />
            Accéder aux autorisations de l'app
          </Button>
        </section>


        {/* Language */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
              <Globe className="w-4 h-4 text-primary-foreground" />
            </div>
            {t('language')}
          </h2>
          <div className="glass rounded-xl p-4">
            <div className="mb-3">
              <p className="font-semibold text-foreground text-sm mb-2">{t('language')}</p>
              <p className="text-xs text-muted-foreground mb-3">
                Choisis ta langue préférée
              </p>
            </div>
            <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
              <SelectTrigger className="glass border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-strong border-border">
                <SelectItem value="fr">{t('french')}</SelectItem>
                <SelectItem value="en">{t('english')}</SelectItem>
                <SelectItem value="es">{t('spanish')}</SelectItem>
                <SelectItem value="de">{t('german')}</SelectItem>
                <SelectItem value="it">{t('italian')}</SelectItem>
              </SelectContent>
            </Select>
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
          <div className="glass rounded-xl p-4 space-y-4">
            <div>
              <p className="font-semibold text-foreground text-sm mb-2">Mode d'affichage</p>
              <p className="text-xs text-muted-foreground mb-3">
                Choisis entre le mode clair ou sombre
              </p>
            </div>
            <div className="flex gap-2">
              {([
                { mode: "light" as AppearanceMode, icon: Sun, label: "Clair" },
                { mode: "dark" as AppearanceMode, icon: Moon, label: "Sombre" },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => {
                    setCurrentAppearance(mode);
                    applyAppearance(mode);
                    toast({ title: "Mode changé", description: `Mode ${label.toLowerCase()} activé` });
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg transition-all ${
                    currentAppearance === mode
                      ? "bg-primary/20 border-2 border-primary text-primary font-semibold"
                      : "glass border-2 border-transparent text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

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
              onClick={() => toast({ title: "Support", description: "Contactez-nous à support@timeritual.app" })}
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
