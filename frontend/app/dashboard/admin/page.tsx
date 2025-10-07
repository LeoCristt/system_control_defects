"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: {
    id: number;
    name: string;
  };
  phone_number?: string;
  address?: string;
  hire_date?: string;
}

interface ProjectAccess {
  project_id: number;
  project_name: string;
  has_access: boolean;
}

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [projectAccess, setProjectAccess] = useState<ProjectAccess[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    role: 'engineer',
    phone_number: '',
    address: '',
    hire_date: ''
  });
  const [loading, setLoading] = useState(false);

  // Function to open the access modal and fetch project access for the selected user
  const openAccessModal = async (user: User) => {
    setSelectedUser(user);
    setShowAccessModal(true);

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${user.id}/project-access`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setProjectAccess(data);
      } else {
        alert('Ошибка при загрузке доступа к проектам');
      }
    } catch (error) {
      console.error('Failed to fetch project access', error);
      alert('Ошибка при загрузке доступа к проектам');
    }
  };

  // Function to toggle project access for a user
  const toggleProjectAccess = async (projectId: number) => {
    if (!selectedUser) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    const currentAccess = projectAccess.find(pa => pa.project_id === projectId);
    if (!currentAccess) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${selectedUser.id}/project-access/${projectId}`, {
        method: currentAccess.has_access ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        // Update local state
        setProjectAccess(prev =>
          prev.map(pa =>
            pa.project_id === projectId ? { ...pa, has_access: !pa.has_access } : pa
          )
        );
      } else {
        alert('Ошибка при обновлении доступа к проекту');
      }
    } catch (error) {
      console.error('Failed to update project access', error);
      alert('Ошибка при обновлении доступа к проекту');
    }
  };

  // Function to close the access modal
  const closeAccessModal = () => {
    setShowAccessModal(false);
    setSelectedUser(null);
    setProjectAccess([]);
  };

  useEffect(() => {
    if (!user || user.role !== 'leader') {
      router.push('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, router]);

  const fetchUsers = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({
          email: '',
          username: '',
          password: '',
          full_name: '',
          role: 'engineer',
          phone_number: '',
          address: '',
          hire_date: ''
        });
        fetchUsers();
      } else {
        alert('Ошибка при создании пользователя');
      }
    } catch (error) {
      console.error('Failed to create user', error);
      alert('Ошибка при создании пользователя');
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role: string) => {
    const roles = {
      manager: 'Менеджер',
      leader: 'Руководитель',
      engineer: 'Инженер'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getRoleColor = (role: string) => {
    const colors = {
      manager: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      leader: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      engineer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  if (!user || user.role !== 'leader') {
    return null;
  }

  return (
    <div className="pt-14 pb-16 h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Админ панель</h1>
        </div>


        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Пользователи</h2>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg font-medium transition-colors"
              >
                Добавить пользователя
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Имя</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Роль</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Телефон</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Дата приема</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Действия</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{user.full_name || user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role.name)}`}>
                        {getRoleName(user.role.name)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.phone_number || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.hire_date ? new Date(user.hire_date).toLocaleDateString('ru-RU') : '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openAccessModal(user)}
                        className="text-[#5E62DB] hover:text-[#4A4FB8] dark:text-[#7C7FF9] dark:hover:text-[#5E62DB] transition-colors"
                      >
                        Управление
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Модальное окно регистрации */}
      {showModal && (
        <div className="fixed inset-0 bg-[#000000b8] flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Добавить пользователя</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Имя пользователя</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Пароль</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Полное имя</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Роль</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="engineer">Инженер</option>
                    <option value="manager">Менеджер</option>
                    <option value="leader">Руководитель</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Телефон</label>
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Адрес</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Дата приема</label>
                  <input
                    type="date"
                    value={formData.hire_date}
                    onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5E62DB] focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Создание...' : 'Создать'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/*Модальное окно для выдачи доступу */}
      {showAccessModal && selectedUser && (
        <div className="fixed inset-0 bg-[#000000b8] flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Управление доступом - {selectedUser.full_name || selectedUser.username}
                </h3>
                <button
                  onClick={closeAccessModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Выберите проекты, к которым пользователь должен иметь доступ:
                </p>

                {projectAccess.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Загрузка проектов...</p>
                ) : (
                  <div className="space-y-3">
                    {projectAccess.map((project) => (
                      <div key={project.project_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {project.project_name}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={project.has_access}
                            onChange={() => toggleProjectAccess(project.project_id)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#5E62DB]/25 dark:peer-focus:ring-[#5E62DB]/25 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#5E62DB]"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={closeAccessModal}
                  className="px-4 py-2 bg-[#5E62DB] hover:bg-[#4A4FB8] text-white rounded-lg font-medium transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
