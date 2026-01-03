import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { I18nProvider } from "@/lib/i18n";
import { initPushNotifications } from "./pushNotifications";
import Index from "./pages/Index";
import Habits from "./pages/Habits";
import Plan from "./pages/Plan";
import Timer from "./pages/Timer";
import Pomodoro from "./pages/Pomodoro";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import Premium from "./pages/Premium";
import Assistant from "./pages/Assistant";
import Badges from "./pages/Badges";
import Stats from "./pages/Stats";
import Quotes from "./pages/Quotes";
import Social from "./pages/Social";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialiser les notifications push au démarrage de l'app
  useEffect(() => {
    initPushNotifications();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/analytics" element={<Plan />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/pomodoro" element={<Pomodoro />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/premium" element={<Premium />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/social" element={<Social />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
  );
};

export default App;
