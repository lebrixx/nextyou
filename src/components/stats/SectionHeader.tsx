import StatTooltip from "./StatTooltip";

interface SectionHeaderProps {
  title: string;
  tooltip: {
    title: string;
    description: string;
    period?: string;
  };
}

const SectionHeader = ({ title, tooltip }: SectionHeaderProps) => {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <h3 className="text-xs font-bold text-foreground">{title}</h3>
      <StatTooltip 
        title={tooltip.title} 
        description={tooltip.description} 
        period={tooltip.period}
      />
    </div>
  );
};

export default SectionHeader;
