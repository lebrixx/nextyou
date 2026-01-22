import { motion } from "framer-motion";

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  labelPosition?: "inside" | "outside";
}

const AnimatedProgress = ({ 
  value, 
  max = 100, 
  className = "",
  barClassName = "",
  showLabel = false,
  labelPosition = "outside"
}: AnimatedProgressProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-gradient-primary rounded-full ${barClassName}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            type: "spring",
            stiffness: 50,
            damping: 15,
            delay: 0.2,
          }}
        />
      </div>
      {showLabel && (
        <motion.span
          className={`text-xs text-muted-foreground ${
            labelPosition === "inside" 
              ? "absolute right-2 top-1/2 -translate-y-1/2" 
              : "mt-1 block text-right"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.span>
      )}
    </div>
  );
};

export default AnimatedProgress;
