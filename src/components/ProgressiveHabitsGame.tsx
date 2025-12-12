import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trophy, Flame, ChevronDown, ChevronUp, RotateCcw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useProgressiveHabits } from '@/hooks/useProgressiveHabits';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export const ProgressiveHabitsGame = () => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const {
    state,
    activeHabits,
    habits,
    completeToday,
    skipToday,
    resetGame,
    getProgress,
    hasWon,
    maxPosition,
  } = useProgressiveHabits();

  const handleComplete = () => {
    completeToday();
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const boardSquares = Array.from({ length: maxPosition + 1 }, (_, i) => i);

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10">
      <CardHeader 
        className="cursor-pointer pb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 text-lg">
              🎮
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Petit à Petit
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {state.unlockedHabits}/5 habitudes • Case {state.position}/{maxPosition}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state.streak > 0 && (
              <Badge variant="secondary" className="gap-1 bg-orange-500/20 text-orange-500">
                <Flame className="h-3 w-3" />
                {state.streak}
              </Badge>
            )}
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="space-y-4 pt-2">
              {/* Victory state */}
              {hasWon && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 p-4 text-center"
                >
                  <Trophy className="h-12 w-12 text-yellow-500" />
                  <h3 className="text-lg font-bold text-yellow-500">Félicitations !</h3>
                  <p className="text-sm text-muted-foreground">
                    Tu as maîtrisé les 5 habitudes fondamentales !
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-2">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Recommencer
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Recommencer le jeu ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cela réinitialisera ta progression. Tu devras recommencer depuis le début.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={resetGame}>
                          Recommencer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              )}

              {/* Game board */}
              {!hasWon && (
                <>
                  {/* Progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Départ</span>
                      <span>Arrivée 🏆</span>
                    </div>
                    <div className="relative">
                      <Progress value={getProgress()} className="h-3" />
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 text-lg"
                        style={{ left: `calc(${getProgress()}% - 10px)` }}
                        animate={{ scale: showCelebration ? [1, 1.3, 1] : 1 }}
                      >
                        🏃
                      </motion.div>
                    </div>
                  </div>

                  {/* Board visualization */}
                  <div className="flex flex-wrap gap-1 justify-center py-2">
                    {boardSquares.map((square) => (
                      <motion.div
                        key={square}
                        className={cn(
                          "w-5 h-5 rounded-sm flex items-center justify-center text-[10px] font-medium transition-colors",
                          square === state.position 
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background" 
                            : square < state.position 
                              ? "bg-primary/40" 
                              : "bg-muted"
                        )}
                        animate={square === state.position ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 2 }}
                      >
                        {square === maxPosition ? '🏆' : square === state.position ? '●' : ''}
                      </motion.div>
                    ))}
                  </div>

                  {/* Active habits */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Tes habitudes du jour ({activeHabits.length})
                    </h4>
                    <div className="space-y-2">
                      {activeHabits.map((habit, index) => (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-3 rounded-lg bg-background/50 p-3 border border-border/50"
                        >
                          <span className="text-xl">{habit.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{habit.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{habit.description}</p>
                          </div>
                          {state.todayCompleted && (
                            <Check className="h-5 w-5 text-green-500 shrink-0" />
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Locked habits preview */}
                    {state.unlockedHabits < 5 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Prochaine habitude dans {habits[state.unlockedHabits - 1]?.daysToUnlock - state.streak} jours
                        </p>
                        {habits.slice(state.unlockedHabits).map((habit) => (
                          <div
                            key={habit.id}
                            className="flex items-center gap-3 rounded-lg bg-muted/30 p-2 opacity-50"
                          >
                            <span className="text-lg grayscale">🔒</span>
                            <p className="text-xs text-muted-foreground">???</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      className="flex-1 gap-2"
                      onClick={handleComplete}
                      disabled={state.todayCompleted}
                    >
                      <Check className="h-4 w-4" />
                      {state.todayCompleted ? 'Complété !' : 'Valider (+1)'}
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 text-destructive hover:text-destructive"
                      onClick={skipToday}
                      disabled={state.todayCompleted}
                    >
                      <X className="h-4 w-4" />
                      Raté (-2)
                    </Button>
                  </div>

                  {/* Celebration animation */}
                  <AnimatePresence>
                    {showCelebration && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
                      >
                        <div className="text-6xl">🎉</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Rules reminder */}
              <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="font-medium mb-1">📋 Règles du jeu</p>
                <ul className="space-y-0.5 list-disc list-inside">
                  <li>Complète tes habitudes chaque jour pour avancer d'une case</li>
                  <li>Si tu oublies, tu recules de 2 cases</li>
                  <li>Une nouvelle habitude se débloque tous les 3 jours</li>
                  <li>Atteins la case 20 avec 5 habitudes pour gagner !</li>
                </ul>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
