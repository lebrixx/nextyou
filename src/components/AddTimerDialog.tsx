import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { toast } from "sonner";

const timerSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis").max(100, "Le nom doit contenir maximum 100 caractères"),
});

interface AddTimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string) => void;
}

const AddTimerDialog = ({ open, onOpenChange, onAdd }: AddTimerDialogProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = timerSchema.safeParse({ name: name.trim() });
    
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    onAdd(result.data.name);
    setName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass border-white/10">
        <DialogHeader>
          <DialogTitle className="text-foreground">Créer un nouveau compteur</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Démarre un compteur pour mesurer ton progrès
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timer-name" className="text-foreground text-sm">
              Nom du compteur
            </Label>
            <Input
              id="timer-name"
              placeholder="Ex: Sans tabac, Nouveau moi, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass border-white/10 focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground">
              Le compteur commencera immédiatement à partir de maintenant
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

export default AddTimerDialog;
