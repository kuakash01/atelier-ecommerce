'use client';

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { toggleSidebar } from "../../redux/themeSlice";
import { setIsAuthModalOpen } from "../../redux/userSlice";
import api from "../../config/apiUser";
import { Link } from "react-router-dom";
import { Category } from "../../types";
import Searchbar from "../../components/user/header/Searchbar";
import UserDropdown from "../../components/user/header/UserDropdown";
import ThemeToggle from "../../components/common/ThemeToggle";
import { ShoppingBag, Menu, X, ChevronDown, Sparkles } from "lucide-react";

interface MegaPanelProps {
  category: Category | null;
  onSelect: (cat: Category | null) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function MegaPanel({ category, onSelect, onMouseEnter, onMouseLeave }: MegaPanelProps) {
  if (!category || !category.children || category.children.length === 0) return null;

  return (
    <div
      className="absolute left-0 top-full w-screen bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-2xl transition-all duration-300 z-50 animate-in fade-in slide-in-from-top-2 pt-2"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-5 gap-8">
          {category.children.map((child) => (
            <div key={child._id} className="space-y-4">
              <Link
                to={`/${child.slug}`}
                onClick={() => onSelect(null)}
                className="block text-xs uppercase font-bold tracking-wider text-zinc-900 dark:text-white hover:text-neutral-600 dark:hover:text-zinc-400 transition"
              >
                {child.name}
              </Link>

              {child.children && child.children.length > 0 && (
                <ul className="space-y-2.5">
                  {child.children.map((sub) => (
                    <li key={sub._id}>
                      <Link
                        to={`/${sub.slug}`}
                        onClick={() => onSelect(null)}
                        className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                      >
                        {sub.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Editorial Spotlight Card in Mega Menu */}
          <div className="col-span-1 rounded-2xl bg-zinc-100 dark:bg-zinc-900 p-5 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-3 h-3" />
                Curated Drop
              </span>
              <h4 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-white">
                {category.name} Atelier Essentials
              </h4>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Handcrafted cuts designed for fluid modern versatility.
              </p>
            </div>
            <Link
              to={`/${category.slug}`}
              onClick={() => onSelect(null)}
              className="mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-white hover:underline"
            >
              Explore Collection →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeaderLayout() {
  const dispatch = useAppDispatch();
  const isMobileOpen = useAppSelector((state) => state.theme.isMobileOpen);
  const isSidebarOpen = useAppSelector((state) => state.theme.isSidebarOpen);
  const { userData, isAuthenticated } = useAppSelector((state) => state.user);

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterCategory = (cat: Category) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveCategory(cat);
  };

  const handleMouseLeaveNav = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 200);
  };

  const handleMouseEnterPanel = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories/tree");
        if (res.data?.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        console.error("Categories fetch error:", err);
      }
    };
    fetchCategories();

    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  return (
    <header className="relative w-full" onMouseLeave={handleMouseLeaveNav}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              aria-label="Toggle navigation menu"
              className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Brand Logotype */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold text-sm tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
                A•L
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base sm:text-lg tracking-widest text-zinc-900 dark:text-white leading-none">
                  ATELIER
                </span>
                <span className="text-[9px] font-semibold tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500">
                  Luxe & Co.
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Categories */}
          <nav
            ref={navContainerRef}
            className="hidden lg:flex items-center space-x-8 h-full"
            onMouseLeave={handleMouseLeaveNav}
          >
            {categories.map((cat) => (
              <div
                key={cat._id}
                onMouseEnter={() => handleMouseEnterCategory(cat)}
                className="h-full flex items-center"
              >
                <Link
                  to={`/${cat.slug}`}
                  className={`text-xs font-semibold uppercase tracking-wider py-2 flex items-center gap-1 transition-colors ${
                    activeCategory?._id === cat._id
                      ? "text-zinc-900 dark:text-white border-b-2 border-zinc-900 dark:border-white"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {cat.name}
                  {cat.children && cat.children.length > 0 && (
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  )}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right: Actions (Search, Cart, Theme, Account) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Searchbar */}
            <div className="hidden sm:block">
              <Suspense fallback={<div className="w-48 sm:w-64 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />}>
                <Searchbar />
              </Suspense>
            </div>

            {/* Shopping Bag Drawer / Link */}
            <Link
              to="/cart"
              aria-label="Shopping Bag"
              className="relative p-2.5 rounded-full text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {(userData?.cartCount ?? 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1 shadow-sm">
                  {userData?.cartCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Account State */}
            <div>
              {isAuthenticated ? (
                <UserDropdown userData={userData} />
              ) : (
                <button
                  type="button"
                  onClick={() => dispatch(setIsAuthModalOpen(true))}
                  className="px-4 sm:px-5 py-2 rounded-full bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-xs font-semibold uppercase tracking-wider transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap"
                >
                  Sign In
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mega Menu Dropdown */}
      <MegaPanel
        category={activeCategory}
        onSelect={setActiveCategory}
        onMouseEnter={handleMouseEnterPanel}
        onMouseLeave={handleMouseLeaveNav}
      />
    </header>
  );
}
