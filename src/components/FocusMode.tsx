import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { X, Play, Pause } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface FocusModeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  duration: number;
  onComplete: () => void;
}

export const FocusMode = ({ open, onOpenChange, duration, onComplete }: FocusModeProps) => {
  const [intention, setIntention] = useState('');
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [exitReason, setExitReason] = useState('');

  useEffect(() => {
    if (!started || isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [started, isPaused]);

  const handleStart = async () => {
    if (!intention.trim()) return;
    setStarted(true);
    await Haptics.impact({ style: ImpactStyle.Medium });
  };

  const handleComplete = async () => {
    await Haptics.impact({ style: ImpactStyle.Heavy });
    onComplete();
    handleReset();
  };

  const handleExit = () => {
    setShowExitDialog(true);
  };

  const confirmExit = async () => {
    await Haptics.impact({ style: ImpactStyle.Light });
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setStarted(false);
    setTimeLeft(duration * 60);
    setIsPaused(false);
    setIntention('');
    setShowExitDialog(false);
    setExitReason('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-full w-full h-full m-0 p-0 bg-gradient-to-br from-background via-background/95 to-primary/10 border-0"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          {!started ? (
            <div className="flex flex-col items-center justify-center h-full p-8 space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Mode Focus Total
                </h2>
                <p className="text-muted-foreground">
                  Quelle est ton intention pour cette session ?
                </p>
              </div>

              <Textarea
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                placeholder="Ex: Avancer sur mon projet, me concentrer sur ma lecture..."
                className="max-w-md h-32 text-lg bg-background/50 backdrop-blur-sm border-primary/20"
              />

              <div className="flex gap-4">
                <Button
                  size="lg"
                  onClick={handleStart}
                  disabled={!intention.trim()}
                  className="px-8"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Commencer
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="w-5 h-5 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4"
                onClick={handleExit}
              >
                <X className="w-5 h-5" />
              </Button>

              <div className="text-center space-y-8">
                <div className="space-y-2">
                  <p className="text-muted-foreground text-sm">Ton intention</p>
                  <p className="text-xl font-medium">{intention}</p>
                </div>

                <div className="relative">
                  <svg className="w-64 h-64 transform -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-muted-foreground/20"
                    />
                    <circle
                      cx="128"
                      cy="128"
                      r="120"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 120}`}
                      strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                      className="text-primary transition-all duration-1000"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-bold">{formatTime(timeLeft)}</span>
                  </div>
                </div>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setIsPaused(!isPaused)}
                  className="px-8"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Reprendre
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <DialogContent className="bg-background/95 backdrop-blur-sm border-primary/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pourquoi veux-tu arrêter ?</h3>
            <Textarea
              value={exitReason}
              onChange={(e) => setExitReason(e.target.value)}
              placeholder="Prends un moment pour réfléchir..."
              className="h-24"
            />
            <div className="flex gap-2">
              <Button onClick={confirmExit} variant="destructive" className="flex-1">
                Quitter quand même
              </Button>
              <Button onClick={() => setShowExitDialog(false)} variant="outline" className="flex-1">
                Continuer le focus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
