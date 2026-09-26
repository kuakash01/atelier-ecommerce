'use client';

import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6">
      <div className="text-center max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xl rounded-3xl p-8 sm:p-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
          <span>Atelier Concierge Notice</span>
        </div>

        {/* 404 */}
        <h1 className="text-7xl sm:text-8xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2 font-mono">
          404
        </h1>

        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white tracking-tight mb-2">
          Piece Not Found
        </h2>

        {/* Message */}
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
          The requested style or silhouette is currently unavailable, has transitioned to an archive edition, or does not exist.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 rounded-full text-xs font-bold uppercase tracking-wider transition shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Boutique</span>
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-zinc-200 dark:border-zinc-700 rounded-full text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>

      </div>
    </div>
  );
}
