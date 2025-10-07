"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import LoadingPage from '@/components/LoadingPage';
 
interface ProfileData {
  full_name: string;
  phone_number: string | null;
  hire_date: string | null;
  address: string | null;
  available_projects_count: number;
  closed_defects_count: number;
  open_defects_count: number;
  reports_generated_count: number;
}

interface Project {
  id: number;
  name: string;
}

export default function DashboardPage() {
  const { user: authUser } = useAuth(); // Assuming AuthContext provides user data
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (err) {
        console.error('Failed to decode token:', err);
      }
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await res.json();
        setProfileData(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    const fetchProjects = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/profile/projects`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch projects');
        }

        const data = await res.json();
        setProjects(data);
      } catch (error) {
        console.error('Failed to fetch projects', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchProfile(), fetchProjects()]);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <LoadingPage />
    );
  }

  if (error) {
    return (
      <div className="pt-14 pb-16 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">Ошибка: {error}</div>
      </div>
    );
  }

  if (!authUser || !profileData) return null;

  const displayUser = {
    id: authUser.id.toString(),
    name: profileData.full_name,
    role: authUser.role,
    email: authUser.email,
    phone: profileData.phone_number || 'Не указан',
    avatar: 'https://avatars.mds.yandex.net/get-shedevrum/14123243/cropped_original_8d39c8da6e6311efba3cba626bd321fb/orig',
    joinDate: profileData.hire_date ? new Date(profileData.hire_date).toLocaleDateString('ru-RU') : 'Не указана',
    location: profileData.address || 'Не указан',
    projects: profileData.available_projects_count,
    defectsResolved: profileData.closed_defects_count,
    pendingDefects: profileData.open_defects_count,
    reportsGenerated: profileData.reports_generated_count,
  };

  return (
    <div className="pt-14 pb-16 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Главная панель</h2>
          {userRole === 'engineer' && (
            <button
              onClick={() => router.push('./defects/create')}
              className="px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Создать дефект
            </button>
          )}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Добро пожаловать, {displayUser.name}!</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 border border-transparent">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-[#5E62DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Проекты</h3>
            </div>
            <div className="text-3xl font-bold text-[#5E62DB]">{displayUser.projects}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Активных проектов: {projects.filter(p => p.status !== 'completed').length}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
              <p>Ваши проекты: {projects.map(p => p.name).join(', ') || 'Нет проектов'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 border border-transparent">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-[#5E62DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Дефекты</h3>
            </div>
            <div className="text-3xl font-bold text-[#5E62DB]">{displayUser.pendingDefects + displayUser.defectsResolved}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Ожидают: {displayUser.pendingDefects} / Устранено: {displayUser.defectsResolved}
            </p>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
              <p>Следите за статусами дефектов в разделе "Дефекты".</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 border border-transparent">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-[#5E62DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Отчёты</h3>
            </div>
            <div className="text-3xl font-bold text-[#5E62DB]">{displayUser.reportsGenerated}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Сгенерировано за всё время</p>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
              <p>Генерируйте отчёты в формате PDF или Excel.</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Полезная информация</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 border border-transparent">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Руководство по системе</h4>
              <p className="text-gray-700 dark:text-gray-300 text-base mb-3">Ознакомьтесь с руководством пользователя для эффективной работы с системой. Доступно в разделе "Помощь".</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 border border-transparent">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Советы по безопасности</h4>
              <p className="text-gray-700 dark:text-gray-300 text-base mb-3">Регулярно проверяйте дефекты на стройплощадке и обновляйте их статусы для точного контроля качества.</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 border border-transparent">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Техническая поддержка</h4>
              <p className="text-gray-700 dark:text-gray-300 text-base mb-3">Свяжитесь с нами через support@construction.com или используйте встроенный чат для оперативной помощи.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}