import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
}

export const useGoogleCalendar = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
  const SCOPES = "https://www.googleapis.com/auth/calendar.readonly";

  const initGoogleAuth = async () => {
    if (!CLIENT_ID || !API_KEY) {
      console.warn("Google Calendar API credentials not configured");
      return;
    }

    try {
      // @ts-ignore
      await gapi.load("client:auth2", async () => {
        // @ts-ignore
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
          scope: SCOPES,
        });

        // @ts-ignore
        const authInstance = gapi.auth2.getAuthInstance();
        setIsAuthenticated(authInstance.isSignedIn.get());
        
        authInstance.isSignedIn.listen((signedIn: boolean) => {
          setIsAuthenticated(signedIn);
        });
      });
    } catch (error) {
      console.error("Error initializing Google Auth:", error);
    }
  };

  const signIn = async () => {
    try {
      // @ts-ignore
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      toast.success("Connecté à Google Calendar");
    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Erreur de connexion à Google Calendar");
    }
  };

  const signOut = async () => {
    try {
      // @ts-ignore
      const authInstance = gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      setEvents([]);
      toast.success("Déconnecté de Google Calendar");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const fetchUpcomingEvents = async (maxResults = 10) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      // @ts-ignore
      const response = await gapi.client.calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        showDeleted: false,
        singleEvents: true,
        maxResults,
        orderBy: "startTime",
      });

      const items = response.result.items || [];
      const calendarEvents: CalendarEvent[] = items.map((item: any) => ({
        id: item.id,
        title: item.summary,
        start: new Date(item.start.dateTime || item.start.date),
        end: new Date(item.end.dateTime || item.end.date),
        description: item.description,
      }));

      setEvents(calendarEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Erreur lors de la récupération des événements");
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (event: Omit<CalendarEvent, "id">) => {
    if (!isAuthenticated) {
      toast.error("Connecte-toi d'abord à Google Calendar");
      return;
    }

    try {
      // @ts-ignore
      const response = await gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: {
          summary: event.title,
          description: event.description,
          start: { dateTime: event.start.toISOString() },
          end: { dateTime: event.end.toISOString() },
        },
      });

      toast.success("Événement ajouté au calendrier");
      await fetchUpcomingEvents();
      return response.result;
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Erreur lors de la création de l'événement");
    }
  };

  useEffect(() => {
    initGoogleAuth();
  }, []);

  return {
    isAuthenticated,
    events,
    isLoading,
    signIn,
    signOut,
    fetchUpcomingEvents,
    createEvent,
  };
};