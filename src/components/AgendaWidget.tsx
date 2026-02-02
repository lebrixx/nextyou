import { useState } from 'react';
import { Calendar, ChevronDown, Bell, Check, Trash2, Plus, Clock, CalendarDays } from 'lucide-react';
import { format, parseISO, eachDayOfInterval, isSameDay, isToday as isDateToday, isTomorrow, isPast, differenceInDays } from 'date-fns';
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

  const getRelativeDate = (dateString: string) => {
    const date = parseISO(dateString);
    if (isDateToday(date)) return "Aujourd'hui";
    if (isTomorrow(date)) return "Demain";
    const days = differenceInDays(date, today);
    if (days <= 7) return `Dans ${days} jours`;
    return format(date, 'dd MMM', { locale });
  };

  const getReminderPriority = (dateString: string) => {
    const date = parseISO(dateString);
    if (isPast(date) && !isDateToday(date)) return 'overdue';
    if (isDateToday(date)) return 'today';
    if (isTomorrow(date)) return 'tomorrow';
    return 'upcoming';
  };

  return (
    <section className="space-y-3">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button className="w-full group">
            <div className="glass rounded-2xl p-5 shadow-elevation border border-primary/30 hover:border-primary/50 transition-all hover:shadow-glow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CalendarDays className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      Mes rappels
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {reminders.length === 0 
                        ? "Aucun rappel programmé"
                        : reminders.length === 1
                        ? "1 rappel à venir"
                        : `${reminders.length} rappels à venir`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {reminders.length > 0 && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">{reminders.length}</span>
                    </div>
                  )}
                  <ChevronDown 
                    className={`w-5 h-5 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>
              
              {/* Aperçu des prochains rappels (fermé) */}
              {!isOpen && upcomingReminders.length > 0 && (
                <div className="mt-4 space-y-2">
                  {upcomingReminders.map((reminder) => {
                    const priority = getReminderPriority(reminder.reminder_date);
                    return (
                      <div 
                        key={reminder.id} 
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          priority === 'today' 
                            ? 'bg-gradient-to-r from-primary/25 to-primary/10 border border-primary/40' 
                            : priority === 'tomorrow'
                            ? 'bg-amber-500/10 border border-amber-500/30'
                            : 'bg-white/5 border border-white/10'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          priority === 'today' 
                            ? 'bg-primary/30' 
                            : priority === 'tomorrow'
                            ? 'bg-amber-500/20'
                            : 'bg-white/10'
                        }`}>
                          <Bell className={`w-5 h-5 ${
                            priority === 'today' ? 'text-primary' : priority === 'tomorrow' ? 'text-amber-400' : 'text-muted-foreground'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {reminder.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-xs font-medium ${
                              priority === 'today' ? 'text-primary' : priority === 'tomorrow' ? 'text-amber-400' : 'text-muted-foreground'
                            }`}>
                              {getRelativeDate(reminder.reminder_date)}
                            </span>
                            {reminder.reminder_time && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {reminder.reminder_time}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Message d'aide quand vide */}
              {!isOpen && reminders.length === 0 && (
                <div className="mt-4 p-3 rounded-xl bg-white/5 border border-dashed border-white/20">
                  <p className="text-xs text-muted-foreground text-center">
                    📅 Clique pour ajouter ton premier rappel
                  </p>
                </div>
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-3 animate-accordion-down">
          <div className="glass rounded-xl p-4 border border-white/10">
            {/* Header avec explication */}
            <div className="mb-4">
              <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Vue de la semaine
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Les points indiquent les jours avec des rappels
              </p>
            </div>
            
            {/* Calendrier de la semaine */}
            <div className="grid grid-cols-7 gap-1.5 mb-5">
              {weekDays.map((day) => {
                const dayReminders = getRemindersForDay(day);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`p-2 rounded-xl text-center transition-all ${
                      isToday 
                        ? 'bg-gradient-primary border-2 border-primary shadow-glow' 
                        : dayReminders.length > 0
                        ? 'bg-primary/10 border border-primary/30'
                        : 'bg-background/50 border border-white/5'
                    }`}
                  >
                    <p className={`text-[10px] font-semibold uppercase tracking-wide mb-0.5 ${
                      isToday ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}>
                      {format(day, 'EEE', { locale }).slice(0, 3)}
                    </p>
                    <p className={`text-lg font-bold ${
                      isToday ? 'text-primary-foreground' : 'text-foreground'
                    }`}>
                      {format(day, 'd')}
                    </p>
                    {dayReminders.length > 0 && (
                      <div className="mt-1 flex justify-center gap-0.5">
                        {dayReminders.slice(0, 3).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
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

            {/* Liste des rappels */}
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                Tous mes rappels
              </h5>
              
              <div className="space-y-2">
                {reminders.length > 0 ? (
                  reminders.map((reminder) => {
                    const priority = getReminderPriority(reminder.reminder_date);
                    return (
                      <div
                        key={reminder.id}
                        className={`rounded-xl p-3 border transition-all ${
                          priority === 'today'
                            ? 'bg-gradient-to-r from-primary/20 to-primary/5 border-primary/40'
                            : priority === 'tomorrow'
                            ? 'bg-amber-500/10 border-amber-500/30'
                            : 'glass border-white/10 hover:border-primary/20'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-foreground truncate">{reminder.title}</p>
                              {reminder.notification_enabled && (
                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                  <Bell className="w-3 h-3 text-primary" />
                                </div>
                              )}
                            </div>
                            {reminder.description && (
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{reminder.description}</p>
                            )}
                            <div className="flex items-center gap-3 text-xs">
                              <span className={`font-medium ${
                                priority === 'today' ? 'text-primary' : priority === 'tomorrow' ? 'text-amber-400' : 'text-muted-foreground'
                              }`}>
                                {getRelativeDate(reminder.reminder_date)}
                              </span>
                              <span className="text-muted-foreground">
                                {format(parseISO(reminder.reminder_date), 'EEEE dd MMM', { locale })}
                              </span>
                              {reminder.reminder_time && (
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {reminder.reminder_time}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => completeReminder(reminder.id)}
                              className="h-8 w-8 p-0 hover:bg-primary/20 rounded-lg"
                              title="Marquer comme terminé"
                            >
                              <Check className="w-4 h-4 text-primary" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteReminder(reminder.id)}
                              className="h-8 w-8 p-0 hover:bg-destructive/20 rounded-lg"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 rounded-xl bg-white/5 border border-dashed border-white/20">
                    <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm font-medium text-muted-foreground mb-1">Aucun rappel</p>
                    <p className="text-xs text-muted-foreground/70">Ajoute un rappel pour ne rien oublier !</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bouton d'ajout */}
            <AddReminderDialog onAdd={addReminder} onSuccess={() => setIsOpen(false)} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
};

export default AgendaWidget;
