import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HabitIconType } from "./HabitIcon";
import HabitIcon from "./HabitIcon";

interface AddHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, icon: HabitIconType) => void;
}

const ICONS: HabitIconType[] = ["sport", "lecture", "meditation", "hydratation", "tabac"];

const AddHabitDialog = ({ open, onOpenChange, onAdd }: AddHabitDialogProps) => {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<HabitIconType>("sport");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), selectedIcon);
      setName("");
      setSelectedIcon("sport");
      onOpenChange(false);
    }
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
            <div className="grid grid-cols-5 gap-2">
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
