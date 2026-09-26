'use client';

import React, { useEffect, useState } from "react";
import api from "../../../config/apiUser";
import { Link } from "react-router-dom";
import { Category } from "../../../types";
import CategorySkeleton from "../loadingSkeleton/CategorySkeleton";
import { ArrowUpRight, Compass } from "lucide-react";

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback high-res luxury department covers if category image is not configured in DB
  const defaultDepartmentCovers: Record<string, string> = {
    women: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
    men: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=900&q=80",
    boy: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80",
    girl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=900&q=80",
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get("/categories/root");
        setCategories(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch root categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold tracking-widest uppercase text-zinc-500 dark:text-zinc-400 mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>Curated Departments</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Explore By Category
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          From contemporary menswear tailoring to architectural womenswear silhouettes.
        </p>
      </div>

      {/* Grid */}
      {loading ? (
        <CategorySkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const coverUrl =
              cat.image?.url ||
              defaultDepartmentCovers[cat.slug.toLowerCase()] ||
              "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80";

            return (
              <Link
                key={cat._id}
                to={`/${cat.slug}`}
                className="group relative aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 block"
              >
                {/* Background Photo */}
                <img
                  src={coverUrl}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                />

                {/* Vignette Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                {/* Category Details */}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 text-white flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-300">
                        Department
                      </span>
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5">
                        {cat.name}
                      </h3>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md group-hover:bg-white group-hover:text-zinc-950 flex items-center justify-center transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
