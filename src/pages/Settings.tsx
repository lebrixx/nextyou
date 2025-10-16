import { Bell, Palette, User, Info } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-10 pb-8">
        <h1 className="text-4xl font-bold text-foreground mb-3 tracking-tight">
          Réglages
        </h1>
        <p className="text-muted-foreground text-base">Personnalise ton expérience</p>
      </header>

      <main className="px-6 pt-6 space-y-6 max-w-2xl mx-auto">
        {/* Notifications */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </div>
            Notifications
          </h2>
          <div className="glass rounded-2xl divide-y divide-white/5">
            <div className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <p className="font-semibold text-foreground mb-1">Rappels quotidiens</p>
                <p className="text-sm text-muted-foreground">
                  Reçois des rappels pour tes habitudes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <p className="font-semibold text-foreground mb-1">Messages motivants</p>
                <p className="text-sm text-muted-foreground">
                  Citations inspirantes quotidiennes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-5 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div>
                <p className="font-semibold text-foreground mb-1">Sons</p>
                <p className="text-sm text-muted-foreground">
                  Sons de validation et alertes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Palette className="w-5 h-5 text-primary-foreground" />
            </div>
            Apparence
          </h2>
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-semibold text-foreground mb-1">Thème sombre</p>
                <p className="text-sm text-muted-foreground">
                  Mode actuel: Noir & Violet
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-14 rounded-xl bg-gradient-primary border-2 border-primary shadow-glow" />
              <div className="flex-1 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-30" />
              <div className="flex-1 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-30" />
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            Compte
          </h2>
          <div className="glass rounded-2xl divide-y divide-white/5">
            <button className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
              <p className="font-semibold text-foreground">Profil</p>
            </button>
            <button className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
              <p className="font-semibold text-foreground">Passer à Premium</p>
              <span className="px-4 py-1.5 rounded-full bg-gradient-primary text-primary-foreground text-xs font-bold shadow-glow">
                PRO
              </span>
            </button>
            <button className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
              <p className="font-semibold text-foreground">Exporter mes données</p>
            </button>
          </div>
        </section>

        {/* About */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Info className="w-5 h-5 text-primary-foreground" />
            </div>
            À propos
          </h2>
          <div className="glass rounded-2xl divide-y divide-white/5">
            <button className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
              <p className="font-semibold text-foreground">Aide & Support</p>
            </button>
            <button className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors">
              <p className="font-semibold text-foreground">Politique de confidentialité</p>
            </button>
            <div className="p-5">
              <p className="text-sm text-muted-foreground font-medium">Version 1.0.0</p>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Settings;
