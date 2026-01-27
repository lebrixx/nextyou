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
    <div className="inline-flex items-center gap-1">
      <span className="text-[8px] text-muted-foreground/70 italic hidden sm:inline">clique →</span>
      <span className="text-[8px] text-muted-foreground/70 italic sm:hidden">tap →</span>
      <Popover>
        <PopoverTrigger asChild>
          <button 
            className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted/50 hover:bg-muted active:bg-muted/70 transition-colors touch-manipulation"
            aria-label={`Info: ${title}`}
          >
            <Info className="w-2.5 h-2.5 text-muted-foreground" />
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
    </div>
  );
};

export default StatTooltip;
