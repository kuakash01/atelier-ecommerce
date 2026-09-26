'use client';

import React from "react";

export default function CartItemSkeleton() {
  return (
    <div className="space-y-6 divide-y divide-zinc-100 dark:divide-zinc-800">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="pt-6 first:pt-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
        >
          {/* Media & Details */}
          <div className="flex gap-4 sm:gap-6 items-center flex-1 min-w-0">
            {/* Image Placeholder */}
            <div className="skeleton w-20 sm:w-24 aspect-[3/4] rounded-2xl shrink-0" />

            {/* Info */}
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-20 rounded-full" />
              <div className="skeleton h-4 sm:h-5 w-4/5 rounded" />
              <div className="flex gap-2 pt-1">
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-5 w-14 rounded-full" />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-3 w-14 rounded" />
              </div>
            </div>
          </div>

          {/* Stepper & Actions */}
          <div className="flex items-center gap-4 self-end sm:self-center">
            <div className="skeleton h-9 w-28 rounded-full" />
            <div className="skeleton w-9 h-9 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
