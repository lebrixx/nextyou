import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HabitIconType } from "./HabitIcon";
import HabitIcon from "./HabitIcon";
import { toast } from "sonner";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, icon: HabitIconType) => void;
}

const ICONS: HabitIconType[] = [
  "sport", 
  "lecture", 
  "meditation", 
  "hydratation", 
  "nutrition",
  "sommeil",
  "reveil",
  "sante",
  "tabac",
  "alcool",
  "ecrans",
  "sucre",
  "cafe",
  "finance"
];

const AddHabitDialog = ({ open, onOpenChange, onAdd }: AddHabitDialogProps) => {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<HabitIconType>("sport");
  const [reminderTime, setReminderTime] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    
    if (!trimmedName || trimmedName.length > 100) {
      toast.error("Le nom est requis et doit contenir maximum 100 caractères");
      return;
    }

    onAdd(trimmedName, selectedIcon);
    setName("");
    setSelectedIcon("sport");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10">
        <DialogHeader>
          <DialogTitle className="text-foreground">Créer une nouvelle habitude</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Définis une nouvelle habitude à suivre quotidiennement
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name" className="text-foreground text-sm">
              Nom de l'habitude
            </Label>
            <Input
              id="habit-name"
              placeholder="Ex: Lire 10 pages"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass border-white/10 focus:border-primary/50"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground text-sm">Icône</Label>
            <div className="grid grid-cols-7 gap-2 max-h-[200px] overflow-y-auto">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  className={`p-3 rounded-lg transition-all ${
                    selectedIcon === icon
                      ? "bg-gradient-primary shadow-glow"
                      : "glass hover:bg-white/5"
                  }`}
                >
                  <HabitIcon
                    type={icon}
                    className={`w-5 h-5 ${
                      selectedIcon === icon ? "text-primary-foreground" : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reminder-time" className="text-foreground text-sm">
              Rappel (optionnel)
            </Label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="glass border-white/10 focus:border-primary/50"
              placeholder="Ex: 09:00"
            />
            <p className="text-xs text-muted-foreground">
              Reçois une notification à cette heure chaque jour
            </p>
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 glass border-white/10"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 bg-gradient-primary text-primary-foreground shadow-glow"
            >
              Créer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHabitDialog;
