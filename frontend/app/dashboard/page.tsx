"use client";

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardPage() {
  const { user: authUser } = useAuth(); // Assuming AuthContext provides user data
  const router = useRouter();

  // Mock data for statistics based on TZ
  const [stats] = useState({
    projects: 4,
    activeProjects: 2,
    totalDefects: 15,
    pendingDefects: 5,
    resolvedDefects: 10,
    reportsGenerated: 3,
  });

  // Mock data for charts
  const projectProgressData = {
    labels: ['ЖК "Северная звезда"', 'Торговый центр "Галерея"', 'Офисный комплекс "Технопарк"', 'Жилой комплекс "Восток"'],
    datasets: [
      {
        label: 'Прогресс (%)',
        data: [78, 95, 45, 100],
        backgroundColor: 'rgba(94, 98, 219, 0.6)',
        borderColor: 'rgba(94, 98, 219, 1)',
        borderWidth: 1,
      },
    ],
  };

  const defectsData = {
    labels: ['Ожидают', 'Устранено', 'На проверке'],
    datasets: [
      {
        data: [5, 10, 3],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(75, 192, 192, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        borderColor: ['rgba(255, 99, 132, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(55, 65, 81)', // gray-700
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgb(107, 114, 128)', // gray-500
        },
        grid: {
          color: 'rgb(209, 213, 219)', // gray-200
        },
      },
      x: {
        ticks: {
          color: 'rgb(107, 114, 128)',
        },
        grid: {
          color: 'rgb(209, 213, 219)',
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: 'rgb(55, 65, 81)',
        },
      },
    },
  };

  return (
    <div className="pt-14 pb-16 h-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Главная панель</h1>
          <div className="flex space-x-3">
            <button 
              onClick={() => router.push('/new-project')} 
              className="px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Новый проект
            </button>
            <button 
              onClick={() => router.push('/new-defect')} 
              className="px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Зарегистрировать дефект
            </button>
            <button 
              onClick={() => router.push('/reports/generate')} 
              className="px-4 py-2 border border-[#5E62DB] text-[#5E62DB] hover:bg-[#5E62DB]/10 rounded-lg text-sm font-medium transition-colors"
            >
              Сформировать отчёт
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Добро пожаловать, {authUser?.name || 'Пользователь'}!</h2>
          <p className="text-gray-600 dark:text-gray-400">Здесь вы можете управлять дефектами на строительных объектах, отслеживать прогресс и формировать отчёты.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-[#5E62DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Проекты</h3>
            </div>
            <div className="text-3xl font-bold text-[#5E62DB]">{stats.projects}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Активных: {stats.activeProjects}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-[#5E62DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Дефекты</h3>
            </div>
            <div className="text-3xl font-bold text-[#5E62DB]">{stats.totalDefects}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ожидают: {stats.pendingDefects} / Устранено: {stats.resolvedDefects}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-[#5E62DB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Отчёты</h3>
            </div>
            <div className="text-3xl font-bold text-[#5E62DB]">{stats.reportsGenerated}</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Сгенерировано за неделю</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ключевые метрики</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Прогресс проектов</h4>
              <Bar data={projectProgressData} options={chartOptions} />
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Статистика дефектов</h4>
              <Pie data={defectsData} options={pieOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}