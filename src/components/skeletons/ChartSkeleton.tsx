import { Skeleton } from "@/components/ui/skeleton";

const ChartSkeleton = ({ height = 200 }: { height?: number }) => {
  return (
    <div className="glass rounded-xl p-4 border border-white/5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32 rounded-md" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton 
              className="w-full rounded-t-md" 
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
            <Skeleton className="h-3 w-6 rounded-sm" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartSkeleton;
