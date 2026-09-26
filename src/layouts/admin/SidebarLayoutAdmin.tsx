'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/adminSlice';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Palette,
  Ruler,
  Percent,
  Sliders,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Commerce',
    items: [
      { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { name: 'Products', href: '/admin/products', icon: Package },
      { name: 'Categories', href: '/admin/category', icon: Layers },
    ],
  },
  {
    title: 'Catalog',
    items: [
      { name: 'Colors', href: '/admin/colors', icon: Palette },
      { name: 'Sizes', href: '/admin/sizes', icon: Ruler },
      { name: 'Tax Rates', href: '/admin/tax', icon: Percent },
    ],
  },
  {
    title: 'Content',
    items: [
      { name: 'Hero Carousel', href: '/admin/carousel', icon: Sliders },
      { name: 'Announcement', href: '/admin/announcement', icon: Megaphone },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void;
}

export default function SidebarLayoutAdmin({
  collapsed,
  setCollapsed,
}: SidebarProps) {
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

  const adminName = adminInfo?.name || 'Administrator';
  const adminEmail = adminInfo?.email || 'admin@atelier.com';
  const initials = adminName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TooltipProvider delay={0}>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-all duration-300 ease-in-out select-none print:hidden',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-800/80">
          <Link
            href="/admin/dashboard"
            className={cn(
              'flex items-center gap-3 transition-opacity overflow-hidden',
              collapsed ? 'justify-center w-full' : ''
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-500 shadow-md shadow-indigo-600/30 text-white font-bold tracking-wider text-base">
              A
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-sm tracking-wide text-zinc-900 dark:text-zinc-100">
                  ATELIER
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-600 dark:text-indigo-400 font-semibold">
                  Admin Panel
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-800">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed ? (
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  {section.title}
                </p>
              ) : (
                <div className="my-2 h-[1px] bg-zinc-200 dark:bg-zinc-800/80 mx-2" />
              )}
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (Boolean(pathname) &&
                    item.href !== '/admin/dashboard' &&
                    pathname!.startsWith(item.href));

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger
                        render={
                          <Link
                            href={item.href}
                            className={cn(
                              'flex h-10 w-10 mx-auto items-center justify-center rounded-lg transition-all',
                              isActive
                                ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-medium shadow-xs'
                                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200'
                            )}
                          />
                        }
                      >
                        <Icon className="h-5 w-5" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-xs shadow-md">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-600/15 text-indigo-700 dark:text-indigo-300 font-medium border-l-2 border-indigo-600 dark:border-indigo-500 shadow-xs'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-200'
                      )}
                    />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-zinc-200 dark:border-zinc-800/80 p-3 space-y-2">
          {/* View Store link */}
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Link
                    href="/"
                    target="_blank"
                    className="flex h-10 w-10 mx-auto items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
                  />
                }
              >
                <ExternalLink className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-200 text-xs shadow-md">
                View Storefront
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>View Storefront</span>
            </Link>
          )}

          {/* Admin profile & logout */}
          <div
            className={cn(
              'flex items-center justify-between rounded-lg bg-zinc-100 dark:bg-zinc-900/60 p-2 border border-zinc-200 dark:border-zinc-800/60',
              collapsed ? 'flex-col gap-2' : ''
            )}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <Avatar className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700">
                <AvatarFallback className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-col truncate">
                  <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {adminName}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate">
                    {adminEmail}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-7 w-7 text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 cursor-pointer"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Collapse toggle */}
          <div className="flex justify-center pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed((prev) => !prev)}
              className="w-full h-7 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 flex items-center justify-center gap-1 cursor-pointer"
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" />
              ) : (
                <>
                  <ChevronLeft className="h-3.5 w-3.5" />
                  <span>Collapse sidebar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
