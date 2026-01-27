import { TrendingUp, TrendingDown, Minus } from "lucide-react";

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
            <p className="text-[10px] font-medium text-foreground">{config.label}</p>
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
