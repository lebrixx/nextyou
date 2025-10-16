import { Home, Target, BarChart3, Timer, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
  const navItems = [
    { icon: Home, label: "Accueil", path: "/" },
    { icon: Target, label: "Habitudes", path: "/habits" },
    { icon: BarChart3, label: "Analyse", path: "/analytics" },
    { icon: Timer, label: "Chrono", path: "/timer" },
    { icon: Settings, label: "Réglages", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 z-50 shadow-elevation">
      <div className="flex justify-around items-center h-20 max-w-2xl mx-auto px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1.5 px-5 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-primary scale-110 bg-primary/10 shadow-glow"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-6 h-6 transition-all ${isActive ? "drop-shadow-glow scale-110" : ""}`}
                />
                <span className="text-xs font-semibold">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
