'use client';

import React from "react";

export default function CartSummarySkeleton() {
  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="skeleton h-5 w-36 rounded" />

      {/* Summary Rows */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>

        <div className="flex justify-between items-center">
          <div className="skeleton h-4 w-28 rounded" />
          <div className="skeleton h-4 w-16 rounded" />
        </div>

        <div className="flex justify-between items-center">
          <div className="skeleton h-4 w-20 rounded" />
          <div className="skeleton h-4 w-12 rounded" />
        </div>

        <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />

        <div className="flex justify-between items-center">
          <div className="skeleton h-5 w-28 rounded" />
          <div className="skeleton h-6 w-24 rounded-lg" />
        </div>
      </div>

      {/* Promo Code Box */}
      <div className="skeleton h-12 w-full rounded-2xl" />

      {/* Checkout CTA Button */}
      <div className="skeleton h-13 w-full rounded-full" />
    </div>
  );
}
