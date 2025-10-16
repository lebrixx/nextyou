import { useState, useEffect } from "react";
import { Plus, Search, Filter, Target } from "lucide-react";
import Navigation from "@/components/Navigation";
import HabitCard from "@/components/HabitCard";
import AddHabitDialog from "@/components/AddHabitDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HabitIconType } from "@/components/HabitIcon";
import { toast } from "@/hooks/use-toast";

interface Habit {
  id: string;
  name: string;
  icon: HabitIconType;
  streak: number;
  completed: boolean;
}

const Habits = () => {
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem("habitflow_habits");
    return saved ? JSON.parse(saved) : [
      { id: "1", name: "Boire deux litres d'eau", icon: "hydratation", streak: 0, completed: false }
    ];
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("habitflow_habits", JSON.stringify(habits));
  }, [habits]);

  const toggleHabit = (id: string) => {
    const updatedHabits = habits.map((habit) =>
      habit.id === id ? { ...habit, completed: !habit.completed } : habit
    );
    setHabits(updatedHabits);
    localStorage.setItem("habitflow_habits", JSON.stringify(updatedHabits));
  };

  const addHabit = (name: string, icon: HabitIconType) => {
    const newHabit = {
      id: Date.now().toString(),
      name,
      icon,
      streak: 0,
      completed: false,
    };
    setHabits((prev) => [...prev, newHabit]);
    toast({
      title: "Habitude créée",
      description: `"${name}" a été ajoutée à tes habitudes.`,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Mes <span className="bg-gradient-primary bg-clip-text text-transparent">Habitudes</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-4">
          Gère et suis tes habitudes quotidiennes
        </p>
        
        {/* Search & Filter */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-9 glass border-white/10 h-9 text-sm focus:border-primary/50 transition-colors"
            />
          </div>
          <Button variant="outline" size="icon" className="glass border-white/10 hover:border-primary/50 h-9 w-9">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Button 
          onClick={() => setDialogOpen(true)}
          className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow font-semibold h-9 text-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Créer une nouvelle habitude
        </Button>
      </header>

      <main className="px-6 pt-4 space-y-3 max-w-2xl mx-auto">
        {habits.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center mb-2">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Commence ton voyage</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Créer une habitude, c'est le premier pas vers la meilleure version de toi-même. 
              Chaque petite action répétée devient une grande transformation.
            </p>
            <p className="text-xs text-muted-foreground/70 pt-2">
              Exemple: "Lire 10 pages par jour" ou "Méditer 5 minutes"
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">
                {habits.length} habitude{habits.length > 1 ? "s" : ""} active{habits.length > 1 ? "s" : ""}
              </p>
              <p className="text-xs text-success">
                {habits.filter((h) => h.completed).length} complétées aujourd'hui
              </p>
            </div>

            {habits.map((habit) => (
              <HabitCard key={habit.id} {...habit} onToggle={toggleHabit} />
            ))}
          </>
        )}
      </main>

      <Navigation />
      <AddHabitDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addHabit} />
    </div>
  );
};

export default Habits;
