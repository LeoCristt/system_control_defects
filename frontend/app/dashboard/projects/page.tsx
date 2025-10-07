"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProjectForm from "@/components/ProjectForm";
import { useAuth } from "@/contexts/AuthContext";

interface Project {
  id: number;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
}

export default function ProjectsPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data: Project[] = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [API_BASE_URL]);

  if (loading) {
    return (
      <div className="pt-14 pb-16 h-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка проектов...</div>
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

  return (
    <div className="pt-14 pb-16 bg-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Проекты</h2>
          {user?.role === 'leader' && (
            <button
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-blue-700 hover:to-purple-700 transition"
              onClick={() => { setEditProject(null); setShowModal(true); }}
            >
              + Новый проект
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 cursor-pointer hover:scale-[1.03] hover:shadow-2xl transition-all border border-transparent hover:border-blue-400 dark:hover:border-blue-600 relative group"
                onClick={() => router.push(`./projects/${project.id}`)}
              >
                {user?.role === 'leader' && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition">
                    <button
                      className="px-2 py-1 rounded bg-blue-500 text-white text-xs font-semibold hover:bg-blue-700 shadow"
                      onClick={e => { e.stopPropagation(); setEditProject(project); setShowModal(true); }}
                    >
                      Редактировать
                    </button>
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-700 dark:text-gray-300 text-base mb-3">{project.description}</p>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {project.created_at && (
                    <p>Создан: {new Date(project.created_at).toLocaleDateString("ru-RU")}</p>
                  )}
                  {project.updated_at && (
                    <p>Обновлен: {new Date(project.updated_at).toLocaleDateString("ru-RU")}</p>
                  )}
                  {project.start_date && <p>Начало: {project.start_date}</p>}
                  {project.end_date && <p>Окончание: {project.end_date}</p>}
                  {project.status && <p>Статус: {project.status}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">Нет доступных проектов.</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
              onClick={() => { setShowModal(false); setEditProject(null); setModalError(null); }}
              aria-label="Закрыть"
            >
              ×
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editProject ? "Редактировать проект" : "Создать проект"}
            </h3>
            {modalError && <div className="text-red-600 mb-2">{modalError}</div>}
            <ProjectForm
              initialData={editProject}
              onCancel={() => { setShowModal(false); setEditProject(null); setModalError(null); }}
              onSubmit={async (data) => {
                setModalLoading(true);
                setModalError(null);
                try {
                  const method = editProject ? "PATCH" : "POST";
                  const url = editProject ? `${API_BASE_URL}/projects/${editProject.id}` : `${API_BASE_URL}/projects`;
                  const res = await fetch(url, {
                    method,
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                    body: JSON.stringify(data),
                  });
                  if (!res.ok) {
                    throw new Error("Ошибка при сохранении проекта");
                  }
                  setShowModal(false);
                  setEditProject(null);
                  await fetchProjects();
                } catch (err) {
                  setModalError(err instanceof Error ? err.message : "Ошибка");
                } finally {
                  setModalLoading(false);
                }
              }}
            />
            {modalLoading && <div className="text-blue-600 mt-2">Сохранение...</div>}
          </div>
        </div>
      )}
    </div>
  );
}
