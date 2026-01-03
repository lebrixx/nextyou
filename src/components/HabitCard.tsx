import { CheckCircle2, Circle, Flame, Swords } from "lucide-react";
import { Button } from "./ui/button";
import HabitIcon, { HabitIconType } from "./HabitIcon";
import { TwoMinuteRuleBadge } from "./TwoMinuteRuleBadge";
import { useTranslation } from "@/lib/i18n";

interface HabitCardProps {
  id: string;
  name: string;
  icon: HabitIconType;
  streak: number;
  completed: boolean;
  onToggle: (id: string) => void;
  onClick?: () => void;
  habit?: any;
  completions?: any[];
  onUpdate?: () => void;
  isDuelHabit?: boolean;
  duelTitle?: string;
}

const HabitCard = ({ id, name, icon, streak, completed, onToggle, onClick, habit, completions = [], onUpdate, isDuelHabit, duelTitle }: HabitCardProps) => {
  const { t } = useTranslation();
  
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on the toggle button
    if ((e.target as HTMLElement).closest('button')) return;
    onClick?.();
  };
  
  return (
    <div 
      className={`glass rounded-xl p-4 transition-all duration-300 border cursor-pointer ${
        isDuelHabit 
          ? completed
            ? "opacity-60 border-red-500/30 bg-red-500/5"
            : "border-red-500/40 bg-gradient-to-br from-red-500/10 to-orange-500/5 hover:border-red-500/60"
          : completed 
            ? "opacity-60 border-primary/30 bg-primary/5" 
            : "hover:shadow-elevation hover:scale-[1.01] border-white/5"
      } group`}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-glow transition-all duration-300 ${
            isDuelHabit
              ? completed 
                ? "bg-red-500/30" 
                : "bg-gradient-to-br from-red-500 to-orange-500 group-hover:scale-105"
              : completed 
                ? "bg-primary/30" 
                : "bg-gradient-primary group-hover:scale-105"
          }`}>
            <HabitIcon type={icon} className={`w-5 h-5 transition-opacity ${
              completed ? (isDuelHabit ? "text-red-400/70" : "text-primary/70") : "text-primary-foreground"
            }`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className={`font-bold text-base mb-0.5 transition-colors ${
                completed 
                  ? "text-muted-foreground line-through" 
                  : isDuelHabit 
                    ? "text-foreground group-hover:text-red-400"
                    : "text-foreground group-hover:text-primary"
              }`}>
                {name}
              </h3>
              {isDuelHabit && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400">
                  <Swords className="w-3 h-3" />
                  Duel
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Flame className={`w-4 h-4 ${completed ? (isDuelHabit ? "text-red-400/50" : "text-primary/50") : (isDuelHabit ? "text-red-400" : "text-primary")}`} />
                <span className={`text-xs font-semibold ${
                  completed ? "text-muted-foreground/70" : "text-muted-foreground"
                }`}>
                  {streak} {t('days')}
                </span>
              </div>
              {duelTitle && (
                <span className="text-[10px] text-muted-foreground">
                  • {duelTitle}
                </span>
              )}
              {habit && <TwoMinuteRuleBadge habit={habit} completions={completions} onUpdate={onUpdate} />}
            </div>
          </div>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
          variant="ghost"
          size="icon"
          className={`w-10 h-10 rounded-lg transition-all duration-300 ${
            isDuelHabit
              ? completed
                ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                : "hover:bg-red-500/20 backdrop-blur-sm border border-red-500/30"
              : completed
                ? "bg-primary hover:bg-primary-dark text-primary-foreground shadow-glow"
                : "hover:bg-white/10 backdrop-blur-sm border border-white/10"
          }`}
        >
          {completed ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <Circle className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default HabitCard;
