import { HelpCircle, TrendingUp, Calendar, BarChart3, Target, Flame, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const StatsHelpDialog = () => {
  const sections = [
    {
      icon: TrendingUp,
      title: "Progression du jour",
      description: "Le pourcentage d'habitudes que tu as complétées aujourd'hui. 100% signifie que tu as tout accompli !",
      example: "Ex: Si tu as 4 habitudes et 2 complétées → 50%"
    },
    {
      icon: BarChart3,
      title: "Tendance hebdomadaire",
      description: "Compare ta performance des 7 derniers jours à la semaine précédente. Une flèche verte ↑ indique une amélioration.",
      example: "Ex: +15% signifie que tu fais 15% mieux que la semaine dernière"
    },
    {
      icon: Flame,
      title: "Série (Streak)",
      description: "Le nombre de jours consécutifs où tu as complété une habitude. Si tu rates un jour, la série retombe à 0.",
      example: "Ex: Série de 7 = 7 jours d'affilée sans interruption"
    },
    {
      icon: Calendar,
      title: "Jours parfaits",
      description: "Le nombre de jours où tu as complété 100% de tes habitudes sur les 30 derniers jours.",
      example: "Ex: 15 jours parfaits = 15 jours à 100% ce mois"
    },
    {
      icon: Target,
      title: "Score de constance",
      description: "Le pourcentage de jours où tu as complété au moins 50% de tes habitudes sur les 30 derniers jours.",
      example: "Ex: 80% = tu es actif 24 jours sur 30"
    },
    {
      icon: Clock,
      title: "Meilleur/Pire jour",
      description: "Les jours de la semaine où tu performes le mieux et le moins bien, calculés sur 90 jours d'historique.",
      example: "Ex: Meilleur: Lundi (85%) / Pire: Dimanche (45%)"
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-9 h-9 p-0 rounded-full glass hover:bg-primary/10"
        >
          <HelpCircle className="w-5 h-5 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-w-[95vw] sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            Comprendre tes statistiques
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Voici une explication simple de chaque métrique pour t'aider à comprendre ta progression.
          </p>

          <div className="space-y-3">
            {sections.map((section, index) => (
              <div 
                key={index} 
                className="glass rounded-xl p-3 border border-border/50 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h4 className="font-semibold text-sm text-foreground">{section.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {section.description}
                </p>
                <p className="text-[10px] text-primary/80 bg-primary/5 px-2 py-1 rounded-md inline-block">
                  {section.example}
                </p>
              </div>
            ))}
          </div>

          <div className="glass rounded-xl p-3 border border-primary/20 bg-primary/5">
            <h4 className="font-semibold text-sm text-foreground mb-1">💡 Conseil</h4>
            <p className="text-xs text-muted-foreground">
              Concentre-toi sur la <strong>constance</strong> plutôt que la perfection. 
              Compléter 50% de tes habitudes chaque jour est mieux que 100% un jour puis rien les jours suivants !
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatsHelpDialog;
