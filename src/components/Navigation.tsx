import { Home, Target, Sparkles, Timer, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const Navigation = () => {
  const navItems = [
    { icon: Home, label: "Accueil", path: "/" },
    { icon: Target, label: "Habitudes", path: "/habits" },
    { icon: Sparkles, label: "Citations", path: "/analytics" },
    { icon: Timer, label: "Chrono", path: "/timer" },
    { icon: Settings, label: "Réglages", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 z-50 shadow-elevation">
      <div className="flex justify-around items-center h-20 max-w-2xl mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-primary scale-105 bg-primary/10 shadow-glow border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-5 h-5 transition-all ${isActive ? "drop-shadow-glow" : ""}`}
                />
                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
