import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-foreground">{config.label}</p>
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-primary/15 hover:bg-primary/25 active:bg-primary/35 border border-primary/25 transition-all touch-manipulation min-h-[28px]"
                    aria-label="Info tendance"
                  >
                    <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-[9px] font-medium text-primary/90">?</span>
                  </button>
                </PopoverTrigger>
                <PopoverContent 
                  side="top" 
                  align="start"
                  className="w-[240px] p-3 bg-popover border border-border shadow-lg z-50"
                  sideOffset={8}
                >
                  <div className="space-y-1.5">
                    <p className="font-semibold text-xs text-foreground">Tendance hebdomadaire</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Compare tes performances des 7 derniers jours à celles de la semaine précédente. 
                      {direction === 'up' && " Tu progresses, continue !"}
                      {direction === 'down' && " Ne te décourage pas, chaque jour est une nouvelle chance."}
                      {direction === 'stable' && " Tu maintiens un bon rythme."}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
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
