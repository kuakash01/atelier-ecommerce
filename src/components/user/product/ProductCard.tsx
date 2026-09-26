'use client';

import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../../../types";
import { Sparkles } from "lucide-react";

interface ProductCardProps {
  item: Product;
  className?: string;
}

export default function ProductCard({ item, className }: ProductCardProps) {
  const discountPercent =
    item.mrp && item.price && item.mrp > item.price
      ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
      : 0;

  const colorVariants = item.allColors || item.colors || [];

  return (
    <div className={`group relative bg-white dark:bg-zinc-900 rounded-2xl sm:rounded-3xl overflow-hidden border border-zinc-200/70 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full ${className || "w-[240px] sm:w-[270px] lg:w-[285px]"}`}>
      
      {/* Product Image Container */}
      <Link
        to={`/products/${item._id}`}
        className="relative block aspect-[3/4] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800"
      >
        <img
          src={item.thumbnail?.url}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {discountPercent > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm">
              -{discountPercent}%
            </span>
          )}
          {item.inStock === false && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-rose-600 text-white shadow-sm">
              Sold Out
            </span>
          )}
        </div>
      </Link>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
        <div>
          {/* Category Tag */}
          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">
            {item.category || "Atelier Silhouette"}
          </p>

          {/* Product Title */}
          <Link
            to={`/products/${item._id}`}
            className="mt-1.5 block font-semibold text-sm sm:text-base text-zinc-900 dark:text-white group-hover:text-neutral-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-1 leading-snug"
            title={item.title}
          >
            {item.title}
          </Link>

          {/* Price Row */}
          <div className="flex items-baseline gap-2.5 mt-2">
            <span className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              ₹{item.price?.toLocaleString("en-IN")}
            </span>
            {item.mrp > item.price && (
              <span className="text-xs text-zinc-400 line-through">
                ₹{item.mrp?.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>

        {/* Color Palette Swatches */}
        {colorVariants.length > 0 && (
          <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {colorVariants.slice(0, 5).map((color, idx) => {
              const hex = color.colorHex || color.hex || "#000000";
              const name = color.colorName || color.name || "Color";
              const isAvailable = color.inStock !== false;

              return (
                <Link
                  key={idx}
                  to={`/products/${item._id}?color=${encodeURIComponent(name)}`}
                  title={name}
                  className={`w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 transition-transform duration-200 ${
                    isAvailable ? "hover:scale-125 cursor-pointer shadow-xs" : "opacity-30 cursor-not-allowed"
                  }`}
                  style={{ backgroundColor: hex }}
                />
              );
            })}

            {colorVariants.length > 5 && (
              <span className="text-[10px] text-zinc-400 ml-1 font-medium">
                +{colorVariants.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
