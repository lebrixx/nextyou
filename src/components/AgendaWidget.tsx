import { useState } from 'react';
import { Calendar, ChevronDown, ChevronRight, Bell, Check, Trash2 } from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { fr, enUS, es, de, it } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import AddReminderDialog from './AddReminderDialog';
import { useReminders } from '@/hooks/useReminders';
import { useTranslation } from '@/lib/i18n';

const localeMap = {
  fr: fr,
  en: enUS,
  es: es,
  de: de,
  it: it,
};

const AgendaWidget = () => {
  const { t, language } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { reminders, addReminder, completeReminder, deleteReminder } = useReminders();

  const locale = localeMap[language];
  const upcomingReminders = reminders.slice(0, 3);

  // Show 7 days starting from today (rolling week)
  const today = new Date();
  const weekDays = eachDayOfInterval({ 
    start: today, 
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6) 
  });

  const getRemindersForDay = (day: Date) => {
    return reminders.filter(r => isSameDay(parseISO(r.reminder_date), day));
  };

  return (
    <section className="space-y-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full group">
            <div className="glass rounded-xl p-4 shadow-elevation border border-primary/20 hover:border-primary/40 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-primary shadow-glow flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Calendar className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {t('agenda')}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {upcomingReminders.length > 0 
                        ? `${upcomingReminders.length} ${t('agendaPreview').toLowerCase()}`
                        : t('noReminders')}
                    </p>
                  </div>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </div>
              
              {!isOpen && upcomingReminders.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                  {upcomingReminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 text-primary shrink-0" />
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {reminder.title}
                      </p>
                      <span className="text-xs text-muted-foreground/70">
                        {format(parseISO(reminder.reminder_date), 'dd/MM', { locale })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-3 animate-accordion-down">
          <div className="glass rounded-xl p-4 border border-white/10">
            <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              {t('viewWeek')}
            </h4>
            
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day) => {
                const dayReminders = getRemindersForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`p-2 rounded-lg text-center transition-all ${
                      isToday 
                        ? 'bg-gradient-primary border-2 border-primary shadow-glow' 
                        : 'bg-background/50 border border-white/5'
                    }`}
                  >
                    <p className={`text-xs font-semibold mb-1 ${
                      isToday ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}>
                      {format(day, 'EEE', { locale }).slice(0, 1)}
                    </p>
                    <p className={`text-lg font-bold ${
                      isToday ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                      {format(day, 'd')}
                    </p>
                    {dayReminders.length > 0 && (
                      <div className="mt-1 flex justify-center gap-1">
                        {dayReminders.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-1 rounded-full ${
                              isToday ? 'bg-primary-foreground' : 'bg-primary'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 mb-3">
              {reminders.length > 0 ? (
                reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="glass rounded-lg p-3 border border-white/10 hover:border-primary/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-foreground">{reminder.title}</p>
                          {reminder.notification_enabled && (
                            <Bell className="w-3 h-3 text-primary" />
                          )}
                        </div>
                        {reminder.description && (
                          <p className="text-xs text-muted-foreground mb-1">{reminder.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(reminder.reminder_date), 'EEEE dd MMMM yyyy', { locale })}
                          {reminder.reminder_time && ` ${t('at')} ${reminder.reminder_time}`}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => completeReminder(reminder.id)}
                          className="h-7 w-7 p-0 hover:bg-primary/10"
                        >
                          <Check className="w-3 h-3 text-primary" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReminder(reminder.id)}
                          className="h-7 w-7 p-0 hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">{t('noReminders')}</p>
                </div>
              )}
            </div>

            <AddReminderDialog onAdd={addReminder} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};

export default AgendaWidget;
