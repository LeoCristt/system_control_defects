"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DefectsPage() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedObject, setSelectedObject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const [defects] = useState([
    {
      id: 1,
      name: 'Трещина в стене',
      project: 'ЖК "Северная звезда"',
      object: 'Корпус 1',
      status: 'open',
      priority: 'high',
      description: 'Обнаружена трещина в несущей стене на 5 этаже.',
      created: '2025-09-01',
      resolved: null
    },
    {
      id: 2,
      name: 'Протечка крыши',
      project: 'Торговый центр "Галерея"',
      object: 'Зал 2',
      status: 'in_progress',
      priority: 'medium',
      description: 'Протечка в районе центрального входа после дождя.',
      created: '2025-09-05',
      resolved: null
    },
    {
      id: 3,
      name: 'Неисправный лифт',
      project: 'Офисный комплекс "Технопарк"',
      object: 'Башня A',
      status: 'resolved',
      priority: 'high',
      description: 'Лифт застревает между этажами.',
      created: '2025-08-20',
      resolved: '2025-09-10'
    },
    {
      id: 4,
      name: 'Проблемы с электрикой',
      project: 'Жилой комплекс "Восток"',
      object: 'Квартира 45',
      status: 'open',
      priority: 'low',
      description: 'Частые перебои в подаче электричества.',
      created: '2025-09-15',
      resolved: null
    },
    {
      id: 5,
      name: 'Повреждение фасада',
      project: 'ЖК "Северная звезда"',
      object: 'Корпус 2',
      status: 'in_progress',
      priority: 'medium',
      description: 'Отслоение штукатурки на внешней стене.',
      created: '2025-09-10',
      resolved: null
    },
  ]);

  // Получаем уникальные проекты, объекты и статусы для фильтров
  const projects = [...new Set(defects.map(d => d.project))];
  const objects = [...new Set(defects.map(d => d.object))];
  const statuses = [...new Set(defects.map(d => d.status))];

  // Фильтрация дефектов
  const filteredDefects = defects.filter(defect => {
    return (
      (searchTerm === '' || defect.name.toLowerCase().includes(searchTerm.toLowerCase()) || defect.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (selectedProject === '' || defect.project === selectedProject) &&
      (selectedObject === '' || defect.object === selectedObject) &&
      (selectedStatus === '' || defect.status === selectedStatus)
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Дефекты</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
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
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent"
            >
              <option value="">Все проекты</option>
              {projects.map((proj) => (
                <option key={proj} value={proj}>{proj}</option>
              ))}
            </select>

            <select
              value={selectedObject}
              onChange={(e) => setSelectedObject(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent"
            >
              <option value="">Все объекты</option>
              {objects.map((obj) => (
                <option key={obj} value={obj}>{obj}</option>
              ))}
            </select>

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
                        <h4 className="font-semibold text-gray-900 dark:text-white">{defect.name}</h4>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(defect.status)}`}>
                          {getStatusName(defect.status)}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(defect.priority)}`}></div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>Проект: {defect.project}</span>
                        <span>Объект: {defect.object}</span>
                        <span>Создан: {defect.created}</span>
                        {defect.resolved && <span>Устранен: {defect.resolved}</span>}
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