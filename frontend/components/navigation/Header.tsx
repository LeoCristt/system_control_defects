"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from 'react';

export default function Header() {
    const { user } = useAuth();
    const pathname = usePathname();
    const [darkMode, setDarkMode] = useState(false);


    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const navigationItems = [
        { path: "/dashboard", label: "Главная" },
        { path: "/dashboard/projects", label: "Проекты" },
        { path: "/dashboard/defects", label: "Дефекты" },
        { path: "/dashboard/reports", label: "Отчеты" },
        { path: "/dashboard/profile", label: "Профиль" },
    ];

    // фильтрация по роли
    const filtered = navigationItems.filter((item) => {
        if (user?.role === "engineer" && item.path === "/dashboard/reports") return false;
        return true;
    });

    // сортировка по длине пути чтобы startsWith корректно матчился
    const sorted = [...filtered].sort((a, b) => b.path.length - a.path.length);
    const current = sorted.find((i) => pathname?.startsWith(i.path));
    const title = current ? current.label : "Дашборд";

    return (
        <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md z-50 flex items-center justify-between px-4">
            <div className="flex-1 text-center">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white">{title}</h1>
            </div>
            <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:ring-offset-2 ${darkMode ? 'bg-[#5E62DB]' : 'bg-gray-200'
                        }`}
                >
                    <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'
                            }`}
                    />
                </button>
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            </div>
        </header>
    );
}
