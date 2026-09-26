import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center px-6 selection:bg-zinc-900 selection:text-white">
      <div className="text-center max-w-lg bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl p-10 sm:p-12 border border-zinc-200/80 dark:border-zinc-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold tracking-widest uppercase text-zinc-500 mb-6">
          <Compass className="w-3.5 h-3.5" />
          <span>Error 404 • Destination Not Found</span>
        </div>
        
        <h1 className="text-6xl sm:text-7xl font-extrabold text-zinc-900 dark:text-white tracking-tight mb-3">
          Archived
        </h1>
        
        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
          The requested edit, product, or department appears to have moved or does not exist within our current catalogue.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Boutique</span>
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-full font-semibold text-xs uppercase tracking-wider hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
