"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingPage from '@/components/LoadingPage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('projects');
  const { user, logout } = useAuth();
  const router = useRouter();

  const [profileData, setProfileData] = useState<any>(null);

  const [projects, setProjects] = useState<any[]>([]);

  const [recentActivity] = useState([
    { id: 1, type: 'defect_resolved', message: 'Устранен дефект "Трещина в стене" на объекте ЖК "Северная звезда"', time: '2 часа назад', priority: 'high' },
    { id: 3, type: 'report', message: 'Создан отчет по качеству за неделю', time: '1 день назад', priority: 'low' },
    { id: 4, type: 'defect_created', message: 'Обнаружен новый дефект на объекте "Технопарк"', time: '2 дня назад', priority: 'high' },
  ]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    const fetchProjects = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/users/profile/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
      }
    };

    fetchProfile();
    fetchProjects();
  }, []);

  if (!user || !profileData) {
    return <LoadingPage/>
  }

  const displayUser = {
    id: user.id.toString(),
    name: profileData.full_name,
    role: user.role,
    email: user.email,
    phone: profileData.phone_number || 'Не указан',
    avatar: 'https://avatars.mds.yandex.net/get-shedevrum/14123243/cropped_original_8d39c8da6e6311efba3cba626bd321fb/orig',
    joinDate: profileData.hire_date || 'Не указана',
    location: profileData.address || 'Не указан',
    projects: profileData.available_projects_count,
    defectsResolved: profileData.closed_defects_count,
    pendingDefects: profileData.open_defects_count
  };

  const getRoleName = (role: string) => {
    const roles = {
      manager: 'Менеджер',
      leader: 'Руководитель',
      engineer: 'Инженер'
    };
    return roles[role as keyof typeof roles];
  };

  const getRoleColor = (role: string) => {
    const colors = {
      manager: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      leader: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      engineer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[role as keyof typeof colors];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      paused: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[status as keyof typeof colors];
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-500',
      medium: 'text-yellow-500',
      low: 'text-green-500'
    };
    return colors[priority as keyof typeof colors];
  };

  return (
    <div className="pt-14 pb-16 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <img
                    src={displayUser.avatar}
                    alt={displayUser.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700"
                  />
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-full flex items-center justify-center transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayUser.name}</h2>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(displayUser.role)}`}>
                    {getRoleName(displayUser.role)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center space-x-3 text-sm">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-900 dark:text-gray-100">{displayUser.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-900 dark:text-gray-100">{displayUser.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-900 dark:text-gray-100">{displayUser.location}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 13a2 2 0 002 2h6a2 2 0 002-2L16 7m-6 0V3a2 2 0 012-2h4a2 2 0 012 2v4" />
                  </svg>
                  <span className="text-gray-900 dark:text-gray-100">В компании с {displayUser.joinDate}</span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Статистика</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Активные проекты</span>
                  <span className="inline-flex px-2 py-1 rounded-full text-sm font-medium bg-[#5E62DB]/10 text-[#5E62DB] border border-[#5E62DB]/20">
                    {displayUser.projects}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {displayUser.role === 'manager' ? 'Закрыто дефектов' : 'Устранено дефектов'}
                  </span>
                  <span className="inline-flex px-2 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800">
                    {displayUser.defectsResolved}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {displayUser.role === 'manager' ? 'Ожидают проверки' : 'Ожидают устранения'}
                  </span>
                  <span className="inline-flex px-2 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border border-orange-200 dark:border-orange-800">
                    {displayUser.pendingDefects}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-6">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-6 px-6" aria-label="Tabs">
                  {[
                    { id: 'projects', name: 'Проекты', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                    { id: 'activity', name: 'Активность', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                    { id: 'settings', name: 'Настройки', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${activeTab === tab.id
                        ? 'border-[#5E62DB] text-[#5E62DB]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                      </svg>
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'projects' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Мои проекты</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {projects.map((project) => (
                        <div key={project.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-3 flex-wrap gap-2">
                                <h4 className="font-semibold text-gray-900 dark:text-white">{project.name}</h4>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <span className="flex items-center">
                                  <svg className="w-4 h-4 mr-1 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                  {project.defects_count} дефектов
                                </span>
                                <span>{project.completion || 0}% завершено</span>
                              </div>
                            </div>
                            <div className="w-full sm:w-32">
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-[#5E62DB] h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${project.completion || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Последняя активность</h3>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {activity.type === 'defect_resolved' && (
                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                              {activity.type === 'inspection' && (
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                              )}
                              {activity.type === 'report' && (
                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              )}
                              {activity.type === 'defect_created' && (
                                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                                <div className={`w-1 h-1 rounded-full ${getPriorityColor(activity.priority)}`}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Настройки аккаунта</h3>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">Уведомления</h4>
                      <div className="space-y-4">
                        {[
                          { id: 'email', title: 'Email уведомления', description: 'Получать уведомления на email', checked: true },
                          { id: 'sms', title: 'SMS уведомления', description: 'Получать SMS о критических дефектах', checked: true },
                          { id: 'reports', title: 'Еженедельные отчеты', description: 'Автоматические отчеты по email', checked: false }
                        ].map((setting) => (
                          <div key={setting.id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{setting.title}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{setting.description}</p>
                            </div>
                            <button
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:ring-offset-2 ${setting.checked ? 'bg-[#5E62DB]' : 'bg-gray-200 dark:bg-gray-600'
                                }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${setting.checked ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                      <h4 className="text-base font-medium text-gray-900 dark:text-white mb-4">Безопасность</h4>
                      <div className="space-y-3 space-x-3">
                        <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                          Изменить пароль
                        </button>
                        <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors">
                          Настроить 2FA
                        </button>
                      </div>
                    </div>
                    <div className='flex justify-end sm:justify-center p-[1px]'>
                      <button
                        onClick={async () => {
                          await logout();
                          router.push('/login');
                        }}
                        className='text-red-400 border-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-[5px] rounded-lg text-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors'
                      >
                        Выйти с аккаунта
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}