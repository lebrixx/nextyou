import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Target } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

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
          description: "Bienvenue sur HabitFlow !",
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
          description: "Bienvenue sur HabitFlow !",
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
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <Target className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Habit<span className="bg-gradient-primary bg-clip-text text-transparent">Flow</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLogin ? "Connecte-toi à ton compte" : "Crée ton compte"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="glass rounded-xl p-6 space-y-4 border border-white/10">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-foreground text-sm">
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
            <Label htmlFor="email" className="text-foreground text-sm">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass border-white/10 focus:border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground text-sm">
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
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-primary-foreground shadow-glow font-semibold h-11"
          >
            {loading ? "Chargement..." : isLogin ? "Se connecter" : "Créer mon compte"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin
                ? "Pas encore de compte ? Inscris-toi"
                : "Déjà un compte ? Connecte-toi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
