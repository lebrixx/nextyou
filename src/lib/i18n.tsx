import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'fr' | 'en' | 'es' | 'de' | 'it';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

const translations: Translations = {
  fr: {
    home: "Accueil",
    habits: "Habitudes",
    analytics: "Analytiques",
    timer: "Chrono",
    settings: "Réglages",
    agenda: "Agenda & Rappels",
    agendaPreview: "À venir",
    addReminder: "Ajouter un rappel",
    title: "Titre",
    description: "Description",
    date: "Date",
    time: "Heure",
    enableNotification: "Activer la notification",
    save: "Enregistrer",
    cancel: "Annuler",
    noReminders: "Aucun rappel à venir",
    viewWeek: "Voir la semaine",
    language: "Langue",
    french: "Français",
    english: "English",
    spanish: "Español",
    german: "Deutsch",
    italian: "Italiano",
    todayQuote: "Citation du jour",
    appPresentation: "Présentation de l'app",
    performanceToday: "Performance Aujourd'hui",
    completedHabits: "habitudes complétées",
    myTimers: "Mes compteurs",
    myGoals: "Mes objectifs",
    today: "Aujourd'hui",
    todayHabits: "Tes habitudes du jour",
    appPhilosophy: "Philosophie de l'application",
    discoverVision: "Découvre notre vision",
  },
  en: {
    home: "Home",
    habits: "Habits",
    analytics: "Analytics",
    timer: "Timer",
    settings: "Settings",
    agenda: "Agenda & Reminders",
    agendaPreview: "Coming up",
    addReminder: "Add reminder",
    title: "Title",
    description: "Description",
    date: "Date",
    time: "Time",
    enableNotification: "Enable notification",
    save: "Save",
    cancel: "Cancel",
    noReminders: "No upcoming reminders",
    viewWeek: "View week",
    language: "Language",
    french: "Français",
    english: "English",
    spanish: "Español",
    german: "Deutsch",
    italian: "Italiano",
    todayQuote: "Quote of the day",
    appPresentation: "App tour",
    performanceToday: "Today's Performance",
    completedHabits: "habits completed",
    myTimers: "My timers",
    myGoals: "My goals",
    today: "Today",
    todayHabits: "Your daily habits",
    appPhilosophy: "App Philosophy",
    discoverVision: "Discover our vision",
  },
  es: {
    home: "Inicio",
    habits: "Hábitos",
    analytics: "Analíticas",
    timer: "Cronómetro",
    settings: "Ajustes",
    agenda: "Agenda y Recordatorios",
    agendaPreview: "Próximamente",
    addReminder: "Añadir recordatorio",
    title: "Título",
    description: "Descripción",
    date: "Fecha",
    time: "Hora",
    enableNotification: "Activar notificación",
    save: "Guardar",
    cancel: "Cancelar",
    noReminders: "No hay recordatorios próximos",
    viewWeek: "Ver semana",
    language: "Idioma",
    french: "Français",
    english: "English",
    spanish: "Español",
    german: "Deutsch",
    italian: "Italiano",
    todayQuote: "Cita del día",
    appPresentation: "Presentación de la app",
    performanceToday: "Rendimiento hoy",
    completedHabits: "hábitos completados",
    myTimers: "Mis cronómetros",
    myGoals: "Mis objetivos",
    today: "Hoy",
    todayHabits: "Tus hábitos de hoy",
    appPhilosophy: "Filosofía de la aplicación",
    discoverVision: "Descubre nuestra visión",
  },
  de: {
    home: "Startseite",
    habits: "Gewohnheiten",
    analytics: "Analytics",
    timer: "Timer",
    settings: "Einstellungen",
    agenda: "Agenda & Erinnerungen",
    agendaPreview: "Bevorstehend",
    addReminder: "Erinnerung hinzufügen",
    title: "Titel",
    description: "Beschreibung",
    date: "Datum",
    time: "Zeit",
    enableNotification: "Benachrichtigung aktivieren",
    save: "Speichern",
    cancel: "Abbrechen",
    noReminders: "Keine bevorstehenden Erinnerungen",
    viewWeek: "Woche ansehen",
    language: "Sprache",
    french: "Français",
    english: "English",
    spanish: "Español",
    german: "Deutsch",
    italian: "Italiano",
    todayQuote: "Zitat des Tages",
    appPresentation: "App-Tour",
    performanceToday: "Heutige Leistung",
    completedHabits: "Gewohnheiten abgeschlossen",
    myTimers: "Meine Timer",
    myGoals: "Meine Ziele",
    today: "Heute",
    todayHabits: "Deine täglichen Gewohnheiten",
    appPhilosophy: "App-Philosophie",
    discoverVision: "Entdecke unsere Vision",
  },
  it: {
    home: "Home",
    habits: "Abitudini",
    analytics: "Analitiche",
    timer: "Timer",
    settings: "Impostazioni",
    agenda: "Agenda e Promemoria",
    agendaPreview: "Prossimamente",
    addReminder: "Aggiungi promemoria",
    title: "Titolo",
    description: "Descrizione",
    date: "Data",
    time: "Ora",
    enableNotification: "Attiva notifica",
    save: "Salva",
    cancel: "Annulla",
    noReminders: "Nessun promemoria in arrivo",
    viewWeek: "Vedi settimana",
    language: "Lingua",
    french: "Français",
    english: "English",
    spanish: "Español",
    german: "Deutsch",
    italian: "Italiano",
    todayQuote: "Citazione del giorno",
    appPresentation: "Tour dell'app",
    performanceToday: "Prestazioni di oggi",
    completedHabits: "abitudini completate",
    myTimers: "I miei timer",
    myGoals: "I miei obiettivi",
    today: "Oggi",
    todayHabits: "Le tue abitudini giornaliere",
    appPhilosophy: "Filosofia dell'app",
    discoverVision: "Scopri la nostra visione",
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('nextyou_language');
    return (saved as Language) || 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nextyou_language', lang);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};
