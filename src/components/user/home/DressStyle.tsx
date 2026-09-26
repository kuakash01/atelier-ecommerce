'use client';

import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Layers } from "lucide-react";

export default function DressStyle() {
  const styles = [
    {
      name: "Metropolitan Casual",
      type: "casual",
      description: "Relaxed silhouettes & premium heavyweight cottons",
      img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Architectural Formal",
      type: "formal",
      description: "Sharp tailoring & fluid double-faced wool",
      img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Evening & Occasion",
      type: "party",
      description: "Lustrous silks & understated statement cuts",
      img: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Performance Athleisure",
      type: "gym",
      description: "Technical microfibers engineered for modern movement",
      img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-zinc-100 dark:bg-zinc-900/60 rounded-3xl p-8 sm:p-12 lg:p-16 border border-zinc-200/80 dark:border-zinc-800">
        
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[11px] font-bold tracking-widest uppercase text-zinc-600 dark:text-zinc-400 mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Aesthetics</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Curated By Dress Code
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Thoughtfully engineered wardrobes designed to transition from boardroom to weekend with deliberate poise.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {styles.map((item, index) => (
            <Link
              key={index}
              to={`/shop?type=${item.type}`}
              className="group relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 block aspect-[4/5]"
            >
              {/* Image */}
              <img
                src={item.img}
                alt={item.name}
                loading="lazy"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  if (target.src !== "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80") {
                    target.src = "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80";
                  }
                }}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                <h3 className="text-lg font-bold tracking-tight mb-1">
                  {item.name}
                </h3>
                <p className="text-xs text-zinc-300 line-clamp-1 mb-3">
                  {item.description}
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white group-hover:translate-x-1 transition-transform">
                  <span>Explore Edit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}
