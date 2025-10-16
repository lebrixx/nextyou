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
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary transition-all hover:shadow-elevation group">
      <div className="flex items-start justify-between mb-3">
        <div className="p-3 rounded-xl bg-gradient-glow">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              trendUp
                ? "bg-success/10 text-success"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
        {value}
      </p>
    </div>
  );
};

export default StatsCard;
