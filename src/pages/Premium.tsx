import { Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Premium = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-primary shadow-glow flex items-center justify-center animate-pulse-glow mb-6">
            <Crown className="w-16 h-16 text-primary-foreground" />
          </div>
          <div className="absolute -top-2 -right-2 left-0 right-0 mx-auto w-fit">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Version Premium
          </h1>
          <p className="text-2xl font-semibold text-foreground">
            Arrive Bientôt
          </p>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
            Nous préparons une expérience exceptionnelle avec des fonctionnalités exclusives pour t'aider à atteindre tes objectifs encore plus rapidement.
          </p>
        </div>

        <div className="glass rounded-xl p-6 space-y-3 border border-primary/20">
          <p className="text-sm font-semibold text-foreground mb-3">Fonctionnalités à venir :</p>
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Statistiques avancées illimitées</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Synchronisation multi-appareils</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Thèmes premium exclusifs</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Assistant IA personnalisé</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="w-full glass border-primary/30 text-foreground hover:bg-primary/10"
        >
          Retour
        </Button>
      </div>
    </div>
  );
};

export default Premium;
