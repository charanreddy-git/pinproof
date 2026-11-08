import type { ReactNode } from "react";

interface SkeletonProps {
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const roundedClasses = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

export function Skeleton({ className = "", rounded = "md" }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`skeleton block ${roundedClasses[rounded]} ${className}`}
    />
  );
}

function SkeletonShell({
  children,
  width = "max-w-5xl",
}: {
  children: ReactNode;
  width?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`mx-auto ${width} animate-fade-in space-y-5`}
    >
      {children}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** Mirrors the lean dashboard: header, one active card, then a compact grid. */
export function DashboardSkeleton() {
  return (
    <SkeletonShell width="max-w-2xl">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-3.5 w-56 max-w-full" rounded="full" />
        </div>
        <Skeleton className="hidden h-10 w-24 sm:block" rounded="xl" />
      </div>

      <div className="rounded-3xl bg-primary-950 p-4 shadow-elevated sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="block h-6 w-32 rounded-full bg-white/15" />
          <span className="block h-6 w-20 rounded-full bg-white/15" />
        </div>
        <span className="mt-4 block h-6 w-3/4 rounded bg-white/15" />
        <span className="mt-2 block h-3.5 w-1/2 rounded-full bg-white/10" />
        <span className="mt-4 block h-12 w-full rounded-xl bg-white/15" />
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3.5 w-16" rounded="full" />
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex min-h-[78px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-surface-200 bg-white px-1.5 py-2.5"
            >
              <Skeleton className="h-5 w-5" rounded="full" />
              <Skeleton className="h-3 w-12" rounded="full" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Skeleton className="h-5 w-24" />
        <div className="mt-2 space-y-2">
          {[0, 1].map((item) => (
            <Skeleton key={item} className="h-14 w-full" rounded="2xl" />
          ))}
        </div>
      </div>
    </SkeletonShell>
  );
}

export function VisitListSkeleton() {
  return (
    <SkeletonShell>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2.5">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-3.5 w-64 max-w-full" rounded="full" />
        </div>
        <Skeleton className="h-11 w-28" rounded="xl" />
      </div>
      <Skeleton className="h-14 w-full" rounded="2xl" />
      <div className="space-y-2.5">
        {[0, 1, 2, 3].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-2xl border border-surface-200 bg-white p-3.5"
          >
            <Skeleton className="h-11 w-11" rounded="xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" rounded="full" />
              <Skeleton className="h-3 w-1/2" rounded="full" />
            </div>
            <Skeleton className="h-7 w-20" rounded="full" />
          </div>
        ))}
      </div>
    </SkeletonShell>
  );
}

export function VisitDetailSkeleton() {
  return (
    <SkeletonShell>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-32" rounded="xl" />
        <Skeleton className="h-6 w-44" rounded="full" />
      </div>
      <div className="space-y-2.5">
        <Skeleton className="h-3.5 w-20" rounded="full" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-3.5 w-full max-w-xl" rounded="full" />
      </div>
      <div className="grid gap-5 lg:grid-cols-12">
        <div className="space-y-5 lg:col-span-7">
          <Skeleton className="h-[280px] w-full" rounded="2xl" />
          <Skeleton className="h-[180px] w-full" rounded="2xl" />
        </div>
        <div className="space-y-5 lg:col-span-5">
          <Skeleton className="h-56 w-full" rounded="2xl" />
          <Skeleton className="h-64 w-full" rounded="2xl" />
        </div>
      </div>
    </SkeletonShell>
  );
}
