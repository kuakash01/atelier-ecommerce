'use client';

import React, { useState, useEffect, useRef } from "react";
import api from "../../../config/apiUser";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import NewArrivalsSkeleton from "../loadingSkeleton/NewArrivalsSkeleton";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { Product } from "../../../types";

export default function NewArrivals() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        const res = await api.get("/products/newArrivals");
        setNewArrivals(res.data?.data || []);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -350 : 350;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400">
              The Latest Drop
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            New Arrivals
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg">
            Contemporary silhouettes and tailored essentials crafted from premium natural textiles.
          </p>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => handleScroll("left")}
            aria-label="Previous products"
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            aria-label="Next products"
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-xs cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <NewArrivalsSkeleton count={4} />
      ) : newArrivals.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800">
          <p className="text-zinc-500 text-sm">New arrivals collection is being updated. Explore our full catalog.</p>
          <Link
            to="/shop"
            className="inline-block mt-4 px-6 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition"
          >
            Explore All Styles
          </Link>
        </div>
      ) : (
        /* Products Slider */
        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
        >
          {newArrivals.map((item) => (
            <div key={item._id} className="shrink-0">
              <ProductCard item={item} />
            </div>
          ))}

          {/* Explore More Card */}
          <Link
            to="/shop?sort=newArrivals"
            className="shrink-0 w-[200px] sm:w-[220px] rounded-3xl bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 p-8 flex flex-col justify-between text-white group hover:bg-black transition-all duration-300 shadow-md"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                Full Catalog
              </span>
              <h3 className="mt-3 text-xl font-bold tracking-tight">
                Explore The Complete Drop
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase group-hover:translate-x-1 transition-transform">
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}
    </section>
  );
}
