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
    <div className={`glass rounded-xl p-4 transition-all duration-300 border ${
      completed 
        ? "opacity-60 border-primary/30 bg-primary/5" 
        : "hover:shadow-elevation hover:scale-[1.01] border-white/5"
    } group`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-glow transition-all duration-300 ${
            completed 
              ? "bg-primary/30" 
              : "bg-gradient-primary group-hover:scale-105"
          }`}>
            <HabitIcon type={icon} className={`w-5 h-5 transition-opacity ${
              completed ? "text-primary/70" : "text-primary-foreground"
            }`} />
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-base mb-0.5 transition-colors ${
              completed 
                ? "text-muted-foreground line-through" 
                : "text-foreground group-hover:text-primary"
            }`}>
              {name}
            </h3>
            <div className="flex items-center gap-1.5">
              <Flame className={`w-4 h-4 ${completed ? "text-primary/50" : "text-primary"}`} />
              <span className={`text-xs font-semibold ${
                completed ? "text-muted-foreground/70" : "text-muted-foreground"
              }`}>
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
