'use client';

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";

export default function Searchbar() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    setQuery(searchParams?.get("search") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      navigate("/shop");
      return;
    }
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const handleClear = () => {
    setQuery("");
    if (searchParams?.get("search")) {
      navigate("/shop");
    }
  };

  return (
    <div className="relative w-full max-w-sm py-2">
      <form onSubmit={handleSearch} className="relative flex items-center">
        <input
          id="header-search-input"
          name="search"
          type="search"
          value={mounted ? query : ""}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search collections..."
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          suppressHydrationWarning
          className="w-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-full py-2 pl-4 pr-16 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-zinc-100/20 focus:border-zinc-400 dark:focus:border-zinc-600 transition"
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {mounted && query.length > 0 && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            aria-label="Submit search"
            className="p-1.5 rounded-full text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
