import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrendIndicatorProps {
  direction: 'up' | 'down' | 'stable';
  percentChange: number;
  diff: number;
}

const TrendIndicator = ({ direction, percentChange, diff }: TrendIndicatorProps) => {
  const configs = {
    up: {
      icon: TrendingUp,
      color: 'text-green-500',
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      label: 'En hausse'
    },
    down: {
      icon: TrendingDown,
      color: 'text-destructive',
      bg: 'bg-destructive/20',
      border: 'border-destructive/30',
      label: 'En baisse'
    },
    stable: {
      icon: Minus,
      color: 'text-muted-foreground',
      bg: 'bg-muted/20',
      border: 'border-muted/30',
      label: 'Stable'
    }
  };

  const config = configs[direction];
  const Icon = config.icon;

  return (
    <div className={`glass rounded-lg p-2.5 ${config.bg} border ${config.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color}`} />
          <div>
            <div className="flex items-center gap-1">
              <p className="text-[10px] font-medium text-foreground">{config.label}</p>
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-muted/50 hover:bg-muted transition-colors">
                      <Info className="w-2 h-2 text-muted-foreground" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent 
                    side="top" 
                    className="max-w-[220px] p-2.5 bg-popover border border-border shadow-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-[10px] text-foreground">Tendance hebdomadaire</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Compare tes performances des 7 derniers jours à celles de la semaine précédente. 
                        {direction === 'up' && " Tu progresses, continue !"}
                        {direction === 'down' && " Ne te décourage pas, chaque jour est une nouvelle chance."}
                        {direction === 'stable' && " Tu maintiens un bon rythme."}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-[9px] text-muted-foreground">vs semaine dernière</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${config.color}`}>
            {direction === 'up' ? '+' : direction === 'down' ? '-' : ''}{percentChange}%
          </p>
          <p className="text-[9px] text-muted-foreground">
            {Math.abs(diff)}% / jour
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrendIndicator;
