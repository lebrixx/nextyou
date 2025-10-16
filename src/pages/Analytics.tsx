import { TrendingUp, Activity, Calendar, Award } from "lucide-react";
import Navigation from "@/components/Navigation";
import StatsCard from "@/components/StatsCard";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-6 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground mb-2">Analyse</h1>
        <p className="text-muted-foreground">
          Comprends tes habitudes, améliore ta constance
        </p>
      </header>

      <main className="px-6 pt-6 space-y-6 max-w-2xl mx-auto">
        {/* AI Insight */}
        <section className="bg-gradient-glow border border-primary/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground mb-2">
                Analyse IA
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Tu es plus régulier le matin. Ta motivation baisse légèrement les
                week-ends, mais tu maintiens une excellente constance générale.
              </p>
              <p className="text-primary-glow font-semibold mt-3">
                +42% de discipline par rapport au mois dernier 🚀
              </p>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Vue d'ensemble</h2>
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
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            Progression hebdomadaire
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
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
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">
            Performance par habitude
          </h2>
          <div className="space-y-3">
            {[
              { name: "Lecture", emoji: "📚", success: 95, color: "primary" },
              { name: "Sport", emoji: "💪", success: 85, color: "primary" },
              { name: "Méditation", emoji: "🧘", success: 70, color: "primary" },
            ].map((habit) => (
              <div
                key={habit.name}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{habit.emoji}</span>
                    <span className="font-semibold text-foreground">
                      {habit.name}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-primary">
                    {habit.success}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary transition-all duration-500"
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
