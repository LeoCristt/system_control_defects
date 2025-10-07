"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
    import LoadingPage from '@/components/LoadingPage';

interface Project {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface Stage {
  id: number;
  name: string;
}

interface Priority {
  id: number;
  name: string;
}

interface Status {
  id: number;
  name: string;
}

interface Defect {
  id: number;
  title: string;
  description: string;
  project: Project;
  stage: Stage;
  priority: Priority;
  status: Status;
  created_at: string;
}

export default function ProjectDetailsPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectAndDefects = async () => {
      try {
        const [projectRes, defectsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/projects/${projectId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }),
          fetch(`${API_BASE_URL}/defects`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }),
        ]);

        if (!projectRes.ok) {
          throw new Error("Failed to fetch project");
        }
        const projectData: Project = await projectRes.json();
        setProject(projectData);

        if (defectsRes.ok) {
          const defectsData: { defects: Defect[] } = await defectsRes.json();
          const projectDefects = defectsData.defects.filter(
            (defect) => defect.project?.id === parseInt(projectId)
          );
          setDefects(projectDefects);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectAndDefects();
    }
  }, [API_BASE_URL, projectId]);

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

  if (!project) {
    return (
      <div className="pt-14 pb-16 h-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Проект не найден.</div>
      </div>
    );
  }

  return (
    <div className="pt-14 pb-16 bg-gray-50 dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{project.name}</h2>
          {project.description && (
            <p className="text-gray-700 dark:text-gray-300 mb-4">{project.description}</p>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {project.created_at && (
              <p>Создан: {new Date(project.created_at).toLocaleDateString("ru-RU")}</p>
            )}
            {project.updated_at && (
              <p>Обновлен: {new Date(project.updated_at).toLocaleDateString("ru-RU")}</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Дефекты проекта</h3>
          {defects.length > 0 ? (
            <div className="space-y-4">
              {defects.map((defect) => (
                <div
                  key={defect.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">{defect.title}</h4>
                    <div className="flex space-x-2">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                        {defect.stage.name}
                      </span>
                      <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded">
                        {defect.priority.name}
                      </span>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                        {defect.status.name}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 text-sm mb-2">{defect.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Создан: {new Date(defect.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">Нет дефектов в этом проекте.</p>
          )}
        </div>
      </div>
    </div>
  );
}
