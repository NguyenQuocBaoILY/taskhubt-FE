import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { format, isBefore, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';

const priorityConfig = {
  high: { label: 'Cao', color: 'border-l-red-500 bg-red-50' },
  medium: { label: 'Trung bình', color: 'border-l-yellow-500 bg-yellow-50' },
  low: { label: 'Thấp', color: 'border-l-green-500 bg-green-50' },
};

const statusIcons = {
  pending: ClockIcon,
  'in-progress': ChartBarIcon,
  completed: CheckCircleIcon,
};

export default function TaskCard({ task, isOverlay = false }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = () => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return isBefore(dueDate, today) && !isToday(dueDate) && task.status !== 'completed';
  };

  const getDueDateColor = () => {
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
    const dueDate = new Date(date);
    if (isToday(dueDate)) return 'Hôm nay';
    return format(dueDate, 'dd MMM', { locale: vi });
  };

  const StatusIcon = statusIcons[task.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-lg border border-gray-200 p-4 shadow-sm 
        hover:shadow-md transition-all duration-200 cursor-grab
        ${isOverlay ? 'rotate-3 shadow-xl' : ''}
        ${isDragging ? 'shadow-2xl' : ''}
        ${priorityConfig[task.priority].color}
        border-l-4
      `}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <StatusIcon className="h-4 w-4 text-gray-500" />
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            task.priority === 'high' 
              ? 'bg-red-100 text-red-700'
              : task.priority === 'medium'
              ? 'bg-yellow-100 text-yellow-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {priorityConfig[task.priority].label}
          </span>
        </div>
        
        {isOverdue() && (
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
        )}
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
        {task.title}
      </h4>

      {/* Task Description */}
      <p className="text-xs text-gray-600 mb-3 line-clamp-3">
        {task.description}
      </p>

      {/* Labels */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map((label, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between">
        {/* Assignee */}
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">
              {task.assignee.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-xs text-gray-600 truncate max-w-20">
            {task.assignee.name.split(' ')[0]}
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

      {/* Progress Indicator for In-Progress Tasks */}
      {task.status === 'in-progress' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Tiến độ</span>
            <span>65%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-blue-500 h-1 rounded-full" style={{ width: '65%' }}></div>
          </div>
        </div>
      )}

      {/* Task ID/Key */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400 font-mono">
          TASK-{task.id}
        </span>
      </div>
    </div>
  );
}