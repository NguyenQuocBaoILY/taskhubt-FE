import { useState, useEffect } from 'react';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { taskAPI } from '../services/api';
import TaskModal from './TaskModal';
import TaskCard from './TaskCard';

const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'not-started', label: 'Chưa bắt đầu' },
  { value: 'in-progress', label: 'Đang thực hiện' },
  { value: 'completed', label: 'Hoàn thành' },
];

export default function TaskList({ projectId, currentUserId, project = null }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  
  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (projectId && currentUserId) {
      loadTasks();
    }
  }, [projectId, currentUserId, statusFilter, assigneeFilter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (assigneeFilter) filters.assignee = assigneeFilter;
      
      const response = await taskAPI.getProjectTasks(projectId, currentUserId, filters);
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Không thể tải danh sách task');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (task) => {
    if (!confirm(`Bạn có chắc muốn xóa task "${task.title}"?`)) {
      return;
    }

    try {
      await taskAPI.deleteTask(task.taskId, projectId);
      
      // Remove from list
      setTasks(prev => prev.filter(t => t.taskId !== task.taskId));
      
      console.log('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Không thể xóa task. Vui lòng thử lại.');
    }
  };

  const handleTaskSubmitted = () => {
    // Reload tasks after create/update
    loadTasks();
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await taskAPI.updateTaskStatus(task.taskId, projectId, newStatus);
      
      // Update local state
      setTasks(prev => 
        prev.map(t => 
          t.taskId === task.taskId 
            ? { ...t, status: newStatus }
            : t
        )
      );
      
      console.log('Task status updated successfully');
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Không thể cập nhật trạng thái task');
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (!projectId || !currentUserId) {
    return (
      <div className="text-center py-8 text-gray-500">
        Cần có projectId và userId để hiển thị danh sách task
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters and create button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Danh sách Task
          </h2>
          
          {/* Filters */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Lọc theo assignee..."
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <button
          onClick={handleCreateTask}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Tạo Task
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Đang tải danh sách task...</span>
        </div>
      )}

      {/* Task count */}
      {!loading && (
        <div className="text-sm text-gray-600">
          Tổng cộng: {tasks.length} task
        </div>
      )}

      {/* Kanban Board Layout */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Not Started */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
              Chưa bắt đầu ({getTasksByStatus('not-started').length})
            </h3>
            <div className="space-y-3">
              {getTasksByStatus('not-started').map(task => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task)}
                  onStatusChange={(newStatus) => handleStatusChange(task, newStatus)}
                  projectId={projectId}
                  currentUserId={currentUserId}
                />
              ))}
              {getTasksByStatus('not-started').length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Không có task nào
                </p>
              )}
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Đang thực hiện ({getTasksByStatus('in-progress').length})
            </h3>
            <div className="space-y-3">
              {getTasksByStatus('in-progress').map(task => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task)}
                  onStatusChange={(newStatus) => handleStatusChange(task, newStatus)}
                  projectId={projectId}
                  currentUserId={currentUserId}
                />
              ))}
              {getTasksByStatus('in-progress').length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Không có task nào
                </p>
              )}
            </div>
          </div>

          {/* Completed */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Hoàn thành ({getTasksByStatus('completed').length})
            </h3>
            <div className="space-y-3">
              {getTasksByStatus('completed').map(task => (
                <TaskCard
                  key={task.taskId}
                  task={task}
                  onEdit={() => handleEditTask(task)}
                  onDelete={() => handleDeleteTask(task)}
                  onStatusChange={(newStatus) => handleStatusChange(task, newStatus)}
                  projectId={projectId}
                  currentUserId={currentUserId}
                />
              ))}
              {getTasksByStatus('completed').length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">
                  Không có task nào
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSubmit={handleTaskSubmitted}
        task={editingTask}
        project={project || { projectId }}
      />
    </div>
  );
}