interface DayStats {
  date: string;
  dayName: string;
  completions: number;
  total: number;
  rate: number;
}

interface MonthlyHeatmapProps {
  data: DayStats[];
}

const MonthlyHeatmap = ({ data }: MonthlyHeatmapProps) => {
  const getIntensityClass = (rate: number) => {
    if (rate === 0) return 'bg-muted/30';
    if (rate < 25) return 'bg-primary/20';
    if (rate < 50) return 'bg-primary/40';
    if (rate < 75) return 'bg-primary/60';
    if (rate < 100) return 'bg-primary/80';
    return 'bg-primary';
  };

  return (
    <div className="glass rounded-xl p-3 border border-primary/10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-foreground">30 derniers jours</h3>
        <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
          <span>0%</span>
          <div className="flex gap-0.5">
            <div className="w-2 h-2 rounded-sm bg-muted/30"></div>
            <div className="w-2 h-2 rounded-sm bg-primary/20"></div>
            <div className="w-2 h-2 rounded-sm bg-primary/40"></div>
            <div className="w-2 h-2 rounded-sm bg-primary/60"></div>
            <div className="w-2 h-2 rounded-sm bg-primary/80"></div>
            <div className="w-2 h-2 rounded-sm bg-primary"></div>
          </div>
          <span>100%</span>
        </div>
      </div>
      
      <div className="grid grid-cols-10 gap-1">
        {data.map((day, index) => (
          <div
            key={day.date}
            className={`aspect-square rounded-sm ${getIntensityClass(day.rate)} transition-all hover:ring-2 hover:ring-primary/50`}
            title={`${day.date}: ${day.rate}% (${day.completions}/${day.total})`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
        <div className="text-center flex-1">
          <p className="text-lg font-bold text-foreground">
            {data.filter(d => d.rate === 100).length}
          </p>
          <p className="text-[9px] text-muted-foreground">Jours parfaits</p>
        </div>
        <div className="w-px h-8 bg-border/30"></div>
        <div className="text-center flex-1">
          <p className="text-lg font-bold text-foreground">
            {data.filter(d => d.rate >= 50).length}
          </p>
          <p className="text-[9px] text-muted-foreground">Jours actifs</p>
        </div>
        <div className="w-px h-8 bg-border/30"></div>
        <div className="text-center flex-1">
          <p className="text-lg font-bold text-primary">
            {data.length > 0 ? Math.round(data.reduce((s, d) => s + d.rate, 0) / data.length) : 0}%
          </p>
          <p className="text-[9px] text-muted-foreground">Moyenne</p>
        </div>
      </div>
    </div>
  );
};

export default MonthlyHeatmap;
