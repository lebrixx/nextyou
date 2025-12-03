import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Award, Trophy, Target, Flame, Star, Zap, ArrowLeft, Crown,
  Rocket, Calendar, Medal, Heart, Shield, Sparkles, TrendingUp,
  Clock, Gift, Sun, Moon, Users, Gem, BadgeCheck, Infinity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { badgeRules } from "@/hooks/useBadges";

interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  unlocked_at: string;
}

const badgeIcons: Record<string, any> = {
  // Simples
  first_day: Star,
  getting_started: Rocket,
  habit_creator: Sparkles,
  three_day_streak: Flame,
  first_week: Calendar,
  // Intermédiaires
  week_streak: Flame,
  two_weeks: TrendingUp,
  three_weeks: Medal,
  month_streak: Trophy,
  fifty_completions: Target,
  dedication: Zap,
  perfect_week: BadgeCheck,
  // Difficiles
  hundred_completions: Award,
  sixty_days: Shield,
  hundred_days: Gem,
  five_hundred_completions: Crown,
  year_streak: Infinity,
  thousand_completions: Trophy,
  // Émotionnels
  resilience_return: Heart,
  resilience_after_break: Sun,
  hard_week_survivor: Shield,
  low_energy_push: Zap,
  comeback_king: Crown,
};

const badgeColors: Record<string, string> = {
  // Simples - Couleurs douces
  first_day: "from-yellow-400 to-yellow-600",
  getting_started: "from-blue-400 to-blue-600",
  habit_creator: "from-pink-400 to-pink-600",
  three_day_streak: "from-orange-400 to-orange-600",
  first_week: "from-green-400 to-green-600",
  // Intermédiaires - Couleurs vives
  week_streak: "from-orange-500 to-red-500",
  two_weeks: "from-teal-400 to-teal-600",
  three_weeks: "from-indigo-400 to-indigo-600",
  month_streak: "from-purple-500 to-purple-700",
  fifty_completions: "from-cyan-400 to-cyan-600",
  dedication: "from-pink-500 to-rose-600",
  perfect_week: "from-emerald-400 to-emerald-600",
  // Difficiles - Couleurs riches
  hundred_completions: "from-amber-500 to-amber-700",
  sixty_days: "from-slate-500 to-slate-700",
  hundred_days: "from-violet-500 to-violet-700",
  five_hundred_completions: "from-yellow-500 to-amber-600",
  year_streak: "from-rose-500 to-rose-700",
  thousand_completions: "from-yellow-400 via-yellow-500 to-amber-600",
  // Émotionnels
  resilience_return: "from-red-400 to-red-600",
  resilience_after_break: "from-orange-400 to-yellow-500",
  hard_week_survivor: "from-gray-500 to-gray-700",
  low_energy_push: "from-purple-400 to-purple-600",
  comeback_king: "from-yellow-500 to-orange-600",
};

const badgeDifficulty: Record<string, string> = {
  first_day: "Facile",
  getting_started: "Facile",
  habit_creator: "Facile",
  three_day_streak: "Facile",
  first_week: "Facile",
  week_streak: "Moyen",
  two_weeks: "Moyen",
  three_weeks: "Moyen",
  month_streak: "Moyen",
  fifty_completions: "Moyen",
  dedication: "Moyen",
  perfect_week: "Moyen",
  hundred_completions: "Difficile",
  sixty_days: "Difficile",
  hundred_days: "Difficile",
  five_hundred_completions: "Très difficile",
  year_streak: "Légendaire",
  thousand_completions: "Légendaire",
  resilience_return: "Spécial",
  resilience_after_break: "Spécial",
  hard_week_survivor: "Spécial",
  low_energy_push: "Spécial",
  comeback_king: "Spécial",
};

