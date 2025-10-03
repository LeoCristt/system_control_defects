"use client";

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DefectsIcon from "@/components/DefectsIcon";
import ReportsIcon from "@/components/ReportsIcon";
import ProjectsIcon from "@/components/ProjectsIcon"
import HomeIcon from "@/components/HomeIcon"
import ProfileIcon from "@/components/ProfileIcon"

export default function Navigation() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Главная',
      icon: ( <HomeIcon />)
    },
    {
      path: '/dashboard/projects',
      label: 'Проекты',
      icon: ( <ProjectsIcon />)
    },
    {
      path: '/dashboard/defects',
      label: 'Дефекты',
      icon:  ( <DefectsIcon /> )
    },
    {
      path: '/dashboard/reports',
      label: 'Отчеты',
      icon: ( <ReportsIcon />)
    },
    ...(user?.role === 'leader' ? [{
      path: '/dashboard/admin',
      label: 'Админ',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    }] : []),
    {
      path: '/dashboard/profile',
      label: 'Профиль',
      icon: ( <ProfileIcon />)
    }
  ];

  // Фильтрация
  const filteredItems = navigationItems.filter(item => {
    if (user?.role === 'engineer' && item.path === '/dashboard/reports') {
      return false;
    }
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="flex justify-around py-2">
        {filteredItems.map(item => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${pathname === item.path
                ? 'text-[#5E62DB] bg-[#5e62db17]'
                : 'text-[#5E62DB] hover:text-[#5E62DB] hover:bg-[#5e62db17]'
              }`}
          >
            <div className={`mb-1 ${pathname === item.path ? 'scale-110' : ''} transition-transform duration-200`}>
              {item.icon}
            </div>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}