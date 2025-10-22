import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { quotes, getRandomQuotes, Quote } from "@/data/quotes";

const Plan = () => {
  const [selectedCategory, setSelectedCategory] = useState<Quote["category"] | "all">("all");
  const [displayedQuotes, setDisplayedQuotes] = useState<Quote[]>(() => getRandomQuotes(10));

  const categories = [
    { id: "all", name: "Toutes", icon: "✨" },
    { id: "motivation", name: "Motivation", icon: "🔥" },
    { id: "discipline", name: "Discipline", icon: "💪" },
    { id: "success", name: "Succès", icon: "🎯" },
    { id: "perseverance", name: "Persévérance", icon: "⚡" },
    { id: "mindset", name: "État d'esprit", icon: "🧠" },
  ];

  const filteredQuotes = selectedCategory === "all" 
    ? displayedQuotes 
    : displayedQuotes.filter(q => q.category === selectedCategory);

  const refreshQuotes = () => {
    setDisplayedQuotes(getRandomQuotes(10));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          <span className="bg-gradient-primary bg-clip-text text-transparent">Citations</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Plus de 100 citations pour t'inspirer chaque jour
        </p>
      </header>

      <main className="px-6 pt-4 space-y-6 max-w-2xl mx-auto">
        {/* Quote Categories Filter */}
        <section className="glass rounded-xl p-5 shadow-elevation border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Filtrer par catégorie</h2>
                <p className="text-xs text-muted-foreground">{quotes.length} citations disponibles</p>
              </div>
            </div>
            <Button
              onClick={refreshQuotes}
              size="sm"
              variant="outline"
              className="border-primary/30 text-primary hover:bg-primary/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Nouvelles
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                  selectedCategory === category.id
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "border-primary/30 text-muted-foreground hover:border-primary/50"
                }`}
                onClick={() => setSelectedCategory(category.id as any)}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Badge>
            ))}
          </div>
        </section>

        {/* Quotes Display */}
        <section className="space-y-3">
          {filteredQuotes.map((quote, index) => (
            <div
              key={index}
              className="glass rounded-xl p-5 shadow-elevation border border-white/5 animate-fade-in hover-scale"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl shrink-0">
                  {quote.category === "motivation" && "🔥"}
                  {quote.category === "discipline" && "💪"}
                  {quote.category === "success" && "🎯"}
                  {quote.category === "perseverance" && "⚡"}
                  {quote.category === "mindset" && "🧠"}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground font-medium italic leading-relaxed mb-2">
                    "{quote.text}"
                  </p>
                  <p className="text-xs text-muted-foreground">— {quote.author}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Info Section */}
        <section className="glass rounded-xl p-5 shadow-elevation border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground mb-2">À propos des citations</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Découvre plus de 100 citations inspirantes dans 5 catégories différentes. Utilise les filtres pour explorer les thèmes qui résonnent avec toi, ou clique sur "Nouvelles" pour découvrir 10 nouvelles citations aléatoires.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Plan;
