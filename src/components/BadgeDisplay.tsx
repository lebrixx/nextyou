import { Award, Trophy, Target, Flame, Star, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

export interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  unlocked_at: string;
}

interface BadgeDisplayProps {
  badges: Badge[];
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

const BadgeDisplay = ({ badges }: BadgeDisplayProps) => {
  const allBadgeTypes = [
    { type: 'first_day', name: 'Premier Jour', description: 'Complète ta première habitude' },
    { type: 'week_streak', name: '7 Jours', description: 'Série de 7 jours' },
    { type: 'month_streak', name: '30 Jours', description: 'Série de 30 jours' },
    { type: 'perfect_week', name: 'Semaine Parfaite', description: 'Toutes les habitudes pendant 7 jours' },
    { type: 'hundred_days', name: '100 Jours', description: 'Série de 100 jours' },
    { type: 'dedication', name: 'Dévouement', description: '10 habitudes différentes complétées' },
  ];

  const unlockedTypes = new Set(badges.map(b => b.badge_type));

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        🏆 Mes Badges
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {allBadgeTypes.map(({ type, name, description }) => {
          const isUnlocked = unlockedTypes.has(type);
          const Icon = badgeIcons[type] || Award;
          const colorClass = badgeColors[type] || "text-gray-500";
          
          return (
            <Card
              key={type}
              className={`p-4 flex flex-col items-center text-center transition-all duration-300 ${
                isUnlocked 
                  ? 'bg-gradient-primary border-primary shadow-glow hover:scale-105' 
                  : 'bg-muted/20 border-muted opacity-50'
              }`}
            >
              <Icon className={`w-8 h-8 mb-2 ${isUnlocked ? colorClass : 'text-muted-foreground'}`} />
              <h4 className={`font-bold text-sm mb-1 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                {name}
              </h4>
              <p className="text-xs text-muted-foreground">{description}</p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeDisplay;