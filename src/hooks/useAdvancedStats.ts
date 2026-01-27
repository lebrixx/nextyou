import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Habit {
  id: string;
  name: string;
  streak: number;
  best_streak: number;
  completed: boolean;
  created_at: string;
}

interface Completion {
  habit_id: string;
  completed_at: string;
}

interface DayStats {
  date: string;
  dayName: string;
  completions: number;
  total: number;
  rate: number;
}

interface WeeklyData {
  week: string;
  rate: number;
  completions: number;
}

interface DayOfWeekStats {
  day: string;
  dayShort: string;
  avgRate: number;
  totalCompletions: number;
  count: number;
}

interface Prediction {
  daysToGoal: number;
  projectedStreak: number;
  weeklyTarget: number;
  currentWeekProgress: number;
  streakHealth: 'excellent' | 'good' | 'warning' | 'danger';
  nextMilestone: number;
  daysToMilestone: number;
}

export const useAdvancedStats = (habits: Habit[]) => {
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Fetch last 90 days of completions
        const ninetyDaysAgo = format(subDays(new Date(), 90), 'yyyy-MM-dd');
        
        const { data, error } = await supabase
          .from('habit_completions')
          .select('habit_id, completed_at')
          .eq('user_id', user.id)
          .gte('completed_at', ninetyDaysAgo)
          .order('completed_at', { ascending: false });

        if (!error && data) {
          setCompletions(data);
        }
      } catch (err) {
        console.error('Error fetching completions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletions();
  }, []);

  // Last 7 days stats
  const last7Days = useMemo((): DayStats[] => {
    const days: DayStats[] = [];
    const totalHabits = habits.length;

    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCompletions = completions.filter(c => c.completed_at === dateStr).length;

      days.push({
        date: dateStr,
        dayName: format(date, 'EEE', { locale: fr }),
        completions: dayCompletions,
        total: totalHabits,
        rate: totalHabits > 0 ? Math.round((dayCompletions / totalHabits) * 100) : 0
      });
    }

    return days;
  }, [completions, habits]);

  // Last 30 days stats
  const last30Days = useMemo((): DayStats[] => {
    const days: DayStats[] = [];
    const totalHabits = habits.length;

    for (let i = 29; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCompletions = completions.filter(c => c.completed_at === dateStr).length;

      days.push({
        date: dateStr,
        dayName: format(date, 'd', { locale: fr }),
        completions: dayCompletions,
        total: totalHabits,
        rate: totalHabits > 0 ? Math.round((dayCompletions / totalHabits) * 100) : 0
      });
    }

    return days;
  }, [completions, habits]);

  // Weekly comparison (last 4 weeks)
  const weeklyComparison = useMemo((): WeeklyData[] => {
    const weeks: WeeklyData[] = [];
    const totalHabits = habits.length;

    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
      const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      let weekCompletions = 0;
      daysInWeek.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        weekCompletions += completions.filter(c => c.completed_at === dateStr).length;
      });

      const possibleCompletions = totalHabits * 7;
      
      weeks.push({
        week: i === 0 ? 'Cette sem.' : i === 1 ? 'Sem. -1' : `Sem. -${i}`,
        rate: possibleCompletions > 0 ? Math.round((weekCompletions / possibleCompletions) * 100) : 0,
        completions: weekCompletions
      });
    }

    return weeks;
  }, [completions, habits]);

  // Stats by day of week
  const dayOfWeekStats = useMemo((): DayOfWeekStats[] => {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const dayFullNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const stats: { [key: number]: { total: number; completions: number; count: number } } = {};

    // Initialize
    for (let i = 0; i < 7; i++) {
      stats[i] = { total: 0, completions: 0, count: 0 };
    }

    // Count completions per day of week
    const last90Days = subDays(new Date(), 90);
    for (let i = 0; i < 90; i++) {
      const date = subDays(new Date(), i);
      const dayOfWeek = date.getDay();
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCompletions = completions.filter(c => c.completed_at === dateStr).length;
      
      stats[dayOfWeek].completions += dayCompletions;
      stats[dayOfWeek].total += habits.length;
      stats[dayOfWeek].count++;
    }

    // Reorder to start from Monday
    const orderedDays = [1, 2, 3, 4, 5, 6, 0];
    
    return orderedDays.map(dayIndex => ({
      day: dayFullNames[dayIndex],
      dayShort: dayNames[dayIndex],
      avgRate: stats[dayIndex].total > 0 
        ? Math.round((stats[dayIndex].completions / stats[dayIndex].total) * 100) 
        : 0,
      totalCompletions: stats[dayIndex].completions,
      count: stats[dayIndex].count
    }));
  }, [completions, habits]);

  // Best and worst days
  const bestDay = useMemo(() => {
    if (dayOfWeekStats.length === 0) return null;
    return dayOfWeekStats.reduce((best, current) => 
      current.avgRate > best.avgRate ? current : best
    );
  }, [dayOfWeekStats]);

  const worstDay = useMemo(() => {
    if (dayOfWeekStats.length === 0) return null;
    return dayOfWeekStats.reduce((worst, current) => 
      current.avgRate < worst.avgRate ? current : worst
    );
  }, [dayOfWeekStats]);

  // Predictions & Goals
  const predictions = useMemo((): Prediction => {
    const currentStreak = habits.length > 0 
      ? Math.max(...habits.map(h => h.streak))
      : 0;
    
    const avgCompletion = last30Days.length > 0
      ? last30Days.reduce((sum, d) => sum + d.rate, 0) / last30Days.length
      : 0;

    // Calculate streak health based on recent activity
    const last3DaysRate = last7Days.slice(-3).reduce((sum, d) => sum + d.rate, 0) / 3;
    let streakHealth: 'excellent' | 'good' | 'warning' | 'danger';
    if (last3DaysRate >= 80) streakHealth = 'excellent';
    else if (last3DaysRate >= 60) streakHealth = 'good';
    else if (last3DaysRate >= 40) streakHealth = 'warning';
    else streakHealth = 'danger';

    // Project streak based on current momentum
    const projectedStreak = Math.round(currentStreak + (avgCompletion / 100) * 7);

    // Calculate weekly progress
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const daysThisWeek = eachDayOfInterval({ start: weekStart, end: new Date() });
    let currentWeekCompletions = 0;
    daysThisWeek.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      currentWeekCompletions += completions.filter(c => c.completed_at === dateStr).length;
    });
    const weeklyTarget = habits.length * 7;
    const currentWeekProgress = weeklyTarget > 0 
      ? Math.round((currentWeekCompletions / weeklyTarget) * 100)
      : 0;

    // Next milestone calculation
    const milestones = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];
    const nextMilestone = milestones.find(m => m > currentStreak) || currentStreak + 30;
    const daysToMilestone = nextMilestone - currentStreak;

    // Days to goal (assuming 100% completion rate needed)
    const daysToGoal = avgCompletion > 0 
      ? Math.round((100 - avgCompletion) / (avgCompletion / 30))
      : 30;

    return {
      daysToGoal,
      projectedStreak,
      weeklyTarget,
      currentWeekProgress,
      streakHealth,
      nextMilestone,
      daysToMilestone
    };
  }, [habits, last7Days, last30Days, completions]);

  // Trend (comparing last 7 days to previous 7 days)
  const trend = useMemo(() => {
    const last7Total = last7Days.reduce((sum, d) => sum + d.rate, 0);
    
    // Calculate previous 7 days
    let prev7Total = 0;
    for (let i = 13; i >= 7; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayCompletions = completions.filter(c => c.completed_at === dateStr).length;
      const rate = habits.length > 0 ? Math.round((dayCompletions / habits.length) * 100) : 0;
      prev7Total += rate;
    }

    const diff = last7Total - prev7Total;
    const percentChange = prev7Total > 0 ? Math.round((diff / prev7Total) * 100) : 0;

    return {
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      percentChange: Math.abs(percentChange),
      diff: Math.round(diff / 7) // Average daily change
    };
  }, [last7Days, completions, habits]);

  // Total stats
  const totalStats = useMemo(() => {
    const totalCompletions = completions.length;
    const perfectDays = last30Days.filter(d => d.rate === 100).length;
    const consistencyScore = last30Days.length > 0
      ? Math.round(last30Days.filter(d => d.rate >= 50).length / last30Days.length * 100)
      : 0;
    
    const longestStreak = habits.length > 0 
      ? Math.max(...habits.map(h => h.best_streak || h.streak))
      : 0;

    return {
      totalCompletions,
      perfectDays,
      consistencyScore,
      longestStreak
    };
  }, [completions, last30Days, habits]);

  return {
    loading,
    last7Days,
    last30Days,
    weeklyComparison,
    dayOfWeekStats,
    bestDay,
    worstDay,
    predictions,
    trend,
    totalStats
  };
};
