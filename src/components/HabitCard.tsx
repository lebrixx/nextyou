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
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-elevation transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-4xl">{emoji}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                {streak} jours consécutifs
              </span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => onToggle(id)}
          variant="ghost"
          size="icon"
          className={`w-12 h-12 rounded-full transition-all ${
            completed
              ? "bg-primary hover:bg-primary-dark text-primary-foreground"
              : "hover:bg-secondary"
          }`}
        >
          {completed ? (
            <CheckCircle2 className="w-6 h-6" />
          ) : (
            <Circle className="w-6 h-6" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default HabitCard;
