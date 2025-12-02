import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { taskAPI, userAPI } from '../services/api';

// Status = mức độ hoàn thành công việc
const statuses = [
  { value: 'not-started', label: 'Chưa bắt đầu' },
  { value: 'in-progress', label: 'Đang thực hiện' },
  { value: 'completed', label: 'Hoàn thành' },
];

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,        // callback cho parent (ví dụ reload list)
  task = null,     // task để edit, nếu null là create
  project = null,  // project hiện tại, dùng lấy projectId + members
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'not-started',
    assignee: '',
    startDate: '',
    endDate: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Load users when modal opens
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await userAPI.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Khi mở modal hoặc đổi task → fill lại form
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'not-started',
        assignee: task.assignee || '',
        startDate: task.startDate ? task.startDate.split('T')[0] : '',
        endDate: task.endDate ? task.endDate.split('T')[0] : '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'not-started',
        assignee: '',
        startDate: '',
        endDate: '',
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Tiêu đề task là bắt buộc';
    if (!formData.description.trim()) newErrors.description = 'Mô tả task là bắt buộc';
    if (!formData.assignee) newErrors.assignee = 'Vui lòng chọn người phụ trách';
    if (!formData.startDate) newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    if (!formData.endDate) newErrors.endDate = 'Ngày kết thúc là bắt buộc';

    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!project?.id && !project?.projectId) {
      alert('Thiếu projectId – cần truyền project hiện tại vào TaskModal');
      return;
    }

    try {
      setIsSubmitting(true);

      const projectId = project.projectId || project.id;
      
      // Lấy thông tin user hiện tại từ localStorage hoặc context
      const currentUser = JSON.parse(localStorage.getItem('user_info') || '{}');
      const userId = currentUser.userId || currentUser.id;

      if (!userId) {
        alert('Không tìm thấy thông tin user. Vui lòng đăng nhập lại.');
        return;
      }

      console.log('🔍 Task creation info:', { projectId, userId, currentUser });

      // Map đúng model backend theo API schema
      const selectedUser = users.find(user => user.userId === formData.assignee);
      
      const payload = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        status: formData.status,
        priority: 'medium', // Default priority
        assignee: formData.assignee,
        assigneeName: selectedUser ? (selectedUser.name || selectedUser.username) : null,
        dueDate: formData.endDate, // Map endDate to dueDate
      };

      console.log('🎯 TaskModal submitting payload:', payload);

      if (task?.taskId) {
        // Update existing task - include existing metadata
        const updatePayload = {
          ...payload,
          taskId: task.taskId,
          createdAt: task.createdAt, // Preserve existing createdAt
          assignedAt: task.assignedAt || new Date().toISOString(), // Preserve or set assignedAt
        };
        await taskAPI.updateTask(task.taskId, updatePayload, projectId);
      } else {
        // Create new task using POST /api/task endpoint
        await taskAPI.createTask(payload, projectId, userId);
      }

      if (onSubmit) onSubmit(payload);
      onClose();
      
      // Show success message
      alert(task ? 'Cập nhật task thành công!' : 'Tạo task mới thành công!');
      
    } catch (error) {
      console.error('Error submitting task:', error);
      
      // Log detailed error information for debugging
      console.error('Detailed error info:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          params: error.config?.params,
          data: error.config?.data
        }
      });
      
      // Show user-friendly error message
      let errorMessage = 'Lỗi không xác định';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.title) {
        errorMessage = error.response.data.title;
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Gửi task lên server thất bại: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {task ? 'Chỉnh sửa task' : 'Tạo task mới'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-4 pb-4 sm:px-6 sm:pb-6">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Tiêu đề task <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="Nhập tiêu đề task"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Mô tả task <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="Mô tả chi tiết về task"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Assignee */}
              <div>
                <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700">
                  Người phụ trách <span className="text-red-500">*</span>
                </label>
                <select
                  id="assignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  disabled={loadingUsers}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.assignee ? 'border-red-300' : 'border-gray-300'
                  } bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                >
                  <option value="">
                    {loadingUsers ? 'Đang tải danh sách người dùng...' : 'Chọn người phụ trách'}
                  </option>
                  {users.map((user) => (
                    <option key={user.userId || user.id} value={user.userId || user.id}>
                      {user.name || user.username} {user.email ? `(${user.email})` : ''}
                    </option>
                  ))}
                </select>
                {errors.assignee && (
                  <p className="mt-1 text-sm text-red-600">{errors.assignee}</p>
                )}
              </div>

              {/* Status + Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Mức độ hoàn thành
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  >
                    {statuses.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border ${
                      errors.startDate ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                  )}
                </div>
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border ${
                    errors.endDate ? 'border-red-300' : 'border-gray-300'
                  } rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang xử lý...' : task ? 'Cập nhật' : 'Tạo task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}