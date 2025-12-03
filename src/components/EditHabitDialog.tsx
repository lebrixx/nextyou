import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash2, Bell, Save } from "lucide-react";
import TimePickerWheel from "@/components/TimePickerWheel";
import { toast } from "@/hooks/use-toast";

interface EditHabitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit: {
    id: string;
    name: string;
    icon: string;
    streak: number;
    completed: boolean;
    reminderEnabled?: boolean;
    reminderTime?: string;
  } | null;
  onSave: (habit: { id: string; name: string; reminderEnabled: boolean; reminderTime: string }) => void;
  onDelete: (id: string) => void;
}

const EditHabitDialog = ({ open, onOpenChange, habit, onSave, onDelete }: EditHabitDialogProps) => {
  const [name, setName] = useState(habit?.name || "");
  const [reminderEnabled, setReminderEnabled] = useState(habit?.reminderEnabled || false);
  const [reminderTime, setReminderTime] = useState(habit?.reminderTime || "08:00");

  // Update local state when habit changes
  useState(() => {
    if (habit) {
      setName(habit.name);
      setReminderEnabled(habit.reminderEnabled || false);
      setReminderTime(habit.reminderTime || "08:00");
    }
  });

  const handleSave = () => {
    if (!habit) return;
    if (!name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'habitude ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }
    onSave({ id: habit.id, name, reminderEnabled, reminderTime });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!habit) return;
    onDelete(habit.id);
    onOpenChange(false);
  };

  if (!habit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-md max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Modifier l'habitude</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="habit-name" className="text-foreground font-medium">
              Nom de l'habitude
            </Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Méditer 10 minutes"
              className="glass border-white/10 focus:border-primary/50"
            />
          </div>

          {/* Reminder Section */}
          <div className="space-y-4 glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Rappel</p>
                  <p className="text-xs text-muted-foreground">Notification quotidienne</p>
                </div>
              </div>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>

            {reminderEnabled && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <Label className="text-foreground text-sm">Heure du rappel</Label>
                <TimePickerWheel
                  value={reminderTime}
                  onChange={setReminderTime}
                  minuteStep={5}
                />
              </div>
            )}
          </div>

          {/* Streak Info */}
          <div className="glass rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Série actuelle</p>
              <p className="text-lg font-bold text-primary">{habit.streak} jours 🔥</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-primary text-primary-foreground shadow-glow"
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer
            </Button>
            <Button
              onClick={handleDelete}
              variant="outline"
              className="glass border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditHabitDialog;
