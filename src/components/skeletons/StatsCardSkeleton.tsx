import { Skeleton } from "@/components/ui/skeleton";

const StatsCardSkeleton = () => {
  return (
    <div className="glass rounded-xl p-4 border border-white/5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <Skeleton className="h-5 w-12 rounded-lg" />
      </div>
      <Skeleton className="h-2 w-20 rounded-md mb-2" />
      <Skeleton className="h-8 w-16 rounded-md" />
    </div>
  );
};

export const StatsGridSkeleton = ({ count = 4 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default StatsCardSkeleton;
