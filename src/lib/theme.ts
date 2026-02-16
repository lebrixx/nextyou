export type Theme = "purple" | "blue" | "green";
export type AppearanceMode = "light" | "dark";

export const themes = {
  purple: {
    primary: "264 87% 50%",
    "primary-glow": "264 80% 60%",
    "gradient-primary": "linear-gradient(135deg, hsl(264, 87%, 50%), hsl(264, 80%, 60%))",
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
  
  localStorage.setItem("timeritual_theme", theme);
};

export const getTheme = (): Theme => {
  const saved = localStorage.getItem("timeritual_theme");
  return (saved as Theme) || "purple";
};

export const applyAppearance = (mode: AppearanceMode) => {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("timeritual_appearance", mode);
};

export const getAppearance = (): AppearanceMode => {
  const saved = localStorage.getItem("timeritual_appearance");
  return (saved as AppearanceMode) || "light";
};
