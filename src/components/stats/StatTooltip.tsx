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
          className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 hover:bg-primary/30 active:bg-primary/40 border border-primary/30 transition-all touch-manipulation shadow-sm"
          aria-label={`Info: ${title}`}
        >
          <Info className="w-3.5 h-3.5 text-primary" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        align="center"
        className="w-[260px] p-3 bg-popover border border-border shadow-lg z-50"
        sideOffset={8}
      >
        <div className="space-y-1.5">
          <p className="font-semibold text-xs text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
          {period && (
            <p className="text-[10px] text-primary/80 mt-1.5 pt-1.5 border-t border-border/50">
              📅 Période: {period}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default StatTooltip;
