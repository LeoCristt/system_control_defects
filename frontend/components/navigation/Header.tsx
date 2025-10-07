"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from 'react';

const THEME_KEY = 'theme';

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname();

  const getInitialDark = () => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
    } catch (e) {
    }
    return false;
  };

  const [darkMode, setDarkMode] = useState<boolean>(getInitialDark);

  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem(THEME_KEY, 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem(THEME_KEY, 'light');
      }
    } catch (e) {
      console.error('Theme persist error', e);
    }
  }, [darkMode]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY && e.newValue) {
        setDarkMode(e.newValue === 'dark');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq || typeof mq.addEventListener !== 'function') return;
    const onChange = (ev: MediaQueryListEvent) => {
      try {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === null) {
          setDarkMode(ev.matches);
        }
      } catch (e) { 
        
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const navigationItems = [
    { path: "/dashboard", label: "Главная" },
    { path: "/dashboard/projects", label: "Проекты" },
    { path: "/dashboard/defects", label: "Дефекты" },
    { path: "/dashboard/reports", label: "Отчеты" },
    { path: "/dashboard/profile", label: "Профиль" },
  ];

  const filtered = navigationItems.filter((item) => {
    if (user?.role === "engineer" && item.path === "/dashboard/reports") return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => b.path.length - a.path.length);
  const current = sorted.find((i) => pathname?.startsWith(i.path));
  const title = current ? current.label : "Дашборд";

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md z-50 flex items-center justify-between px-4">
      <div className="flex-1 text-center">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">{title}</h1>
      </div>
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>

        <button
          onClick={toggleTheme}
          aria-pressed={darkMode}
          aria-label={darkMode ? 'Выключить тёмную тему' : 'Включить тёмную тему'}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:ring-offset-2 ${darkMode ? 'bg-[#5E62DB]' : 'bg-gray-200'}`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>

        <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </div>
    </header>
  );
}
