import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";

interface DayOfWeekStats {
  day: string;
  dayShort: string;
  avgRate: number;
  totalCompletions: number;
  count: number;
}

interface DayOfWeekChartProps {
  data: DayOfWeekStats[];
  bestDay: DayOfWeekStats | null;
  worstDay: DayOfWeekStats | null;
}

const DayOfWeekChart = ({ data, bestDay, worstDay }: DayOfWeekChartProps) => {
  const chartConfig = {
    avgRate: {
      label: "Taux moyen",
      color: "hsl(var(--primary))",
    },
  };

  const getBarColor = (dayShort: string) => {
    if (bestDay && dayShort === bestDay.dayShort) return "hsl(142 76% 46%)";
    if (worstDay && dayShort === worstDay.dayShort) return "hsl(var(--destructive))";
    return "hsl(var(--primary))";
  };

  return (
    <div className="glass rounded-xl p-3 border border-primary/10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-foreground">Performance par jour</h3>
        <div className="flex items-center gap-2 text-[9px]">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Meilleur
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-destructive"></div>
            Plus faible
          </span>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="h-[100px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <XAxis 
              dataKey="dayShort" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={9}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={8}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: number) => [`${value}%`, 'Taux moyen']}
            />
            <Bar dataKey="avgRate" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.dayShort)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
      
      {bestDay && worstDay && (
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-border/30">
          <div className="text-center">
            <p className="text-[9px] text-muted-foreground uppercase">Meilleur jour</p>
            <p className="text-sm font-bold text-green-500">{bestDay.day}</p>
            <p className="text-[10px] text-muted-foreground">{bestDay.avgRate}% en moyenne</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] text-muted-foreground uppercase">À améliorer</p>
            <p className="text-sm font-bold text-destructive">{worstDay.day}</p>
            <p className="text-[10px] text-muted-foreground">{worstDay.avgRate}% en moyenne</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DayOfWeekChart;
