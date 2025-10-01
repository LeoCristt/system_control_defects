"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function DefectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const defectId = params.id;

  const [defect, setDefect] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchDefect = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/defects/${defectId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch defect');
        }
        const data = await response.json();
        setDefect(data);
        setNewStatus(data.status.name);
        // Assuming comments are part of defect or fetched separately
        setComments(data.comments || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDefect();
  }, [defectId]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewStatus(e.target.value);
  };

  const updateStatus = async () => {
    if (!defect) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/defects/${defectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ status_id: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      const updatedDefect = await response.json();
      setDefect(updatedDefect);
    } catch (error) {
      console.error(error);
    }
  };

  const addComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const newCom = {
        id: comments.length + 1,
        author: 'Current User', // Replace with actual user info
        text: newComment,
        date: new Date().toISOString().split('T')[0],
      };
      setComments(prev => [...prev, newCom]);
      setNewComment('');
      // TODO: Send comment to backend
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Новый': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'В работе': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Закрыт': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getStatusName = (status: string) => {
    const names: Record<string, string> = {
      'Новый': 'Открыт',
      'В работе': 'В работе',
      'Закрыт': 'Устранен',
    };
    return names[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Высокий': 'text-red-500',
      'Средний': 'text-yellow-500',
      'Низкий': 'text-green-500',
    };
    return colors[priority] || '';
  };

  if (!defect) {
    return (
      <div className="pt-14 pb-16 h-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="pt-14 pb-16 h-full bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Дефект #{defect.id}: {defect.title}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                {defect.attachments && defect.attachments.length > 0 ? (
                  <img
                    src={defect.attachments[0].filePath}
                    alt="Фото дефекта"
                    className="w-48 h-48 rounded-lg object-cover border-4 border-gray-100 dark:border-gray-700"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-lg border-4 border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-600">
                    Нет фото
                  </div>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-400">Фото дефекта</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название</label>
                  <p className="text-gray-900 dark:text-white">{defect.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Проект</label>
                  <p className="text-gray-900 dark:text-white">{defect.project.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Стадия</label>
                  <p className="text-gray-900 dark:text-white">{defect.stage ? defect.stage.name : 'Не указана'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Приоритет</label>
                  <p className={`font-medium ${getPriorityColor(defect.priority.name)}`}>{defect.priority.name}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Текущий статус</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(defect.status.name)}`}>
                  {getStatusName(defect.status.name)}
                </span>
              </div>

              <div>
                <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Изменить статус</label>
                <div className="flex space-x-2">
                  <select
                    id="newStatus"
                    value={newStatus}
                    onChange={handleStatusChange}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent"
                  >
                    <option value="1">Новый</option>
                    <option value="2">В работе</option>
                    <option value="3">Закрыт</option>
                  </select>
                  <button
                    onClick={updateStatus}
                    className="px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Обновить
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Описание</label>
                <p className="text-gray-900 dark:text-white">{defect.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата создания</label>
                  <p className="text-gray-900 dark:text-white">{new Date(defect.created_at).toLocaleDateString('ru-RU')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата устранения</label>
                  <p className="text-gray-900 dark:text-white">{defect.due_date ? new Date(defect.due_date).toLocaleDateString('ru-RU') : 'Не устранено'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Комментарии</h3>
            <div className="space-y-4 mb-6">
              {comments.length > 0 ? comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{comment.author}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{comment.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{comment.text}</p>
                </div>
              )) : <p className="text-center text-gray-600 dark:text-gray-400">Нет комментариев.</p>}
            </div>

            <form onSubmit={addComment} className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Напишите комментарий..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Добавить
              </button>
            </form>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => router.push('/defects')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
