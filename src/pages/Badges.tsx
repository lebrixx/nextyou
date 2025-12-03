import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Award, Trophy, Target, Flame, Star, Zap, ArrowLeft, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";

interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  unlocked_at: string;
}

const badgeIcons: Record<string, any> = {
  first_day: Star,
  week_streak: Flame,
  month_streak: Trophy,
  perfect_week: Target,
  hundred_days: Award,
  dedication: Zap,
};

const badgeColors: Record<string, string> = {
  first_day: "text-yellow-500",
  week_streak: "text-orange-500",
  month_streak: "text-purple-500",
  perfect_week: "text-blue-500",
  hundred_days: "text-emerald-500",
  dedication: "text-pink-500",
};

const allBadgeTypes = [
  { type: 'first_day', name: 'Premier Jour', description: 'Complète ta première habitude' },
  { type: 'week_streak', name: '7 Jours', description: 'Série de 7 jours' },
  { type: 'month_streak', name: '30 Jours', description: 'Série de 30 jours' },
  { type: 'perfect_week', name: 'Semaine Parfaite', description: 'Toutes les habitudes pendant 7 jours' },
  { type: 'hundred_days', name: '100 Jours', description: 'Série de 100 jours' },
  { type: 'dedication', name: 'Dévouement', description: '10 habitudes différentes complétées' },
];

const Badges = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      
      const { data: badgesData } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id);
      setBadges(badgesData || []);
    }
    setLoading(false);
  };

  const unlockedTypes = new Set(badges.map(b => b.badge_type));
  const unlockedCount = unlockedTypes.size;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-6 relative">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="sm"
          className="absolute top-8 left-6 w-10 h-10 p-0 rounded-full glass"
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

        <div className="text-center pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <Trophy className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Mes <span className="bg-gradient-primary bg-clip-text text-transparent">Badges</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {unlockedCount} / {allBadgeTypes.length} badges débloqués
          </p>
        </div>
      </header>

      <main className="px-6 space-y-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="glass rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        ) : !user ? (
          <div className="glass rounded-2xl p-8 text-center space-y-4 border border-white/10">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-bold text-foreground">Connecte-toi</h3>
            <p className="text-muted-foreground text-sm">
              Connecte-toi pour voir et débloquer tes badges
            </p>
            <Button
              onClick={() => navigate("/auth")}
              className="bg-gradient-primary text-primary-foreground shadow-glow"
            >
              Se connecter
            </Button>
          </div>
        ) : (
          <>
            {/* Progress */}
            <div className="glass rounded-2xl p-4 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Progression</p>
                <p className="text-sm text-primary font-bold">{Math.round((unlockedCount / allBadgeTypes.length) * 100)}%</p>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${(unlockedCount / allBadgeTypes.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 gap-3">
              {allBadgeTypes.map(({ type, name, description }) => {
                const isUnlocked = unlockedTypes.has(type);
                const Icon = badgeIcons[type] || Award;
                const colorClass = badgeColors[type] || "text-gray-500";
                
                return (
                  <Card
                    key={type}
                    className={`p-4 flex flex-col items-center text-center transition-all duration-300 ${
                      isUnlocked 
                        ? 'glass border-primary/30 shadow-glow hover:scale-105' 
                        : 'bg-muted/10 border-muted/20 opacity-60'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${
                      isUnlocked ? 'bg-gradient-primary shadow-glow' : 'bg-muted/30'
                    }`}>
                      <Icon className={`w-7 h-7 ${isUnlocked ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                    </div>
                    <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {name}
                    </h4>
                    <p className="text-xs text-muted-foreground">{description}</p>
                    {isUnlocked && (
                      <span className="mt-2 text-xs text-primary font-medium">✓ Débloqué</span>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default Badges;
