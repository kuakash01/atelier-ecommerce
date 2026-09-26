'use client';

import React from "react";

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Primary Identity Card Skeleton */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
          {/* Avatar */}
          <div className="skeleton w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shrink-0" />

          {/* User Details */}
          <div className="space-y-3 text-center sm:text-left flex-1">
            <div className="skeleton h-3.5 w-24 rounded-full mx-auto sm:mx-0" />
            <div className="skeleton h-6 sm:h-7 w-48 rounded-lg mx-auto sm:mx-0" />
            <div className="skeleton h-4 w-40 rounded mx-auto sm:mx-0" />
            <div className="flex items-center gap-3 justify-center sm:justify-start pt-1">
              <div className="skeleton h-5 w-24 rounded-full" />
              <div className="skeleton h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Profile Form Fields Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="skeleton h-3.5 w-20 rounded" />
            <div className="skeleton h-12 w-full rounded-2xl" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton h-12 w-full rounded-2xl" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-3.5 w-28 rounded" />
            <div className="skeleton h-12 w-full rounded-2xl" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-3.5 w-20 rounded" />
            <div className="skeleton h-12 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
