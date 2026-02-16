import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Award, Trophy, Target, Flame, Star, Zap, Crown,
  Rocket, Calendar, Medal, Heart, Shield, Sparkles, TrendingUp,
  Clock, Gift, Sun, Moon, Users, Gem, BadgeCheck, Infinity,
  Coffee, Sunrise, Sunset, Timer, Brain, Dumbbell, Book,
  Mountain, Diamond, Swords, Castle, Bird, Leaf, Wind
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
  // Faciles
  first_day: Star,
  getting_started: Rocket,
  habit_creator: Sparkles,
  three_day_streak: Flame,
  first_week: Calendar,
  ten_completions: Target,
  early_bird: Sunrise,
  night_owl: Moon,
  five_habits: Zap,
  weekend_warrior: Swords,
  // Moyens
  week_streak: Flame,
  two_weeks: TrendingUp,
  three_weeks: Medal,
  month_streak: Trophy,
  fifty_completions: Target,
  dedication: Brain,
  perfect_week: BadgeCheck,
  twenty_five_completions: Gift,
  morning_routine: Coffee,
  consistency_king: Crown,
  multi_tasker: Dumbbell,
  forty_five_days: Calendar,
  category_master: Book,
  streak_saver: Clock,
  two_hundred_completions: Medal,
  // Difficiles
  hundred_completions: Award,
  sixty_days: Shield,
  ninety_days: Mountain,
  hundred_days: Gem,
  three_hundred_completions: Swords,
  perfect_month: Trophy,
  fifteen_habits: Sparkles,
  four_months: Castle,
  six_months: Diamond,
  daily_champion: Crown,
  // Très difficiles
  five_hundred_completions: Crown,
  nine_months: Mountain,
  seven_hundred_completions: Diamond,
  twenty_habits: Brain,
  perfect_quarter: Trophy,
  // Légendaires
  year_streak: Infinity,
  thousand_completions: Trophy,
  two_thousand_completions: Diamond,
  five_hundred_days: Infinity,
  ultimate_master: Crown,
  // Spéciaux
  resilience_return: Heart,
  resilience_after_break: Bird,
  hard_week_survivor: Shield,
  low_energy_push: Zap,
  comeback_king: Crown,
  // Streak Mutuel
  friend_streak_7: Flame,
  friend_streak_14: Users,
  friend_streak_30: Heart,
  friend_streak_100: Diamond,
};

const badgeColors: Record<string, string> = {
  // Faciles - Couleurs douces
  first_day: "from-yellow-400 to-yellow-600",
  getting_started: "from-blue-400 to-blue-600",
  habit_creator: "from-pink-400 to-pink-600",
  three_day_streak: "from-orange-400 to-orange-600",
  first_week: "from-green-400 to-green-600",
  ten_completions: "from-cyan-400 to-cyan-600",
  early_bird: "from-amber-400 to-orange-500",
  night_owl: "from-indigo-400 to-purple-600",
  five_habits: "from-violet-400 to-violet-600",
  weekend_warrior: "from-red-400 to-red-600",
  // Moyens - Couleurs vives
  week_streak: "from-orange-500 to-red-500",
  two_weeks: "from-teal-400 to-teal-600",
  three_weeks: "from-indigo-400 to-indigo-600",
  month_streak: "from-purple-500 to-purple-700",
  fifty_completions: "from-cyan-400 to-cyan-600",
  dedication: "from-pink-500 to-rose-600",
  perfect_week: "from-emerald-400 to-emerald-600",
  twenty_five_completions: "from-lime-400 to-lime-600",
  morning_routine: "from-amber-500 to-amber-700",
  consistency_king: "from-yellow-500 to-yellow-700",
  multi_tasker: "from-red-500 to-red-700",
  forty_five_days: "from-blue-500 to-blue-700",
  category_master: "from-fuchsia-400 to-fuchsia-600",
  streak_saver: "from-orange-400 to-red-500",
  two_hundred_completions: "from-teal-500 to-teal-700",
  // Difficiles - Couleurs riches
  hundred_completions: "from-amber-500 to-amber-700",
  sixty_days: "from-slate-500 to-slate-700",
  ninety_days: "from-stone-500 to-stone-700",
  hundred_days: "from-violet-500 to-violet-700",
  three_hundred_completions: "from-red-600 to-red-800",
  perfect_month: "from-emerald-500 to-emerald-700",
  fifteen_habits: "from-pink-500 to-pink-700",
  four_months: "from-blue-600 to-blue-800",
  six_months: "from-purple-600 to-purple-800",
  daily_champion: "from-yellow-500 to-orange-600",
  // Très difficiles
  five_hundred_completions: "from-yellow-500 to-amber-600",
  nine_months: "from-rose-500 to-rose-700",
  seven_hundred_completions: "from-violet-600 to-violet-800",
  twenty_habits: "from-indigo-600 to-indigo-800",
  perfect_quarter: "from-emerald-600 to-emerald-800",
  // Légendaires
  year_streak: "from-yellow-400 via-yellow-500 to-amber-600",
  thousand_completions: "from-yellow-400 via-amber-500 to-orange-600",
  two_thousand_completions: "from-purple-500 via-pink-500 to-red-500",
  five_hundred_days: "from-cyan-400 via-blue-500 to-purple-600",
  ultimate_master: "from-yellow-400 via-yellow-500 to-yellow-600",
  // Spéciaux
  resilience_return: "from-red-400 to-red-600",
  resilience_after_break: "from-orange-400 to-yellow-500",
  hard_week_survivor: "from-gray-500 to-gray-700",
  low_energy_push: "from-purple-400 to-purple-600",
  comeback_king: "from-yellow-500 to-orange-600",
  // Streak Mutuel
  friend_streak_7: "from-orange-400 to-amber-500",
  friend_streak_14: "from-orange-500 to-yellow-500",
  friend_streak_30: "from-red-500 to-orange-500",
  friend_streak_100: "from-purple-500 to-pink-500",
};

