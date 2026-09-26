'use client';

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../redux/hooks";
import { setIsAuthenticated, setUserData } from "../../../redux/userSlice";
import { signoutUser } from "../../../services/authService";
import { UserData } from "../../../types";
import { User, Package, MapPin, LogOut, ChevronDown, Shield } from "lucide-react";
import { toast } from "react-toastify";

interface UserDropdownProps {
  userData: UserData | null;
}

export default function UserDropdown({ userData }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  const handleLogout = async () => {
    handleClose();
    try {
      await signoutUser();
      dispatch(setIsAuthenticated(false));
      dispatch(setUserData(null));
      toast.success("Signed out successfully");
      navigate("/");
    } catch (err) {
      toast.error("Sign out encountered an issue");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = userData?.email ? userData.email[0].toUpperCase() : "U";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        aria-label="User profile menu"
      >
        <div className="w-9 h-9 rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs uppercase shadow-xs">
          {userData?.profilePicture ? (
            <img
              src={userData.profilePicture}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            userInitial
          )}
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-zinc-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Signed in as
            </p>
            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate mt-0.5">
              {userData?.email || "Account"}
            </p>
            {userData?.role === "admin" && (
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold tracking-wider uppercase">
                <Shield className="w-3 h-3" />
                Administrator
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <Link
              to="/profile"
              onClick={handleClose}
              className="flex items-center gap-3 px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white transition"
            >
              <User className="w-4 h-4 text-zinc-400" />
              <span>Personal Profile</span>
            </Link>

            <Link
              to="/profile/orders"
              onClick={handleClose}
              className="flex items-center gap-3 px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white transition"
            >
              <Package className="w-4 h-4 text-zinc-400" />
              <span>Orders & Returns</span>
            </Link>

            <Link
              to="/profile/addresses"
              onClick={handleClose}
              className="flex items-center gap-3 px-4 py-2.5 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-white transition"
            >
              <MapPin className="w-4 h-4 text-zinc-400" />
              <span>Shipping Addresses</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
