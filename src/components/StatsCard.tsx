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
    <div className="glass rounded-2xl p-6 hover:border-primary/30 transition-all duration-300 hover:shadow-elevation group hover:scale-105">
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-primary shadow-glow">
          <Icon className="w-6 h-6 text-primary-foreground drop-shadow-lg" />
        </div>
        {trend && (
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm ${
              trendUp
                ? "bg-success/20 text-success border border-success/30"
                : "bg-destructive/20 text-destructive border border-destructive/30"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-2 font-medium">{label}</p>
      <p className="text-4xl font-bold text-foreground group-hover:text-primary transition-colors drop-shadow-lg">
        {value}
      </p>
    </div>
  );
};

export default StatsCard;
