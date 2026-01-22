import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Mail, LogIn, UserPlus, AlertTriangle, KeyRound, Shield } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
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
      if (!email || !password || !username.trim()) {
        toast({
          title: "Erreur",
          description: "Remplis tous les champs",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (username.trim().length < 2) {
        toast({
          title: "Erreur",
          description: "Le pseudo doit contenir au moins 2 caractères",
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
          data: {
            full_name: username.trim(),
          },
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email.trim()) {
        toast({
          title: "Erreur",
          description: "Entre ton adresse email",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "Email envoyé !",
        description: "Vérifie ta boîte mail pour réinitialiser ton mot de passe",
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Email sent after signup
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

            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-500 mb-1">Vérifie tes spams !</p>
                <p className="text-muted-foreground text-xs">
                  L'email peut parfois arriver dans tes courriers indésirables. Pense à vérifier ce dossier.
                </p>
              </div>
            </div>

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

  // Password reset email sent
  if (resetEmailSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
              <KeyRound className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Vérifie ta boîte mail
            </h1>
            <p className="text-muted-foreground text-sm">
              Si un compte existe avec cette adresse, un email a été envoyé.
            </p>
          </div>

          <div className="glass rounded-2xl p-8 space-y-4 border border-white/10 text-center">
            <p className="text-muted-foreground text-sm">
              Clique sur le lien dans l'email pour créer un nouveau mot de passe.
            </p>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-500 mb-1">Vérifie tes spams !</p>
                <p className="text-muted-foreground text-xs">
                  L'email peut parfois arriver dans tes courriers indésirables. Pense à vérifier ce dossier.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 text-left">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-primary mb-1">Sécurité</p>
                <p className="text-muted-foreground text-xs">
                  Seul le propriétaire de l'adresse email peut réinitialiser le mot de passe. Le lien est unique et expire après utilisation.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setResetEmailSent(false);
                setIsForgotPassword(false);
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

  // Forgot password form
  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
              <KeyRound className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Mot de passe oublié
            </h1>
            <p className="text-muted-foreground text-sm">
              Entre ton email pour réinitialiser ton mot de passe
            </p>
          </div>

          <form 
            onSubmit={handleForgotPassword} 
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary text-primary-foreground shadow-glow font-bold h-11"
            >
              {loading ? "Envoi..." : "Envoyer le lien"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Retour à la connexion
              </button>
            </div>
          </form>
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
            Time <span className="bg-gradient-primary bg-clip-text text-transparent">Ritual</span>
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

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Pseudo
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Ton pseudo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
                className="glass border-white/10 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground">Ce nom sera visible par tes amis</p>
            </div>
          )}

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

          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </div>
          )}

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

        {/* Continuer sans compte */}
        <div className="glass rounded-2xl p-5 border border-white/10 space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              <span className="text-foreground font-medium">Avec un compte</span>, tes données sont sauvegardées et synchronisées sur tous tes appareils. Tu accèdes aussi aux fonctionnalités sociales (amis, défis, groupes).
            </p>
          </div>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/")}
            className="w-full border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-foreground/50 h-10"
          >
            Continuer sans compte
          </Button>
          
          <p className="text-[10px] text-muted-foreground/70 text-center">
            Tes données seront stockées uniquement sur cet appareil
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
