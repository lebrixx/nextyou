import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StatTooltipProps {
  title: string;
  description: string;
  period?: string;
}

const StatTooltip = ({ title, description, period }: StatTooltipProps) => {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted/50 hover:bg-muted transition-colors">
            <Info className="w-2.5 h-2.5 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="max-w-[250px] p-3 bg-popover border border-border shadow-lg"
        >
          <div className="space-y-1">
            <p className="font-semibold text-xs text-foreground">{title}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
            {period && (
              <p className="text-[10px] text-primary/80 mt-1">📅 Période: {period}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default StatTooltip;
