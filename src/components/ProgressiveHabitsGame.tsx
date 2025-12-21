import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trophy, Flame, ChevronDown, ChevronUp, RotateCcw, Lock, Unlock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProgressiveHabits } from '@/hooks/useProgressiveHabits';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const {
    state,
    activeHabits,
    habits,
    completeToday,
    skipToday,
    resetGame,
    hasWon,
    maxPosition,
  } = useProgressiveHabits();

  const handleComplete = () => {
    completeToday();
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  // Calculate days until next habit unlock
  const currentHabitIndex = state.unlockedHabits - 1;
  const currentHabit = habits[currentHabitIndex];
  const daysUntilNextHabit = currentHabit ? Math.max(0, currentHabit.daysToUnlock - state.streak) : 0;

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 shadow-lg">
      {/* Header - Always visible */}
      <CardHeader 
        className="cursor-pointer p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl shadow-lg shadow-violet-500/30">
                🎯
              </div>
              {state.streak > 0 && (
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-md">
                  {state.streak}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-fuchsia-400">
                Petit à Petit
              </h3>
              <p className="text-xs text-muted-foreground">
                Construis ta routine en {maxPosition} jours
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Mini progress indicator */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div
                    key={num}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      num <= state.unlockedHabits 
                        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500" 
                        : "bg-muted"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {state.unlockedHabits}/5
              </span>
            </div>
            
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/50"
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent className="space-y-5 px-4 pb-5 pt-0">
              {/* Victory state */}
              {hasWon ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 p-6 text-center border border-yellow-500/30"
                >
                  <div className="relative">
                    <Trophy className="h-16 w-16 text-yellow-500" />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -top-2 -right-2"
                    >
                      <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                    Champion ! 🏆
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Tu as maîtrisé les 5 habitudes fondamentales. Ta routine matinale est maintenant solide !
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-2 gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Recommencer l'aventure
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Recommencer le jeu ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ta progression sera réinitialisée. Tu recommenceras depuis le début avec la première habitude.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={resetGame}>Recommencer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </motion.div>
              ) : (
                <>
                  {/* Game Board - Path Style */}
                  <div className="relative rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-4 border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-muted-foreground">🚀 Départ</span>
                      <span className="text-xs font-medium text-muted-foreground">Victoire 🏆</span>
                    </div>
                    
                    {/* Path visualization */}
                    <div className="relative h-12 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 rounded-full overflow-hidden border border-violet-500/30">
                      {/* Completed portion */}
                      <motion.div
                        className="absolute left-0 top-0 h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                        initial={false}
                        animate={{ width: `${(state.position / maxPosition) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                      
                      {/* Milestone markers */}
                      {[5, 10, 15].map((milestone) => (
                        <div
                          key={milestone}
                          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white/30"
                          style={{ left: `${(milestone / maxPosition) * 100}%` }}
                        />
                      ))}
                      
                      {/* Player position */}
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 z-10"
                        initial={false}
                        animate={{ 
                          left: `calc(${(state.position / maxPosition) * 100}% - 16px)`,
                          scale: showCelebration ? [1, 1.3, 1] : 1
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg text-lg border-2 border-violet-500">
                          {state.todayCompleted ? '😊' : '🏃'}
                        </div>
                      </motion.div>
                      
                      {/* Trophy at end */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xl">
                        🏆
                      </div>
                    </div>
                    
                    {/* Position counter */}
                    <div className="flex items-center justify-center mt-3">
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/80 border border-border/50">
                        <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-violet-400 dark:to-fuchsia-400">
                          {state.position}
                        </span>
                        <span className="text-sm text-muted-foreground">/ {maxPosition} cases</span>
                      </div>
                    </div>
                  </div>

                  {/* Today's Status */}
                  {state.todayCompleted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-2 py-2 px-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto w-fit"
                    >
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Journée validée ! Reviens demain
                      </span>
                    </motion.div>
                  )}

                  {/* Active habits */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-violet-500/10 text-violet-500">
                          <Unlock className="h-3.5 w-3.5" />
                        </span>
                        Tes habitudes actives
                      </h4>
                      {state.streak > 0 && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 gap-1">
                          <Flame className="h-3 w-3" />
                          {state.streak} jours
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {activeHabits.map((habit, index) => (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "flex items-center gap-3 rounded-xl p-3 border transition-all",
                            state.todayCompleted 
                              ? "bg-emerald-500/5 border-emerald-500/30" 
                              : "bg-background/60 border-border/50 hover:border-violet-500/30"
                          )}
                        >
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-xl text-xl",
                            state.todayCompleted 
                              ? "bg-emerald-500/10" 
                              : "bg-violet-500/10"
                          )}>
                            {habit.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{habit.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{habit.description}</p>
                          </div>
                          {state.todayCompleted && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500"
                            >
                              <Check className="h-3.5 w-3.5 text-white" />
                            </motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {/* Next habit preview */}
                    {state.unlockedHabits < 5 && (
                      <div className="mt-4 rounded-xl bg-muted/30 p-3 border border-dashed border-muted-foreground/30">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                            <Lock className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground">
                              Prochaine habitude
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              Débloquée dans <span className="font-semibold text-violet-500">{daysUntilNextHabit} jour{daysUntilNextHabit > 1 ? 's' : ''}</span> de série
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            +1 habitude
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {!state.todayCompleted && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <Button
                        onClick={handleComplete}
                        className="h-12 gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white shadow-lg shadow-violet-500/25"
                      >
                        <Check className="h-5 w-5" />
                        <span className="font-semibold">C'est fait !</span>
                      </Button>
                      <Button
                        variant="outline"
                        onClick={skipToday}
                        className="h-12 gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-5 w-5" />
                        <span>J'ai raté</span>
                      </Button>
                    </div>
                  )}

                  {/* Rules - collapsible summary */}
                  <div className="rounded-xl bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5 p-4 border border-violet-500/10">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <div className="text-xl mb-1">✅</div>
                        <p className="text-xs text-muted-foreground">Réussi = <span className="font-semibold text-emerald-500">+1 case</span></p>
                      </div>
                      <div>
                        <div className="text-xl mb-1">❌</div>
                        <p className="text-xs text-muted-foreground">Raté = <span className="font-semibold text-destructive">-2 cases</span></p>
                      </div>
                      <div>
                        <div className="text-xl mb-1">🔓</div>
                        <p className="text-xs text-muted-foreground"><span className="font-semibold text-violet-500">3 jours</span> = +1 habitude</p>
                      </div>
                    </div>
                    
                    {/* Expandable explanation */}
                    <details className="mt-4 group">
                      <summary className="flex items-center justify-center gap-2 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors py-2 border-t border-violet-500/10">
                        <span className="flex items-center gap-1">
                          💡 <span className="underline underline-offset-2">Pourquoi ce jeu est si efficace ?</span>
                        </span>
                        <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                      </summary>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 space-y-4 text-left"
                      >
                        {/* Purpose */}
                        <div className="rounded-lg bg-background/60 p-3 border border-border/50">
                          <h5 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                            🎯 Le but
                          </h5>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Construire une <span className="font-semibold text-violet-500">routine matinale solide</span> en ajoutant progressivement 5 micro-habitudes essentielles. 
                            Pas de changement radical, juste <span className="font-semibold">un petit pas à la fois</span>.
                          </p>
                        </div>
                        
                        {/* Science behind */}
                        <div className="rounded-lg bg-background/60 p-3 border border-border/50">
                          <h5 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                            🧠 La science derrière
                          </h5>
                          <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                            <li className="flex items-start gap-2">
                              <span className="text-violet-500 mt-0.5">•</span>
                              <span><span className="font-semibold text-foreground">Effet cumulatif :</span> 1% de mieux chaque jour = 37x mieux en 1 an</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-violet-500 mt-0.5">•</span>
                              <span><span className="font-semibold text-foreground">Empilage d'habitudes :</span> Une habitude ancrée facilite la suivante</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-violet-500 mt-0.5">•</span>
                              <span><span className="font-semibold text-foreground">Règle des 21 jours :</span> 3 semaines suffisent pour ancrer une habitude</span>
                            </li>
                          </ul>
                        </div>
                        
                        {/* Results */}
                        <div className="rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-500/10 p-3 border border-emerald-500/20">
                          <h5 className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                            📈 Résultats prouvés
                          </h5>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Ceux qui respectent ce système constatent en moyenne :
                          </p>
                          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                            <div className="rounded-lg bg-background/60 p-2">
                              <span className="block text-lg font-bold text-emerald-500">+40%</span>
                              <span className="text-[10px] text-muted-foreground">d'énergie</span>
                            </div>
                            <div className="rounded-lg bg-background/60 p-2">
                              <span className="block text-lg font-bold text-emerald-500">+2h</span>
                              <span className="text-[10px] text-muted-foreground">productives/jour</span>
                            </div>
                            <div className="rounded-lg bg-background/60 p-2">
                              <span className="block text-lg font-bold text-emerald-500">-50%</span>
                              <span className="text-[10px] text-muted-foreground">de stress</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Key insight */}
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                          <span className="text-lg">🔑</span>
                          <p className="text-xs text-muted-foreground italic">
                            "Le secret n'est pas la motivation, c'est la <span className="font-semibold text-violet-500">constance</span>. 
                            Petit + régulier = transformation."
                          </p>
                        </div>
                      </motion.div>
                    </details>
                  </div>
                </>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", damping: 10 }}
              className="text-8xl"
            >
              🎉
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
