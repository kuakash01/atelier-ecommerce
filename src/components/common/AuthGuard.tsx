'use client';

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setIsAuthModalOpen } from "../../redux/userSlice";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ArrowRight, Home } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectUrl?: string;
}

export default function AuthGuard({ children, fallback, redirectUrl = "/" }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // When auth check has finished and user is not authenticated, prompt sign in
    if (!isLoading && isAuthenticated === false) {
      dispatch(setIsAuthModalOpen(true));
    }
  }, [isLoading, isAuthenticated, dispatch]);

  // 1. While auth state is verifying on mount, show design-matched skeleton
  if (isLoading || isAuthenticated === null) {
    return (
      <>
        {fallback || (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-900 dark:border-white border-t-transparent animate-spin" />
          </div>
        )}
      </>
    );
  }

  // 2. If authenticated, grant immediate access
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // 3. If unauthenticated, block private content with luxury prompt
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-20 h-20 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white mb-6 shadow-xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-emerald-500/10 rounded-3xl blur-md -z-10" />
        <Lock className="w-9 h-9" />
      </div>

      <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400 mb-2">
        Restricted Access
      </span>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight max-w-md">
        Sign In to Continue
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
        This private destination requires an authorized client account. Please sign in to securely access your personal credentials, orders, and checkout.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => dispatch(setIsAuthModalOpen(true))}
          className="w-full sm:w-auto px-7 py-3 rounded-full bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 text-xs font-bold uppercase tracking-wider transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Sign In to Atelier</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <Link
          to={redirectUrl}
          className="w-full sm:w-auto px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return to Boutique</span>
        </Link>
      </div>
    </div>
  );
}
