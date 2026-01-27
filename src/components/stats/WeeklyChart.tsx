import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import SectionHeader from "./SectionHeader";

interface DayStats {
  date: string;
  dayName: string;
  completions: number;
  total: number;
  rate: number;
}

interface WeeklyChartProps {
  data: DayStats[];
}

const WeeklyChart = ({ data }: WeeklyChartProps) => {
  const chartConfig = {
    rate: {
      label: "Taux",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="glass rounded-xl p-3 border border-primary/10">
      <div className="flex items-center justify-between mb-2">
        <SectionHeader 
          title="7 derniers jours" 
          tooltip={{
            title: "Progression hebdomadaire",
            description: "Cette courbe montre ton taux de complétion quotidien sur les 7 derniers jours. Elle te permet de voir si tu es régulier ou si tu as des baisses de motivation.",
            period: "7 derniers jours"
          }}
        />
        <span className="text-[10px] text-muted-foreground">Taux de complétion</span>
      </div>
      <ChartContainer config={chartConfig} className="h-[100px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="dayName" 
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
              formatter={(value: number) => [`${value}%`, 'Taux']}
            />
            <Area 
              type="monotone"
              dataKey="rate"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#colorRate)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default WeeklyChart;
