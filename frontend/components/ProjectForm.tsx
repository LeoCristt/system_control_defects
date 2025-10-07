import { useState } from "react";

interface ProjectFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel: () => void;
}

export default function ProjectForm({ onSubmit, initialData, onCancel }: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [endDate, setEndDate] = useState(initialData?.end_date || "");
  const [status, setStatus] = useState(initialData?.status || "");

  return (
    <form
      className="space-y-4"
      onSubmit={e => {
        e.preventDefault();
        onSubmit({ name, description, start_date: startDate, end_date: endDate, status });
      }}
    >
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Название</label>
        <input
          className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Описание</label>
        <textarea
          className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Дата начала</label>
          <input
            type="date"
            className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Дата окончания</label>
          <input
            type="date"
            className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Статус</label>
        <input
          className="w-full rounded border px-3 py-2 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={status}
          onChange={e => setStatus(e.target.value)}
        />
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={onCancel}
        >
          Отмена
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 shadow"
        >
          Сохранить
        </button>
      </div>
    </form>
  );
}
