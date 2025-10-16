import { TrendingUp, Activity, Calendar, Award } from "lucide-react";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";
import HabitIcon from "@/components/HabitIcon";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-10 pb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
          Ana<span className="bg-gradient-primary bg-clip-text text-transparent">lyse</span>
        </h1>
        <p className="text-muted-foreground text-base">
          Comprends tes habitudes, améliore ta constance
        </p>
      </header>

      <main className="px-6 pt-6 space-y-6 max-w-2xl mx-auto">
        {/* AI Insight */}
        <section className="glass rounded-3xl p-8 shadow-elevation">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
              <Activity className="w-7 h-7 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-foreground mb-3">
                Analyse IA
              </h3>
              <p className="text-muted-foreground leading-relaxed text-base">
                Tu es plus régulier le matin. Ta motivation baisse légèrement les
                week-ends, mais tu maintiens une excellente constance générale.
              </p>
              <p className="bg-gradient-primary bg-clip-text text-transparent font-bold mt-4 text-lg">
                +42% de discipline par rapport au mois dernier
              </p>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Vue d'ensemble</h2>
          <div className="grid grid-cols-2 gap-4">
            <StatsCard
              icon={TrendingUp}
              label="Taux de réussite"
              value="87%"
              trend="+12%"
              trendUp
            />
            <StatsCard
              icon={Calendar}
              label="Jours actifs"
              value="24"
              trend="+3"
              trendUp
            />
            <StatsCard
              icon={Award}
              label="Meilleur streak"
              value="30j"
            />
            <StatsCard
              icon={Activity}
              label="Moyenne/jour"
              value="4.2"
              trend="+0.5"
              trendUp
            />
          </div>
        </section>

        {/* Weekly Progress */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Progression hebdomadaire
          </h2>
          <div className="glass rounded-3xl p-8 space-y-4">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day, index) => {
              const completion = [100, 100, 80, 100, 60, 40, 80][index];
              return (
                <div key={day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{day}</span>
                    <span className="text-foreground font-semibold">{completion}%</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-primary transition-all duration-500 rounded-full"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Habits Performance */}
        <section className="space-y-5">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            Performance par habitude
          </h2>
          <div className="space-y-4">
            {[
              { name: "Lecture", icon: "lecture" as const, success: 95, color: "primary" },
              { name: "Sport", icon: "sport" as const, success: 85, color: "primary" },
              { name: "Méditation", icon: "meditation" as const, success: 70, color: "primary" },
            ].map((habit) => (
              <div
                key={habit.name}
                className="glass rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                      <HabitIcon type={habit.icon} className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <span className="font-bold text-lg text-foreground">
                      {habit.name}
                    </span>
                  </div>
                  <span className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {habit.success}%
                  </span>
                </div>
                <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary transition-all duration-500 shadow-glow"
                    style={{ width: `${habit.success}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Analytics;
