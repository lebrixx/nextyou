import { useState, useEffect } from "react";
import { Sparkles, Plus, Trash2, Edit2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface QuoteCategory {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

interface CustomQuote {
  id: string;
  text: string;
  author: string;
}

const Plan = () => {
  const [categories, setCategories] = useState<QuoteCategory[]>(() => {
    const saved = localStorage.getItem("habitflow_quote_categories");
    return saved ? JSON.parse(saved) : [
      { id: "motivation", name: "Motivation", icon: "🔥", enabled: true },
      { id: "discipline", name: "Discipline", icon: "💪", enabled: true },
      { id: "success", name: "Succès", icon: "🎯", enabled: true },
      { id: "perseverance", name: "Persévérance", icon: "⚡", enabled: false },
      { id: "mindset", name: "État d'esprit", icon: "🧠", enabled: false },
    ];
  });

  const [customQuotes, setCustomQuotes] = useState<CustomQuote[]>(() => {
    const saved = localStorage.getItem("habitflow_custom_quotes");
    return saved ? JSON.parse(saved) : [];
  });

  const [isAddingQuote, setIsAddingQuote] = useState(false);
  const [newQuoteText, setNewQuoteText] = useState("");
  const [newQuoteAuthor, setNewQuoteAuthor] = useState("");

  useEffect(() => {
    localStorage.setItem("habitflow_quote_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("habitflow_custom_quotes", JSON.stringify(customQuotes));
  }, [customQuotes]);

  const toggleCategory = (categoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId ? { ...cat, enabled: !cat.enabled } : cat
      )
    );
    toast.success("Préférences mises à jour");
  };

  const addCustomQuote = () => {
    if (!newQuoteText.trim()) {
      toast.error("Le texte de la citation ne peut pas être vide");
      return;
    }

    const newQuote: CustomQuote = {
      id: Date.now().toString(),
      text: newQuoteText,
      author: newQuoteAuthor || "Anonyme",
    };

    setCustomQuotes([...customQuotes, newQuote]);
    setNewQuoteText("");
    setNewQuoteAuthor("");
    setIsAddingQuote(false);
    toast.success("Citation ajoutée avec succès");
  };

  const deleteCustomQuote = (quoteId: string) => {
    setCustomQuotes(customQuotes.filter((q) => q.id !== quoteId));
    toast.success("Citation supprimée");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
          <span className="bg-gradient-primary bg-clip-text text-transparent">Citations</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Personnalise tes sources d'inspiration quotidiennes
        </p>
      </header>

      <main className="px-6 pt-4 space-y-6 max-w-2xl mx-auto">
        {/* Quote Categories */}
        <section className="glass rounded-xl p-5 shadow-elevation border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Catégories de citations</h2>
              <p className="text-xs text-muted-foreground">Active les thèmes qui te parlent</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={category.enabled ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                  category.enabled
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "border-primary/30 text-muted-foreground hover:border-primary/50"
                }`}
                onClick={() => toggleCategory(category.id)}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Badge>
            ))}
          </div>
        </section>

        {/* Custom Quotes */}
        <section className="glass rounded-xl p-5 shadow-elevation border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
                <Edit2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">Mes citations personnelles</h2>
                <p className="text-xs text-muted-foreground">Ajoute tes citations préférées</p>
              </div>
            </div>
          </div>

          {/* Add Quote Button */}
          <Dialog open={isAddingQuote} onOpenChange={setIsAddingQuote}>
            <DialogTrigger asChild>
              <Button className="w-full mb-4 bg-gradient-primary text-primary-foreground shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une citation
              </Button>
            </DialogTrigger>
            <DialogContent className="glass">
              <DialogHeader>
                <DialogTitle>Nouvelle citation</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="quote-text">Citation</Label>
                  <Textarea
                    id="quote-text"
                    placeholder="La citation qui t'inspire..."
                    value={newQuoteText}
                    onChange={(e) => setNewQuoteText(e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="quote-author">Auteur (optionnel)</Label>
                  <Input
                    id="quote-author"
                    placeholder="Nom de l'auteur"
                    value={newQuoteAuthor}
                    onChange={(e) => setNewQuoteAuthor(e.target.value)}
                  />
                </div>
                <Button onClick={addCustomQuote} className="w-full bg-gradient-primary text-primary-foreground">
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Custom Quotes List */}
          {customQuotes.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">
                Aucune citation personnelle pour le moment
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {customQuotes.map((quote) => (
                <div
                  key={quote.id}
                  className="bg-muted/30 rounded-lg p-4 border border-primary/10 group relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCustomQuote(quote.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <p className="text-sm text-foreground font-medium italic leading-relaxed pr-8">
                    "{quote.text}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">— {quote.author}</p>
                </div>
              ))}
            </div>
          )}
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
                Les citations activées apparaîtront dans ton flux quotidien. Personnalise tes catégories et ajoute tes citations préférées pour créer une source d'inspiration qui te ressemble.
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
