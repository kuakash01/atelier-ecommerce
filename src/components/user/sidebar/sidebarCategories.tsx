'use client';

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface CategoryNode {
  _id: string;
  name: string;
  slug?: string;
  children?: CategoryNode[];
}

interface SidebarCategoriesProps {
  categories: CategoryNode[];
  onClose: () => void;
}

export default function SidebarCategories({ categories, onClose }: SidebarCategoriesProps) {
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);

  const toggleCat = (id: string) => {
    setOpenCat(openCat === id ? null : id);
    setOpenSub(null);
  };

  const toggleSub = (id: string) => {
    setOpenSub(openSub === id ? null : id);
  };

  return (
    <div className="px-2">
      <p className="px-2 mb-3 text-xs font-semibold text-zinc-400 uppercase tracking-widest">
        Browse Collections
      </p>

      <div className="space-y-1">
        {categories.map((cat) => (
          <div
            key={cat._id}
            className="rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80 mb-1"
          >
            {/* Main Category */}
            <button
              type="button"
              onClick={() => toggleCat(cat._id)}
              className="w-full flex items-center justify-between px-3.5 py-3 font-semibold text-sm text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <span>{cat.name}</span>
              {openCat === cat._id ? (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {/* Child Level */}
            {openCat === cat._id && (
              <div className="bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                {cat.children?.map((child) => (
                  <div key={child._id}>
                    <button
                      type="button"
                      onClick={() => toggleSub(child._id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition cursor-pointer"
                    >
                      <span>{child.name}</span>
                      {child.children?.length ? (
                        openSub === child._id ? (
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        )
                      ) : null}
                    </button>

                    {/* Sub -> Sub */}
                    {openSub === child._id && child.children && child.children.length > 0 && (
                      <div className="bg-zinc-50 dark:bg-zinc-800/40 px-6 py-2 space-y-1">
                        {child.children.map((sub) => (
                          <Link
                            key={sub._id}
                            to={`/${sub.slug || "shop"}`}
                            onClick={onClose}
                            className="block py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
