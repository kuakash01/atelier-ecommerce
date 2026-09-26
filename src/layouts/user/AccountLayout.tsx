'use client';

import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { setIsAuthenticated, setUserData } from "../../redux/userSlice";
import api from "../../config/apiUser";
import { 
  User, 
  Package, 
  MapPin, 
  Sparkles, 
  LogOut, 
  ShieldCheck, 
  ChevronRight
} from "lucide-react";
import { toast } from "react-toastify";
import AuthGuard from "../../components/common/AuthGuard";
import ProfileSkeleton from "../../components/user/loadingSkeleton/ProfileSkeleton";

interface AccountLayoutProps {
  children?: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { userData } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { name: "Identity & Profile", path: "/profile", icon: User, desc: "Personal credentials & tier" },
    { name: "My Orders", path: "/profile/orders", icon: Package, desc: "Order history & track status" },
    { name: "Saved Addresses", path: "/profile/addresses", icon: MapPin, desc: "Dispatch locations" },
  ];

  const handleSignOut = async () => {
    try {
      await api.post("/auth/signout");
      dispatch(setIsAuthenticated(false));
      dispatch(setUserData(null));
      toast.success("Successfully signed out");
      navigate("/");
    } catch {
      dispatch(setIsAuthenticated(false));
      dispatch(setUserData(null));
      navigate("/");
    }
  };

  const displayName = userData?.name || "Client";
  const userInitials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AuthGuard fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14"><ProfileSkeleton /></div>}>
      <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 py-10 lg:py-14 print:py-0 print:bg-white print:min-h-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 print:p-0 print:max-w-none">
        
        {/* VIP Member Client Hub Banner */}
        <div className="mb-10 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden print:hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Client Avatar */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-extrabold text-xl sm:text-2xl flex items-center justify-center shadow-lg border-2 border-white dark:border-zinc-800 flex-shrink-0">
                {userData?.profilePicture ? (
                  <img
                    src={userData.profilePicture}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{userInitials || "U"}</span>
                )}
                <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {displayName}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {userData?.email || "Personal Account Portal"}
                </p>
              </div>
            </div>

            {/* Account Status Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Complimentary Express</span>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/60 dark:border-zinc-700/60 text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Verified Account</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layout: Navigation Sidebar + View Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block print:w-full">
          
          {/* Client Navigation (4 cols) */}
          <div className="lg:col-span-4 sticky top-28 space-y-4 print:hidden">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-sm space-y-1.5">
              <span className="block px-3 pt-2 pb-3 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Account Navigation
              </span>

              {menu.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 group ${
                      isActive
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-md scale-[1.01]"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`p-2 rounded-xl transition-colors ${
                          isActive
                            ? "bg-white/10 dark:bg-zinc-900/10"
                            : "bg-zinc-100 dark:bg-zinc-800 group-hover:bg-white dark:group-hover:bg-zinc-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold tracking-tight">
                          {item.name}
                        </div>
                        <div
                          className={`text-[10px] ${
                            isActive
                              ? "text-zinc-300 dark:text-zinc-600"
                              : "text-zinc-400"
                          }`}
                        >
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isActive
                          ? "translate-x-0.5 opacity-100"
                          : "opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5"
                      }`}
                    />
                  </Link>
                );
              })}

              {/* Sign Out Action */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/40">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <span>Sign Out of Atelier</span>
                </button>
              </div>
            </div>
          </div>

          {/* View Content Area (8 cols) */}
          <div className="lg:col-span-8 min-w-0 print:w-full print:block">
            {children || <Outlet />}
          </div>

        </div>

      </div>
    </div>
    </AuthGuard>
  );
}
