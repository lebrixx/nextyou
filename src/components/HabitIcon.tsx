import { 
  Dumbbell, 
  Book, 
  Brain, 
  Heart, 
  Coffee, 
  Moon, 
  Sun, 
  Apple,
  Droplet,
  Cigarette,
  Wine,
  Smartphone,
  Cake,
  PiggyBank,
  Zap,
  Target,
  LucideIcon
} from "lucide-react";

export type HabitIconType = 
  | "sport" 
  | "lecture" 
  | "meditation" 
  | "sante" 
  | "cafe" 
  | "sommeil" 
  | "reveil" 
  | "nutrition"
  | "hydratation"
  | "tabac"
  | "alcool"
  | "ecrans"
  | "sucre"
  | "finance"
  | "energie"
  | "autre";

interface HabitIconProps {
  type: HabitIconType;
  className?: string;
}

const iconMap: Record<HabitIconType, LucideIcon> = {
  sport: Dumbbell,
  lecture: Book,
  meditation: Brain,
  sante: Heart,
  cafe: Coffee,
  sommeil: Moon,
  reveil: Sun,
  nutrition: Apple,
  hydratation: Droplet,
  tabac: Cigarette,
  alcool: Wine,
  ecrans: Smartphone,
  sucre: Cake,
  finance: PiggyBank,
  energie: Zap,
  autre: Target,
};

const HabitIcon = ({ type, className = "w-6 h-6" }: HabitIconProps) => {
  const Icon = iconMap[type] || Target;
  return <Icon className={className} />;
};

export default HabitIcon;
