/**
 * Calculates the current streak for a habit based on completion dates.
 * A streak is the number of consecutive days the habit was completed,
 * ending today or yesterday (to allow completing today's habit).
 */
export const calculateStreak = (completionDates: string[]): number => {
  if (!completionDates || completionDates.length === 0) return 0;

  // Get unique dates and sort descending (most recent first)
  const uniqueDates = [...new Set(completionDates)].sort().reverse();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Check if the most recent completion is today or yesterday
  const mostRecentDate = uniqueDates[0];
  
  // If most recent is older than yesterday, streak is broken
  if (mostRecentDate !== todayStr && mostRecentDate !== yesterdayStr) {
    return 0;
  }
  
  // Count consecutive days backwards
  let streak = 0;
  let checkDate = new Date(mostRecentDate);
  
  for (const dateStr of uniqueDates) {
    const expectedDateStr = checkDate.toISOString().split('T')[0];
    
    if (dateStr === expectedDateStr) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (dateStr < expectedDateStr) {
      // Gap found, streak ends
      break;
    }
    // If dateStr > expectedDateStr, it's a duplicate or future date, skip
  }
  
  return streak;
};

/**
 * Calculate streaks for multiple habits at once.
 * Returns a map of habitId -> streak count
 */
export const calculateStreaksForHabits = (
  habitIds: string[],
  completions: { habit_id: string; completed_at: string }[]
): Map<string, number> => {
  const streakMap = new Map<string, number>();
  
  // Group completions by habit_id
  const completionsByHabit = new Map<string, string[]>();
  
  for (const completion of completions) {
    if (!completion.habit_id) continue;
    
    const existing = completionsByHabit.get(completion.habit_id) || [];
    existing.push(completion.completed_at);
    completionsByHabit.set(completion.habit_id, existing);
  }
  
  // Calculate streak for each habit
  for (const habitId of habitIds) {
    const dates = completionsByHabit.get(habitId) || [];
    const streak = calculateStreak(dates);
    streakMap.set(habitId, streak);
  }
  
  return streakMap;
};
