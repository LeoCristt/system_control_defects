"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import dynamic from "next/dynamic";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Регистрация необходимых компонентов Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);
const Bar = dynamic(() => import("react-chartjs-2").then(mod => mod.Bar), { ssr: false });
const Pie = dynamic(() => import("react-chartjs-2").then(mod => mod.Pie), { ssr: false });
const Line = dynamic(() => import("react-chartjs-2").then(mod => mod.Line), { ssr: false });

type Defect = {
  status?: { name: string };
  due_date?: string;
  project?: { name: string };
  assignee?: { full_name?: string; username?: string; email?: string };
};

function getClosedDefectsByProject(defects: Defect[]): Record<string, Record<string, number>> {
  const result: Record<string, Record<string, number>> = {};
  defects.forEach((defect) => {
    if (defect.status && defect.status.name === "Закрыт" && defect.due_date && defect.project) {
      const project = defect.project.name;
      const date = new Date(defect.due_date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!result[project]) result[project] = {};
      if (!result[project][month]) result[project][month] = 0;
      result[project][month]!++;
    }
  });
  return result;
}

function getClosedDefectsByUser(defects: Defect[]): Record<string, number> {
  const result: Record<string, number> = {};
  defects.forEach((defect) => {
    if (defect.status && defect.status.name === "Закрыт" && defect.assignee) {
      const user = defect.assignee.full_name || defect.assignee.username || defect.assignee.email || "Неизвестно";
      if (!result[user]) result[user] = 0;
      result[user]!++;
    }
  });
  return result;
}

interface Report {
  id: number;
  title: string;
  content?: string | null;
  file_path?: string | null;
  created_at: string;
  project?: { id: number; name: string } | null;
  defect?: { id: number; title: string } | null;
  generated_by?: { id: number; email: string };
}

export default function ReportsPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ projects: number; defects: number; users: number } | null>(null);
  const [defects, setDefects] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const [reportsRes, projectsRes, defectsRes, usersRes] = await Promise.all([
          fetch(`${API_BASE_URL}/reports`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/defects`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (!reportsRes.ok) throw new Error("Ошибка загрузки отчётов");
        if (!projectsRes.ok) throw new Error("Ошибка загрузки проектов");
        if (!defectsRes.ok) throw new Error("Ошибка загрузки дефектов");
        if (!usersRes.ok) throw new Error("Ошибка загрузки пользователей");
        const reportsData = await reportsRes.json();
        const projectsData = await projectsRes.json();
        const defectsData = await defectsRes.json();
        const usersData = await usersRes.json();
        // defectsData может быть {defects, projects} или просто массив
        const defectsArr = Array.isArray(defectsData) ? defectsData : defectsData.defects || [];
        setDefects(defectsArr);
        setReports(reportsData);
        setStats({
          projects: projectsData.length,
          defects: defectsArr.length,
          users: usersData.length,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка");
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === "leader") fetchData();
  }, [API_BASE_URL, user]);

  if (loading) {
    return (
      <div className="pt-14 pb-16 min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <span className="text-gray-600 dark:text-gray-300">Загрузка...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-14 pb-16 min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <span className="text-red-600 dark:text-red-400">{error}</span>
      </div>
    );
  }

  return (
    <div className="pt-14 pb-16 min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Отчёты и статистика</h2>


        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Пользователей</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.users}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Проектов</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.projects}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Дефектов</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.defects}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Активность</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.projects + stats.defects + stats.users}</p>
              </div>
            </div>
          </div>
        )}

        {/* Графики устранённых дефектов */}
        {defects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Менеджеры, которые загрузили отчёты */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center">
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Менеджеры, которые загрузили отчёты</h4>
              <div className="w-full h-64">
                {(() => {
                  // reports — массив отчётов, у каждого есть поле generated_by (менеджер)
                  const managerCounts: Record<string, number> = {};
                  reports.forEach((report: any) => {
                    const manager = report.generated_by?.full_name || report.generated_by?.username || report.generated_by?.email || "Неизвестно";
                    if (!managerCounts[manager]) managerCounts[manager] = 0;
                    managerCounts[manager]!++;
                  });
                  const managers = Object.keys(managerCounts);
                  const data = managers.map((m) => managerCounts[m]);
                  return (
                    <Pie
                      data={{
                        labels: managers,
                        datasets: [
                          {
                            data,
                            backgroundColor: managers.map((_, idx) => `hsl(${(idx * 60) % 360}, 70%, 60%)`),
                          },
                        ],
                      }}
                      options={{
                        plugins: { legend: { display: true, position: "bottom" } },
                        responsive: true,
                      }}
                    />
                  );
                })()}
              </div>
            </div>
            {/* Кто сколько устранил дефектов */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center">
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Кто сколько устранил дефектов</h4>
              <div className="w-full h-64">
                {(() => {
                  const byUser = getClosedDefectsByUser(defects);
                  const users = Object.keys(byUser);
                  const data = users.map((u) => byUser[u] || 0);
                  return (
                    <Bar
                      data={{
                        labels: users,
                        datasets: [
                          {
                            label: "Устранено дефектов",
                            data,
                            backgroundColor: users.map((_, idx) => `hsl(${(idx * 60) % 360}, 70%, 60%)`),
                          },
                        ],
                      }}
                      options={{
                        plugins: { legend: { display: false } },
                        responsive: true,
                        scales: { y: { beginAtZero: true } },
                      }}
                    />
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Список отчётов</h3>
          {reports.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">Нет отчётов.</p>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <div key={report.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">{report.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">#{report.id}</span>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {report.project && <span>Проект: {report.project.name} </span>}
                        {report.defect && <span> | Дефект: {report.defect.title} </span>}
                        {report.generated_by && <span> | Автор: {report.generated_by.email} </span>}
                        <span> | {new Date(report.created_at).toLocaleString("ru-RU")}</span>
                      </div>
                    </div>
                    {report.file_path && (
                      <a
                        href={report.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded bg-[#5E62DB] text-white font-semibold shadow hover:bg-[#4346a3] transition"
                      >
                        Скачать файл
                      </a>
                    )}
                  </div>
                  {report.content && (
                    <div className="mt-2 text-gray-700 dark:text-gray-200 text-sm whitespace-pre-line">
                      {report.content}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}