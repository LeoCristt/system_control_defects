"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingPage from '@/components/LoadingPage';

interface Defect {
  id: number;
  title: string;
  description: string;
  project: {
    id: number;
    name: string;
  };
  stage: {
    id: number;
    name: string;
  } | null;
  creator: {
    id: number;
    username: string;
    full_name: string;
  };
  assignee: {
    id: number;
    username: string;
    full_name: string;
  } | null;
  priority: {
    id: number;
    name: string;
  };
  status: {
    id: number;
    name: string;
  };
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: number;
  name: string;
}

interface ApiResponse {
  defects: Defect[];
  projects: Project[];
}

export default function DefectsPage() {

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Цвета для статусов
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Новый':
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 text-xs rounded">Новый</span>;
      case 'В работе':
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs rounded">В работе</span>;
      case 'На проверке':
        return <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded">На проверке</span>;
      case 'Закрыт':
      case 'Устранен':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs rounded">Устранен</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 text-xs rounded">{status}</span>;
    }
  };
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

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

    const fetchDefects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/defects`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch defects');
        }

        const result: ApiResponse = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDefects();
  }, []);

  if (loading) {
    return (
      <LoadingPage/>
    );
  }

  if (error) {
    return (
      <div className="pt-14 pb-16 h-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300 flex items-center justify-center">
        <div className="text-red-600 dark:text-red-400">Ошибка: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  const { defects, projects } = data;

  // Получаем уникальные проекты и статусы для фильтров
  const uniqueProjects = projects;
  let statuses = [...new Set(defects.map(d => d.status.name))];
  if (!statuses.includes('На проверке')) {
    statuses.push('На проверке');
  }

  // Получаем стадии для выбранного проекта
  const projectStages = selectedProject === ''
    ? []
    : [...new Set(
      defects
        .filter(d => d.project.name === selectedProject)
        .map(d => d.stage?.name)
        .filter(Boolean)
    )];

  // Фильтрация дефектов
  const filteredDefects = defects.filter(defect => {
    return (
      (searchTerm === '' || defect.title.toLowerCase().includes(searchTerm.toLowerCase()) || defect.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedProject === '' || defect.project.name === selectedProject) &&
      (selectedStage === '' || defect.stage?.name === selectedStage) &&
      (selectedStatus === '' || defect.status.name === selectedStatus)
    );
  });

  // Цвета для приоритетов
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'высокий':
        return <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 text-xs rounded">Высокий</span>;
      case 'средний':
        return <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs rounded">Средний</span>;
      case 'низкий':
        return <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs rounded">Низкий</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-300 text-xs rounded">{priority}</span>;
    }
  };

  // Статус "Устранен" для архива
  const isArchived = (defect: Defect) => {
    return defect.status.name === 'Закрыт' || defect.status.name === 'Устранен';
  };

  // Активные и архивные дефекты
  const activeDefects = filteredDefects.filter(d => !isArchived(d));
  const archivedDefects = filteredDefects.filter(isArchived);

  return (
    <div className="pt-14 pb-16 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Дефекты</h2>
          {userRole === 'engineer' && (
            <button
              onClick={() => router.push('./defects/create')}
              className="px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Создать дефект
            </button>
          )}
        </div>
        <div className={`grid grid-cols-1 ${selectedProject ? 'sm:grid-cols-5' : 'sm:grid-cols-4'} gap-4 mb-6`}>
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <select
            value={selectedProject}
            onChange={(e) => {
              setSelectedProject(e.target.value);
              setSelectedStage(''); // Reset stage when project changes
            }}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent"
          >
            <option value="">Все проекты</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.name}>{proj.name}</option>
            ))}
          </select>

          {selectedProject && (
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent"
            >
              <option value="">Все стадии</option>
              {projectStages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          )}

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent"
          >
            <option value="">Все статусы</option>
            {statuses.map((stat) => (
              <option key={stat} value={stat}>{stat}</option>
            ))}
          </select>
        </div>

        {/* Активные дефекты */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Активные дефекты</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {activeDefects.length > 0 ? (
              activeDefects.map((defect) => {
                const token = localStorage.getItem('access_token');
                let userId = null;
                let userRoleLocal = null;
                if (token) {
                  try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userId = payload.sub;
                    userRoleLocal = payload.role;
                  } catch (error) {
                    console.error(error);
                  }
                }
                const canEdit = userRoleLocal === 'manager' || defect.creator.id === userId || (defect.assignee && defect.assignee.id === userId);
                return (
                  <div
                    key={defect.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 cursor-pointer hover:scale-[1.03] hover:shadow-2xl transition-all border border-transparent hover:border-blue-400 dark:hover:border-blue-600 relative group"
                    onClick={canEdit ? () => router.push(`./defects/${defect.id}/edit`) : undefined}
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{defect.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {getPriorityBadge(defect.priority.name)}
                      {getStatusBadge(defect.status.name)}
                      {defect.assignee && <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">Исполнитель: {defect.assignee.full_name}</span>}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-base mb-3">{defect.description}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p>Проект: {defect.project.name}</p>
                      <p>Автор: {defect.creator.full_name}</p>
                      <p>Создан: {new Date(defect.created_at).toLocaleDateString('ru-RU')}</p>
                      {defect.updated_at && <p>Обновлен: {new Date(defect.updated_at).toLocaleDateString('ru-RU')}</p>}
                      {defect.due_date && <p>Срок: {new Date(defect.due_date).toLocaleDateString('ru-RU')}</p>}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">Нет активных дефектов.</p>
            )}
          </div>
        </div>

        {/* Архив */}
        <div className="mt-12">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Архив (Устранённые)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {archivedDefects.length > 0 ? (
              archivedDefects.map((defect) => {
                const token = localStorage.getItem('access_token');
                let userId = null;
                let userRoleLocal = null;
                if (token) {
                  try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    userId = payload.sub;
                    userRoleLocal = payload.role;
                  } catch (error) {
                    console.error(error);
                  }
                }
                const canEdit = userRoleLocal === 'manager' || userRoleLocal === 'leader' || defect.creator.id === userId || (defect.assignee && defect.assignee.id === userId);
                return (
                  <div
                    key={defect.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 cursor-pointer hover:scale-[1.03] hover:shadow-2xl transition-all border border-transparent hover:border-blue-400 dark:hover:border-blue-600 relative group opacity-70"
                    onClick={canEdit ? () => router.push(`./defects/${defect.id}/edit`) : undefined}
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{defect.title}</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {getPriorityBadge(defect.priority.name)}
                      {getStatusBadge(defect.status.name)}
                      {defect.assignee && <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">Исполнитель: {defect.assignee.full_name}</span>}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-base mb-3">{defect.description}</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                      <p>Проект: {defect.project.name}</p>
                      <p>Автор: {defect.creator.full_name}</p>
                      <p>Создан: {new Date(defect.created_at).toLocaleDateString('ru-RU')}</p>
                      {defect.updated_at && <p>Обновлен: {new Date(defect.updated_at).toLocaleDateString('ru-RU')}</p>}
                      {defect.due_date && <p>Срок: {new Date(defect.due_date).toLocaleDateString('ru-RU')}</p>}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">Нет устранённых дефектов.</p>
            )}
          </div>
        </div>
      </div>
    </div>

  );
}