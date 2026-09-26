'use client';

import React from "react";

export default function AddressSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="space-y-2">
          <div className="skeleton h-6 w-44 rounded-lg" />
          <div className="skeleton h-3.5 w-64 rounded-full" />
        </div>
        <div className="skeleton h-10 w-32 rounded-full self-start sm:self-auto" />
      </div>

      {/* Addresses Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Badge & Type */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="skeleton w-6 h-6 rounded-full" />
                  <div className="skeleton h-4 w-16 rounded" />
                </div>
                {n === 1 && <div className="skeleton h-5 w-16 rounded-full" />}
              </div>

              {/* Contact Name & Phone */}
              <div className="space-y-1.5 pt-1">
                <div className="skeleton h-5 w-36 rounded" />
                <div className="skeleton h-3.5 w-28 rounded" />
              </div>

              {/* Address Lines */}
              <div className="space-y-1 pt-1">
                <div className="skeleton h-3.5 w-full rounded" />
                <div className="skeleton h-3.5 w-3/4 rounded" />
                <div className="skeleton h-3.5 w-1/2 rounded" />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="skeleton h-4 w-24 rounded" />
              <div className="flex gap-2">
                <div className="skeleton h-8 w-14 rounded-full" />
                <div className="skeleton h-8 w-14 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
