import { BarChart3, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          Ana<span className="bg-gradient-primary bg-clip-text text-transparent">lyse</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Comprends tes habitudes, améliore ta constance
        </p>
      </header>

      <main className="px-6 pt-4 space-y-4 max-w-2xl mx-auto">
        {/* Welcome Section */}
        <section className="glass rounded-xl p-8 text-center shadow-elevation space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary/10 flex items-center justify-center mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Section Analyse</h2>
          <div className="space-y-3 text-left max-w-md mx-auto">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cette section te permettra de visualiser tes progrès et de comprendre tes habitudes :
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Suivre ton taux de réussite au fil du temps</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Identifier tes meilleurs moments de la semaine</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Analyser la performance de chaque habitude</span>
              </li>
              <li className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <span>Recevoir des insights personnalisés par IA</span>
              </li>
            </ul>
            <p className="text-xs text-muted-foreground/70 pt-2 italic">
              Les statistiques apparaîtront automatiquement une fois que tu auras commencé à suivre tes habitudes quotidiennes.
            </p>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Analytics;