const badgeDifficulty: Record<string, string> = {
  // Faciles
  first_day: "Facile",
  getting_started: "Facile",
  habit_creator: "Facile",
  three_day_streak: "Facile",
  first_week: "Facile",
  ten_completions: "Facile",
  early_bird: "Facile",
  night_owl: "Facile",
  five_habits: "Facile",
  weekend_warrior: "Facile",
  // Moyens
  week_streak: "Moyen",
  two_weeks: "Moyen",
  three_weeks: "Moyen",
  month_streak: "Moyen",
  fifty_completions: "Moyen",
  dedication: "Moyen",
  perfect_week: "Moyen",
  twenty_five_completions: "Moyen",
  morning_routine: "Moyen",
  consistency_king: "Moyen",
  multi_tasker: "Moyen",
  forty_five_days: "Moyen",
  category_master: "Moyen",
  streak_saver: "Moyen",
  two_hundred_completions: "Moyen",
  // Difficiles
  hundred_completions: "Difficile",
  sixty_days: "Difficile",
  ninety_days: "Difficile",
  hundred_days: "Difficile",
  three_hundred_completions: "Difficile",
  perfect_month: "Difficile",
  fifteen_habits: "Difficile",
  four_months: "Difficile",
  six_months: "Difficile",
  daily_champion: "Difficile",
  // Très difficiles
  five_hundred_completions: "Très difficile",
  nine_months: "Très difficile",
  seven_hundred_completions: "Très difficile",
  twenty_habits: "Très difficile",
  perfect_quarter: "Très difficile",
  // Légendaires
  year_streak: "Légendaire",
  thousand_completions: "Légendaire",
  two_thousand_completions: "Légendaire",
  five_hundred_days: "Légendaire",
  ultimate_master: "Légendaire",
  // Spéciaux
  resilience_return: "Spécial",
  resilience_after_break: "Spécial",
  hard_week_survivor: "Spécial",
  low_energy_push: "Spécial",
  comeback_king: "Spécial",
  // Streak Mutuel
  friend_streak_7: "Social",
  friend_streak_14: "Social",
  friend_streak_30: "Social",
  friend_streak_100: "Social",
};

const difficultyColors: Record<string, string> = {
  "Facile": "text-green-500",
  "Moyen": "text-yellow-500",
  "Difficile": "text-orange-500",
  "Très difficile": "text-red-500",
  "Légendaire": "text-purple-500",
  "Spécial": "text-pink-500",
  "Social": "text-orange-500",
};

const Badges = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
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
    easy: badgeRules.filter(b => badgeDifficulty[b.type] === "Facile"),
    medium: badgeRules.filter(b => badgeDifficulty[b.type] === "Moyen"),
    hard: badgeRules.filter(b => badgeDifficulty[b.type] === "Difficile"),
    veryHard: badgeRules.filter(b => badgeDifficulty[b.type] === "Très difficile"),
    legendary: badgeRules.filter(b => badgeDifficulty[b.type] === "Légendaire"),
    special: badgeRules.filter(b => badgeDifficulty[b.type] === "Spécial"),
  };

  const renderBadgeGrid = (badges: typeof badgeRules, showDifficulty = false) => (
    <div className="grid grid-cols-2 gap-3">
      {badges.map(({ type, name, description }) => {
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
            {showDifficulty && (
              <span className={`text-[9px] mt-1 font-medium ${difficultyColors[difficulty]}`}>
                {difficulty}
              </span>
            )}
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-12 pb-6 relative">
        <Button
          onClick={() => navigate("/premium")}
          variant="ghost"
          size="sm"
          className="absolute top-12 right-6 w-10 h-10 p-0 rounded-full bg-gradient-primary shadow-glow hover:opacity-90"
        >
          <Crown className="w-5 h-5 text-primary-foreground" />
        </Button>

        <div className="text-center">
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
          <div className="glass rounded-2xl p-8 text-center space-y-4 border border-primary/10">
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
            <div className="glass rounded-2xl p-4 border border-primary/10">
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
              <p className="text-xs text-muted-foreground mt-2 text-center">
                {totalBadges} badges à débloquer au total
              </p>
            </div>

            {/* Easy Badges */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Star className="w-5 h-5 text-green-500" />
                Badges Faciles ({groupedBadges.easy.length})
              </h2>
              {renderBadgeGrid(groupedBadges.easy)}
            </div>

            {/* Medium Badges */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Medal className="w-5 h-5 text-yellow-500" />
                Badges Moyens ({groupedBadges.medium.length})
              </h2>
              {renderBadgeGrid(groupedBadges.medium)}
            </div>

            {/* Hard Badges */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-500" />
                Badges Difficiles ({groupedBadges.hard.length})
              </h2>
              {renderBadgeGrid(groupedBadges.hard, true)}
            </div>

            {/* Very Hard Badges */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Gem className="w-5 h-5 text-red-500" />
                Badges Très Difficiles ({groupedBadges.veryHard.length})
              </h2>
              {renderBadgeGrid(groupedBadges.veryHard, true)}
            </div>

            {/* Legendary Badges */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-500" />
                Badges Légendaires ({groupedBadges.legendary.length})
              </h2>
              {renderBadgeGrid(groupedBadges.legendary, true)}
            </div>

            {/* Special Badges */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Badges Spéciaux ({groupedBadges.special.length})
              </h2>
              {renderBadgeGrid(groupedBadges.special)}
            </div>
          </>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default Badges;