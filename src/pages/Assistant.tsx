import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Plus, ArrowLeft, Crown } from "lucide-react";
import { HabitIconType } from "@/components/HabitIcon";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

interface SuggestedHabit {
  name: string;
  icon: HabitIconType;
  reason: string;
}

interface AIResponse {
  habits: SuggestedHabit[];
  message: string;
}

const Assistant = () => {
  const navigate = useNavigate();
  const [userMessage, setUserMessage] = useState("");
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AIResponse | null>(null);

  const handleSubmit = async (refine: boolean = false) => {
    const messageToSend = refine ? lastUserMessage : userMessage;
    
    if (!messageToSend.trim()) {
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
            messages: [{ role: "user", content: messageToSend }],
            refine: refine,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la génération des suggestions");
      }

      const data: AIResponse = await response.json();
      setSuggestions(data);
      
      if (!refine) {
        setLastUserMessage(userMessage);
        setUserMessage("");
      }
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

    navigate("/habits");
  };

  const handleNewSearch = () => {
    setSuggestions(null);
    setUserMessage("");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-6 relative">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          size="sm"
          className="absolute top-8 left-6 w-10 h-10 p-0 rounded-full glass"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Button>
        
        <Button
          onClick={() => navigate("/premium")}
          variant="ghost"
          size="sm"
          className="absolute top-8 right-6 w-10 h-10 p-0 rounded-full bg-gradient-primary shadow-glow hover:opacity-90"
        >
          <Crown className="w-5 h-5 text-primary-foreground" />
        </Button>

        <div className="text-center pt-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-600 via-primary to-pink-600 shadow-glow mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Ton Assistant <span className="bg-gradient-primary bg-clip-text text-transparent">Personnel</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            Dis-moi tes objectifs et je te suggérerai des habitudes pour les atteindre
          </p>
        </div>
      </header>

      <main className="px-6 space-y-4 max-w-2xl mx-auto">
        {!suggestions ? (
          <div className="glass rounded-2xl p-6 space-y-4 border border-white/10">
            <Textarea
              placeholder="Ex: Je veux devenir plus musclé, avoir une meilleure santé, être plus productif..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="min-h-[120px] text-base resize-none glass border-white/10"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isLoading || !userMessage.trim()}
              className="w-full bg-gradient-to-r from-purple-600 via-primary to-pink-600 text-white shadow-glow font-bold h-12"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Obtenir des suggestions
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.message && (
              <div className="glass rounded-2xl p-4 border border-white/10">
                <p className="text-foreground text-sm">{suggestions.message}</p>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="font-bold text-lg text-foreground px-1">Habitudes suggérées</h3>
              {suggestions.habits.map((habit, index) => (
                <div
                  key={index}
                  className="glass rounded-xl p-4 border border-white/10 hover:border-primary/30 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-foreground font-semibold text-base">{habit.name}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddHabit(habit)}
                      className="shrink-0 border-primary/30 hover:bg-primary/10"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {habit.reason}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <div className="glass rounded-xl p-4 border border-primary/20 space-y-3">
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 via-primary to-pink-600 text-white shadow-glow font-bold h-12"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Affinement en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Affiner les suggestions
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  L'IA va générer de nouvelles suggestions plus adaptées à ton objectif
                </p>
              </div>
              
              <Button
                onClick={handleNewSearch}
                variant="ghost"
                size="lg"
                className="w-full text-muted-foreground hover:text-foreground"
              >
                Nouvelle recherche
              </Button>
            </div>
          </div>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default Assistant;
