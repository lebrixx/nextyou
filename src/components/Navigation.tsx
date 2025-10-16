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
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-20 max-w-2xl mx-auto px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all ${
                isActive
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`w-6 h-6 ${isActive ? "animate-pulse-glow" : ""}`}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
