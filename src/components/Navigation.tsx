import { Home, Target, Bot, Focus as FocusIcon, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";

const Navigation = () => {
  const { t } = useTranslation();
  
  const navItems = [
    { icon: Home, label: "Accueil", path: "/" },
    { icon: Target, label: "Habitudes", path: "/habits" },
    { icon: Bot, label: "Assistant", path: "/assistant" },
    { icon: FocusIcon, label: "Focus", path: "/focus" },
    { icon: Settings, label: "Réglages", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-white/10 z-[200] shadow-elevation pb-safe">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
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
