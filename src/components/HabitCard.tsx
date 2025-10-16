import { CheckCircle2, Circle, Flame } from "lucide-react";
import { Button } from "./ui/button";

interface HabitCardProps {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  completed: boolean;
  onToggle: (id: string) => void;
}

const HabitCard = ({ id, name, emoji, streak, completed, onToggle }: HabitCardProps) => {
  return (
    <div className="glass rounded-2xl p-6 hover:shadow-elevation transition-all duration-300 group hover:scale-[1.02]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-5xl filter drop-shadow-lg">{emoji}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-xl text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Flame className="w-4 h-4 text-primary drop-shadow-glow" />
              <span className="text-sm text-muted-foreground font-medium">
                {streak} jours consécutifs
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => onToggle(id)}
          variant="ghost"
          size="icon"
          className={`w-14 h-14 rounded-full transition-all duration-300 ${
            completed
              ? "bg-primary hover:bg-primary-dark text-primary-foreground shadow-glow scale-105"
              : "hover:bg-secondary/50 backdrop-blur-sm"
          }`}
        >
          {completed ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : (
            <Circle className="w-7 h-7" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default HabitCard;
