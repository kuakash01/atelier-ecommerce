'use client';

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Range } from "react-range";
import { 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  RotateCcw, 
  Sparkles, 
  ArrowUpDown,
  Check
} from "lucide-react";
import api from "../../config/apiUser";
import useScrollToTop from "../../hooks/useScrollToTop";
import ProductCard from "../../components/user/product/ProductCard";
import ShopSkeleton from "../../components/user/loadingSkeleton/ShopSkeleton";
import NotFound from "./NotFound";
import { Product } from "../../types";

interface ColorFilter {
  _id: string;
  name: string;
  colorCode?: string;
  hex?: string;
  colorHex?: string;
}

interface SizeFilter {
  _id: string;
  name: string;
}

interface FilterData {
  minPrice: number;
  maxPrice: number;
  colors: ColorFilter[];
  sizes: SizeFilter[];
  styles: string[];
}

const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 10000;

export default function Shop() {
  const { slug } = useParams<{ slug: string }>();
  const [params, setParams] = useSearchParams();

  useScrollToTop();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<FilterData | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("featured");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Read active filters from URL search params
  const paramMin = params.get("min");
  const paramMax = params.get("max");
  const paramColors = params.get("color") ? params.get("color")!.split(",") : [];
  const paramSizes = params.get("size") ? params.get("size")!.split(",") : [];
  const paramStyle = params.get("style") || "";
  const paramSearch = params.get("search") || "";

  const [priceRange, setPriceRange] = useState<number[]>([
    paramMin ? Number(paramMin) : DEFAULT_MIN_PRICE,
    paramMax ? Number(paramMax) : DEFAULT_MAX_PRICE,
  ]);

  const [openSections, setOpenSections] = useState({
    price: true,
    color: true,
    size: true,
    style: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Computed safe boundaries for price range slider (rounded to 50 intervals)
  const rawMin = typeof filters?.minPrice === "number" && !isNaN(filters.minPrice) ? filters.minPrice : DEFAULT_MIN_PRICE;
  const rawMax = typeof filters?.maxPrice === "number" && !isNaN(filters.maxPrice) ? filters.maxPrice : DEFAULT_MAX_PRICE;
  const minBoundary = Math.floor(rawMin / 50) * 50;
  const maxBoundary = Math.max(minBoundary + 50, Math.ceil(rawMax / 50) * 50);

  const safeRangeValues = useMemo(() => {
    let lower = Number(priceRange[0]);
    let upper = Number(priceRange[1]);
    if (isNaN(lower) || lower < minBoundary) lower = minBoundary;
    if (isNaN(upper) || upper > maxBoundary) upper = maxBoundary;
    lower = Math.round(lower / 50) * 50;
    upper = Math.round(upper / 50) * 50;
    if (lower < minBoundary) lower = minBoundary;
    if (upper > maxBoundary) upper = maxBoundary;
    if (lower > upper) {
      lower = minBoundary;
      upper = maxBoundary;
    }
    return [lower, upper];
  }, [priceRange, minBoundary, maxBoundary]);

  // Sync price slider range when filters are loaded from backend
  useEffect(() => {
    if (filters && maxBoundary > minBoundary) {
      const min = paramMin ? Math.max(minBoundary, Number(paramMin)) : minBoundary;
      const max = paramMax ? Math.min(maxBoundary, Number(paramMax)) : maxBoundary;
      setPriceRange([min, max]);
    }
  }, [filters, paramMin, paramMax, minBoundary, maxBoundary]);

  // 1. Fetch Category verification and Filters (only runs when slug changes)
  useEffect(() => {
    let isSubscribed = true;

    const fetchCategoryAndFilters = async () => {
      try {
        setNotFound(false);

        // Verify category slug
        const catRes = await api.get("/categories");
        const categories: Array<{ slug: string }> = catRes.data?.data || [];
        const isValid = slug === "shop" || categories.some((c) => c.slug === slug);

        if (!isValid) {
          if (isSubscribed) {
            setNotFound(true);
            setLoading(false);
          }
          return;
        }

        // Fetch available filters
        const filterRes = await api.get(`/products/${slug}/filters`);
        if (isSubscribed && filterRes.data?.filters) {
          setFilters(filterRes.data.filters);
        }
      } catch (err) {
        console.error("Failed to load shop category metadata:", err);
        if (isSubscribed) setNotFound(true);
      }
    };

    fetchCategoryAndFilters();

    return () => {
      isSubscribed = false;
    };
  }, [slug]);

  // 2. Fetch products (runs when slug or URL filter parameters change)
  const paramsKey = params.toString();
  useEffect(() => {
    let isSubscribed = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = Object.fromEntries(params.entries());
        const prodRes = await api.get(`/products/${slug}/list`, { params: query });
        if (isSubscribed && prodRes.data?.products) {
          setProducts(prodRes.data.products);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      isSubscribed = false;
    };
  }, [slug, paramsKey]);

  // Toggle Color
  const handleToggleColor = (id: string) => {
    const current = new Set(paramColors);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    const updated = Array.from(current);
    const newParams = new URLSearchParams(params);
    if (updated.length > 0) {
      newParams.set("color", updated.join(","));
    } else {
      newParams.delete("color");
    }
    setParams(newParams);
  };

  // Toggle Size
  const handleToggleSize = (id: string) => {
    const current = new Set(paramSizes);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    const updated = Array.from(current);
    const newParams = new URLSearchParams(params);
    if (updated.length > 0) {
      newParams.set("size", updated.join(","));
    } else {
      newParams.delete("size");
    }
    setParams(newParams);
  };

  // Toggle Style
  const handleToggleStyle = (selectedStyle: string) => {
    const newParams = new URLSearchParams(params);
    if (paramStyle === selectedStyle) {
      newParams.delete("style");
    } else {
      newParams.set("style", selectedStyle);
    }
    setParams(newParams);
  };

  // Apply Price Filter
  const handleApplyPrice = () => {
    const newParams = new URLSearchParams(params);
    newParams.set("min", String(safeRangeValues[0]));
    newParams.set("max", String(safeRangeValues[1]));
    setParams(newParams);
    setIsMobileFilterOpen(false);
  };

  // Clear All Filters
  const handleClearAll = () => {
    const newParams = new URLSearchParams();
    if (paramSearch) newParams.set("search", paramSearch);
    setParams(newParams);
    setPriceRange([minBoundary, maxBoundary]);
    setIsMobileFilterOpen(false);
  };

  // Helper name lookups
  const getColorName = (id: string) => {
    return filters?.colors.find((c) => c._id === id)?.name || id;
  };

  const getSizeName = (id: string) => {
    return filters?.sizes.find((s) => s._id === id)?.name || id;
  };

  const isCustomPrice =
    paramMin !== null &&
    paramMax !== null &&
    (Number(paramMin) !== minBoundary || Number(paramMax) !== maxBoundary);

  const activeFilterCount =
    paramColors.length +
    paramSizes.length +
    (paramStyle ? 1 : 0) +
    (isCustomPrice ? 1 : 0);

  // Sorting products
  const sortedProducts = useMemo(() => {
    const list = [...products];
    if (sortBy === "price-low") {
      return list.sort((a, b) => (a.price || 0) - (b.price || 0));
    }
    if (sortBy === "price-high") {
      return list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }
    if (sortBy === "discount") {
      return list.sort((a, b) => {
        const discA = a.mrp && a.price ? a.mrp - a.price : 0;
        const discB = b.mrp && b.price ? b.mrp - b.price : 0;
        return discB - discA;
      });
    }
    return list;
  }, [products, sortBy]);

  if (notFound) {
    return <NotFound />;
  }

  if (loading && !products.length) {
    return <ShopSkeleton />;
  }

  const categoryDisplayName =
    slug === "shop"
      ? "All Collections"
      : slug
      ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ")
      : "Collection";

  // The Filter Sidebar Content render function (used in both desktop sidebar & mobile drawer)
  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Price Filter */}
      <div className="border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
        <button
          type="button"
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white py-1"
        >
          <span>Price Range</span>
          <ChevronDown
            className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
              openSections.price ? "rotate-180" : ""
            }`}
          />
        </button>

        {openSections.price && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              <span>₹{safeRangeValues[0].toLocaleString()}</span>
              <span>₹{safeRangeValues[1].toLocaleString()}</span>
            </div>

            {maxBoundary > minBoundary && (
              <div className="px-2 py-2">
                <Range
                  step={50}
                  min={minBoundary}
                  max={maxBoundary}
                  values={safeRangeValues}
                  onChange={(values) => setPriceRange(values)}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      className="h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full relative"
                    >
                      <div
                        className="absolute h-1.5 bg-zinc-900 dark:bg-white rounded-full"
                        style={{
                          left: `${((safeRangeValues[0] - minBoundary) / (maxBoundary - minBoundary)) * 100}%`,
                          width: `${((safeRangeValues[1] - safeRangeValues[0]) / (maxBoundary - minBoundary)) * 100}%`,
                        }}
                      />
                      {children}
                    </div>
                  )}
                  renderThumb={({ props, isDragged }) => (
                    <div
                      {...props}
                      key={props.key}
                      className={`h-4 w-4 rounded-full bg-zinc-900 dark:bg-white border-2 border-white dark:border-zinc-950 shadow-md focus:outline-none transition-transform ${
                        isDragged ? "scale-125" : ""
                      }`}
                    />
                  )}
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleApplyPrice}
              className="w-full py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              Apply Price
            </button>
          </div>
        )}
      </div>

      {/* Colors Filter */}
      {filters?.colors && filters.colors.length > 0 && (
        <div className="border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
          <button
            type="button"
            onClick={() => toggleSection("color")}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white py-1"
          >
            <span>Color Palette</span>
            <ChevronDown
              className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                openSections.color ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.color && (
            <div className="mt-4 flex flex-wrap gap-2.5">
              {filters.colors.map((c) => {
                const isSelected = paramColors.includes(c._id);
                const hex = (c.colorCode || c.colorHex || c.hex || "#888888").trim();
                const isLight =
                  hex.toLowerCase() === "#ffffff" ||
                  hex.toLowerCase() === "#fff" ||
                  hex.toLowerCase() === "white";

                return (
                  <button
                    key={c._id}
                    type="button"
                    title={c.name}
                    onClick={() => handleToggleColor(c._id)}
                    className={`relative w-8 h-8 rounded-full border transition-all flex items-center justify-center cursor-pointer shadow-sm ${
                      isLight
                        ? "border-zinc-300 dark:border-zinc-600"
                        : "border-black/10 dark:border-white/10"
                    } ${
                      isSelected
                        ? "ring-2 ring-zinc-900 dark:ring-white ring-offset-2 dark:ring-offset-zinc-900 scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: hex }}
                  >
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 drop-shadow-sm ${
                          isLight ? "text-zinc-900" : "text-white"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Sizes Filter */}
      {filters?.sizes && filters.sizes.length > 0 && (
        <div className="border-b border-zinc-200/80 dark:border-zinc-800 pb-5">
          <button
            type="button"
            onClick={() => toggleSection("size")}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white py-1"
          >
            <span>Size</span>
            <ChevronDown
              className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                openSections.size ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.size && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.sizes.map((s) => {
                const isSelected = paramSizes.includes(s._id);
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => handleToggleSize(s._id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Dress Styles Filter */}
      {filters?.styles && filters.styles.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => toggleSection("style")}
            className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white py-1"
          >
            <span>Dress Style</span>
            <ChevronDown
              className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${
                openSections.style ? "rotate-180" : ""
              }`}
            />
          </button>

          {openSections.style && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.styles.map((st) => {
                const isSelected = paramStyle === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleToggleStyle(st)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          <Link to="/" className="hover:text-zinc-900 dark:hover:text-white transition">
            Home
          </Link>
          <span>/</span>
          <span className="text-zinc-900 dark:text-white font-medium">
            {categoryDisplayName}
          </span>
        </nav>

        {/* Top Header & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 mb-1">
              <Sparkles className="w-3 h-3" />
              Signature Atelier Collection
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              {paramSearch ? `Search results for "${paramSearch}"` : categoryDisplayName}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Showing {sortedProducts.length} curated {sortedProducts.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold uppercase tracking-wider shadow-sm"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center ml-1">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative inline-flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-3.5 text-zinc-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-9 pr-8 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-800 dark:text-zinc-200 shadow-sm outline-none cursor-pointer focus:ring-1 focus:ring-zinc-400 transition"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Savings</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 pb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mr-1">
              Active Filters:
            </span>

            {/* Price Chip */}
            {isCustomPrice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                ₹{paramMin} - ₹{paramMax}
                <button
                  type="button"
                  onClick={() => {
                    const newParams = new URLSearchParams(params);
                    newParams.delete("min");
                    newParams.delete("max");
                    setParams(newParams);
                  }}
                  className="hover:text-red-500 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Colors Chips */}
            {paramColors.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
              >
                Color: {getColorName(id)}
                <button
                  type="button"
                  onClick={() => handleToggleColor(id)}
                  className="hover:text-red-500 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Size Chips */}
            {paramSizes.map((id) => (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
              >
                Size: {getSizeName(id)}
                <button
                  type="button"
                  onClick={() => handleToggleSize(id)}
                  className="hover:text-red-500 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Style Chip */}
            {paramStyle && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                Style: {paramStyle}
                <button
                  type="button"
                  onClick={() => handleToggleStyle(paramStyle)}
                  className="hover:text-red-500 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Clear All Button */}
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline ml-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Clear all
            </button>
          </div>
        )}

        {/* Main Content Layout: Sidebar + Product Grid */}
        <div className="mt-8 flex gap-8 items-start">
          
          {/* Desktop Sticky Sidebar */}
          <aside className="hidden lg:block w-72 xl:w-80 flex-shrink-0 sticky top-28">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-5 mb-5 border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-zinc-900 dark:text-white" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    Refine Selection
                  </h3>
                </div>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-[11px] font-semibold text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition"
                  >
                    Reset
                  </button>
                )}
              </div>

              {renderFilterContent()}
            </div>
          </aside>

          {/* Products Grid Area */}
          <main className="flex-1 min-w-0">
            {sortedProducts.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-12 text-center my-6">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-8 h-8 opacity-60" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  No matching pieces found
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  We could not find any items matching your selected filters. Try broadening your criteria or reset filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="mt-6 px-6 py-2.5 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition cursor-pointer shadow-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    item={product}
                    className="w-full"
                  />
                ))}
              </div>
            )}
          </main>
        </div>

      </div>

      {/* Mobile Slide-Over Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-zinc-900 dark:text-white" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                  Filters ({activeFilterCount})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderFilterContent()}
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex gap-3">
              <button
                type="button"
                onClick={handleClearAll}
                className="flex-1 py-3 rounded-full border border-zinc-300 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-semibold uppercase tracking-wider shadow-sm transition"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
