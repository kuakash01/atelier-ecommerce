'use client';

import React from "react";

interface CategorySkeletonProps {
  count?: number;
}

export default function CategorySkeleton({ count = 4 }: CategorySkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-zinc-200 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm p-5 sm:p-6 flex flex-col justify-end"
        >
          {/* Shimmer background */}
          <div className="skeleton absolute inset-0" />

          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Bottom Card Content */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-2.5 w-16 bg-white/40 rounded-full" />
              <div className="h-5 w-24 bg-white/70 rounded-lg" />
            </div>
            <div className="w-9 h-9 rounded-full bg-white/30 shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
