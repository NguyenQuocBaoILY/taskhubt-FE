import {
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { format, isBefore, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const priorityConfig = {
  high: { label: 'Cao', color: 'border-l-red-500 bg-red-50' },
  medium: { label: 'Trung bình', color: 'border-l-yellow-500 bg-yellow-50' },
  low: { label: 'Thấp', color: 'border-l-green-500 bg-green-50' },
};

const statusConfig = {
  'not-started': { label: 'Chưa bắt đầu', icon: ClockIcon, color: 'text-gray-500' },
  'in-progress': { label: 'Đang thực hiện', icon: ChartBarIcon, color: 'text-blue-500' },
  'completed': { label: 'Hoàn thành', icon: CheckCircleIcon, color: 'text-green-500' },
};

export default function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onStatusChange,
  projectId,
  currentUserId,
  isOverlay = false 
}) {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const isOverdue = () => {
    if (!task.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return isBefore(dueDate, today) && !isToday(dueDate) && task.status !== 'completed';
  };

  const getDueDateColor = () => {
    if (!task.dueDate) return 'text-gray-400';
    
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (task.status === 'completed') return 'text-gray-500';
    if (isOverdue()) return 'text-red-600';
    if (isToday(dueDate)) return 'text-orange-600';
    if (isBefore(dueDate, new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000))) {
      return 'text-yellow-600';
    }
    return 'text-gray-600';
  };

  const formatDueDate = (date) => {
    if (!date) return 'Chưa có hạn';
    const dueDate = new Date(date);
    if (isToday(dueDate)) return 'Hôm nay';
    return format(dueDate, 'dd MMM', { locale: vi });
  };

  const StatusIcon = statusConfig[task.status]?.icon || ClockIcon;
  const statusInfo = statusConfig[task.status] || statusConfig['not-started'];

  const handleStatusChange = (newStatus) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setShowMenu(false);
  };

  const handleViewDetail = () => {
    const taskId = task.taskId || task.id;
    console.log('🎯 Navigating to task detail:', { 
      taskId, 
      projectId, 
      task 
    });
    
    if (!taskId) {
      console.error('❌ Task ID is missing');
      alert('Không thể xem chi tiết task: thiếu task ID');
      return;
    }
    
    if (!projectId) {
      console.error('❌ Project ID is missing');
      alert('Không thể xem chi tiết task: thiếu project ID');
      return;
    }
    
    navigate(`/tasks/${taskId}?projectId=${projectId}`);
    setShowMenu(false);
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking on menu or action buttons
    if (e.target.closest('button')) {
      return;
    }
    handleViewDetail();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        bg-white rounded-lg border border-gray-200 p-4 shadow-sm 
        hover:shadow-md transition-all duration-200 cursor-pointer
        ${isOverlay ? 'rotate-3 shadow-xl' : ''}
        ${priorityConfig[task.priority]?.color || 'border-l-gray-500 bg-gray-50'}
        border-l-4 relative
      `}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            task.priority === 'high' 
              ? 'bg-red-100 text-red-700'
              : task.priority === 'medium'
              ? 'bg-yellow-100 text-yellow-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {priorityConfig[task.priority]?.label || 'Trung bình'}
          </span>
        </div>
        
        <div className="flex items-center space-x-1">
          {isOverdue() && (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          )}
          
          {/* Menu button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <EllipsisVerticalIcon className="h-4 w-4 text-gray-400" />
            </button>
            
            {/* Dropdown menu */}
            {showMenu && (
              <div className="absolute right-0 top-6 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  {/* Status options */}
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                    Thay đổi trạng thái
                  </div>
                  {Object.entries(statusConfig).map(([status, config]) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                        task.status === status ? 'bg-gray-50 font-medium' : ''
                      }`}
                    >
                      <config.icon className={`h-4 w-4 ${config.color}`} />
                      <span>{config.label}</span>
                    </button>
                  ))}
                  
                  <div className="border-t my-1"></div>
                  
                  {/* Action buttons */}
                  <button
                    onClick={handleViewDetail}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <EyeIcon className="h-4 w-4 text-gray-400" />
                    <span>Xem chi tiết</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onEdit?.();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <PencilIcon className="h-4 w-4 text-gray-400" />
                    <span>Chỉnh sửa</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onDelete?.();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">
              {task.assigneeName ? 
                task.assigneeName.charAt(0).toUpperCase() : 
                (task.assignee ? 
                  (typeof task.assignee === 'string' ? 
                    task.assignee.charAt(0).toUpperCase() : 
                    (task.assignee.name || task.assignee.username || '?').charAt(0).toUpperCase()
                  ) : '?'
                )
              }
            </span>
          </div>
          <span className="text-xs text-gray-600 truncate max-w-20">
            {task.assigneeName || 
              (task.assignee ? 
                (typeof task.assignee === 'string' ? 
                  task.assignee.split('-')[0] : 
                  (task.assignee.name || task.assignee.username || 'Chưa phân công')
                ) : 'Chưa phân công'
              )
            }
          </span>
        </div>

        {/* Due Date */}
        <div className="flex items-center space-x-1">
          <CalendarDaysIcon className={`h-4 w-4 ${getDueDateColor()}`} />
          <span className={`text-xs font-medium ${getDueDateColor()}`}>
            {formatDueDate(task.dueDate)}
          </span>
        </div>
      </div>

      {/* Task ID */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400 font-mono">
          {task.taskId || task.id}
        </span>
      </div>
    </div>
  );
}