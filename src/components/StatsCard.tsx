import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
}

const StatsCard = ({ icon: Icon, label, value, trend, trendUp }: StatsCardProps) => {
  return (
    <div className="glass rounded-xl p-4 hover:border-primary/30 transition-all duration-300 hover:shadow-elevation group hover:scale-[1.02] border border-white/5">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-lg bg-gradient-primary shadow-glow">
          <Icon className="w-4 h-4 text-primary-foreground" />
        </div>
        {trend && (
          <span
            className={`text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm border ${
              trendUp
                ? "bg-success/20 text-success border-success/30"
                : "bg-destructive/20 text-destructive border-destructive/30"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-[10px] mb-2 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
        {value}
      </p>
    </div>
  );
};

export default StatsCard;
