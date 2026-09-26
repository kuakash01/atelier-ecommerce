'use client';

import React from "react";

export default function ProductSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-zinc-950 py-8 px-4 sm:px-6 lg:px-16 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 lg:gap-12">

          {/* Images Skeleton */}
          <div className="col-span-12 lg:col-span-7">
            {/* Mobile Slider Skeleton */}
            <div className="lg:hidden">
              <div className="min-w-full aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden skeleton" />
              <div className="flex justify-center gap-1.5 mt-3">
                <span className="w-5 h-1.5 rounded-full skeleton" />
                <span className="w-1.5 h-1.5 rounded-full skeleton" />
                <span className="w-1.5 h-1.5 rounded-full skeleton" />
              </div>
            </div>

            {/* Desktop 2-Col Grid */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 rounded-3xl overflow-hidden skeleton"
                />
              ))}
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="col-span-12 lg:col-span-5">
            <div className="space-y-6">
              <div className="skeleton h-3.5 w-32 rounded-full" />
              <div className="space-y-2">
                <div className="skeleton h-8 w-4/5 rounded-xl" />
                <div className="skeleton h-8 w-3/5 rounded-xl" />
              </div>

              <div className="flex items-center gap-3">
                <div className="skeleton h-10 w-32 rounded-xl" />
                <div className="skeleton h-6 w-20 rounded-lg" />
              </div>

              <div className="border-t border-zinc-200 dark:border-zinc-800" />

              <div>
                <div className="skeleton h-3.5 w-24 rounded mb-3" />
                <div className="flex gap-3 flex-wrap">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-9 h-9 rounded-full skeleton" />
                  ))}
                </div>
              </div>

              <div>
                <div className="skeleton h-3.5 w-20 rounded mb-3" />
                <div className="flex gap-2.5 flex-wrap">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-9 w-14 rounded-2xl skeleton" />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <div className="flex-1 h-12 rounded-2xl skeleton" />
                <div className="flex-1 h-12 rounded-2xl skeleton" />
              </div>

              <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-4 w-52 rounded" />
                <div className="skeleton h-4 w-40 rounded" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
