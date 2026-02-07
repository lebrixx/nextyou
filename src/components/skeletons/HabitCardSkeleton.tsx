import { Skeleton } from "@/components/ui/skeleton";

const HabitCardSkeleton = () => {
  return (
    <div className="glass rounded-xl p-4 border border-white/5 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Icon skeleton */}
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            {/* Title skeleton */}
            <Skeleton className="h-4 w-3/4 rounded-md" />
            {/* Streak skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16 rounded-md" />
            </div>
          </div>
        </div>
        {/* Button skeleton */}
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
    </div>
  );
};

export const HabitListSkeleton = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <HabitCardSkeleton key={i} />
      ))}
    </div>
  );
};

export default HabitCardSkeleton;
