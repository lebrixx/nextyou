import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourStep {
  title: string;
  description: string;
  icon: string;
  highlight?: string;
  tips?: string[];
}

const tourSteps: TourStep[] = [
  {
    title: "Bienvenue sur Time Ritual ✨",
    description: "Transforme ta vie en construisant des habitudes durables. Découvre les fonctionnalités clés en quelques secondes.",
    icon: "🚀",
    tips: ["Chaque petite action compte", "La régularité bat l'intensité"],
  },
  {
    title: "🏠 Tableau de bord",
    description: "Ton QG quotidien. Visualise tes progrès, tes compteurs actifs, tes rappels et tes objectifs en un coup d'œil.",
    icon: "🏠",
    highlight: "home",
    tips: ["Consulte-le chaque matin", "Ta citation du jour t'attend"],
  },
  {
    title: "✅ Tes habitudes",
    description: "Crée et valide tes habitudes quotidiennes. Chaque jour validé augmente ta série (streak) et te rapproche de tes objectifs.",
    icon: "✅",
    highlight: "habits",
    tips: ["Commence par 2-3 habitudes max", "La règle des 2 minutes fonctionne"],
  },
  {
    title: "📊 Statistiques",
    description: "Analyse tes performances avec des graphiques détaillés. Visualise ton calendrier et identifie tes patterns.",
    icon: "📊",
    highlight: "stats",
    tips: ["Révise tes stats chaque semaine", "Identifie tes jours forts"],
  },
  {
    title: "⏱️ Pomodoro & Timers",
    description: "Booste ta productivité avec la technique Pomodoro (25 min focus) ou crée des compteurs personnalisés.",
    icon: "⏱️",
    highlight: "timer",
    tips: ["Le mode focus élimine les distractions", "Fais des pauses régulières"],
  },
  {
    title: "👥 Social & Défis",
    description: "Ajoute des amis, lance des duels et rejoins des groupes. La motivation partagée multiplie les résultats.",
    icon: "👥",
    highlight: "social",
    tips: ["Les streaks mutuels renforcent l'engagement", "Défie tes amis !"],
  },
  {
    title: "🏆 Badges & Récompenses",
    description: "Débloque des badges en atteignant tes objectifs. Chaque accomplissement est célébré !",
    icon: "🏆",
    highlight: "badges",
    tips: ["7 jours = Premier badge", "Vise les 100 jours !"],
  },
  {
    title: "Tu es prêt ! 🎉",
    description: "Commence par créer ta première habitude. Rappelle-toi : la constance bat la perfection. Bonne transformation !",
    icon: "🌟",
    tips: ["Commence maintenant", "Reviens chaque jour"],
  },
];

interface AppTourProps {
  open: boolean;
  onClose: () => void;
}

const AppTour = ({ open, onClose }: AppTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open]);

  if (!open) return null;

  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;
  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
      localStorage.setItem("timeritual_tour_completed", "true");
    } else {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    onClose();
    localStorage.setItem("timeritual_tour_completed", "true");
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        className="glass-strong rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/20 relative overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20 pointer-events-none" />
        
        {/* Progress bar */}
        <div className="relative w-full h-1.5 bg-muted/30 rounded-full mb-6 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground text-xs flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          <span>Passer</span>
        </button>

        {/* Step indicator */}
        <div className="flex justify-center mb-4">
          <span className="text-xs text-muted-foreground bg-muted/20 px-3 py-1 rounded-full">
            {currentStep + 1} / {tourSteps.length}
          </span>
        </div>

        {/* Animated Content */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="text-center relative z-10"
          >
            {/* Icon with pulse effect */}
            <motion.div 
              className="text-6xl mb-4 inline-block"
              animate={{ 
                scale: [1, 1.1, 1],
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {step.icon}
            </motion.div>
            
            <h2 className="text-xl font-bold text-foreground mb-3">
              {step.title}
            </h2>
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              {step.description}
            </p>

            {/* Tips section */}
            {step.tips && step.tips.length > 0 && (
              <motion.div 
                className="bg-primary/10 rounded-xl p-3 mb-4 border border-primary/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold text-primary">Conseils</span>
                </div>
                <ul className="space-y-1">
                  {step.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-success mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress Dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {tourSteps.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                setDirection(index > currentStep ? 1 : -1);
                setCurrentStep(index);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                index === currentStep
                  ? "w-6 bg-gradient-primary"
                  : index < currentStep
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted/30"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 relative z-10">
          <Button
            onClick={handlePrev}
            disabled={isFirstStep}
            variant="outline"
            className="flex-1 glass border-white/10 disabled:opacity-30 h-11"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-primary text-primary-foreground shadow-glow h-11 font-semibold"
          >
            {isLastStep ? (
              <>
                <Sparkles className="w-4 h-4 mr-1" />
                Commencer
              </>
            ) : (
              <>
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AppTour;
