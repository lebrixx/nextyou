import { CheckCircle2, Circle, Flame } from "lucide-react";
import { Button } from "./ui/button";
import HabitIcon, { HabitIconType } from "./HabitIcon";

interface HabitCardProps {
  id: string;
  name: string;
  icon: HabitIconType;
  streak: number;
  completed: boolean;
  onToggle: (id: string) => void;
}

const HabitCard = ({ id, name, icon, streak, completed, onToggle }: HabitCardProps) => {
  return (
    <div className="glass rounded-xl p-4 hover:shadow-elevation transition-all duration-300 group hover:scale-[1.01] border border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
            <HabitIcon type={icon} className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors mb-0.5">
              {name}
            </h3>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-semibold">
                {streak} jours
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => onToggle(id)}
          variant="ghost"
          size="icon"
          className={`w-10 h-10 rounded-lg transition-all duration-300 ${
            completed
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
