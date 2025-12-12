import { useState, useEffect, useCallback } from 'react';

export interface ProgressiveHabit {
  id: string;
  name: string;
  description: string;
  icon: string;
  daysToUnlock: number; // Days of success needed to unlock next habit
}

export interface ProgressiveHabitsState {
  position: number; // Current position on the board (0-20)
  currentDay: number; // Current day in the challenge
  unlockedHabits: number; // Number of unlocked habits (1-5)
  todayCompleted: boolean;
  lastCompletedDate: string | null;
  streak: number;
}

const PROGRESSIVE_HABITS: ProgressiveHabit[] = [
  {
    id: 'wake-up',
    name: 'Se lever au premier réveil',
    description: 'Ne pas snooze, se lever immédiatement',
    icon: '⏰',
    daysToUnlock: 3,
  },
  {
    id: 'make-bed',
    name: 'Faire son lit',
    description: 'Commencer la journée avec une petite victoire',
    icon: '🛏️',
    daysToUnlock: 3,
  },
  {
    id: 'hydrate',
    name: 'Boire un verre d\'eau',
    description: 'Hydrater son corps dès le réveil',
    icon: '💧',
    daysToUnlock: 3,
  },
  {
    id: 'stretch',
    name: '5 min d\'étirements',
    description: 'Réveiller son corps en douceur',
    icon: '🧘',
    daysToUnlock: 3,
  },
  {
    id: 'plan-day',
    name: 'Planifier sa journée',
    description: 'Écrire 3 priorités pour la journée',
    icon: '📝',
    daysToUnlock: 0, // Last habit
  },
];

const INITIAL_STATE: ProgressiveHabitsState = {
  position: 0,
  currentDay: 1,
  unlockedHabits: 1,
  todayCompleted: false,
  lastCompletedDate: null,
  streak: 0,
};

const STORAGE_KEY = 'progressive-habits-state';
const MAX_POSITION = 20;

export const useProgressiveHabits = () => {
  const [state, setState] = useState<ProgressiveHabitsState>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Reset todayCompleted if it's a new day
      const today = new Date().toDateString();
      if (parsed.lastCompletedDate !== today) {
        return { ...parsed, todayCompleted: false };
      }
      return parsed;
    }
    return INITIAL_STATE;
  });

  // Check for missed days on load
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDate = state.lastCompletedDate;
    
    if (lastDate && lastDate !== today) {
      const last = new Date(lastDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
      
      // If more than 1 day passed without completion, go back
      if (diffDays > 1) {
        const missedDays = diffDays - 1;
        const penalty = missedDays * 2; // Go back 2 squares per missed day
        setState(prev => ({
          ...prev,
          position: Math.max(0, prev.position - penalty),
          streak: 0,
          todayCompleted: false,
        }));
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getActiveHabits = useCallback(() => {
    return PROGRESSIVE_HABITS.slice(0, state.unlockedHabits);
  }, [state.unlockedHabits]);

  const completeToday = useCallback(() => {
    if (state.todayCompleted) return;

    const today = new Date().toDateString();
    const newStreak = state.streak + 1;
    const newPosition = Math.min(MAX_POSITION, state.position + 1);
    
    // Check if we should unlock a new habit
    let newUnlockedHabits = state.unlockedHabits;
    const currentHabit = PROGRESSIVE_HABITS[state.unlockedHabits - 1];
    
    if (currentHabit && newStreak >= currentHabit.daysToUnlock && state.unlockedHabits < 5) {
      newUnlockedHabits = state.unlockedHabits + 1;
    }

    setState({
      position: newPosition,
      currentDay: state.currentDay + 1,
      unlockedHabits: newUnlockedHabits,
      todayCompleted: true,
      lastCompletedDate: today,
      streak: newStreak,
    });
  }, [state]);

  const skipToday = useCallback(() => {
    if (state.todayCompleted) return;

    const today = new Date().toDateString();
    const newPosition = Math.max(0, state.position - 2);

    setState(prev => ({
      ...prev,
      position: newPosition,
      todayCompleted: true,
      lastCompletedDate: today,
      streak: 0,
    }));
  }, [state.todayCompleted, state.position]);

  const resetGame = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const getProgress = useCallback(() => {
    return (state.position / MAX_POSITION) * 100;
  }, [state.position]);

  const hasWon = state.position >= MAX_POSITION && state.unlockedHabits >= 5;

  return {
    state,
    habits: PROGRESSIVE_HABITS,
    activeHabits: getActiveHabits(),
    completeToday,
    skipToday,
    resetGame,
    getProgress,
    hasWon,
    maxPosition: MAX_POSITION,
  };
};
