import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

interface AnimatedStatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
  suffix?: string;
}

const AnimatedStatsCard = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  trendUp,
  delay = 0,
  suffix = ""
}: AnimatedStatsCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        delay, 
        duration: 0.4, 
        type: "spring", 
        stiffness: 200, 
        damping: 20 
      }}
      whileHover={{ 
        scale: 1.03, 
        transition: { duration: 0.2 } 
      }}
      className="glass rounded-xl p-4 transition-all duration-300 hover:shadow-elevation group border border-white/5 hover:border-primary/30 cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <motion.div 
          className="p-2.5 rounded-lg bg-gradient-primary shadow-glow"
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
        >
          <Icon className="w-4 h-4 text-primary-foreground" />
        </motion.div>
        {trend && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.2 }}
            className={`text-[10px] font-bold px-2 py-1 rounded-lg backdrop-blur-sm border ${
              trendUp
                ? "bg-success/20 text-success border-success/30"
                : "bg-destructive/20 text-destructive border-destructive/30"
            }`}
          >
            {trend}
          </motion.span>
        )}
      </div>
      <p className="text-muted-foreground text-[10px] mb-2 font-semibold uppercase tracking-wider">{label}</p>
      <div className="flex items-baseline gap-0.5">
        <AnimatedCounter 
          value={value} 
          className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors"
        />
        {suffix && (
          <span className="text-xl font-semibold text-muted-foreground">{suffix}</span>
        )}
      </div>
    </motion.div>
  );
};

export default AnimatedStatsCard;
