'use client';

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setSidebar } from "../../redux/themeSlice";
import api from "../../config/apiUser";
import { toast } from "react-toastify";
import { X, Sparkles } from "lucide-react";
import SidebarCategories, { CategoryNode } from "../../components/user/sidebar/sidebarCategories";

export default function SidebarLayout() {
  const dispatch = useAppDispatch();
  const isSidebarOpen = useAppSelector((state) => state.theme.isSidebarOpen);
  const [categories, setCategories] = useState<CategoryNode[]>([]);

  const getCategories = async () => {
    try {
      const res = await api.get("/categories/tree");
      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const closeSidebar = () => {
    dispatch(setSidebar(false));
  };

  return (
    <>
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Sidebar Sheet */}
      <aside
        className={`fixed top-0 left-0 h-screen w-[300px] bg-white dark:bg-zinc-900 border-r border-zinc-200/80 dark:border-zinc-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white">
              Atelier Directory
            </span>
          </div>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close sidebar"
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-3 py-4 hide-scrollbar">
          <SidebarCategories categories={categories} onClose={closeSidebar} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 text-center">
          Atelier & Co. • Artisanal Luxury
        </div>
      </aside>
    </>
  );
}
