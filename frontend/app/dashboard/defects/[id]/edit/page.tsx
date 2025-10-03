
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function DefectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const defectId = params.id;

  const [defect, setDefect] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  const [users, setUsers] = useState<any[]>([]);
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        setAssigneeId(data.assignee ? data.assignee.id : '');
        setDueDate(data.due_date || '');
      } catch (error) {
        console.error(error);
      }
    };

    fetchDefect();
  }, [defectId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comments/${defectId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setComments(data.map((c: any) => ({
            id: c.id,
            author: c.user.full_name || c.user.username,
            text: c.content,
            date: new Date(c.created_at).toISOString().split('T')[0],
          })));
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (defectId) {
      fetchComments();
    }
  }, [defectId]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/history/${defectId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setHistory(data.map((h: any) => ({
            id: h.id,
            author: h.user.full_name || h.user.username,
            action: h.action,
            old_value: h.old_value,
            new_value: h.new_value,
            date: new Date(h.created_at).toISOString().split('T')[0],
          })));
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (defectId) {
      fetchHistory();
    }
  }, [defectId]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!defect) return;
      // Decode token to check role
      const token = localStorage.getItem('access_token');
      if (!token) return;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.role === 'manager') {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/engineers?project_id=${defect.project.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setUsers(data);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, [defect]);

  const updateDefect = async (newStatusId?: number) => {
    if (!defect) return;
    try {
      const body: any = {};
      if (assigneeId) body.assignee_id = assigneeId;
      if (dueDate) body.due_date = dueDate;
      if (newStatusId) body.status_id = newStatusId;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/defects/${defectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update defect');
      }
      const updatedDefect = await response.json();
      setDefect(updatedDefect);

      // Refetch history after update
      const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/history/${defectId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setHistory(historyData.map((h: any) => ({
          id: h.id,
          author: h.user.full_name || h.user.username,
          action: h.action,
          old_value: h.old_value,
          new_value: h.new_value,
          date: new Date(h.created_at).toISOString().split('T')[0],
        })));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const changeStatusToInWork = async () => {
    await updateDefect(2); // В работе
  };

  const changeStatusToOnCheck = async () => {
    await updateDefect(3); // На проверке
  };

  const generateReport = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/defects/${defectId}/report`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to generate report');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `defect-${defectId}-report.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Ошибка при создании отчёта');
    }
  };

  const uploadReport = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', `Отчёт по дефекту #${defectId}`);
      formData.append('defect_id', defectId as string);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload report');
      }
      alert('Отчёт успешно загружен');
    } catch (error) {
      console.error('Error uploading report:', error);
      alert('Ошибка при загрузке отчёта');
    }
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({
            defect_id: parseInt(defectId as string, 10),
            content: newComment,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to add comment');
        }
        const createdComment = await response.json();
        setComments(prev => [...prev, {
          id: createdComment.id,
          author: createdComment.user.full_name || createdComment.user.username,
          text: createdComment.content,
          date: new Date(createdComment.created_at).toISOString().split('T')[0],
        }]);
        setNewComment('');
      } catch (error) {
        console.error(error);
      }
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
                    src={`http://localhost:3001${defect.attachments[0].file_path}`}
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
              {defect.status.name === 'Новый' && (() => {
                // Decode token to check if user is manager
                const token = localStorage.getItem('access_token');
                if (!token) return null;
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  if (payload.role === 'manager') {
                    return (
                      <>
                        <div>
                          <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Назначить исполнителя</label>
                          <select
                            id="assignee"
                            value={assigneeId}
                            onChange={(e) => setAssigneeId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent"
                          >
                            <option value="">Не назначен</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>{user.full_name || user.username}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Сроки выполнения</label>
                          <input
                            type="date"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Изменить статус на "В работе"</label>
                          <button
                            onClick={changeStatusToInWork}
                            className="w-full px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Назначить и изменить статус
                          </button>
                        </div>
                      </>
                    );
                  }
                } catch (error) {
                  console.error(error);
                }
                return null;
              })()}

              {defect.status.name === 'В работе' && (() => {
                // Decode token to check if user is the assignee
                const token = localStorage.getItem('access_token');
                if (!token) return null;
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  const userId = payload.sub;
                  if (defect.assignee && defect.assignee.id === userId) {
                    return (
                      <div>
                        <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Изменить статус на "На проверке"</label>
                        <button
                          onClick={changeStatusToOnCheck}
                          className="w-full px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Изменить статус
                        </button>
                      </div>
                    );
                  }
                } catch (error) {
                  console.error(error);
                }
                return null;
              })()}

              {defect.status.name === 'На проверке' && (() => {
                // Decode token to check if user is manager
                const token = localStorage.getItem('access_token');
                if (!token) return null;
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  if (payload.role === 'manager') {
                    return (
                      <div>
                        <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Изменить статус на "Закрыт"</label>
                        <button
                          onClick={() => updateDefect(4)} // Закрыт
                          className="w-full px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Закрыть дефект
                        </button>
                      </div>
                    );
                  }
                } catch (error) {
                  console.error(error);
                }
                return null;
              })()}

              {defect.status.name === 'Закрыт' && (() => {
                // Decode token to check if user is manager
                const token = localStorage.getItem('access_token');
                if (!token) return null;
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]));
                  if (payload.role === 'manager') {
                    return (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Создать отчёт</label>
                          <button
                            onClick={generateReport}
                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Скачать отчёт Excel
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Загрузить отчёт</label>
                          <button
                            onClick={() => setShowUploadModal(true)}
                            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            Загрузить отчёт
                          </button>
                        </div>
                      </>
                    );
                  }
                } catch (error) {
                  console.error(error);
                }
                return null;
              })()}

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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">История изменений</h3>
            <div className="space-y-4 mb-6">
              {history.length > 0 ? history.map((entry) => {
                let message = '';
                if (entry.action === 'status_changed') {
                  message = `Статус изменен с "${entry.old_value}" на "${entry.new_value}"`;
                } else if (entry.action === 'assignee_changed') {
                  message = `Исполнитель изменен с "${entry.old_value}" на "${entry.new_value}"`;
                } else if (entry.action === 'due_date_changed') {
                  message = `Срок выполнения изменен с "${entry.old_value}" на "${entry.new_value}"`;
                }
                return (
                  <div key={entry.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{entry.author}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{entry.date}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
                  </div>
                );
              }) : <p className="text-center text-gray-600 dark:text-gray-400">Нет истории изменений.</p>}
            </div>

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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Загрузить отчёт</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Выберите файл</label>
                <input
                  type="file"
                  accept=".xlsx,.xls,.pdf,.doc,.docx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={async () => {
                    if (selectedFile) {
                      await uploadReport(selectedFile);
                      setShowUploadModal(false);
                      setSelectedFile(null);
                    }
                  }}
                  disabled={!selectedFile}
                  className="px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Отправить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
