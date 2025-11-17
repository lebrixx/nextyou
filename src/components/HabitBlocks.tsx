import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar, Clock, Plus, Trash2 } from 'lucide-react';
import { useHabitBlocks } from '@/hooks/useHabitBlocks';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from '@/hooks/use-toast';

interface HabitBlocksProps {
  userId: string | undefined;
  habits: any[];
}

export const HabitBlocks = ({ userId, habits }: HabitBlocksProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string>('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const { blocks, loading, addBlock, deleteBlock } = useHabitBlocks(userId, selectedDate);

  const handleAddBlock = async () => {
    if (!selectedHabit) {
      toast({
        title: 'Erreur',
        description: 'Sélectionne une habitude.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await addBlock(selectedHabit, startTime, endTime);
      toast({
        title: 'Bloc ajouté',
        description: 'Le bloc a été planifié avec succès.'
      });
      setShowAddDialog(false);
      setSelectedHabit('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter le bloc.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await deleteBlock(blockId);
      toast({
        title: 'Bloc supprimé',
        description: 'Le bloc a été retiré du planning.'
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le bloc.',
        variant: 'destructive'
      });
    }
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          NextMe Blocks - Planning Journalier
        </CardTitle>
        <CardDescription>
          Organise tes habitudes dans un planning visuel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              setSelectedDate(newDate);
            }}
          >
            ←
          </Button>
          <div className="flex-1 text-center font-semibold">
            {selectedDate.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              setSelectedDate(newDate);
            }}
          >
            →
          </Button>
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un bloc
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-background/95 backdrop-blur-sm border-primary/20">
            <DialogHeader>
              <DialogTitle>Planifier une habitude</DialogTitle>
              <DialogDescription>
                Ajoute un bloc de temps pour cette habitude
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Habitude</label>
                <Select value={selectedHabit} onValueChange={setSelectedHabit}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionne une habitude" />
                  </SelectTrigger>
                  <SelectContent>
                    {habits.filter(h => !h.is_archived).map(habit => (
                      <SelectItem key={habit.id} value={habit.id}>
                        {habit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Début</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md"
                  />
                </div>
              </div>

              <Button onClick={handleAddBlock} className="w-full">
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="border border-border rounded-lg overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">
                Chargement...
              </div>
            ) : blocks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Aucun bloc planifié pour cette journée
              </div>
            ) : (
              <div className="divide-y divide-border">
                {blocks.map(block => {
                  const habit = habits.find(h => h.id === block.habit_id);
                  if (!habit) return null;

                  return (
                    <div 
                      key={block.id}
                      className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{habit.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {block.start_time} - {block.end_time}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteBlock(block.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
