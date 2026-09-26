'use client';

import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import HeaderLayout from "./HeaderLayout";
import SidebarLayout from "./SidebarLayout";
import FooterLayout from "./FooterLayout";
import AuthModal from "../../components/user/Auth/AuthModal";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setIsAuthModalOpen, setIsAuthenticated, setUserData, setIsLoading } from "../../redux/userSlice";
import { checkAuthUser } from "../../services/authService";
import api from "../../config/apiUser";
import AnnouncementBar from "../../components/user/header/AnnouncementBar";

interface AppLayoutProps {
  children?: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const isSidebarOpen = useAppSelector((state) => state.theme.isSidebarOpen);
  const isMobileOpen = useAppSelector((state) => state.theme.isMobileOpen);
  const { isAuthenticated, isAuthModalOpen, isLoading } = useAppSelector((state) => state.user);

  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check auth non-blockingly on mount
  useEffect(() => {
    const verifyUser = async () => {
      try {
        dispatch(setIsLoading(true));
        const data = await checkAuthUser();
        if (data && data.isAuthenticated) {
          dispatch(setIsAuthenticated(true));
          dispatch(setUserData(data.userData));
        } else {
          dispatch(setIsAuthenticated(false));
          dispatch(setUserData(null));
        }
      } catch (err) {
        dispatch(setIsAuthenticated(false));
      } finally {
        dispatch(setIsLoading(false));
      }
    };

    verifyUser();
  }, [dispatch]);

  // Sync guest cart when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(setIsAuthModalOpen(false));
      const syncLocalCart = async () => {
        try {
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          if (Array.isArray(localCart) && localCart.length > 0) {
            await api.post("/cart/guest/sync", { items: localCart });
            localStorage.removeItem("cart");
          }
        } catch (error) {
          console.error("Cart sync notice:", error);
        }
      };
      syncLocalCart();
    }
  }, [isAuthenticated, dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Announcement Bar */}
      <div className="relative z-40">
        <AnnouncementBar />
      </div>

      {/* Floating Modern Header */}
      <div className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-all">
        <HeaderLayout />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 relative w-full">
        {/* Mobile / Responsive Sidebar */}
        <div className="absolute inset-y-0 left-0">
          <div
            className={`transition-all duration-300 ease-in-out w-[300px] ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } ${isMobileOpen ? "fixed block top-0 bottom-0 shadow-2xl" : "relative hidden"} z-50`}
          >
            <SidebarLayout />
          </div>
        </div>

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 w-full">
          {children || <Outlet />}
        </main>
      </div>

      {/* Luxury Footer */}
      <FooterLayout />

      {/* Modern Authentication Modal */}
      {mounted && (
        <AuthModal
          isAuthModalOpen={isAuthModalOpen}
          isAuthenticated={isAuthenticated}
          onClose={() => dispatch(setIsAuthModalOpen(false))}
        />
      )}
    </div>
  );
}
