'use client';

import React from "react";

export default function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 px-4 sm:px-6 lg:px-12 py-10 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto">
        
        {/* Stepper Header Skeleton */}
        <div className="mb-10 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="skeleton h-3 w-36 rounded-full" />
              <div className="skeleton h-8 w-60 rounded-xl" />
            </div>

            {/* Stepper Dots Skeleton */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="skeleton h-7 w-20 rounded-full" />
              <div className="skeleton h-0.5 w-6 rounded" />
              <div className="skeleton h-7 w-20 rounded-full" />
              <div className="skeleton h-0.5 w-6 rounded" />
              <div className="skeleton h-7 w-20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Delivery Address Card Skeleton */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-40 rounded" />
                    <div className="skeleton h-3 w-56 rounded-full" />
                  </div>
                </div>
                <div className="skeleton h-8 w-24 rounded-full" />
              </div>

              <div className="p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-2.5">
                <div className="skeleton h-4 w-36 rounded" />
                <div className="skeleton h-3.5 w-3/4 rounded" />
                <div className="skeleton h-3.5 w-1/2 rounded" />
              </div>
            </div>

            {/* 2. Settlement Method Card Skeleton */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-52 rounded" />
                    <div className="skeleton h-3 w-64 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton w-4 h-4 rounded-full" />
                  </div>
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-36 rounded" />
                </div>
                <div className="p-5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="skeleton h-4 w-32 rounded" />
                    <div className="skeleton w-4 h-4 rounded-full" />
                  </div>
                  <div className="skeleton h-3 w-full rounded" />
                  <div className="skeleton h-3 w-36 rounded" />
                </div>
              </div>
            </div>

            {/* 3. Acquisition Review Card Skeleton */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <div className="skeleton h-4 w-44 rounded" />
                    <div className="skeleton h-3 w-60 rounded-full" />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="skeleton w-16 h-20 sm:w-20 sm:h-24 rounded-xl shrink-0" />
                      <div className="space-y-2">
                        <div className="skeleton h-4 w-48 rounded" />
                        <div className="flex gap-2">
                          <div className="skeleton h-4 w-12 rounded-md" />
                          <div className="skeleton h-4 w-16 rounded-md" />
                        </div>
                        <div className="skeleton h-4 w-20 rounded" />
                      </div>
                    </div>
                    <div className="space-y-1.5 text-right">
                      <div className="skeleton h-3 w-12 rounded ml-auto" />
                      <div className="skeleton h-5 w-20 rounded ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: SUMMARY SKELETON ================= */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
              <div className="skeleton h-5 w-44 rounded pb-4 border-b border-zinc-100 dark:border-zinc-800" />
              
              <div className="py-4 space-y-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between">
                  <div className="skeleton h-3.5 w-24 rounded" />
                  <div className="skeleton h-3.5 w-16 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="skeleton h-3.5 w-28 rounded" />
                  <div className="skeleton h-3.5 w-16 rounded" />
                </div>
                <div className="flex justify-between">
                  <div className="skeleton h-3.5 w-32 rounded" />
                  <div className="skeleton h-3.5 w-20 rounded" />
                </div>
              </div>

              <div className="skeleton h-11 w-full rounded-xl" />

              <div className="pt-2 flex justify-between items-baseline">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-7 w-28 rounded-lg" />
              </div>

              <div className="skeleton h-14 w-full rounded-2xl mt-4" />

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                <div className="skeleton h-3 w-48 rounded" />
                <div className="skeleton h-3 w-40 rounded" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
