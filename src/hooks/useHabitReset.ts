import { useEffect } from 'react';

/**
 * Hook to reset habits completed status at midnight
 * Maintains streaks but clears daily completion
 */
export const useHabitReset = () => {
  useEffect(() => {
    const checkAndReset = () => {
      const lastResetDate = localStorage.getItem('habitflow_last_reset');
      const today = new Date().toDateString();

      if (lastResetDate !== today) {
        // Reset all habits completed status but keep streaks
        const habitsJson = localStorage.getItem('habitflow_habits');
        if (habitsJson) {
          const habits = JSON.parse(habitsJson);
          const resetHabits = habits.map((habit: any) => ({
            ...habit,
            completed: false,
          }));
          localStorage.setItem('habitflow_habits', JSON.stringify(resetHabits));
          localStorage.setItem('habitflow_last_reset', today);
        }
      }
    };

    // Check on mount
    checkAndReset();

    // Check every hour
    const interval = setInterval(checkAndReset, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
