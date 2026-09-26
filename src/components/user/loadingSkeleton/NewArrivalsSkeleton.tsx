'use client';

import React from "react";

interface NewArrivalsSkeletonProps {
  count?: number;
}

export default function NewArrivalsSkeleton({ count = 4 }: NewArrivalsSkeletonProps) {
  return (
    <div className="flex gap-5 sm:gap-6 overflow-x-hidden pb-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-[260px] sm:w-[285px] shrink-0 bg-white dark:bg-zinc-900 rounded-3xl p-3 sm:p-3.5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3"
        >
          {/* Image */}
          <div className="skeleton aspect-[3/4] w-full rounded-2xl" />

          {/* Tag */}
          <div className="skeleton h-3 w-1/3 rounded-full" />

          {/* Title */}
          <div className="space-y-1.5">
            <div className="skeleton h-3.5 w-full rounded" />
            <div className="skeleton h-3.5 w-3/4 rounded" />
          </div>

          {/* Price & Rating */}
          <div className="flex items-center justify-between pt-1">
            <div className="skeleton h-4 w-20 rounded" />
            <div className="skeleton h-4 w-12 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
