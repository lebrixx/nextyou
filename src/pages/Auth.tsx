import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Mail, LogIn, UserPlus } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        toast({
          title: "Erreur",
          description: "Remplis tous les champs",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        toast({
          title: "Erreur",
          description: "Le mot de passe doit contenir au moins 6 caractères",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const redirectUrl = `${window.location.origin}/`;

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Email envoyé !",
        description: "Vérifie ta boîte mail pour confirmer ton compte",
      });
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le compte",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        toast({
          title: "Erreur",
          description: "Remplis tous les champs",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Next Me !",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Error signing in:", error);
      let message = "Impossible de se connecter";
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou mot de passe incorrect";
      } else if (error.message.includes("Email not confirmed")) {
        message = "Confirme ton email avant de te connecter";
      }
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast({
        title: "Email renvoyé",
        description: "Vérifie ta boîte mail",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de renvoyer l'email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Vérifie ton email
            </h1>
            <p className="text-muted-foreground text-sm">
              Un email de confirmation a été envoyé à <strong>{email}</strong>
            </p>
          </div>

          <div className="glass rounded-2xl p-8 space-y-6 border border-white/10 text-center">
            <p className="text-muted-foreground text-sm">
              Clique sur le lien dans l'email pour activer ton compte et te connecter.
            </p>

            <Button
              onClick={handleResendEmail}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? "Envoi..." : "Renvoyer l'email"}
            </Button>

            <button
              type="button"
              onClick={() => {
                setEmailSent(false);
                setIsSignUp(false);
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
            {isSignUp ? (
              <UserPlus className="w-8 h-8 text-primary-foreground" />
            ) : (
              <LogIn className="w-8 h-8 text-primary-foreground" />
            )}
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Next <span className="bg-gradient-primary bg-clip-text text-transparent">Me</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {isSignUp ? "Crée ton compte" : "Connecte-toi à ton compte"}
          </p>
        </div>

        <form 
          onSubmit={isSignUp ? handleSignUp : handleSignIn} 
          className="glass rounded-2xl p-8 space-y-6 border border-white/10"
        >
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
            {isSignUp && (
              <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-primary text-primary-foreground shadow-glow font-bold h-11"
          >
            {loading ? "Chargement..." : isSignUp ? "Créer mon compte" : "Se connecter"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
