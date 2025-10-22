import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Target } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Next You 2.0 !",
        });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast({
          title: "Compte créé",
          description: "Ton compte a été créé avec succès !",
        });
        navigate("/");
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <Target className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Habit<span className="bg-gradient-primary bg-clip-text text-transparent">Flow</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLogin ? "Connecte-toi pour continuer" : "Crée ton compte gratuitement"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="glass rounded-2xl p-8 space-y-6 border border-white/10">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground">
                Nom complet
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Jean Dupont"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={!isLogin}
                className="glass border-white/10 focus:border-primary/50"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass border-white/10 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="glass border-white/10 focus:border-primary/50"
            />
            {!isLogin && (
              <p className="text-xs text-muted-foreground">Au moins 6 caractères</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-primary-foreground shadow-glow font-bold h-11"
          >
            {loading ? "Chargement..." : isLogin ? "Se connecter" : "Créer mon compte"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isLogin ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
