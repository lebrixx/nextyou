import { Home, Target, Quote, Timer, Settings, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "@/lib/i18n";
import { useEffect } from "react";

const Navigation = () => {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Scroll to top whenever route changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);
  
  const navItems = [
    { icon: Home, label: t('home'), path: "/" },
    { icon: Target, label: t('habits'), path: "/habits" },
    { icon: Quote, label: t('quotes'), path: "/quotes" },
    { icon: Timer, label: t('timer'), path: "/timer" },
    { icon: Users, label: "Social", path: "/social" },
    { icon: Settings, label: t('settings'), path: "/settings" },
  ];

  return (
    <nav 
      id="main-navigation"
      className="glass-strong border-t border-white/10 shadow-elevation backdrop-blur-xl"
      style={{ 
        position: 'fixed',
        bottom: '0px',
        left: '0px',
        right: '0px',
        zIndex: 99999,
        paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
      }}
    >
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
