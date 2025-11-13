import { useEffect } from "react";
import { Calendar as CalendarIcon, Plus, LogIn, LogOut } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Calendar = () => {
  const {
    isAuthenticated,
    events,
    isLoading,
    signIn,
    signOut,
    fetchUpcomingEvents,
  } = useGoogleCalendar();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUpcomingEvents();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background mb-safe-nav">
      <header className="px-6 pt-8 pb-6 text-center border-b border-white/10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
          <CalendarIcon className="w-8 h-8 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Calendrier <span className="bg-gradient-primary bg-clip-text text-transparent">Google</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Synchronise tes événements et rappels
        </p>
      </header>

      <main className="px-6 space-y-6 max-w-2xl mx-auto pb-8">
        {!isAuthenticated ? (
          <Card className="glass border-primary/20 p-8 text-center">
            <CalendarIcon className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Connecte ton Google Calendar
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Visualise et crée des événements directement depuis l'app
            </p>
            <Button onClick={signIn} size="lg" className="gap-2">
              <LogIn className="w-5 h-5" />
              Se connecter avec Google
            </Button>
            
            <div className="mt-6 p-4 bg-background/50 rounded-lg border border-white/10">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Note:</strong> Tu dois configurer les clés API Google Calendar dans les variables d'environnement :
                VITE_GOOGLE_CLIENT_ID et VITE_GOOGLE_API_KEY
              </p>
            </div>
          </Card>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">
                Événements à venir
              </h2>
              <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </div>

            {isLoading ? (
              <Card className="glass border-white/10 p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground mt-4">Chargement...</p>
              </Card>
            ) : events.length === 0 ? (
              <Card className="glass border-white/10 p-8 text-center">
                <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucun événement à venir
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <Card key={event.id} className="glass border-white/10 p-4">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">
                          {event.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {format(event.start, "PPP 'à' HH:mm", { locale: fr })}
                        </p>
                        {event.description && (
                          <p className="text-xs text-muted-foreground mt-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Button className="w-full gap-2" size="lg">
              <Plus className="w-5 h-5" />
              Créer un événement
            </Button>
          </>
        )}
      </main>

      <Navigation />
    </div>
  );
};

export default Calendar;