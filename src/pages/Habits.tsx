import { useState, useEffect } from "react";
import { Plus, Target, ChevronRight, Trash2, Sparkles, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import HabitCard from "@/components/HabitCard";
import HabitStats from "@/components/HabitStats";
import AddHabitDialog from "@/components/AddHabitDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HabitIconType } from "@/components/HabitIcon";
import { toast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { useHabitReset } from "@/hooks/useHabitReset";
import { useNotificationScheduler } from "@/hooks/useNotificationScheduler";
import { useTranslation } from "@/lib/i18n";
import BadgeDisplay from "@/components/BadgeDisplay";
import { supabase } from "@/integrations/supabase/client";
import useBadges from "@/hooks/useBadges";

interface Habit {
  id: string;
  name: string;
  icon: HabitIconType;
  streak: number;
  completed: boolean;
}

interface Action {
  id: string;
  text: string;
}

interface Goal {
  id: string;
  title: string;
  actions: Action[];
}

const Habits = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useHabitReset(); // Reset habits at midnight
  useNotificationScheduler(); // Schedule all notifications
  
  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem("habitflow_habits");
    return saved ? JSON.parse(saved) : [
      { id: "1", name: "Boire deux litres d'eau", icon: "hydratation", streak: 0, completed: false }
    ];
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [badgesDialogOpen, setBadgesDialogOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [completions, setCompletions] = useState<any[]>([]);
  
  // Goals state
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("habitflow_goals");
    return saved ? JSON.parse(saved) : [];
  });
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [newActionText, setNewActionText] = useState("");

  useEffect(() => {
    localStorage.setItem("habitflow_habits", JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem("habitflow_goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      
      const { data: badgesData } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user.id);
      setBadges(badgesData || []);

      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', user.id);

      const { data: completionsData } = await supabase
        .from('habit_completions')
        .select('*')
        .eq('user_id', user.id);
      setCompletions(completionsData || []);
    }
  };

  // Calculate stats for badges
  const stats = {
    totalCompletions: completions.length,
    bestStreak: Math.max(...habits.map(h => h.streak || 0), 0),
    totalHabits: habits.length,
    perfectWeek: false,
  };

  // Auto-unlock badges
  useBadges(user?.id, stats);

  const toggleHabit = (id: string) => {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === id) {
        const newCompleted = !habit.completed;
        return {
          ...habit,
          completed: newCompleted,
          streak: newCompleted ? habit.streak + 1 : Math.max(0, habit.streak - 1)
        };
      }
      return habit;
    });
    setHabits(updatedHabits);
    localStorage.setItem("habitflow_habits", JSON.stringify(updatedHabits));
  };

  // Sort habits: uncompleted first, completed last
  const sortedHabits = [...habits].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

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

  // Goals functions
  const addGoal = () => {
    if (!newGoalTitle.trim()) {
      sonnerToast.error("Le titre de l'objectif ne peut pas être vide");
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      actions: [],
    };

    setGoals([...goals, newGoal]);
    setNewGoalTitle("");
    setIsAddingGoal(false);
    sonnerToast.success("Objectif ajouté avec succès");
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter((g) => g.id !== goalId));
    sonnerToast.success("Objectif supprimé");
  };

  const addAction = (goalId: string) => {
    if (!newActionText.trim()) {
      sonnerToast.error("Le texte de l'action ne peut pas être vide");
      return;
    }

    const newAction: Action = {
      id: Date.now().toString(),
      text: newActionText,
    };

    setGoals(
      goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, actions: [...goal.actions, newAction] }
          : goal
      )
    );

    setNewActionText("");
    setEditingGoalId(null);
    sonnerToast.success("Action ajoutée");
  };

  const deleteAction = (goalId: string, actionId: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, actions: goal.actions.filter((a) => a.id !== actionId) }
          : goal
      )
    );
    sonnerToast.success("Action supprimée");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6 relative">
        <Button
          onClick={() => navigate("/premium")}
          variant="ghost"
          size="sm"
          className="absolute top-8 right-6 w-10 h-10 p-0 rounded-full bg-gradient-primary shadow-glow hover:opacity-90"
        >
          <Crown className="w-5 h-5 text-primary-foreground" />
        </Button>
        
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          {t('myHabits')}
        </h1>
        <p className="text-muted-foreground text-sm mb-4">
          {t('manageHabits')}
        </p>
        
        <div className="space-y-2">
          <Button 
            onClick={() => setDialogOpen(true)}
            className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-glow font-semibold h-9 text-sm"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            {t('newHabit')}
          </Button>
          <HabitStats habits={habits} />
          <Button
            onClick={() => setBadgesDialogOpen(true)}
            variant="outline"
            className="w-full glass border-primary/30 text-foreground hover:bg-primary/10 h-9 text-sm font-semibold"
          >
            🏆 {t('myBadges')}
          </Button>
          
          {/* AI Assistant Button - Joli et attractif */}
          <Button
            onClick={() => navigate("/assistant")}
            className="w-full bg-gradient-to-r from-purple-600 via-primary to-pink-600 hover:from-purple-700 hover:via-primary/90 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-11 text-sm font-bold relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            <Sparkles className="w-5 h-5 mr-2 relative z-10" />
            <span className="relative z-10">Ton Assistant Personnel ✨</span>
          </Button>
        </div>
      </header>

      <main className="px-6 pt-4 space-y-3 max-w-2xl mx-auto">
        {habits.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center mb-2">
              <Target className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">{t('startJourney')}</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              {t('habitDescription')}
            </p>
            <p className="text-xs text-muted-foreground/70 pt-2">
              {t('habitExample')}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-muted-foreground">
                {habits.length} {t('habitActive')}
              </p>
              <p className="text-xs text-success">
                {habits.filter((h) => h.completed).length} {t('completedToday')}
              </p>
            </div>

            {sortedHabits.map((habit) => (
              <HabitCard key={habit.id} {...habit} onToggle={toggleHabit} />
            ))}
          </>
        )}
      </main>

      <Navigation />
      <AddHabitDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={addHabit} />
      
      {/* Badges Dialog */}
      <Dialog open={badgesDialogOpen} onOpenChange={setBadgesDialogOpen}>
        <DialogContent className="glass max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Mes <span className="bg-gradient-primary bg-clip-text text-transparent">Badges</span>
            </DialogTitle>
          </DialogHeader>
          {user ? (
            <BadgeDisplay badges={badges} />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Connecte-toi pour voir tes badges</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Plan Dialog */}
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="glass max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Ton <span className="bg-gradient-primary bg-clip-text text-transparent">Plan</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Add Goal Button */}
            <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-primary text-primary-foreground shadow-glow">
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un objectif
                </Button>
              </DialogTrigger>
              <DialogContent className="glass">
                <DialogHeader>
                  <DialogTitle>Nouvel objectif</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="goal-title">Quel est ton objectif ?</Label>
                    <Input
                      id="goal-title"
                      placeholder="Ex: Apprendre l'anglais, Devenir plus beau..."
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addGoal()}
                    />
                  </div>
                  <Button onClick={addGoal} className="w-full bg-gradient-primary text-primary-foreground">
                    Créer l'objectif
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Goals List */}
            {goals.length === 0 ? (
              <div className="glass rounded-xl p-8 text-center shadow-elevation space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center mb-2">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Commence à planifier</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Définis tes objectifs et décompose-les en actions concrètes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="glass rounded-xl p-5 shadow-elevation border border-white/5">
                    {/* Goal Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                          <Target className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-1">{goal.title}</h3>
                          <p className="text-xs text-muted-foreground">
                            {goal.actions.length} action{goal.actions.length > 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGoal(goal.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Actions List */}
                    {goal.actions.length > 0 && (
                      <div className="space-y-2 mb-3 ml-13">
                        {goal.actions.map((action, index) => (
                          <div
                            key={action.id}
                            className="flex items-start gap-2 group"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex flex-col items-center shrink-0">
                                {index > 0 && (
                                  <div className="w-px h-3 bg-primary/30" />
                                )}
                                <ChevronRight className="w-4 h-4 text-primary" />
                                {index < goal.actions.length - 1 && (
                                  <div className="w-px h-6 bg-primary/30" />
                                )}
                              </div>
                              <p className="text-sm text-foreground bg-muted/50 rounded-lg px-3 py-2 flex-1">
                                {action.text}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteAction(goal.id, action.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Action */}
                    {editingGoalId === goal.id ? (
                      <div className="space-y-2 ml-13">
                        <Input
                          placeholder="Ex: Regarder 15min de vidéos en anglais par jour..."
                          value={newActionText}
                          onChange={(e) => setNewActionText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addAction(goal.id)}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => addAction(goal.id)}
                            className="bg-gradient-primary text-primary-foreground"
                          >
                            Ajouter
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingGoalId(null);
                              setNewActionText("");
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingGoalId(goal.id)}
                        className="ml-13 border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Ajouter une action
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Why it's important section */}
            <div className="glass rounded-xl p-5 shadow-elevation border border-primary/10 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                  <Target className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground mb-2">Pourquoi est-ce important ?</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <span className="text-primary font-semibold">Un objectif sans plan n'est qu'un rêve.</span> En décomposant tes ambitions en actions concrètes, tu transformes l'incertitude en <span className="text-foreground font-semibold">clarté</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Habits;
