export type Theme = "purple" | "blue" | "green";

export const themes = {
  purple: {
    primary: "266 85% 58%",
    "primary-glow": "280 100% 70%",
    "gradient-primary": "linear-gradient(135deg, hsl(266, 85%, 58%), hsl(280, 100%, 70%))",
  },
  blue: {
    primary: "217 91% 60%",
    "primary-glow": "199 89% 68%",
    "gradient-primary": "linear-gradient(135deg, hsl(217, 91%, 60%), hsl(199, 89%, 68%))",
  },
  green: {
    primary: "142 76% 36%",
    "primary-glow": "158 64% 52%",
    "gradient-primary": "linear-gradient(135deg, hsl(142, 76%, 36%), hsl(158, 64%, 52%))",
  },
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const colors = themes[theme];
  
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-glow", colors["primary-glow"]);
  root.style.setProperty("--gradient-primary", colors["gradient-primary"]);
  
  localStorage.setItem("habitflow_theme", theme);
};

export const getTheme = (): Theme => {
  const saved = localStorage.getItem("habitflow_theme");
  return (saved as Theme) || "purple";
};
