"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Project {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export default function ProjectsPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
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
    <div className="pt-14 pb-16 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Проекты</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`./projects/${project.id}`)}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">{project.description}</p>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {project.created_at && (
                    <p>Создан: {new Date(project.created_at).toLocaleDateString("ru-RU")}</p>
                  )}
                  {project.updated_at && (
                    <p>Обновлен: {new Date(project.updated_at).toLocaleDateString("ru-RU")}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400 col-span-full">Нет доступных проектов.</p>
          )}
        </div>
      </div>
    </div>
  );
}
