import { useState, useEffect } from "react";
import { Target, Plus, Trash2, ChevronRight, GitBranch } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Action {
  id: string;
  text: string;
}

interface Goal {
  id: string;
  title: string;
  actions: Action[];
}

const Plan = () => {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("habitflow_goals");
    return saved ? JSON.parse(saved) : [];
  });

  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [newActionText, setNewActionText] = useState("");

  useEffect(() => {
    localStorage.setItem("habitflow_goals", JSON.stringify(goals));
  }, [goals]);

  const addGoal = () => {
    if (!newGoalTitle.trim()) {
      toast.error("Le titre de l'objectif ne peut pas être vide");
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
    toast.success("Objectif ajouté avec succès");
  };

  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter((g) => g.id !== goalId));
    toast.success("Objectif supprimé");
  };

  const addAction = (goalId: string) => {
    if (!newActionText.trim()) {
      toast.error("Le texte de l'action ne peut pas être vide");
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
    toast.success("Action ajoutée");
  };

  const deleteAction = (goalId: string, actionId: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === goalId
          ? { ...goal, actions: goal.actions.filter((a) => a.id !== actionId) }
          : goal
      )
    );
    toast.success("Action supprimée");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Ton <span className="bg-gradient-primary bg-clip-text text-transparent">Plan</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Définis tes objectifs et les actions pour les atteindre
        </p>
      </header>

      <main className="px-6 pt-4 space-y-4 max-w-2xl mx-auto">
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
          <section className="glass rounded-xl p-8 text-center shadow-elevation space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center mb-2">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Commence à planifier</h2>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Cette section te permet de définir tes grands objectifs et de les décomposer en actions concrètes :
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <GitBranch className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Définis tes objectifs de vie (apprendre une langue, améliorer ton physique...)</span>
                </li>
                <li className="flex items-start gap-2">
                  <GitBranch className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Crée des branches d'actions pour chaque objectif</span>
                </li>
                <li className="flex items-start gap-2">
                  <GitBranch className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Visualise le chemin vers ta réussite</span>
                </li>
              </ul>
            </div>
          </section>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => (
              <section key={goal.id} className="glass rounded-xl p-5 shadow-elevation border border-white/5">
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                      <Target className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">{goal.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {goal.actions.length} action{goal.actions.length > 1 ? "s" : ""} pour y parvenir
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
              </section>
            ))}
          </div>
        )}

        {/* Why it's important section */}
        <section className="glass rounded-xl p-6 shadow-elevation border border-primary/10 mt-8">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Pourquoi est-ce important ?</h3>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <span className="text-primary font-semibold">Un objectif sans plan n'est qu'un rêve.</span> Définir tes objectifs et les décomposer en actions concrètes transforme tes ambitions en réalité tangible.
                </p>
                <p>
                  Chaque action que tu identifies devient une <span className="text-foreground font-semibold">étape franchissable</span>. Au lieu d'être submergé par l'ampleur de ton objectif, tu crées un chemin clair, une marche après l'autre.
                </p>
                <p>
                  Ce plan te donne de la <span className="text-primary font-semibold">clarté</span>, te permet de mesurer tes progrès, et surtout, il transforme l'incertitude en <span className="text-foreground font-semibold">action</span>. Chaque branche que tu ajoutes ici est une promesse que tu te fais — et que tu peux tenir.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Plan;
