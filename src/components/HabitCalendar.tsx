import { useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from "date-fns";
import { fr } from "date-fns/locale";

interface HabitCompletion {
  completed_at: string;
}

interface HabitCalendarProps {
  completions: HabitCompletion[];
  currentMonth?: Date;
}

const HabitCalendar = ({ completions, currentMonth = new Date() }: HabitCalendarProps) => {
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const completionDates = useMemo(() => {
    return new Set(completions.map(c => format(new Date(c.completed_at), 'yyyy-MM-dd')));
  }, [completions]);

  const getDayColor = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const isCompleted = completionDates.has(dateStr);
    
    if (isToday(day)) {
      return isCompleted 
        ? "bg-gradient-primary border-2 border-primary shadow-glow" 
        : "border-2 border-primary/50 bg-muted";
    }
    
    if (isCompleted) {
      return "bg-primary/80 shadow-sm";
    }
    
    return "bg-muted/30 hover:bg-muted/50";
  };

  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        📅 {format(currentMonth, 'MMMM yyyy', { locale: fr })}
      </h3>
      
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day, i) => (
          <div key={i} className="text-center text-xs font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => (
          <div
            key={i}
            className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-all duration-200 ${getDayColor(day)}`}
          >
            {format(day, 'd')}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/80"></div>
          <span>Complété</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-primary/50"></div>
          <span>Aujourd'hui</span>
        </div>
      </div>
    </div>
  );
};

export default HabitCalendar;