'use client';

import React from "react";
import CartItemSkeleton from "./CartItemSkeleton";
import CartSummarySkeleton from "./CartSummarySkeleton";

export default function CartSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 py-10 lg:py-16 animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-8 border-b border-zinc-200 dark:border-zinc-800 gap-4">
          <div className="space-y-2">
            <div className="skeleton h-3.5 w-28 rounded-full" />
            <div className="skeleton h-9 sm:h-11 w-56 rounded-xl" />
          </div>
          <div className="skeleton h-4 w-36 rounded-full" />
        </div>

        {/* Complimentary Shipping Banner Skeleton */}
        <div className="mt-6 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="skeleton h-4 w-64 rounded-full" />
            <div className="skeleton h-4 w-10 rounded-full" />
          </div>
          <div className="skeleton h-1.5 w-full rounded-full" />
        </div>

        {/* Content Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Bag Items (8 cols) */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <CartItemSkeleton />
            </div>
          </div>

          {/* Right Column: Order Summary (4 cols) */}
          <div className="lg:col-span-4 sticky top-28">
            <CartSummarySkeleton />
          </div>

        </div>

      </div>
    </div>
  );
}
