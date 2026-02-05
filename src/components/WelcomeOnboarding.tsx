import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Target, Clock, Trophy, Users, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeOnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    icon: Sparkles,
    title: "Bienvenue sur Time Ritual",
    description: "Ton compagnon quotidien pour construire la meilleure version de toi-même.",
    gradient: "from-primary via-purple-500 to-pink-500"
  },
  {
    icon: Target,
    title: "Crée tes habitudes",
    description: "Ajoute des habitudes personnalisées et suis ta progression jour après jour.",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    icon: Flame,
    title: "Maintiens tes streaks",
    description: "Chaque jour compte. Enchaîne les jours consécutifs pour débloquer des badges.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Clock,
    title: "Compte ce qui compte",
    description: "Crée des compteurs pour visualiser le temps passé sur tes objectifs importants.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Trophy,
    title: "Gagne des récompenses",
    description: "50+ badges à débloquer. Chaque petit pas te rapproche de la victoire.",
    gradient: "from-yellow-500 to-amber-500"
  },
  {
    icon: Users,
    title: "Défie tes amis",
    description: "Connecte-toi avec tes amis, lance des duels et maintenez vos streaks mutuels.",
    gradient: "from-pink-500 to-rose-500"
  }
];

export const WelcomeOnboarding = ({ onComplete }: WelcomeOnboardingProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsExiting(true);
      setTimeout(() => {
        localStorage.setItem("timeritual_onboarding_complete", "true");
        onComplete();
      }, 500);
    }
  };

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(() => {
      localStorage.setItem("timeritual_onboarding_complete", "true");
      onComplete();
    }, 500);
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] bg-background flex flex-col items-center justify-center p-6"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gradient-to-r ${step.gradient} blur-[120px] opacity-30`}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.35, 0.2]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            />
          </div>

          {/* Skip button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={handleSkip}
            className="absolute top-12 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Passer
          </motion.button>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center max-w-md text-center">
            {/* Icon */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-8 shadow-2xl`}
              >
                <Icon className="w-12 h-12 text-white" />
              </motion.div>
            </AnimatePresence>

            {/* Title */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={`title-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold text-foreground mb-4"
              >
                {step.title}
              </motion.h1>
            </AnimatePresence>

            {/* Description */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-lg leading-relaxed mb-12"
              >
                {step.description}
              </motion.p>
            </AnimatePresence>

            {/* Progress indicators */}
            <div className="flex gap-2 mb-8">
              {steps.map((_, index) => (
                <motion.div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? `w-8 bg-gradient-to-r ${step.gradient}` 
                      : index < currentStep 
                        ? 'w-4 bg-primary/50' 
                        : 'w-4 bg-muted'
                  }`}
                  layoutId={`indicator-${index}`}
                />
              ))}
            </div>

            {/* Action button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                onClick={handleNext}
                size="lg"
                className={`bg-gradient-to-r ${step.gradient} text-white border-0 shadow-lg hover:opacity-90 transition-opacity px-8 py-6 text-lg font-semibold rounded-2xl`}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Commencer
                    <Sparkles className="w-5 h-5 ml-2" />
                  </>
                ) : (
                  <>
                    Continuer
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </>
                )}
              </Button>
            </motion.div>

            {/* Step counter */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs text-muted-foreground mt-6"
            >
              {currentStep + 1} / {steps.length}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeOnboarding;
