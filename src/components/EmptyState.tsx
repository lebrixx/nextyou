import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: "default" | "minimal";
}

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  variant = "default" 
}: EmptyStateProps) => {
  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-3">
          <Icon className="w-6 h-6 text-muted-foreground/50" />
        </div>
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-xs text-muted-foreground/70">{description}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="mt-3 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
          >
            {action.label} →
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl p-8 text-center border border-white/5 relative overflow-hidden"
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-b from-primary/20 to-transparent blur-3xl" />
      </div>
      
      <div className="relative z-10">
        {/* Animated icon container */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-20 h-20 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center mx-auto mb-5 border border-white/5"
        >
          <motion.div
            animate={{ 
              y: [0, -4, 0],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Icon className="w-10 h-10 text-muted-foreground/40" />
          </motion.div>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-semibold text-foreground mb-2"
        >
          {title}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed"
        >
          {description}
        </motion.p>

        {action && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={action.onClick}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium transition-colors border border-primary/20"
          >
            {action.label}
            <span className="text-lg">→</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