const difficultyColors: Record<string, string> = {
  "Facile": "text-green-500",
  "Moyen": "text-yellow-500",
  "Difficile": "text-orange-500",
  "Très difficile": "text-red-500",
  "Légendaire": "text-purple-500",
  "Spécial": "text-pink-500",
};

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
  const totalBadges = badgeRules.length;

  // Group badges by difficulty
  const groupedBadges = {
    easy: badgeRules.filter(b => ["Facile"].includes(badgeDifficulty[b.type])),
    medium: badgeRules.filter(b => ["Moyen"].includes(badgeDifficulty[b.type])),
    hard: badgeRules.filter(b => ["Difficile", "Très difficile", "Légendaire"].includes(badgeDifficulty[b.type])),
    special: badgeRules.filter(b => badgeDifficulty[b.type] === "Spécial"),
  };

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
            {unlockedCount} / {totalBadges} badges débloqués
          </p>
        </div>
      </header>

      <main className="px-6 space-y-6 max-w-2xl mx-auto">
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
                <p className="text-sm font-medium text-foreground">Progression totale</p>
                <p className="text-sm text-primary font-bold">{Math.round((unlockedCount / totalBadges) * 100)}%</p>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-primary rounded-full transition-all duration-500"
                  style={{ width: `${(unlockedCount / totalBadges) * 100}%` }}
                />
              </div>
            </div>

            {/* Easy Badges */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-green-500" />
                Badges Faciles
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {groupedBadges.easy.map(({ type, name, description }) => {
                  const isUnlocked = unlockedTypes.has(type);
                  const Icon = badgeIcons[type] || Award;
                  const gradient = badgeColors[type] || "from-gray-400 to-gray-600";
                  
                  return (
                    <Card
                      key={type}
                      className={`p-3 flex flex-col items-center text-center transition-all duration-300 ${
                        isUnlocked 
                          ? 'glass border-primary/30 shadow-glow hover:scale-105' 
                          : 'bg-muted/10 border-muted/20 opacity-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isUnlocked ? `bg-gradient-to-br ${gradient} shadow-lg` : 'bg-muted/30'
                      }`}>
                        <Icon className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <h4 className={`font-bold text-xs mb-0.5 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Medium Badges */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Medal className="w-5 h-5 text-yellow-500" />
                Badges Moyens
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {groupedBadges.medium.map(({ type, name, description }) => {
                  const isUnlocked = unlockedTypes.has(type);
                  const Icon = badgeIcons[type] || Award;
                  const gradient = badgeColors[type] || "from-gray-400 to-gray-600";
                  
                  return (
                    <Card
                      key={type}
                      className={`p-3 flex flex-col items-center text-center transition-all duration-300 ${
                        isUnlocked 
                          ? 'glass border-primary/30 shadow-glow hover:scale-105' 
                          : 'bg-muted/10 border-muted/20 opacity-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isUnlocked ? `bg-gradient-to-br ${gradient} shadow-lg` : 'bg-muted/30'
                      }`}>
                        <Icon className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <h4 className={`font-bold text-xs mb-0.5 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Hard Badges */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Gem className="w-5 h-5 text-purple-500" />
                Badges Difficiles
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {groupedBadges.hard.map(({ type, name, description }) => {
                  const isUnlocked = unlockedTypes.has(type);
                  const Icon = badgeIcons[type] || Award;
                  const gradient = badgeColors[type] || "from-gray-400 to-gray-600";
                  const difficulty = badgeDifficulty[type];
                  
                  return (
                    <Card
                      key={type}
                      className={`p-3 flex flex-col items-center text-center transition-all duration-300 ${
                        isUnlocked 
                          ? 'glass border-primary/30 shadow-glow hover:scale-105' 
                          : 'bg-muted/10 border-muted/20 opacity-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isUnlocked ? `bg-gradient-to-br ${gradient} shadow-lg` : 'bg-muted/30'
                      }`}>
                        <Icon className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <h4 className={`font-bold text-xs mb-0.5 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
                      <span className={`text-[9px] mt-1 font-medium ${difficultyColors[difficulty]}`}>
                        {difficulty}
                      </span>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Special Badges */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Badges Spéciaux
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {groupedBadges.special.map(({ type, name, description }) => {
                  const isUnlocked = unlockedTypes.has(type);
                  const Icon = badgeIcons[type] || Award;
                  const gradient = badgeColors[type] || "from-gray-400 to-gray-600";
                  
                  return (
                    <Card
                      key={type}
                      className={`p-3 flex flex-col items-center text-center transition-all duration-300 ${
                        isUnlocked 
                          ? 'glass border-primary/30 shadow-glow hover:scale-105' 
                          : 'bg-muted/10 border-muted/20 opacity-50'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                        isUnlocked ? `bg-gradient-to-br ${gradient} shadow-lg` : 'bg-muted/30'
                      }`}>
                        <Icon className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <h4 className={`font-bold text-xs mb-0.5 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default Badges;
