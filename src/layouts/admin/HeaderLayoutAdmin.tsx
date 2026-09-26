'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/redux/adminSlice';
import { RootState } from '@/redux/store';
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ChevronRight,
  ExternalLink,
  LogOut,
  Shield,
  User,
} from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';

const pathTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/orders': 'Orders Management',
  '/admin/products': 'Products Catalog',
  '/admin/category': 'Category Management',
  '/admin/colors': 'Color Palette',
  '/admin/sizes': 'Size Variants',
  '/admin/tax': 'Tax & GST Rates',
  '/admin/carousel': 'Hero Carousel Slides',
  '/admin/announcement': 'Announcement Bar',
};

export default function HeaderLayoutAdmin() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { adminInfo } = useSelector((state: RootState) => state.admin);

  const handleLogout = async () => {
    try {
      const { signoutAdmin } = await import('@/services/authService');
      await signoutAdmin();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logout());
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('adminInfo');
        window.location.href = '/admin/signin';
      }
    }
  };

  const currentTitle = (pathname && pathTitles[pathname]) || 'Administration';
  const adminName = (adminInfo?.name && adminInfo.name.trim()) || 'Admin User';
  const adminEmail = adminInfo?.email || 'admin@atelier.com';
  const initials =
    adminName
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AD';

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-950/80 px-6 backdrop-blur-md transition-colors duration-200 print:hidden">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <Link
          href="/admin/dashboard"
          className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          Admin
        </Link>
        <ChevronRight className="h-4 w-4 text-zinc-400 dark:text-zinc-600" />
        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{currentTitle}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Badge
          variant="outline"
          className="hidden sm:flex items-center gap-1.5 border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] px-2.5 py-0.5 rounded-full"
        >
          <Shield className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
          ADMINISTRATOR
        </Badge>

        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span>Storefront</span>
        </Link>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="relative h-9 w-9 rounded-full ring-1 ring-zinc-300 dark:ring-zinc-700 hover:ring-indigo-500 transition-all p-0 flex items-center justify-center outline-none cursor-pointer">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 p-1.5 shadow-xl"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal px-2 py-1.5">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100">
                    {adminName}
                  </p>
                  <p className="text-xs leading-none text-zinc-500 dark:text-zinc-400 font-mono">
                    {adminEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
              <DropdownMenuItem
                onClick={() => window.open('/', '_blank')}
                className="flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 focus:bg-zinc-100 dark:focus:bg-zinc-800 focus:text-zinc-900 dark:focus:text-zinc-100 rounded-md"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Visit Storefront</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center gap-2 cursor-pointer text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 focus:bg-rose-50 dark:focus:bg-rose-500/10 focus:text-rose-700 dark:focus:text-rose-300 rounded-md"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
