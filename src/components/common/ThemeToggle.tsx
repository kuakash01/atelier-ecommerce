'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { toggleTheme } from '../../redux/themeSlice';
import { LightModeIcon, DarkModeIcon } from '../../icons';

export default function ThemeToggle() {
  const currentTheme = useAppSelector((state) => state.theme.currentTheme);
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [currentTheme]);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-800" />
    );
  }

  const isDark = currentTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="p-2 rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition duration-200 cursor-pointer flex items-center justify-center w-9 h-9 shadow-xs"
    >
      {isDark ? (
        <LightModeIcon className="w-4 h-4 text-amber-400" />
      ) : (
        <DarkModeIcon className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
      )}
    </button>
  );
}
