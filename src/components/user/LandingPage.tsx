'use client';

import React from "react";
import { useParams } from "react-router-dom";

export default function LandingPage() {
  const { slug } = useParams<{ slug?: string }>();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
        Collection Campaign: {slug}
      </h1>
      <p className="text-xs text-zinc-500 mt-2">
        Curated seasonal edits and special capsule features.
      </p>
    </div>
  );
}
