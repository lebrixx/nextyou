import { Skeleton } from "@/components/ui/skeleton";
import { HabitListSkeleton } from "./HabitCardSkeleton";
import { StatsGridSkeleton } from "./StatsCardSkeleton";
import ChartSkeleton from "./ChartSkeleton";

interface PageSkeletonProps {
  type: "habits" | "stats" | "timer";
}

export const HeaderSkeleton = () => (
  <div className="px-6 pt-8 pb-6 animate-pulse">
    <Skeleton className="h-8 w-40 rounded-lg mb-2" />
    <Skeleton className="h-4 w-64 rounded-md" />
  </div>
);

export const SectionSkeleton = ({ title = true }: { title?: boolean }) => (
  <div className="space-y-3 animate-pulse">
    {title && <Skeleton className="h-6 w-32 rounded-lg" />}
    <div className="glass rounded-xl p-4 border border-white/5">
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  </div>
);

const PageSkeleton = ({ type }: PageSkeletonProps) => {
  if (type === "habits") {
    return (
      <div className="min-h-screen bg-background pb-20">
        <HeaderSkeleton />
        <main className="px-6 space-y-6">
          <HabitListSkeleton count={4} />
        </main>
      </div>
    );
  }

  if (type === "stats") {
    return (
      <div className="min-h-screen bg-background pb-20">
        <HeaderSkeleton />
        <main className="px-6 space-y-6">
          <StatsGridSkeleton count={4} />
          <ChartSkeleton />
          <ChartSkeleton height={150} />
        </main>
      </div>
    );
  }

  if (type === "timer") {
    return (
      <div className="min-h-screen bg-background pb-20">
        <HeaderSkeleton />
        <main className="px-6 space-y-6">
          <SectionSkeleton />
          <SectionSkeleton />
        </main>
      </div>
    );
  }

  return null;
};

export default PageSkeleton;
