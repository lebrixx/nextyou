import { useState } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TourStep {
  title: string;
  description: string;
  icon: string;
}

const tourSteps: TourStep[] = [
  {
    title: "🏠 Accueil",
    description: "Visualise tes progrès quotidiens, tes compteurs actifs et tes objectifs. C'est ton tableau de bord personnel pour suivre ta transformation.",
    icon: "🏠"
  },
  {
    title: "✅ Habitudes",
    description: "Crée et gère tes habitudes quotidiennes avec des statistiques détaillées. Chaque validation augmente ta série (streak). Analyse tes performances et visualise ta progression pour rester motivé.",
    icon: "✅"
  },
  {
    title: "⏱️ Chronomètres",
    description: "Mesure le temps écoulé depuis un événement important : début d'une nouvelle habitude, arrêt d'une addiction, ou tout engagement personnel. Chaque seconde compte !",
    icon: "⏱️"
  },
  {
    title: "💬 Citations",
    description: "Reçois des messages motivants pour rester inspiré. Configure la fréquence des notifications et ajoute les citations en widget sur ton écran d'accueil.",
    icon: "💬"
  },
  {
    title: "⚙️ Réglages",
    description: "Personnalise ton expérience : thème de couleurs, notifications, et gestion de ton compte. Connecte-toi pour synchroniser tes données.",
    icon: "⚙️"
  }
];

interface AppTourProps {
  open: boolean;
  onClose: () => void;
}

const AppTour = ({ open, onClose }: AppTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!open) return null;

  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="glass-strong rounded-2xl p-6 max-w-md w-full shadow-2xl border border-white/20 animate-in zoom-in-95">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{step.icon}</div>
          <h2 className="text-2xl font-bold text-foreground mb-3">{step.title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {tourSteps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? "w-8 bg-gradient-primary"
                  : "w-2 bg-muted/30"
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={handlePrev}
            disabled={isFirstStep}
            variant="outline"
            className="flex-1 glass border-white/10 disabled:opacity-30"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Précédent
          </Button>
          <Button
            onClick={handleNext}
            className="flex-1 bg-gradient-primary text-primary-foreground shadow-glow"
          >
            {isLastStep ? "Commencer" : "Suivant"}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppTour;
