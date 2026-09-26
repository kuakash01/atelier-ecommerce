'use client';

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import api from "../../../config/apiUser";
import { X, Sparkles, ChevronLeft, ChevronRight, ArrowRight, ExternalLink } from "lucide-react";

export interface AnnouncementItem {
  _id?: string;
  text: string;
  link?: string;
}

interface AnnouncementData {
  items?: AnnouncementItem[];
  message?: string;
  link?: string;
  isActive: boolean;
  backgroundColor?: string;
  textColor?: string;
  autoplaySpeed?: number;
}

// Fallback items if database has not configured announcements yet
const DEFAULT_ITEMS: AnnouncementItem[] = [
  { text: "Complimentary Express Delivery on orders above ₹1,500", link: "/shop" },
  { text: "30-Day Doorstep Returns & Exchanges Guaranteed", link: "/shop" },
  { text: "100% Authentic Luxury — Verified & Sealed", link: "/shop" },
  { text: "New Seasonal Arrivals Just Landed — Explore Now", link: "/shop" },
];

export default function AnnouncementBar() {
  const [data, setData] = useState<AnnouncementData | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch dynamic announcement configuration
  useEffect(() => {
    let isMounted = true;
    const fetchAnnouncement = async () => {
      try {
        const res = await api.get("/announcement");
        if (!isMounted) return;
        if (res.data?.data) {
          setData(res.data.data);
        }
      } catch {
        // Silently ignore — fallback items still show if not explicitly disabled
      }
    };
    fetchAnnouncement();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute active dynamic message list
  const messages: AnnouncementItem[] = React.useMemo(() => {
    if (data?.items && data.items.length > 0) {
      return data.items.filter((item) => item.text && item.text.trim().length > 0);
    }
    if (data?.message && data.message.trim().length > 0) {
      return [{ text: data.message.trim(), link: data.link || "" }];
    }
    // If DB announcement exists but isActive is false, it won't render
    return DEFAULT_ITEMS;
  }, [data]);

  // Next slide
  const advance = useCallback(() => {
    if (messages.length <= 1) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveIdx((i) => (i + 1) % messages.length);
      setAnimating(false);
    }, 250);
  }, [messages.length]);

  // Previous slide
  const previous = useCallback(() => {
    if (messages.length <= 1) return;
    setAnimating(true);
    setTimeout(() => {
      setActiveIdx((i) => (i - 1 + messages.length) % messages.length);
      setAnimating(false);
    }, 250);
  }, [messages.length]);

  // Reveal with a slight delay
  useEffect(() => {
    const hidden = sessionStorage.getItem("hideAnnouncement");
    if (hidden) {
      setDismissed(true);
      return;
    }
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Interval timer for auto-advance with pause support
  useEffect(() => {
    if (!visible || dismissed || isPaused || messages.length <= 1) return;
    const speed = data?.autoplaySpeed && data.autoplaySpeed >= 2000 ? data.autoplaySpeed : 4000;
    intervalRef.current = setInterval(advance, speed);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible, dismissed, isPaused, advance, messages.length, data?.autoplaySpeed]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setDismissed(true), 350);
    sessionStorage.setItem("hideAnnouncement", "true");
  };

  // If explicitly disabled by admin or dismissed by user or no messages
  if (dismissed || (data && data.isActive === false) || messages.length === 0) {
    return null;
  }

  const currentIdx = activeIdx >= messages.length ? 0 : activeIdx;
  const current = messages[currentIdx];
  const hasLink = Boolean(current.link && current.link.trim().length > 0);
  const linkHref = current.link?.trim() || "";
  const isExternal = linkHref.startsWith("http://") || linkHref.startsWith("https://");

  const customBg = data?.backgroundColor || undefined;
  const customText = data?.textColor || "#f4f4f5";

  return (
    <div
      className={`w-full relative overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
        visible ? "max-h-12 opacity-100" : "max-h-0 opacity-0"
      }`}
      style={{ background: customBg }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Default dark luxury gradient if no custom background specified */}
      {!customBg && (
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 dark:from-black dark:via-zinc-950 dark:to-black">
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="w-1/3 h-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent blur-sm animate-[pulse_4s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      {/* Content Row */}
      <div className="relative flex items-center justify-between h-9 sm:h-10 px-3 sm:px-6 md:px-10 max-w-7xl mx-auto">
        {/* Left Side: Controls & Decorative indicator */}
        <div className="flex items-center gap-1.5 z-10">
          {messages.length > 1 && (
            <button
              type="button"
              onClick={previous}
              aria-label="Previous announcement"
              className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft size={13} style={{ color: customText ? customText : undefined }} />
            </button>
          )}

          {/* Left subtle accent dots */}
          <div className="hidden lg:flex items-center gap-1 opacity-40 ml-1">
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            <span className="w-1 h-1 rounded-full bg-amber-400/60" />
          </div>
        </div>

        {/* Center: Message Ticker with optional dynamic link */}
        <div className="flex-1 flex items-center justify-center px-2 min-w-0 overflow-hidden">
          <div
            className={`transition-all duration-300 ease-out flex items-center justify-center text-center ${
              animating ? "opacity-0 -translate-y-1.5 scale-98" : "opacity-100 translate-y-0 scale-100"
            }`}
          >
            {hasLink ? (
              <Link
                href={linkHref}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="group inline-flex items-center gap-2 max-w-full text-center transition-opacity hover:opacity-90 cursor-pointer py-0.5 px-2 rounded-full hover:bg-white/5"
              >
                {/* Dynamic Icon Badge */}
                <span className="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                </span>

                {/* Announcement Dynamic Text */}
                <span
                  className="text-[11px] sm:text-xs font-medium tracking-wide truncate group-hover:underline underline-offset-2"
                  style={{ color: customText }}
                >
                  {current.text}
                </span>

                {/* Clickable CTA Badge */}
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase transition-all shadow-xs shrink-0">
                  <span style={{ color: customText }}>Explore</span>
                  {isExternal ? (
                    <ExternalLink className="w-2.5 h-2.5 opacity-80" style={{ color: customText }} />
                  ) : (
                    <ArrowRight className="w-2.5 h-2.5 opacity-80 group-hover:translate-x-0.5 transition-transform" style={{ color: customText }} />
                  )}
                </span>
              </Link>
            ) : (
              <div className="inline-flex items-center gap-2 max-w-full text-center py-0.5 px-2">
                <span className="shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                </span>
                <span
                  className="text-[11px] sm:text-xs font-medium tracking-wide truncate"
                  style={{ color: customText }}
                >
                  {current.text}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Next button, Dots navigation & Dismiss */}
        <div className="flex items-center gap-1.5 z-10">
          {/* Next Button */}
          {messages.length > 1 && (
            <button
              type="button"
              onClick={advance}
              aria-label="Next announcement"
              className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight size={13} style={{ color: customText ? customText : undefined }} />
            </button>
          )}

          {/* Dots Indicator */}
          {messages.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 ml-1">
              {messages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAnimating(true);
                    setTimeout(() => {
                      setActiveIdx(i);
                      setAnimating(false);
                    }, 250);
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    i === currentIdx
                      ? "w-3.5 h-1.5 bg-amber-400"
                      : "w-1.5 h-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to announcement ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Dismiss button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            className="p-1 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition cursor-pointer ml-1"
          >
            <X size={12} style={{ color: customText ? customText : undefined }} />
          </button>
        </div>
      </div>
    </div>
  );
}
