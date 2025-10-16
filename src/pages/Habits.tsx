import { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import Navigation from "@/components/Navigation";
import HabitCard from "@/components/HabitCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Habits = () => {
  const [habits, setHabits] = useState([
    { id: "1", name: "Sport matinal", icon: "sport" as const, streak: 7, completed: true },
    { id: "2", name: "Lecture", icon: "lecture" as const, streak: 12, completed: true },
    { id: "3", name: "Méditation", icon: "meditation" as const, streak: 5, completed: false },
    { id: "4", name: "Boire de l'eau", icon: "hydratation" as const, streak: 15, completed: true },
    { id: "5", name: "Sans cigarette", icon: "tabac" as const, streak: 30, completed: true },
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
      <header className="px-6 pt-10 pb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
          Mes <span className="bg-gradient-primary bg-clip-text text-transparent">Habitudes</span>
        </h1>
        <p className="text-muted-foreground text-base mb-6">
          Gère et suis tes habitudes quotidiennes
        </p>
        
        {/* Search & Filter */}
        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher une habitude..."
              className="pl-12 glass border-white/10 h-12 focus:border-primary/50 transition-colors"
            />
          </div>
          <Button variant="outline" size="icon" className="glass border-white/10 hover:border-primary/50 h-12 w-12">
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        <Button className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow font-semibold h-12">
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
