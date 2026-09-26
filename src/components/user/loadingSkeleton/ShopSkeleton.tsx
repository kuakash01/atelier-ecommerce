'use client';

import React from "react";

export default function ShopSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 py-8 lg:py-12 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="skeleton h-3 w-12 rounded-full" />
          <span className="text-zinc-300 dark:text-zinc-700">/</span>
          <div className="skeleton h-3 w-24 rounded-full" />
        </div>

        {/* Top Header & Toolbar Skeleton */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="space-y-2">
            <div className="skeleton h-3.5 w-36 rounded-full" />
            <div className="skeleton h-8 sm:h-10 w-64 sm:w-80 rounded-xl" />
            <div className="skeleton h-3.5 w-44 rounded-full" />
          </div>

          <div className="flex items-center gap-3">
            <div className="skeleton h-9 w-24 rounded-full" />
            <div className="skeleton h-9 w-36 rounded-full" />
          </div>
        </div>

        {/* Content Layout */}
        <div className="mt-8 flex gap-8 items-start">
          
          {/* Left Desktop Filters Sidebar Skeleton */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-6">
              
              {/* Filter Section 1: Price */}
              <div className="space-y-3">
                <div className="skeleton h-4 w-28 rounded" />
                <div className="skeleton h-2 w-full rounded-full mt-4" />
                <div className="flex justify-between pt-2">
                  <div className="skeleton h-3 w-14 rounded" />
                  <div className="skeleton h-3 w-14 rounded" />
                </div>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

              {/* Filter Section 2: Colors */}
              <div className="space-y-3">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="flex flex-wrap gap-2 pt-1">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="skeleton w-7 h-7 rounded-full" />
                  ))}
                </div>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

              {/* Filter Section 3: Sizes */}
              <div className="space-y-3">
                <div className="skeleton h-4 w-16 rounded" />
                <div className="flex flex-wrap gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="skeleton h-8 w-11 rounded-xl" />
                  ))}
                </div>
              </div>

              <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

              {/* Filter Section 4: Styles */}
              <div className="space-y-3">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="space-y-2 pt-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton h-7 w-full rounded-xl" />
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Right Products Grid Skeleton */}
          <main className="flex-1 min-w-0">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div
                  key={n}
                  className="bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-3"
                >
                  {/* Image Placeholder */}
                  <div className="skeleton aspect-[3/4] w-full rounded-xl sm:rounded-2xl" />

                  {/* Brand / Subtitle */}
                  <div className="skeleton h-3 w-1/3 rounded-full" />

                  {/* Title */}
                  <div className="space-y-1.5">
                    <div className="skeleton h-3.5 w-full rounded" />
                    <div className="skeleton h-3.5 w-4/5 rounded" />
                  </div>

                  {/* Price & Badge */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="skeleton h-4 w-20 rounded" />
                    <div className="skeleton h-4 w-10 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </main>

        </div>

      </div>
    </div>
  );
}
