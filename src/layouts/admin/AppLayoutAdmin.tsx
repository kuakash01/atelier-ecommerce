'use client';

import React, { useState, useEffect } from 'react';
import SidebarLayoutAdmin from './SidebarLayoutAdmin';
import HeaderLayoutAdmin from './HeaderLayoutAdmin';
import { cn } from '@/lib/utils';

interface AppLayoutAdminProps {
  children: React.ReactNode;
}

export default function AppLayoutAdmin({ children }: AppLayoutAdminProps) {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('admin_sidebar_collapsed');
    if (saved !== null) {
      setCollapsed(saved === 'true');
    }
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleToggle = (v: boolean | ((prev: boolean) => boolean)) => {
    setCollapsed((prev) => {
      const next = typeof v === 'function' ? v(prev) : v;
      localStorage.setItem('admin_sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0e] text-zinc-900 dark:text-zinc-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <SidebarLayoutAdmin
        collapsed={collapsed}
        setCollapsed={handleToggle}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out print:pl-0',
          collapsed ? 'pl-20' : 'pl-64'
        )}
      >
        <HeaderLayoutAdmin />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto print:p-0 print:max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}
