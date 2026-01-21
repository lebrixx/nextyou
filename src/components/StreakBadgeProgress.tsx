import { Award, Lock } from 'lucide-react';

interface StreakBadgeProgressProps {
  currentStreak: number;
  bestStreak: number;
}

const STREAK_MILESTONES = [
  { days: 7, name: 'Duo en Feu', emoji: '🔥', color: 'from-orange-500 to-amber-500' },
  { days: 14, name: 'Partenaires', emoji: '🤝', color: 'from-orange-500 to-yellow-500' },
  { days: 30, name: 'Inséparables', emoji: '💫', color: 'from-red-500 to-orange-500' },
  { days: 100, name: 'Âmes Sœurs', emoji: '💎', color: 'from-purple-500 to-pink-500' },
];

export const StreakBadgeProgress = ({ currentStreak, bestStreak }: StreakBadgeProgressProps) => {
  // Find next milestone
  const nextMilestone = STREAK_MILESTONES.find(m => bestStreak < m.days);
  const unlockedMilestones = STREAK_MILESTONES.filter(m => bestStreak >= m.days);
  
  if (!nextMilestone && unlockedMilestones.length === STREAK_MILESTONES.length) {
    // All badges unlocked
    return (
      <div className="flex items-center gap-1 text-xs text-purple-400">
        <Award className="w-3 h-3" />
        <span>Tous les badges débloqués ! 💎</span>
      </div>
    );
  }

  const progressToNext = nextMilestone 
    ? Math.min((currentStreak / nextMilestone.days) * 100, 100)
    : 100;

  return (
    <div className="space-y-2">
      {/* Next badge progress */}
      {nextMilestone && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Prochain : {nextMilestone.name}
              </span>
              <span className="text-muted-foreground">
                {currentStreak}/{nextMilestone.days}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${nextMilestone.color} transition-all duration-500`}
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
          <span className="text-lg">{nextMilestone.emoji}</span>
        </div>
      )}

      {/* Unlocked badges */}
      {unlockedMilestones.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {unlockedMilestones.map((milestone) => (
            <div
              key={milestone.days}
              className={`px-2 py-0.5 rounded-full bg-gradient-to-r ${milestone.color} text-white text-[10px] font-medium flex items-center gap-1`}
              title={milestone.name}
            >
              <span>{milestone.emoji}</span>
              <span>{milestone.days}j</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
