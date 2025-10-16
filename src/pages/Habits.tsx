import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import Navigation from "@/components/Navigation";
import HabitCard from "@/components/HabitCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Habits = () => {
  const [habits, setHabits] = useState([
    { id: "1", name: "Sport matinal", emoji: "💪", streak: 7, completed: true },
    { id: "2", name: "Lecture", emoji: "📚", streak: 12, completed: true },
    { id: "3", name: "Méditation", emoji: "🧘", streak: 5, completed: false },
    { id: "4", name: "Boire de l'eau", emoji: "💧", streak: 15, completed: true },
    { id: "5", name: "Pas de cigarette", emoji: "🚭", streak: 30, completed: true },
  ]);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, completed: !habit.completed } : habit
      )
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-6 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground mb-6">Mes Habitudes</h1>
        
        {/* Search & Filter */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une habitude..."
              className="pl-10 bg-card border-border"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <Button className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-elevation">
          <Plus className="w-5 h-5 mr-2" />
          Créer une nouvelle habitude
        </Button>
      </header>

      <main className="px-6 pt-6 space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {habits.length} habitude{habits.length > 1 ? "s" : ""} active{habits.length > 1 ? "s" : ""}
          </p>
          <p className="text-sm text-success">
            {habits.filter((h) => h.completed).length} complétées aujourd'hui
          </p>
        </div>

        {habits.map((habit) => (
          <HabitCard key={habit.id} {...habit} onToggle={toggleHabit} />
        ))}
      </main>

      <Navigation />
    </div>
  );
};

export default Habits;
