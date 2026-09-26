'use client';

import React, { useEffect, useState, useRef } from "react";
import api from "../../../config/apiUser";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CarouselSlide } from "../../../types";

export default function Carousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Curated luxury headlines tailored per slide index
  const editorialHeadlines = [
    {
      badge: "Spring / Summer 2026",
      title: "Architectural Lines & Fluid Silhouettes",
      subtitle: "Hand-finished tailoring designed for contemporary urban living.",
      cta: "Discover The Collection",
    },
    {
      badge: "The Atelier Edit",
      title: "Artisanal Textures in Pure Balance",
      subtitle: "Consciously spun organic fibers crafted to endure beyond seasons.",
      cta: "Explore Tailoring",
    },
    {
      badge: "Curated Essentials",
      title: "Monochrome Nuance & Quiet Elegance",
      subtitle: "Clean cuts, refined proportions, and minimalist modern ease.",
      cta: "Shop The Look",
    },
    {
      badge: "Seasonal Archive",
      title: "Everyday Luxury, Thoughtfully Made",
      subtitle: "Elevated wardrobe staples infused with subtle modern detailing.",
      cta: "Explore New Arrivals",
    },
  ];

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchCarousel = async () => {
      try {
        setLoading(true);
        const res = await api.get("/carousel");
        const activeSlides = (res.data?.data || []).filter((s: CarouselSlide) => s.status !== false);
        setSlides(activeSlides);
      } catch (err) {
        console.error("Carousel fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCarousel();
  }, []);

  /* ================= AUTO SLIDE ================= */
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isPaused]);

  const handleNext = () => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    if (slides.length === 0) return;
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleSlideClick = (slide: CarouselSlide) => {
    if (!slide) return;
    if (slide.redirectType === "product" && slide.redirectValue) {
      navigate(`/products/${slide.redirectValue}`);
    } else if (slide.redirectType === "category" && slide.redirectValue) {
      navigate(`/${slide.redirectValue}`);
    } else if (slide.redirectType === "filter" && slide.redirectValue) {
      navigate(`/shop?${slide.redirectValue}`);
    } else {
      navigate("/shop");
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[520px] sm:h-[620px] lg:h-[700px] bg-zinc-200 dark:bg-zinc-900 animate-pulse relative overflow-hidden">
        <div className="absolute bottom-16 left-8 sm:left-16 space-y-4 max-w-lg">
          <div className="h-4 w-32 bg-zinc-300 dark:bg-zinc-800 rounded-full" />
          <div className="h-10 w-80 bg-zinc-300 dark:bg-zinc-800 rounded-2xl" />
          <div className="h-4 w-60 bg-zinc-300 dark:bg-zinc-800 rounded-full" />
        </div>
      </div>
    );
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[current];
  const editorial = editorialHeadlines[current % editorialHeadlines.length];

  return (
    <div
      className="relative w-full h-[520px] sm:h-[620px] lg:h-[700px] overflow-hidden bg-black select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Transition */}
      {slides.map((slide, index) => {
        const isActive = index === current;
        return (
          <div
            key={slide._id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Desktop and Mobile Images */}
            <picture>
              <source media="(max-width: 640px)" srcSet={slide.mobileImage?.url || slide.desktopImage?.url} />
              <img
                src={slide.desktopImage?.url}
                alt={editorial.title}
                className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-102 transition-transform duration-10000 ease-out"
              />
            </picture>

            {/* Gradient Overlays for Luxury Legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          </div>
        );
      })}

      {/* Hero Editorial Content */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-end pb-16 sm:pb-20">
        <div className="max-w-2xl text-white space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{editorial.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            {editorial.title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-300 max-w-lg leading-relaxed font-light">
            {editorial.subtitle}
          </p>

          {/* Call to Action Button */}
          <div className="pt-3">
            <button
              onClick={() => handleSlideClick(currentSlide)}
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-white text-zinc-950 font-bold text-xs sm:text-sm uppercase tracking-wider hover:bg-zinc-200 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 cursor-pointer group/btn"
            >
              <span>{editorial.cta}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </button>
          </div>

        </div>
      </div>

      {/* Floating Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Progress Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-12 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                i === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}

    </div>
  );
}
