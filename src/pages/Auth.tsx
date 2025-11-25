import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Target, Phone } from "lucide-react";

const Auth = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate phone number (basic validation)
      const trimmedPhone = phone.trim();
      
      if (!trimmedPhone || trimmedPhone.length < 10) {
        toast({
          title: "Erreur",
          description: "Numéro de téléphone invalide",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Send OTP
      const { error } = await supabase.auth.signInWithOtp({
        phone: trimmedPhone,
      });

      if (error) throw error;

      setOtpSent(true);
      toast({
        title: "Code envoyé",
        description: "Un code de vérification a été envoyé à ton numéro",
      });
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!otp || otp.length !== 6) {
        toast({
          title: "Erreur",
          description: "Le code doit contenir 6 chiffres",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otp,
        type: 'sms',
      });

      if (error) throw error;

      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Next Me !",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast({
        title: "Erreur",
        description: error.message || "Code invalide",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOtpSent(false);
    setOtp("");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary shadow-glow mb-4">
            <Phone className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Next <span className="bg-gradient-primary bg-clip-text text-transparent">Me</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            {otpSent ? "Entre le code reçu par SMS" : "Connecte-toi avec ton téléphone"}
          </p>
        </div>

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="glass rounded-2xl p-8 space-y-6 border border-white/10">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-foreground">
                Numéro de téléphone
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="glass border-white/10 focus:border-primary/50"
              />
              <p className="text-xs text-muted-foreground">Format international : +33...</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary text-primary-foreground shadow-glow font-bold h-11"
            >
              {loading ? "Envoi..." : "Recevoir le code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="glass rounded-2xl p-8 space-y-6 border border-white/10">
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-foreground">
                Code de vérification
              </Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="glass border-white/10 focus:border-primary/50 text-center text-2xl tracking-widest"
              />
              <p className="text-xs text-muted-foreground">Code à 6 chiffres envoyé au {phone}</p>
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-primary text-primary-foreground shadow-glow font-bold h-11"
            >
              {loading ? "Vérification..." : "Se connecter"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Changer de numéro
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
