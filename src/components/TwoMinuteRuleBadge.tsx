import { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Zap, Play, X } from 'lucide-react';
import { useTwoMinuteRule } from '@/hooks/useTwoMinuteRule';
import { toast } from '@/hooks/use-toast';

interface TwoMinuteRuleBadgeProps {
  habit: any;
  completions: any[];
  onUpdate?: () => void;
}

export const TwoMinuteRuleBadge = ({ habit, completions, onUpdate }: TwoMinuteRuleBadgeProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const { activateTwoMinuteVersion, deactivateTwoMinuteVersion } = useTwoMinuteRule([habit], completions);

  // Check if blocked
  const habitCompletions = completions.filter(c => c.habit_id === habit.id);
  const today = new Date();
  const last10Days = habitCompletions.filter(c => {
    const completedDate = new Date(c.completed_at);
    const daysDiff = Math.floor((today.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 10;
  });
  
  const completionRate = (last10Days.length / 10) * 100;
  const lastCompletion = habitCompletions[habitCompletions.length - 1];
  const daysSinceLastCompletion = lastCompletion 
    ? Math.floor((today.getTime() - new Date(lastCompletion.completed_at).getTime()) / (1000 * 60 * 60 * 24))
    : 999;
  
  const isBlocked = completionRate < 40 || daysSinceLastCompletion > 5;

  const handleActivate = async () => {
    try {
      await activateTwoMinuteVersion(habit.id);
      toast({
        title: 'Version 2 minutes activée',
        description: 'L\'habitude a été simplifiée.'
      });
      setShowDialog(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'activer la version 2 minutes.',
        variant: 'destructive'
      });
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateTwoMinuteVersion(habit.id);
      toast({
        title: 'Version normale restaurée',
        description: 'L\'habitude est revenue à sa version originale.'
      });
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de désactiver la version 2 minutes.',
        variant: 'destructive'
      });
    }
  };

  // Show nothing if no 2-minute version available
  if (!habit.two_minute_version) return null;

  // Show active badge if 2-minute version is active
  if (habit.is_two_minute_active) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-primary/20 text-primary border-primary/40">
          <Zap className="w-3 h-3 mr-1" />
          2 MIN
        </Badge>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDeactivate}
          className="h-6 px-2"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  // Show available badge if blocked
  if (isBlocked) {
    return (
      <>
        <Badge 
          className="bg-yellow-500/20 text-yellow-300 border-yellow-500/40 cursor-pointer hover:bg-yellow-500/30 transition-colors"
          onClick={() => setShowDialog(true)}
        >
          <Zap className="w-3 h-3 mr-1" />
          2 minutes disponible
        </Badge>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-background/95 backdrop-blur-sm border-primary/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Tu sembles bloqué sur cette habitude
              </DialogTitle>
              <DialogDescription>
                Voici une version ultra-simple pour te débloquer et reprendre l'élan
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Version originale</h4>
                <p className="text-sm text-muted-foreground">{habit.name}</p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <h4 className="font-semibold text-sm">Version 2 minutes</h4>
                </div>
                <p className="text-sm text-muted-foreground">{habit.two_minute_version}</p>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleActivate} className="flex-1">
                  <Play className="w-4 h-4 mr-2" />
                  Activer la version simplifiée
                </Button>
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Continuer comme ça
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
};
