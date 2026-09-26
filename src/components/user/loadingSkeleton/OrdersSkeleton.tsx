'use client';

import React from "react";

export default function OrdersSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="skeleton h-6 w-36 rounded-lg" />
          <div className="skeleton h-3.5 w-64 rounded-full" />
        </div>
        <div className="skeleton h-6 w-24 rounded-full self-start sm:self-auto" />
      </div>

      {/* Orders List Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4"
          >
            {/* Top Row: Order ID, Date, Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-4 w-4 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
              </div>
              <div className="skeleton h-7 w-24 rounded-full" />
            </div>

            {/* Middle Row: Items Thumbnails & Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3 overflow-hidden">
                {[1, 2].map((imgIdx) => (
                  <div
                    key={imgIdx}
                    className="skeleton w-16 h-20 rounded-xl shrink-0"
                  />
                ))}
                <div className="space-y-2 pl-2">
                  <div className="skeleton h-4 w-48 rounded" />
                  <div className="skeleton h-3.5 w-28 rounded" />
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between sm:justify-end gap-6 sm:text-right pt-2 sm:pt-0">
                <div className="space-y-1">
                  <div className="skeleton h-3 w-16 rounded sm:ml-auto" />
                  <div className="skeleton h-5 w-24 rounded sm:ml-auto" />
                </div>
                <div className="skeleton h-10 w-28 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
