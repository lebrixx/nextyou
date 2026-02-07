import { Skeleton } from "@/components/ui/skeleton";

const TimerCardSkeleton = () => {
  return (
    <div className="glass rounded-xl p-4 border border-white/5 animate-pulse">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3 rounded-md" />
          <Skeleton className="h-6 w-1/2 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="w-9 h-9 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const TimerListSkeleton = ({ count = 2 }: { count?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <TimerCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default TimerCardSkeleton;
