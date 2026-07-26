import React from 'react';

export const SkeletonCard: React.FC = () => (
  <div className="glass-card-premium p-6 space-y-4">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl skeleton-shimmer" />
      <div className="w-20 h-6 rounded-full skeleton-shimmer" />
    </div>
    <div className="space-y-2">
      <div className="w-3/4 h-5 rounded skeleton-shimmer" />
      <div className="w-1/2 h-4 rounded skeleton-shimmer" />
    </div>
    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
      <div className="w-16 h-4 rounded skeleton-shimmer" />
      <div className="w-24 h-8 rounded-lg skeleton-shimmer" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="table-panel-container p-6 space-y-4">
    <div className="flex items-center justify-between pb-4 border-b border-white/10">
      <div className="w-36 h-6 rounded skeleton-shimmer" />
      <div className="w-28 h-9 rounded-xl skeleton-shimmer" />
    </div>
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full skeleton-shimmer" />
            <div className="space-y-1">
              <div className="w-32 h-4 rounded skeleton-shimmer" />
              <div className="w-20 h-3 rounded skeleton-shimmer" />
            </div>
          </div>
          <div className="w-24 h-4 rounded skeleton-shimmer" />
          <div className="w-16 h-6 rounded-full skeleton-shimmer" />
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonStats: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="glass-card-premium p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="w-24 h-4 rounded skeleton-shimmer" />
          <div className="w-8 h-8 rounded-lg skeleton-shimmer" />
        </div>
        <div className="w-32 h-8 rounded skeleton-shimmer" />
        <div className="w-20 h-3 rounded skeleton-shimmer" />
      </div>
    ))}
  </div>
);
