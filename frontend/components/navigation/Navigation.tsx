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