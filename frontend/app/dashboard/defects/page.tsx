"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  };
  assignee: {
    id: number;
    username: string;
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

  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const fetchDefects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/defects`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
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
      <div className="pt-14 pb-16 h-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
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
  const statuses = [...new Set(defects.map(d => d.status.name))];

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

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      resolved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getStatusName = (status: string) => {
    const names = {
      open: 'Открыт',
      in_progress: 'В работе',
      resolved: 'Устранен'
    };
    return names[status as keyof typeof names] || status;
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
    <div className="pt-14 pb-16 h-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Дефекты</h2>
            <button
              onClick={() => router.push('/defects/create')}
              className="px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Создать дефект
            </button>
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
                <option key={stat} value={stat}>{getStatusName(stat)}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredDefects.length > 0 ? (
              filteredDefects.map((defect) => (
                <div key={defect.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 cursor-pointer"
                onClick={() => router.push(`/defects/${defect.id}/edit`)}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3 flex-wrap gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{defect.title}</h4>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(defect.status.name)}`}>
                          {getStatusName(defect.status.name)}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(defect.priority.name)}`}></div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Проект: {defect.project.name}</span>
                        <span>Стадия: {defect.stage?.name || 'Не указана'}</span>
                        <span>Создан: {new Date(defect.created_at).toLocaleDateString('ru-RU')}</span>
                        {defect.assignee && <span>Исполнитель: {defect.assignee.username}</span>}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{defect.description}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-600 dark:text-gray-400">Нет дефектов, соответствующих фильтрам.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}