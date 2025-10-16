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
    <div className="glass rounded-[24px] p-7 hover:border-primary/30 transition-all duration-300 hover:shadow-elevation group hover:scale-[1.02] border border-white/5">
      <div className="flex items-start justify-between mb-5">
        <div className="p-4 rounded-2xl bg-gradient-primary shadow-glow">
          <Icon className="w-7 h-7 text-primary-foreground drop-shadow-lg" />
        </div>
        {trend && (
          <span
            className={`text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-sm border ${
              trendUp
                ? "bg-success/20 text-success border-success/30"
                : "bg-destructive/20 text-destructive border-destructive/30"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-3 font-semibold uppercase tracking-wider">{label}</p>
      <p className="text-5xl font-bold text-foreground group-hover:text-primary transition-colors drop-shadow-lg">
        {value}
      </p>
    </div>
  );
};

export default StatsCard;
