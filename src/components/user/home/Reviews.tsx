'use client';

import React, { useRef } from "react";
import { Star, ShieldCheck, ChevronLeft, ChevronRight, MessageSquareQuote } from "lucide-react";

interface Review {
  name: string;
  rating: number;
  role: string;
  location: string;
  product: string;
  review: string;
  date: string;
}

export default function Reviews() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const reviews: Review[] = [
    {
      name: "Aarav S.",
      role: "Architectural Designer",
      location: "Mumbai",
      product: "Men Slim Fit Solid Full Sleeves Casual Shirt",
      rating: 5,
      review:
        "The fabric drape and stitch precision rival luxury Savile Row pieces. The mist green hue is nuanced and pairs seamlessly with tailored trousers.",
      date: "February 2026",
    },
    {
      name: "Priya M.",
      role: "Creative Director",
      location: "Bengaluru",
      product: "Women Printed Short Sleeves Shirt",
      rating: 5,
      review:
        "Unbelievably breathable organic cotton blend. The print is understated yet artistic. Delivered within 48 hours in immaculate, plastic-free packaging.",
      date: "January 2026",
    },
    {
      name: "Rohan V.",
      role: "Product Strategist",
      location: "New Delhi",
      product: "Men Solid Full Sleeves Formal Shirt",
      rating: 5,
      review:
        "The collar architecture maintains its crisp shape throughout entire travel days. Easily the best fitting formal shirt in my wardrobe.",
      date: "February 2026",
    },
    {
      name: "Sneha K.",
      role: "Fashion Curator",
      location: "Hyderabad",
      product: "Contemporary Tailored Edit",
      rating: 5,
      review:
        "Finally an Indian label that understands quiet luxury, clean seams, and thoughtful minimalist proportions without garish logos.",
      date: "February 2026",
    },
  ];

  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = direction === "left" ? -380 : 380;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold tracking-widest uppercase text-zinc-600 dark:text-zinc-400 mb-2">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>Client Perspectives</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Verified Experiences
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg">
            Read unedited feedback from our community of collectors and modern discerning dressers.
          </p>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => handleScroll("left")}
            aria-label="Previous review"
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            aria-label="Next review"
            className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shadow-xs cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Reviews Cards Scroll */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
      >
        {reviews.map((r, i) => (
          <div
            key={i}
            className="shrink-0 w-[300px] sm:w-[360px] bg-white dark:bg-zinc-900 rounded-3xl p-7 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Star Rating & Verified Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: r.rating }).map((_, starIdx) => (
                    <Star
                      key={starIdx}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>

              {/* Review Body */}
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal italic">
                "{r.review}"
              </p>
            </div>

            {/* Reviewer Details */}
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-baseline justify-between">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                    {r.name}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {r.role} • {r.location}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">
                  {r.date}
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}
