'use client';

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Instagram,
  Twitter,
  Facebook,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";

export default function FooterLayout() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) {
      toast.error("Please provide a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Welcome to the Atelier Circle. Check your inbox for private previews.");
    setNewsletterEmail("");
  };

  return (
    <footer className="bg-zinc-900 text-zinc-300 dark:bg-black dark:text-zinc-400 mt-24 border-t border-zinc-800">
      
      {/* Brand Guarantees / Luxury Pillars */}
      <div className="border-b border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-6 py-10 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 text-white">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Complimentary Delivery</h4>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Complimentary express shipping on all domestic orders above ₹1,999.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 text-white">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">15-Day Exchange</h4>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Hassle-free doorstep exchanges and reverse pick-up service.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Verified Authenticity</h4>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Direct from certified artisan mills and sustainable yarn spinners.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Bespoke Fitting</h4>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Tailored silhouettes curated to elevate contemporary wardrobe lines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & VIP Newsletter */}
      <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand Intro & Newsletter */}
          <div className="lg:col-span-5 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-white text-zinc-950 flex items-center justify-center font-bold text-sm tracking-tighter">
                A•L
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-widest text-white leading-none">
                  ATELIER
                </span>
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-zinc-400">
                  Luxe & Co.
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-md">
              Contemporary tailoring and elevated silhouettes designed with deliberate craftsmanship. Thoughtful essentials made to outlast seasons.
            </p>

            {/* Newsletter Sign Up */}
            <div className="pt-2">
              <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-2">
                Join the Private Circle
              </h5>
              <p className="text-xs text-zinc-400 mb-3">
                Receive private collection presales, archival drops, and private invitations.
              </p>

              {subscribed ? (
                <div className="flex items-center gap-2 text-emerald-400 text-xs py-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>You are subscribed to the private registry.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="flex-1 px-4 py-2.5 bg-zinc-800/80 border border-zinc-700/80 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white text-zinc-900 hover:bg-zinc-200 rounded-xl text-xs font-semibold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Join</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

            {/* Social Channels */}
            <div className="flex items-center gap-4 pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-white hover:text-zinc-900 flex items-center justify-center transition"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-white hover:text-zinc-900 flex items-center justify-center transition"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full bg-zinc-800 hover:bg-white hover:text-zinc-900 flex items-center justify-center transition"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Navigation */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                Collections
              </h5>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li>
                  <Link to="/men" className="hover:text-white transition">
                    Men's Ready-to-Wear
                  </Link>
                </li>
                <li>
                  <Link to="/women" className="hover:text-white transition">
                    Women's Signature
                  </Link>
                </li>
                <li>
                  <Link to="/boy" className="hover:text-white transition">
                    Boys Contemporary
                  </Link>
                </li>
                <li>
                  <Link to="/girl" className="hover:text-white transition">
                    Girls Edit
                  </Link>
                </li>
                <li>
                  <Link to="/shop?sort=newArrivals" className="hover:text-white transition">
                    New Arrivals
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                Concierge
              </h5>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li>
                  <Link to="/profile/orders" className="hover:text-white transition">
                    Track Orders
                  </Link>
                </li>
                <li>
                  <Link to="/profile/addresses" className="hover:text-white transition">
                    Shipping Addresses
                  </Link>
                </li>
                <li>
                  <Link to="/cart" className="hover:text-white transition">
                    Bag Summary
                  </Link>
                </li>
                <li>
                  <span className="hover:text-white transition cursor-pointer">
                    Returns & Exchanges
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition cursor-pointer">
                    Garment Care Guide
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-white mb-4">
                The House
              </h5>
              <ul className="space-y-2.5 text-xs text-zinc-400">
                <li>
                  <span className="hover:text-white transition cursor-pointer">
                    Atelier Heritage
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition cursor-pointer">
                    Conscious Textiles
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition cursor-pointer">
                    Privacy Charter
                  </span>
                </li>
                <li>
                  <span className="hover:text-white transition cursor-pointer">
                    Terms of Service
                  </span>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-white transition">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright & Security */}
      <div className="border-t border-zinc-800/80 bg-zinc-950 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} ATELIER & CO. All Rights Reserved. Crafted with precision.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-zinc-300 transition cursor-pointer">Security Protocol</span>
            <span className="hover:text-zinc-300 transition cursor-pointer">Cookie Governance</span>
            <span className="hover:text-zinc-300 transition cursor-pointer">Accessibility</span>
          </div>
        </div>
      </div>

    </footer>
  );
}
