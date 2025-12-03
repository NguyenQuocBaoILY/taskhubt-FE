import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarDaysIcon,
  UserIcon,
  FlagIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { taskAPI, enrichTasksWithAssigneeNames, projectAPI } from '../services/api';
import TaskModal from '../components/TaskModal';
import TaskFiles from '../components/TaskFiles';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const statusConfig = {
  'not-started': { 
    label: 'Chưa bắt đầu', 
    icon: ClockIcon, 
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700'
  },
  'in-progress': { 
    label: 'Đang thực hiện', 
    icon: ChartBarIcon, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700'
  },
  'completed': { 
    label: 'Hoàn thành', 
    icon: CheckCircleIcon, 
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700'
  },
};

const priorityConfig = {
  low: { label: 'Thấp', color: 'text-green-600', bgColor: 'bg-green-100' },
  medium: { label: 'Trung bình', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  high: { label: 'Cao', color: 'text-red-600', bgColor: 'bg-red-100' },
  urgent: { label: 'Khẩn cấp', color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

export default function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  
  // User permission states
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [isProjectManager, setIsProjectManager] = useState(false);
  
  // Status update states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadTaskDetail();
    }
  }, [taskId]);

  const loadTaskDetail = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📋 TaskDetail loading for taskId:', taskId);

      // Get current user info
      const currentUserInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = currentUserInfo.userId || currentUserInfo.id;

      if (!userId) {
        setError('Không tìm thấy thông tin user. Vui lòng đăng nhập lại.');
        return;
      }

      setCurrentUserInfo(currentUserInfo);

      // Extract projectId from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const projectId = urlParams.get('projectId');

      console.log('📋 TaskDetail params:', { taskId, projectId, userId });

      if (!projectId) {
        setError('Thiếu projectId trong URL. Vui lòng truy cập từ trang project.');
        return;
      }

      console.log('📋 Loading task detail:', { taskId, projectId, userId });

      // Call API to get task details
      const response = await taskAPI.getTask(taskId, projectId, userId);
      const taskData = response.data;

      // Check if current user is project manager
      try {
        const membersResponse = await projectAPI.getProjectMembers(projectId);
        const projectMembers = membersResponse.data || [];
        const currentUserMembership = projectMembers.find(member => member.userId === userId);
        const isManager = currentUserMembership && currentUserMembership.role === 'manager';
        
        setIsProjectManager(isManager);
        console.log('👤 Current user manager status:', isManager, 'User role:', currentUserMembership?.role);
      } catch (error) {
        console.warn('⚠️ Could not check manager status:', error);
        setIsProjectManager(false);
      }

      // Enrich task with assignee name
      const enrichedTasks = await enrichTasksWithAssigneeNames([taskData]);
      const enrichedTask = enrichedTasks[0] || taskData;
      
      setTask(enrichedTask);
      
      // Set project info for modal
      setProject({ 
        projectId: taskData.projectId,
        id: taskData.projectId 
      });

      console.log('✅ Task detail loaded:', taskData);

    } catch (error) {
      console.error('❌ Error loading task detail:', error);
      setError(`Không thể tải chi tiết task: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = () => {
    setShowEditModal(true);
  };

  const handleDeleteTask = async () => {
    if (!confirm(`Bạn có chắc muốn xóa task "${task?.title}"?`)) {
      return;
    }

    try {
      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = currentUser.userId || currentUser.id;
      
      await taskAPI.deleteTask(task.taskId, task.projectId, userId);
      
      // Navigate back to project detail
      navigate(`/projects/${task.projectId}?tab=tasks`);
      
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Không thể xóa task. Vui lòng thử lại.');
    }
  };

  const handleTaskUpdated = () => {
    // Reload task detail after update
    loadTaskDetail();
    setShowEditModal(false);
  };

  // Handle status update
  const handleStatusUpdate = () => {
    setNewStatus(task.status);
    setShowStatusModal(true);
  };

  const handleStatusChange = async () => {
    if (!task || !newStatus || newStatus === task.status) {
      setShowStatusModal(false);
      return;
    }

    try {
      setUpdatingStatus(true);
      const projectId = new URLSearchParams(window.location.search).get('projectId');
      
      // Get current user info
      const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = currentUser.userId || currentUser.id;

      if (!userId) {
        alert('Không tìm thấy thông tin user. Vui lòng đăng nhập lại.');
        return;
      }

      console.log('📤 Updating task status:', { taskId: task.taskId, projectId, userId, status: newStatus });
      
      // Update task status using PATCH API with new format
      await taskAPI.updateTaskStatus(task.taskId, projectId, userId, newStatus);
      
      console.log('✅ Task status updated successfully');
      
      // Reload task data to reflect changes
      loadTaskDetail();
      
      setShowStatusModal(false);
      alert('Cập nhật trạng thái task thành công!');
    } catch (error) {
      console.error('❌ Failed to update task status:', error);
      alert(`Cập nhật trạng thái task thất bại: ${error.response?.data?.message || error.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa có';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return 'Ngày không hợp lệ';
    }
  };

  const formatDateOnly = (dateString) => {
    if (!dateString) return 'Chưa có';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi });
    } catch {
      return 'Ngày không hợp lệ';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600">Đang tải chi tiết task...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Quay lại
        </button>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8 text-gray-500">
          Task không tìm thấy
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Quay lại
        </button>
      </div>
    );
  }

  const statusInfo = statusConfig[task.status] || statusConfig['not-started'];
  const priorityInfo = priorityConfig[task.priority] || priorityConfig['medium'];
  const StatusIcon = statusInfo.icon;

  // Get current user for file access
  const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
  const currentUserId = currentUser.userId || currentUser.id;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Quay lại
          </button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chi tiết Task</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleStatusUpdate}
            className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Tiến độ task
          </button>
          
          {/* Only show edit/delete buttons for project managers */}
          {isProjectManager && (
            <>
              <button
                onClick={handleEditTask}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </button>
              
              <button
                onClick={handleDeleteTask}
                className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Xóa
              </button>
            </>
          )}
        </div>
      </div>

      {/* Task Info Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          {/* Task Title and Status */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {task.title}
              </h2>
              
              <div className="flex items-center space-x-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                  <StatusIcon className={`h-4 w-4 mr-2 ${statusInfo.color}`} />
                  {statusInfo.label}
                </div>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${priorityInfo.bgColor} ${priorityInfo.color}`}>
                  <FlagIcon className="h-4 w-4 mr-2" />
                  {priorityInfo.label}
                </div>
              </div>
            </div>
          </div>

          {/* Task Description */}
          {task.description && (
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">Mô tả</h3>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>
          )}

          {/* Task Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Assignee */}
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Người phụ trách</p>
                <p className="text-sm text-gray-600">
                  {task.assigneeName || task.assignee || 'Chưa phân công'}
                </p>
              </div>
            </div>

            {/* Due Date */}
            <div className="flex items-center">
              <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Ngày đến hạn</p>
                <p className="text-sm text-gray-600">
                  {formatDateOnly(task.dueDate)}
                </p>
              </div>
            </div>

            {/* Created At */}
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Ngày tạo</p>
                <p className="text-sm text-gray-600">
                  {formatDate(task.createdAt)}
                </p>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Cập nhật lần cuối</p>
                <p className="text-sm text-gray-600">
                  {formatDate(task.updatedAt)}
                </p>
              </div>
            </div>

            {/* Assigned At */}
            {task.assignedAt && (
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Ngày phân công</p>
                  <p className="text-sm text-gray-600">
                    {formatDate(task.assignedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Files */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <TaskFiles 
            taskId={task.taskId}
            projectId={task.projectId}
            userId={currentUserId}
          />
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Cập nhật tiến độ Task
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Tiến độ mới của task "{task?.title}"
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={updatingStatus}
              >
                {Object.entries(statusConfig).map(([status, config]) => (
                  <option key={status} value={status}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                disabled={updatingStatus}
              >
                Hủy
              </button>
              <button
                onClick={handleStatusChange}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                disabled={updatingStatus || newStatus === task?.status}
              >
                {updatingStatus ? 'Đang cập nhật...' : 'Cập nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <TaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleTaskUpdated}
        task={task}
        project={project}
      />
    </div>
  );
}