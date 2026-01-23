import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, Plus, Sun, Dumbbell, Brain, Moon, Heart, Ban, ChevronRight } from "lucide-react";
import { HabitIconType } from "@/components/HabitIcon";

interface HabitTemplate {
  name: string;
  icon: HabitIconType;
  description: string;
}

interface TemplateCategory {
  id: string;
  name: string;
  emoji: string;
  icon: React.ReactNode;
  color: string;
  templates: HabitTemplate[];
}

const templateCategories: TemplateCategory[] = [
  {
    id: "morning",
    name: "Routine Matinale",
    emoji: "🌅",
    icon: <Sun className="w-4 h-4" />,
    color: "from-amber-500 to-orange-500",
    templates: [
      { name: "Méditation 5 min", icon: "meditation", description: "Commence la journée en pleine conscience" },
      { name: "Verre d'eau au réveil", icon: "hydratation", description: "Hydrate ton corps dès le matin" },
      { name: "Journaling matinal", icon: "lecture", description: "Écris tes pensées et intentions" },
      { name: "Étirements 10 min", icon: "sport", description: "Réveille ton corps en douceur" },
      { name: "Pas de téléphone 1h", icon: "ecrans", description: "Préserve ton calme matinal" },
    ]
  },
  {
    id: "fitness",
    name: "Fitness & Santé",
    emoji: "💪",
    icon: <Dumbbell className="w-4 h-4" />,
    color: "from-green-500 to-emerald-500",
    templates: [
      { name: "30 min de sport", icon: "sport", description: "Entretiens ta forme physique" },
      { name: "10 000 pas", icon: "energie", description: "Reste actif toute la journée" },
      { name: "Boire 2L d'eau", icon: "hydratation", description: "Hydratation optimale" },
      { name: "Manger 5 fruits/légumes", icon: "nutrition", description: "Nutrition équilibrée" },
      { name: "Dormir 8h", icon: "sommeil", description: "Récupération essentielle" },
    ]
  },
  {
    id: "productivity",
    name: "Productivité",
    emoji: "🧠",
    icon: <Brain className="w-4 h-4" />,
    color: "from-blue-500 to-indigo-500",
    templates: [
      { name: "Lire 20 pages", icon: "lecture", description: "Enrichis tes connaissances" },
      { name: "Deep work 2h", icon: "autre", description: "Concentration sans distraction" },
      { name: "Pas de réseaux sociaux", icon: "ecrans", description: "Libère ton attention" },
      { name: "Inbox zero", icon: "autre", description: "Maîtrise tes emails" },
      { name: "Apprendre 30 min", icon: "meditation", description: "Développe de nouvelles compétences" },
    ]
  },
  {
    id: "evening",
    name: "Routine du Soir",
    emoji: "😴",
    icon: <Moon className="w-4 h-4" />,
    color: "from-purple-500 to-violet-500",
    templates: [
      { name: "Pas d'écran après 21h", icon: "ecrans", description: "Prépare un sommeil de qualité" },
      { name: "Gratitude (3 choses)", icon: "sante", description: "Termine en positif" },
      { name: "Préparer le lendemain", icon: "autre", description: "Anticipe ta journée" },
      { name: "Lecture avant dormir", icon: "lecture", description: "Relaxation par la lecture" },
      { name: "Rangement 10 min", icon: "autre", description: "Un espace ordonné = esprit clair" },
    ]
  },
  {
    id: "mental",
    name: "Bien-être Mental",
    emoji: "🧘",
    icon: <Heart className="w-4 h-4" />,
    color: "from-pink-500 to-rose-500",
    templates: [
      { name: "Respiration profonde", icon: "meditation", description: "Calme et recentrage" },
      { name: "Marche en nature", icon: "energie", description: "Reconnexion à l'essentiel" },
      { name: "Pause sans écran", icon: "cafe", description: "Moment de déconnexion" },
      { name: "Appeler un proche", icon: "sante", description: "Entretiens tes liens" },
      { name: "Auto-compassion", icon: "sante", description: "Bienveillance envers toi-même" },
    ]
  },
  {
    id: "addiction",
    name: "Sortir d'une Addiction",
    emoji: "🚫",
    icon: <Ban className="w-4 h-4" />,
    color: "from-red-500 to-orange-500",
    templates: [
      { name: "Journée sans tabac", icon: "tabac", description: "Chaque jour sans est une victoire" },
      { name: "Journée sans alcool", icon: "alcool", description: "Reprends le contrôle" },
      { name: "Journée sans sucre ajouté", icon: "sucre", description: "Libère-toi des envies" },
      { name: "Pas de jeux vidéo", icon: "ecrans", description: "Équilibre ton temps d'écran" },
      { name: "Pas de paris/jeux d'argent", icon: "finance", description: "Protège ton avenir financier" },
    ]
  },
];

interface HabitTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabit: (name: string, icon: HabitIconType) => void;
}

const HabitTemplatesDialog = ({ open, onOpenChange, onAddHabit }: HabitTemplatesDialogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [addedTemplates, setAddedTemplates] = useState<Set<string>>(new Set());

  const handleAddTemplate = (template: HabitTemplate) => {
    onAddHabit(template.name, template.icon);
    setAddedTemplates(prev => new Set([...prev, template.name]));
  };

  const selectedCategoryData = templateCategories.find(c => c.id === selectedCategory);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-primary/20 max-w-lg max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {selectedCategory ? (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-2 mx-auto hover:text-primary transition-colors"
              >
                ← {selectedCategoryData?.emoji} {selectedCategoryData?.name}
              </button>
            ) : (
              <>📚 Templates d'Habitudes</>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          {!selectedCategory ? (
            // Category selection
            <div className="grid gap-3">
              {templateCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className="glass rounded-xl p-4 border border-white/10 hover:border-primary/40 transition-all group text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-105 transition-transform`}>
                      {category.emoji}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {category.templates.length} habitudes prêtes à l'emploi
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // Template list for selected category
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Clique sur une habitude pour l'ajouter à ta liste
              </p>
              {selectedCategoryData?.templates.map((template) => {
                const isAdded = addedTemplates.has(template.name);
                return (
                  <button
                    key={template.name}
                    onClick={() => !isAdded && handleAddTemplate(template)}
                    disabled={isAdded}
                    className={`w-full glass rounded-xl p-4 border transition-all text-left ${
                      isAdded 
                        ? "border-success/50 bg-success/10 cursor-default" 
                        : "border-white/10 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedCategoryData.color} flex items-center justify-center text-white shadow-md`}>
                        {isAdded ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold ${isAdded ? "text-success" : "text-foreground"}`}>
                          {template.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {template.description}
                        </p>
                      </div>
                      {isAdded && (
                        <span className="text-xs text-success font-medium">Ajouté ✓</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="pt-4 border-t border-white/10">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full glass border-white/20"
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HabitTemplatesDialog;
