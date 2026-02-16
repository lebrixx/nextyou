import { CheckCircle2, Circle, Flame, Swords, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import HabitIcon, { HabitIconType } from "./HabitIcon";
import { TwoMinuteRuleBadge } from "./TwoMinuteRuleBadge";
import { useTranslation } from "@/lib/i18n";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface HabitCardProps {
  id: string;
  name: string;
  icon: HabitIconType;
  streak: number;
  completed: boolean;
  onToggle: (id: string) => void;
  onClick?: () => void;
  habit?: any;
  completions?: any[];
  onUpdate?: () => void;
  isDuelHabit?: boolean;
  duelTitle?: string;
}

const HabitCard = ({ id, name, icon, streak, completed, onToggle, onClick, habit, completions = [], onUpdate, isDuelHabit, duelTitle }: HabitCardProps) => {
  const { t } = useTranslation();
  const [showCelebration, setShowCelebration] = useState(false);
  const [wasCompleted, setWasCompleted] = useState(completed);
  
  // Detect when habit gets completed (transition from false to true)
  useEffect(() => {
    if (completed && !wasCompleted) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 1000);
      return () => clearTimeout(timer);
    }
    setWasCompleted(completed);
  }, [completed, wasCompleted]);
  
  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    onClick?.();
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(id);
  };
  
  return (
    <motion.div 
      layout
      initial={false}
      animate={{
        scale: showCelebration ? [1, 1.02, 1] : 1,
        opacity: completed ? 0.7 : 1,
      }}
      transition={{ 
        scale: { duration: 0.4, ease: "easeOut" },
        opacity: { duration: 0.3 }
      }}
      className={`glass rounded-xl p-4 transition-colors duration-300 border cursor-pointer relative overflow-hidden ${
        isDuelHabit 
          ? completed
            ? "border-red-500/30 bg-red-500/5"
            : "border-red-500/40 bg-gradient-to-br from-red-500/10 to-orange-500/5 hover:border-red-500/60"
          : completed 
            ? "border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5" 
            : "hover:shadow-elevation hover:scale-[1.01] border-primary/10"
      } group`}
      onClick={handleCardClick}
    >
      {/* Celebration particles */}
      <AnimatePresence>
        {showCelebration && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 1, 
                  scale: 0,
                  x: "50%",
                  y: "50%"
                }}
                animate={{ 
                  opacity: 0, 
                  scale: 1,
                  x: `${50 + (Math.random() - 0.5) * 150}%`,
                  y: `${50 + (Math.random() - 0.5) * 150}%`
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="absolute pointer-events-none"
              >
                <Sparkles className={`w-4 h-4 ${isDuelHabit ? 'text-red-400' : 'text-primary'}`} />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Success glow effect */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 ${isDuelHabit ? 'bg-red-500/20' : 'bg-primary/20'} blur-xl pointer-events-none`}
          />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 flex-1">
          <motion.div 
            animate={{
              scale: showCelebration ? [1, 1.2, 1] : 1,
              rotate: showCelebration ? [0, -10, 10, 0] : 0,
            }}
            transition={{ duration: 0.4 }}
            className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-glow transition-all duration-300 ${
              isDuelHabit
                ? completed 
                  ? "bg-gradient-to-br from-red-500/50 to-orange-500/30" 
                  : "bg-gradient-to-br from-red-500 to-orange-500 group-hover:scale-105"
                : completed 
                  ? "bg-gradient-to-br from-primary/60 to-primary-glow/40" 
                  : "bg-gradient-primary group-hover:scale-105"
            }`}
          >
            <HabitIcon type={icon} className={`w-5 h-5 transition-opacity ${
              completed ? "text-white/90" : "text-primary-foreground"
            }`} />
          </motion.div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <motion.h3 
                animate={{
                  x: showCelebration ? [0, -2, 2, 0] : 0,
                }}
                transition={{ duration: 0.3 }}
                className={`font-bold text-base mb-0.5 transition-all duration-300 ${
                  completed 
                    ? "text-foreground/70" 
                    : isDuelHabit 
                      ? "text-foreground group-hover:text-red-400"
                      : "text-foreground group-hover:text-primary"
                }`}
              >
                <span className={completed ? "line-through decoration-2 decoration-primary/50" : ""}>
                  {name}
                </span>
              </motion.h3>
              {isDuelHabit && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400">
                  <Swords className="w-3 h-3" />
                  Duel
                </span>
              )}
              {completed && (
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isDuelHabit 
                      ? 'bg-red-500/20 text-red-400' 
                      : 'bg-primary/20 text-primary'
                  }`}
                >
                  ✓ Fait
                </motion.span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <motion.div
                  animate={{
                    scale: showCelebration ? [1, 1.3, 1] : 1,
                  }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Flame className={`w-4 h-4 ${completed ? (isDuelHabit ? "text-red-400/70" : "text-primary/70") : (isDuelHabit ? "text-red-400" : "text-primary")}`} />
                </motion.div>
                <span className={`text-xs font-semibold ${
                  completed ? "text-muted-foreground/70" : "text-muted-foreground"
                }`}>
                  {streak} {t('days')}
                </span>
              </div>
              {duelTitle && (
                <span className="text-[10px] text-muted-foreground">
                  • {duelTitle}
                </span>
              )}
              {habit && <TwoMinuteRuleBadge habit={habit} completions={completions} onUpdate={onUpdate} />}
            </div>
          </div>
        </div>
        <motion.div
          whileTap={{ scale: 0.9 }}
          animate={{
            rotate: showCelebration ? [0, -15, 15, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Button
            onClick={handleToggle}
            variant="ghost"
            size="icon"
            className={`w-10 h-10 rounded-lg transition-all duration-300 ${
              isDuelHabit
                ? completed
                  ? "bg-gradient-to-br from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg"
                  : "hover:bg-red-500/20 backdrop-blur-sm border border-red-500/30"
                : completed
                  ? "bg-gradient-to-br from-primary to-primary-glow hover:from-primary-dark hover:to-primary text-primary-foreground shadow-glow"
                  : "hover:bg-muted/30 backdrop-blur-sm border border-border"
            }`}
          >
            <AnimatePresence mode="wait">
              {completed ? (
                <motion.div
                  key="checked"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </motion.div>
              ) : (
                <motion.div
                  key="unchecked"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Circle className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default HabitCard;
