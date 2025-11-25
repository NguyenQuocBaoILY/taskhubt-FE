import { useEffect, useState } from 'react';
import { taskAPI } from '../services/api';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';

function TaskPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // để xem/sửa
  const [isModalOpen, setIsModalOpen] = useState(false);

  const DEFAULT_PROJECT_ID = 'PROJECT#1'; // TODO: thay bằng project thật

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await taskAPI.getTasks({ projectId: DEFAULT_PROJECT_ID });
      setTasks(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Không tải được danh sách task');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateClick = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleDelete = async (task) => {
    if (!confirm(`Xóa task "${task.title}"?`)) return;
    try {
      await taskAPI.deleteTask(task.taskId, task.projectId);
      toast.success('Đã xóa task');
      loadTasks();
    } catch (err) {
      console.error(err);
      toast.error('Xóa task thất bại');
    }
  };

  const handleModalSaved = () => {
    setIsModalOpen(false);
    loadTasks();
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold shadow-sm hover:bg-primary-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition"
        >
          + Tạo task mới
        </button>
      </div>

      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Title</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Priority</th>
              <th className="px-3 py-2 text-left">Assignee</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.taskId} className="border-t">
                <td className="px-3 py-2">{t.title}</td>
                <td className="px-3 py-2">{t.status}</td>
                <td className="px-3 py-2">{t.priority}</td>
                <td className="px-3 py-2">{t.assignee}</td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() => handleEditClick(t)}
                  >
                    Xem / Sửa
                  </button>
                  <button
                    className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                    onClick={() => handleDelete(t)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {tasks.length === 0 && !loading && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-gray-500">
                  Chưa có task nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSaved}
          task={selectedTask}
          project={{ projectId: DEFAULT_PROJECT_ID, members: [] }} // tạm, sau bạn truyền members thật
        />
      )}
    </div>
  );
}

export default TaskPage;