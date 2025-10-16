import { Bell, Palette, User, Info } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-6 pt-8 pb-6 border-b border-border">
        <h1 className="text-3xl font-bold text-foreground mb-2">Réglages</h1>
        <p className="text-muted-foreground">Personnalise ton expérience</p>
      </header>

      <main className="px-6 pt-6 space-y-6 max-w-2xl mx-auto">
        {/* Notifications */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Rappels quotidiens</p>
                <p className="text-sm text-muted-foreground">
                  Reçois des rappels pour tes habitudes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Messages motivants</p>
                <p className="text-sm text-muted-foreground">
                  Citations inspirantes quotidiennes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sons</p>
                <p className="text-sm text-muted-foreground">
                  Sons de validation et alertes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Apparence
          </h2>
          <div className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium text-foreground">Thème sombre</p>
                <p className="text-sm text-muted-foreground">
                  Mode actuel: Noir & Violet
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 rounded-xl bg-gradient-primary border-2 border-primary" />
              <div className="flex-1 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 opacity-50" />
              <div className="flex-1 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-50" />
            </div>
          </div>
        </section>

        {/* Account */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Compte
          </h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            <button className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Profil</p>
            </button>
            <button className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Passer à Premium</p>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                PRO
              </span>
            </button>
            <button className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Exporter mes données</p>
            </button>
          </div>
        </section>

        {/* About */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            À propos
          </h2>
          <div className="bg-card border border-border rounded-2xl divide-y divide-border">
            <button className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Aide & Support</p>
            </button>
            <button className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/50 transition-colors">
              <p className="font-medium text-foreground">Politique de confidentialité</p>
            </button>
            <div className="p-4">
              <p className="text-sm text-muted-foreground">Version 1.0.0</p>
            </div>
          </div>
        </section>
      </main>

      <Navigation />
    </div>
  );
};

export default Settings;
