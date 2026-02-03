import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StatTooltipProps {
  title: string;
  description: string;
  period?: string;
}

const StatTooltip = ({ title, description, period }: StatTooltipProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button 
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/15 hover:bg-primary/25 active:bg-primary/35 border border-primary/25 transition-all touch-manipulation min-h-[32px]"
          aria-label={`Info: ${title}`}
        >
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span className="text-[10px] font-medium text-primary/90">Détails</span>
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="center"
        className="w-[280px] p-3.5 bg-popover border border-border shadow-lg z-50"
        sideOffset={8}
      >
        <div className="space-y-2">
          <p className="font-semibold text-sm text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
          {period && (
            <p className="text-[11px] text-primary/80 mt-2 pt-2 border-t border-border/50">
              📅 Période: {period}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StatTooltip;
