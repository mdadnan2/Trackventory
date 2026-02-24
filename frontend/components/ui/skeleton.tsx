'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
}

export default function Skeleton({ className = '', variant = 'rectangular' }: SkeletonProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  return (
    <div className={`animate-pulse bg-slate-200 ${variants[variant]} ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200">
      <Skeleton className="h-6 w-1/3 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100">
          <Skeleton className="h-10 w-10" variant="circular" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
