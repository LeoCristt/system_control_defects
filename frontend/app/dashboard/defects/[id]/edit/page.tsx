"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
// import * as XLSX from 'xlsx'; 
export default function DefectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const defectId = params.id;

  const [defect, setDefect] = useState({
    id: defectId,
    name: 'Трещина в стене',
    project: 'ЖК "Северная звезда"',
    object: 'Корпус 1',
    status: 'open',
    priority: 'high',
    description: 'Обнаружена трещина в несущей стене на 5 этаже.',
    created: '2025-09-01',
    resolved: null,
    image: 'https://avatars.mds.yandex.net/i?id=07a48e113fba56537f3cfe6ab254a196467ff955-16487560-images-thumbs&n=13' // Placeholder image URL
  });

  const [comments, setComments] = useState([
    { id: 1, author: 'Leo Crist', text: 'Нужно срочно проверить конструкцию.', date: '2025-09-02' },
    { id: 2, author: 'Инженер Иванов', text: 'Проведена инспекция, трещина не критична.', date: '2025-09-05' },
  ]);

  const [newComment, setNewComment] = useState('');
  const [newStatus, setNewStatus] = useState(defect.status);

  const handleStatusChange = (e) => {
    setNewStatus(e.target.value);
  };

  const updateStatus = () => {
    setDefect(prev => ({ ...prev, status: newStatus }));
    // потом бек напишу
    console.log('Updated status:', newStatus);
  };

  const addComment = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      const newCom = {
        id: comments.length + 1,
        author: 'Current User', // инфа о юзере
        text: newComment,
        date: new Date().toISOString().split('T')[0]
      };
      setComments(prev => [...prev, newCom]);
      setNewComment('');
      // бек
    }
  };

  const exportToExcel = () => {
    const data = [
      ['ID', defect.id],
      ['Название', defect.name],
      ['Проект', defect.project],
      ['Объект', defect.object],
      ['Статус', getStatusName(defect.status)],
      ['Приоритет', defect.priority],
      ['Описание', defect.description],
      ['Дата создания', defect.created],
      ['Дата устранения', defect.resolved || 'Не устранено'],
    ];

    // const ws = XLSX.utils.aoa_to_sheet(data);
    // const wb = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'Defect');
    // XLSX.writeFile(wb, `defect_${defect.id}.xlsx`);
  };

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
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Дефекта #{defect.id}: {defect.name}</h2>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Экспорт в Excel
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <img
                  src={defect.image}
                  alt="Фото дефекта"
                  className="w-48 h-48 rounded-lg object-cover border-4 border-gray-100 dark:border-gray-700"
                />
                <p className="text-sm text-gray-600 dark:text-gray-400">Фото дефекта</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Название</label>
                  <p className="text-gray-900 dark:text-white">{defect.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Проект</label>
                  <p className="text-gray-900 dark:text-white">{defect.project}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Объект</label>
                  <p className="text-gray-900 dark:text-white">{defect.object}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Приоритет</label>
                  <p className={`font-medium ${getPriorityColor(defect.priority)}`}>{defect.priority}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Текущий статус</label>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(defect.status)}`}>
                  {getStatusName(defect.status)}
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
                    <option value="open">Открыт</option>
                    <option value="in_progress">В работе</option>
                    <option value="resolved">Устранен</option>
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
                  <p className="text-gray-900 dark:text-white">{defect.created}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата устранения</label>
                  <p className="text-gray-900 dark:text-white">{defect.resolved || 'Не устранено'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Комментарии</h3>
            <div className="space-y-4 mb-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white">{comment.author}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{comment.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{comment.text}</p>
                </div>
              ))}
              {comments.length === 0 && <p className="text-center text-gray-600 dark:text-gray-400">Нет комментариев.</p>}
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