import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Plus } from "lucide-react";
import { HabitIconType } from "@/components/HabitIcon";
import { toast } from "@/hooks/use-toast";

interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SuggestedHabit {
  name: string;
  icon: HabitIconType;
}

interface AIResponse {
  habits: SuggestedHabit[];
  message: string;
}

const AIAssistantDialog = ({ open, onOpenChange }: AIAssistantDialogProps) => {
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AIResponse | null>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setUserMessage("");
        setSuggestions(null);
        setIsLoading(false);
      }, 300); // Wait for dialog close animation
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!userMessage.trim()) {
      toast({
        title: "Message vide",
        description: "Écris ton objectif pour recevoir des suggestions",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/habit-assistant`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: userMessage }],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la génération des suggestions");
      }

      const data: AIResponse = await response.json();
      setSuggestions(data);
      setUserMessage("");
    } catch (error) {
      console.error("Error calling AI assistant:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de contacter l'assistant",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = (habit: SuggestedHabit) => {
    const saved = localStorage.getItem("habitflow_habits");
    const existingHabits = saved ? JSON.parse(saved) : [];
    
    const newHabit = {
      id: Date.now().toString(),
      name: habit.name,
      icon: habit.icon,
      streak: 0,
      completed: false,
    };

    localStorage.setItem(
      "habitflow_habits",
      JSON.stringify([...existingHabits, newHabit])
    );

    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Habitude ajoutée !",
      description: `"${habit.name}" a été ajouté à tes habitudes`,
    });
  };

  const handleAddAllHabits = () => {
    if (!suggestions?.habits) return;

    const saved = localStorage.getItem("habitflow_habits");
    const existingHabits = saved ? JSON.parse(saved) : [];
    
    const newHabits = suggestions.habits.map((habit) => ({
      id: Date.now().toString() + Math.random(),
      name: habit.name,
      icon: habit.icon,
      streak: 0,
      completed: false,
    }));

    localStorage.setItem(
      "habitflow_habits",
      JSON.stringify([...existingHabits, ...newHabits])
    );

    window.dispatchEvent(new Event("storage"));

    toast({
      title: "Habitudes ajoutées !",
      description: `${newHabits.length} nouvelles habitudes ont été ajoutées`,
    });

    onOpenChange(false);
  };

  const handleNewSearch = () => {
    setSuggestions(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            Ton Assistant Personnel
          </DialogTitle>
          <DialogDescription>
            Dis-moi tes objectifs et je te suggérerai des habitudes pour les atteindre
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {!suggestions ? (
            <>
              <Textarea
                placeholder="Ex: Je veux devenir plus musclé, avoir une meilleure santé..."
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                className="min-h-[120px] text-base"
                disabled={isLoading}
              />
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !userMessage.trim()}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Obtenir des suggestions
                  </>
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/50 rounded-lg">
                <p className="text-foreground font-medium">{suggestions.message}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Habitudes suggérées :</h3>
                {suggestions.habits.map((habit, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <span className="text-foreground">{habit.name}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddHabit(habit)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddAllHabits}
                  className="flex-1"
                  size="lg"
                >
                  Ajouter toutes les habitudes
                </Button>
                <Button
                  onClick={handleNewSearch}
                  variant="outline"
                  size="lg"
                >
                  Nouvelle recherche
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIAssistantDialog;
