import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Target, Clock, Users, Trophy, ChevronRight,
  Flame, ArrowRight, Check, Plus, LogIn, UserPlus, Bell, BellOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { PushNotifications } from "@capacitor/push-notifications";

const HABIT_SUGGESTIONS = [
  { name: "Méditer", icon: "🧘", desc: "5 min de calme" },
  { name: "Lire", icon: "📖", desc: "10 pages par jour" },
  { name: "Sport", icon: "💪", desc: "20 min d'exercice" },
  { name: "Gratitude", icon: "🙏", desc: "3 choses positives" },
  { name: "Eau", icon: "💧", desc: "2L par jour" },
  { name: "Marcher", icon: "🚶", desc: "30 min dehors" },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [customHabit, setCustomHabit] = useState("");
  const [countdownValue, setCountdownValue] = useState(3);
  const [countdownStarted, setCountdownStarted] = useState(false);
  const [countdownDone, setCountdownDone] = useState(false);
  const [dayTimerRunning, setDayTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerName, setTimerName] = useState("Jour 1");
  const [customTimerName, setCustomTimerName] = useState("");
  const [notifGranted, setNotifGranted] = useState(false);
  const [notifRequested, setNotifRequested] = useState(false);

  const totalSteps = 6;

  // Save timer to Supabase or localStorage
  const saveOnboardingTimer = async () => {
    const finalName = customTimerName || timerName;
    const now = new Date().toISOString();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('timers').insert({
          user_id: user.id,
          name: finalName,
          duration: 0,
          created_at: now,
        });
      } else {
        // Save to localStorage for migration later
        const existing = JSON.parse(localStorage.getItem("habitflow_timers") || "[]");
        existing.push({ id: crypto.randomUUID(), name: finalName, startDate: now });
        localStorage.setItem("habitflow_timers", JSON.stringify(existing));
      }
    } catch (e) {
      // Fallback to localStorage
      const existing = JSON.parse(localStorage.getItem("habitflow_timers") || "[]");
      existing.push({ id: crypto.randomUUID(), name: finalName, startDate: now });
      localStorage.setItem("habitflow_timers", JSON.stringify(existing));
    }
  };

  // Day timer elapsed
  useEffect(() => {
    if (!dayTimerRunning) return;
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [dayTimerRunning]);

  const habitName = selectedHabit || customHabit || "Mon habitude";

  const requestNotifications = async () => {
    const isNative = Capacitor.isNativePlatform();
    if (!isNative) {
      // On web/PC, just advance to next step
      setStep((s) => s + 1);
      return;
    }
    setNotifRequested(true);
    try {
      try {
        const pushResult = await PushNotifications.requestPermissions();
        if (pushResult.receive === 'granted') {
          await PushNotifications.register();
          setNotifGranted(true);
        }
      } catch (e) { console.log('Push not available:', e); }
      try {
        const localResult = await LocalNotifications.requestPermissions();
        if (localResult.display === 'granted') setNotifGranted(true);
      } catch (e) { console.log('Local notif error:', e); }
    } catch (e) {
      console.error('Notification permission error:', e);
    }
  };

  const nextStep = useCallback(() => {
    if (step < totalSteps - 1) setStep((s) => s + 1);
  }, [step]);

  const finishOnboarding = (goAuth: boolean) => {
    onComplete();
    if (goAuth) navigate("/auth");
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden">
      {/* Progress bar */}
      <div className="w-full h-1 bg-muted">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-accent"
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>


      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {/* STEP 0 — Welcome */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="max-w-sm w-full text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow"
              >
                <Sparkles className="w-12 h-12 text-primary-foreground" />
              </motion.div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground">
                  Bienvenue sur Time Ritual
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  L'app qui transforme tes bonnes intentions en <span className="text-primary font-semibold">habitudes concrètes</span>.
                </p>
              </div>

              <div className="space-y-3 text-left">
                {[
                  { icon: Target, text: "Suis tes habitudes quotidiennes" },
                  { icon: Flame, text: "Construis des streaks motivants" },
                  { icon: Users, text: "Défie tes amis en duel" },
                  { icon: Trophy, text: "Débloque des badges" },
                ].map(({ icon: Icon, text }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-3 glass rounded-lg p-3"
                  >
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm text-foreground">{text}</span>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={nextStep}
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
                size="lg"
              >
                C'est parti
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* STEP 1 — Choose first habit */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="max-w-sm w-full space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Ta première habitude
                </h2>
                <p className="text-muted-foreground text-sm">
                  Commence petit. Une seule habitude suffit pour changer ta vie.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {HABIT_SUGGESTIONS.map((h) => (
                  <button
                    key={h.name}
                    onClick={() => { setSelectedHabit(h.name); setCustomHabit(""); }}
                    className={`p-4 rounded-xl text-left transition-all duration-200 ${
                      selectedHabit === h.name
                        ? "bg-primary/20 border-2 border-primary shadow-glow"
                        : "glass border-2 border-transparent hover:border-primary/30"
                    }`}
                  >
                    <span className="text-2xl">{h.icon}</span>
                    <p className="text-sm font-semibold text-foreground mt-1">{h.name}</p>
                    <p className="text-xs text-muted-foreground">{h.desc}</p>
                  </button>
                ))}
              </div>

              <div className="relative">
                <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Ou écris la tienne..."
                  value={customHabit}
                  onChange={(e) => { setCustomHabit(e.target.value); setSelectedHabit(null); }}
                  className="pl-10"
                />
              </div>

              <Button
                onClick={nextStep}
                disabled={!selectedHabit && !customHabit}
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
                size="lg"
              >
                Valider « {habitName} »
                <Check className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2 — App features showcase */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="max-w-sm w-full space-y-6 max-h-[85vh] overflow-y-auto pb-4"
            >
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Tout ce qu'il te faut
                </h2>
                <p className="text-muted-foreground text-sm">
                  Des outils puissants pour devenir la meilleure version de toi-même.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    icon: "⏱️",
                    title: "Pomodoro",
                    desc: "Reste concentré avec des sessions chronométrées",
                  },
                  {
                    icon: "⏳",
                    title: "Compteurs personnels",
                    desc: "Marque les moments qui comptent pour toi — arrêt d'une addiction, reprise en main, nouveau chapitre de ta vie",
                  },
                  {
                    icon: "🤖",
                    title: "Assistant IA",
                    desc: "Des suggestions d'habitudes personnalisées",
                  },
                  {
                    icon: "⚔️",
                    title: "Duels & Social",
                    desc: "Défie tes amis et progresse ensemble",
                  },
                  {
                    icon: "📊",
                    title: "Statistiques avancées",
                    desc: "Visualise ta progression en détail",
                  },
                  {
                    icon: "🏅",
                    title: "Badges & Récompenses",
                    desc: "Débloque des succès à chaque palier",
                  },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3 glass rounded-xl p-4"
                  >
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={nextStep}
                className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
                size="lg"
              >
                Continuer
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          )}

          {/* STEP 3 — Notification permission */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="max-w-sm w-full text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
              >
                <Bell className="w-12 h-12 text-primary" />
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">
                  Reste sur la bonne voie
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Les notifications sont <span className="text-primary font-semibold">essentielles</span> pour Time Ritual. Elles te rappellent tes habitudes, célèbrent tes streaks et t'encouragent quand tu en as besoin.
                </p>
              </div>

              <div className="space-y-3 text-left">
                {[
                  { emoji: "🎯", text: "Rappels d'habitudes à l'heure que tu choisis" },
                  { emoji: "💬", text: "Messages de tes amis et défis reçus" },
                  { emoji: "💪", text: "Citations motivantes pour ta journée" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 glass rounded-lg p-3"
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm text-foreground">{item.text}</span>
                  </motion.div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground text-center italic">…et bien d'autres encore ✨</p>

              {!notifRequested ? (
                <Button
                  onClick={async () => {
                    await requestNotifications();
                  }}
                  className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
                  size="lg"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Activer les notifications
                </Button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-3"
                >
                  <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${notifGranted ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                    {notifGranted ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-semibold">Notifications activées !</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-5 h-5" />
                        <span className="text-sm">Tu pourras les activer plus tard dans les réglages</span>
                      </>
                    )}
                  </div>
                  <Button
                    onClick={nextStep}
                    className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
                    size="lg"
                  >
                    Continuer
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 4 — Symbolic timer "Jour 1" */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="max-w-sm w-full text-center space-y-8"
            >
              {!countdownStarted ? (
                <>
                  <div className="space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                    >
                      <Clock className="w-10 h-10 text-primary" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Ton compteur personnel
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Ce compteur marquera le début de ta transformation. Il tournera en permanence pour te rappeler <span className="text-primary font-semibold">depuis combien de temps tu progresses</span>.
                    </p>
                  </div>

                  {/* Timer name selection */}
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Nomme ton compteur</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["Jour 1", "Version 2.0", "Reprise en main", "Nouveau départ", "Renaissance"].map((name) => (
                        <button
                          key={name}
                          onClick={() => { setTimerName(name); setCustomTimerName(""); }}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            timerName === name && !customTimerName
                              ? "bg-primary/20 border-2 border-primary text-primary font-semibold"
                              : "glass border-2 border-transparent text-muted-foreground hover:border-primary/30"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                    <Input
                      placeholder="Ou choisis ton propre nom..."
                      value={customTimerName}
                      onChange={(e) => { setCustomTimerName(e.target.value); setTimerName(""); }}
                      className="text-center"
                    />
                  </div>

                  <Button
                    onClick={async () => {
                      await saveOnboardingTimer();
                      setCountdownStarted(true);
                      setDayTimerRunning(true);
                    }}
                    className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
                    size="lg"
                  >
                    Lancer « {customTimerName || timerName} »
                    <Flame className="w-4 h-4 ml-1" />
                  </Button>
                </>
              ) : (
                <motion.div
                  key="day1"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 150 }}
                  className="space-y-6"
                >
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary via-accent to-primary-glow flex items-center justify-center shadow-glow">
                    <div className="text-center">
                      <p className="text-[10px] text-primary-foreground/80 font-medium uppercase tracking-wider">Début</p>
                      <p className="text-lg font-bold text-primary-foreground leading-tight">{customTimerName || timerName}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">C'est parti ! 🔥</h2>
                    <p className="text-muted-foreground text-sm">
                      À partir de maintenant, chaque seconde compte. Tu n'es plus la même personne qu'il y a 5 secondes.
                    </p>
                  </div>

                  {/* Live timer */}
                  <div className="glass rounded-xl p-4 inline-block">
                    <p className="text-xs text-muted-foreground mb-1">{customTimerName || timerName}</p>
                    <p className="text-2xl font-mono font-bold text-primary">
                      {String(Math.floor(elapsedSeconds / 60)).padStart(2, "0")}:
                      {String(elapsedSeconds % 60).padStart(2, "0")}
                    </p>
                  </div>

                  <Button
                    onClick={nextStep}
                    className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
                    size="lg"
                  >
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* STEP 5 — Account prompt */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4 }}
              className="max-w-sm w-full text-center space-y-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow"
              >
                <Trophy className="w-10 h-10 text-primary-foreground" />
              </motion.div>

              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-foreground">
                  Sauvegarde ta progression
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Crée un compte pour synchroniser tes habitudes, défier tes amis et ne jamais perdre tes données.
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => finishOnboarding(true)}
                  className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
                  size="lg"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Créer un compte
                </Button>

                <Button
                  onClick={() => finishOnboarding(true)}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  J'ai déjà un compte
                </Button>

                <button
                  onClick={() => finishOnboarding(false)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continuer sans compte →
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                💡 Sans compte, tes données restent uniquement sur cet appareil
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Step dots */}
      <div className="flex justify-center gap-2 pb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === step ? "bg-primary w-6" : i < step ? "bg-primary/50" : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingFlow;
