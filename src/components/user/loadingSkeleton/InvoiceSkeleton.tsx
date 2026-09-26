'use client';

import React from "react";

export default function InvoiceSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Action Bar Skeleton */}
      <div className="flex items-center justify-between">
        <div className="skeleton h-8 w-44 rounded-full" />
        <div className="skeleton h-10 w-36 rounded-full" />
      </div>

      {/* Invoice Sheet Skeleton */}
      <div className="bg-white text-zinc-900 p-6 sm:p-10 rounded-3xl border border-zinc-200 shadow-lg space-y-6">
        {/* Header Branding Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-zinc-900">
          <div className="space-y-2">
            <div className="skeleton h-7 w-48 rounded" />
            <div className="skeleton h-3 w-56 rounded-full" />
            <div className="pt-2 space-y-1">
              <div className="skeleton h-3.5 w-40 rounded" />
              <div className="skeleton h-3 w-52 rounded" />
              <div className="skeleton h-3 w-36 rounded" />
            </div>
          </div>

          <div className="space-y-2 sm:text-right">
            <div className="skeleton h-6 w-28 rounded-md sm:ml-auto" />
            <div className="space-y-1.5 pt-1">
              <div className="skeleton h-3.5 w-36 rounded sm:ml-auto" />
              <div className="skeleton h-3.5 w-32 rounded sm:ml-auto" />
              <div className="skeleton h-3.5 w-28 rounded sm:ml-auto" />
              <div className="skeleton h-3.5 w-40 rounded sm:ml-auto" />
            </div>
          </div>
        </div>

        {/* Bill To & Ship To Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-zinc-200">
          <div className="space-y-2">
            <div className="skeleton h-3 w-32 rounded-full" />
            <div className="skeleton h-5 w-44 rounded" />
            <div className="skeleton h-3.5 w-56 rounded" />
            <div className="skeleton h-3.5 w-40 rounded" />
          </div>
          <div className="space-y-2 sm:text-right">
            <div className="skeleton h-3 w-36 rounded-full sm:ml-auto" />
            <div className="skeleton h-4 w-44 rounded sm:ml-auto" />
            <div className="skeleton h-3.5 w-40 rounded sm:ml-auto" />
            <div className="skeleton h-5 w-48 rounded-full sm:ml-auto" />
          </div>
        </div>

        {/* Table Rows Skeleton */}
        <div className="py-4 space-y-4">
          <div className="skeleton h-8 w-full rounded" />
          {[1, 2, 3].map((row) => (
            <div key={row} className="flex justify-between items-center py-2">
              <div className="skeleton h-4 w-1/3 rounded" />
              <div className="skeleton h-4 w-12 rounded" />
              <div className="skeleton h-4 w-20 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>
          ))}
        </div>

        {/* Financial Summary Skeleton */}
        <div className="pt-4 border-t-2 border-zinc-900 flex flex-col sm:flex-row justify-between gap-6">
          <div className="space-y-2 max-w-xs">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-3 w-full rounded" />
            <div className="skeleton h-3 w-4/5 rounded" />
          </div>
          <div className="w-full sm:w-72 space-y-3">
            <div className="flex justify-between">
              <div className="skeleton h-3.5 w-24 rounded" />
              <div className="skeleton h-3.5 w-16 rounded" />
            </div>
            <div className="flex justify-between">
              <div className="skeleton h-3.5 w-28 rounded" />
              <div className="skeleton h-3.5 w-16 rounded" />
            </div>
            <div className="flex justify-between pt-2 border-t border-zinc-200">
              <div className="skeleton h-5 w-32 rounded" />
              <div className="skeleton h-6 w-24 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
