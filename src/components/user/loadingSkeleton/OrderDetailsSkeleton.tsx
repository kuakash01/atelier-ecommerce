'use client';

import React from "react";

export default function OrderDetailsSkeleton() {
  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Back Button Skeleton */}
      <div className="skeleton h-8 w-28 rounded-full" />

      {/* Header Banner Skeleton */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-2">
          <div className="skeleton h-6 w-48 rounded" />
          <div className="skeleton h-3.5 w-36 rounded-full" />
        </div>
        <div className="skeleton h-8 w-28 rounded-full" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="skeleton h-5 w-32 rounded" />
            
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="pt-6 first:pt-0 flex gap-4 sm:gap-6 items-center">
                  <div className="skeleton w-20 sm:w-24 aspect-[3/4] rounded-2xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 sm:h-5 w-3/4 rounded" />
                    <div className="flex gap-2">
                      <div className="skeleton h-4 w-16 rounded-full" />
                      <div className="skeleton h-4 w-12 rounded-full" />
                    </div>
                    <div className="skeleton h-4 w-24 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Address & Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Address Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-4 w-40 rounded" />
            <div className="skeleton h-3.5 w-full rounded" />
            <div className="skeleton h-3.5 w-2/3 rounded" />
            <div className="skeleton h-3.5 w-28 rounded" />
          </div>

          {/* Price Breakdown */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="skeleton h-3.5 w-20 rounded" />
                <div className="skeleton h-3.5 w-16 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="skeleton h-3.5 w-24 rounded" />
                <div className="skeleton h-3.5 w-14 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="skeleton h-3.5 w-16 rounded" />
                <div className="skeleton h-3.5 w-12 rounded" />
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
              <div className="flex justify-between">
                <div className="skeleton h-5 w-20 rounded" />
                <div className="skeleton h-5 w-24 rounded" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
